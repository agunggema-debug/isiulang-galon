"use client";

import { Search, AlertTriangle, CheckCircle, XCircle, Droplets, Flame, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface StockItem {
  id: number;
  name: string;
  category: string;
  categoryIcon: string;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  status: string;
}

interface ProductResponse {
  id: number;
  name: string;
  category: string;
  categoryIcon: string;
  stock: number;
  unit: string;
  status: string;
}

export default function AdminStock() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        if (cancelled) return;
        const items: StockItem[] = (data.products || []).map((p: ProductResponse) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          categoryIcon: p.categoryIcon,
          stock: p.stock,
          minStock: 10,
          maxStock: Math.max(p.stock * 2, 50),
          unit: p.unit,
          status: p.status,
        }));
        setStockItems(items);
      } catch {
        // Silently handle error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => { cancelled = true; };
  }, []);

  const handleStatusToggle = async (item: StockItem) => {
    setTogglingId(item.id);
    const newStatus = item.status === "Tersedia" ? "Menipis" : "Tersedia";

    // Optimistic update
    setStockItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
    );

    try {
      // Call API to update product status
      const res = await fetch(`/api/admin/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      });

      if (!res.ok) {
        // Revert on error
        setStockItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: item.status } : i))
        );
      }
    } catch {
      // Revert on error
      setStockItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: item.status } : i))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Droplets":
        return Droplets;
      case "Flame":
        return Flame;
      default:
        return Package;
    }
  };

  // Filter items based on search and status filter
  const filteredItems = stockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "Semua Status" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = stockItems.filter((item) => item.status === "Tersedia").length;
  const lowCount = stockItems.filter((item) => item.status === "Menipis").length;
  const emptyCount = stockItems.filter((item) => item.status === "Kosong").length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Stok</h1>
            <p className="text-sm text-gray-500 mt-1">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Stok</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau dan kelola stok produk secara real-time
          </p>
        </div>
        <Button
          className="font-semibold"
          disabled={stockItems.length === 0}
          title={stockItems.length === 0 ? "Tambah produk terlebih dahulu untuk mengupdate stok" : "Update stok produk"}
        >
          Update Stok
        </Button>
      </div>

      {/* Stock Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#10B981]/10">
              <CheckCircle className="h-5 w-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Produk Tersedia</p>
              <p className="text-xl font-bold text-gray-900">{availableCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stok Menipis</p>
              <p className="text-xl font-bold text-amber-600">{lowCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-50">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stok Kosong</p>
              <p className="text-xl font-bold text-red-500">{emptyCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all"
          >
            <option>Semua Status</option>
            <option>Tersedia</option>
            <option>Menipis</option>
            <option>Kosong</option>
          </select>
        </div>
      </div>

      {/* Products count after filter */}
      {filteredItems.length !== stockItems.length && (
        <p className="text-sm text-gray-500">
          Menampilkan {filteredItems.length} dari {stockItems.length} produk
        </p>
      )}

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Produk</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Kategori</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Stok Saat Ini</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Min. Stok</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Maks. Stok</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Progress</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      {searchQuery || statusFilter !== "Semua Status"
                        ? "Tidak ada produk yang sesuai filter"
                        : "Belum ada produk"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(searchQuery || statusFilter !== "Semua Status")
                        ? "Coba ubah kata kunci pencarian atau filter"
                        : "Tambah produk terlebih dahulu untuk mengelola stok"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const Icon = getIcon(item.categoryIcon);
                  const progress = Math.round((item.stock / item.maxStock) * 100);
                  let progressColor: string;
                  if (progress > 50) {
                    progressColor = "bg-[#10B981]";
                  } else if (progress > 25) {
                    progressColor = "bg-amber-500";
                  } else {
                    progressColor = "bg-red-500";
                  }
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-[#0F4C81]" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${
                          item.status === "Menipis" ? "text-amber-600" : "text-gray-900"
                        }`}>
                          {item.stock} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-500">{item.minStock}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-500">{item.maxStock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${progressColor}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          item.status === "Tersedia"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={item.status === "Tersedia"}
                            disabled={togglingId === item.id}
                            onChange={() => handleStatusToggle(item)}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0F4C81]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                        </label>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}