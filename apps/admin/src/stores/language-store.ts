import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminLanguage = 'id' | 'en';

interface AdminLanguageStore {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  toggleLanguage: () => void;
}

export const useAdminLanguageStore = create<AdminLanguageStore>()(
  persist(
    (set) => ({
      language: 'id', // Default to Indonesian for UMKM owner
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'id' ? 'en' : 'id' })),
    }),
    {
      name: 'commerceos-admin-lang',
    },
  ),
);

export const adminTranslations = {
  id: {
    sidebar: {
      appName: 'WiNk OS',
      storeTitle: 'Oleh-oleh Nusantara',
      searchPlaceholder: 'Cari menu, SKU, pesanan...',
      menuHeader: 'Menu Utama',
      home: 'Beranda',
      catalog: 'Katalog & Produk',
      products: 'Daftar Produk',
      inventory: 'Stok & Gudang',
      orders: 'Daftar Pesanan',
      customers: 'Data Pelanggan',
      analytics: 'Laporan Penjualan',
      audit: 'Log Audit Sistem',
      integrations: 'Integrasi',
      salesChannels: 'Kanal Penjualan',
      onlineStore: 'Toko Online (Katalog)',
      settings: 'Pengaturan Toko',
      logout: 'Keluar',
      adminRole: 'Pengelola UMKM',
    },
    dashboard: {
      greeting: 'Halo, Pengelola UMKM!',
      openSite: 'Buka Toko',
      upgradeBanner: '👑 Paket UMKM Juara aktif: Dukung transaksi hingga 10.000 produk per bulan',
      selectPlan: 'Pilihan Paket',
      overviewTitle: 'Ringkasan Kinerja Toko',
      timeframes: { Day: 'Hari', Week: 'Minggu', Month: 'Bulan', Year: 'Tahun' },
      metrics: {
        views: 'Total Dilihat',
        visits: 'Pengunjung',
        orders: 'Pesanan Masuk',
        conversion: 'Tingkat Konversi',
        subtitle7Days: 'Dari 7 hari terakhir',
      },
      revenueTitle: 'Total Pendapatan',
      revenueSubtitle: 'Keuntungan bersih',
      monthGain: 'Peningkatan bulan ini',
      shopAdvisor: 'Saran & Tips UMKM',
      advisorTitle: 'Persiapan Promo Liburan & Oleh-oleh',
      advisorDesc:
        'Pastikan stok kemasan oleh-oleh tahan lama dan kurir siap menghadapi lonjakan pesanan libur panjang.',
      learnMore: 'Pelajari Selengkapnya',
      productsTitle: 'Ringkasan Produk',
      activeListings: 'Produk aktif tayang',
      expired: 'Habis masa promo',
      soldOut: 'Stok menipis / habis',
      recentActivities: 'Aktivitas Terkini',
      actions: {
        favorited: 'menyukai produk oleh-oleh Anda',
        purchased: 'melakukan pembelian produk',
      },
    },
    orders: {
      title: 'Daftar Pesanan',
      filterBtn: 'Filter',
      addNewOrder: 'Tambah Pesanan',
      columns: {
        orderId: 'ID Pesanan',
        productName: 'Nama Produk',
        date: 'Tanggal',
        customers: 'Pelanggan',
        price: 'Total Harga',
        vendor: 'Ekspedisi / Metode',
        status: 'Status',
        action: 'Aksi',
      },
      statuses: {
        all: 'Semua Pesanan',
        pending: 'Menunggu',
        paid: 'Lunas',
        shipped: 'Dikirim',
        delivered: 'Diterima',
        cancelled: 'Dibatalkan',
      },
    },
  },
  en: {
    sidebar: {
      appName: 'WiNk OS',
      storeTitle: 'Mob Shop / Heritage',
      searchPlaceholder: 'Search catalog, orders...',
      menuHeader: 'Menu',
      home: 'Home',
      catalog: 'Catalog',
      products: 'Products',
      inventory: 'Inventory & Stock',
      orders: 'Orders',
      customers: 'Customers',
      analytics: 'Analytics',
      audit: 'Audit Logs',
      integrations: 'Integrations',
      salesChannels: 'Sales Channels',
      onlineStore: 'Online Store',
      settings: 'Settings',
      logout: 'Log out',
      adminRole: 'Store Manager',
    },
    dashboard: {
      greeting: 'Hello, Orbix!',
      openSite: 'Open Site',
      upgradeBanner: '👑 Upgrade your plan to unlock advanced multi-warehouse features',
      selectPlan: 'Select Plan',
      overviewTitle: 'Overview performance',
      timeframes: { Day: 'Day', Week: 'Week', Month: 'Month', Year: 'Year' },
      metrics: {
        views: 'Total Views',
        visits: 'Visits',
        orders: 'Orders',
        conversion: 'Conversion Rate',
        subtitle7Days: 'From last 7 days',
      },
      revenueTitle: 'Total Revenue',
      revenueSubtitle: 'Net gain',
      monthGain: 'this month',
      shopAdvisor: 'Shop Advisor',
      advisorTitle: 'The Black Friday Starts Tomorrow',
      advisorDesc:
        'Find out how to take advantage of the upcoming seasonal volume spike with automated stock buffering.',
      learnMore: 'Learn More',
      productsTitle: 'Products',
      activeListings: 'Active listings',
      expired: 'Expired',
      soldOut: 'Sold out / Low stock',
      recentActivities: 'Recent Activities',
      actions: {
        favorited: 'favorited your shop',
        purchased: 'purchased your product',
      },
    },
    orders: {
      title: 'Order List',
      filterBtn: 'Filter',
      addNewOrder: 'Add New Order',
      columns: {
        orderId: 'Order ID',
        productName: 'Product Name',
        date: 'Date',
        customers: 'Customers',
        price: 'Price',
        vendor: 'Vendor',
        status: 'Status',
        action: 'Action',
      },
      statuses: {
        all: 'All Orders',
        pending: 'Pending',
        paid: 'Paid',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      },
    },
  },
};
