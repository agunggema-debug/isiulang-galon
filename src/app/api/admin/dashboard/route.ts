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

    // Get today's stats
    const today = new Date().toISOString().split("T")[0];

    const totalOrdersToday = db
      .prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?")
      .get(today) as { count: number };

    const revenueToday = db
      .prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE date(created_at) = ? AND payment_status = 'paid'")
      .get(today) as { total: number };

    const productsSoldToday = db
      .prepare(
        "SELECT COALESCE(SUM(oi.quantity), 0) as total FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.created_at) = ?"
      )
      .get(today) as { total: number };

    const newCustomersToday = db
      .prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = ? AND role != 'admin'")
      .get(today) as { count: number };

    // Get guest visits today
    const guestVisitsToday = db
      .prepare("SELECT COUNT(*) as count FROM guest_visits WHERE date(visited_at) = ?")
      .get(today) as { count: number };

    // Get recent orders
    const recentOrders = db
      .prepare(
        `SELECT o.id, o.order_number, u.name as customer_name, o.total_amount, o.status, o.created_at
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC
         LIMIT 5`
      )
      .all() as Array<Record<string, unknown>>;

    // Get low stock products
    const lowStockProducts = db
      .prepare(
        `SELECT p.name, p.stock, p.unit
         FROM products p
         WHERE p.status = 'Menipis' OR p.stock <= 10
         ORDER BY p.stock ASC
         LIMIT 5`
      )
      .all() as Array<Record<string, unknown>>;

    // Calculate trends (compare with yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const ordersYesterday = db
      .prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?")
      .get(yesterdayStr) as { count: number };

    const revenueYesterday = db
      .prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE date(created_at) = ? AND payment_status = 'paid'")
      .get(yesterdayStr) as { total: number };

    const productsSoldYesterday = db
      .prepare(
        "SELECT COALESCE(SUM(oi.quantity), 0) as total FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.created_at) = ?"
      )
      .get(yesterdayStr) as { total: number };

    const newCustomersYesterday = db
      .prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = ? AND role != 'admin'")
      .get(yesterdayStr) as { count: number };

    const guestVisitsYesterday = db
      .prepare("SELECT COUNT(*) as count FROM guest_visits WHERE date(visited_at) = ?")
      .get(yesterdayStr) as { count: number };

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    };

    return NextResponse.json({
      stats: {
        totalOrdersToday: totalOrdersToday.count,
        revenueToday: revenueToday.total,
        productsSoldToday: productsSoldToday.total,
        newCustomersToday: newCustomersToday.count,
        guestVisitsToday: guestVisitsToday.count,
        orderTrend: calcTrend(totalOrdersToday.count, ordersYesterday.count),
        revenueTrend: calcTrend(revenueToday.total, revenueYesterday.total),
        productsTrend: calcTrend(productsSoldToday.total, productsSoldYesterday.total),
        customersTrend: calcTrend(newCustomersToday.count, newCustomersYesterday.count),
        visitorsTrend: calcTrend(guestVisitsToday.count, guestVisitsYesterday.count),
      },
      recentOrders: recentOrders.map((order: Record<string, unknown>) => ({
        id: order.order_number as string,
        customer: order.customer_name as string,
        amount: order.total_amount as number,
        status: order.status as string,
      })),
      lowStockProducts: lowStockProducts.map((product: Record<string, unknown>) => ({
        name: product.name as string,
        stock: product.stock as number,
        unit: product.unit as string,
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
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