````markdown
# IsiUlang- Galon - E-Commerce Platform

Platform e-commerce modern untuk pemesanan air galon murni, gas elpiji, dan air mineral kemasan. Dibangun dengan Next.js dan siap untuk di-deploy ke Netlify + Supabase.

## Fitur Utama

- 🛍️ **Katalog Produk** - Air Galon, Gas Elpiji (3kg, 5.5kg, 12kg), Air Mineral, dan Layanan Isi Ulang
- 👥 **Multi-role Access** - Admin, Wholesale (Grosir), dan Retail (Eceran) dengan hak akses berbeda
- 💰 **Harga Dinamis** - Harga retail dan wholesale terpisah dengan minimum order quantity
- 🛒 **Keranjang Belanja** - Fitur cart dengan kalkulasi otomatis
- 📦 **Manajemen Stok** - Update stok real-time dengan status produk (Tersedia, Menipis, Kosong)
- 📊 **Dashboard Admin** - Panel kontrol lengkap untuk manajemen produk, pesanan, dan pengguna

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, Shadcn/UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Netlify
- **Development:** SQLite (untuk development lokal)

## Development

### Prerequisites

- Node.js 18+
- npm atau pnpm

### Setup Lokal

1. **Install dependencies**
   ```bash
   npm install
   ```
````

2. **Jalankan development server**

   ```bash
   npm run dev
   ```

3. Buka <http://localhost:3000>

> **Catatan:** Mode development menggunakan SQLite secara otomatis tanpa konfigurasi Supabase.

## Production Deployment

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap deploy ke Netlify + Supabase.

## Environment Variables

Buat file `.env.local` berdasarkan `.env.local.example`:

```bash
# Supabase Configuration (production)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Struktur Proyek

```javascript
src/
├── app/
│   ├── api/          # API routes
│   ├── admin/        # Admin dashboard
│   └── shop/         # Shop pages
├── lib/
│   ├── database.ts   # Database layer
│   ├── auth.ts       # Auth utilities
│   ├── supabase.ts   # Supabase client
│   └── types.ts      # TypeScript types
└── components/       # UI components
```

## Lisensi

© 2026 AquaGas Premium. All rights reserved.
