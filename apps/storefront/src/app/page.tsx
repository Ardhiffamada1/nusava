'use client';

import React, { useState } from 'react';
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

  const popularCategories = [
    {
      title: 'Kudapan & Makanan Khas',
      count: '240+ Produk Tersedia',
      slug: 'living-ceramics',
      image:
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80',
    },
    {
      title: 'Kerajinan Kayu Jati',
      count: '180+ Produk Tersedia',
      slug: 'living-ceramics',
      image:
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
    },
    {
      title: 'Gerabah & Tembikar',
      count: '140+ Produk Tersedia',
      slug: 'living-ceramics',
      image:
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80',
    },
    {
      title: 'Batik & Kain Nusantara',
      count: '120+ Produk Tersedia',
      slug: 'apparel',
      image:
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=300&q=80',
    },
    {
      title: 'Kopi & Rempah Asli',
      count: '95+ Produk Tersedia',
      slug: 'workspace',
      image:
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=300&q=80',
    },
    {
      title: 'Kerajinan Kulit Nabati',
      count: '80+ Produk Tersedia',
      slug: 'leather-goods',
      image:
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=300&q=80',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 font-sans space-y-12">
      {/* 1. HERO BANNER (Exact Style: Peach / Cream card with Dark Green Typography) */}
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
              className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1d] text-white text-sm font-bold px-8 py-3.5 rounded-full transition-all shadow-sm hover:scale-103"
            >
              <span>Beli Sekarang</span>
            </Link>
          </div>
        </div>

        {/* Right Lifestyle Image */}
        <div className="relative w-72 h-72 sm:w-88 sm:h-88 shrink-0">
          <Image
            src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
            alt="Oleh-oleh Tradisional Pilihan"
            fill
            priority
            className="object-cover rounded-2xl shadow-md"
          />
          <div className="absolute -bottom-3 -left-3 bg-white py-2 px-4 rounded-xl shadow-md border border-gray-100 flex items-center gap-2">
            <span className="text-xs font-bold text-[#003d29]">100% Asli Pengrajin</span>
            <span className="text-amber-500 font-bold">★ 4.9</span>
          </div>
        </div>
      </section>

      {/* 2. FILTER PILLS BAR (Exact Shopcart Horizontal Filter Pills) */}
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
            onClick={() => setActiveCategoryFilter('living-ceramics')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeCategoryFilter === 'living-ceramics'
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Kudapan & Gerabah</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveCategoryFilter('apparel')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeCategoryFilter === 'apparel'
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Batik & Wastra</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveCategoryFilter('workspace')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeCategoryFilter === 'workspace'
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Kopi & Rempah</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveCategoryFilter('leather-goods')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              activeCategoryFilter === 'leather-goods'
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            <span>Kerajinan Kulit</span>
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

      {/* 3. MAIN PRODUCT GRID ("Oleh-oleh Pilihan Buat Kamu!") */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Oleh-oleh Pilihan Buat Kamu!
          </h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#003d29] hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Produk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-square bg-[#F5F6F6] rounded-2xl" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {productsData?.items?.map((product) => {
              const defaultVariant = product.variants?.[0];
              const price = Number(defaultVariant?.priceOverride || product.basePrice || 0);
              const isFav = !!wishlist[product.id];
              const imageUrl =
                product.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80';

              return (
                <div key={product.id} className="group flex flex-col justify-between">
                  <div>
                    {/* Square Image Box with Wishlist Heart */}
                    <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-2xl flex items-center justify-center p-6 mb-3 overflow-hidden">
                      <button
                        onClick={(e) => toggleWishlist(e, product.id)}
                        className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center transition-colors z-10 ${
                          isFav ? 'text-rose-500 fill-rose-500' : 'text-gray-400 hover:text-rose-500'
                        }`}
                        title="Simpan ke favorit"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      <Link href={`/products/${product.slug}`} className="relative w-full h-full">
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-contain group-hover:scale-106 transition-transform duration-300"
                        />
                      </Link>
                    </div>

                    {/* Top Row: Title on Left, Price on Right */}
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-bold text-gray-900 group-hover:text-[#003d29] line-clamp-1 transition-colors"
                      >
                        {product.title}
                      </Link>
                      <span className="text-xs font-bold text-gray-900 font-mono whitespace-nowrap">
                        {formatCurrency(price)}
                      </span>
                    </div>

                    {/* Short Description */}
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>

                    {/* Star Rating (Green ★★★★★ like image) */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex text-emerald-600 text-[11px]">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">(121)</span>
                    </div>
                  </div>

                  {/* Add to Cart Pill Button (Style from image) */}
                  <div className="pt-3">
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`w-full py-2 px-4 rounded-full text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        addedId === product.id
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'border-gray-300 text-gray-800 hover:bg-[#003d29] hover:text-white hover:border-[#003d29]'
                      }`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Berhasil Masuk!</span>
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

      {/* 4. POPULAR CATEGORIES (From right-side preview in reference image) */}
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

      {/* 5. GUEST BENEFITS & ASSURANCES (Trust Badges) */}
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
