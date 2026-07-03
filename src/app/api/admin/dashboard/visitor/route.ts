import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { path } = body;

    // Get IP address (in production, you'd get this from headers)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    
    // Get user agent
    const userAgent = request.headers.get("user-agent") || "";

    // Record the visit
    const insertVisit = db.prepare(
      "INSERT INTO guest_visits (ip_address, user_agent, path) VALUES (?, ?, ?)"
    );
    insertVisit.run(ip, userAgent, path || "/shop");

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