import type { Metadata } from "next";
import ShopNavbar from "@/components/shop-navbar";

export const metadata: Metadata = {
  title: "Belanja | AquaGas Premium",
  description: "Toko online AquaGas Premium - Air Galon, Gas Elpiji & Air Mineral",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <ShopNavbar />
      <main className="flex-1 pt-20">{children}</main>
    </div>
  );
}