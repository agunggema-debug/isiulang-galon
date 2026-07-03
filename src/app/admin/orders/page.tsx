import { Metadata } from "next";
import OrdersClient from "./orders-client";

export const metadata: Metadata = {
  title: "Pesanan | AquaGas Premium",
  description: "Manajemen pesanan AquaGas Premium",
};

export default function AdminOrders() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <OrdersClient />
    </div>
  );
}