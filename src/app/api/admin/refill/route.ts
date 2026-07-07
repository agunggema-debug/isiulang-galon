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

    // Get suppliers
    const { data: suppliers, error: suppliersError } = await supabase
      .from("refill_suppliers")
      .select("*")
      .order("name", { ascending: true });

    if (suppliersError) {
      console.error("Suppliers error:", suppliersError);
    }

    // Get schedules with join data
    const { data: schedules, error: schedulesError } = await supabase
      .from("refill_schedules")
      .select(`
        *,
        refill_suppliers!inner(name),
        products!inner(name, unit)
      `)
      .order("schedule_date", { ascending: false });

    if (schedulesError) {
      console.error("Schedules error:", schedulesError);
    }

    // Get refill product info
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "isi-ulang")
      .single();

    let refillProduct: unknown[] = [];
    if (categories) {
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categories.id)
        .order("id", { ascending: true });
      refillProduct = products || [];
    }

    return NextResponse.json({
      suppliers: suppliers || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schedules: (schedules as any[])?.map((s) => ({
        ...s,
        supplier_name: s.refill_suppliers?.name,
        product_name: s.products?.name,
        unit: s.products?.unit,
      })) || [],
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
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

    // Handle supplier creation
    if (body.type === "supplier") {
      const { name, phone, address, contact_person } = body;
      const { data, error } = await supabase
        .from("refill_suppliers")
        .insert({ name, phone: phone || "", address: address || "", contact_person: contact_person || "" })
        .select("id")
        .single();

      if (error) {
        console.error("Create supplier error:", error);
        return NextResponse.json({ error: "Gagal membuat supplier" }, { status: 500 });
      }
      return NextResponse.json({ success: true, id: data.id });
    }

    // Handle schedule creation
    if (body.type === "schedule") {
      const { supplier_id, product_id, schedule_date, estimated_time, quantity, notes } = body;
      const { data, error } = await supabase
        .from("refill_schedules")
        .insert({
          supplier_id,
          product_id,
          schedule_date,
          estimated_time: estimated_time || "",
          quantity,
          notes: notes || "",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Create schedule error:", error);
        return NextResponse.json({ error: "Gagal membuat jadwal" }, { status: 500 });
      }
      return NextResponse.json({ success: true, id: data.id });
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
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 500 });
    }

    // Update schedule status
    if (body.type === "schedule_status") {
      const { id, status } = body;
      const { error } = await supabase
        .from("refill_schedules")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Update schedule error:", error);
        return NextResponse.json({ error: "Gagal mengupdate jadwal" }, { status: 500 });
      }
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