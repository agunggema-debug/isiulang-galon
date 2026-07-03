// Supabase client configuration
import { createClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured
const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);

// Create client with proper error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseClient: any = null;

if (hasSupabaseConfig) {
  supabaseClient = createClient(
    supabaseUrl!,
    supabaseAnonKey!
  );
}

// Client-side Supabase client (for use in client components)
export const supabase = supabaseClient;

// Server-side Supabase client for API routes
export function createSupabaseServerClient() {
  if (!hasSupabaseConfig) {
    return null;
  }

  const apiKey = supabaseServiceKey || supabaseAnonKey;
  
  return createClient(
    supabaseUrl!,
    apiKey!
  );
}