# NUSAVA — Marketplace Oleh-Oleh & Karya Asli Nusantara

**NUSAVA** (*Satu Indonesia, Banyak Cerita*) adalah platform *e-commerce marketplace* modern yang menghubungkan pecinta kuliner dan kriya dengan toko resmi produsen oleh-oleh khas daerah di seluruh Indonesia (Yogyakarta, Bali, Surabaya, Bandung, Aceh, Solo, Medan, Palembang, dll.).

Project ini dibangun menggunakan arsitektur **Full-Stack TypeScript Monorepo** dengan standar pengalaman belanja setara *marketplace* modern (Tokopedia, Blibli, Shopee).

---

## ✨ Fitur Utama

### 🛒 Pengalaman Belanja & Katalog
- **Eksplorasi Berdasarkan Daerah & Kategori**: Filter produk responsif (Mobile Drawer & Desktop Bar) berdasarkan kategori (Kudapan Khas, Kopi & Minuman, Batik & Wastra, Kriya, Sambal) dan kota asal.
- **Official Store & Toko Pilihan Daerah**: Profil toko resmi terverifikasi lengkap dengan informasi daerah asal, rating, statistik penjualan, dan jam operasional.
- **Flash Sale Harian**: Sistem hitung mundur (*live countdown*) dengan indikator stok real-time.
- **Pencarian Instan (*Live Search*)**: Rekomendasi produk langsung dari bilah navigasi.

### 🎁 Sistem Poin Rewards, Voucher & Hampers
- **NUSAVA Poin & Rewards**: Member memperoleh *Cashback Poin 2%* dari setiap pesanan dan dapat menukarkan saldo poin langsung sebagai potongan tagihan saat checkout.
- **Klaim Voucher & Kupon**: Mendukung kode kupon diskon persentase (`NUSANTARA`), potongan nominal (`OLEHOLEH10`), dan subsidi bebas ongkir (`ONGKIRGRATIS`).
- **Kemas Hampers & Dropshipper**: Opsi kemasan eksklusif (*Besek Bambu Tradisional* atau *Hardbox*) dengan kartu ucapan kustom serta fitur kirim sebagai *dropshipper* (sembunyikan harga pada label paket).

### 🚚 Checkout Domisili Bertingkat & Ekspedisi
- **Cascading Domicile Dropdown**: Pilihan berjenjang *Provinsi → Kota/Kabupaten → Kecamatan* yang otomatis mengisi kode pos dan menghitung ulang tarif ongkos kirim secara *real-time*.
- **Multi-Ekspedisi Resmi**: Dukungan simulasi tarif kurir JNE Express (Reguler & YES), J&T Express, SiCepat Ekspres, dan Pos Indonesia.
- **Kanal Pembayaran Lengkap**: Mendukung Virtual Account (BCA, Mandiri, BNI, BRI), QRIS, dan COD (*Bayar di Tempat*).

---

## 🛠️ Tech Stack

- **Frontend (`apps/storefront` & `apps/admin`)**: Next.js (App Router), React, TypeScript, Tailwind CSS, Zustand (State Management), TanStack React Query, React Hook Form + Zod.
- **Backend (`apps/api` & Serverless API)**: NestJS REST API + Next.js Serverless API Routes (`/api/v1`).
- **Database (`packages/database`)**: PostgreSQL (Supabase Cloud), Prisma ORM.
- **Shared Packages**:
  - `packages/contracts`: Skema validasi Zod & DTO bersama antara Frontend dan Backend.
  - `packages/ui`: Utilitas pemformatan mata uang (IDR), tanggal, dan komponen antarmuka.

---

## 📂 Struktur Monorepo

```text
├── apps/
│   ├── storefront/      # Aplikasi Web E-Commerce Pelanggan (Next.js - Port 3000)
│   ├── admin/           # Dashboard Manajemen Toko & Inventori (Next.js - Port 3001)
│   └── api/             # Server Backend REST API (NestJS - Port 4000)
├── packages/
│   ├── database/        # Skema Prisma, Migrasi & Data Seeder PostgreSQL
│   ├── contracts/       # Shared TypeScript Types & Zod Schemas
│   └── ui/              # Shared UI Helpers & Formatters
```

---

## 🚀 Cara Menjalankan di Lokal

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Inisialisasi Database & Seed Data Produk**
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

3. **Jalankan Server Development**
   ```bash
   # Jalankan Storefront (Port 3000)
   pnpm --filter @commerceos/storefront dev

   # (Opsional) Jalankan Backend API NestJS (Port 4000)
   pnpm --filter @commerceos/api dev
   ```
