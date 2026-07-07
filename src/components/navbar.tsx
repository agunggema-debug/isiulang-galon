"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import CartButton from "./cart-button";
import { useAuth } from "@/contexts/auth-context";

const LoginModal = dynamic(() => import("@/components/login-modal"), {
  loading: () => null,
});

const GuestCartWrapper = dynamic(() => import("./guest-cart-wrapper"), {
  loading: () => null,
});

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "#produk", label: "Produk" },
  { href: "#tentang", label: "Tentang" },
  { href: "#kontak", label: "Kontak" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [storeName, setStoreName] = useState("Water Fresh");
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.store_name) {
          setStoreName(data.settings.store_name);
        }
      })
      .catch(() => {});
  }, []);

  // Get role label in Indonesian
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "wholesale":
        return "Grosir";
      case "retail":
        return "Pelanggan";
      default:
        return "User";
    }
  };

  return (
    <>
      <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent")}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="h-9 w-auto"
                priority
              />
              <span className="text-xl font-bold tracking-tight">
                <span className="text-[#0F4C81]"> {storeName.replace("AquaGas", "")}</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-[#0F4C81] transition-colors duration-200">
                  {link.label}
                </Link>
              ))}
              <CartButton onClick={() => setIsCartOpen(true)} />
              {!authLoading && user ? (
                <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-[#10B981]" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500">{getRoleLabel(user.role)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="font-semibold text-gray-600 hover:text-red-600" onClick={handleLogout}>
                    Keluar
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" className="font-semibold" onClick={() => setIsLoginOpen(true)}>
                  Masuk
                </Button>
              )}
            </div>

            {/* Mobile Menu Button & Cart */}
            <div className="flex items-center gap-2 md:hidden">
              <CartButton onClick={() => setIsCartOpen(true)} />
              {!authLoading && user && (
                <div className="flex items-center gap-2 pr-2 border-r border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-[#10B981]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-gray-900">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
              )}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:text-[#0F4C81] transition-colors" aria-label="Toggle menu">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#0F4C81] hover:bg-gray-50 rounded-lg transition-colors duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {!authLoading && user && (
                <div className="px-3">
                  <Button
                    variant="ghost"
                    className="w-full font-semibold text-red-600 hover:text-red-700"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Keluar
                  </Button>
                </div>
              )}
              {!authLoading && !user && (
                <div className="pt-2 px-3">
                  <Button
                    variant="default"
                    className="w-full font-semibold"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginOpen(true);
                    }}
                  >
                    Masuk
                  </Button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

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
    </>
  );
}
