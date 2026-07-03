"use client";

import { useState, useEffect, FormEvent } from "react";
import { Save, Store, Truck, CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [freeShippingMin, setFreeShippingMin] = useState("");
  const [codEnabled, setCodEnabled] = useState(true);
  const [transferEnabled, setTransferEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (cancelled) return;
        if (data.settings) {
          setStoreName(data.settings.store_name || "AquaGas Premium");
          setStorePhone(data.settings.store_phone || "0812-3456-7890");
          setStoreAddress(data.settings.store_address || "Jl. Merdeka No. 123, Jakarta Selatan");
          setShippingCost(data.settings.shipping_cost_per_km || "5000");
          setFreeShippingMin(data.settings.free_shipping_minimum || "100000");
          setCodEnabled(data.settings.payment_cod_enabled === "true");
          setTransferEnabled(data.settings.payment_transfer_enabled === "true");
        }
      } catch {
        if (!cancelled) {
          setNotification({ type: "error", message: "Gagal memuat pengaturan" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();
    return () => { cancelled = true; };
  }, []);

  function validateForm(): boolean {
    if (!storeName.trim()) {
      setNotification({ type: "error", message: "Nama toko harus diisi" });
      return false;
    }
    if (!storePhone.trim()) {
      setNotification({ type: "error", message: "No. telepon harus diisi" });
      return false;
    }
    if (!storeAddress.trim()) {
      setNotification({ type: "error", message: "Alamat harus diisi" });
      return false;
    }
    const shippingNum = Number(shippingCost);
    if (Number.isNaN(shippingNum) || shippingNum < 0) {
      setNotification({ type: "error", message: "Biaya pengiriman harus berupa angka positif" });
      return false;
    }
    const freeShippingNum = Number(freeShippingMin);
    if (Number.isNaN(freeShippingNum) || freeShippingNum < 0) {
      setNotification({ type: "error", message: "Minimal gratis ongkir harus berupa angka positif" });
      return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setNotification(null);

    if (!validateForm()) return;

    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            store_name: storeName.trim(),
            store_phone: storePhone.trim(),
            store_address: storeAddress.trim(),
            shipping_cost_per_km: shippingCost,
            free_shipping_minimum: freeShippingMin,
            payment_cod_enabled: codEnabled ? "true" : "false",
            payment_transfer_enabled: transferEnabled ? "true" : "false",
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({ type: "success", message: data.message || "Pengaturan berhasil disimpan" });
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification({ type: "error", message: data.error || "Gagal menyimpan pengaturan" });
      }
    } catch {
      setNotification({ type: "error", message: "Terjadi kesalahan koneksi" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F4C81]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola pengaturan toko dan preferensi sistem
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
            notification.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          {notification.message}
        </div>
      )}

      {/* Store Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-[#0F4C81]/10">
            <Store className="h-5 w-5 text-[#0F4C81]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Informasi Toko</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Toko</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Telepon</label>
            <input
              type="text"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
            <textarea
              rows={2}
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm resize-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Shipping Settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-[#10B981]/10">
            <Truck className="h-5 w-5 text-[#10B981]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Pengiriman</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Biaya Pengiriman</p>
              <p className="text-xs text-gray-500">Biaya pengiriman per kilometer</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rp</span>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm text-right"
                min={0}
                required
              />
              <span className="text-sm text-gray-500">/km</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Gratis Ongkir Minimal</p>
              <p className="text-xs text-gray-500">Pembelian di atas nominal ini gratis ongkir</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rp</span>
              <input
                type="number"
                value={freeShippingMin}
                onChange={(e) => setFreeShippingMin(e.target.value)}
                className="w-28 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm text-right"
                min={0}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-50">
            <CreditCard className="h-5 w-5 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Pembayaran</h2>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#0F4C81] focus:ring-[#0F4C81]/20"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Cash on Delivery (COD)</p>
              <p className="text-xs text-gray-500">Pembayaran tunai saat barang diterima</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={transferEnabled}
              onChange={(e) => setTransferEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#0F4C81] focus:ring-[#0F4C81]/20"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Transfer Bank</p>
              <p className="text-xs text-gray-500">Pembayaran via transfer bank dengan upload bukti</p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 font-semibold px-8"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>
    </form>
  );
}