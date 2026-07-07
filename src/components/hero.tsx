"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Droplets, Flame, ArrowRight, Shield, Truck, Clock, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  categorySlug: string;
  retailPrice: number;
  stock: number;
  unit: string;
}

interface Settings {
  [key: string]: string;
}

export default function Hero() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, settingsRes] = await Promise.all([fetch("/api/products"), fetch("/api/settings")]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.products || []);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData.settings || {});
        }
      } catch (error) {
        console.error("Failed to fetch hero data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Find products by category
  const refillProduct = products.find((p) => p.categorySlug === "refill");
  const waterProduct = products.find((p) => p.categorySlug === "air-galon");
  const gasProduct = products.find((p) => p.categorySlug === "gas-elpiji");

  // Use settings if available, otherwise use product prices, otherwise fallback
  const refillPrice = settings.refill_price ? parseInt(settings.refill_price) : refillProduct?.retailPrice || 6000;
  const waterPrice = settings.water_price ? parseInt(settings.water_price) : waterProduct?.retailPrice || 18000;
  const gasPrice = settings.gas_price ? parseInt(settings.gas_price) : gasProduct?.retailPrice || 22000;

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `Rp${(price / 1000).toFixed(0)}K`;
    }
    return `Rp${price}`;
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0F4C81]/5 via-white to-[#10B981]/5">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#0F4C81]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#10B981]/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0F4C81]/3 to-[#10B981]/3 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 rounded-full text-sm font-medium text-[#10B981]">
              <Shield className="h-4 w-4" />
              Terpercaya & Higienis
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span className="text-gray-900">Kebutuhan Air & Gas </span>
              <span className="text-[#0F4C81]">Premium</span>
              <br />
              <span className="text-gray-900">Antar ke </span>
              <span className="text-[#10B981]">Rumah Anda</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
              Nikmati kemudahan pemesanan air galon murni dan gas elpiji berkualitas tinggi dengan layanan antar cepat dan harga terbaik. Higienis, terpercaya, dan selalu tepat waktu.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#produk">
                <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 group">
                  Pesan Sekarang
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#tentang">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-100">
              <div>
                <div className="text-2xl font-bold text-[#0F4C81]">500+</div>
                <div className="text-sm text-gray-500 mt-1">Pelanggan Aktif</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#10B981]">1.000+</div>
                <div className="text-sm text-gray-500 mt-1">Pesanan Terkirim</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0F4C81]">99%</div>
                <div className="text-sm text-gray-500 mt-1">Tepat Waktu</div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Cards */}
          <div className="relative lg:pl-8">
            <div className="grid gap-6">
              {/* Refill Card */}
              <div className="group relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-[#F59E0B]/5 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <RotateCcw className="h-7 w-7 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Isi Ulang Air Galon</h3>
                    <p className="text-sm text-gray-500">Hemat · Cepat · Mudah</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-lg font-bold text-[#F59E0B]">{loading ? <span className="animate-pulse">...</span> : formatPrice(refillPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Water Card */}
              <div className="group relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-[#0F4C81]/5 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#0F4C81]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Droplets className="h-7 w-7 text-[#0F4C81]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Air Galon Murni</h3>
                    <p className="text-sm text-gray-500">19L · Steril · Siap Minum</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-lg font-bold text-[#0F4C81]">{loading ? <span className="animate-pulse">...</span> : formatPrice(waterPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Gas Card */}
              <div className="group relative bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-[#10B981]/5 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#10B981]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Flame className="h-7 w-7 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gas Elpiji 3kg</h3>
                    <p className="text-sm text-gray-500">Bersih · Aman · Bersubsidi</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-lg font-bold text-[#10B981]">{loading ? <span className="animate-pulse">...</span> : formatPrice(gasPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-3 bg-white/80 rounded-xl p-4 border border-gray-100">
                  <Truck className="h-5 w-5 text-[#0F4C81]" />
                  <span className="text-sm font-medium text-gray-700">Gratis Ongkir</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 rounded-xl p-4 border border-gray-100">
                  <Clock className="h-5 w-5 text-[#10B981]" />
                  <span className="text-sm font-medium text-gray-700">Siap 24 Jam</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
