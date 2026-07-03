// Hybrid Supabase client - uses SQLite in development, Supabase in production
import { createClient } from "@supabase/supabase-js";
import type { SupabaseDatabase } from "./types";

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (for use in client components)
export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side Supabase client for API routes
export function createSupabaseServerClient() {
  if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
    const apiKey = (supabaseServiceKey || supabaseAnonKey)!;
    return createClient<SupabaseDatabase>(supabaseUrl, apiKey, {
      db: {
        schema: "public",
      },
    });
  }

  // Return null for development without Supabase
  return null;
}