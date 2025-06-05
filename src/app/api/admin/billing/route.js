import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET billing information
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch billing information
    const [subscriptionData, paymentMethodData, paymentHistoryData] = await Promise.all([
      // Get current subscription
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      
      // Get saved payment methods
      supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id),
      
      // Get payment history
      supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ]);

    return NextResponse.json({
      subscription: subscriptionData.data,
      paymentMethods: paymentMethodData.data,
      paymentHistory: paymentHistoryData.data
    });
  } catch (error) {
    console.error('Admin billing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update subscription
export async function PUT(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // Create or update Stripe subscription
    let stripeSubscription;
    if (updates.paymentMethodId) {
      const customer = await stripe.customers.create({
        payment_method: updates.paymentMethodId,
        email: user.email,
        invoice_settings: {
          default_payment_method: updates.paymentMethodId,
        },
      });

      stripeSubscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: updates.priceId }],
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });
    }

    // Update subscription in database
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_subscription_id: stripeSubscription?.id,
        plan: updates.plan,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (subscriptionError) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Admin billing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Add payment method
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();

    // Add payment method to database
    const { data: paymentMethod, error: paymentMethodError } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user.id,
        stripe_payment_method_id: paymentMethodId,
        is_default: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentMethodError) {
      return NextResponse.json({ error: 'Failed to add payment method' }, { status: 500 });
    }

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error('Admin billing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 