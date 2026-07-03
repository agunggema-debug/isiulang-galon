import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          remove(name: string) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
    }

    const response = NextResponse.json({ success: true });
    
    // Clear auth cookies
    response.cookies.set("sb-access-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
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