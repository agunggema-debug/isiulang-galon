"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

export default function CartButton({ onClick }: Readonly<{ onClick: () => void }>) {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = localStorage.getItem("aquagas-cart");
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          const count = cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
          setItemCount(count);
        }
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    };

    // Initial load
    updateCartCount();

    // Listen for storage changes
    globalThis.window.addEventListener("storage", updateCartCount);

    // Custom event for same-tab updates
    globalThis.window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      globalThis.window.removeEventListener("storage", updateCartCount);
      globalThis.window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg text-gray-600 hover:text-[#0F4C81] hover:bg-gray-50 transition-colors"
      aria-label="Buka keranjang"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] text-white text-xs font-bold flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}