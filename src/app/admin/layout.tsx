import type { Metadata } from "next";
import AdminSidebar from "@/components/admin-sidebar";
import { redirect } from "next/navigation";
import { getSession, initAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard Admin | Water Fresh",
  description: "Panel kontrol admin Water Fresh",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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