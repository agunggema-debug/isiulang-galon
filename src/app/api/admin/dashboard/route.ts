import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { methodNotAllowed } from "@/lib/api-helpers";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase belum dikonfigurasi" },
        { status: 500 }
      );
    }

    // Get today's stats using Supabase
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Query orders today
    const { count: totalOrdersToday } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`);

    // Query revenue today (paid orders)
    const { data: revenueData } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid")
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`);

    const revenueToday = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    // Query recent orders with customer info
    const { data: recentOrders } = await supabase
      .from("orders")
      .select(`
        order_number,
        total_amount,
        status,
        users!inner(name)
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    // Query low stock products
    const { data: lowStockProducts } = await supabase
      .from("products")
      .select("name, stock, unit")
      .or(`status.eq.Menipis,stock.lte.10`)
      .order("stock", { ascending: true })
      .limit(5);

    // Query yesterday stats for trend
    const { count: ordersYesterday } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${yesterdayStr}T00:00:00`)
      .lt("created_at", `${yesterdayStr}T23:59:59`);

    const { data: revenueYesterdayData } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid")
      .gte("created_at", `${yesterdayStr}T00:00:00`)
      .lt("created_at", `${yesterdayStr}T23:59:59`);

    const revenueYesterday = revenueYesterdayData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    };

    return NextResponse.json({
      stats: {
        totalOrdersToday: totalOrdersToday || 0,
        revenueToday,
        productsSoldToday: 0,
        newCustomersToday: 0,
        guestVisitsToday: 0,
        orderTrend: calcTrend(totalOrdersToday || 0, ordersYesterday || 0),
        revenueTrend: calcTrend(revenueToday, revenueYesterday),
        productsTrend: "0%",
        customersTrend: "0%",
        visitorsTrend: "0%",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentOrders: recentOrders?.map((o: any) => ({
        id: o.order_number,
        customer: o.users?.name || "Unknown",
        amount: o.total_amount,
        status: o.status,
      })) || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lowStockProducts: lowStockProducts?.map((p: any) => ({
        name: p.name,
        stock: p.stock,
        unit: p.unit,
      })) || [],
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