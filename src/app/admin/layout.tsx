import type { Metadata } from "next";
import AdminSidebar from "@/components/admin-sidebar";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { initDatabase } from "@/lib/database";
import { initAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard Admin | AquaGas Premium",
  description: "Panel kontrol admin AquaGas Premium",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize database on first load
  initDatabase();
  initAuth();

  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar user={session.user} />
      <main className="flex-1 ml-64 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}