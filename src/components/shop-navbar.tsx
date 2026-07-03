"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Droplets, Flame, ShoppingCart, User, Search, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import CartButton from "./cart-button";

const LoginModal = dynamic(() => import("./login-modal"), {
  loading: () => null,
});

const GuestCartWrapper = dynamic(() => import("./guest-cart-wrapper"), {
  loading: () => null,
});

export default function ShopNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Get role label in Indonesian
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "wholesale": return "Grosir";
      case "retail": return "Pelanggan";
      default: return "User";
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/shop" className="flex items-center gap-2 group">
              <div className="relative flex items-center">
                <Droplets className="h-7 w-7 text-[#0F4C81]" />
                <Flame className="h-5 w-5 text-[#10B981] -ml-1" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-[#0F4C81]">Aqua</span>
                <span className="text-[#10B981]">Gas</span>
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk air galon, gas, atau air mineral..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-4">
              {/* Cart Button */}
              <CartButton onClick={() => setIsCartOpen(true)} />

              {/* User Menu */}
              {!authLoading && user && (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-[#10B981]" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500">{getRoleLabel(user.role)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-[#0F4C81] transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#0F4C81] outline-none transition-all text-sm"
                />
              </div>

              {/* Mobile User Info */}
              {!authLoading && user && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </Button>
                </div>
              )}

              {/* Mobile Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center justify-between p-3 bg-[#0F4C81]/5 rounded-xl w-full"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-[#0F4C81]" />
                  <span className="text-sm font-medium text-gray-900">Keranjang</span>
                </div>
                <span className="text-sm font-bold text-[#0F4C81]">Buka</span>
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Cart Sidebar - Only rendered on client */}
      {isCartOpen && (
        <GuestCartWrapper 
          onClose={() => setIsCartOpen(false)} 
          onCheckout={() => {
            setIsCartOpen(false);
            setIsLoginOpen(true);
          }}
        />
      )}
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
