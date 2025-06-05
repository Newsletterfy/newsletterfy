import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch subscriptions with tier information
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_tiers (
          name,
          billing_period
        )
      `)
      .eq('creator_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (subscriptionsError) throw subscriptionsError;

    // Calculate analytics
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('subscriptions')
      .select(`
        amount,
        subscription_tiers!inner (
          id,
          status
        )
      `)
      .eq('creator_id', session.user.id)
      .eq('subscription_tiers.status', 'active');

    if (analyticsError) throw analyticsError;

    const analytics = {
      totalSubscribers: analyticsData.length,
      monthlyRevenue: analyticsData.reduce((sum, sub) => sum + parseFloat(sub.amount), 0),
      userShare: analyticsData.reduce((sum, sub) => sum + parseFloat(sub.amount) * 0.9, 0),
      platformFee: analyticsData.reduce((sum, sub) => sum + parseFloat(sub.amount) * 0.1, 0),
      activeTiers: new Set(analyticsData.map(sub => sub.subscription_tiers.id)).size
    };

    // Format subscriptions for frontend
    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      subscriber_id: sub.subscriber_id,
      tier_name: sub.subscription_tiers.name,
      amount: sub.amount,
      billing_period: sub.subscription_tiers.billing_period,
      created_at: sub.created_at
    }));

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      analytics
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tierId } = await request.json();

    // Verify the subscription tier exists and belongs to the creator
    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('id', tierId)
      .eq('user_id', session.user.id)
      .single();

    if (tierError || !tier) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    // Create the subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([{
        subscriber_id: session.user.id,
        creator_id: tier.user_id,
        tier_id: tier.id,
        amount: tier.price,
        status: 'active'
      }])
      .select()
      .single();

    if (subscriptionError) throw subscriptionError;

    // Update tier statistics
    const { error: updateError } = await supabase
      .from('subscription_tiers')
      .update({
        subscribers: tier.subscribers + 1,
        revenue: tier.revenue + parseFloat(tier.price)
      })
      .eq('id', tier.id);

    if (updateError) throw updateError;

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, status } = await request.json();

    // Update subscription status
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', subscriptionId)
      .eq('subscriber_id', session.user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 