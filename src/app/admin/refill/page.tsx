"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw, Truck, Calendar, Clock, CheckCircle, XCircle, Loader2, User, Phone, MapPin } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  address: string;
  contact_person: string;
  is_active: number;
}

interface Schedule {
  id: number;
  supplier_id: number;
  product_id: number;
  schedule_date: string;
  estimated_time: string;
  quantity: number;
  status: string;
  notes: string;
  supplier_name: string;
  product_name: string;
  unit: string;
}

interface RefillProduct {
  id: number;
  name: string;
  stock: number;
  unit: string;
}

const statusStyles: Record<string, string> = {
  direncanakan: "bg-blue-50 text-blue-600 border-blue-200",
  dalam_perjalanan: "bg-amber-50 text-amber-600 border-amber-200",
  selesai: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  dibatalkan: "bg-red-50 text-red-500 border-red-200",
};

const statusLabels: Record<string, string> = {
  direncanakan: "Direncanakan",
  dalam_perjalanan: "Dalam Perjalanan",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export default function AdminRefill() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [refillProducts, setRefillProducts] = useState<RefillProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [supplierForm, setSupplierForm] = useState({ name: "", phone: "", address: "", contact_person: "" });
  const [scheduleForm, setScheduleForm] = useState({ supplier_id: "", product_id: "", schedule_date: "", estimated_time: "", quantity: "", notes: "" });

useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/refill");
        const data = await res.json();
        setSuppliers(data.suppliers);
        setSchedules(data.schedules);
        setRefillProducts(data.refillProduct);
      } catch (err) {
        console.error("Failed to fetch refill data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/refill");
      const data = await res.json();
      setSuppliers(data.suppliers);
      setSchedules(data.schedules);
      setRefillProducts(data.refillProduct);
    } catch (err) {
      console.error("Failed to fetch refill data:", err);
    }
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/admin/refill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "supplier", ...supplierForm }),
      });
      setShowSupplierModal(false);
      setSupplierForm({ name: "", phone: "", address: "", contact_person: "" });
      fetchData();
    } catch (err) {
      console.error("Failed to add supplier:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/admin/refill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "schedule",
          supplier_id: parseInt(scheduleForm.supplier_id),
          product_id: parseInt(scheduleForm.product_id),
          schedule_date: scheduleForm.schedule_date,
          estimated_time: scheduleForm.estimated_time,
          quantity: parseInt(scheduleForm.quantity),
          notes: scheduleForm.notes,
        }),
      });
      setShowScheduleModal(false);
      setScheduleForm({ supplier_id: "", product_id: "", schedule_date: "", estimated_time: "", quantity: "", notes: "" });
      fetchData();
    } catch (err) {
      console.error("Failed to add schedule:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await fetch("/api/admin/refill", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "schedule_status", id, status }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Isi Ulang Air Galon</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Isi Ulang Air Galon</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola supplier dan jadwal pengisian air galon
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="font-semibold gap-2"
            onClick={() => setShowSupplierModal(true)}
          >
            <User className="h-4 w-4" />
            Tambah Supplier
          </Button>
          <Button
            className="font-semibold gap-2"
            onClick={() => setShowScheduleModal(true)}
          >
            <Plus className="h-4 w-4" />
            Jadwal Baru
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#0F4C81]/10">
              <RotateCcw className="h-5 w-5 text-[#0F4C81]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Produk Isi Ulang</p>
              <p className="text-xl font-bold text-gray-900">{refillProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#10B981]/10">
              <Truck className="h-5 w-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Supplier Aktif</p>
              <p className="text-xl font-bold text-gray-900">
                {suppliers.filter((s) => s.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jadwal Aktif</p>
              <p className="text-xl font-bold text-amber-600">
                {schedules.filter((s) => s.status === "direncanakan" || s.status === "dalam_perjalanan").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#0F4C81]/10">
              <CheckCircle className="h-5 w-5 text-[#0F4C81]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Selesai</p>
              <p className="text-xl font-bold text-gray-900">
                {schedules.filter((s) => s.status === "selesai").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Supplier</h2>
        {suppliers.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Belum ada supplier. Tambahkan supplier baru.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-[#0F4C81]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{supplier.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      supplier.is_active ? "bg-[#10B981]/10 text-[#10B981]" : "bg-gray-100 text-gray-500"
                    }`}>
                      {supplier.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-500">
                  {supplier.contact_person && (
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      {supplier.contact_person}
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      {supplier.phone}
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {supplier.address}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedules Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Jadwal Pengisian</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Supplier</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Produk</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Tanggal</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Waktu</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Jumlah</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    Belum ada jadwal pengisian
                  </td>
                </tr>
              ) : (
                schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{schedule.supplier_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{schedule.product_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(schedule.schedule_date).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {schedule.estimated_time ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{schedule.estimated_time}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {schedule.quantity} {schedule.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[schedule.status] || ""}`}>
                        {statusLabels[schedule.status] || schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {schedule.status === "direncanakan" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(schedule.id, "dalam_perjalanan")}
                              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-all"
                              title="Tandai Dalam Perjalanan"
                            >
                              <Truck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(schedule.id, "dibatalkan")}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all"
                              title="Batalkan"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {schedule.status === "dalam_perjalanan" && (
                          <button
                            onClick={() => handleUpdateStatus(schedule.id, "selesai")}
                            className="p-1.5 rounded-lg text-[#10B981] hover:bg-[#10B981]/10 transition-all"
                            title="Tandai Selesai"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Supplier Baru</h3>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Supplier *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                  placeholder="Nama perusahaan supplier"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Person</label>
                <input
                  type="text"
                  value={supplierForm.contact_person}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                  placeholder="Nama kontak person"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input
                  type="text"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                  placeholder="081234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                  placeholder="Alamat supplier"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="font-semibold">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Supplier"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSupplierModal(false)}
                  className="font-semibold"
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buat Jadwal Pengisian Baru</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                <select
                  required
                  value={scheduleForm.supplier_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                >
                  <option value="">Pilih Supplier</option>
                  {suppliers.filter(s => s.is_active).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produk *</label>
                <select
                  required
                  value={scheduleForm.product_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, product_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                >
                  <option value="">Pilih Produk</option>
                  {refillProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pengisian *</label>
                <input
                  type="date"
                  required
                  value={scheduleForm.schedule_date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, schedule_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Waktu</label>
                <input
                  type="time"
                  value={scheduleForm.estimated_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, estimated_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (galon) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={scheduleForm.quantity}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                  placeholder="Catatan tambahan"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="font-semibold">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Buat Jadwal"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                  className="font-semibold"
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}