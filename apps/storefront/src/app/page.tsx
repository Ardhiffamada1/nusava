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
  Star,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Tag,
  Store,
  Award,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../stores/cart-store';
import { useWishlistStore } from '../stores/wishlist-store';
import { getProductOrigin, NUSANTARA_ORIGIN_TABS } from '../lib/storefront-helpers';

export default function MarketplaceStorefrontHome() {
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('');
  const [activeOriginFilter, setActiveOriginFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');

  // Flash Sale Live Countdown Timer (Shopee / Blibli style)
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 38,
    seconds: 24,
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

  // Curated Flash Sale items with authentic photos and marketplace pricing
  const flashSaleItems = [
    {
      id: 'fs-1',
      title: 'Bakpia Kukus Tugu Jogja Cokelat Lumer (Isi 10)',
      slug: 'bakpia-kukus-tugu-jogja',
      origin: 'Yogyakarta',
      originalPrice: 48000,
      flashPrice: 31000,
      discount: 35,
      soldPercentage: 88,
      stockLeft: 4,
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg',
      category: 'Kudapan Khas',
      rating: 4.9,
      reviewsCount: 320,
    },
    {
      id: 'fs-2',
      title: 'Pie Susu Dhian Asli Khas Bali Kemasan Dus Isi 50 Pcs',
      slug: 'pie-susu-dhian-bali-50',
      origin: 'Bali',
      originalPrice: 85000,
      flashPrice: 55000,
      discount: 35,
      soldPercentage: 94,
      stockLeft: 3,
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
      category: 'Kudapan Khas',
      rating: 5.0,
      reviewsCount: 512,
    },
    {
      id: 'fs-3',
      title: 'Kopi Arabika Gayo Aceh Specialty Roast 250g',
      slug: 'kopi-arabika-gayo-aceh',
      origin: 'Aceh',
      originalPrice: 80000,
      flashPrice: 52000,
      discount: 35,
      soldPercentage: 78,
      stockLeft: 7,
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
      category: 'Kopi Nusantara',
      rating: 4.9,
      reviewsCount: 184,
    },
    {
      id: 'fs-4',
      title: 'Paket Sambal Bu Rudy Surabaya Khas Bawang (Isi 3 Botol)',
      slug: 'sambal-bu-rudy-surabaya-set3',
      origin: 'Surabaya',
      originalPrice: 90000,
      flashPrice: 58000,
      discount: 35,
      soldPercentage: 91,
      stockLeft: 5,
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/SAMBAL_BAWANG.jpg',
      category: 'Sambal Tradisional',
      rating: 4.8,
      reviewsCount: 429,
    },
  ];

  // Visual Category Grid (Etsy & Shopee rounded visual cards)
  const visualCategories = [
    {
      title: 'Kudapan & Kue Tradisional',
      subtitle: 'Bakpia, Pie Susu, Bolu & Lapis',
      slug: 'kudapan-khas',
      itemCount: '240+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
    },
    {
      title: 'Batik & Tenun Nusantara',
      subtitle: 'Batik Tulis Solo, Tenun Troso & Sutra',
      slug: 'batik-wastra',
      itemCount: '180+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Batik_pedalaman_-_parang_klithik.JPG',
    },
    {
      title: 'Kriya Kayu & Kerajinan Anyaman',
      subtitle: 'Piring Jati, Besek Bambu & Tembikar',
      slug: 'kriya-kerajinan',
      itemCount: '150+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Cobek.jpg',
    },
    {
      title: 'Kopi & Minuman Herbal Daerah',
      subtitle: 'Gayo, Toraja & Wedang Uwuh Rempah',
      slug: 'kopi-minuman',
      itemCount: '95+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Wedang_Uwuh_Jawa.jpg',
    },
    {
      title: 'Sambal & Bumbu Masakan Khas',
      subtitle: 'Sambal Bu Rudy, Rendang Padang & Bumbu',
      slug: 'sambal-bumbu',
      itemCount: '110+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Rendang_daging_sapi_asli_Padang.JPG',
    },
    {
      title: 'Dekorasi & Keramik Seni Budaya',
      subtitle: 'Gerabah Kasongan & Cinderamata Antik',
      slug: 'kriya-kerajinan',
      itemCount: '80+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
    },
  ];

  // Verified Artisans & Official Makers (Etsy Makers / Shopee Mall / Blibli Official Store style)
  const verifiedMakers = [
    {
      name: 'Dapur Bakpia Pathok 25',
      city: 'Yogyakarta',
      badge: 'Pengrajin Legendaris (Est. 1948)',
      sales: '12.4k Terjual',
      rating: '4.9 ★',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
    },
    {
      name: 'Sentra Tenun Ikat Troso',
      city: 'Jepara',
      badge: 'Karya Alat Tenun Bukan Mesin (ATBM)',
      sales: '4.8k Terjual',
      rating: '5.0 ★',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Batik_pedalaman_-_parang_klithik.JPG',
    },
    {
      name: 'Dapur Sambal Bu Rudy',
      city: 'Surabaya',
      badge: 'Resep Asli Jawa Timur Terkurasi',
      sales: '18.9k Terjual',
      rating: '4.9 ★',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/SAMBAL_BAWANG.jpg',
    },
    {
      name: 'Kopi Gayo Single Origin Roastery',
      city: 'Aceh Takengon',
      badge: 'Petani Kopi Dataran Tinggi Gayo',
      sales: '7.2k Terjual',
      rating: '4.9 ★',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 font-sans space-y-12">
      {/* 1. TOP MARKETPLACE TRUST STRIP (Blibli / Shopee Style) */}
      <section className="bg-white border border-gray-200/80 rounded-2xl p-3.5 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-gray-700">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-[#003d29] shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block text-[11px]">Bebas Ongkir Nasional</span>
              <span className="text-[10px] text-gray-400">Min. belanja Rp 150.000</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#003d29] shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block text-[11px]">100% Produk Otentik</span>
              <span className="text-[10px] text-gray-400">Langsung dari pengrajin lokal</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-[#003d29] shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block text-[11px]">Garansi Sampai Aman</span>
              <span className="text-[10px] text-gray-400">Ganti baru jika produk remuk/rusak</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-[#003d29] shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block text-[11px]">Bisa Bayar di Tempat (COD)</span>
              <span className="text-[10px] text-gray-400">Belanja praktis & aman</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HERO MARKETPLACE BANNER (Etsy Craft Aesthetic + Blibli Campaign Promo) */}
      <section className="bg-[#FCF0E4] rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl z-10 space-y-5">
          <div className="inline-flex items-center gap-2 bg-[#003d29] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Pasar Oleh-Oleh & Kerajinan Nusantara Terbesar</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#003d29] tracking-tight leading-[1.15]">
            Temukan Citarasa & Karya Otentik Langsung dari Daerah
          </h1>

          <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed max-w-lg">
            Jelajahi aneka kudapan khas legendaris, batik tulis, kopi single-origin, dan kriya tangan yang diproduksi dengan cinta oleh para perajin dan dapur UMKM terbaik di seluruh Indonesia.
          </p>

          {/* Quick Coupon Claim Chips (Marketplace Promo Voucher Style) */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Klaim Voucher Diskon Belanja Hari Ini:
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#003d29]/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[#003d29] shadow-2xs">
                <Tag className="w-3.5 h-3.5 text-[#003d29]" />
                <span>NUSANTARA (Diskon 15%)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#003d29]/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[#003d29] shadow-2xs">
                <Tag className="w-3.5 h-3.5 text-[#003d29]" />
                <span>ONGKIRGRATIS</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#003d29]/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[#003d29] shadow-2xs">
                <Tag className="w-3.5 h-3.5 text-[#003d29]" />
                <span>DISKON50</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold px-8 py-3.5 rounded-full transition-all shadow-sm"
            >
              <span>Mulai Belanja Oleh-Oleh</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/products?category=kudapan-khas"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-bold px-6 py-3.5 rounded-full transition-all shadow-2xs"
            >
              <ShoppingBag className="w-4 h-4 text-[#003d29]" />
              <span>Kudapan Terpopuler</span>
            </Link>
          </div>
        </div>

        {/* Hero Visual Collage */}
        <div className="relative w-72 h-72 sm:w-88 sm:h-88 shrink-0">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg"
            alt="Karya Otentik Nusantara"
            fill
            priority
            sizes="(max-width: 768px) 288px, 352px"
            className="object-cover rounded-3xl shadow-sm border border-emerald-900/10"
          />
          <div className="absolute -bottom-2 -left-2 bg-white p-3 rounded-2xl border border-gray-200/90 shadow-md text-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] flex items-center justify-center text-[#003d29] font-bold">
              4.9
            </div>
            <div>
              <span className="font-bold text-gray-900 block text-[11px]">Rating Kepuasan Pembeli</span>
              <span className="text-[10px] text-gray-400">Dari 15.000+ ulasan terverifikasi</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KATEGORI PILIHAN (Shopee / Blibli Visual Categories Grid) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-[#003d29] uppercase tracking-wider block">
              KATEGORI POPULER
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
              Jelajahi Pilihan Nusantara
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[#003d29] hover:underline flex items-center gap-1"
          >
            <span>Semua Kategori</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {visualCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="bg-[#FAF9F5] hover:bg-white border border-gray-200/70 hover:border-[#003d29] rounded-2xl p-3 flex flex-col items-center text-center transition-all hover:shadow-xs group"
            >
              <div className="relative w-16 h-16 rounded-2xl bg-white overflow-hidden mb-2.5 border border-gray-100 p-1 flex items-center justify-center">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="64px"
                  className="object-cover group-hover:scale-108 transition-transform duration-300 rounded-xl"
                />
              </div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#003d29] line-clamp-2 transition-colors">
                {cat.title}
              </h3>
              <span className="text-[10px] text-gray-400 mt-1 font-semibold">{cat.itemCount}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE HARIAN (Shopee / Blibli Style with Live Countdown Timer) */}
      <section className="bg-[#FAF9F5] border border-gray-200/80 rounded-3xl p-6 sm:p-8 text-gray-900 relative">
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
                Harga promo kilat langsung dari dapur dan bengkel pengrajin daerah, kuota terbatas.
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-2xs self-start sm:self-auto">
            <Clock className="w-4 h-4 text-[#003d29]" />
            <span className="text-xs font-semibold text-gray-500 mr-1">
              Berakhir Dalam:
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
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-2xs text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                    <MapPin className="w-2.5 h-2.5 text-[#003d29]" />
                    <span>{item.origin}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#003d29] uppercase tracking-wider block">
                  {item.category}
                </span>
                <Link
                  href={`/products/${item.slug}`}
                  className="text-xs font-bold text-gray-900 hover:text-[#003d29] line-clamp-2 transition-colors mt-0.5 block leading-snug"
                >
                  {item.title}
                </Link>

                {/* Rating & Review */}
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500">
                  <span className="font-bold text-gray-900">{item.rating}</span>
                  <div className="flex text-amber-500 text-[10px]">{'★'.repeat(5)}</div>
                  <span className="text-gray-400">({item.reviewsCount})</span>
                </div>

                {/* Pricing: Strikethrough + Flash Price */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-base font-bold text-[#003d29]">
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
                    <span className="text-[#003d29] font-bold">Sisa {item.stockLeft} pcs</span>
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

      {/* 5. PILIHAN PENGRAJIN & DAPUR RESMI (Etsy Makers / Shopee Mall / Blibli Official Store) */}
      <section className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-[#003d29]" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Pilihan Pengrajin & Dapur Daerah Resmi
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                UMKM binaan terverifikasi dengan jaminan resep otentik dan kemasan higienis.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29] bg-[#003d29]/10 px-3 py-1 rounded-full">
            100% Verified Artisan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {verifiedMakers.map((maker, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#FAF9F5] border border-gray-200/80 rounded-2xl flex flex-col justify-between hover:border-gray-300 transition-all"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-gray-200">
                    <Image
                      src={maker.image}
                      alt={maker.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">{maker.name}</h3>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#003d29]" />
                      <span>{maker.city}</span>
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded block">
                  {maker.badge}
                </span>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200/70">
                  <span className="font-semibold text-gray-700">{maker.sales}</span>
                  <span className="font-bold text-[#003d29]">{maker.rating}</span>
                </div>
              </div>

              <Link
                href="/products"
                className="mt-4 w-full py-2 bg-white hover:bg-[#003d29] hover:text-white border border-gray-200 text-gray-800 rounded-xl text-xs font-bold text-center block transition-colors"
              >
                Kunjungi Toko
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PETA RASA DAERAH & FILTER BELANJA NUSANTARA */}
      <section className="space-y-4 pt-2 pb-4 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#003d29] uppercase tracking-wider block">
              KATALOG UTAMA OLEH-OLEH
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">
              Koleksi Terbaik dari Seluruh Nusantara
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
              <option value="newest">Paling Sesuai</option>
              <option value="popular">Paling Banyak Dibeli</option>
              <option value="price_asc">Harga: Rendah ke Tinggi</option>
              <option value="price_desc">Harga: Tinggi ke Rendah</option>
            </select>
          </div>
        </div>

        {/* Origin City Filter Pills (Shopee / Blibli regional filter) */}
        <div className="pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-bold text-[#003d29] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#003d29]" />
            <span>Peta Rasa Daerah:</span>
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

      {/* 7. MAIN PRODUCT GRID (Etsy Handmade Cards & Shopee Clean Product Style) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            Menampilkan produk pilihan terkurasi dari berbagai sentra UMKM Indonesia.
          </p>
          <Link
            href="/products"
            className="text-xs font-bold text-[#003d29] hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Produk ({productsData?.items?.length || 32})</span>
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
            <p className="text-gray-500 text-sm">Tidak ada produk ditemukan untuk filter ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsData?.items?.map((product: any) => {
              const primaryImage =
                product.images?.find((img: any) => img.isThumbnail)?.url ||
                product.images?.[0]?.url ||
                'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg';

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
                    {/* Photo Container with Wishlist Heart */}
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

                      {/* Authentic Artisan Badge */}
                      <div className="absolute bottom-2 left-2 bg-[#003d29] text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                        Asli UMKM
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
                        <span className="text-[10px] text-gray-400 font-medium truncate">
                          {product.category?.name || 'Oleh-Oleh Khas'}
                        </span>
                      </div>

                      {/* Title */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-bold text-gray-900 group-hover:text-[#003d29] line-clamp-2 transition-colors block leading-snug"
                      >
                        {product.title}
                      </Link>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-base font-extrabold text-gray-900">
                          {formatCurrency(price)}
                        </span>
                      </div>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 pt-0.5">
                        <span className="font-bold text-gray-800">4.9</span>
                        <div className="flex text-[#003d29] text-[10px]">{'★'.repeat(5)}</div>
                        <span className="text-gray-400 text-[10px]">(128 terjual)</span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart CTA Button */}
                  <div className="mt-4 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        isAdded
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-[#003d29] hover:bg-[#002b1c] hover:text-white'
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

      {/* 8. MARKETPLACE SHOPPING ASSURANCES (Shopee / Blibli Guarantees) */}
      <section className="bg-[#FAF9F5] border border-gray-200/80 rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-4 gap-6 text-center sm:text-left">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Pengiriman Cepat Ekspedisi
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Didukung kurir resmi JNE, J&T, dan SiCepat dengan nomor resi otomatis terlacak.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              100% Produk Asli Pengrajin
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Terkurasi langsung dari bengkel kriya dan dapur kuliner daerah terpercaya.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Garansi Ganti Baru
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Jaminan ganti baru atau uang kembali jika paket remuk atau rusak selama di jalan.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Dukungan UMKM Nusantara
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Setiap pembelianmu turut memberdayakan ekonomi para pengrajin lokal Indonesia.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
