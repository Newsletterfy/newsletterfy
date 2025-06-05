import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Skip auth check if explicitly disabled
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session and trying to access protected route, redirect to sign in
  if (!session && (
    req.nextUrl.pathname.startsWith('/user-dashboard') ||
    req.nextUrl.pathname.startsWith('/api/monetization')
  )) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Check if this is a signup page visit with a referral code
  if (req.nextUrl.pathname === '/signup' && req.nextUrl.searchParams.has('ref')) {
    const refCode = req.nextUrl.searchParams.get('ref');

    try {
      // Track the click
      await fetch(`${req.nextUrl.origin}/api/monetization/affiliate-links/${refCode}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click' })
      });

      // Store the referral code in a cookie for later use during signup
      res.cookies.set('referral_code', refCode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      });
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
  }

  return res;
}

export const config = {
  matcher: ['/user-dashboard/:path*', '/api/monetization/:path*', '/signup']
};