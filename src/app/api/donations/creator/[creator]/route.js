import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { creator } = params;

    // Find creator by username or ID
    let creatorQuery = supabase
      .from('users')
      .select('id, name, email, username, avatar_url');

    // Check if it's a UUID (ID) or username
    if (creator.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      creatorQuery = creatorQuery.eq('id', creator);
    } else {
      creatorQuery = creatorQuery.eq('username', creator);
    }

    const { data: creatorData, error: creatorError } = await creatorQuery.single();

    if (creatorError || !creatorData) {
      // For demo purposes, if we don't find the creator, create a mock user
      if (creator === "550e8400-e29b-41d4-a716-446655440000") {
        const mockCreator = {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "John Doe",
          email: "user@example.com",
          username: "johndoe"
        };
        
        // Return mock data with empty tiers for demo
        return NextResponse.json({
          creator: mockCreator,
          tiers: []
        });
      }
      
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Fetch active donation tiers for this creator
    const { data: tiers, error: tiersError } = await supabase
      .from('donation_tiers')
      .select('*')
      .eq('user_id', creatorData.id)
      .eq('status', 'active')
      .order('amount', { ascending: true });

    if (tiersError) {
      console.error('Error fetching donation tiers:', tiersError);
      return NextResponse.json({ error: 'Failed to fetch donation tiers' }, { status: 500 });
    }

    return NextResponse.json({
      creator: creatorData,
      tiers: tiers || []
    });
  } catch (error) {
    console.error('Error in creator donation API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 