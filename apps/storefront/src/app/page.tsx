'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  ChevronDown,
  SlidersHorizontal,
  Check,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Clock,
  MapPin,
  Compass,
  Scale,
  Layers,
  FlaskConical,
  FileText,
  TrendingUp,
  Building,
  CheckCircle2,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../stores/cart-store';
import { useWishlistStore } from '../stores/wishlist-store';
import { getProductOrigin, NUSANTARA_ORIGIN_TABS } from '../lib/storefront-helpers';

export default function RawIngredientsStorefrontHome() {
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('');
  const [activeOriginFilter, setActiveOriginFilter] = useState<string>('');
  const [activeSector, setActiveSector] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');

  // Interactive RFQ / Sample Request Form States
  const [rfqCommodity, setRfqCommodity] = useState('Biji Kopi Arabika Gayo');
  const [rfqVolume, setRfqVolume] = useState('100');
  const [rfqType, setRfqType] = useState('sampel');

  // Flash Harvest Deals Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch featured catalog products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['featured-products', activeCategoryFilter, activeOriginFilter, sortOption],
    queryFn: () => {
      const p = new URLSearchParams();
      if (activeCategoryFilter) p.set('category', activeCategoryFilter);
      if (activeOriginFilter) p.set('origin', activeOriginFilter);
      p.set('sortBy', sortOption);
      p.set('limit', '12');
      return apiRequest<{ items: any[] }>(`/products?${p.toString()}`);
    },
  });

  const toggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const primaryImage =
      product.images?.find((img: any) => img.isThumbnail)?.url ||
      product.images?.[0]?.url ||
      'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg';

    toggleItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.basePrice),
      imageUrl: primaryImage,
      category: product.category?.name,
      origin: getProductOrigin(product).badge,
    });
  };

  const handleQuickAdd = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants?.[0];
    if (!defaultVariant) return;

    await addItem(defaultVariant.id, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
    openCart();
  };

  // Live Commodity Benchmark Ticker
  const commodityTicker = [
    { name: 'Kopi Arabika Gayo Green Bean', origin: 'Aceh Takengon', price: 98000, unit: 'kg', trend: '+1.2%', isUp: true },
    { name: 'Gula Semut Aren Organik', origin: 'Kulon Progo', price: 28500, unit: 'kg', trend: 'Stabil', isUp: null },
    { name: 'Cengkeh Kering Grade Ekspor', origin: 'Maluku', price: 128000, unit: 'kg', trend: '+0.8%', isUp: true },
    { name: 'Kakao Fermentasi Utuh', origin: 'Sulawesi Selatan', price: 84000, unit: 'kg', trend: '+2.1%', isUp: true },
    { name: 'Virgin Coconut Oil (VCO)', origin: 'Sulawesi Utara', price: 68000, unit: 'L', trend: 'Stabil', isUp: null },
    { name: 'Jahe Merah Kering Simplisia', origin: 'Jawa Tengah', price: 42000, unit: 'kg', trend: '-0.5%', isUp: false },
  ];

  // Curated Raw Material Harvest Batch Deals
  const flashSaleItems = [
    {
      id: 'fs-1',
      title: 'Biji Kopi Arabika Gayo Specialty Grade 1',
      slug: 'kopi-arabika-gayo-aceh',
      specs: 'Kadar Air 11.8% • Defect < 3% • Single Origin',
      unit: 'kg',
      originalPrice: 95000,
      flashPrice: 69000,
      discount: 27,
      soldPercentage: 86,
      stockLeft: 120,
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
      category: 'Bahan Baku Kopi',
      bulkPrice: 'Grosir >20 kg: Rp 64.000',
    },
    {
      id: 'fs-2',
      title: 'Gula Semut Aren Organik Kristal Murni (Mesh 16-18)',
      slug: 'gula-semut-aren-organik',
      specs: 'Kadar Air 1.8% • 100% Nira Murni • Tanpa Pengawet',
      unit: 'kg',
      originalPrice: 35000,
      flashPrice: 24500,
      discount: 30,
      soldPercentage: 92,
      stockLeft: 250,
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Rendang_daging_sapi_asli_Padang.JPG',
      category: 'Pemanis Alami',
      bulkPrice: 'Grosir >50 kg: Rp 21.000',
    },
    {
      id: 'fs-3',
      title: 'Cengkeh Kering Super Asli Maluku (Kadar Minyak Tinggi)',
      slug: 'cengkeh-kering-super-maluku',
      specs: 'Sortir Tangan • Bunga Utuh Tanpa Gagang • Siap Ekspor',
      unit: 'kg',
      originalPrice: 140000,
      flashPrice: 108000,
      discount: 23,
      soldPercentage: 74,
      stockLeft: 85,
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Wedang_Uwuh_Jawa.jpg',
      category: 'Rempah Kering',
      bulkPrice: 'Grosir >10 kg: Rp 99.000',
    },
    {
      id: 'fs-4',
      title: 'Kacang Mede Mentah Kupas Utuh Grade W320',
      slug: 'kacang-mede-mentah-w320',
      specs: 'Kacang Utuh Putih • Kadar Air < 5% • Gurih Alami',
      unit: 'kg',
      originalPrice: 155000,
      flashPrice: 124000,
      discount: 20,
      soldPercentage: 89,
      stockLeft: 60,
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
      category: 'Kacang & Biji',
      bulkPrice: 'Grosir >25 kg: Rp 116.000',
    },
  ];

  // Raw Ingredients Categories
  const rawCategories = [
    {
      title: 'Biji Kopi & Kakao Mentah',
      subtitle: 'Green Bean Arabika, Robusta & Biji Kakao Fermentasi',
      slug: 'kopi-minuman',
      moq: 'Min. 1 kg / Sak 60 kg',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
      badge: 'Grade Specialty',
    },
    {
      title: 'Rempah Kering & Simplisia',
      subtitle: 'Cengkeh, Kapulaga, Kayu Manis, Jahe Merah & Kunyit',
      slug: 'sambal-bumbu',
      moq: 'Min. 500g / Karung 25 kg',
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Wedang_Uwuh_Jawa.jpg',
      badge: 'Standar Ekspor',
    },
    {
      title: 'Pemanis Alami & Gula Kelapa',
      subtitle: 'Gula Semut Aren, Gula Kelapa Cetak & Madu Hutan',
      slug: 'kudapan-khas',
      moq: 'Min. 1 kg / Bal 10 kg',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
      badge: '100% Organik',
    },
    {
      title: 'Aneka Tepung & Karbohidrat Olahan',
      subtitle: 'Tepung Mocaf Bebas Gluten, Tapioka & Beras Organik',
      slug: 'kudapan-khas',
      moq: 'Min. 1 kg / Sak 25 kg',
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg',
      badge: 'Gluten Free',
    },
    {
      title: 'Minyak & Lemak Nabati Murni',
      subtitle: 'Virgin Coconut Oil (VCO), Minyak Kemiri & Minyak Wijen',
      slug: 'kriya-kerajinan',
      moq: 'Min. 1 L / Jerigen 20 L',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Cobek.jpg',
      badge: 'Cold Pressed',
    },
    {
      title: 'Kacang & Biji-Bijian Mentah',
      subtitle: 'Mede Mentah W320, Biji Wijen & Kedelai Lokal Non-GMO',
      slug: 'kudapan-khas',
      moq: 'Min. 1 kg / Vakum 10 kg',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
      badge: 'Food Grade',
    },
  ];

  // Industry Sectors Filter
  const industrySectors = [
    { id: '', label: 'Semua Sektor Industri' },
    { id: 'fnb', label: 'Industri F&B & Restoran' },
    { id: 'coffee', label: 'Coffee Roastery & Cafe' },
    { id: 'bakery', label: 'Bakery, Pastry & Olahan Kue' },
    { id: 'herbal', label: 'Industri Jamu & Herbal' },
    { id: 'horeca', label: 'Hotel & Katering (HoReCa)' },
  ];

  const rfqWhatsappMessage = encodeURIComponent(
    `Halo Tim Pengadaan Bahan Baku Nusantara!\n\n` +
      `Saya tertarik untuk mengajukan kebutuhan bahan baku:\n` +
      `• Komoditas: ${rfqCommodity}\n` +
      `• Estimasi Volume: ${rfqVolume} kg\n` +
      `• Kebutuhan: ${rfqType === 'sampel' ? 'Permintaan Sampel Uji Coba (Lab / Dapur)' : 'Pengadaan Rutin Pasokan Kontrak'}\n\n` +
      `Mohon dikirimkan spesifikasi teknis (COA) dan penawaran harga terbaik. Terima kasih!`
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 font-sans space-y-12">
      {/* 1. LIVE COMMODITY BENCHMARK PRICE TICKER */}
      <section className="bg-white border border-gray-200/90 rounded-2xl p-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#003d29] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 pb-2 lg:pb-0 lg:pr-4">
            <TrendingUp className="w-4 h-4 text-[#003d29]" />
            <span className="uppercase tracking-wider">Indeks Harga Komoditas Hari Ini</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>

          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1">
            {commodityTicker.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0 text-xs">
                <span className="font-semibold text-gray-700">{item.name}:</span>
                <span className="font-mono font-bold text-gray-900">{formatCurrency(item.price)}/{item.unit}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    item.isUp === true
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.isUp === false
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. HERO BANNER: PENGADAAN BAHAN BAKU & HASIL BUMI NUSANTARA */}
      <section className="bg-[#FCF0E4] rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl z-10 space-y-5">
          <div className="inline-flex items-center gap-2 bg-[#003d29] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-2xs">
            <Building className="w-3.5 h-3.5 text-white" />
            <span>Sentra Pasokan Bahan Baku & Industri Pangan</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#003d29] tracking-tight leading-[1.15]">
            Pusat Pengadaan Bahan Baku & Hasil Bumi Terstandarisasi
          </h1>

          <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed max-w-xl">
            Pasokan langsung dari kebun dan kelompok tani terkurasi untuk kebutuhan industri F&B, UMKM olahan pangan, roastery kopi, dan ekspor. Melayani pembelian eceran per kg hingga pasokan rutin tonase dengan Certificate of Analysis (COA).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold px-7 py-3.5 rounded-full transition-all shadow-sm"
            >
              <span>Jelajahi Katalog Bahan Baku</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/6281234567890?text=${rfqWhatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-bold px-6 py-3.5 rounded-full transition-all shadow-2xs"
            >
              <FlaskConical className="w-4 h-4 text-[#003d29]" />
              <span>Minta Sampel Uji Coba Lab</span>
            </a>
          </div>

          {/* Key Assurance Indicators */}
          <div className="pt-4 border-t border-gray-300/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-[#003d29]">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0 text-[#003d29]" />
              <span>Kemurnian 100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0 text-[#003d29]" />
              <span>Uji Lab & COA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0 text-[#003d29]" />
              <span>Harga Grosir Bertingkat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0 text-[#003d29]" />
              <span>Petani Kemitraan</span>
            </div>
          </div>
        </div>

        {/* Hero Commodity Craft Visual */}
        <div className="relative w-72 h-72 sm:w-88 sm:h-88 shrink-0">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg"
            alt="Bahan Baku Alami Nusantara"
            fill
            priority
            sizes="(max-width: 768px) 288px, 352px"
            className="object-cover rounded-3xl shadow-sm border border-emerald-900/10"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-gray-200/80 shadow-md text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Komoditas Unggulan Bulan Ini
            </span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-bold text-gray-900">Green Bean Gayo Grade 1</span>
              <span className="font-bold text-[#003d29]">Rp 69.000 / kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KATEGORI BAHAN BAKU UTAMA (6 Commodity Verticals) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-[#003d29] uppercase tracking-wider block">
              KLASIFIKASI BAHAN BAKU
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
              Kategori Komoditas & Pasokan Pangan
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Tersedia dalam kemasan eceran 1 kg hingga tonase industri palletized.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rawCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="bg-[#FAF9F5] hover:bg-white border border-gray-200/80 hover:border-[#003d29] rounded-2xl p-4 flex items-start gap-4 transition-all hover:shadow-sm group"
            >
              <div className="relative w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0 border border-gray-200 p-1">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="64px"
                  className="object-cover group-hover:scale-105 transition-transform rounded-lg"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] font-bold text-[#003d29] bg-[#003d29]/10 px-2 py-0.5 rounded-full">
                    {cat.badge}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{cat.moq}</span>
                </div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#003d29] transition-colors truncate">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH HARVEST DEALS: PASOKAN PANEN RAYA TERBATAS DENGAN COUNTDOWN */}
      <section className="bg-[#FAF9F5] border border-gray-200/80 rounded-3xl p-6 sm:p-8 text-gray-900 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                  Pasokan Panen Raya (Harga Spesial Batch Ini)
                </h2>
                <span className="bg-[#003d29] text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                  Diskon s/d 30%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Bahan baku langsung panen dari sentra kebun kemitraan, kuota terbatas setiap batch.
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-2xs self-start sm:self-auto">
            <Clock className="w-4 h-4 text-[#003d29]" />
            <span className="text-xs font-semibold text-gray-500 mr-1">
              Batch Berakhir:
            </span>
            <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
              <span className="bg-[#003d29] text-white px-2 py-0.5 rounded-md min-w-[26px] text-center">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#003d29] text-white px-2 py-0.5 rounded-md min-w-[26px] text-center">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#003d29] text-white px-2 py-0.5 rounded-md min-w-[26px] text-center">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Commodity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flashSaleItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-gray-200/70 hover:border-gray-300 shadow-2xs flex flex-col justify-between group transition-all duration-200"
            >
              <div>
                <div className="relative w-full aspect-square bg-[#F5F6F6] rounded-xl overflow-hidden mb-3">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 left-2 bg-[#003d29] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    -{item.discount}%
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#003d29] uppercase tracking-wider block">
                  {item.category}
                </span>
                <Link
                  href={`/products/${item.slug}`}
                  className="text-xs font-bold text-gray-900 hover:text-[#003d29] line-clamp-1 transition-colors mt-0.5 block"
                >
                  {item.title}
                </Link>

                <p className="text-[10px] text-gray-500 font-mono mt-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  {item.specs}
                </p>

                {/* Pricing: Strikethrough + Flash Price */}
                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="text-base font-bold text-[#003d29]">
                    {formatCurrency(item.flashPrice)}
                  </span>
                  <span className="text-xs text-gray-500 font-normal">/ {item.unit}</span>
                  <span className="text-[11px] text-gray-400 line-through ml-auto">
                    {formatCurrency(item.originalPrice)}
                  </span>
                </div>

                {/* Bulk Tiered Pricing Note */}
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded block mt-1">
                  {item.bulkPrice}
                </span>

                {/* Progress Bar of Sold Items */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                    <span>Teralokasi {item.soldPercentage}%</span>
                    <span className="text-[#003d29] font-bold">Sisa {item.stockLeft} kg</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#003d29] h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.soldPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/products/${item.slug}`}
                className="mt-4 w-full bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold py-2.5 rounded-full transition-all text-center block shadow-2xs"
              >
                Pesan Bahan Baku
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FILTER SECTOR INDUSTRI & SENTRA ASAL DAERAH */}
      <section className="space-y-4 pt-2 pb-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#003d29] uppercase tracking-wider block">
              FILTER BERDASARKAN KEBUTUHAN PENGOLAHAN
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5">
              Pilihan Sektor Industri & Aplikasi
            </h2>
          </div>

          {/* Right Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Urutkan:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 outline-none focus:border-[#003d29] cursor-pointer"
            >
              <option value="newest">Panen Terbaru</option>
              <option value="price_asc">Harga: Rendah ke Tinggi</option>
              <option value="price_desc">Harga: Tinggi ke Rendah</option>
              <option value="popular">Volume Terbanyak Dipesan</option>
            </select>
          </div>
        </div>

        {/* Industry Sector Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {industrySectors.map((sector) => {
            const isSelected = activeSector === sector.id;
            return (
              <button
                key={sector.id || 'all'}
                onClick={() => setActiveSector(sector.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-[#003d29] text-white border-[#003d29] shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {sector.label}
              </button>
            );
          })}
        </div>

        {/* Origin Sentra Daerah Pills */}
        <div className="pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-bold text-[#003d29] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#003d29]" />
            <span>Sentra Penghasil Daerah:</span>
          </span>
          {NUSANTARA_ORIGIN_TABS.map((tab) => {
            const isSelected = activeOriginFilter === tab.city;
            return (
              <button
                key={tab.id || 'all'}
                onClick={() => setActiveOriginFilter(tab.city)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-[#003d29] text-white border-[#003d29] shadow-2xs'
                    : 'bg-[#FAF9F5] text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. MAIN COMMODITY PRODUCTS GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Katalog Bahan Baku & Komoditas Pilihan
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Kualitas grade pangan terstandarisasi, siap kirim seluruh Indonesia.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#003d29] hover:underline flex items-center gap-1"
          >
            <span>Semua Komoditas ({productsData?.items?.length || 32})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-2xl" />
                <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                <div className="h-3 bg-gray-100 rounded-md w-1/2" />
                <div className="h-8 bg-gray-100 rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : productsData?.items?.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm">Tidak ada bahan baku ditemukan untuk filter ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsData?.items?.map((product: any) => {
              const primaryImage =
                product.images?.find((img: any) => img.isThumbnail)?.url ||
                product.images?.[0]?.url ||
                'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg';

              const price = Number(product.basePrice);
              const isAdded = addedId === product.id;
              const isFav = isInWishlist(product.id);
              const origin = getProductOrigin(product);

              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between group bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-4 shadow-2xs transition-all"
                >
                  <div>
                    {/* Photo Container */}
                    <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-xl overflow-hidden mb-3 border border-gray-100 p-2 flex items-center justify-center">
                      <Link href={`/products/${product.slug}`} className="relative w-full h-full block">
                        <Image
                          src={primaryImage}
                          alt={product.title}
                          fill
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => toggleWishlist(e, product)}
                        className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs transition-colors ${
                          isFav ? 'text-rose-600' : 'text-gray-400 hover:text-rose-600'
                        }`}
                        aria-label="Simpan ke favorit"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-rose-600' : ''}`} />
                      </button>

                      {/* Grade Badge */}
                      <div className="absolute bottom-2 left-2 bg-[#003d29] text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                        Grade A Standar
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      {/* Origin Badge */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-[#003d29] bg-[#003d29]/8 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-[#003d29]" />
                          <span>{origin.badge}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Ready Tonase
                        </span>
                      </div>

                      {/* Title */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-bold text-gray-900 group-hover:text-[#003d29] line-clamp-1 transition-colors block"
                      >
                        {product.title}
                      </Link>

                      {/* Price & Unit */}
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-base font-extrabold text-gray-900">
                          {formatCurrency(price)}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">/ kg</span>
                      </div>

                      {/* Tiered Bulk Price Callout */}
                      <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md font-semibold mt-1">
                        Grosir &gt; 10 kg: {formatCurrency(Math.round(price * 0.88))}/kg
                      </div>

                      {/* Technical Specs Summary */}
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-1">
                        {product.description || 'Kadar air terstandarisasi, kemasan higienis, lolos uji kebersihan.'}
                      </p>
                    </div>
                  </div>

                  {/* Add to Cart / Order CTA */}
                  <div className="mt-4 pt-2 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        isAdded
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-[#003d29] hover:bg-[#002b1c] hover:text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Ditambahkan</span>
                        </>
                      ) : (
                        <span>Pesan Ecer (1 kg)</span>
                      )}
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      className="p-2 bg-[#FAF9F5] hover:bg-[#003d29] hover:text-white rounded-full border border-gray-200 transition-colors text-gray-700 flex items-center justify-center"
                      title="Lihat spesifikasi teknis lengkap"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 7. INTERACTIVE B2B PROCUREMENT RFQ WIDGET (Request for Quotation) */}
      <section className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[10px] font-bold text-[#003d29] uppercase tracking-wider block">
              LAYANAN PENGADAAN SKALA BESAR (B2B SUPPLY)
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              Butuh Pasokan Rutin Tonase atau Sampel Uji Coba Lab?
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Kami bermitra langsung dengan lebih dari 45 koperasi tani dan sentra pengolahan di seluruh pelosok Indonesia. Dapatkan kontrak pasokan terjadwal, harga grosir pabrik, serta sertifikasi mutu (COA / Halal / Organik).
            </p>

            <div className="space-y-2 pt-2 text-xs font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003d29] shrink-0" />
                <span>Pengiriman sampel gratis untuk pengujian formulasi dapur/lab</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003d29]" />
                <span>Kontrak pasokan jangka panjang dengan proteksi fluktuasi harga</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003d29]" />
                <span>Dokumen legalitas lengkap (NIB, PIRT, Uji Lab, Faktur Pajak PPN)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#FAF9F5] border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">
              Kalkulator & Pengajuan Penawaran Pasokan
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Pilih Jenis Komoditas:
                </label>
                <select
                  value={rfqCommodity}
                  onChange={(e) => setRfqCommodity(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 outline-none focus:border-[#003d29]"
                >
                  <option value="Biji Kopi Arabika Gayo Green Bean">Biji Kopi Arabika Gayo Green Bean</option>
                  <option value="Gula Semut Aren Organik Kristal">Gula Semut Aren Organik Kristal</option>
                  <option value="Cengkeh Kering Kualitas Ekspor">Cengkeh Kering Kualitas Ekspor</option>
                  <option value="Tepung Mocaf Bebas Gluten">Tepung Mocaf Bebas Gluten</option>
                  <option value="Virgin Coconut Oil (VCO) Cold Pressed">Virgin Coconut Oil (VCO) Cold Pressed</option>
                  <option value="Kacang Mede Mentah Kupas Utuh W320">Kacang Mede Mentah Kupas Utuh W320</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Estimasi Volume (kg/bulan):
                  </label>
                  <input
                    type="number"
                    value={rfqVolume}
                    onChange={(e) => setRfqVolume(e.target.value)}
                    placeholder="Contoh: 100"
                    className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#003d29]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Tujuan Pengajuan:
                  </label>
                  <select
                    value={rfqType}
                    onChange={(e) => setRfqType(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-800 outline-none focus:border-[#003d29]"
                  >
                    <option value="sampel">Minta Sampel Uji Coba</option>
                    <option value="rutin">Pasokan Rutin Bulanan</option>
                    <option value="kontrak">Kontrak Tahunan Tonase</option>
                  </select>
                </div>
              </div>

              <a
                href={`https://wa.me/6281234567890?text=${rfqWhatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-3 py-3 px-4 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold rounded-xl text-center block transition-all shadow-sm"
              >
                Kirim Pengajuan ke Tim Procurement B2B
              </a>
              <span className="text-[10px] text-gray-400 text-center block">
                Respon maksimal 1x24 jam kerja dengan melampirkan lembar spesifikasi teknis (COA).
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. JAMINAN MUTU & STANDAR BAHAN BAKU */}
      <section className="bg-[#FAF9F5] border border-gray-200/80 rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-4 gap-6 text-center sm:text-left">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Uji Lab & COA Resmi
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Setiap batch pasokan dilengkapi sertifikat kadar air, kemurnian, dan uji mikrobiologi.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Harga Grosir Langsung
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Tanpa perantara berlapis, harga langsung bersumber dari kelompok tani sentra daerah.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Kemasan Food-Grade
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Vakum bersegel dan lapisan karung goni/plastik khusus untuk menjaga kesegaran bahan.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Logistik Skala Besar
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Mendukung kurir reguler ekspres, kargo darat/laut tonase, hingga peti kemas ekspor.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
