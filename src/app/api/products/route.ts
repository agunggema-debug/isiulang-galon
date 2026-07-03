import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { methodNotAllowed } from "@/lib/api-helpers";
import type { ProductRow } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const products = db
      .prepare(
        `SELECT p.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.status = 'Tersedia'
         ORDER BY p.id ASC`
      )
      .all() as ProductRow[];

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category_name,
        categorySlug: p.category_slug,
        categoryIcon: p.category_icon,
        retailPrice: p.retail_price,
        wholesalePrice: p.wholesale_price,
        stock: p.stock,
        unit: p.unit,
        status: p.status,
      })),
    });
  } catch (error) {
    console.error("Public products error:", error);
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
