'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Clock, ShieldCheck, MapPin, AlertCircle, X, ChevronRight, Ban } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { formatCurrency, formatDate, formatDateTime } from '@commerceos/ui';

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading, logout } = useAuthStore();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => apiRequest<{ items: any[]; meta: any }>('/orders?limit=20'),
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

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Orders History */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#003d29]" />
              <span>Riwayat Pesanan Oleh-oleh</span>
            </h2>
            <span className="text-xs font-semibold text-gray-400">{ordersData?.meta?.total ?? 0} Pesanan</span>
          </div>

          {isOrdersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : ordersData?.items?.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 bg-[#F9FAFA] rounded-2xl p-6">
              <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">Belum ada pesanan nih</p>
              <p className="text-xs text-gray-500 mt-1 mb-5">Yuk cari oleh-oleh Nusantara khas daerah buat keluarga di rumah.</p>
              <Link
                href="/products"
                className="text-xs font-semibold bg-[#003d29] hover:bg-[#002b1c] text-white px-5 py-2.5 rounded-full transition-colors inline-block"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
              {ordersData?.items?.map((order) => {
                const isCancelled = order.status === 'CANCELLED';
                const isDelivered = order.status === 'DELIVERED';
                const canCancel = !isCancelled && !isDelivered;

                return (
                  <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-gray-900">{order.orderNumber}</span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 font-semibold rounded-full ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : order.status === 'CANCELLED'
                              ? 'bg-zinc-100 text-zinc-500 line-through border border-gray-200'
                              : order.status === 'SHIPPED'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {order.status === 'PENDING' ? 'Menunggu Diproses' : order.status === 'PROCESSING' ? 'Sedang Dipacking' : order.status === 'SHIPPED' ? 'Sedang Dikirim' : order.status === 'DELIVERED' ? 'Terkirim' : 'Dibatalkan'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Dipesan tanggal {formatDate(order.createdAt)} • {order._count?.items || 1} jenis barang
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>Pembayaran: {order.payment?.method === 'CASH_ON_DELIVERY' ? 'COD (Bayar di Tempat)' : 'Transfer Bank'}</span>
                        <span>•</span>
                        <span className={order.payment?.status === 'PAID' ? 'text-emerald-700 font-semibold' : 'text-amber-800 font-medium'}>
                          {order.payment?.status === 'PAID' ? 'Lunas' : 'Menunggu Bayar'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <span className="font-bold text-base text-gray-900">
                        {formatCurrency(order.grandTotal)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="text-xs font-semibold text-gray-700 border border-gray-200 px-3.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          Lihat Detail
                        </button>

                        {canCancel && (
                          <button
                            onClick={() => setCancelModalOrder(order)}
                            className="text-xs font-semibold text-rose-700 border border-rose-200 px-3.5 py-1.5 rounded-full hover:bg-rose-50 transition-colors"
                          >
                            Batalkan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Saved Address Book */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#003d29]" />
              <span>Buku Alamat Pengiriman</span>
            </h2>
          </div>

          <div className="space-y-3">
            {addresses?.map((addr) => (
              <div key={addr.id} className="p-4 bg-[#F9FAFA] border border-gray-100 rounded-2xl text-xs">
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
                <p className="text-gray-500 mt-2 font-mono">{addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#003d29]">Rincian Pesanan</span>
                <h3 className="text-lg font-mono font-bold text-gray-900 mt-0.5">{selectedOrderDetail.orderNumber}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Waktu pesan: {formatDateTime(selectedOrderDetail.createdAt)}</p>
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
                      <p className="text-[11px] font-mono text-gray-400">SKU: {it.variantSkuSnapshot}</p>
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
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Alamat Pengiriman</span>
                <p className="font-bold text-gray-900">{selectedOrderDetail.shippingAddress?.fullName}</p>
                <p className="text-gray-600 mt-0.5">{selectedOrderDetail.shippingAddress?.streetAddress}</p>
                <p className="text-gray-600">{selectedOrderDetail.shippingAddress?.city}, {selectedOrderDetail.shippingAddress?.state}</p>
              </div>

              <div className="p-3.5 bg-[#F9FAFA] border border-gray-100 rounded-xl">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Metode & Status Bayar</span>
                <p className="font-bold text-gray-900">
                  {selectedOrderDetail.payment?.method === 'CASH_ON_DELIVERY' ? 'COD (Bayar di Tempat)' : 'Transfer Bank'}
                </p>
                <p className="text-gray-600 mt-0.5">
                  Status: <span className="font-bold text-[#003d29]">{selectedOrderDetail.payment?.status === 'PAID' ? 'Lunas' : 'Menunggu Bayar'}</span>
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
                className="text-xs font-semibold bg-[#003d29] hover:bg-[#002b1c] text-white px-6 py-2.5 rounded-full transition-colors"
              >
                Tutup
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
              Membatalkan pesanan <span className="font-mono font-bold text-gray-900">{cancelModalOrder.orderNumber}</span> akan mengembalikan stok produk ke sistem secara instan.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Alasan Pembatalan
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="Contoh: Salah pilih varian, ingin ganti alamat, dll"
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
