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
    const categories = db
      .prepare("SELECT id, name, slug, icon FROM categories ORDER BY id ASC")
      .all() as Array<Record<string, unknown>>;

    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id as number,
        name: c.name as string,
        slug: c.slug as string,
        icon: c.icon as string,
      })),
    });
  } catch (error) {
    console.error("Categories error:", error);
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