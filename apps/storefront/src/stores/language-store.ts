import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'id' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'id', // Default to Indonesian for UMKM Oleh-oleh
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'id' ? 'en' : 'id' })),
    }),
    {
      name: 'commerceos-storefront-lang',
    },
  ),
);

// Dictionary of UMKM Traditional Souvenirs & Crafts
export const translations = {
  id: {
    brandName: 'MINDI OLEH-OLEH',
    announcement: 'Gratis ongkir ke seluruh Indonesia untuk pesanan di atas Rp 250.000',
    nav: {
      home: 'Beranda',
      shop: 'Katalog Oleh-oleh',
      about: 'Tentang Pengrajin',
      blog: 'Cerita UMKM',
      admin: 'Portal Admin',
      signIn: 'Masuk',
      signOut: 'Keluar',
      account: 'Akun Saya',
      searchPlaceholder: 'Cari oleh-oleh, batik, kerajinan...',
    },
    hero: {
      tagline: 'KARYA OTENTIK DARI PENGRAJIN NUSANTARA',
      title: 'Oleh-oleh khas & kerajinan lokal berkualitas kurasi.',
      description:
        'Mendukung UMKM daerah dengan transaksi transparan dan jaminan keaslian bahan tradisi.',
      exploreBtn: 'Jelajahi Koleksi',
      adminBtn: 'Panel Kelola UMKM →',
    },
    catalog: {
      title: 'Katalog Oleh-oleh',
      allProducts: 'Semua Produk',
      categories: {
        all: 'Semua Produk',
        food: 'Kuliner & Kudapan',
        craft: 'Gerabah & Kerajinan Kayu',
        apparel: 'Batik & Tenun',
        coffee: 'Kopi & Rempah',
        leather: 'Kerajinan Kulit Asli',
      },
      sortLabel: 'Urutkan',
      sortOptions: {
        newest: 'Terbaru',
        price_asc: 'Harga: Rendah ke Tinggi',
        price_desc: 'Harga: Tinggi ke Rendah',
        popular: 'Paling Diminati',
      },
      quickAddSuccess: 'Ditambahkan ke keranjang!',
      emptyState: 'Belum ada produk untuk kategori ini.',
      clearFilters: 'Bersihkan filter',
    },
    showcase: {
      heading: 'Koleksi Pilihan UMKM',
      viewAll: 'Lihat seluruh produk',
    },
    footer: {
      description:
        'Pemberdayaan UMKM lokal dan pengrajin tradisional Nusantara dengan tata kelola inventaris modern.',
      collectionsTitle: 'Kategori Unggulan',
      infoTitle: 'Layanan & Bantuan',
      infoItems: [
        'Bayar di Tempat (COD)',
        'Transfer Bank Manual (Demo)',
        'Garansi Kualitas Pengrajin',
        'Kebijakan Pengiriman Aman',
      ],
      architectureTitle: 'Sistem CommerceOS',
      architectureDesc:
        'Arsitektur modular monolith Next.js 15, NestJS, dan PostgreSQL dengan ledger stok anti-overselling.',
      rights: 'Hak Cipta Terpelihara.',
      adminLink: 'Konsol Manajemen Admin (:3001)',
    },
  },
  en: {
    brandName: 'MINDI HERITAGE',
    announcement: 'Complimentary shipping across the archipelago on orders over $150',
    nav: {
      home: 'Home',
      shop: 'Shop Souvenirs',
      about: 'Artisans',
      blog: 'MSME Stories',
      admin: 'Admin Portal',
      signIn: 'Sign in',
      signOut: 'Sign out',
      account: 'Account',
      searchPlaceholder: 'Search souvenirs, batik, crafts...',
    },
    hero: {
      tagline: 'AUTHENTIC TRADITIONAL ARCHIPELAGO CRAFTS',
      title: 'Curated traditional souvenirs & handcrafted daily goods.',
      description:
        'Empowering local artisans & Indonesian MSMEs with transparent real-time inventory ledgers.',
      exploreBtn: 'Explore Collection',
      adminBtn: 'Admin Dashboard →',
    },
    catalog: {
      title: 'Shop Souvenirs',
      allProducts: 'All Products',
      categories: {
        all: 'All Products',
        food: 'Culinary Delicacies',
        craft: 'Ceramic & Wood Crafts',
        apparel: 'Batik & Textiles',
        coffee: 'Coffee & Spices',
        leather: 'Genuine Leather Crafts',
      },
      sortLabel: 'Sort',
      sortOptions: {
        newest: 'Newest',
        price_asc: 'Price: Low to High',
        price_desc: 'Price: High to Low',
        popular: 'Most Popular',
      },
      quickAddSuccess: 'Added to cart!',
      emptyState: 'No products found in this category.',
      clearFilters: 'Clear filters',
    },
    showcase: {
      heading: 'Curated MSME Editions',
      viewAll: 'View all products',
    },
    footer: {
      description:
        'Empowering traditional Indonesian MSMEs and artisanal workshops with modern e-commerce reliability.',
      collectionsTitle: 'Collections',
      infoTitle: 'Assurance & Support',
      infoItems: [
        'Cash on Delivery (COD)',
        'Manual Bank Transfer (Demo)',
        'Artisan Quality Guarantee',
        'Secure Packaging & Shipping',
      ],
      architectureTitle: 'CommerceOS Engine',
      architectureDesc:
        'Modular monolith with Next.js 15, NestJS, and PostgreSQL with atomic inventory ledgers.',
      rights: 'All rights reserved.',
      adminLink: 'Admin Management Console (:3001)',
    },
  },
};
