"use client";

import { Plus, Search, Edit, Trash2, Eye, Droplets, Flame, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  categoryIcon: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  minOrder: number;
  status: string;
  unit: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formRetailPrice, setFormRetailPrice] = useState("");
  const [formWholesalePrice, setFormWholesalePrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formMinWholesaleQty, setFormMinWholesaleQty] = useState("");
  const [formUnit, setFormUnit] = useState("unit");
  const [formStatus, setFormStatus] = useState("Tersedia");

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormCategoryId("");
    setFormRetailPrice("");
    setFormWholesalePrice("");
    setFormStock("");
    setFormMinWholesaleQty("");
    setFormUnit("unit");
    setFormStatus("Tersedia");
    setError("");
  };

  const openModalForAdd = () => {
    setEditingProduct(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openModalForEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormRetailPrice(product.retailPrice.toString());
    setFormWholesalePrice(product.wholesalePrice.toString());
    setFormStock(product.stock.toString());
    setFormMinWholesaleQty(product.minOrder.toString());
    setFormUnit(product.unit);
    setFormStatus(product.status);
    // Find category ID from category name
    const cat = categories.find((c) => c.name === product.category);
    setFormCategoryId(cat ? cat.id.toString() : "");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingProduct) {
        // UPDATE mode
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProduct.id,
            name: formName,
            retailPrice: parseFloat(formRetailPrice) || 0,
            wholesalePrice: parseFloat(formWholesalePrice) || 0,
            stock: parseInt(formStock) || 0,
            minWholesaleQty: parseInt(formMinWholesaleQty) || 1,
            unit: formUnit,
            status: formStatus,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Gagal mengupdate produk");
          setSubmitting(false);
          return;
        }

        closeModal();
        fetchProducts();
      } else {
        // CREATE mode
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            categoryId: parseInt(formCategoryId),
            retailPrice: parseFloat(formRetailPrice) || 0,
            wholesalePrice: parseFloat(formWholesalePrice) || 0,
            stock: parseInt(formStock) || 0,
            minWholesaleQty: parseInt(formMinWholesaleQty) || 1,
            unit: formUnit,
            status: formStatus,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Gagal menambahkan produk");
          setSubmitting(false);
          return;
        }

        closeModal();
        fetchProducts();
      }
    } catch {
      setError("Terjadi kesalahan server");
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${deletingProduct.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal menghapus produk");
        setDeleting(false);
        return;
      }

      setShowDeleteConfirm(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch {
      alert("Terjadi kesalahan server");
      setDeleting(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Droplets":
        return Droplets;
      case "Flame":
        return Flame;
      default:
        return Package;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
            <p className="text-sm text-gray-500 mt-1">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola semua produk AquaGas Premium
          </p>
        </div>
        <Button className="flex items-center gap-2 font-semibold" onClick={openModalForAdd}>
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
            />
          </div>
          <select className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all">
            <option>Semua Kategori</option>
            <option>Air Galon</option>
            <option>Gas Elpiji</option>
            <option>Air Mineral</option>
          </select>
          <select className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all">
            <option>Semua Status</option>
            <option>Tersedia</option>
            <option>Menipis</option>
            <option>Kosong</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Produk
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Kategori
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Harga Retail
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Harga Grosir
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Stok
                </th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Min. Grosir
                </th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const Icon = getIcon(product.categoryIcon);
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-[#0F4C81]" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        Rp {product.retailPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-[#10B981]">
                        Rp {product.wholesalePrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">
                        {product.minOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          product.status === "Tersedia"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : product.status === "Menipis"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-[#0F4C81] hover:bg-[#0F4C81]/5 transition-all">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModalForEdit(product)}
                          className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingProduct(product);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Produk */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Masukkan nama produk"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              required
              disabled={!!editingProduct}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Retail (Rp)
              </label>
              <input
                type="number"
                value={formRetailPrice}
                onChange={(e) => setFormRetailPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Grosir (Rp)
              </label>
              <input
                type="number"
                value={formWholesalePrice}
                onChange={(e) => setFormWholesalePrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok
              </label>
              <input
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min. Grosir
              </label>
              <input
                type="number"
                value={formMinWholesaleQty}
                onChange={(e) => setFormMinWholesaleQty(e.target.value)}
                placeholder="1"
                min="1"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Satuan
              </label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all"
              >
                <option value="unit">Unit</option>
                <option value="tabung">Tabung</option>
                <option value="karton">Karton</option>
                <option value="galon">Galon</option>
                <option value="botol">Botol</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 outline-none transition-all"
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Menipis">Menipis</option>
                <option value="Kosong">Kosong</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Menyimpan..."
                : editingProduct
                ? "Update Produk"
                : "Simpan Produk"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingProduct(null);
        }}
        title="Hapus Produk"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Apakah Anda yakin ingin menghapus produk{" "}
            <span className="font-semibold text-gray-900">
              {deletingProduct?.name}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeletingProduct(null);
              }}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}