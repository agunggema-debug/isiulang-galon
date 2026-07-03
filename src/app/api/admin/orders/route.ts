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
    const orders = db
      .prepare(
        `SELECT o.id, o.order_number, u.name as customer_name, u.email as customer_email,
                o.total_amount, o.status, o.payment_method, o.payment_status, o.created_at
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC`
      )
      .all() as Array<Record<string, unknown>>;

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.order_number as string,
        customer: o.customer_name as string,
        email: o.customer_email as string,
        amount: o.total_amount as number,
        status: o.status as string,
        paymentMethod: o.payment_method as string,
        paymentStatus: o.payment_status as string,
        createdAt: o.created_at as string,
      })),
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