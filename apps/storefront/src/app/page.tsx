'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  Star,
  ChevronDown,
  SlidersHorizontal,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../stores/cart-store';

export default function ShopcartStorefrontHome() {
  const { addItem, openCart } = useCartStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');

  // Flash Sale Live Countdown Timer (Hours, Minutes, Seconds)
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
    queryKey: ['featured-products', activeCategoryFilter, sortOption],
    queryFn: () => {
      const p = new URLSearchParams();
      if (activeCategoryFilter) p.set('category', activeCategoryFilter);
      p.set('sortBy', sortOption);
      p.set('limit', '12');
      return apiRequest<{ items: any[] }>(`/products?${p.toString()}`);
    },
  });

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
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

  // Curated Flash Sale items with authentic Indonesian product photos
  const flashSaleItems = [
    {
      id: 'fs-1',
      title: 'Bakpia Kukus Tugu Jogja Cokelat',
      slug: 'bakpia-kukus-tugu-jogja',
      originalPrice: 45000,
      flashPrice: 29000,
      discount: 35,
      soldPercentage: 84,
      stockLeft: 4,
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg',
      category: 'Kudapan Khas',
    },
    {
      id: 'fs-2',
      title: 'Pie Susu Dhian Khas Bali Asli Isi 50',
      slug: 'pie-susu-dhian-bali-50',
      originalPrice: 80000,
      flashPrice: 52000,
      discount: 35,
      soldPercentage: 91,
      stockLeft: 3,
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
      category: 'Kudapan Khas',
    },
    {
      id: 'fs-3',
      title: 'Kopi Arabika Gayo Aceh 250g',
      slug: 'kopi-arabika-gayo-aceh',
      originalPrice: 75000,
      flashPrice: 49000,
      discount: 35,
      soldPercentage: 76,
      stockLeft: 6,
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
      category: 'Kopi Nusantara',
    },
    {
      id: 'fs-4',
      title: 'Sambal Bu Rudy Surabaya Set 3',
      slug: 'sambal-bu-rudy-surabaya-set3',
      originalPrice: 85000,
      flashPrice: 55000,
      discount: 35,
      soldPercentage: 88,
      stockLeft: 5,
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/SAMBAL_BAWANG.jpg',
      category: 'Sambal Tradisional',
    },
  ];

  const popularCategories = [
    {
      title: 'Kudapan & Makanan Khas',
      count: 'Bakpia, Bolu, Keripik & Lapis',
      slug: 'kudapan-khas',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
    },
    {
      title: 'Kopi & Minuman Daerah',
      count: 'Gayo, Toraja & Wedang Uwuh',
      slug: 'kopi-minuman',
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Wedang_Uwuh_Jawa.jpg',
    },
    {
      title: 'Batik & Wastra Nusantara',
      count: 'Batik Tulis Solo & Tenun Troso',
      slug: 'batik-wastra',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Batik_pedalaman_-_parang_klithik.JPG',
    },
    {
      title: 'Kriya Kayu & Gerabah',
      count: 'Piring Jati & Tembikar Kasongan',
      slug: 'kriya-kerajinan',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Cobek.jpg',
    },
    {
      title: 'Sambal & Bumbu Tradisional',
      count: 'Sambal Bu Rudy & Rendang Padang',
      slug: 'sambal-bumbu',
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Rendang_daging_sapi_asli_Padang.JPG',
    },
    {
      title: 'Pie Susu & Kacang Bali',
      count: 'Pie Dhian & Kacang Disco Bali',
      slug: 'kudapan-khas',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 font-sans space-y-12">
      {/* 1. HERO BANNER (Strict Shopcart layout from reference image) */}
      <section className="bg-[#FCF0E4] rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl z-10 space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-[#003d29] tracking-tight leading-[1.15]">
            Diskon Hingga 50% Untuk Pilihan Oleh-oleh Nusantara
          </h1>
          <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed max-w-md">
            Temukan aneka kudapan khas, kerajinan tangan otentik, dan batik langsung dari pengrajin daerah terpercaya.
          </p>
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1d] text-white text-sm font-bold px-8 py-3.5 rounded-full transition-all shadow-sm hover:scale-102"
            >
              <span>Beli Sekarang</span>
            </Link>
          </div>
        </div>

        {/* Right Product Craft Image */}
        <div className="relative w-72 h-72 sm:w-88 sm:h-88 shrink-0">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg"
            alt="Oleh-oleh Tradisional Pilihan"
            fill
            priority
            sizes="(max-width: 768px) 288px, 352px"
            className="object-cover rounded-2xl shadow-sm"
          />
        </div>
      </section>

      {/* 2. FLASH SALE SECTION (Strict Shopcart Neutral & Forest Green Design) */}
      <section className="bg-[#FAF9F5] border border-gray-200/80 rounded-3xl p-6 sm:p-8 text-gray-900 relative">
        {/* Header Bar: Forest Green Badge & Live Countdown Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                  Flash Sale Hari Ini
                </h2>
                <span className="bg-[#003d29] text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                  Diskon s/d 50%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Harga promo spesial langsung dari pengrajin daerah, kuota terbatas setiap hari.
              </p>
            </div>
          </div>

          {/* Countdown Clock (Matching Shopcart clean pill style) */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-2xs self-start sm:self-auto">
            <Clock className="w-4 h-4 text-[#003d29]" />
            <span className="text-xs font-semibold text-gray-500 mr-1">
              Berakhir:
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

        {/* Flash Sale Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flashSaleItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-gray-200/70 hover:border-gray-300 shadow-2xs flex flex-col justify-between group transition-all duration-200"
            >
              <div>
                {/* Photo with Discount Ribbon */}
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
                  {/* Clean Dark Green Discount Tag */}
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

                {/* Pricing: Strikethrough + Flash Price */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-sm font-bold text-[#003d29]">
                    {formatCurrency(item.flashPrice)}
                  </span>
                  <span className="text-[11px] text-gray-400 line-through">
                    {formatCurrency(item.originalPrice)}
                  </span>
                </div>

                {/* Progress Bar of Sold Items */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                    <span>Terjual {item.soldPercentage}%</span>
                    <span className="text-[#003d29] font-bold">Sisa {item.stockLeft} buah</span>
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
                Beli Sekarang
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FILTER PILLS BAR */}
      <section className="flex flex-wrap items-center justify-between gap-4 pt-2 pb-4 border-b border-gray-100">
        {/* Left Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveCategoryFilter('')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              !activeCategoryFilter
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Semua Oleh-oleh</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('kudapan-khas')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeCategoryFilter === 'kudapan-khas'
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Kudapan Khas</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveCategoryFilter('kopi-minuman')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeCategoryFilter === 'kopi-minuman'
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Kopi & Minuman</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveCategoryFilter('batik-wastra')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeCategoryFilter === 'batik-wastra'
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Batik & Wastra</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveCategoryFilter('kriya-kerajinan')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeCategoryFilter === 'kriya-kerajinan'
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Kriya Kayu & Gerabah</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveCategoryFilter('sambal-bumbu')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeCategoryFilter === 'sambal-bumbu'
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Sambal & Bumbu</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <Link
            href="/products"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:border-gray-400"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            <span>Semua Filter</span>
          </Link>
        </div>

        {/* Right Sort Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Urutkan:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 outline-none focus:border-[#003d29] cursor-pointer"
          >
            <option value="newest">Paling Sesuai</option>
            <option value="price_asc">Harga: Rendah ke Tinggi</option>
            <option value="price_desc">Harga: Tinggi ke Rendah</option>
            <option value="popular">Paling Banyak Dibeli</option>
          </select>
        </div>
      </section>

      {/* 4. MAIN PRODUCT GRID WITH LAZY LOADED IMAGES & SKELETONS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Oleh-oleh Pilihan Buat Kamu!
          </h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#003d29] hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Produk ({productsData?.items?.length || 32})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading Skeletons for Zero CLS (Cumulative Layout Shift) */}
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
            <p className="text-gray-500 text-sm">Tidak ada produk ditemukan untuk filter ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsData?.items?.map((product: any) => {
              const primaryImage =
                product.images?.find((img: any) => img.isThumbnail)?.url ||
                product.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80';

              const price = Number(product.basePrice);
              const isAdded = addedId === product.id;
              const isFav = wishlist[product.id];

              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between group"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-2xl overflow-hidden border border-gray-100/60 p-4 flex items-center justify-center">
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

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={(e) => toggleWishlist(e, product.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs transition-colors ${
                        isFav ? 'text-[#003d29]' : 'text-gray-400 hover:text-[#003d29]'
                      }`}
                      aria-label="Tambah favorit"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Product Metadata */}
                  <div className="mt-3.5 space-y-1">
                    {/* Top Row: Title on Left, Price on Right */}
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-bold text-gray-900 group-hover:text-[#003d29] line-clamp-1 transition-colors"
                      >
                        {product.title}
                      </Link>
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(price)}
                      </span>
                    </div>

                    {/* Short Description */}
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>

                    {/* Star Rating (Shopcart signature dark green stars) */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex text-[#003d29] text-[11px]">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">(121)</span>
                    </div>
                  </div>

                  {/* Pill Add to Cart CTA */}
                  <div className="mt-4">
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        isAdded
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-[#003d29] hover:bg-[#003d29] hover:text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Sudah di Keranjang</span>
                        </>
                      ) : (
                        <span>Masukkan Keranjang</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. POPULAR CATEGORIES (Lazy loaded images) */}
      <section className="space-y-6 pt-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Kategori Terpopuler</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="bg-[#F9FAFA] hover:bg-white border border-gray-100 hover:border-gray-300 rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-sm group"
            >
              <div className="relative w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0 border border-gray-100">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="64px"
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#003d29] transition-colors">
                  {cat.title}
                </h3>
                <span className="text-xs text-gray-500 mt-0.5 block">{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. GUEST BENEFITS & ASSURANCES */}
      <section className="bg-[#FAF9F5] border border-gray-200/60 rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Bisa Bayar di Tempat (COD)
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Bayar tunai dengan aman setelah paket oleh-oleh sampai di rumahmu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              100% Asli Dari Pengrajin
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Produk terkurasi langsung dari bengkel dan dapur UMKM lokal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Kemasan Tebal Anti-Pecah
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Proteksi khusus bubble wrap dan kardus dobel untuk kiriman jarak jauh.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
