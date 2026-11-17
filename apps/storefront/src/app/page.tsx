'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  ChevronDown,
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
import {
  getProductOrigin,
  getProductStore,
  NUSANTARA_ORIGIN_TABS,
  StoreProfile,
  VERIFIED_UMKM_STORES,
} from '../lib/storefront-helpers';
import { StoreProfileModal } from '../components/store-profile-modal';
import { FaqAccordion } from '../components/faq-accordion';

export default function MarketplaceStorefrontHome() {
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('');
  const [activeOriginFilter, setActiveOriginFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [selectedStore, setSelectedStore] = useState<StoreProfile | null>(null);

  // Flash Sale Live Countdown Timer
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

  // Curated Flash Sale items
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
      category: 'Oleh-oleh Khas',
      rating: 4.9,
      reviewsCount: 320,
      storeName: 'Dapur Bakpia 25 Resmi',
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
      category: 'Oleh-oleh Khas',
      rating: 5.0,
      reviewsCount: 512,
      storeName: 'Sentra Pie Susu Dhian Bali',
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
      storeName: 'Koperasi Kopi Gayo',
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
      storeName: 'Dapur Sambal Bu Rudy',
    },
  ];

  // Visual Category Grid (Etsy & Shopee rounded visual cards)
  const visualCategories = [
    {
      title: 'Oleh-oleh & Kue Tradisional',
      subtitle: 'Bakpia, Pie Susu & Lapis',
      slug: 'kudapan-khas',
      itemCount: '240+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
    },
    {
      title: 'Batik & Tenun Nusantara',
      subtitle: 'Batik Tulis Solo & Tenun Troso',
      slug: 'batik-wastra',
      itemCount: '180+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Batik_pedalaman_-_parang_klithik.JPG',
    },
    {
      title: 'Kriya Kayu & Kerajinan',
      subtitle: 'Piring Jati & Besek Bambu',
      slug: 'kriya-kerajinan',
      itemCount: '150+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Cobek.jpg',
    },
    {
      title: 'Kopi & Minuman Herbal',
      subtitle: 'Gayo, Toraja & Wedang Uwuh',
      slug: 'kopi-minuman',
      itemCount: '95+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Wedang_Uwuh_Jawa.jpg',
    },
    {
      title: 'Sambal & Bumbu Daerah',
      subtitle: 'Sambal Bu Rudy & Rendang',
      slug: 'sambal-bumbu',
      itemCount: '110+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Rendang_daging_sapi_asli_Padang.JPG',
    },
    {
      title: 'Dekorasi & Keramik Seni',
      subtitle: 'Gerabah Kasongan & Kerajinan',
      slug: 'kriya-kerajinan',
      itemCount: '80+ Produk',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
    },
  ];

  // Verified Artisans & Official Makers -> Sentra UMKM Terverifikasi
  const verifiedMakers = [
    {
      name: 'Dapur Bakpia Pathok 25',
      city: 'Yogyakarta',
      badge: 'UMKM Legendaris (Est. 1948)',
      sales: '12.4k Terjual',
      rating: '4.9',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
      storeProfile: VERIFIED_UMKM_STORES['bakpia-25'],
    },
    {
      name: 'Sentra Tenun Ikat Troso',
      city: 'Jepara',
      badge: 'Alat Tenun Bukan Mesin (ATBM)',
      sales: '4.8k Terjual',
      rating: '5.0',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Batik_pedalaman_-_parang_klithik.JPG',
      storeProfile: VERIFIED_UMKM_STORES['tenun-troso'],
    },
    {
      name: 'Dapur Sambal Bu Rudy',
      city: 'Surabaya',
      badge: 'Resep Asli Jawa Timur Terkurasi',
      sales: '18.9k Terjual',
      rating: '4.9',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/SAMBAL_BAWANG.jpg',
      storeProfile: VERIFIED_UMKM_STORES['sambal-bu-rudy'],
    },
    {
      name: 'Kopi Gayo Single Origin Roastery',
      city: 'Aceh Takengon',
      badge: 'Kemitraan Petani Dataran Tinggi',
      sales: '7.2k Terjual',
      rating: '4.9',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
      storeProfile: VERIFIED_UMKM_STORES['kopi-gayo'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 font-sans space-y-12">
      {/* 1. TOP MARKETPLACE BENEFIT STRIP */}
      <section className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-[#003d29]" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block text-xs">Bebas Ongkir Nasional</span>
              <span className="text-xs text-stone-400 font-normal">Min. belanja Rp 150.000</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#003d29]" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block text-xs">100% Produk Otentik</span>
              <span className="text-xs text-stone-400 font-normal">Langsung dari pengrajin daerah</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 text-[#003d29]" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block text-xs">Garansi Sampai Aman</span>
              <span className="text-xs text-stone-400 font-normal">Ganti baru jika barang rusak</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-[#003d29]" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block text-xs">Bisa Bayar di Tempat (COD)</span>
              <span className="text-xs text-stone-400 font-normal">Belanja tenang dan nyaman</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HERO MARKETPLACE BANNER */}
      <section className="bg-[#FCF0E4] border border-stone-200/60 rounded-2xl p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl z-10 space-y-5">
          <div className="inline-flex items-center gap-2 bg-[#003d29] text-white text-xs font-semibold px-3 py-1 rounded-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Pasar Karya & Oleh-Oleh Nusantara</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#003d29] tracking-tight leading-[1.15]">
            Temukan Citarasa & Karya Otentik Langsung dari Daerah
          </h1>

          <p className="text-sm text-stone-700 leading-relaxed max-w-lg">
            Jelajahi aneka oleh-oleh khas legendaris, batik tulis, kopi single-origin, dan kriya tangan yang diproduksi dengan integritas oleh sentra UMKM terpercaya di Indonesia.
          </p>

          {/* Quick Coupon Claim Chips */}
          <div className="pt-1 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
              Voucher Diskon Siap Pakai di Checkout:
            </span>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 bg-white border border-stone-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[#003d29] shadow-xs">
                <Tag className="w-3.5 h-3.5 text-[#003d29]" />
                <span>NUSANTARA (Diskon 15%)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white border border-stone-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[#003d29] shadow-xs">
                <Tag className="w-3.5 h-3.5 text-[#003d29]" />
                <span>ONGKIRGRATIS</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white border border-stone-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[#003d29] shadow-xs">
                <Tag className="w-3.5 h-3.5 text-[#003d29]" />
                <span>OLEHOLEH10</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-semibold px-7 py-3 rounded-lg transition-colors shadow-xs"
            >
              <span>Mulai Belanja</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/products?category=kudapan-khas"
              className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#003d29]" />
              <span>Oleh-oleh Terpopuler</span>
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
            className="object-cover rounded-2xl shadow-sm border border-stone-200"
          />
          <div className="absolute -bottom-2 -left-2 bg-white p-3.5 rounded-xl border border-stone-200 shadow-md text-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF9F5] border border-stone-200 flex items-center justify-center text-[#003d29] font-bold">
              4.9
            </div>
            <div>
              <span className="font-bold text-stone-900 block text-xs">Rating Kepuasan Pembeli</span>
              <span className="text-xs text-stone-400">Dari 15.000+ pesanan terkirim</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KATEGORI PILIHAN */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <span className="text-xs font-semibold text-[#003d29] uppercase tracking-wider block">
              KATEGORI PILIHAN
            </span>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight mt-0.5">
              Jelajahi Berdasarkan Produk
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#003d29] hover:underline flex items-center gap-1"
          >
            <span>Semua Kategori</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {visualCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="bg-[#FAF9F5] hover:bg-white border border-stone-200 hover:border-[#003d29] rounded-xl p-3.5 flex flex-col items-center text-center transition-colors group"
            >
              <div className="relative w-16 h-16 rounded-xl bg-white overflow-hidden mb-2.5 border border-stone-200 p-1 flex items-center justify-center">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="64px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200 rounded-lg"
                />
              </div>
              <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#003d29] line-clamp-2 transition-colors">
                {cat.title}
              </h3>
              <span className="text-xs text-stone-400 mt-1 font-medium">{cat.itemCount}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE HARIAN */}
      <section className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-6 sm:p-8 text-stone-900 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#003d29] text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-stone-900">
                  Flash Sale Hari Ini
                </h2>
                <span className="bg-[#003d29] text-white text-xs font-semibold uppercase px-2.5 py-0.5 rounded-md">
                  Diskon s/d 50%
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Penawaran terbatas langsung dari bengkel dan dapur pengrajin daerah.
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-stone-200 shadow-xs self-start sm:self-auto">
            <Clock className="w-4 h-4 text-[#003d29]" />
            <span className="text-xs font-semibold text-stone-500 mr-1">
              Berakhir:
            </span>
            <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
              <span className="bg-[#003d29] text-white px-2 py-0.5 rounded-md min-w-[26px] text-center font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#003d29] text-white px-2 py-0.5 rounded-md min-w-[26px] text-center font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#003d29] text-white px-2 py-0.5 rounded-md min-w-[26px] text-center font-mono">
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
              className="bg-white rounded-xl p-4 border border-stone-200 hover:border-stone-300 shadow-xs flex flex-col justify-between group transition-colors"
            >
              <div>
                <div className="relative w-full aspect-square bg-[#F5F6F6] rounded-lg overflow-hidden mb-3 border border-stone-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 left-2 bg-[#003d29] text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
                    -{item.discount}%
                  </div>
                  <div className="absolute top-2 right-2 bg-white/95 text-stone-700 text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-stone-200">
                    <MapPin className="w-3 h-3 text-[#003d29]" />
                    <span>{item.origin}</span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#003d29] uppercase tracking-wider block">
                  {item.category}
                </span>
                <Link
                  href={`/products/${item.slug}`}
                  className="text-xs font-bold text-stone-900 hover:text-[#003d29] line-clamp-2 transition-colors mt-0.5 block leading-snug"
                >
                  {item.title}
                </Link>

                {/* Rating & Review */}
                <div className="flex items-center gap-1 mt-1 text-xs text-stone-500">
                  <span className="font-bold text-stone-900">{item.rating}</span>
                  <div className="flex text-amber-500 text-xs">{'★'.repeat(5)}</div>
                  <span className="text-stone-400">({item.reviewsCount})</span>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-base font-bold text-[#003d29]">
                    {formatCurrency(item.flashPrice)}
                  </span>
                  <span className="text-xs text-stone-400 line-through">
                    {formatCurrency(item.originalPrice)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs font-medium text-stone-500">
                    <span>Terjual {item.soldPercentage}%</span>
                    <span className="text-[#003d29] font-bold">Sisa {item.stockLeft} pcs</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#003d29] h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.soldPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/products/${item.slug}`}
                className="mt-4 w-full bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors text-center block shadow-xs"
              >
                Beli Sekarang
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PILIHAN SENTRA UMKM & TOKO DAERAH RESMI */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-[#003d29]" />
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Sentra UMKM Pilihan & Toko Resmi
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Produsen oleh-oleh daerah terverifikasi dengan izin edar P-IRT dan sertifikasi halal.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#003d29] bg-[#003d29]/10 px-3 py-1 rounded-md inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#003d29]" />
            <span>UMKM Terverifikasi</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {verifiedMakers.map((maker, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#FAF9F5] border border-stone-200 rounded-xl flex flex-col justify-between hover:border-stone-300 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-200">
                    <Image
                      src={maker.image}
                      alt={maker.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-stone-900 truncate">{maker.name}</h3>
                    <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#003d29]" />
                      <span>{maker.city}</span>
                    </span>
                  </div>
                </div>

                <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded block border border-emerald-200/60">
                  {maker.badge}
                </span>

                <div className="flex items-center justify-between text-xs text-stone-500 mt-3 pt-2 border-t border-stone-200">
                  <span className="font-semibold text-stone-700">{maker.sales}</span>
                  <span className="font-bold text-[#003d29]">{maker.rating} ★</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStore(maker.storeProfile)}
                className="mt-4 w-full py-2 bg-white hover:bg-[#003d29] hover:text-white border border-stone-200 text-stone-800 rounded-lg text-xs font-semibold text-center block transition-colors"
              >
                Lihat Profil Toko
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PETA RASA DAERAH & FILTER BELANJA NUSANTARA */}
      <section className="space-y-4 pt-2 pb-2 border-b border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#003d29] uppercase tracking-wider block">
              KATALOG UTAMA
            </span>
            <h2 className="text-xl font-bold text-stone-900 mt-0.5">
              Koleksi Terbaik dari Seluruh Nusantara
            </h2>
          </div>

          {/* Right Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Urutkan:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-xs font-semibold text-stone-800 bg-white border border-stone-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#003d29] cursor-pointer"
            >
              <option value="newest">Paling Sesuai</option>
              <option value="popular">Paling Banyak Dibeli</option>
              <option value="price_asc">Harga: Rendah ke Tinggi</option>
              <option value="price_desc">Harga: Tinggi ke Rendah</option>
            </select>
          </div>
        </div>

        {/* Origin City Filter Pills */}
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border shrink-0 ${
                  isSelected
                    ? 'bg-[#003d29] text-white border-[#003d29] shadow-xs'
                    : 'bg-[#FAF9F5] text-stone-700 border-stone-200 hover:border-stone-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 7. MAIN PRODUCT GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-500 font-medium">
            Menampilkan produk pilihan terkurasi dari berbagai sentra UMKM Indonesia.
          </p>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#003d29] hover:underline flex items-center gap-1"
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
                <div className="aspect-square bg-stone-100 rounded-xl" />
                <div className="h-4 bg-stone-100 rounded-md w-3/4" />
                <div className="h-3 bg-stone-100 rounded-md w-1/2" />
                <div className="h-8 bg-stone-100 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : productsData?.items?.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-xl border border-stone-200">
            <p className="text-stone-500 text-xs">Tidak ada produk ditemukan untuk filter ini.</p>
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
              const store = getProductStore(product);

              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between group bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-4 shadow-xs transition-colors"
                >
                  <div>
                    {/* Photo Container */}
                    <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-lg overflow-hidden mb-3 border border-stone-100 p-2 flex items-center justify-center">
                      <Link href={`/products/${product.slug}`} className="relative w-full h-full block">
                        <Image
                          src={primaryImage}
                          alt={product.title}
                          fill
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => toggleWishlist(e, product)}
                        className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs transition-colors border border-stone-200 ${
                          isFav ? 'text-rose-600' : 'text-stone-400 hover:text-rose-600'
                        }`}
                        aria-label="Simpan ke favorit"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-rose-600' : ''}`} />
                      </button>

                      {/* UMKM Badge */}
                      <div className="absolute bottom-2 left-2 bg-[#003d29] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        <span>UMKM Resmi</span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[11px] font-semibold text-[#003d29] bg-[#003d29]/8 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-[#003d29]" />
                          <span>{origin.badge}</span>
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium truncate">
                          {product.category?.name || 'Oleh-Oleh Khas'}
                        </span>
                      </div>

                      {/* Store / Seller Name */}
                      <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                        <Store className="w-3 h-3 text-[#003d29] shrink-0" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedStore(store);
                          }}
                          className="hover:text-[#003d29] hover:underline truncate text-left"
                          title="Lihat profil toko ini"
                        >
                          {store.name}
                        </button>
                      </div>

                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-bold text-stone-900 group-hover:text-[#003d29] line-clamp-2 transition-colors block leading-snug pt-0.5"
                      >
                        {product.title}
                      </Link>

                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-base font-bold text-stone-900">
                          {formatCurrency(price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-stone-500 pt-0.5">
                        <span className="font-bold text-stone-800">4.9</span>
                        <div className="flex text-[#003d29] text-xs">{'★'.repeat(5)}</div>
                        <span className="text-stone-400">({product.variants?.length ? 'Banyak varian' : '128 terjual'})</span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart CTA */}
                  <div className="mt-4 pt-2 border-t border-stone-100">
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border ${
                        isAdded
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'bg-white text-stone-900 border-stone-300 hover:border-[#003d29] hover:bg-[#002b1c] hover:text-white'
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

      {/* 8. PUSAT BANTUAN & FAQ INTERAKTIF (Feature 4) */}
      <FaqAccordion />

      {/* 9. MARKETPLACE SHOPPING ASSURANCES */}
      <section className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-4 gap-6 text-center sm:text-left">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Pengiriman Terlacak
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Didukung kurir resmi JNE, J&T, dan SiCepat dengan nomor resi otomatis terverifikasi.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              100% Produk Pengrajin Asli
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Terkurasi langsung dari bengkel kriya dan dapur kuliner daerah terpercaya.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Garansi Ganti Baru
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Jaminan ganti baru atau uang kembali jika paket remuk atau rusak selama di perjalanan.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#003d29] text-white flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Dukungan UMKM Lokal
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Setiap pesanan Anda turut memberdayakan ekonomi para pelaku UMKM daerah di Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Store Profile Modal */}
      <StoreProfileModal
        store={selectedStore}
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </div>
  );
}
