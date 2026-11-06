'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, Truck, ArrowLeft } from 'lucide-react';
import { formatDate } from '@commerceos/ui';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 font-sans">
      <div className="bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-[#003d29]">
          <CheckCircle2 className="w-9 h-9 stroke-[2]" />
        </div>

        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-800 font-bold block mb-1">
          PESANAN BERHASIL DITERIMA
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Terima kasih atas pesananmu!
        </h1>
        <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
          Pesananmu sudah masuk ke sistem dan stok produk sudah langsung diamankan. Kami akan segera
          menyiapkan paket oleh-olehmu dengan kemasan aman.
        </p>

        {/* Order Reference Card */}
        <div className="mt-8 p-4 bg-[#F9FAFA] border border-gray-200 rounded-2xl flex flex-wrap items-center justify-around gap-4 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Nomor Pesanan
            </span>
            <span className="font-mono font-bold text-gray-900 mt-0.5 block">{orderNumber}</span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Tanggal Pesan
            </span>
            <span className="font-mono text-gray-900 mt-0.5 block">{formatDate(new Date())}</span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-200" />
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              Status Bayar
            </span>
            <span className="text-emerald-700 font-bold mt-0.5 block">Menunggu Konfirmasi</span>
          </div>
        </div>

        {/* Delivery Details Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 text-left text-xs">
          <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Truck className="w-4 h-4 text-[#003d29]" />
              <span>Pengiriman Kurir</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Paketmu dibungkus bubble wrap tebal dan diserahkan ke pihak ekspedisi maksimal 1x24 jam.
            </p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Package className="w-4 h-4 text-[#003d29]" />
              <span>Bayar di Tempat (COD)</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Jika memilih COD, siapkan uang pas sesuai total tagihan saat kurir datang mengantar paket.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold px-7 py-3.5 rounded-full transition-all shadow-xs"
          >
            <span>Lanjut Belanja Oleh-oleh</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
