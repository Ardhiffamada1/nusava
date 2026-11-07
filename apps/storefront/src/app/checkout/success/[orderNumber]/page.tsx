'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ArrowRight, Package, Truck, ArrowLeft, Building2, Check, Clock, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@commerceos/ui';
import { apiRequest } from '../../../../lib/api';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const queryClient = useQueryClient();

  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Fetch real order data from public endpoint
  const { data: order, isLoading } = useQuery({
    queryKey: ['public-order', orderNumber],
    queryFn: () => apiRequest<any>(`/orders/public/${orderNumber}`),
    enabled: !!orderNumber,
  });

  // Mutation to simulate manual payment confirmation (Demo Action)
  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/orders/public/${orderNumber}/confirm-payment`, {
        method: 'POST',
        body: JSON.stringify({
          transactionReference: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-order', orderNumber] });
      setConfirmSuccess(true);
    },
    onError: (err: any) => {
      alert(err.message || 'Gagal mengonfirmasi pembayaran demo');
    },
  });

  const paymentStatus = order?.payment?.status || 'PENDING';
  const isPaid = paymentStatus === 'PAID';
  const isBankTransfer = order?.payment?.method === 'MANUAL_BANK_TRANSFER';
  const isCod = order?.payment?.method === 'CASH_ON_DELIVERY';

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 font-sans">
      <div className="bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#F5F6F6] border border-gray-200 flex items-center justify-center mx-auto mb-4 text-[#003d29]">
          <CheckCircle2 className="w-9 h-9 stroke-[2]" />
        </div>

        <span className="text-xs uppercase tracking-widest text-[#003d29] font-bold block mb-1">
          PESANAN BERHASIL DITERIMA
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Terima kasih atas pesananmu!
        </h1>
        <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
          Pesanan oleh-olehmu sudah masuk ke sistem dan stok produk sudah langsung diamankan. Kami akan segera
          menyiapkan paketmu dengan kemasan aman.
        </p>

        {/* Order Reference Card */}
        <div className="mt-8 p-5 bg-[#F9FAFA] border border-gray-200 rounded-2xl flex flex-wrap items-center justify-around gap-4 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Nomor Pesanan
            </span>
            <span className="font-bold text-gray-900 mt-0.5 block">{orderNumber}</span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Tanggal Pesan
            </span>
            <span className="font-semibold text-gray-900 mt-0.5 block">
              {order ? formatDate(order.createdAt) : formatDate(new Date())}
            </span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Status Pembayaran
            </span>
            <span
              className={`font-bold mt-0.5 inline-flex items-center gap-1 ${
                isPaid ? 'text-[#003d29]' : 'text-gray-700'
              }`}
            >
              {isPaid ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Sudah Lunas (PAID)</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Menunggu Bayar</span>
                </>
              )}
            </span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Total Tagihan
            </span>
            <span className="font-bold text-[#003d29] mt-0.5 block text-sm">
              {order ? formatCurrency(order.grandTotal) : '...'}
            </span>
          </div>
        </div>

        {/* Bank Transfer Instructions & Demo Payment Confirmation Button */}
        {isBankTransfer && !isPaid && (
          <div className="mt-6 p-6 bg-amber-50/60 border border-amber-200 rounded-2xl text-left text-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Building2 className="w-5 h-5 text-amber-700" />
              <span>Instruksi Pembayaran Transfer Bank</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Silakan lakukan transfer sejumlah <strong className="text-gray-900 font-bold">{order ? formatCurrency(order.grandTotal) : ''}</strong> ke salah satu rekening resmi toko kami:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-amber-200 rounded-xl">
                <span className="text-gray-500 text-[10px] uppercase font-bold block">BCA</span>
                <span className="font-bold text-gray-900 text-sm">873-019-2819</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">a.n PT Oleh Oleh Nusantara</span>
              </div>
              <div className="p-3 bg-white border border-amber-200 rounded-xl">
                <span className="text-gray-500 text-[10px] uppercase font-bold block">Mandiri</span>
                <span className="font-bold text-gray-900 text-sm">137-00-1928-1122</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">a.n PT Oleh Oleh Nusantara</span>
              </div>
              <div className="p-3 bg-white border border-amber-200 rounded-xl">
                <span className="text-gray-500 text-[10px] uppercase font-bold block">BNI</span>
                <span className="font-bold text-gray-900 text-sm">092-182-3819</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">a.n PT Oleh Oleh Nusantara</span>
              </div>
            </div>

            {/* Explicit Demo Payment Confirmation CTA */}
            <div className="pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-gray-600">
                Untuk keperluan pengujian demo portfolio:
              </span>
              <button
                type="button"
                onClick={() => confirmPaymentMutation.mutate()}
                disabled={confirmPaymentMutation.isPending}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {confirmPaymentMutation.isPending ? (
                  <span>Mengonfirmasi...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Konfirmasi Pembayaran (Simulasi Demo)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Paid Confirmation Success Notice */}
        {isPaid && (
          <div className="mt-6 p-4 bg-[#F5F6F6] border border-gray-200 rounded-2xl text-left text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#003d29] shrink-0" />
            <div>
              <p className="font-bold text-gray-900">Pembayaran Berhasil Diverifikasi!</p>
              <p className="text-[#003d29] mt-0.5">
                Status pembayaran lunas. Paket oleh-olehmu saat ini sedang dipersiapkan untuk segera dikirim.
              </p>
            </div>
          </div>
        )}

        {/* Delivery Details Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 text-left text-xs">
          <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Truck className="w-4 h-4 text-[#003d29]" />
              <span>Pengiriman Kurir Ekspres</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Paket oleh-oleh dibungkus kardus tebal & bubble wrap, kemudian diserahkan ke pihak ekspedisi maksimal 1x24 jam.
            </p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Package className="w-4 h-4 text-[#003d29]" />
              <span>{isCod ? 'Bayar di Tempat (COD)' : 'Packing Aman & Rapi'}</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {isCod
                ? 'Siapkan uang pas sesuai total tagihan saat kurir ekspedisi datang mengantar paket ke alamatmu.'
                : 'Resi pengiriman otomatis akan diperbarui setelah kurir menjemput paket pesananmu.'}
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold px-7 py-3.5 rounded-full transition-all shadow-sm"
          >
            <span>Lanjut Belanja Oleh-oleh Lain</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
