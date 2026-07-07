import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

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
        categories!inner(name, slug, icon)
      `)
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase products error:", error);
      return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: (products as any[])?.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.categories?.name || "",
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

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, categoryId, retailPrice, wholesalePrice, stock, minWholesaleQty, unit, status } = body;

    // Validation
    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Nama produk dan kategori harus diisi" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

    // Check if category exists
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .single();

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 400 }
      );
    }

    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert({
        name,
        category_id: categoryId,
        retail_price: retailPrice || 0,
        wholesale_price: wholesalePrice || 0,
        stock: stock || 0,
        min_wholesale_qty: minWholesaleQty || 1,
        unit: unit || "unit",
        status: status || "Tersedia",
      })
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
        categories!inner(name, slug, icon)
      `)
      .single();

    if (insertError) {
      console.error("Create product error:", insertError);
      return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = newProduct as any;

    return NextResponse.json({
      product: {
        id: p.id,
        name: p.name,
        category: p.categories?.name || "",
        categoryIcon: p.categories?.icon || "Package",
        retailPrice: p.retail_price,
        wholesalePrice: p.wholesale_price,
        stock: p.stock,
        minOrder: p.min_wholesale_qty,
        status: p.status,
        unit: p.unit,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
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
    const { id, status, stock, name, retailPrice, wholesalePrice, minWholesaleQty, unit } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID produk harus diisi" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

    // Check if product exists
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Build dynamic update object
    const updates: Record<string, unknown> = {};

    if (status !== undefined) {
      const validStatuses = ["Tersedia", "Menipis", "Kosong"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Status tidak valid" },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (stock !== undefined) {
      if (typeof stock !== "number" || stock < 0) {
        return NextResponse.json(
          { error: "Stok harus berupa angka positif" },
          { status: 400 }
        );
      }
      updates.stock = stock;
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Nama produk tidak boleh kosong" },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (retailPrice !== undefined) {
      if (typeof retailPrice !== "number" || retailPrice < 0) {
        return NextResponse.json(
          { error: "Harga retail harus berupa angka positif" },
          { status: 400 }
        );
      }
      updates.retail_price = retailPrice;
    }

    if (wholesalePrice !== undefined) {
      if (typeof wholesalePrice !== "number" || wholesalePrice < 0) {
        return NextResponse.json(
          { error: "Harga grosir harus berupa angka positif" },
          { status: 400 }
        );
      }
      updates.wholesale_price = wholesalePrice;
    }

    if (minWholesaleQty !== undefined) {
      if (typeof minWholesaleQty !== "number" || minWholesaleQty < 1) {
        return NextResponse.json(
          { error: "Minimal pemesanan harus berupa angka positif" },
          { status: 400 }
        );
      }
      updates.min_wholesale_qty = minWholesaleQty;
    }

    if (unit !== undefined) {
      updates.unit = unit.trim() || "unit";
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data yang diupdate" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      console.error("Update product error:", updateError);
      return NextResponse.json({ error: "Gagal mengupdate produk" }, { status: 500 });
    }

    // Return updated product
    const { data: updatedProduct } = await supabase
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
        categories!inner(name, slug, icon)
      `)
      .eq("id", id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = updatedProduct as any;

    return NextResponse.json({
      product: {
        id: p.id,
        name: p.name,
        category: p.categories?.name || "",
        categoryIcon: p.categories?.icon || "Package",
        retailPrice: p.retail_price,
        wholesalePrice: p.wholesale_price,
        stock: p.stock,
        minOrder: p.min_wholesale_qty,
        status: p.status,
        unit: p.unit,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID produk harus diisi" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

    // Check if product exists
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", parseInt(id))
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", parseInt(id));

    if (deleteError) {
      console.error("Delete product error:", deleteError);
      return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
    }

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const PATCH = () => methodNotAllowed(["GET", "POST", "PUT", "DELETE"]);
