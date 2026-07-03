import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { getSession } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/api-helpers";
import type { ProductRow } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const products = db
      .prepare(
        `SELECT p.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
         FROM products p
         JOIN categories c ON p.category_id = c.id
         ORDER BY p.id ASC`
      )
      .all() as ProductRow[];

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category_name,
        categoryIcon: p.category_icon,
        retailPrice: p.retail_price,
        wholesalePrice: p.wholesale_price,
        stock: p.stock,
        minOrder: p.min_wholesale_qty,
        status: p.status,
        unit: p.unit,
      })),
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

    const db = getDb();

    // Check if category exists
    const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `INSERT INTO products (name, category_id, retail_price, wholesale_price, stock, min_wholesale_qty, unit, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name,
        categoryId,
        retailPrice || 0,
        wholesalePrice || 0,
        stock || 0,
        minWholesaleQty || 1,
        unit || "unit",
        status || "Tersedia"
      );

    const newProduct = db
      .prepare(
        `SELECT p.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`
      )
      .get(result.lastInsertRowid) as ProductRow;

    return NextResponse.json({
      product: {
        id: newProduct.id,
        name: newProduct.name,
        category: newProduct.category_name,
        categoryIcon: newProduct.category_icon,
        retailPrice: newProduct.retail_price,
        wholesalePrice: newProduct.wholesale_price,
        stock: newProduct.stock,
        minOrder: newProduct.min_wholesale_qty,
        status: newProduct.status,
        unit: newProduct.unit,
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

    const db = getDb();

    // Check if product exists
    const product = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: unknown[] = [];

    if (status !== undefined) {
      const validStatuses = ["Tersedia", "Menipis", "Kosong"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Status tidak valid" },
          { status: 400 }
        );
      }
      updates.push("status = ?");
      values.push(status);
    }

    if (stock !== undefined) {
      if (typeof stock !== "number" || stock < 0) {
        return NextResponse.json(
          { error: "Stok harus berupa angka positif" },
          { status: 400 }
        );
      }
      updates.push("stock = ?");
      values.push(stock);
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Nama produk tidak boleh kosong" },
          { status: 400 }
        );
      }
      updates.push("name = ?");
      values.push(name.trim());
    }

    if (retailPrice !== undefined) {
      if (typeof retailPrice !== "number" || retailPrice < 0) {
        return NextResponse.json(
          { error: "Harga retail harus berupa angka positif" },
          { status: 400 }
        );
      }
      updates.push("retail_price = ?");
      values.push(retailPrice);
    }

    if (wholesalePrice !== undefined) {
      if (typeof wholesalePrice !== "number" || wholesalePrice < 0) {
        return NextResponse.json(
          { error: "Harga grosir harus berupa angka positif" },
          { status: 400 }
        );
      }
      updates.push("wholesale_price = ?");
      values.push(wholesalePrice);
    }

    if (minWholesaleQty !== undefined) {
      if (typeof minWholesaleQty !== "number" || minWholesaleQty < 1) {
        return NextResponse.json(
          { error: "Minimal pemesanan harus berupa angka positif" },
          { status: 400 }
        );
      }
      updates.push("min_wholesale_qty = ?");
      values.push(minWholesaleQty);
    }

    if (unit !== undefined) {
      updates.push("unit = ?");
      values.push(unit.trim() || "unit");
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data yang diupdate" },
        { status: 400 }
      );
    }

    values.push(id);
    db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    // Return updated product
    const updatedProduct = db
      .prepare(
        `SELECT p.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`
      )
      .get(id) as ProductRow;

    return NextResponse.json({
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        category: updatedProduct.category_name,
        categoryIcon: updatedProduct.category_icon,
        retailPrice: updatedProduct.retail_price,
        wholesalePrice: updatedProduct.wholesale_price,
        stock: updatedProduct.stock,
        minOrder: updatedProduct.min_wholesale_qty,
        status: updatedProduct.status,
        unit: updatedProduct.unit,
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

export const PATCH = () => methodNotAllowed(["GET", "POST", "PUT"]);
export const DELETE = () => methodNotAllowed(["GET", "POST", "PUT"]);
