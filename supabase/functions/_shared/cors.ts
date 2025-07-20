// Shared CORS configuration for Supabase Edge Functions
// This is required because Supabase Edge Functions don't have automatic CORS like the REST API

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  }