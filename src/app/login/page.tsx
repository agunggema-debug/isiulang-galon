"use client";
import { Button } from "@/components/ui/button";
import { Droplets, Flame, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }

      // Redirect based on role - replace so back button doesn't go to login
      router.replace(data.redirectUrl);
    } catch {
      setError("Terjadi kesalahan koneksi");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0F4C81]/5 via-white to-[#10B981]/5 flex items-center justify-center p-4">
      {/* Back to Home */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-500 hover:text-[#0F4C81] transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      {/* Login Card */}
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
                <span className="text-[#0F4C81]">Water</span>
                <span className="text-[#10B981]">Fress</span>
                <span className="text-[#0F4C81]"> .</span>
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang Kembali</h1>
            <p className="text-gray-500">Masuk ke akun Anda untuk melanjutkan</p>
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0F4C81] focus:ring-[#0F4C81]/20" />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>
              <button type="button" className="text-sm text-[#0F4C81] hover:underline bg-transparent border-none p-0 cursor-pointer">
                Lupa kata sandi?
              </button>
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link href="/register" className="text-[#0F4C81] font-medium hover:underline">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
