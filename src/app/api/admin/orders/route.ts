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

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        order_number,
        total_amount,
        status,
        payment_method,
        payment_status,
        created_at,
        users!inner(name, email)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase orders error:", error);
      return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orders: (orders as any[])?.map((o) => ({
        id: o.order_number,
        customer: o.users?.name || "Unknown",
        email: o.users?.email || "",
        amount: o.total_amount,
        status: o.status,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        createdAt: o.created_at,
      })) || [],
    });
  } catch (error) {
    console.error("Orders error:", error);
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