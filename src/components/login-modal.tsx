"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Droplets, Flame, Mail, Lock, X, AlertCircle } from "lucide-react";
import RegisterModal from "./register-modal";
import { useAuth } from "@/contexts/auth-context";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleCloseRegister = () => setShowRegister(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Refresh auth session to update user state in context
      await refreshSession();
      setLoading(false);
      onClose();
      router.replace(data.redirectUrl);
    } catch {
      setError("Terjadi kesalahan koneksi");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <X className="h-5 w-5" />
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Droplets className="h-7 w-7 text-[#0F4C81]" />
                  <Flame className="h-5 w-5 text-[#10B981] -ml-1" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-[#0F4C81]">Water</span>
                  <span className="text-[#10B981]">Fresh</span>
                  <span className="text-[#0F4C81]"> .</span>
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Selamat Datang Kembali</h2>
              <p className="text-sm text-gray-500">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="modal-email"
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
                <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    id="modal-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{" "}
                <button type="button" onClick={() => setShowRegister(true)} className="text-[#0F4C81] font-medium hover:underline" disabled={loading}>
                  Daftar Sekarang
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <RegisterModal isOpen={showRegister} onClose={handleCloseRegister} onSwitchToLogin={() => setShowRegister(false)} />
    </>
  );
}
