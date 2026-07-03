import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase belum dikonfigurasi" },
        { status: 500 }
      );
    }

    // Supabase query with join
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        category_id,
        retail_price,
        wholesale_price,
        stock,
        min_wholesale_qty,
        unit,
        status,
        categories!inner(
          name,
          slug,
          icon
        )
      `)
      .eq("status", "Tersedia")
      .order("id");

    if (error) {
      console.error("Supabase products error:", error);
      return NextResponse.json(
        { error: "Terjadi kesalahan server" },
        { status: 500 }
      );
    }

    // Type assertion for Supabase response
    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: (products as any[])?.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.categories?.name || "",
        categorySlug: p.categories?.slug || "",
        categoryIcon: p.categories?.icon || "Package",
        retailPrice: p.retail_price,
        wholesalePrice: p.wholesale_price,
        stock: p.stock,
        minOrder: p.min_wholesale_qty,
        status: p.status,
        unit: p.unit,
      })) || [],
    });
  } catch (error) {
    console.error("Products error:", error);
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