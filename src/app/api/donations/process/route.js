import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    const { 
      amount, 
      recipient_id, 
      tier_id, 
      message, 
      donor_name, 
      donor_email 
    } = body;

    if (!amount || !recipient_id || !donor_name || !donor_email) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid donation amount' 
      }, { status: 400 });
    }

    // Verify recipient exists
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', recipient_id)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json({ 
        error: 'Recipient not found' 
      }, { status: 404 });
    }

    // Verify tier if provided
    let donationTier = null;
    if (tier_id) {
      const { data: tier, error: tierError } = await supabase
        .from('donation_tiers')
        .select('*')
        .eq('id', tier_id)
        .eq('user_id', recipient_id)
        .single();

      if (tierError || !tier) {
        return NextResponse.json({ 
          error: 'Invalid donation tier' 
        }, { status: 400 });
      }
      
      donationTier = tier;
    }

    // Calculate shares
    const userShare = amount * 0.8; // 80% to creator
    const platformFee = amount * 0.2; // 20% platform fee

    // Create donation record (simulating successful payment for now)
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert([{
        donor_id: null, // Anonymous donation
        recipient_id,
        donation_tier_id: tier_id,
        amount,
        user_share: userShare,
        platform_fee: platformFee,
        message,
        status: 'completed'
      }])
      .select('*')
      .single();

    if (donationError) {
      console.error('Error creating donation record:', donationError);
      return NextResponse.json({ 
        error: 'Failed to process donation' 
      }, { status: 500 });
    }

    // Update recipient's donation stats
    try {
      await supabase.rpc('update_user_donation_stats', {
        user_id: recipient_id,
        donation_amount: amount
      });
    } catch (statsError) {
      console.error('Error updating donation stats:', statsError);
      // Don't fail the whole transaction for stats update
    }

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        amount: donation.amount,
        user_share: donation.user_share,
        message: donation.message,
        created_at: donation.created_at
      }
    });

  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
} 