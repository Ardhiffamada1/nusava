'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  Heart,
  Plus,
  Check,
  SlidersHorizontal,
  MapPin,
  Compass,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../../stores/cart-store';
import { useWishlistStore } from '../../stores/wishlist-store';
import { getProductOrigin, NUSANTARA_ORIGIN_TABS } from '../../lib/storefront-helpers';

function ShopcartCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categorySlug = searchParams.get('category') || '';
  const originParam = searchParams.get('origin') || '';
  const search = searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [addedSlug, setAddedSlug] = useState<string | null>(null);
  const { toggleItem, isInWishlist } = useWishlistStore();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest<any[]>('/categories'),
  });

  const selectedCategory = categories?.find((c) => c.slug === categorySlug);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', categorySlug, originParam, search, sortBy, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('categoryId', selectedCategory.id);
      if (originParam) params.set('origin', originParam);
      if (search) params.set('search', search);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', page.toString());
      params.set('limit', '16');
      return apiRequest<{ items: any[]; meta: { total: number; page: number; totalPages: number } }>(
        `/products?${params.toString()}`,
      );
    },
  });

  const { addItem, openCart } = useCartStore();

  const updateParam = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    current.set('page', '1');
    router.push(`/products?${current.toString()}`);
  };

  const handleQuickAdd = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants?.[0];
    if (!defaultVariant) return;

    await addItem(defaultVariant.id, 1);
    setAddedSlug(product.slug);
    setTimeout(() => setAddedSlug(null), 1200);
    openCart();
  };

  const toggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const imageUrl =
      product.images?.[0]?.url ||
      'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg';

    toggleItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.basePrice),
      imageUrl,
      category: product.category?.name,
      origin: getProductOrigin(product).badge,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 font-sans space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#003d29] font-bold block mb-1">
            KATALOG LENGKAP
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {selectedCategory ? selectedCategory.name : 'Semua Pilihan Oleh-oleh'}
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-lg">
            {selectedCategory?.description ||
              'Koleksi lengkap kudapan tradisional, batik, dan kerajinan khas dari pengrajin daerah.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => updateParam('sortBy', e.target.value)}
            className="text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 outline-none focus:border-[#003d29] cursor-pointer"
          >
            <option value="newest">Paling Sesuai</option>
            <option value="price_asc">Harga: Rendah ke Tinggi</option>
            <option value="price_desc">Harga: Tinggi ke Rendah</option>
            <option value="popular">Paling Banyak Dibeli</option>
          </select>
        </div>
      </div>

      {/* Filter Pills Strip: Categories */}
      <div className="space-y-3 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => updateParam('category', null)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              !categorySlug
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            Semua Kategori
          </button>

          {categories?.map((cat) => {
            const isSelected = categorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateParam('category', cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                  isSelected
                    ? 'bg-[#003d29] text-white border-[#003d29]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Peta Rasa Nusantara - Origin City Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          <span className="text-[11px] font-bold text-[#003d29] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#003d29]" />
            <span>Asal Daerah:</span>
          </span>
          {NUSANTARA_ORIGIN_TABS.map((tab) => {
            const isSelected = originParam === tab.city;
            return (
              <button
                key={tab.id || 'all-origin'}
                onClick={() => updateParam('origin', tab.city || null)}
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
      </div>

      {/* Products Grid (4 columns) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-square bg-[#F5F6F6] rounded-2xl" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : productsData?.items?.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm font-semibold text-gray-800">
            Belum ada produk untuk kategori ini.
          </p>
          <button
            onClick={() => updateParam('category', null)}
            className="mt-3 text-xs font-bold text-[#003d29] underline"
          >
            Tampilkan semua produk
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
          {productsData?.items?.map((product) => {
            const defaultVariant = product.variants?.[0];
            const price = Number(defaultVariant?.priceOverride || product.basePrice || 0);
            const isFav = isInWishlist(product.id);
            const imageUrl =
              product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80';

            return (
              <div key={product.id} className="group flex flex-col justify-between bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-3.5 shadow-xs transition-colors">
                <div>
                  {/* Image Box with Wishlist Heart */}
                  <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-lg flex items-center justify-center p-4 mb-3 overflow-hidden border border-stone-100">
                    <button
                      onClick={(e) => toggleWishlist(e, product)}
                      className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center transition-colors z-10 border border-stone-200 ${
                        isFav ? 'text-rose-600' : 'text-stone-400 hover:text-rose-600'
                      }`}
                      title="Simpan ke favorit"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-rose-600' : ''}`} />
                    </button>

                    <Link href={`/products/${product.slug}`} className="relative w-full h-full block">
                      <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                    </Link>
                  </div>

                  {/* Origin Badge & Category */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-semibold text-[#003d29] bg-[#003d29]/8 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#003d29]" />
                      <span>{getProductOrigin(product).badge}</span>
                    </span>
                    <span className="text-xs text-stone-400 font-medium truncate">
                      {product.category?.name}
                    </span>
                  </div>

                  {/* Title & Price */}
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-xs font-bold text-stone-900 group-hover:text-[#003d29] line-clamp-1 transition-colors"
                    >
                      {product.title}
                    </Link>
                    <span className="text-sm font-bold text-stone-900 whitespace-nowrap">
                      {formatCurrency(price)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
                    <span className="font-bold text-stone-800">4.9</span>
                    <div className="flex text-[#003d29] text-xs">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-stone-400">(121)</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="pt-3 border-t border-stone-100 mt-2">
                  <button
                    onClick={(e) => handleQuickAdd(e, product)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                      addedSlug === product.slug
                        ? 'bg-[#003d29] text-white border-[#003d29]'
                        : 'border-stone-300 text-stone-800 hover:bg-[#003d29] hover:text-white hover:border-[#003d29]'
                    }`}
                  >
                    {addedSlug === product.slug ? (
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
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-xs text-gray-400">
          Memuat katalog...
        </div>
      }
    >
      <ShopcartCatalogContent />
    </Suspense>
  );
}
