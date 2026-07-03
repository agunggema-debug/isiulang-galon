"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartItem {
  productId: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  categorySlug: string;
  categoryIcon: string;
  retailPrice: number;
  wholesalePrice?: number;
  stock: number;
  unit: string;
}

interface GuestCartWrapperProps {
  onClose: () => void;
  onCheckout?: () => void;
}

const getInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const savedCart = localStorage.getItem("aquagas-cart");
  if (savedCart) {
    try {
      return JSON.parse(savedCart);
    } catch (e) {
      console.error("Failed to parse cart", e);
    }
  }
  return [];
};

export default function GuestCartWrapper({ onClose, onCheckout }: GuestCartWrapperProps) {
  const [cart, setCart] = useState<CartItem[]>(getInitialCart);
  const [products, setProducts] = useState<Product[]>([]);

  // Save cart to localStorage
  const saveCartToStorage = (newCart: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aquagas-cart", JSON.stringify(newCart));
      // Dispatch custom event for cart updates (deferred to prevent setState during render)
      setTimeout(() => {
        window.dispatchEvent(new Event("cartUpdated"));
      }, 0);
    }
  };

  // Fetch products from API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch(() => {});
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      setCart(JSON.parse(localStorage.getItem("aquagas-cart") || "[]"));
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  // Get product by ID
  const getProduct = (id: number) => products.find((p) => p.id === id);

  // Get cart items with full product data
  const cartItems = cart
    .map((item) => {
      const product = getProduct(item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter(Boolean) as (CartItem & { product: Product })[];

  // Add to cart
  const addToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, { productId, quantity: 1 }];
      }
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  // Update quantity
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      const product = getProduct(productId);
      const maxStock = product?.stock || 999;
      
      const newCart = prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, Math.min(maxStock, item.quantity + delta)) }
            : item
        )
        .filter((item) => item.quantity > 0);
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const newCart = prev.filter((item) => item.productId !== productId);
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  // Get total items count
  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Get total price
  const getTotalPrice = () => {
    return cart.reduce((sum, item) => {
      const product = getProduct(item.productId);
      if (product) {
        return sum + product.retailPrice * item.quantity;
      }
      return sum;
    }, 0);
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-label="Close cart"
      />
    
      {/* Cart Sidebar */}
      <div className="fixed top-0 right-0 z-50 h-full w-96 bg-white shadow-2xl border-l border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#0F4C81]" />
            <h2 className="text-lg font-semibold text-gray-900">Keranjang Belanja</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="h-14 w-14 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">Keranjang masih kosong</p>
              <p className="text-xs text-gray-400">Tambahkan produk untuk memulai</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const product = item.product;
              const maxStock = product.stock;
              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rp {product.retailPrice.toLocaleString()} / {product.unit}
                    </p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-semibold text-gray-900 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity < maxStock) {
                            updateQuantity(product.id, 1);
                          }
                        }}
                        disabled={item.quantity >= maxStock}
                        className={cn(
                          "w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center transition-all",
                          item.quantity >= maxStock
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-[#0F4C81]/5 hover:text-[#0F4C81] hover:border-[#0F4C81]/30"
                        )}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total Price */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      Rp {(product.retailPrice * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-xs text-gray-400 hover:text-red-500 mt-1"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total ({getTotalItems()} item)</span>
              <span className="text-lg font-bold text-gray-900">
                Rp {getTotalPrice().toLocaleString()}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-[#0F4C81] text-white font-semibold text-sm hover:bg-[#0a3d6b] transition-colors"
            >
              <span>Lanjut ke Checkout</span>
              <ExternalLink className="h-4 w-4" />
            </button>
            <p className="text-xs text-gray-400 text-center">
              *Login diperlukan untuk melanjutkan pemesanan
            </p>
          </div>
        )}
      </div>
    </>
  );
}