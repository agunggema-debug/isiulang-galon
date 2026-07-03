"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  RotateCcw,
} from "lucide-react";

const sidebarLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Produk",
    icon: Package,
  },
  {
    href: "/admin/orders",
    label: "Pesanan",
    icon: ShoppingCart,
  },
  {
    href: "/admin/stock",
    label: "Stok",
    icon: Warehouse,
  },
  {
    href: "/admin/refill",
    label: "Isi Ulang",
    icon: RotateCcw,
  },
  {
    href: "/admin/users",
    label: "Pengguna",
    icon: Users,
  },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      console.error("Logout failed");
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-100 shadow-sm z-40 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link href="/" className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          <div className="relative flex items-center flex-shrink-0">
            <Droplets className="h-6 w-6 text-[#0F4C81]" />
            <Flame className="h-4 w-4 text-[#10B981] -ml-1" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              <span className="text-[#0F4C81]">Aqua</span>
              <span className="text-[#10B981]">Gas</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-lg text-gray-400 hover:text-[#0F4C81] hover:bg-gray-100 transition-all",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Collapse toggle for collapsed state */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute -right-3 top-16 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-all"
        >
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-[#0F4C81]/10 text-[#0F4C81]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#0F4C81]",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? link.label : undefined}
            >
              <link.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-[#0F4C81]" : "text-gray-400 group-hover:text-[#0F4C81]")} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Keluar" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}