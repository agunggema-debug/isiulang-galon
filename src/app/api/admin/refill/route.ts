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

    // Get suppliers
    const suppliers = db
      .prepare("SELECT * FROM refill_suppliers ORDER BY name ASC")
      .all() as Array<Record<string, unknown>>;

    // Get schedules with join data
    const schedules = db
      .prepare(
        `SELECT rs.*, rs2.name as supplier_name, p.name as product_name, p.unit
         FROM refill_schedules rs
         JOIN refill_suppliers rs2 ON rs.supplier_id = rs2.id
         JOIN products p ON rs.product_id = p.id
         ORDER BY rs.schedule_date DESC`
      )
      .all() as Array<Record<string, unknown>>;

    // Get refill product info
    const refillProduct = db
      .prepare("SELECT * FROM products WHERE category_id = (SELECT id FROM categories WHERE slug = 'isi-ulang') ORDER BY id ASC")
      .all() as Array<Record<string, unknown>>;

    return NextResponse.json({
      suppliers,
      schedules,
      refillProduct,
    });
  } catch (error) {
    console.error("Refill error:", error);
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
    const db = getDb();

    // Handle supplier creation
    if (body.type === "supplier") {
      const { name, phone, address, contact_person } = body;
      const result = db
        .prepare("INSERT INTO refill_suppliers (name, phone, address, contact_person) VALUES (?, ?, ?, ?)")
        .run(name, phone || "", address || "", contact_person || "");
      return NextResponse.json({ success: true, id: result.lastInsertRowid });
    }

    // Handle schedule creation
    if (body.type === "schedule") {
      const { supplier_id, product_id, schedule_date, estimated_time, quantity, notes } = body;
      const result = db
        .prepare("INSERT INTO refill_schedules (supplier_id, product_id, schedule_date, estimated_time, quantity, notes) VALUES (?, ?, ?, ?, ?, ?)")
        .run(supplier_id, product_id, schedule_date, estimated_time || "", quantity, notes || "");
      return NextResponse.json({ success: true, id: result.lastInsertRowid });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Refill POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = getDb();

    // Update schedule status
    if (body.type === "schedule_status") {
      const { id, status } = body;
      db.prepare("UPDATE refill_schedules SET status = ?, updated_at = datetime('now') WHERE id = ?")
        .run(status, id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Refill PATCH error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export const PUT = () => methodNotAllowed(["GET", "POST", "PATCH"]);
export const DELETE = () => methodNotAllowed(["GET", "POST", "PATCH"]);