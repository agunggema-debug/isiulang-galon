import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json(
        { onlineVisitors: 0, totalVisitors: 0 },
        { status: 200 }
      );
    }

    // Get total visitors count
    const { count: totalVisitors } = await supabase
      .from("guest_visits")
      .select("*", { count: "exact", head: true });

    // Get online visitors (unique IPs in the last 15 minutes)
    const fifteenMinutesAgo = new Date(
      Date.now() - 15 * 60 * 1000
    ).toISOString();

    const { data: recentVisits } = await supabase
      .from("guest_visits")
      .select("ip_address")
      .gte("visited_at", fifteenMinutesAgo);

    // Count unique IPs
    const uniqueIps = new Set(
      (recentVisits || [])
        .map((v) => v.ip_address)
        .filter((ip) => ip && ip !== "unknown")
    );

    return NextResponse.json({
      onlineVisitors: uniqueIps.size,
      totalVisitors: totalVisitors || 0,
    });
  } catch (error) {
    console.error("Visitor stats error:", error);
    return NextResponse.json(
      { onlineVisitors: 0, totalVisitors: 0 },
      { status: 200 }
    );
  }
}

export const POST = () => methodNotAllowed(["GET"]);
export const PUT = () => methodNotAllowed(["GET"]);
export const PATCH = () => methodNotAllowed(["GET"]);
export const DELETE = () => methodNotAllowed(["GET"]);