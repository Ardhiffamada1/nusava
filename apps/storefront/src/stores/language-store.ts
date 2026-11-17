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
      language: 'id', // Default to Indonesian
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'id' ? 'en' : 'id' })),
    }),
    {
      name: 'commerceos-storefront-lang',
    },
  ),
);

export const translations = {
  id: {
    brandName: 'NUSAVA',
    brandSub: 'SATU INDONESIA, BANYAK CERITA.',
    announcement: 'Pengiriman aman dengan kemasan proteksi khusus ke seluruh Indonesia',
    nav: {
      home: 'Beranda',
      shop: 'Katalog',
      about: 'Profil Toko UMKM',
      blog: 'Warta Kriya',
      admin: 'Panel Admin',
      signIn: 'Masuk',
      signOut: 'Keluar',
      account: 'Akun',
      searchPlaceholder: 'Cari gerabah, kopi, batik, kayu jati...',
    },
    hero: {
      badge: 'KURASI OLEH-OLEH NUSANTARA 2026',
      title: 'Oleh-oleh bermakna, dirawat dengan tradisi.',
      description:
        'Karya kriya otentik dan cita rasa khas daerah yang dikurasi langsung dari bengkel dan dapur UMKM lokal Nusantara.',
      exploreBtn: 'Jelajahi Koleksi',
      storyBtn: 'Profil Toko UMKM →',
    },
    categories: {
      heading: 'Ragam Kriya & Cita Rasa',
      subheading: 'Dibuat dengan kesabaran, keterampilan turun-temurun, dan bahan alami pilihan.',
      wood: {
        title: 'Kriya Kayu Jati',
        origin: 'Pahat Tangan Jepara & Blora',
        count: '6 Karya',
      },
      ceramic: {
        title: 'Gerabah & Keramik',
        origin: 'Tanah Liat Bakar Kasongan',
        count: '9 Karya',
      },
      culinary: {
        title: 'Oleh-oleh & Kopi Sangrai',
        origin: 'Kopi Gayo & Oleh-oleh Tradisi',
        count: '8 Pilihan',
      },
      textile: {
        title: 'Wastra & Batik Tulis',
        origin: 'Serat Alami Pekalongan & Solo',
        count: '6 Koleksi',
      },
    },
    showcase: {
      tag: 'PILIHAN BULAN INI',
      heading: 'Koleksi UMKM Pilihan',
      viewAll: 'Lihat seluruh 31 karya',
      quickAdd: '+ Keranjang',
      added: 'Ditambahkan!',
    },
    philosophy: {
      tag: 'NILAI KAMI',
      title: 'Ketulusan tangan di balik setiap karya kriya.',
      quote:
        '“Setiap garis pahat kayu dan olahan rasa menyimpan jejak ketulusan tangan yang merawatnya. Kami hadir agar karya pengrajin daerah dapat dihargai selayaknya di ruang-ruang modern.”',
      pillar1Title: 'Bahan Alami & Lestari',
      pillar1Desc:
        'Kayu legal bersertifikasi, serat kapas alami, serta pangan tanpa bahan kimia pengawet sintesis.',
      pillar2Title: 'Keadilan Rantai Pasok',
      pillar2Desc:
        'Bermitra langsung tanpa perantara tengkulak sehingga nilai ekonomi kembali utuh ke pengrajin.',
      pillar3Title: 'Kemasan Khusus Anti-Rusak',
      pillar3Desc:
        'Standar kemasan ganda dengan proteksi tebal untuk keramik dan pengunci vakum untuk oleh-oleh khas.',
    },
    assurances: [
      {
        title: 'Kurasi Asli UMKM Daerah',
        desc: '100% produk otentik terverifikasi dari daerah asal',
      },
      {
        title: 'Kemasan Proteksi Ekspedisi',
        desc: 'Dilindungi bubble wrap tebal dan kardus berlapis',
      },
      {
        title: 'Bayar di Tempat (COD)',
        desc: 'Tersedia pembayaran tunai saat barang diterima',
      },
      {
        title: 'Dukungan Komunitas UMKM',
        desc: 'Setiap pesanan langsung menghidupkan bengkel lokal',
      },
    ],
    journal: {
      tag: 'WARTA PENGRAJIN',
      title: 'Catatan dari Bengkel & Dapur Tradisi',
      readArticle: 'Baca Cerita',
      articles: [
        {
          title: 'Mengenal Karakter Kayu Jati Blora dan Rahasia Ketahanannya',
          category: 'Kriya Kayu',
          date: 'Nov 2026',
        },
        {
          title: 'Tradisi Pembakaran Gerabah Kasongan yang Bertahan Tiga Generasi',
          category: 'Keramik',
          date: 'Okt 2026',
        },
        {
          title: 'Seni Roasting Kopi Arabika Gayo dengan Wajan Tanah Liat',
          category: 'Kuliner',
          date: 'Okt 2026',
        },
      ],
    },
    catalog: {
      title: 'Katalog Koleksi',
      subtitle: 'Telusuri ragam oleh-oleh dan kriya pilihan dari seluruh penjuru daerah.',
      allProducts: 'Semua Produk',
      categories: {
        all: 'Semua Produk',
        food: 'Kuliner & Kudapan Khas',
        craft: 'Gerabah & Keramik',
        wood: 'Kriya Kayu Jati',
        apparel: 'Wastra & Batik',
        coffee: 'Kopi & Rempah',
        leather: 'Kerajinan Kulit Nabati',
      },
      sortOptions: {
        newest: 'Terbaru',
        price_asc: 'Harga: Terendah',
        price_desc: 'Harga: Tertinggi',
        popular: 'Paling Diminati',
      },
      emptyState: 'Belum ada produk untuk kategori ini.',
      clearFilters: 'Bersihkan filter',
    },
    footer: {
      description:
        'Sentra belanja online resmi untuk aneka oleh-oleh kuliner, kopi khas daerah, kain batik, dan kerajinan kriya otentik langsung dari pengrajin dan dapur UMKM terverifikasi di seluruh Nusantara.',
      collectionsTitle: 'Ragam Oleh-oleh Daerah',
      infoTitle: 'Layanan & Bantuan',
      infoItems: [
        'Lacak Resi Pengiriman Kurir',
        'Cek Estimasi Ongkos Kirim',
        'Bayar di Tempat (COD)',
        'Garansi 100% Paket Rusak Ganti Baru',
        'Panduan Belanja & Bantuan (FAQ)',
      ],
      partnerTitle: 'Kemitraan UMKM',
      partnerDesc:
        'Setiap produk diproduksi langsung oleh sentra UMKM dan pengrajin daerah terverifikasi dengan standar mutu, izin P-IRT resmi, dan sertifikasi halal.',
      rights: 'Seluruh Hak Cipta Dilindungi.',
      adminLink: 'Portal Admin Toko',
    },
  },
  en: {
    brandName: 'NUSAVA',
    brandSub: 'ONE INDONESIA, ENDLESS STORIES.',
    announcement: 'Carefully packaged and insured courier delivery across all islands',
    nav: {
      home: 'Home',
      shop: 'Collection',
      about: 'Artisans',
      blog: 'Journal',
      admin: 'Admin Portal',
      signIn: 'Sign in',
      signOut: 'Sign out',
      account: 'Account',
      searchPlaceholder: 'Search ceramics, coffee, batik, teakwood...',
    },
    hero: {
      badge: 'ARCHIPELAGO HEIRLOOM CURATION 2026',
      title: 'Objects of quiet craft & ancestral flavor.',
      description:
        'Authentic handcrafted goods and traditional delicacies curated directly from local Indonesian workshops and home kitchens.',
      exploreBtn: 'Explore Collection',
      storyBtn: 'Artisan Stories →',
    },
    categories: {
      heading: 'Craft Traditions & Regional Flavors',
      subheading: 'Crafted with patient hands, multi-generational skills, and raw natural materials.',
      wood: {
        title: 'Teakwood Tableware',
        origin: 'Hand-carved in Jepara & Blora',
        count: '6 Objects',
      },
      ceramic: {
        title: 'Wheel-thrown Pottery',
        origin: 'Kasongan Earthenware Clay',
        count: '9 Objects',
      },
      culinary: {
        title: 'Roasted Coffee & Delicacies',
        origin: 'Gayo Coffee & Traditional Bakes',
        count: '8 Selections',
      },
      textile: {
        title: 'Woven Textiles & Batik',
        origin: 'Natural Fiber Pekalongan & Solo',
        count: '6 Collections',
      },
    },
    showcase: {
      tag: 'MONTHLY SELECTION',
      heading: 'Curator’s Choice',
      viewAll: 'View all 31 objects',
      quickAdd: '+ Add to Bag',
      added: 'Added!',
    },
    philosophy: {
      tag: 'OUR VALUES',
      title: 'Patient hands behind every honest object.',
      quote:
        '“Every chisel mark in teakwood and every wheel-thrown clay vessel carries the patience of the craftsperson. We exist so their heritage thrives in modern homes.”',
      pillar1Title: 'Natural & Sustainable Materials',
      pillar1Desc:
        'Certified sustainable timber, organic cotton fibers, and delicacies prepared without synthetic additives.',
      pillar2Title: 'Fair-Trade Value Chain',
      pillar2Desc:
        'Working directly with maker workshops so that value flows back to the creators themselves.',
      pillar3Title: 'Reinforced Shipping Protection',
      pillar3Desc:
        'Heavy-duty multi-layered cushioning for pottery and airtight nitrogen seals for regional delicacies.',
    },
    assurances: [
      {
        title: 'Verified Maker Provenance',
        desc: '100% genuine craftsmanship directly from origin',
      },
      {
        title: 'Insured Courier Protection',
        desc: 'Protected with multi-layer shockproof boxing',
      },
      {
        title: 'Cash on Delivery (COD)',
        desc: 'Pay cash upon delivery across major cities',
      },
      {
        title: 'Supporting Maker Communities',
        desc: 'Every order directly supports regional families',
      },
    ],
    journal: {
      tag: 'ARTISAN JOURNAL',
      title: 'Notes from the Workshops & Traditional Kitchens',
      readArticle: 'Read Story',
      articles: [
        {
          title: 'Understanding Blora Teakwood Grain and Its Enduring Resilience',
          category: 'Woodcraft',
          date: 'Nov 2026',
        },
        {
          title: 'Three Generations of Wheel-Thrown Pottery in Kasongan',
          category: 'Ceramics',
          date: 'Oct 2026',
        },
        {
          title: 'The Art of Clay-Pan Roasting Indonesian Single-Origin Coffee',
          category: 'Culinary',
          date: 'Oct 2026',
        },
      ],
    },
    catalog: {
      title: 'The Collection',
      subtitle: 'Browse authentic traditional souvenirs and craft objects from across the archipelago.',
      allProducts: 'All Objects',
      categories: {
        all: 'All Objects',
        food: 'Culinary Delicacies',
        craft: 'Wheel-thrown Ceramics',
        wood: 'Teakwood Tableware',
        apparel: 'Textiles & Batik',
        coffee: 'Single-Origin Coffee',
        leather: 'Vegetable-Tanned Leather',
      },
      sortOptions: {
        newest: 'Newest',
        price_asc: 'Price: Low to High',
        price_desc: 'Price: High to Low',
        popular: 'Most Popular',
      },
      emptyState: 'No objects found in this category.',
      clearFilters: 'Clear filters',
    },
    footer: {
      description:
        'Official online destination for authentic regional culinary souvenirs, single-origin coffee, handwoven textiles, and craft heirlooms direct from verified Indonesian local makers.',
      collectionsTitle: 'Regional Heirlooms',
      infoTitle: 'Customer Care',
      infoItems: [
        'Real-time Courier Order Tracking',
        'Check Shipping Rate Estimator',
        'Cash on Delivery (COD)',
        '100% Broken Package Replacement Guarantee',
        'Shopping Guide & Help Center (FAQ)',
      ],
      partnerTitle: 'Verified Makers',
      partnerDesc:
        'All products are shipped directly from certified local workshops and traditional kitchens with food-grade safety standards and official licensing.',
      rights: 'All rights reserved.',
      adminLink: 'Store Admin Console',
    },
  },
};
