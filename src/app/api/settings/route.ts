import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT key, value FROM settings").all() as Array<Record<string, string>>;

    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key as string] = row.value as string;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Public settings error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const POST = () => methodNotAllowed(["GET"]);
export const PUT = () => methodNotAllowed(["GET"]);
export const PATCH = () => methodNotAllowed(["GET"]);
export const DELETE = () => methodNotAllowed(["GET"]);