import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { methodNotAllowed } from "@/lib/api-helpers";

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "wholesale" | "retail";
  phone: string;
  address: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase belum dikonfigurasi" },
        { status: 500 }
      );
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || "Email atau password salah" },
        { status: 401 }
      );
    }

    // Get user profile from our users table
    const { data: userData } = await supabase
      .from("users")
      .select("id, email, name, role, phone, address")
      .eq("email", email)
      .single();

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan di database" },
        { status: 404 }
      );
    }

    // Set session cookie from Supabase
    const response = NextResponse.json({
      success: true,
      user: userData as User,
      redirectUrl: (userData as User).role === "admin"
        ? "/admin/dashboard"
        : (userData as User).role === "wholesale"
        ? "/shop?role=wholesale"
        : "/shop?role=retail",
    });

    // Supabase sets its own cookies automatically via @supabase/ssr
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const GET = () => methodNotAllowed(["POST"]);
export const PUT = () => methodNotAllowed(["POST"]);
export const PATCH = () => methodNotAllowed(["POST"]);
export const DELETE = () => methodNotAllowed(["POST"]);