// Supabase client configuration
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
    supabaseUrl,
    supabaseAnonKey
  );
}

// Client-side Supabase client (for use in client components)
export const supabase = supabaseClient;

// Server-side Supabase client for API routes (uses SSR for proper cookie handling)
export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig) {
    return null;
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  return supabase;
}

// Server-side Supabase client with service role key (bypasses RLS)
// Use ONLY for database operations that need to bypass RLS (e.g., creating user profiles)
export function createSupabaseServiceClient() {
  if (!hasSupabaseConfig || !supabaseServiceKey) {
    return null;
  }

  return createClient(
    supabaseUrl!,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}