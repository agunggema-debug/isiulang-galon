import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold text-[#0F4C81] mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#0F4C81] text-white rounded-lg font-semibold hover:bg-[#0a3d6b] transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}