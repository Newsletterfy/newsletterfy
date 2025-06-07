import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/monetization/digital-products/[id]/purchase
export async function POST(req, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the product details
    const { data: product, error: productError } = await supabase
      .from('digital_products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status !== 'published') {
      return NextResponse.json({ error: 'Product is not available for purchase' }, { status: 400 });
    }

    // Calculate commission (80% to creator, 20% to platform)
    const commission = product.price * 0.8;
    const platformFee = product.price * 0.2;

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('digital_product_purchases')
      .insert([{
        product_id: id,
        user_id: session.user.id,
        amount: product.price,
        commission: commission,
        status: 'completed'
      }])
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Update product sales and revenue
    const { error: updateError } = await supabase
      .from('digital_products')
      .update({
        sales: product.sales + 1,
        revenue: product.revenue + product.price
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Get download URL
    const { data: { signedUrl }, error: urlError } = await supabase
      .storage
      .from('digital-products')
      .createSignedUrl(product.file_url, 3600); // 1 hour expiry

    if (urlError) throw urlError;

    return NextResponse.json({
      success: true,
      purchase: {
        ...purchase,
        download_url: signedUrl
      }
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 