import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET funds data
export async function GET(request) {
  try {
    // Get brand ID from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error('Authentication required');

    const brandId = session?.user?.id;
    if (!brandId) throw new Error('Brand ID not found');

    // Fetch funds data from database
    const { data: fundsData, error: fundsError } = await supabase
      .from('brand_funds')
      .select('*')
      .eq('brand_id', brandId)
      .single();

    if (fundsError) throw fundsError;

    // Fetch transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('brand_transactions')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (transactionsError) throw transactionsError;

    // Fetch saved cards from Stripe
    const customer = await stripe.customers.retrieve(fundsData.stripe_customer_id);
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });

    // Format the response
    const response = {
      balanceStats: {
        availableBalance: fundsData.available_balance || 0,
        pendingBalance: fundsData.pending_balance || 0,
        totalSpent: fundsData.total_spent || 0,
        totalBudget: fundsData.total_budget || 0,
      },
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        date: tx.created_at.split('T')[0],
        method: tx.payment_method,
        description: tx.description,
      })),
      savedCards: paymentMethods.data.map(pm => ({
        id: pm.id,
        cardNumber: `**** **** **** ${pm.card.last4}`,
        cardholderName: pm.billing_details.name,
        expiryDate: `${pm.card.exp_month}/${pm.card.exp_year}`,
        brand: pm.card.brand,
        isDefault: pm.id === customer.invoice_settings.default_payment_method,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Funds API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch funds data' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

// POST add funds
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, paymentMethod, cardId, newCard } = body;

    // Get brand ID from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error('Authentication required');

    const brandId = session?.user?.id;
    if (!brandId) throw new Error('Brand ID not found');

    // Get brand's Stripe customer ID
    const { data: fundsData, error: fundsError } = await supabase
      .from('brand_funds')
      .select('stripe_customer_id')
      .eq('brand_id', brandId)
      .single();

    if (fundsError) throw fundsError;

    let paymentMethodId = cardId;

    // If using a new card, create a payment method in Stripe
    if (newCard) {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: newCard.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(newCard.expiryDate.split('/')[0]),
          exp_year: parseInt('20' + newCard.expiryDate.split('/')[1]),
          cvc: newCard.cvv,
        },
        billing_details: {
          name: newCard.cardholderName,
        },
      });

      paymentMethodId = paymentMethod.id;

      // If save card is true, attach it to the customer
      if (newCard.saveCard) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: fundsData.stripe_customer_id,
        });
      }
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: fundsData.stripe_customer_id,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
    });

    if (paymentIntent.status === 'succeeded') {
      // Update brand's balance
      const { error: updateError } = await supabase.rpc('add_brand_funds', {
        p_brand_id: brandId,
        p_amount: amount,
      });

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('brand_transactions')
        .insert({
          brand_id: brandId,
          type: 'deposit',
          amount: amount,
          status: 'completed',
          payment_method: cardId 
            ? `Credit Card (**** ${paymentMethodId.slice(-4)})`
            : 'Credit Card (New)',
          description: 'Funds added',
          stripe_payment_intent_id: paymentIntent.id,
        });

      if (transactionError) throw transactionError;

      return NextResponse.json({ message: 'Funds added successfully' });
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    console.error('Add Funds API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add funds' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
} 