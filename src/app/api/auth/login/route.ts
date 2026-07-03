import { NextRequest, NextResponse } from "next/server";
import { initDatabase } from "@/lib/database";
import { initAuth, loginUser } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    // Initialize database and auth on first request
    initDatabase();
    initAuth();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      redirectUrl:
        result.user?.role === "admin"
          ? "/admin/dashboard"
          : result.user?.role === "wholesale"
          ? "/shop?role=wholesale"
          : "/shop?role=retail",
    });

    // Set session cookie
    response.cookies.set("session_id", result.sessionId!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: result.user?.role === "admin" ? 7200 : 604800, // 2 hours or 7 days
      path: "/",
    });

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