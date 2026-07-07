import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      // Silently ignore if Supabase is not configured
      return NextResponse.json({ success: false }, { status: 200 });
    }

    const body = await request.json();
    const { path } = body;

    // Get IP address (in production, you'd get this from headers)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Get user agent
    const userAgent = request.headers.get("user-agent") || "";

    // Record the visit
    const { error } = await supabase
      .from("guest_visits")
      .insert({
        ip_address: ip,
        user_agent: userAgent,
        path: path || "/shop",
      });

    if (error) {
      console.error("Visitor tracking error:", error);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Visitor tracking error:", error);
    return NextResponse.json(
      { error: "Failed to record visit" },
      { status: 500 }
    );
  }
}

export const GET = () => methodNotAllowed(["POST"]);
export const PUT = () => methodNotAllowed(["POST"]);
export const PATCH = () => methodNotAllowed(["POST"]);
export const DELETE = () => methodNotAllowed(["POST"]);