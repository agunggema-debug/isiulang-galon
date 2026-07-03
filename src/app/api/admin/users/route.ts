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
    const users = db
      .prepare(
        `SELECT id, email, name, role, phone, address, created_at
         FROM users
         ORDER BY created_at DESC`
      )
      .all() as Array<Record<string, unknown>>;

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id as number,
        email: u.email as string,
        name: u.name as string,
        role: u.role as string,
        phone: u.phone as string,
        address: u.address as string,
        createdAt: u.created_at as string,
      })),
    });
  } catch (error) {
    console.error("Users error:", error);
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