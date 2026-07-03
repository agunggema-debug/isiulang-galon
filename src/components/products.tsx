"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droplets, Flame, ShoppingCart, CheckCircle, RotateCcw, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Product data from API
interface ApiProduct {
  id: number;
  name: string;
  category: string;
  categorySlug: string;
  categoryIcon: string;
  retailPrice: number;
  wholesalePrice?: number;
  stock: number;
  unit: string;
  minWholesaleQty?: number;
}

// Product card display data
interface ProductCardData {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  features: string[];
  icon: React.ElementType;
  color: "amber" | "blue" | "green";
  unit: string;
  stock: number;
  retailPrice: number;
}

// Fallback products for when API is not available
const fallbackProducts: ProductCardData[] = [
  {
    id: 100,
    icon: RotateCcw,
    name: "Isi Ulang Air Galon",
    description: "Layanan isi ulang air galon cepat, hemat, dan higienis. Bawa galon Anda, isi ulang di tempat.",
    price: "Rp5.000",
    originalPrice: "Rp7.000",
    features: ["Hemat Biaya", "Proses Cepat", "Air Steril"],
    color: "amber",
    unit: "kali",
    stock: 999,
    retailPrice: 5000,
  },
  {
    id: 101,
    icon: Droplets,
    name: "Air Galon 19L",
    description: "Air murni steril, siap minum langsung dari sumber pegunungan terbaik.",
    price: "Rp18.000",
    originalPrice: "Rp22.000",
    features: ["Steril & Higienis", "Sumber Pegunungan", "Galon Segel"],
    color: "blue",
    unit: "galon",
    stock: 999,
    retailPrice: 18000,
  },
  {
    id: 102,
    icon: Flame,
    name: "Gas Elpiji 3kg",
    description: "Gas elpiji bersubsidi kualitas terbaik untuk kebutuhan dapur harian.",
    price: "Rp22.000",
    originalPrice: "Rp25.000",
    features: ["Bersih & Aman", "Tahan Lama", "Tabung Standar"],
    color: "green",
    unit: "tabung",
    stock: 999,
    retailPrice: 22000,
  },
  {
    id: 103,
    icon: Flame,
    name: "Gas Elpiji 5.5kg",
    description: "Gas elpiji non-subsidi untuk usaha kecil menengah yang membutuhkan pasokan lebih.",
    price: "Rp95.000",
    originalPrice: "Rp105.000",
    features: ["Non-Subsidi", "Usaha Kecil", "Pemasangan Mudah"],
    color: "green",
    unit: "tabung",
    stock: 999,
    retailPrice: 95000,
  },
  {
    id: 104,
    icon: Droplets,
    name: "Air Mineral Kemasan",
    description: "Air mineral kemasan botol praktis untuk bekal perjalanan dan aktivitas.",
    price: "Rp5.000",
    originalPrice: "Rp6.500",
    features: ["Botol 600ml", "Praktis", "Dus 24 Botol"],
    color: "blue",
    unit: "karton",
    stock: 999,
    retailPrice: 5000,
  },
];

// Cart item type
interface CartItem {
  productId: number;
  quantity: number;
}

function getCategoryIcon(categorySlug: string, categoryIcon: string): React.ElementType {
  if (categoryIcon === "Flame" || categorySlug === "gas-elpiji") return Flame;
  return Droplets;
}

function getCategoryColor(categorySlug: string): "blue" | "green" {
  return categorySlug === "gas-elpiji" ? "green" : "blue";
}

function getProductFeatures(categorySlug: string): string[] {
  switch (categorySlug) {
    case "air-galon":
      return ["Steril & Higienis", "Sumber Pegunungan", "Galon Segel"];
    case "gas-elpiji":
      return ["Bersih & Aman", "Tahan Lama", "Tabung Standar"];
    case "air-mineral":
      return ["Botol 600ml", "Praktis", "Dus 24 Botol"];
    default:
      return ["Berkualitas", "Terpercaya", "Harga Terbaik"];
  }
}

function getAccentStyles(color: "amber" | "blue" | "green") {
  if (color === "amber") {
    return {
      accentColor: "#F59E0B",
      bgColor: "bg-[#F59E0B]/5",
      hoverBg: "hover:border-[#F59E0B]/30",
      hoverShadow: "hover:shadow-[#F59E0B]/5",
    };
  }
  const isBlue = color === "blue";
  return {
    accentColor: isBlue ? "#0F4C81" : "#10B981",
    bgColor: isBlue ? "bg-[#0F4C81]/5" : "bg-[#10B981]/5",
    hoverBg: isBlue ? "hover:border-[#0F4C81]/30" : "hover:border-[#10B981]/30",
    hoverShadow: isBlue ? "hover:shadow-[#0F4C81]/5" : "hover:shadow-[#10B981]/5",
  };
}

// Get cart from localStorage
const getCartFromStorage = (): CartItem[] => {
  if (globalThis.window === undefined) return [];
  const savedCart = globalThis.window.localStorage.getItem("aquagas-cart");
  if (savedCart) {
    try {
      return JSON.parse(savedCart);
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
    }
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (cart: CartItem[]) => {
  if (globalThis.window !== undefined) {
    globalThis.window.localStorage.setItem("aquagas-cart", JSON.stringify(cart));
    // Dispatch custom event for cart updates (deferred to prevent setState during render)
    setTimeout(() => {
      globalThis.window.dispatchEvent(new Event("cartUpdated"));
    }, 0);
  }
};

function ProductCard({
  data,
  cart,
  onAddToCart,
  onUpdateQuantity,
}: Readonly<{
  data: ProductCardData;
  cart: CartItem[];
  onAddToCart: (product: ProductCardData) => void;
  onUpdateQuantity: (productId: number, delta: number) => void;
}>) {
  const { accentColor, bgColor, hoverBg, hoverShadow } = getAccentStyles(data.color);
  
  // Find if product is already in cart
  const cartItem = cart.find((item) => item.productId === data.id);
  const qty = cartItem?.quantity || 0;
  const isOutOfStock = data.stock === 0;

  return (
    <div className={`group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ${hoverBg} ${hoverShadow} hover:shadow-xl transition-all duration-300`}>
      <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <data.icon className="h-7 w-7" style={{ color: accentColor }} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{data.name}</h3>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">{data.description}</p>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold" style={{ color: accentColor }}>{data.price}</span>
        {data.originalPrice && <span className="text-sm text-gray-400 line-through">{data.originalPrice}</span>}
        <span className="text-sm text-gray-400">/{data.unit}</span>
      </div>
      <ul className="space-y-2 mb-6">
        {data.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
            {feature}
          </li>
        ))}
      </ul>
      
      {/* Quantity selector or Add button */}
      {qty > 0 ? (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
          <button
            onClick={() => onUpdateQuantity(data.id, -1)}
            className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="text-sm font-semibold text-gray-900 min-w-8 text-center">
            {qty}
          </span>
          <button
            onClick={() => {
              if (qty < data.stock) {
                onUpdateQuantity(data.id, 1);
              }
            }}
            disabled={qty >= data.stock}
            className={cn(
              "w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center transition-all",
              qty >= data.stock
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#0F4C81]/5 hover:text-[#0F4C81] hover:border-[#0F4C81]/30"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <Button
          onClick={() => onAddToCart(data)}
          variant="default"
          className="w-full font-semibold gap-2 group/btn"
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
          {isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
        </Button>
      )}
    </div>
  );
}

const getInitialCart = (): CartItem[] => {
  if (globalThis.window === undefined) return [];
  return getCartFromStorage();
};

export default function Products() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [cart, setCart] = useState<CartItem[]>(getInitialCart);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      setCart(getCartFromStorage());
    };
    globalThis.window.addEventListener("cartUpdated", handleCartUpdate);
    return () => globalThis.window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  // Fetch products from API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          const productCards: ProductCardData[] = data.products.map((p: ApiProduct) => ({
            id: p.id,
            name: p.name,
            description: `${p.category} - ${p.unit}`,
            price: `Rp ${p.retailPrice.toLocaleString()}`,
            unit: p.unit,
            stock: p.stock,
            retailPrice: p.retailPrice,
            features: getProductFeatures(p.categorySlug),
            icon: getCategoryIcon(p.categorySlug, p.categoryIcon),
            color: getCategoryColor(p.categorySlug),
          }));
          setProducts(productCards);
        } else {
          setProducts(fallbackProducts);
        }
      })
      .catch(() => {
        setProducts(fallbackProducts);
      });
  }, []);

  // Add to cart
  const addToCart = (product: ProductCardData) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, { productId: product.id, quantity: 1 }];
      }
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  // Update quantity
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      const product = products.find((p) => p.id === productId);
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

  return (
    <section id="produk" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F4C81]/5 rounded-full text-sm font-medium text-[#0F4C81] mb-6">
            <ShoppingCart className="h-4 w-4" />
            Produk Kami
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Pilihan Produk Premium
          </h2>
          <p className="text-lg text-gray-600">
            Kami menyediakan berbagai kebutuhan air dan gas berkualitas tinggi 
            dengan harga yang kompetitif.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              data={product}
              cart={cart}
              onAddToCart={addToCart}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </div>
      </div>
    </section>
  );
}