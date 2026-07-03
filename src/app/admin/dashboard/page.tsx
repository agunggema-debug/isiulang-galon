"use client";

import { Metadata } from "next";
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ChevronRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Stat card component
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: "up" | "down";
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-[#0F4C81]/10">
          <Icon className="h-5 w-5 text-[#0F4C81]" />
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend === "up"
              ? "bg-[#10B981]/10 text-[#10B981]"
              : "bg-red-50 text-red-500"
          }`}
        >
          {change}
        </span>
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Recent order item
function RecentOrder({
  id,
  customer,
  amount,
  status,
}: {
  id: string;
  customer: string;
  amount: string;
  status: "pending" | "processing" | "completed" | "cancelled";
}) {
  const statusStyles = {
    pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
    processing: "bg-blue-50 text-blue-600 border-blue-200",
    completed: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    cancelled: "bg-red-50 text-red-500 border-red-200",
  };
  const statusLabels = {
    pending: "Menunggu",
    processing: "Diproses",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
          <Package className="h-4 w-4 text-[#0F4C81]" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{customer}</p>
          <p className="text-xs text-gray-500">
            {id}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900">{amount}</p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${statusStyles[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>
    </div>
  );
}

// Low stock item
function LowStockItem({
  name,
  stock,
  unit,
}: {
  name: string;
  stock: number;
  unit: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-b-0">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <span className="text-sm text-gray-700">{name}</span>
      </div>
      <span className="text-sm font-medium text-red-500">
        {stock} {unit}
      </span>
    </div>
  );
}

interface DashboardData {
  stats: {
    totalOrdersToday: number;
    revenueToday: number;
    productsSoldToday: number;
    newCustomersToday: number;
    guestVisitsToday: number;
    orderTrend: string;
    revenueTrend: string;
    productsTrend: string;
    customersTrend: string;
    visitorsTrend: string;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
  }>;
  lowStockProducts: Array<{
    name: string;
    stock: number;
    unit: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatRupiah = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const getTrend = (trend: string) => {
    if (trend.startsWith("+")) return "up" as const;
    if (trend.startsWith("-")) return "down" as const;
    return "up" as const;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Selamat datang kembali, Admin! Berikut ringkasan toko Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Sistem Aktif
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Pesanan Hari Ini"
          value={data?.stats.totalOrdersToday.toString() || "0"}
          change={data?.stats.orderTrend || "0%"}
          icon={ShoppingCart}
          trend={getTrend(data?.stats.orderTrend || "0%")}
        />
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatRupiah(data?.stats.revenueToday || 0)}
          change={data?.stats.revenueTrend || "0%"}
          icon={DollarSign}
          trend={getTrend(data?.stats.revenueTrend || "0%")}
        />
        <StatCard
          title="Produk Terjual"
          value={data?.stats.productsSoldToday.toString() || "0"}
          change={data?.stats.productsTrend || "0%"}
          icon={TrendingUp}
          trend={getTrend(data?.stats.productsTrend || "0%")}
        />
        <StatCard
          title="Pelanggan Baru"
          value={data?.stats.newCustomersToday.toString() || "0"}
          change={data?.stats.customersTrend || "0%"}
          icon={Package}
          trend={getTrend(data?.stats.customersTrend || "0%")}
        />
        <StatCard
          title="Total Pengunjung Hari Ini"
          value={data?.stats.guestVisitsToday.toString() || "0"}
          change={data?.stats.visitorsTrend || "0%"}
          icon={Users}
          trend={getTrend(data?.stats.visitorsTrend || "0%")}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pesanan Terbaru
            </h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm text-[#0F4C81] hover:underline"
            >
              Lihat Semua
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.map((order, index) => (
                <RecentOrder
                  key={index}
                  id={order.id}
                  customer={order.customer}
                  amount={formatRupiah(order.amount)}
                  status={order.status as "pending" | "processing" | "completed" | "cancelled"}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">
                Belum ada pesanan hari ini
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Stok Menipis
              </h2>
              <Link
                href="/admin/stock"
                className="text-sm text-[#0F4C81] hover:underline"
              >
                Kelola
              </Link>
            </div>
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map((product, index) => (
                <LowStockItem
                  key={index}
                  name={product.name}
                  stock={product.stock}
                  unit={product.unit}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">
                Semua stok aman
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aksi Cepat
            </h2>
            <div className="space-y-2">
              <Link
                href="/admin/products"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#0F4C81]/5 hover:bg-[#0F4C81]/10 transition-colors"
              >
                <Package className="h-5 w-5 text-[#0F4C81]" />
                <span className="text-sm font-medium text-[#0F4C81]">
                  Tambah Produk Baru
                </span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#10B981]/5 hover:bg-[#10B981]/10 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-[#10B981]" />
                <span className="text-sm font-medium text-[#10B981]">
                  Proses Pesanan Baru
                </span>
              </Link>
              <Link
                href="/admin/stock"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors w-full text-left"
              >
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">
                  Update Status Stok
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}