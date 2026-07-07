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

function getRedirectUrl(role: User["role"]): string {
  if (role === "admin") {
    return "/admin/dashboard";
  }
  if (role === "wholesale") {
    return "/shop?role=wholesale";
  }
  return "/shop?role=retail";
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email dan password harus diisi" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message || "Email atau password salah" }, { status: 401 });
    }

    // Get user profile from our users table (using service role to bypass RLS)
    const { data: userData } = await supabase.from("users").select("id, email, name, role, phone, address").eq("email", email).single();

    let finalUserData = userData;

    // If user doesn't exist in our users table, create it automatically
    if (!userData) {
      const userMetadata = data.user?.user_metadata || {};

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          email: email,
          name: userMetadata.name || email.split("@")[0],
          role: userMetadata.role || "retail",
          phone: userMetadata.phone || "",
          address: userMetadata.address || "",
        })
        .select("id, email, name, role, phone, address")
        .single();

      if (createError) {
        console.error("Create user error:", createError);
        return NextResponse.json({ success: false, error: "Gagal membuat profil user" }, { status: 500 });
      }

      finalUserData = newUser;
    }

    if (!finalUserData) {
      return NextResponse.json({ success: false, error: "User tidak ditemukan di database" }, { status: 404 });
    }

    // Return success - Supabase SSR client automatically handles session cookies
    return NextResponse.json({
      success: true,
      user: finalUserData,
      redirectUrl: getRedirectUrl(finalUserData.role),
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export const GET = () => methodNotAllowed(["POST"]);
export const PUT = () => methodNotAllowed(["POST"]);
export const PATCH = () => methodNotAllowed(["POST"]);
export const DELETE = () => methodNotAllowed(["POST"]);