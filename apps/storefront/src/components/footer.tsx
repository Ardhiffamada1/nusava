'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  MessageSquare,
  MapPin,
  Mail,
  CheckCircle2,
  PhoneCall,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useLanguageStore, translations } from '../stores/language-store';
import { JneLogo, JntLogo, SicepatLogo } from './courier-logos';
import { OFFICIAL_WA_NUMBER } from '../lib/storefront-helpers';

export function Footer() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const isId = language === 'id';

  const customerCareWaUrl = `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(
    'Halo Layanan Pelanggan Mindi Nusantara! Saya ingin menanyakan informasi pemesanan.',
  )}`;

  return (
    <footer className="border-t border-stone-200 bg-[#FAF9F5] mt-24 font-sans text-stone-700">
      {/* 1. TOP MARKETPLACE ASSURANCE STRIP */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#003d29]/10 text-[#003d29] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {isId ? '100% Produk UMKM Asli' : '100% Authentic Local Goods'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {isId
                    ? 'Terkurasi langsung dari dapur sentral dan workshop pengrajin terverifikasi.'
                    : 'Curated directly from verified local culinary kitchens and artisan workshops.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#003d29]/10 text-[#003d29] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {isId ? 'Garansi Paket Rusak' : 'Transit Damage Guarantee'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {isId
                    ? 'Penggantian baru atau uang kembali 100% jika produk rusak saat pengiriman.'
                    : '100% replacement or refund if items damaged in courier transit.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#003d29]/10 text-[#003d29] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {isId ? 'Ekspedisi Resmi Terlacak' : 'Official Tracked Couriers'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {isId
                    ? 'Mitra JNE, J&T, dan SiCepat dengan nomor resi aktif real-time.'
                    : 'Partnering with JNE, J&T, and SiCepat with live tracking.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#003d29]/10 text-[#003d29] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {isId ? 'Bayar Aman & COD' : 'Secure Payment & COD'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {isId
                    ? 'QRIS instan, Transfer Bank Virtual, hingga Bayar di Tempat saat paket tiba.'
                    : 'QRIS, Virtual Accounts, or cash on delivery when parcel arrives.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 5-COLUMN NAVIGATION FOOTER */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Brand & Contact Info (3.5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <span className="font-extrabold text-base tracking-[0.18em] text-stone-900 uppercase block">
                {t.brandName}
              </span>
              <span className="text-[10px] tracking-widest text-[#003d29] font-mono font-bold block mt-0.5">
                {t.brandSub}
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed pr-2">
              {t.footer.description}
            </p>

            {/* Direct Support Card */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{isId ? 'Layanan Bantuan Pelanggan' : 'Customer Concierge'}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                {isId ? 'Senin - Minggu: 08:00 - 21:00 WIB' : 'Mon - Sun: 08:00 - 21:00 WIB'}
              </p>
              <div className="pt-1 flex flex-col gap-1.5">
                <a
                  href={customerCareWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <span>WhatsApp: +62 812-3456-7890</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-[11px] text-stone-400 font-mono">
                  Email: bantuan@mindi-nusantara.id
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Ragam Oleh-oleh Daerah (2.5 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              {isId ? 'Oleh-oleh Daerah Populer' : 'Popular Regional Heirlooms'}
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link
                  href="/products?origin=Jogja"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  {isId ? 'Khas Yogyakarta (Bakpia Pathok & Gudeg)' : 'Yogyakarta (Bakpia & Gudeg)'}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?origin=Bali"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  {isId ? 'Khas Bali (Pie Susu & Kacang Disco)' : 'Bali (Milk Pie & Island Delights)'}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?origin=Surabaya"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  {isId ? 'Khas Surabaya (Sambal Bu Rudy & Almond)' : 'Surabaya (Sambal Bu Rudy & Bakes)'}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?origin=Bandung"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  {isId ? 'Khas Bandung (Bolen Pisang & Brownies)' : 'Bandung (Pastries & Treats)'}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=kopi-minuman"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  {isId ? 'Kopi Dataran Tinggi Gayo & Toraja' : 'Gayo & Toraja Specialty Coffee'}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=batik-wastra"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  {isId ? 'Batik Tulis Solo & Tenun Troso ATBM' : 'Handcrafted Batik & Troso Woven'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Layanan & Panduan Pembeli (2.5 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              {isId ? 'Panduan Pembeli' : 'Customer Service'}
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link href="/account" className="hover:text-[#003d29] hover:underline transition-colors block">
                  {isId ? 'Lacak Resi Pengiriman' : 'Track Order Status'}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#003d29] hover:underline transition-colors block">
                  {isId ? 'Cek Estimasi Ongkir' : 'Shipping Rates'}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#003d29] hover:underline transition-colors block">
                  {isId ? 'Voucher Promo & Kupon' : 'Vouchers & Coupons'}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#003d29] hover:underline transition-colors block">
                  {isId ? 'Hampers & Besek Kado' : 'Gift Box & Packaging'}
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#003d29] hover:underline transition-colors block">
                  {isId ? 'Garansi Penggantian Baru' : 'Replacement Guarantee'}
                </Link>
              </li>
              <li>
                <a
                  href={customerCareWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  {isId ? 'Bantuan & Tanya Jawab' : 'Help & FAQ'}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Metode Pembayaran & Ekspedisi Resmi (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
                {isId ? 'Metode Pembayaran Resmi' : 'Payment Methods'}
              </h4>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-stone-700">
                <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-md shadow-2xs">
                  QRIS
                </span>
                <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-md shadow-2xs">
                  BCA
                </span>
                <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-md shadow-2xs">
                  Mandiri
                </span>
                <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-md shadow-2xs">
                  BNI
                </span>
                <span className="bg-white border border-stone-200 px-2.5 py-1 rounded-md shadow-2xs">
                  BRI
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                  COD (Bayar di Tempat)
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
                {isId ? 'Mitra Ekspedisi Resmi' : 'Official Logistics'}
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <JneLogo className="h-7 w-auto" />
                <JntLogo className="h-7 w-auto" />
                <SicepatLogo className="h-7 w-auto" />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                {isId
                  ? 'Pengiriman reguler, ekspres kilat (YES / BEST), dan kargo aman.'
                  : 'Insured express, next-day, and ground delivery across islands.'}
              </p>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>P-IRT & Halal Terverifikasi</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM COPYRIGHT & REGULATORY BAR */}
        <div className="border-t border-stone-200 mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 {t.brandName} Nusantara. {t.footer.rights}</p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-500">
            <span className="hover:text-stone-900 cursor-pointer">Kebijakan Privasi</span>
            <span>•</span>
            <span className="hover:text-stone-900 cursor-pointer">Syarat & Ketentuan</span>
            <span>•</span>
            <span className="hover:text-stone-900 cursor-pointer">Panduan Keamanan Belanja</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
