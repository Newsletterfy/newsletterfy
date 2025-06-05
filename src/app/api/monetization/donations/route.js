import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/monetization/donations
export async function GET(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: donations, error } = await supabase
      .from('donations')
      .select('*, donation_tier(*)')
      .eq('recipient_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate analytics
    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const userShare = totalAmount * 0.9; // 90% to creator
    const platformFee = totalAmount * 0.1; // 10% platform fee
    const uniqueDonors = new Set(donations.map(d => d.donor_id)).size;

    return NextResponse.json({
      donations,
      analytics: {
        totalDonations,
        totalAmount,
        userShare,
        platformFee,
        uniqueDonors
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/monetization/donations
export async function POST(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, message, tier_id, recipient_id } = body;

    if (!amount || !recipient_id) {
      return NextResponse.json({ error: 'Amount and recipient are required' }, { status: 400 });
    }

    // Calculate shares
    const userShare = amount * 0.9; // 90% to creator
    const platformFee = amount * 0.1; // 10% platform fee

    const { data: donation, error } = await supabase
      .from('donations')
      .insert([{
        donor_id: session.user.id,
        recipient_id,
        amount,
        user_share: userShare,
        platform_fee: platformFee,
        message,
        donation_tier_id: tier_id,
        status: 'completed'
      }])
      .select('*, donation_tier(*)')
      .single();

    if (error) throw error;

    // Update recipient's total donations
    await supabase.rpc('update_user_donation_stats', {
      user_id: recipient_id,
      donation_amount: amount
    });

    return NextResponse.json({ donation });
  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update a donation
export async function PATCH(req) {
  try {
    const { session, error: authError } = await checkAuth();
    const supabase = getSupabaseClient();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('donations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    );
  }
}

// Delete a donation
export async function DELETE(req) {
  try {
    const { session, error: authError } = await checkAuth();
    const supabase = getSupabaseClient();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Error deleting donation:', error);
    return NextResponse.json(
      { error: 'Failed to delete donation' },
      { status: 500 }
    );
  }
} 