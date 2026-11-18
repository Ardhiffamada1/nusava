'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CATALOG_PRODUCTS, CATALOG_CATEGORIES } from '../../lib/catalog-data';

function formatPrice(amount: number | string): string {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(num) ? num : 0);
}

interface AdminOrderItem {
  id: string;
  productNameSnapshot: string;
  variantSkuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  payment?: {
    method?: string;
    status?: string;
  };
  items?: AdminOrderItem[];
}

const MONTHLY_REVENUE_2026 = [
  { month: 'Jan', revenue: 6450000, orders: 58 },
  { month: 'Feb', revenue: 7200000, orders: 64 },
  { month: 'Mar', revenue: 8950000, orders: 81 },
  { month: 'Apr', revenue: 11400000, orders: 102 },
  { month: 'Mei', revenue: 9800000, orders: 89 },
  { month: 'Jun', revenue: 10500000, orders: 95 },
  { month: 'Jul', revenue: 11250000, orders: 99 },
  { month: 'Agu', revenue: 12300000, orders: 110 },
  { month: 'Sep', revenue: 11900000, orders: 106 },
  { month: 'Okt', revenue: 13450000, orders: 119 },
  { month: 'Nov', revenue: 14635000, orders: 131 },
];

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  DELIVERED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Selesai' },
  SHIPPED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Dikirim' },
  PROCESSING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Diproses' },
  PAID: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', label: 'Dibayar' },
  PENDING: { bg: 'bg-stone-100 border-stone-200', text: 'text-stone-700', label: 'Menunggu' },
  CANCELLED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Dibatalkan' },
};

export default function StorefrontAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'reports'>('overview');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [baseRevenue, setBaseRevenue] = useState(14635000);
  const [baseOrderCount, setBaseOrderCount] = useState(131);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await fetch('/api/v1/orders', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const fetchedOrders: AdminOrder[] = Array.isArray(data?.items) ? data.items : [];

          // Also merge any local browser checkout orders stored in localStorage
          let localOrders: AdminOrder[] = [];
          try {
            const rawLocal = localStorage.getItem('nusava_local_orders');
            if (rawLocal) {
              const parsed = JSON.parse(rawLocal);
              if (Array.isArray(parsed)) localOrders = parsed;
            }
          } catch {
            // ignore
          }

          const seenIds = new Set<string>();
          const combined: AdminOrder[] = [];
          for (const ord of [...localOrders, ...fetchedOrders]) {
            const key = ord.orderNumber || ord.id;
            if (!seenIds.has(key)) {
              seenIds.add(key);
              combined.push(ord);
            }
          }
          setOrders(combined);
        }
      } catch {
        // fallback handled by state
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  // Calculate dynamic revenue including any new orders beyond the 5 demo orders
  const customOrdersRevenue = useMemo(() => {
    return orders
      .filter((o) => !o.id.startsWith('ord-demo-') && o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + Number(o.grandTotal || 0), 0);
  }, [orders]);

  const customOrdersCount = useMemo(() => {
    return orders.filter((o) => !o.id.startsWith('ord-demo-') && o.status !== 'CANCELLED').length;
  }, [orders]);

  const totalRevenue = baseRevenue + customOrdersRevenue;
  const totalOrders = baseOrderCount + customOrdersCount;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const estimatedNetProfit = Math.round(totalRevenue * 0.28);

  const categoryBreakdown = useMemo(() => {
    return [
      { name: 'Kue & Roti Tradisional', slug: 'kue-roti', revenue: Math.round(totalRevenue * 0.34), share: 34, color: 'bg-[#1F4D3A]' },
      { name: 'Lauk & Sambal Nusantara', slug: 'lauk-sambal', revenue: Math.round(totalRevenue * 0.27), share: 27, color: 'bg-[#C89B3C]' },
      { name: 'Camilan & Keripik Khas', slug: 'camilan-keripik', revenue: Math.round(totalRevenue * 0.18), share: 18, color: 'bg-emerald-600' },
      { name: 'Kopi, Teh & Minuman Rempah', slug: 'kopi-minuman', revenue: Math.round(totalRevenue * 0.13), share: 13, color: 'bg-amber-700' },
      { name: 'Paket Hampers & Oleh-Oleh', slug: 'paket-hampers', revenue: Math.round(totalRevenue * 0.08), share: 8, color: 'bg-stone-600' },
    ];
  }, [totalRevenue]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const q = orderSearch.toLowerCase().trim();
      if (!q) return matchesStatus;
      const customer =
        o.shippingAddress?.fullName ||
        `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() ||
        'Pelanggan';
      return (
        matchesStatus &&
        (o.orderNumber.toLowerCase().includes(q) ||
          customer.toLowerCase().includes(q) ||
          (o.shippingAddress?.city || '').toLowerCase().includes(q))
      );
    });
  }, [orders, orderSearch, statusFilter]);

  const handleUpdateOrderStatus = (orderNumber: string, newStatus: AdminOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status: newStatus } : o))
    );
    showToast(`Status pesanan ${orderNumber} diperbarui menjadi ${STATUS_BADGE[newStatus]?.label || newStatus}`);
  };

  const handleSimulateNewOrder = () => {
    const sampleProducts = [
      { title: 'Pie Susu Dhian Bali Asli (Kotak Besar 25 Pcs)', sku: 'NUS-BALI-PIE-25', price: 95000, qty: 2 },
      { title: 'Rendang Daging Sapi Asli Padang Vakum (500g)', sku: 'NUS-PDG-RND-500', price: 165000, qty: 1 },
      { title: 'Bika Ambon Zulaikha Medan Original', sku: 'NUS-MDN-BIKA-01', price: 135000, qty: 2 },
      { title: 'Lapis Legit Prunes Spesial Wisman', sku: 'NUS-JKT-LPS-20', price: 240000, qty: 1 },
    ];
    const pick = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const names = [
      { name: 'Andi Pratama', city: 'Jakarta Pusat', state: 'DKI Jakarta' },
      { name: 'Dewi Lestari', city: 'Kota Bandung', state: 'Jawa Barat' },
      { name: 'Dimas Aditya', city: 'Kota Surabaya', state: 'Jawa Timur' },
      { name: 'Rina Kusuma', city: 'Kota Medan', state: 'Sumatera Utara' },
    ];
    const buyer = names[Math.floor(Math.random() * names.length)];
    const subtotal = pick.price * pick.qty;
    const orderNum = `ORD-20261118-${Math.floor(1000 + Math.random() * 9000)}`;

    const simulatedOrder: AdminOrder = {
      id: `ord-sim-${Date.now()}`,
      orderNumber: orderNum,
      status: 'PAID',
      subtotal,
      shippingCost: 0,
      grandTotal: subtotal,
      createdAt: new Date().toISOString(),
      shippingAddress: {
        fullName: buyer.name,
        phone: '081299887766',
        city: buyer.city,
        state: buyer.state,
      },
      payment: { method: 'QRIS', status: 'PAID' },
      items: [
        {
          id: `item-${Date.now()}`,
          productNameSnapshot: pick.title,
          variantSkuSnapshot: pick.sku,
          unitPriceSnapshot: pick.price,
          quantity: pick.qty,
          lineTotal: subtotal,
        },
      ],
    };

    setOrders((prev) => [simulatedOrder, ...prev]);
    showToast(`Pesanan baru ${orderNum} (+${formatPrice(subtotal)}) berhasil masuk ke Revenue!`);
  };

  const handleAdjustStock = (sku: string, defaultQty: number, delta: number) => {
    setStockOverrides((prev) => {
      const current = prev[sku] ?? defaultQty;
      const next = Math.max(0, current + delta);
      return { ...prev, [sku]: next };
    });
    showToast(`Stok SKU ${sku} berhasil diperbarui (${delta > 0 ? `+${delta}` : delta})`);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] pb-16">
      {/* Top Admin Header Bar */}
      <div className="bg-[#1F4D3A] text-white border-b border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#C89B3C] text-[#1C1917] font-extrabold text-lg flex items-center justify-center shadow-sm">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-800/90 text-[#F3E5AB] border border-emerald-700">
                  Seller & Revenue Center
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                Dashboard Admin & Pendapatan NUSAVA
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSimulateNewOrder}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#C89B3C] hover:bg-[#b5892f] text-[#1C1917] transition shadow-sm cursor-pointer"
            >
              + Simulasi Pesanan Masuk
            </button>
            <a
              href="/api/v1/reports/export-csv"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
            >
              Unduh Laporan CSV
            </a>
            <Link
              href="/"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-[#1F4D3A] hover:bg-stone-100 transition"
            >
              ← Kembali ke Toko
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-emerald-800/70 pt-2">
          {[
            { id: 'overview', label: 'Ringkasan Revenue' },
            { id: 'orders', label: `Pesanan Masuk (${orders.length})` },
            { id: 'inventory', label: `Stok Produk (${CATALOG_PRODUCTS.length} SKU)` },
            { id: 'reports', label: 'Laporan Keuangan & CSV' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-[#FAF6F0] text-[#1F4D3A] shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1C1917] text-white px-4 py-3 rounded-xl shadow-lg border border-stone-700 text-xs sm:text-sm font-medium flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* KPI Revenue Summary Row (Always visible) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Total Revenue (GMV)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                +18.4% MoM
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1F4D3A] mt-2 tracking-tight">
              {formatPrice(totalRevenue)}
            </p>
            <p className="text-xs text-stone-500 mt-1.5">
              Akumulasi transaksi lunas & sedang berjalan
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Estimasi Laba Bersih (28%)
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Margin Sehat
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] mt-2 tracking-tight">
              {formatPrice(estimatedNetProfit)}
            </p>
            <p className="text-xs text-stone-500 mt-1.5">
              Setelah HPP mitra UMKM & biaya kemasan vakum
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Total Pesanan
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                98.2% Selesai
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] mt-2 tracking-tight">
              {totalOrders} <span className="text-sm font-medium text-stone-500">Pesanan</span>
            </p>
            <p className="text-xs text-stone-500 mt-1.5">
              Rata-rata nilai belanja (AOV): <strong className="text-stone-700">{formatPrice(averageOrderValue)}</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Katalog & Inventori
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {CATALOG_CATEGORIES.length} Kategori
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] mt-2 tracking-tight">
              {CATALOG_PRODUCTS.length} <span className="text-sm font-medium text-stone-500">Produk Aktif</span>
            </p>
            <p className="text-xs text-amber-700 font-medium mt-1.5">
              • 3 SKU stok di bawah batas minimum (perlu restock)
            </p>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & REVENUE CHART */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Bar Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-[#1C1917]">
                      Grafik Pertumbuhan Revenue Bulanan (2026)
                    </h2>
                    <p className="text-xs text-stone-500">
                      Pendapatan kotor (GMV) per bulan dari penjualan oleh-oleh Nusantara
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Bulan Ini (Nov 2026)</span>
                    <span className="text-sm font-bold text-[#1F4D3A]">{formatPrice(totalRevenue)}</span>
                  </div>
                </div>

                <div className="h-56 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-stone-200">
                  {MONTHLY_REVENUE_2026.map((item, idx) => {
                    const isCurrent = idx === MONTHLY_REVENUE_2026.length - 1;
                    const rev = isCurrent ? totalRevenue : item.revenue;
                    const maxRev = Math.max(totalRevenue, 16000000);
                    const heightPct = Math.max(15, Math.min(100, Math.round((rev / maxRev) * 100)));
                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#1C1917] text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                          {formatPrice(rev)} ({isCurrent ? totalOrders : item.orders} ord)
                        </div>
                        <div className="w-full h-44 flex items-end justify-center">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full max-w-[34px] rounded-t-lg transition-all ${
                              isCurrent
                                ? 'bg-[#1F4D3A] ring-2 ring-[#C89B3C]/50'
                                : 'bg-emerald-700/25 group-hover:bg-emerald-700/50'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            isCurrent ? 'text-[#1F4D3A] font-bold' : 'text-stone-500'
                          }`}
                        >
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue by Category Breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1C1917] mb-1">
                    Kontribusi Revenue per Kategori
                  </h2>
                  <p className="text-xs text-stone-500 mb-5">
                    Distribusi pendapatan berdasarkan lini produk
                  </p>

                  <div className="space-y-4">
                    {categoryBreakdown.map((cat) => (
                      <div key={cat.slug} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-800">{cat.name}</span>
                          <span className="font-bold text-[#1C1917]">
                            {formatPrice(cat.revenue)} ({cat.share}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.color}`}
                            style={{ width: `${cat.share}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">Metode Pembayaran Terpopuler:</span>
                  <span className="font-bold text-[#1F4D3A]">QRIS & BCA Virtual Account (74%)</span>
                </div>
              </div>
            </div>

            {/* Recent Orders Table in Overview */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1C1917]">Transaksi & Pesanan Terbaru</h2>
                  <p className="text-xs text-stone-500">
                    Setiap pesanan baru dari halaman Checkout akan langsung masuk ke tabel ini
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#1F4D3A] hover:underline cursor-pointer"
                >
                  Lihat Semua Pesanan →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                      <th className="py-3 px-4">No. Pesanan</th>
                      <th className="py-3 px-4">Pelanggan & Kota</th>
                      <th className="py-3 px-4">Produk Dibeli</th>
                      <th className="py-3 px-4">Pembayaran</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/70 text-xs sm:text-sm">
                    {orders.slice(0, 6).map((ord) => {
                      const badge = STATUS_BADGE[ord.status] || STATUS_BADGE.PROCESSING;
                      const buyerName =
                        ord.shippingAddress?.fullName ||
                        `${ord.user?.firstName || ''} ${ord.user?.lastName || ''}`.trim() ||
                        'Pelanggan NUSAVA';
                      const firstItem = ord.items?.[0]?.productNameSnapshot || 'Paket Kuliner Nusantara';
                      const extraCount = (ord.items?.length || 1) - 1;

                      return (
                        <tr key={ord.id} className="hover:bg-stone-50/60 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1F4D3A] whitespace-nowrap">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-stone-900">{buyerName}</div>
                            <div className="text-xs text-stone-500">
                              {ord.shippingAddress?.city || 'Jakarta Selatan'}, {ord.shippingAddress?.state || 'DKI Jakarta'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="truncate font-medium text-stone-800">{firstItem}</div>
                            {extraCount > 0 && (
                              <div className="text-xs text-stone-500">+{extraCount} produk lainnya</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-stone-700">
                            {ord.payment?.method || 'MANUAL_BANK_TRANSFER'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#1C1917] whitespace-nowrap">
                            {formatPrice(ord.grandTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#1C1917]">Manajemen Pesanan & Status Pengiriman</h2>
                <p className="text-xs text-stone-500">
                  Ubah status pesanan pelanggan secara langsung (Menunggu → Dibayar → Diproses → Dikirim → Selesai)
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari No. Order / Nama / Kota..."
                  className="px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-[#1F4D3A]"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white font-medium"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PAID">Dibayar</option>
                  <option value="PROCESSING">Diproses</option>
                  <option value="SHIPPED">Dikirim</option>
                  <option value="DELIVERED">Selesai</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                    <th className="py-3 px-4">Order ID & Waktu</th>
                    <th className="py-3 px-4">Penerima & Domisili</th>
                    <th className="py-3 px-4">Item Pesanan</th>
                    <th className="py-3 px-4">Total Tagihan</th>
                    <th className="py-3 px-4">Status Saat Ini</th>
                    <th className="py-3 px-4 text-right">Ubah Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
                  {filteredOrders.map((ord) => {
                    const badge = STATUS_BADGE[ord.status] || STATUS_BADGE.PROCESSING;
                    const buyerName =
                      ord.shippingAddress?.fullName ||
                      `${ord.user?.firstName || ''} ${ord.user?.lastName || ''}`.trim() ||
                      'Pelanggan NUSAVA';

                    return (
                      <tr key={ord.id} className="hover:bg-stone-50/70">
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-[#1F4D3A]">{ord.orderNumber}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-stone-900">{buyerName}</div>
                          <div className="text-xs text-stone-500">
                            {ord.shippingAddress?.city || 'Jakarta Selatan'}, {ord.shippingAddress?.state || 'DKI Jakarta'}
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          {ord.items?.map((it) => (
                            <div key={it.id} className="text-xs text-stone-700 truncate">
                              {it.quantity}x {it.productNameSnapshot}
                            </div>
                          ))}
                        </td>
                        <td className="py-4 px-4 font-bold text-stone-900 whitespace-nowrap">
                          {formatPrice(ord.grandTotal)}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord.orderNumber, e.target.value as AdminOrder['status'])
                            }
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 bg-white text-stone-800 cursor-pointer"
                          >
                            <option value="PENDING">Menunggu</option>
                            <option value="PAID">Dibayar</option>
                            <option value="PROCESSING">Diproses</option>
                            <option value="SHIPPED">Dikirim</option>
                            <option value="DELIVERED">Selesai</option>
                            <option value="CANCELLED">Dibatalkan</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY & STOCK LEDGER */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#1C1917]">
                  Manajemen Stok & Harga Katalog ({CATALOG_PRODUCTS.length} Produk Nusantara)
                </h2>
                <p className="text-xs text-stone-500">
                  Klik tombol +5 atau -1 untuk memperbarui ketersediaan stok gudang secara langsung
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-4">SKU Utama</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Harga Jual</th>
                    <th className="py-3 px-4">Stok Tersedia</th>
                    <th className="py-3 px-4 text-right">Penyesuaian Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
                  {CATALOG_PRODUCTS.map((prod) => {
                    const primaryVariant = prod.variants[0];
                    const sku = primaryVariant?.sku || prod.slug.toUpperCase();
                    const defaultStock = primaryVariant?.inventory?.quantityOnHand ?? 45;
                    const currentStock = stockOverrides[sku] ?? defaultStock;

                    return (
                      <tr key={prod.id} className="hover:bg-stone-50/70">
                        <td className="py-3.5 px-4 font-semibold text-stone-900">{prod.title}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-stone-600">{sku}</td>
                        <td className="py-3.5 px-4 text-xs text-stone-600">{prod.category?.name}</td>
                        <td className="py-3.5 px-4 font-bold text-[#1F4D3A]">
                          {formatPrice(Number(prod.basePrice))}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              currentStock <= 10
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {currentStock} pcs
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(sku, defaultStock, -1)}
                            className="px-2.5 py-1 rounded border border-stone-300 hover:bg-stone-100 text-xs font-bold text-stone-700 cursor-pointer"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(sku, defaultStock, 5)}
                            className="px-2.5 py-1 rounded bg-[#1F4D3A] hover:bg-emerald-950 text-white text-xs font-bold cursor-pointer"
                          >
                            +5 Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: FINANCIAL REPORTS & EXPORT */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-50 text-[#1F4D3A] border border-emerald-200">
                Rekapitulasi Keuangan
              </span>
              <h2 className="text-lg font-bold text-[#1C1917]">
                Ringkasan Laba Rugi (P&L) — November 2026
              </h2>
              <div className="space-y-2.5 pt-2 text-sm">
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-600">Penjualan Kotor (Gross Revenue)</span>
                  <span className="font-bold text-stone-900">{formatPrice(totalRevenue)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-600">Subsidi Promo & Voucher Member</span>
                  <span className="font-semibold text-red-600">-{formatPrice(Math.round(totalRevenue * 0.04))}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-600">HPP Mitra UMKM Daerah (68%)</span>
                  <span className="font-semibold text-stone-700">-{formatPrice(Math.round(totalRevenue * 0.68))}</span>
                </div>
                <div className="flex justify-between py-3 bg-emerald-50/70 px-3 rounded-xl border border-emerald-200">
                  <span className="font-bold text-[#1F4D3A]">Estimasi Pendapatan Bersih (Net Revenue)</span>
                  <span className="font-extrabold text-lg text-[#1F4D3A]">{formatPrice(estimatedNetProfit)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  Export Data Akuntansi
                </span>
                <h2 className="text-lg font-bold text-[#1C1917] mt-2">
                  Unduh Laporan Transaksi (.CSV / Excel)
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                  File CSV mencakup seluruh rincian nomor pesanan, tanggal transaksi, nama pelanggan, kota tujuan pengiriman, metode pembayaran, ongkos kirim, dan total revenue (IDR).
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href="/api/v1/reports/export-csv"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#1F4D3A] hover:bg-emerald-950 text-white text-sm font-bold transition shadow-xs"
                >
                  Unduh Laporan Revenue (.CSV)
                </a>
                <button
                  type="button"
                  onClick={handleSimulateNewOrder}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  + Tambah Pesanan Simulasi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
