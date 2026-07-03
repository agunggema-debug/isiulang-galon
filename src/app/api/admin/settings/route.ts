import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { getSession } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const rows = db.prepare("SELECT key, value FROM settings").all() as Array<Record<string, string>>;

    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key as string] = row.value as string;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Data settings tidak valid" },
        { status: 400 }
      );
    }

    const db = getDb();
    const upsert = db.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );

    const updateAll = db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        upsert.run(key, String(value));
      }
    });
    updateAll();

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const POST = () => methodNotAllowed(["GET", "PUT"]);
export const PATCH = () => methodNotAllowed(["GET", "PUT"]);
export const DELETE = () => methodNotAllowed(["GET", "PUT"]);