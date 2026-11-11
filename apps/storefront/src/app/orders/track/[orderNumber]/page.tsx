'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Home,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@commerceos/ui';
import { apiRequest } from '../../../../lib/api';
import { CourierLogo } from '../../../../components/courier-logos';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const [copiedResi, setCopiedResi] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['track-order', orderNumber],
    queryFn: () => apiRequest<any>(`/orders/public/${orderNumber}`),
    enabled: !!orderNumber,
  });

  const courierName = order?.notes?.includes('SiCepat')
    ? 'SiCepat'
    : order?.notes?.includes('J&T')
    ? 'jnt-ez'
    : 'jne-reg';

  const courierDisplayName = courierName === 'SiCepat'
    ? 'SiCepat Ekspres (BEST)'
    : courierName === 'jnt-ez'
    ? 'J&T Express (EZ)'
    : 'JNE Express (Reguler)';

  const resiNumber = `IDN${orderNumber?.replace(/[^0-9]/g, '')?.slice(-8) || '88392019'}`;

  const handleCopyResi = () => {
    navigator.clipboard.writeText(resiNumber);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const isDelivered = order?.status === 'DELIVERED';
  const isShipped = order?.status === 'SHIPPED' || isDelivered;
  const isProcessing = order?.status === 'PROCESSING' || isShipped;

  const trackingSteps = [
    {
      title: 'Pesanan Dibuat & Dikonfirmasi',
      description: 'Pesanan berhasil masuk dan diverifikasi oleh sistem toko.',
      time: order?.createdAt ? formatDateTime(order.createdAt) : '10:00 WIB',
      isCompleted: true,
      isActive: false,
    },
    {
      title: 'Sedang Dikemas Oleh Pengrajin Daerah',
      description: 'Produk oleh-oleh dibungkus kardus tebal dan lapisan bubble wrap protektif.',
      time: '11:30 WIB',
      isCompleted: isProcessing,
      isActive: isProcessing && !isShipped,
    },
    {
      title: `Diserahkan ke Pihak Ekspedisi (${courierDisplayName})`,
      description: `Paket telah di-pickup kurir dan mendapatkan resi pengiriman ${resiNumber}.`,
      time: '15:45 WIB',
      isCompleted: isShipped,
      isActive: isShipped && !isDelivered,
    },
    {
      title: 'Paket Sedang Dalam Perjalanan Menuju Alamat',
      description: `Bergerak dari Sentra Hub Pengrajin menuju kota tujuan (${order?.shippingAddress?.city || 'Kota Tujuan'}).`,
      time: '04:15 WIB',
      isCompleted: isShipped,
      isActive: isShipped && !isDelivered,
    },
    {
      title: 'Paket Berhasil Diterima',
      description: `Tiba di alamat tujuan dan diterima oleh ${order?.shippingAddress?.fullName || 'Penerima'}.`,
      time: isDelivered ? '09:20 WIB' : 'Estimasi: 1-2 Hari',
      isCompleted: isDelivered,
      isActive: isDelivered,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pesanan Saya</span>
        </Link>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29] block">
              PELACAKAN PAKET EKSPEDISI REAL-TIME
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
              Lacak Pengiriman #{orderNumber}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Pantau perjalanan oleh-oleh khas Nusantara dari sentra pengrajin hingga tiba di depan pintu rumahmu.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#FAF9F5] p-3 rounded-2xl border border-gray-200 shrink-0">
            <CourierLogo courierId={courierName} className="h-7 w-auto" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Ekspedisi Resmi</span>
              <span className="text-xs font-bold text-gray-900">{courierDisplayName}</span>
            </div>
          </div>
        </div>

        {/* Resi & Status Strip */}
        <div className="p-4 bg-[#F5F6F6] rounded-2xl border border-gray-200/70 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Nomor Resi:</span>
            <span className="font-mono font-bold text-gray-900 text-sm">{resiNumber}</span>
            <button
              type="button"
              onClick={handleCopyResi}
              className="p-1 hover:bg-white rounded-md text-gray-500 hover:text-gray-900 transition-colors"
              title="Salin nomor resi"
            >
              {copiedResi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {copiedResi && <span className="text-[10px] text-emerald-700 font-bold">Tersalin!</span>}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Status Terkini:</span>
            <span className="font-bold text-[#003d29] bg-[#003d29]/10 px-3 py-1 rounded-full text-xs">
              {isDelivered ? 'Paket Diterima' : isShipped ? 'Dalam Perjalanan Kurir' : 'Sedang Dikemas'}
            </span>
          </div>
        </div>

        {/* Visual Timeline Tracking */}
        <div className="space-y-6 pt-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Riwayat Titik Pengiriman
          </h2>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {trackingSteps.map((step, idx) => {
              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-[23px] sm:-left-[27px] mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      step.isCompleted
                        ? 'bg-[#003d29] text-white ring-4 ring-[#003d29]/15'
                        : step.isActive
                        ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                        : 'bg-white border-2 border-gray-300 text-gray-300'
                    }`}
                  >
                    {step.isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3
                        className={`text-xs sm:text-sm font-bold ${
                          step.isCompleted || step.isActive ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-gray-400 font-mono">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destination & Buyer Details */}
        <div className="p-5 bg-[#FAF9F5] border border-gray-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">
              Alamat Pengiriman
            </span>
            <p className="font-bold text-gray-900">
              {order?.shippingAddress?.fullName || 'Pembeli Nusantara'}
            </p>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              {order?.shippingAddress?.streetAddress || 'Jl. Malioboro No. 25'}
            </p>
            <p className="text-gray-600 text-[11px]">
              {order?.shippingAddress?.city || 'Yogyakarta'}, {order?.shippingAddress?.state || 'DI Yogyakarta'} {order?.shippingAddress?.postalCode || '55271'}
            </p>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-4 pt-3 sm:pt-0">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">
              Jaminan Pengiriman
            </span>
            <div className="flex items-center gap-2 text-gray-800 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-[#003d29]" />
              <span>Garansi Ganti Baru Jika Rusak</span>
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Jika kemasan rusak atau basi selama perjalanan ekspedisi, hubungi CS kami dengan menyertakan foto unboxing untuk proses klaim instan.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
          <Link
            href="/account"
            className="text-gray-600 hover:text-black font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Riwayat Pesanan</span>
          </Link>

          <Link
            href="/products"
            className="bg-[#003d29] hover:bg-[#002b1c] text-white font-bold py-2.5 px-6 rounded-full transition-colors shadow-2xs"
          >
            Belanja Oleh-oleh Lain
          </Link>
        </div>
      </div>
    </div>
  );
}
