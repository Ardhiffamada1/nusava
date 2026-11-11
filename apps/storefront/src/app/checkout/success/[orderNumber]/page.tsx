'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ArrowRight,
  Package,
  Truck,
  Building2,
  Check,
  Clock,
  Printer,
  Copy,
  MessageSquare,
  QrCode,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@commerceos/ui';
import { apiRequest } from '../../../../lib/api';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const queryClient = useQueryClient();

  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  // Fetch real order data from public endpoint
  const { data: order } = useQuery({
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
    },
    onError: (err: any) => {
      alert(err.message || 'Gagal mengonfirmasi pembayaran demo');
    },
  });

  const paymentStatus = order?.payment?.status || 'PENDING';
  const isPaid = paymentStatus === 'PAID';
  const isBankTransfer = order?.payment?.method === 'MANUAL_BANK_TRANSFER';
  const isCod = order?.payment?.method === 'CASH_ON_DELIVERY';

  const handleCopy = (text: string, bankName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankName);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Halo CS Oleh-Oleh Nusantara! Saya ingin konfirmasi pesanan saya:\n\n` +
      `📦 No. Pesanan: ${orderNumber}\n` +
      `💰 Total: ${order ? formatCurrency(order.grandTotal) : ''}\n` +
      `💳 Metode Bayar: ${isCod ? 'Bayar di Tempat (COD)' : 'Transfer Bank'}\n\n` +
      `Mohon dibantu proses pengirimannya ya. Terima kasih!`
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 font-sans">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-xs">
        {/* Header Icon & Title */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5F6F6] border border-gray-200 flex items-center justify-center mx-auto mb-4 text-[#003d29]">
            <CheckCircle2 className="w-9 h-9 stroke-[2]" />
          </div>

          <span className="text-xs uppercase tracking-widest text-[#003d29] font-bold block mb-1">
            PESANAN BERHASIL DITERIMA
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Terima kasih atas pesananmu!
          </h1>
          <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
            Pesanan oleh-oleh khas Nusantara sudah masuk ke sistem dan stok produk langsung diamankan. Kami akan segera
            menyiapkan paketmu dengan kemasan higienis dan bubble wrap tebal.
          </p>
        </div>

        {/* Order Reference Card */}
        <div className="mt-8 p-5 bg-[#FAF9F5] border border-gray-200 rounded-2xl flex flex-wrap items-center justify-around gap-4 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Nomor Pesanan
            </span>
            <span className="font-bold text-gray-900 mt-0.5 block font-mono">{orderNumber}</span>
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
                isPaid ? 'text-[#003d29]' : 'text-amber-700'
              }`}
            >
              {isPaid ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#003d29]" />
                  <span>Sudah Lunas (PAID)</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isCod ? 'Bayar Saat Paket Tiba (COD)' : 'Menunggu Transfer'}</span>
                </>
              )}
            </span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Total Tagihan
            </span>
            <span className="font-bold text-[#003d29] mt-0.5 block text-base">
              {order ? formatCurrency(order.grandTotal) : '...'}
            </span>
          </div>
        </div>

        {/* Action Bar: WhatsApp Confirmation & Print Invoice */}
        <div className="mt-6 flex flex-wrap gap-3 items-center justify-center">
          <a
            href={`https://wa.me/6281234567890?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[240px] py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Konfirmasi Pesanan via WhatsApp CS</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold text-xs rounded-full shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            <span>Cetak Invoice</span>
          </button>
        </div>

        {/* Bank Transfer Instructions & 1-Click Copy */}
        {isBankTransfer && !isPaid && (
          <div className="mt-8 p-6 bg-amber-50/50 border border-amber-200/80 rounded-2xl text-left text-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                <Building2 className="w-5 h-5 text-amber-700" />
                <span>Instruksi Transfer Bank Resmi</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Verifikasi Cepat
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Silakan lakukan transfer sejumlah{' '}
              <strong className="text-gray-900 font-bold">
                {order ? formatCurrency(order.grandTotal) : ''}
              </strong>{' '}
              ke salah satu rekening resmi PT Oleh Oleh Nusantara:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* BCA */}
              <div className="p-3.5 bg-white border border-amber-200 rounded-xl relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-700 font-black text-xs">BCA</span>
                    {copiedBank === 'BCA' && (
                      <span className="text-[10px] text-emerald-700 font-bold">Tersalin!</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900 text-sm font-mono block">873-019-2819</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">a.n PT Oleh Oleh Nusantara</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('8730192819', 'BCA')}
                  className="mt-3 w-full py-1.5 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-[11px] rounded-lg border border-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3 h-3 text-gray-500" />
                  <span>Salin Rekening</span>
                </button>
              </div>

              {/* Mandiri */}
              <div className="p-3.5 bg-white border border-amber-200 rounded-xl relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-700 font-black text-xs">MANDIRI</span>
                    {copiedBank === 'MANDIRI' && (
                      <span className="text-[10px] text-emerald-700 font-bold">Tersalin!</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900 text-sm font-mono block">137-00-1928-1122</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">a.n PT Oleh Oleh Nusantara</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('1370019281122', 'MANDIRI')}
                  className="mt-3 w-full py-1.5 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-[11px] rounded-lg border border-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3 h-3 text-gray-500" />
                  <span>Salin Rekening</span>
                </button>
              </div>

              {/* BNI */}
              <div className="p-3.5 bg-white border border-amber-200 rounded-xl relative flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-teal-700 font-black text-xs">BNI</span>
                    {copiedBank === 'BNI' && (
                      <span className="text-[10px] text-emerald-700 font-bold">Tersalin!</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900 text-sm font-mono block">092-182-3819</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">a.n PT Oleh Oleh Nusantara</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('0921823819', 'BNI')}
                  className="mt-3 w-full py-1.5 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-[11px] rounded-lg border border-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3 h-3 text-gray-500" />
                  <span>Salin Rekening</span>
                </button>
              </div>
            </div>

            {/* QRIS Alternative Payment Card */}
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 bg-[#FAF9F5] border border-gray-200 rounded-xl flex flex-col items-center justify-center shrink-0 p-2">
                <QrCode className="w-14 h-14 text-gray-800" />
                <span className="text-[9px] font-bold text-gray-600 mt-1 uppercase">QRIS STANDAR</span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold text-gray-900">Pembayaran Cepat QRIS Instan</span>
                  <span className="text-[9px] font-bold text-white bg-rose-600 px-1.5 py-0.5 rounded">SEMUA E-WALLET</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Mendukung GoPay, OVO, DANA, ShopeePay, LinkAja, serta seluruh aplikasi Mobile Banking.
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  NMID: ID1020038918291 • PT OLEH OLEH NUSANTARA
                </p>
              </div>
            </div>

            {/* Demo Payment Confirmation CTA */}
            <div className="pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-gray-600">
                Untuk pengujian simulasi sistem demo:
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
          <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Pembayaran Berhasil Diverifikasi!</p>
              <p className="text-emerald-800 mt-0.5">
                Status pembayaran lunas. Paket oleh-olehmu saat ini sedang dipersiapkan untuk segera dikirim melalui ekspedisi pilihan.
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
              <span>{isCod ? 'Bayar di Tempat (COD)' : 'Garansi Pengiriman Aman'}</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {isCod
                ? 'Siapkan uang pas sesuai total tagihan saat kurir ekspedisi tiba di alamat pengirimanmu.'
                : 'Jaminan ganti baru atau uang kembali jika oleh-oleh rusak atau remuk saat sampai.'}
            </p>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold px-7 py-3.5 rounded-full transition-all shadow-sm"
          >
            <span>Lihat Daftar Pesanan di Akun</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#FAF9F5] hover:bg-[#FCF0E4] text-[#003d29] border border-gray-200 text-xs font-bold px-7 py-3.5 rounded-full transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Lanjut Belanja Oleh-oleh Lain</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
