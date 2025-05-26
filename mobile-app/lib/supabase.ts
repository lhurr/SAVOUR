import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
// import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Please check your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);