import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, address } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Nama, email, dan password harus diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase belum dikonfigurasi" },
        { status: 500 }
      );
    }

    // Check if email already exists in our users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "retail", // Default role
          phone: phone || "",
          address: address || "",
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || "Gagal mendaftar" },
        { status: 400 }
      );
    }

    // Create user profile in our users table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (data as any)?.user?.id;
    if (userId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileError } = await (supabase as any).from("users").insert({
        id: userId,
        email: email,
        name: name,
        role: "retail",
        phone: phone || "",
        address: address || "",
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail registration if profile creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil. Silakan cek email untuk konfirmasi.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const GET = () =>
  NextResponse.json({ error: "Method not allowed" }, { status: 405 });
export const PUT = () =>
  NextResponse.json({ error: "Method not allowed" }, { status: 405 });
export const PATCH = () =>
  NextResponse.json({ error: "Method not allowed" }, { status: 405 });
export const DELETE = () =>
  NextResponse.json({ error: "Method not allowed" }, { status: 405 });