import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getDb } from "@/lib/database";
import { initAuth, createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Initialize database and auth on first request
    initDatabase();
    initAuth();

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

    const db = getDb();

    // Check if email already exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with retail role by default
    const result = db
      .prepare(
        "INSERT INTO users (email, password, name, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(email, hashedPassword, name, "retail", phone || "", address || "");

    const userId = result.lastInsertRowid as number;

    // Create session
    const sessionId = await createSession(userId);

    // Get user data with proper typing
    interface UserResponse {
      id: number;
      email: string;
      name: string;
      role: string;
      phone: string;
      address: string;
    }
    const user = db
      .prepare("SELECT id, email, name, role, phone, address FROM users WHERE id = ?")
      .get(userId) as UserResponse;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
      redirectUrl: "/shop?role=retail",
    });

    // Set session cookie
    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800, // 7 days
      path: "/",
    });

    return response;
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