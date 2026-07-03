"use client";

import { Search, Filter, Package, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Order {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
  processing: "bg-blue-50 text-blue-600 border-blue-200",
  completed: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  cancelled: "bg-red-50 text-red-500 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    type: "Retail",
    product: "",
    quantity: 1,
    price: "",
    payment: "COD",
  });

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddModal(false);
    setFormData({
      customer: "",
      type: "Retail",
      product: "",
      quantity: 1,
      price: "",
      payment: "COD",
    });
  };

  const formatRupiah = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter((o) => o.status === "processing").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const todayCount = orders.filter((o) => {
    const today = new Date().toISOString().split("T")[0];
    return o.createdAt.startsWith(today);
  }).length;

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
            <p className="text-sm text-gray-500 mt-1">Memuat data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan pantau semua pesanan pelanggan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            Tambah Pesanan
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Menunggu</p>
          <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Diproses</p>
          <p className="text-xl font-bold text-blue-600">{processingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Selesai</p>
          <p className="text-xl font-bold text-[#10B981]">{completedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Hari Ini</p>
          <p className="text-xl font-bold text-gray-900">{todayCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pesanan..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
            />
          </div>
          <select className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all">
            <option>Semua Status</option>
            <option>Menunggu</option>
            <option>Diproses</option>
            <option>Selesai</option>
            <option>Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">ID Pesanan</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Pelanggan</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Pembayaran</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Tanggal</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#0F4C81]">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-[#0F4C81]" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                          <p className="text-xs text-gray-400">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        order.paymentMethod === "transfer" ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>
                        {order.paymentMethod === "transfer" ? "Transfer" : "COD"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatRupiah(order.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[order.status] || ""}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Belum ada pesanan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tambah Pesanan</h2>
                <p className="text-sm text-gray-500 mt-0.5">Isi detail pesanan baru</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Pelanggan</label>
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  placeholder="Masukkan nama pelanggan"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Grosir">Grosir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pembayaran</label>
                  <select
                    name="payment"
                    value={formData.payment}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all"
                  >
                    <option value="COD">COD</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk</label>
                <input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  placeholder="Masukkan nama produk"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Satuan</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Simpan Pesanan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}