// Auth layer - uses Supabase in production, SQLite in development
import { cookies } from "next/headers";
import type { SupabaseDatabase } from "./types";

// Check if Supabase is configured
const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "wholesale" | "retail";
  phone: string;
  address: string;
}

export function initAuth(): void {
  // Supabase: Auth managed by Supabase
  // SQLite: Sessions handled in database.ts
  console.log(hasSupabaseConfig ? "Using Supabase Auth" : "Using SQLite Auth");
}

export async function createSession(userId: number): Promise<string> {
  if (hasSupabaseConfig) {
    // Supabase manages sessions automatically via cookies
    return "";
  }

  // SQLite mode - use dynamic import
  const dbModule = await import("./database");
  const crypto = await import("crypto");
  
  const db = dbModule.getDb();
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  
  // Admin: 2 hours, others: 7 days
  const user = db.prepare("SELECT role FROM users WHERE id = ?").get(userId) as { role: string } | undefined;
  const isAdmin = user?.role === "admin";
  expiresAt.setHours(expiresAt.getHours() + (isAdmin ? 2 : 168));

  db.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(sessionId, userId, expiresAt.toISOString());

  return sessionId;
}

export async function getSession(): Promise<{ user: User } | null> {
  if (hasSupabaseConfig) {
    // Supabase session check
    const { createServerClient } = await import("@supabase/ssr");
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Get user metadata from database using Supabase
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, name, role, phone, address")
      .eq("email", user.email)
      .single();

    if (userError || !userData) return null;

    return { user: userData as User };
  }

  // SQLite session check
  const dbModule = await import("./database");
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) return null;
  const db = dbModule.getDb();

  const session = db
    .prepare(
      "SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')"
    )
    .get(sessionId);

  if (!session) return null;

  const user = db
    .prepare(
      "SELECT id, email, name, role, phone, address FROM users WHERE id = ?"
    )
    .get((session as { user_id: number }).user_id) as User | undefined;

  if (!user) return null;

  return { user };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User; sessionId?: string }> {
  if (hasSupabaseConfig) {
    // Supabase auth - redirect to client-side login
    return { success: false, error: "Use Supabase client auth for login" };
  }

  // SQLite mode
  const dbModule = await import("./database");
  const bcryptModule = await import("bcryptjs");
  
  const db = dbModule.getDb();
  const bcrypt = bcryptModule;
  
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as (User & { password: string }) | undefined;

  if (!user) {
    return { success: false, error: "Email tidak ditemukan" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { success: false, error: "Password salah" };
  }

  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);

  const sessionId = await createSession(user.id);

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
    },
    sessionId,
  };
}

export async function logoutUser(): Promise<void> {
  if (hasSupabaseConfig) {
    // Supabase handles logout via its own endpoint
    return;
  }

  const dbModule = await import("./database");
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId) {
    const db = dbModule.getDb();
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  }
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