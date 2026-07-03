"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  Flame,
  Package,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Weight,
  CheckCircle,
  AlertTriangle,
  X,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Types
type UserRole = "retail" | "wholesale";
type Category = "all" | "air-galon" | "gas-elpiji" | "air-mineral";

interface Product {
  id: number;
  name: string;
  category: Category;
  icon: React.ElementType;
  retailPrice: number;
  wholesalePrice: number;
  unit: string;
  minWholesaleQty: number;
  stock: number;
  weight: number;
  description: string;
}

interface CartItem {
  productId: number;
  quantity: number;
}

interface Notification {
  type: "success" | "warning" | "info";
  message: string;
}

// Product Data
const products: Product[] = [
  {
    id: 1,
    name: "Galon Aqua 19L",
    category: "air-galon",
    icon: Droplets,
    retailPrice: 21000,
    wholesalePrice: 18000,
    unit: "galon",
    minWholesaleQty: 10,
    stock: 45,
    weight: 19,
    description: "Air galon murni Aqua 19 liter, higienis dan siap minum.",
  },
  {
    id: 2,
    name: "Galon Le Minerale 19L",
    category: "air-galon",
    icon: Droplets,
    retailPrice: 20000,
    wholesalePrice: 17000,
    unit: "galon",
    minWholesaleQty: 10,
    stock: 30,
    weight: 19,
    description: "Air galon Le Minerale 19 liter, kesegaran alami pegunungan.",
  },
  {
    id: 3,
    name: "Galon VIT 19L",
    category: "air-galon",
    icon: Droplets,
    retailPrice: 19000,
    wholesalePrice: 16000,
    unit: "galon",
    minWholesaleQty: 10,
    stock: 20,
    weight: 19,
    description: "Air galon VIT 19 liter, murni dan terjangkau.",
  },
  {
    id: 4,
    name: "Gas Elpiji 3kg",
    category: "gas-elpiji",
    icon: Flame,
    retailPrice: 18000,
    wholesalePrice: 15500,
    unit: "tabung",
    minWholesaleQty: 5,
    stock: 22,
    weight: 3,
    description: "Gas Elpiji 3kg melon, cocok untuk rumah tangga.",
  },
  {
    id: 5,
    name: "Gas Elpiji 5.5kg",
    category: "gas-elpiji",
    icon: Flame,
    retailPrice: 95000,
    wholesalePrice: 88000,
    unit: "tabung",
    minWholesaleQty: 5,
    stock: 15,
    weight: 5.5,
    description: "Gas Elpiji 5.5kg Bright Gas untuk usaha kecil.",
  },
  {
    id: 6,
    name: "Gas Elpiji 12kg",
    category: "gas-elpiji",
    icon: Flame,
    retailPrice: 190000,
    wholesalePrice: 175000,
    unit: "tabung",
    minWholesaleQty: 5,
    stock: 8,
    weight: 12,
    description: "Gas Elpiji 12kg untuk kebutuhan komersial.",
  },
  {
    id: 7,
    name: "Air Mineral 600ml (Karton)",
    category: "air-mineral",
    icon: Package,
    retailPrice: 35000,
    wholesalePrice: 30000,
    unit: "karton",
    minWholesaleQty: 10,
    stock: 30,
    weight: 14.4,
    description: "Air mineral kemasan 600ml, 24 botol per karton.",
  },
  {
    id: 8,
    name: "Air Mineral 1500ml (Karton)",
    category: "air-mineral",
    icon: Package,
    retailPrice: 45000,
    wholesalePrice: 38000,
    unit: "karton",
    minWholesaleQty: 10,
    stock: 5,
    weight: 18,
    description: "Air mineral kemasan 1500ml, 12 botol per karton.",
  },
  {
    id: 9,
    name: "Air Mineral 330ml (Karton)",
    category: "air-mineral",
    icon: Package,
    retailPrice: 30000,
    wholesalePrice: 25000,
    unit: "karton",
    minWholesaleQty: 10,
    stock: 25,
    weight: 7.9,
    description: "Air mineral kemasan 330ml, 24 botol per karton.",
  },
];

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [userRole, setUserRole] = useState<UserRole>("retail");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    // Load cart from localStorage
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("aquagas-cart");
      if (savedCart) {
        try {
          // Defer state update to prevent cascading renders
          setTimeout(() => {
            setCart(JSON.parse(savedCart));
          }, 0);
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aquagas-cart", JSON.stringify(cart));
      // Dispatch custom event for cart updates (deferred to prevent setState during render)
      setTimeout(() => {
        window.dispatchEvent(new Event("cartUpdated"));
      }, 0);
    }
  }, [cart]);

  useEffect(() => {
    // Record visitor (non-blocking)
    fetch("/api/admin/dashboard/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
    }).catch(() => {}); // Ignore errors for visitor tracking

    // Check session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          // Set role from URL param or user's actual role
          if (roleParam === "wholesale" || data.user.role === "wholesale") {
            setUserRole("wholesale");
          } else {
            setUserRole("retail");
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push("/login");
      });
  }, [roleParam, router]);

  const isWholesale = userRole === "wholesale";

  // Filter products by category
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

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

  // Calculate price based on role and quantity
  const getPrice = (product: Product, quantity: number) => {
    if (isWholesale && quantity >= product.minWholesaleQty) {
      return product.wholesalePrice;
    }
    return product.retailPrice;
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + getPrice(item.product, item.quantity) * item.quantity;
  }, 0);

  // Calculate total weight
  const totalWeight = cartItems.reduce(
    (sum, item) => sum + item.product.weight * item.quantity,
    0
  );

  // Add to cart
  const addToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    const product = getProduct(productId);
    showNotification("success", `${product?.name} ditambahkan ke keranjang!`);
  };

  // Update quantity
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      const newCart = prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);
      return newCart;
    });
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    const product = getProduct(productId);
    showNotification("info", `${product?.name} dihapus dari keranjang.`);
  };

  // Show notification
  const showNotification = (type: Notification["type"], message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Check wholesale constraints
  const wholesaleViolations = cartItems
    .filter((item) => isWholesale && item.quantity < item.product.minWholesaleQty)
    .map(
      (item) =>
        `${item.product.name} (min. ${item.product.minWholesaleQty} ${item.product.unit})`
    );

  const canCheckout =
    cartItems.length > 0 && (!isWholesale || wholesaleViolations.length === 0);

  // Category tabs
  const categories: { id: Category; label: string; icon: React.ElementType }[] = [
    { id: "all", label: "Semua", icon: Package },
    { id: "air-galon", label: "Air Galon", icon: Droplets },
    { id: "gas-elpiji", label: "Gas Elpiji", icon: Flame },
    { id: "air-mineral", label: "Air Mineral", icon: Package },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  // Determine notification style based on type
  const getNotificationStyle = (type: Notification["type"]) => {
    if (type === "success") {
      return "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]";
    }
    if (type === "warning") {
      return "bg-amber-50 border-amber-200 text-amber-600";
    }
    return "bg-blue-50 border-blue-200 text-blue-600";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-24 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all animate-in slide-in-from-top ${getNotificationStyle(notification.type)}`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
<div>
          <h1 className="text-2xl font-bold text-gray-900">Katalog Produk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pesan kebutuhan air galon dan gas elpiji Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setUserRole("retail")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isWholesale === false
                  ? "bg-[#0F4C81] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#0F4C81]"
              }`}
            >
              Retail
            </button>
            <button
              onClick={() => setUserRole("wholesale")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isWholesale
                  ? "bg-[#10B981] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#10B981]"
              }`}
            >
              Grosir
            </button>
          </div>
        </div>
      </div>

      {/* Wholesale Info Banner */}
      {isWholesale && (
        <div className="bg-linear-to-r from-[#10B981]/5 to-[#0F4C81]/5 border border-[#10B981]/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Zap className="h-5 w-5 text-[#10B981]" />
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-[#10B981]">Mode Grosir Aktif!</span> Anda menikmati
            harga khusus grosir. Minimum pembelian per produk akan diterapkan saat checkout.
          </p>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-[#0F4C81] text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#0F4C81]/30 hover:text-[#0F4C81]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Content: Product Grid + Cart Sidebar */}
      <div className="flex gap-6">
        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((c) => c.productId === product.id);
              const qty = cartItem?.quantity || 0;
              const currentPrice = getPrice(product, qty);
              const isLowStock = product.stock <= 10;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  {/* Product Icon */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        product.category === "gas-elpiji"
                          ? "bg-[#10B981]/10"
                          : "bg-[#0F4C81]/10"
                      }`}>
                        <product.icon className={`h-6 w-6 ${
                          product.category === "gas-elpiji"
                            ? "text-[#10B981]"
                            : "text-[#0F4C81]"
                        }`} />
                      </div>
                      {isLowStock && (
                        <span className="text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          Sisa {product.stock}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="px-5 pb-5">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        Rp {currentPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">/{product.unit}</span>
                    </div>

                    {/* Wholesale price hint */}
                    {isWholesale && (
                      <p className="text-[11px] text-[#10B981] mb-2">
                        Harga grosir mulai Rp {product.wholesalePrice.toLocaleString()} (min. {product.minWholesaleQty} {product.unit})
                      </p>
                    )}

                    {/* Quantity selector or Add button */}
                    {qty > 0 ? (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 min-w-8 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => {
                            if (qty < product.stock) {
                              updateQuantity(product.id, 1);
                            } else {
                              showNotification("warning", "Stok tidak mencukupi!");
                            }
                          }}
                          className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#0F4C81]/5 hover:text-[#0F4C81] hover:border-[#0F4C81]/30 transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => addToCart(product.id)}
                        variant={product.category === "gas-elpiji" ? "secondary" : "default"}
                        className="w-full font-semibold text-sm group"
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        {product.stock === 0 ? "Stok Habis" : "Tambah"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#0F4C81]" />
                  <h3 className="font-semibold text-gray-900">Keranjang</h3>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {cartItems.length} item
                </span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Keranjang masih kosong</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Tambahkan produk untuk memulai
                  </p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const price = getPrice(item.product, item.quantity);
                  return (
                    <div
                      key={item.productId}
                      className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <item.product.icon className="h-4 w-4 text-[#0F4C81]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            <span className="text-xs font-semibold text-gray-900 w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                if (item.quantity < item.product.stock) {
                                  updateQuantity(item.productId, 1);
                                }
                              }}
                              className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-[#0F4C81]/5 hover:text-[#0F4C81] transition-all"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          </div>
                          <span className="text-xs font-semibold text-gray-900">
                            Rp {(price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        {/* Wholesale warning */}
                        {isWholesale && item.quantity < item.product.minWholesaleQty && (
                          <p className="text-[10px] text-amber-500 mt-1">
                            Min. {item.product.minWholesaleQty} {item.product.unit}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                {/* Weight info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Weight className="h-3.5 w-3.5" />
                    Total Berat
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {totalWeight.toFixed(1)} kg
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-bold text-gray-900">
                    Rp {subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Wholesale violations */}
                {wholesaleViolations.length > 0 && (
                  <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-700 mb-1">
                          Minimum grosir belum terpenuhi:
                        </p>
                        <ul className="text-[11px] text-amber-600 space-y-0.5">
                          {wholesaleViolations.map((v, i) => (
                            <li key={i}>• {v}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full font-semibold"
                  disabled={!canCheckout}
                >
                  {cartItems.length === 0
                    ? "Keranjang Kosong"
                    : `Bayar Rp ${subtotal.toLocaleString()}`}
                </Button>

                {/* Shipping estimate */}
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  *Estimasi biaya kirim Rp 25.000 (5km)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Cart FAB */}
      {cartItems.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#0F4C81] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-[#0F4C81]/90 transition-all active:scale-95"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] text-white text-xs font-bold flex items-center justify-center">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      )}

      {/* Mobile Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Keranjang ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cartItems.map((item) => {
                const price = getPrice(item.product, item.quantity);
                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <item.product.icon className="h-5 w-5 text-[#0F4C81]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-semibold text-gray-900 w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (item.quantity < item.product.stock) {
                                updateQuantity(item.productId, 1);
                              }
                            }}
                            className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-[#0F4C81]/5 hover:text-[#0F4C81] transition-all"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          Rp {(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      {isWholesale && item.quantity < item.product.minWholesaleQty && (
                        <p className="text-[11px] text-amber-500 mt-1">
                          Min. {item.product.minWholesaleQty} {item.product.unit}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-900">
                  Rp {subtotal.toLocaleString()}
                </span>
              </div>

              {/* Wholesale violations */}
              {wholesaleViolations.length > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Minimum grosir belum terpenuhi untuk beberapa produk
                    </p>
                  </div>
                </div>
              )}

              <Button
                className="w-full font-semibold py-3"
                disabled={!canCheckout}
                onClick={() => setShowCart(false)}
                size="lg"
              >
                {canCheckout
                  ? `Bayar Rp ${subtotal.toLocaleString()}`
                  : "Penuhi Minimum Grosir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}