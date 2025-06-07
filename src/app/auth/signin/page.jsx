'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignIn() {
  const router = useRouter();
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey && 
        !supabaseUrl.includes('your_supabase_project_url') && 
        !supabaseAnonKey.includes('your_supabase_anon_key')) {
      setSupabaseConfigured(true);
      
      // Only create Supabase client if properly configured
      const supabase = createClientComponentClient();
      
      // Check for existing session
      const checkSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            router.push('/user-dashboard');
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
        setLoading(false);
      };

      checkSession();
    } else {
      setSupabaseConfigured(false);
      setLoading(false);
    }
  }, [router]);

  const handleGitHubSignIn = async () => {
    if (!supabaseConfigured) {
      alert('Supabase is not configured. Please set up your environment variables.');
      return;
    }

    try {
      const supabase = createClientComponentClient();
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Error signing in. Please check your Supabase configuration.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back to Newsletterfy
          </p>
        </div>
        
        {!supabaseConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Supabase Not Configured
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please set up your Supabase environment variables to enable authentication.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGitHubSignIn}
            disabled={!supabaseConfigured}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              supabaseConfigured 
                ? 'bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Sign in with GitHub
          </button>
          
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/auth/signup')}
                className="font-medium text-cyan-600 hover:text-cyan-500"
              >
                Sign up
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 