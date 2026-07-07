// Auth layer - uses Supabase in production
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase";

interface User {
  id: string | number;
  email: string;
  name: string;
  role: "admin" | "wholesale" | "retail";
  phone: string;
  address: string;
}

export function initAuth(): void {
  // Supabase: Auth managed by Supabase
  console.log("Using Supabase Auth");
}

export async function createSession(userId: number): Promise<string> {
  // Supabase manages sessions automatically via cookies
  return "";
}

export async function getSession(): Promise<{ user: User } | null> {
  // Check if Supabase env vars are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Use service client to bypass RLS when querying users table
  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) return null;

  // Get user profile from our users table
  const { data: userData } = await serviceClient
    .from("users")
    .select("id, email, name, role, phone, address")
    .eq("email", user.email)
    .single();

  if (!userData) {
    return null;
  }

  return { user: userData as User };
}

export async function loginUser(email: string, password: string): Promise<{
  success: boolean;
  error?: string;
  user?: User;
  sessionId?: string;
}> {
  // Supabase auth - handled in API route
  return { success: false, error: "Use Supabase client for login" };
}

export async function logoutUser(): Promise<void> {
  // Supabase handles logout in API route
}

export function getDashboardUrl(role: string): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "wholesale":
      return "/shop?role=wholesale";
    case "retail":
      return "/shop?role=retail";
    default:
      return "/login";
  }
}