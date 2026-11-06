'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Clock,
  ShieldCheck,
  MapPin,
  AlertCircle,
  X,
  ChevronRight,
  Ban,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { useCartStore } from '../../stores/cart-store';
import { formatCurrency, formatDate, formatDateTime } from '@commerceos/ui';

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading, logout } = useAuthStore();
  const { addItem, openCart } = useCartStore();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'NOT_SHIPPED' | 'CANCELLED'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'3_MONTHS' | 'ALL_TIME'>('3_MONTHS');

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => apiRequest<{ items: any[]; meta: any }>('/orders?limit=30'),
    enabled: !!user,
  });

  const { data: addresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => apiRequest<any[]>('/users/addresses'),
    enabled: !!user,
  });

  const { data: selectedOrderDetail } = useQuery({
    queryKey: ['order-detail', selectedOrderId],
    queryFn: () => apiRequest<any>(`/orders/${selectedOrderId}`),
    enabled: !!selectedOrderId,
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      return apiRequest(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      setCancelModalOrder(null);
      setCancelReason('');
      alert('Pesanan berhasil dibatalkan dan stok dikembalikan otomatis.');
    },
    onError: (err: any) => {
      alert(err.message || 'Gagal membatalkan pesanan.');
    },
  });

  const handleBuyAgain = async (variantId?: string) => {
    if (!variantId) return;
    try {
      await addItem(variantId, 1);
      openCart();
    } catch {
      alert('Produk berhasil ditambahkan ke keranjang belanja.');
    }
  };

  if (isAuthLoading) {
    return <div className="max-w-7xl mx-auto px-6 py-20 text-xs text-gray-400">Memuat info akun...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Yuk masuk ke akun kamu</h1>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          Lihat riwayat pesanan, status paket yang sedang dikirim, dan buku alamatmu.
        </p>
        <Link
          href="/login?redirect=/account"
          className="inline-block text-sm font-semibold bg-[#003d29] hover:bg-[#002b1c] text-white px-7 py-3 rounded-full transition-colors shadow-sm"
        >
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  // Filter orders by active tab
  const allOrders = ordersData?.items || [];
  const filteredOrders = allOrders.filter((order) => {
    if (activeTab === 'NOT_SHIPPED') {
      return order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
    }
    if (activeTab === 'CANCELLED') {
      return order.status === 'CANCELLED';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 font-sans">
      {/* Account Header */}
      <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#003d29]">Akun Pelanggan</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mt-1">
            Halo, {user.firstName} {user.lastName}!
          </h1>
          <p className="text-xs text-gray-500 mt-1">{user.email} • Bergabung sejak {formatDate(user.createdAt)}</p>
        </div>

        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="text-xs font-semibold text-gray-600 hover:text-rose-600 border border-gray-200 px-4 py-2 rounded-full transition-colors self-start sm:self-auto"
        >
          Keluar (Sign Out)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Orders History (Styled exactly like uploaded reference image) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title Row with Count Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Pesanan Saya
            </h2>
            <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {allOrders.length}
            </span>
          </div>

          {/* Navigation Tabs Bar & Dropdown (Matching uploaded screenshot) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Tabs Pill Group */}
            <div className="flex items-center p-1 bg-gray-100/80 rounded-xl text-xs font-semibold text-gray-600">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                Semua Pesanan
              </button>
              <button
                onClick={() => setActiveTab('NOT_SHIPPED')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'NOT_SHIPPED'
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                Belum Dikirim
              </button>
              <button
                onClick={() => setActiveTab('CANCELLED')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'CANCELLED'
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                Dibatalkan
              </button>
            </div>

            {/* Time period filter dropdown */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl px-3.5 py-2 outline-none cursor-pointer hover:border-gray-300"
              >
                <option value="3_MONTHS">3 Bulan Terakhir</option>
                <option value="ALL_TIME">Semua Waktu</option>
              </select>
            </div>
          </div>

          {/* Order Cards List */}
          {isOrdersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-44 bg-gray-50 border border-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 bg-[#F9FAFA] rounded-2xl p-6">
              <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900">Tidak ada pesanan di kategori ini</p>
              <p className="text-xs text-gray-500 mt-1 mb-5">
                {activeTab === 'CANCELLED'
                  ? 'Bagus! Kamu tidak memiliki pesanan yang dibatalkan.'
                  : activeTab === 'NOT_SHIPPED'
                  ? 'Semua pesananmu saat ini sudah berhasil dikirimkan.'
                  : 'Yuk mulai jelajahi aneka oleh-oleh Nusantara khas daerah.'}
              </p>
              <Link
                href="/products"
                className="text-xs font-semibold bg-[#003d29] hover:bg-[#002b1c] text-white px-6 py-2.5 rounded-full transition-colors inline-block shadow-2xs"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const isCancelled = order.status === 'CANCELLED';
                const isDelivered = order.status === 'DELIVERED';
                const canCancel = !isCancelled && !isDelivered;

                return (
                  <div
                    key={order.id}
                    className="border border-gray-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Header Strip (From uploaded reference image) */}
                    <div className="bg-[#F9FAFA] border-b border-gray-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                            TANGGAL PESAN
                          </span>
                          <span className="font-semibold text-gray-800 mt-0.5 block">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                            TOTAL HARGA
                          </span>
                          <span className="font-bold text-gray-900 mt-0.5 block">
                            {formatCurrency(order.grandTotal)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                            TUJUAN KIRIM
                          </span>
                          <span className="font-semibold text-[#003d29] hover:underline cursor-pointer mt-0.5 block">
                            {order.shippingAddress?.fullName || `${user.firstName} ${user.lastName}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-[11px] text-gray-500 font-semibold">
                          PESANAN #{order.orderNumber}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-[#003d29] hover:underline font-semibold"
                          >
                            Lihat Rincian Pesanan
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-[#003d29] hover:underline font-semibold"
                          >
                            Lihat Invoice
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {/* Optional review encouragement banner (from reference image) */}
                      {isDelivered && (
                        <div className="mb-5 p-3.5 bg-amber-50/80 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="text-amber-500 text-sm">★</span>
                            <span>Bagikan ulasan pengalaman belanja oleh-oleh Nusantara kamu</span>
                          </div>
                          <span className="text-gray-400 text-xs">×</span>
                        </div>
                      )}

                      {/* Delivery status header */}
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-gray-900">
                          {order.status === 'DELIVERED'
                            ? `Terkirim pada ${formatDate(order.updatedAt || order.createdAt)}`
                            : order.status === 'SHIPPED'
                            ? 'Sedang Dalam Pengiriman Kurir'
                            : order.status === 'PROCESSING'
                            ? 'Sedang Diproses & Dipacking Oleh-oleh'
                            : order.status === 'CANCELLED'
                            ? 'Pesanan Dibatalkan'
                            : 'Menunggu Konfirmasi Pesanan'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {order.status === 'DELIVERED'
                            ? 'Paket telah diterima dengan baik di alamat tujuan pengiriman.'
                            : order.status === 'SHIPPED'
                            ? 'Kurir sedang mengantar paket menuju lokasimu.'
                            : order.status === 'PROCESSING'
                            ? 'Pengrajin sedang menyiapkan produk fresh dengan kemasan higienis tebal.'
                            : order.status === 'CANCELLED'
                            ? 'Pesanan dibatalkan dan stok produk telah dikembalikan ke sistem.'
                            : 'Pesanan telah diterima dan menunggu verifikasi pembayaran.'}
                        </p>
                      </div>

                      {/* List of Order Items */}
                      <div className="space-y-6 divide-y divide-gray-100">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any, idx: number) => {
                            const imgUrl = item.variant?.product?.images?.[0]?.url;
                            const slug = item.variant?.product?.slug;

                            return (
                              <div
                                key={item.id || idx}
                                className="pt-5 first:pt-0 flex flex-col sm:flex-row items-start gap-4"
                              >
                                {/* Thumbnail Image */}
                                <div className="relative w-20 h-20 bg-[#F5F6F6] rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                  {imgUrl ? (
                                    <Image
                                      src={imgUrl}
                                      alt={item.productNameSnapshot}
                                      fill
                                      className="object-contain p-1.5"
                                      sizes="80px"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>

                                {/* Item Details & Action Buttons */}
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={slug ? `/products/${slug}` : '/products'}
                                    className="text-sm font-bold text-gray-900 hover:text-[#003d29] transition-colors line-clamp-1"
                                  >
                                    {item.productNameSnapshot}
                                  </Link>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {item.variantSkuSnapshot ? `SKU: ${item.variantSkuSnapshot}` : ''} • {item.quantity} pcs × {formatCurrency(item.unitPriceSnapshot)}
                                  </p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    Garansi pengembalian: Berlaku 7 hari sejak produk diterima
                                  </p>

                                  {/* Action Buttons Row matching uploaded screenshot */}
                                  <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
                                    <button
                                      type="button"
                                      onClick={() => handleBuyAgain(item.variantId || item.variant?.id)}
                                      className="bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-2xs"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>Beli Lagi</span>
                                    </button>

                                    {slug && (
                                      <Link
                                        href={`/products/${slug}`}
                                        className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                                      >
                                        Lihat Produk
                                      </Link>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrderId(order.id)}
                                      className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                                    >
                                      Lacak Paket
                                    </button>

                                    {canCancel && (
                                      <button
                                        type="button"
                                        onClick={() => setCancelModalOrder(order)}
                                        className="border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                                      >
                                        Batalkan
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="pt-2 text-xs text-gray-500">
                            {order._count?.items || 1} jenis oleh-oleh dipesan dalam transaksi ini.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Send us a message & Address Book (Matching uploaded reference) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Send us a message card */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#003d29] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Butuh Bantuan Pesanan?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Jika kamu memiliki pertanyaan seputar paket oleh-oleh, perubahan alamat, atau pengecekan resi, customer support kami siap melayanimu.
            </p>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="mt-2 w-full bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold py-3 px-4 rounded-xl text-center block transition-all shadow-2xs"
            >
              Hubungi Kami (WhatsApp)
            </a>
          </div>

          {/* Saved Address Book */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#003d29]" />
                <span>Alamat Pengiriman Utama</span>
              </h3>
            </div>

            <div className="space-y-3">
              {addresses?.map((addr) => (
                <div key={addr.id} className="p-4 bg-[#F9FAFA] border border-gray-100 rounded-xl text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-900">{addr.fullName}</span>
                    {addr.isDefaultShipping && (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5">
                        Alamat Utama
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{addr.streetAddress}</p>
                  <p className="text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-gray-500 mt-2 font-medium">{addr.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail & Invoice Modal */}
      {selectedOrderId && selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#003d29]">Rincian & Invoice Pesanan</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">{selectedOrderDetail.orderNumber}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Waktu transaksi: {formatDateTime(selectedOrderDetail.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item Snapshots */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Daftar Barang yang Dipesan</h4>
              <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 text-xs overflow-hidden">
                {selectedOrderDetail.items?.map((it: any) => (
                  <div key={it.id} className="p-3.5 flex justify-between items-center bg-white">
                    <div>
                      <p className="font-semibold text-gray-900">{it.productNameSnapshot}</p>
                      <p className="text-[11px] text-gray-400">SKU: {it.variantSkuSnapshot}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(it.lineTotal)}</p>
                      <p className="text-[11px] text-gray-500">
                        {it.quantity} × {formatCurrency(it.unitPriceSnapshot)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Specs */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
              <div className="p-3.5 bg-[#F9FAFA] border border-gray-100 rounded-xl">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Alamat Tujuan Pengiriman</span>
                <p className="font-bold text-gray-900">{selectedOrderDetail.shippingAddress?.fullName}</p>
                <p className="text-gray-600 mt-0.5">{selectedOrderDetail.shippingAddress?.streetAddress}</p>
                <p className="text-gray-600">{selectedOrderDetail.shippingAddress?.city}, {selectedOrderDetail.shippingAddress?.state}</p>
              </div>

              <div className="p-3.5 bg-[#F9FAFA] border border-gray-100 rounded-xl">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Metode & Status Bayar</span>
                <p className="font-bold text-gray-900">
                  {selectedOrderDetail.payment?.method === 'CASH_ON_DELIVERY' ? 'COD (Bayar di Tempat)' : 'Transfer Bank Manual'}
                </p>
                <p className="text-gray-600 mt-0.5">
                  Status: <span className="font-bold text-[#003d29]">{selectedOrderDetail.payment?.status === 'PAID' ? 'Lunas (PAID)' : 'Menunggu Bayar'}</span>
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#F9FAFA] border border-gray-100 rounded-xl text-xs space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Barang:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(selectedOrderDetail.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkos Kirim Kurir:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(selectedOrderDetail.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-sm pt-2 border-t border-gray-200">
                <span>Total Tagihan:</span>
                <span className="text-[#003d29]">{formatCurrency(selectedOrderDetail.grandTotal)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-xs font-semibold bg-[#003d29] hover:bg-[#002b1c] text-white px-6 py-2.5 rounded-full transition-colors shadow-2xs"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-gray-100 max-w-md w-full rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-700 mb-3">
              <Ban className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">Konfirmasi Pembatalan Pesanan</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Membatalkan pesanan <span className="font-bold text-gray-900">#{cancelModalOrder.orderNumber}</span> akan mengembalikan alokasi stok produk ke sistem secara instan.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Alasan Pembatalan
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="Contoh: Ingin menambah barang lain, ganti alamat..."
                className="w-full text-xs p-3 border border-gray-200 bg-white rounded-xl focus:outline-hidden focus:border-[#003d29]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="text-xs font-semibold border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={() => cancelMutation.mutate({ orderId: cancelModalOrder.id, reason: cancelReason })}
                disabled={cancelMutation.isPending}
                className="text-xs font-semibold bg-rose-600 text-white px-5 py-2 rounded-full hover:bg-rose-700 disabled:opacity-40 transition-colors shadow-sm"
              >
                {cancelMutation.isPending ? 'Memproses...' : 'Ya, Batalkan Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
