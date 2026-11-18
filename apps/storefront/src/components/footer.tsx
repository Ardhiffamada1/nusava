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
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useLanguageStore, translations } from '../stores/language-store';
import { JneLogo, JntLogo, SicepatLogo, PosLogo } from './courier-logos';
import {
  QrisBadge,
  BcaBadge,
  MandiriBadge,
  BniBadge,
  BriBadge,
  CodBadge,
} from './payment-logos';
import { OFFICIAL_WA_NUMBER } from '../lib/storefront-helpers';
import { NusavaLogo } from './nusava-logo';

export function Footer() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const isId = language === 'id';

  const customerCareWaUrl = `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(
    'Halo Layanan Pelanggan NUSAVA! Saya ingin menanyakan informasi produk dan pesanan saya.',
  )}`;

  const googleMapsUrl =
    'https://maps.google.com/?q=Malioboro+Yogyakarta+Indonesia';

  return (
    <footer className="border-t border-stone-200 bg-[#FAF9F5] mt-20 sm:mt-24 font-sans text-stone-700">
      {/* 1. Nilai Layanan Utama */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#003d29]/10 text-[#003d29] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {isId ? '100% Produk Asli Daerah' : '100% Authentic Regional Goods'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {isId
                    ? 'Langsung dari produsen dan dapur oleh-oleh terpercaya di berbagai daerah.'
                    : 'Directly sourced from trusted local producers across Indonesia.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#003d29]/10 text-[#003d29] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {isId ? 'Garansi Paket Rusak' : 'Transit Damage Guarantee'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {isId
                    ? 'Penggantian baru atau dana kembali jika paket rusak dalam perjalanan.'
                    : 'Replacement or refund if items are damaged during transit.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#003d29]/10 text-[#003d29] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {isId ? 'Ekspedisi Resmi Terlacak' : 'Official Tracked Couriers'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {isId
                    ? 'Didukung JNE, J&T, SiCepat, dan Pos Indonesia dengan resi otomatis.'
                    : 'Supported by JNE, J&T, SiCepat, and Pos Indonesia with live tracking.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#003d29]/10 text-[#003d29] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {isId ? 'Bayar Aman & COD' : 'Secure Payment & COD'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {isId
                    ? 'QRIS, Transfer Bank BCA, Mandiri, BNI, BRI, hingga Bayar di Tempat.'
                    : 'QRIS, Bank Transfer, and Cash on Delivery.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Lokasi Operasional & Google Maps */}
      <div className="border-b border-stone-200 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10">
          <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Kolom Info Lokasi */}
              <div className="lg:col-span-5 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#003d29] shrink-0" />
                    <span>Kantor & Pusat Pengiriman NUSAVA</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Jl. Malioboro No. 56, Sosromenduran, Gedong Tengen, Kota Yogyakarta, Daerah
                    Istimewa Yogyakarta 55271
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Jam Operasional: Senin – Minggu, 08:00 – 21:00 WIB</span>
                </div>

                <div className="pt-1 flex items-center gap-3">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#003d29] hover:bg-[#00281b] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <span>Buka di Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={customerCareWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Kontak WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Kolom Google Maps */}
              <div className="lg:col-span-7">
                <div className="w-full h-[200px] sm:h-[220px] rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                  <iframe
                    title="Lokasi Kantor NUSAVA Yogyakarta"
                    src="https://maps.google.com/maps?q=Malioboro+Yogyakarta&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigasi Footer & Informasi Resmi */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Kolom 1: Profil Brand */}
          <div className="lg:col-span-4 space-y-3.5">
            <Link href="/" className="inline-block group focus:outline-none">
              <NusavaLogo size="md" showTagline={true} />
            </Link>

            <p className="text-xs text-stone-500 leading-relaxed pr-2">
              Pusat belanja online oleh-oleh khas daerah terlengkap dari seluruh penjuru Indonesia.
              Menghadirkan produk kuliner otentik dan kerajinan lokal langsung dari produsen aslinya.
            </p>

            <div className="pt-1 text-xs text-stone-600 space-y-1">
              <p className="font-semibold text-stone-800">Layanan Pelanggan:</p>
              <p className="text-[11px] text-stone-500">WhatsApp: +62 812-3456-7890</p>
              <p className="text-[11px] text-stone-500 font-mono">Email: bantuan@nusava.id</p>
            </div>
          </div>

          {/* Kolom 2: Oleh-oleh Daerah Populer */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Oleh-oleh Daerah Populer
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link
                  href="/products?origin=Jogja"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  Khas Yogyakarta (Bakpia Pathok & Gudeg)
                </Link>
              </li>
              <li>
                <Link
                  href="/products?origin=Bali"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  Khas Bali (Pie Susu & Kacang Bali)
                </Link>
              </li>
              <li>
                <Link
                  href="/products?origin=Surabaya"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  Khas Surabaya (Sambal Bu Rudy & Lapis)
                </Link>
              </li>
              <li>
                <Link
                  href="/products?origin=Bandung"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  Khas Bandung (Bolen Pisang & Brownies)
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=kopi-minuman"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  Kopi Dataran Tinggi Gayo & Toraja
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=batik-wastra"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  Batik Tulis Solo & Tenun Nusantara
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Panduan Pembeli */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Panduan Pembeli
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link href="/account" className="hover:text-[#003d29] hover:underline transition-colors block">
                  Lacak Resi Pengiriman
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#003d29] hover:underline transition-colors block">
                  Cek Estimasi Ongkir
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#003d29] hover:underline transition-colors block">
                  Voucher Promo & Diskon
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#003d29] hover:underline transition-colors block">
                  Paket Kado & Kemasan Khusus
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#003d29] hover:underline transition-colors block">
                  Garansi Ganti Baru
                </Link>
              </li>
              <li>
                <a
                  href={customerCareWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#003d29] hover:underline transition-colors block"
                >
                  Bantuan & FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Ekspedisi, Pembayaran, dan Mutu Resmi */}
          <div className="lg:col-span-3 space-y-5">
            {/* Mitra Ekspedisi Resmi */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Mitra Ekspedisi Resmi
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 bg-white border border-stone-200 rounded-lg">
                  <JneLogo className="h-5 w-auto border-0 shadow-none px-0 py-0" />
                  <span className="text-xs font-semibold text-stone-800">JNE Express</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white border border-stone-200 rounded-lg">
                  <JntLogo className="h-5 w-auto border-0 shadow-none px-0 py-0" />
                  <span className="text-xs font-semibold text-stone-800">J&T Express</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white border border-stone-200 rounded-lg">
                  <SicepatLogo className="h-5 w-auto border-0 shadow-none px-0 py-0" />
                  <span className="text-xs font-semibold text-stone-800">SiCepat Ekspres</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white border border-stone-200 rounded-lg">
                  <PosLogo className="h-5 w-auto border-0 shadow-none px-0 py-0" />
                  <span className="text-xs font-semibold text-stone-800">Pos Indonesia</span>
                </div>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed pt-0.5">
                Pengiriman reguler, ekspres kilat (YES / BEST), dan kargo aman.
              </p>
            </div>

            {/* Metode Pembayaran */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Metode Pembayaran
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <QrisBadge />
                <BcaBadge />
                <MandiriBadge />
                <BniBadge />
                <BriBadge />
                <CodBadge />
              </div>
            </div>

            {/* P-IRT & Halal Terverifikasi */}
            <div className="pt-1">
              <div className="flex items-center gap-2 text-stone-900">
                <ShieldCheck className="w-4 h-4 text-[#003d29] shrink-0" />
                <span className="text-xs font-bold">P-IRT & Halal Terverifikasi</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Produk makanan dan minuman terdaftar resmi izin Dinkes P-IRT dan bersertifikat Halal.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Hak Cipta & Ketentuan Legal */}
        <div className="border-t border-stone-200 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 NUSAVA. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-500">
            <span className="hover:text-stone-900 cursor-pointer">Kebijakan Privasi</span>
            <span>•</span>
            <span className="hover:text-stone-900 cursor-pointer">Syarat & Ketentuan</span>
            <span>•</span>
            <span className="hover:text-stone-900 cursor-pointer">Keamanan Belanja</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
