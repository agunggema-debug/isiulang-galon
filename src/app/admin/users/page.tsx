"use client";

import { Metadata } from "next";
import { Search, UserRound, Shield, Store, BadgeCheck, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  address: string;
  createdAt: string;
}

const roleIcons: Record<string, React.ElementType> = {
  admin: Shield,
  wholesale: Store,
  retail: UserRound,
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  wholesale: "Grosir",
  retail: "Retail",
};

const roleColors: Record<string, string> = {
  admin: "bg-[#0F4C81]/10 text-[#0F4C81]",
  wholesale: "bg-purple-50 text-purple-600",
  retail: "bg-gray-50 text-gray-600",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
            <p className="text-sm text-gray-500 mt-1">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const wholesaleCount = users.filter((u) => u.role === "wholesale").length;
  const retailCount = users.filter((u) => u.role === "retail").length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola semua pengguna dan mitra AquaGas Premium
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Pengguna</p>
          <p className="text-xl font-bold text-gray-900">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Admin</p>
          <p className="text-xl font-bold text-[#0F4C81]">{adminCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Mitra Grosir</p>
          <p className="text-xl font-bold text-purple-600">{wholesaleCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">Pelanggan Retail</p>
          <p className="text-xl font-bold text-[#10B981]">{retailCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
            />
          </div>
          <select className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all">
            <option>Semua Peran</option>
            <option>Admin</option>
            <option>Grosir</option>
            <option>Retail</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Pengguna</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Peran</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Telepon</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Bergabung</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length > 0 ? (
                users.map((user) => {
                  const RoleIcon = roleIcons[user.role] || UserRound;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0F4C81]/10 flex items-center justify-center">
                            <RoleIcon className="h-5 w-5 text-[#0F4C81]" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            {user.role === "admin" && (
                              <BadgeCheck className="h-3.5 w-3.5 text-[#0F4C81] inline ml-1" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[user.role] || "bg-gray-50 text-gray-600"}`}>
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{user.phone || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-[#0F4C81] hover:bg-[#0F4C81]/5 transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Belum ada pengguna
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}