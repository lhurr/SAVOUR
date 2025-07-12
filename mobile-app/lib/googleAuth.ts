import { supabase } from './supabase';

export async function signInWithGoogle() {
  try {
    // For web, we use Supabase's built-in OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
}

// Helper function to get redirect URIs for Google Cloud Console setup
export function getRedirectUris() {
  return {
    supabaseCallbackUri: 'https://inywlsnrkrkoyhhtmbgq.supabase.co/auth/v1/callback',
    webRedirectUri: 'http://savour-ai.expo.app/auth/callback',
    localRedirectUri: 'http://localhost:8081/auth/callback',
  };
} 