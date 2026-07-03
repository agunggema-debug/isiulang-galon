"use client";

import { Button } from "@/components/ui/button";
import { Droplets, Flame, Mail, Lock, User, Phone, MapPin, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/login-modal";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Nama, email, dan password harus diisi");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrasi gagal");
        setLoading(false);
        return;
      }

      router.replace(data.redirectUrl);
    } catch {
      setError("Terjadi kesalahan koneksi");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0F4C81]/5 via-white to-[#10B981]/5 flex items-center justify-center p-4">
        {/* Back to Home */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-500 hover:text-[#0F4C81] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>

        {/* Register Card */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Droplets className="h-7 w-7 text-[#0F4C81]" />
                  <Flame className="h-5 w-5 text-[#10B981] -ml-1" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-[#0F4C81]">Aqua</span>
                  <span className="text-[#10B981]">Gas</span>
                  <span className="text-[#0F4C81]"> Premium</span>
                </span>
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Buat Akun Baru
              </h1>
              <p className="text-gray-500">
                Daftar untuk mulai berbelanja
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  No. Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xx-xxxx-xxxx"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Alamat
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Alamat lengkap"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={loading}>
                {loading ? "Mendaftar..." : "Daftar"}
              </Button>
            </form>

            {/* Switch to Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="text-[#0F4C81] font-medium hover:underline"
                  disabled={loading}
                >
                  Masuk Sekarang
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
}