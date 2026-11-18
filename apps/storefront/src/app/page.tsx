'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  ChevronDown,
  Check,
  Copy,
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
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const handleCopyCoupon = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

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
    setTimeout(() => setAddedId(null), 1500);
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

  // Official Stores & Toko Pilihan Daerah (Gaya Blibli / Tokopedia Official Store)
  const verifiedMakers = [
    {
      name: 'Dapur Bakpia Pathok 25',
      city: 'Yogyakarta',
      originQuery: 'Jogja',
      specialty: 'Bakpia Kukus & Pathok Basah',
      promoInfo: 'Cashback 2% Poin • Stok Hari Ini',
      priceStart: 'Mulai Rp 31.000',
      sales: '12,4rb+ terjual',
      rating: '4.9',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
      storeProfile: VERIFIED_UMKM_STORES['bakpia-25'],
    },
    {
      name: 'Sentra Tenun Ikat Troso',
      city: 'Jepara',
      originQuery: 'Solo',
      specialty: 'Kain Tenun ATBM & Batik Tulis',
      promoInfo: 'Cashback 2% Poin • Garansi Asli',
      priceStart: 'Mulai Rp 125.000',
      sales: '4,8rb+ terjual',
      rating: '5.0',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Batik_pedalaman_-_parang_klithik.JPG',
      storeProfile: VERIFIED_UMKM_STORES['tenun-troso'],
    },
    {
      name: 'Dapur Sambal Bu Rudy',
      city: 'Surabaya',
      originQuery: 'Surabaya',
      specialty: 'Sambal Bawang, Bajak & Udang',
      promoInfo: 'Cashback 2% Poin • Segel Higienis',
      priceStart: 'Mulai Rp 32.000',
      sales: '18,9rb+ terjual',
      rating: '4.9',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/SAMBAL_BAWANG.jpg',
      storeProfile: VERIFIED_UMKM_STORES['sambal-bu-rudy'],
    },
    {
      name: 'Kopi Gayo Specialty Roastery',
      city: 'Aceh Takengon',
      originQuery: 'Aceh',
      specialty: 'Arabika Gayo Wine & Peaberry',
      promoInfo: 'Cashback 2% Poin • Fresh Roast',
      priceStart: 'Mulai Rp 52.000',
      sales: '7,2rb+ terjual',
      rating: '4.9',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
      storeProfile: VERIFIED_UMKM_STORES['kopi-gayo'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-8 font-sans space-y-8 sm:space-y-12 overflow-x-hidden">
      {/* 1. TOP MARKETPLACE BENEFIT STRIP */}
      <section className="bg-white border border-stone-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs font-semibold text-stone-700">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#003d29]" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-stone-900 block text-[11px] sm:text-xs truncate">Bebas Ongkir Nasional</span>
              <span className="text-[10px] sm:text-xs text-stone-400 font-normal block truncate">Min. belanja Rp 150.000</span>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#003d29]" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-stone-900 block text-[11px] sm:text-xs truncate">100% Produk Otentik</span>
              <span className="text-[10px] sm:text-xs text-stone-400 font-normal block truncate">Langsung dari pengrajin</span>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#003d29]" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-stone-900 block text-[11px] sm:text-xs truncate">Garansi Sampai Aman</span>
              <span className="text-[10px] sm:text-xs text-stone-400 font-normal block truncate">Ganti baru jika rusak</span>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#003d29]" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-stone-900 block text-[11px] sm:text-xs truncate">Bisa Bayar COD</span>
              <span className="text-[10px] sm:text-xs text-stone-400 font-normal block truncate">Belanja tenang & nyaman</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HERO MARKETPLACE BANNER */}
      <section className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-5 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Kolom Teks, Voucher, & Aksi Utama (6 Kolom) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#003d29] block">
                Official Marketplace Oleh-Oleh Nusantara
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-[1.2]">
                Oleh-Oleh Khas Daerah, Dikirim Langsung dari Toko Aslinya
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                Belanja bakpia Jogja, pie susu Bali, sambal Surabaya, kopi Gayo, hingga batik & kriya langsung dari toko resmi daerah. Pasti asli, stok baru setiap hari, dan dapat <strong className="text-stone-900">Cashback NUSAVA Poin</strong> di setiap pesanan.
              </p>
            </div>

            {/* Klaim Voucher Promo & Cashback Poin */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  Klaim Voucher Belanja & Gratis Ongkir:
                </span>
                <span className="text-[11px] font-semibold text-[#003d29]">
                  Klik untuk salin kode
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Voucher 1: NUSANTARA (15%) */}
                <button
                  type="button"
                  onClick={() => handleCopyCoupon('NUSANTARA')}
                  className="flex items-center gap-2 p-2.5 bg-white border border-stone-200 hover:border-[#003d29] rounded-lg transition-all text-left shadow-2xs group cursor-pointer"
                  title="Klik untuk salin kode voucher"
                >
                  <div className="w-7 h-7 rounded bg-emerald-50 text-[#003d29] font-black text-xs flex items-center justify-center shrink-0 border border-emerald-100">
                    %
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-[11px] text-[#003d29] truncate">
                        NUSANTARA
                      </span>
                      <span className="text-[10px] font-semibold text-[#003d29] shrink-0">
                        {copiedCoupon === 'NUSANTARA' ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Tersalin
                          </span>
                        ) : (
                          'Klaim'
                        )}
                      </span>
                    </div>
                    <span className="block text-[10px] text-stone-500 font-medium">
                      Diskon 15% s/d 50rb
                    </span>
                  </div>
                </button>

                {/* Voucher 2: ONGKIRGRATIS */}
                <button
                  type="button"
                  onClick={() => handleCopyCoupon('ONGKIRGRATIS')}
                  className="flex items-center gap-2 p-2.5 bg-white border border-stone-200 hover:border-[#003d29] rounded-lg transition-all text-left shadow-2xs group cursor-pointer"
                  title="Klik untuk salin kode voucher"
                >
                  <div className="w-7 h-7 rounded bg-emerald-50 text-[#003d29] flex items-center justify-center shrink-0 border border-emerald-100">
                    <Truck className="w-3.5 h-3.5 text-[#003d29]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-[11px] text-[#003d29] truncate">
                        ONGKIRGRATIS
                      </span>
                      <span className="text-[10px] font-semibold text-[#003d29] shrink-0">
                        {copiedCoupon === 'ONGKIRGRATIS' ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Tersalin
                          </span>
                        ) : (
                          'Klaim'
                        )}
                      </span>
                    </div>
                    <span className="block text-[10px] text-stone-500 font-medium">
                      Gratis Ongkir Nasional
                    </span>
                  </div>
                </button>

                {/* Voucher 3: OLEHOLEH10 */}
                <button
                  type="button"
                  onClick={() => handleCopyCoupon('OLEHOLEH10')}
                  className="flex items-center gap-2 p-2.5 bg-white border border-stone-200 hover:border-[#003d29] rounded-lg transition-all text-left shadow-2xs group cursor-pointer"
                  title="Klik untuk salin kode voucher"
                >
                  <div className="w-7 h-7 rounded bg-emerald-50 text-[#003d29] flex items-center justify-center shrink-0 border border-emerald-100">
                    <Tag className="w-3.5 h-3.5 text-[#003d29]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-[11px] text-[#003d29] truncate">
                        OLEHOLEH10
                      </span>
                      <span className="text-[10px] font-semibold text-[#003d29] shrink-0">
                        {copiedCoupon === 'OLEHOLEH10' ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Tersalin
                          </span>
                        ) : (
                          'Klaim'
                        )}
                      </span>
                    </div>
                    <span className="block text-[10px] text-stone-500 font-medium">
                      Potongan 10% Semua Toko
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Aksi CTA Utama & Info Poin Member */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-lg transition-colors shadow-2xs"
                >
                  <span>Belanja Sekarang</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>

                <a
                  href="#flash-sale"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 text-xs sm:text-sm font-bold px-5 py-3 rounded-lg transition-colors"
                >
                  <Zap className="w-4 h-4 text-[#003d29]" />
                  <span>Lihat Flash Sale</span>
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                <span>
                  Daftar member baru langsung dapat <strong className="text-[#003d29]">Bonus 25.000 NUSAVA Poin</strong> (setara Rp 25.000) untuk potongan checkout.
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Visual E-Commerce: 4 Produk Pilihan Daerah dengan Gambar Nyata (6 Kolom) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {/* Produk 1: Bakpia Jogja */}
              <Link
                href="/products?origin=Jogja"
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-[#003d29] transition-all p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden bg-stone-100 mb-2">
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg"
                    alt="Bakpia Pathok Jogja"
                    fill
                    priority
                    sizes="(max-width: 768px) 140px, 180px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#003d29] text-white text-[9.5px] font-bold px-2 py-0.5 rounded">
                    Yogyakarta
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#003d29] transition-colors line-clamp-1">
                    Bakpia Pathok 25 Asli
                  </h3>
                  <p className="text-[11px] font-semibold text-[#003d29]">Mulai Rp35.000</p>
                </div>
              </Link>

              {/* Produk 2: Pie Susu Bali */}
              <Link
                href="/products?origin=Bali"
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-[#003d29] transition-all p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden bg-stone-100 mb-2">
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg"
                    alt="Pie Susu Asli Bali"
                    fill
                    priority
                    sizes="(max-width: 768px) 140px, 180px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#003d29] text-white text-[9.5px] font-bold px-2 py-0.5 rounded">
                    Bali
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#003d29] transition-colors line-clamp-1">
                    Pie Susu Dhian Bali
                  </h3>
                  <p className="text-[11px] font-semibold text-[#003d29]">Mulai Rp38.000</p>
                </div>
              </Link>

              {/* Produk 3: Sambal Bu Rudy Surabaya */}
              <Link
                href="/products?origin=Surabaya"
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-[#003d29] transition-all p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden bg-stone-100 mb-2">
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5a/SAMBAL_BAWANG.jpg"
                    alt="Sambal Bu Rudy Surabaya"
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 140px, 180px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#003d29] text-white text-[9.5px] font-bold px-2 py-0.5 rounded">
                    Surabaya
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#003d29] transition-colors line-clamp-1">
                    Sambal Bawang Bu Rudy
                  </h3>
                  <p className="text-[11px] font-semibold text-[#003d29]">Mulai Rp32.000</p>
                </div>
              </Link>

              {/* Produk 4: Kopi Arabika Gayo */}
              <Link
                href="/products?category=kopi-minuman"
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-[#003d29] transition-all p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden bg-stone-100 mb-2">
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg"
                    alt="Kopi Arabika Gayo Aceh"
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 140px, 180px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#003d29] text-white text-[9.5px] font-bold px-2 py-0.5 rounded">
                    Aceh
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#003d29] transition-colors line-clamp-1">
                    Kopi Arabika Gayo
                  </h3>
                  <p className="text-[11px] font-semibold text-[#003d29]">Mulai Rp52.000</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KATEGORI PILIHAN */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 gap-2">
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-[#003d29] uppercase tracking-wider block">
              KATEGORI PILIHAN
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight mt-0.5">
              Jelajahi Berdasarkan Produk
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#003d29] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Semua Kategori</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {visualCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="bg-[#FAF9F5] hover:bg-white border border-stone-200 hover:border-[#003d29] rounded-xl p-2.5 sm:p-3.5 flex flex-col items-center text-center transition-colors group"
            >
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white overflow-hidden mb-2 border border-stone-200 p-1 flex items-center justify-center">
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
              <h3 className="text-[11px] sm:text-xs font-bold text-stone-900 group-hover:text-[#003d29] line-clamp-2 transition-colors leading-tight">
                {cat.title}
              </h3>
              <span className="text-[10px] sm:text-xs text-stone-400 mt-1 font-medium">{cat.itemCount}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE HARIAN */}
      <section id="flash-sale" className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8 text-stone-900 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-stone-200 pb-4 sm:pb-5 mb-4 sm:mb-6">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#003d29] text-white flex items-center justify-center shadow-xs shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900">
                  Flash Sale Hari Ini
                </h2>
                <span className="bg-[#003d29] text-white text-[10px] sm:text-xs font-semibold uppercase px-2 py-0.5 rounded-md">
                  Diskon s/d 50%
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Penawaran terbatas langsung dari bengkel dan dapur pengrajin daerah.
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#003d29]" />
            <span className="text-[11px] sm:text-xs font-semibold text-stone-500 mr-0.5">
              Berakhir:
            </span>
            <div className="flex items-center gap-1 font-bold text-xs text-stone-900">
              <span className="bg-[#003d29] text-white px-1.5 sm:px-2 py-0.5 rounded-md min-w-[24px] text-center font-mono text-[11px] sm:text-xs">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#003d29] text-white px-1.5 sm:px-2 py-0.5 rounded-md min-w-[24px] text-center font-mono text-[11px] sm:text-xs">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-[#003d29] text-white px-1.5 sm:px-2 py-0.5 rounded-md min-w-[24px] text-center font-mono text-[11px] sm:text-xs">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Flash Sale Product Cards Grid (2 Cols on Mobile, 4 Cols on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {flashSaleItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-2.5 sm:p-4 border border-stone-200 hover:border-stone-300 shadow-xs flex flex-col justify-between group transition-colors"
            >
              <div>
                <div className="relative w-full aspect-square bg-[#F5F6F6] rounded-lg overflow-hidden mb-2.5 sm:mb-3 border border-stone-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-[#003d29] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                    -{item.discount}%
                  </div>
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white/95 text-stone-700 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-0.5 sm:gap-1 shadow-xs border border-stone-200">
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#003d29]" />
                    <span className="truncate max-w-[65px] sm:max-w-none">{item.origin}</span>
                  </div>
                </div>

                <span className="text-[10px] sm:text-xs font-semibold text-[#003d29] uppercase tracking-wider block truncate">
                  {item.category}
                </span>
                <Link
                  href={`/products/${item.slug}`}
                  className="text-xs font-bold text-stone-900 hover:text-[#003d29] line-clamp-2 transition-colors mt-0.5 block leading-snug"
                >
                  {item.title}
                </Link>

                {/* Rating & Review */}
                <div className="flex items-center gap-1 mt-1 text-[11px] sm:text-xs text-stone-500">
                  <span className="font-bold text-stone-900">{item.rating}</span>
                  <div className="flex text-amber-500 text-[10px] sm:text-xs">{'★'.repeat(5)}</div>
                  <span className="text-stone-400">({item.reviewsCount})</span>
                </div>

                {/* Pricing */}
                <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 mt-1.5 sm:mt-2">
                  <span className="text-sm sm:text-base font-extrabold text-[#003d29]">
                    {formatCurrency(item.flashPrice)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                    {formatCurrency(item.originalPrice)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2.5 sm:mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] sm:text-xs font-medium text-stone-500">
                    <span>Terjual {item.soldPercentage}%</span>
                    <span className="text-[#003d29] font-bold">Sisa {item.stockLeft}</span>
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
                className="mt-3 sm:mt-4 w-full bg-[#003d29] hover:bg-[#002b1c] text-white text-[11px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-lg transition-colors text-center block shadow-xs"
              >
                Beli Sekarang
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. OFFICIAL STORE & TOKO PILIHAN DAERAH (Gaya Tokopedia / Blibli Official Store) */}
      <section className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#003d29] text-white flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                  Official Store & Toko Pilihan Daerah
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Belanja langsung dari toko resmi produsen oleh-oleh legendaris dengan jaminan produk asli dan stok terbaru.
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-[#003d29] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Jelajahi Semua Toko</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {verifiedMakers.map((maker, idx) => (
            <div
              key={idx}
              className="p-3.5 sm:p-4 bg-[#FAF9F5] border border-stone-200 hover:border-[#003d29] rounded-xl flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Store Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-stone-200">
                    <Image
                      src={maker.image}
                      alt={maker.name}
                      fill
                      loading="lazy"
                      decoding="async"
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#003d29] shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 truncate group-hover:text-[#003d29] transition-colors">
                        {maker.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin className="w-3 h-3 text-[#003d29] shrink-0" />
                        <span>{maker.city}</span>
                      </span>
                      <span>•</span>
                      <span className="font-bold text-stone-800 shrink-0">{maker.rating} ★</span>
                    </div>
                  </div>
                </div>

                {/* Store Specialty & Promo Box */}
                <div className="p-2.5 bg-white border border-stone-200/80 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-stone-800 truncate">{maker.specialty}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-stone-100">
                    <span className="font-semibold text-[#003d29]">{maker.promoInfo}</span>
                    <span className="text-stone-400 font-medium">{maker.sales}</span>
                  </div>
                </div>
              </div>

              {/* Dual Action Buttons like Tokopedia / Blibli */}
              <div className="mt-3.5 pt-2.5 border-t border-stone-200/80 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStore(maker.storeProfile)}
                  className="py-2 px-2.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-lg text-[11px] font-semibold text-center transition-colors"
                >
                  Info Toko
                </button>
                <Link
                  href={`/products?origin=${maker.originQuery}`}
                  className="py-2 px-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white rounded-lg text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <span>Belanja</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PETA RASA DAERAH & FILTER BELANJA NUSANTARA */}
      <section className="space-y-4 pt-2 pb-2 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-[#003d29] uppercase tracking-wider block">
              KATALOG UTAMA
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
              Koleksi Terbaik dari Seluruh Nusantara
            </h2>
          </div>

          {/* Right Sort Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
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
        <div className="pt-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[11px] sm:text-xs font-bold text-[#003d29] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#003d29]" />
            <span>Daerah:</span>
          </span>
          {NUSANTARA_ORIGIN_TABS.map((tab) => {
            const isSelected = activeOriginFilter === tab.city;
            return (
              <button
                key={tab.id || 'all'}
                onClick={() => setActiveOriginFilter(tab.city)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border shrink-0 ${
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
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs text-stone-500 font-medium">
            Menampilkan produk oleh-oleh pilihan dari berbagai kota di Indonesia.
          </p>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#003d29] hover:underline flex items-center gap-1 w-fit"
          >
            <span>Lihat Semua Produk ({productsData?.items?.length || 32})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
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
                  className="flex flex-col justify-between group bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-2.5 sm:p-4 shadow-xs transition-colors"
                >
                  <div>
                    {/* Photo Container */}
                    <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-lg overflow-hidden mb-2.5 sm:mb-3 border border-stone-100 p-2 flex items-center justify-center">
                      <Link href={`/products/${product.slug}`} className="relative w-full h-full block">
                        <Image
                          src={primaryImage}
                          alt={product.title}
                          fill
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => toggleWishlist(e, product)}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs transition-colors border border-stone-200 ${
                          isFav ? 'text-rose-600' : 'text-stone-400 hover:text-rose-600'
                        }`}
                        aria-label="Simpan ke favorit"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-rose-600' : ''}`} />
                      </button>

                      {/* UMKM Badge */}
                      <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-[#003d29] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white shrink-0" />
                        <span>UMKM Resmi</span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      {/* Store / Seller Name (Directly Below Product Image) */}
                      <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-stone-600 font-semibold pb-1 border-b border-stone-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedStore(store);
                          }}
                          className="inline-flex items-center gap-1 hover:text-[#003d29] hover:underline truncate text-left min-w-0"
                          title="Lihat profil toko ini"
                        >
                          <Store className="w-3 h-3 text-[#003d29] shrink-0" />
                          <span className="truncate">{store.name}</span>
                        </button>
                        <span className="hidden sm:inline text-[10px] text-stone-400 font-medium shrink-0">
                          {store.city}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-[#003d29] bg-[#003d29]/8 px-1.5 sm:px-2 py-0.5 rounded-md inline-flex items-center gap-1 truncate max-w-full">
                          <MapPin className="w-2.5 h-2.5 text-[#003d29] shrink-0" />
                          <span className="truncate">{origin.badge}</span>
                        </span>
                        <span className="hidden sm:inline text-[11px] text-stone-400 font-medium truncate">
                          {product.category?.name || 'Oleh-Oleh Khas'}
                        </span>
                      </div>

                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-bold text-stone-900 group-hover:text-[#003d29] line-clamp-2 transition-colors block leading-snug pt-0.5"
                      >
                        {product.title}
                      </Link>

                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="text-sm sm:text-base font-extrabold text-[#003d29]">
                          {formatCurrency(price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] sm:text-xs text-stone-500">
                        <span className="font-bold text-stone-800">4.9</span>
                        <div className="flex text-amber-500 text-[10px] sm:text-xs">{'★'.repeat(5)}</div>
                        <span className="text-stone-400 truncate">(128)</span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart CTA */}
                  <div className="mt-3 sm:mt-4 pt-2 border-t border-stone-100">
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`w-full py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors flex items-center justify-center gap-1 border ${
                        isAdded
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'bg-white text-stone-900 border-stone-300 hover:border-[#003d29] hover:bg-[#002b1c] hover:text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Tersimpan</span>
                        </>
                      ) : (
                        <span className="truncate">+ Keranjang</span>
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

      {/* Interactive Store Profile Modal */}
      <StoreProfileModal
        store={selectedStore}
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </div>
  );
}
