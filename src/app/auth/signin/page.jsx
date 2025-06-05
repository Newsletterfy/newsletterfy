'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignIn() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // If auth is disabled, redirect to dashboard
    if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
      router.push('/user-dashboard');
      return;
    }

    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/user-dashboard');
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  // If auth is disabled, show loading message
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Development Mode</h2>
            <p className="mt-2 text-sm text-gray-600">
              Authentication is disabled. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={() => supabase.auth.signInWithOAuth({
              provider: 'github',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`
              }
            })}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
} 