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
  Store,
  Star,
  Truck,
  RotateCcw,
  X,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../../stores/cart-store';
import { useWishlistStore } from '../../stores/wishlist-store';
import {
  getProductOrigin,
  getProductStore,
  NUSANTARA_ORIGIN_TABS,
  StoreProfile,
} from '../../lib/storefront-helpers';
import { StoreProfileModal } from '../../components/store-profile-modal';

function NusavaCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categorySlug = searchParams.get('category') || '';
  const originParam = searchParams.get('origin') || '';
  const search = searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [addedSlug, setAddedSlug] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreProfile | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<'all' | 'under50k' | '50k-150k' | 'above150k'>('all');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
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

  const hasActiveFilters =
    priceRange !== 'all' || minRating !== null || freeShippingOnly || inStockOnly;

  const resetFilters = () => {
    setPriceRange('all');
    setMinRating(null);
    setFreeShippingOnly(false);
    setInStockOnly(false);
  };

  const displayedProducts = (productsData?.items || []).filter((product) => {
    const defaultVariant = product.variants?.[0];
    const price = Number(defaultVariant?.priceOverride || product.basePrice || 0);

    if (priceRange === 'under50k' && price >= 50000) return false;
    if (priceRange === '50k-150k' && (price < 50000 || price > 150000)) return false;
    if (priceRange === 'above150k' && price <= 150000) return false;

    if (minRating && 4.9 < minRating) return false;

    const stock = defaultVariant?.inventory?.quantityOnHand ?? 10;
    if (inStockOnly && stock <= 0) return false;

    if (freeShippingOnly && price < 150000) return false;

    return true;
  });

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
    setTimeout(() => setAddedSlug(null), 1500);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 font-sans space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-stone-200">
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#003d29] font-bold block mb-0.5">
            KATALOG LENGKAP
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
            {selectedCategory ? selectedCategory.name : 'Semua Pilihan Oleh-oleh'}
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-lg line-clamp-2 sm:line-clamp-none">
            {selectedCategory?.description ||
              'Koleksi lengkap aneka oleh-oleh tradisional, kopi, batik, dan kerajinan khas dari sentra UMKM daerah.'}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <span className="text-xs text-stone-500 whitespace-nowrap">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => updateParam('sortBy', e.target.value)}
            className="text-xs font-semibold text-stone-800 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#003d29] cursor-pointer"
          >
            <option value="newest">Paling Sesuai</option>
            <option value="price_asc">Harga: Terendah</option>
            <option value="price_desc">Harga: Tertinggi</option>
            <option value="popular">Paling Populer</option>
          </select>
        </div>
      </div>

      {/* ========================================================
          FILTER SECTION: Responsive Mobile Dropdowns + Desktop Pills
      ======================================================== */}
      
      {/* 1. MOBILE FILTER BAR (Strictly optimized for smartphone screens) */}
      <div className="block sm:hidden space-y-2 pb-1">
        <div className="flex items-center gap-2">
          {/* Mobile Dropdown 1: Kategori */}
          <div className="relative flex-1">
            <select
              value={categorySlug}
              onChange={(e) => updateParam('category', e.target.value || null)}
              className="w-full appearance-none bg-white border border-stone-200 text-stone-800 font-semibold text-xs py-2.5 pl-3 pr-7 rounded-xl outline-none focus:border-[#003d29] shadow-2xs truncate cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mobile Dropdown 2: Daerah Asal */}
          <div className="relative flex-1">
            <select
              value={originParam}
              onChange={(e) => updateParam('origin', e.target.value || null)}
              className="w-full appearance-none bg-white border border-stone-200 text-stone-800 font-semibold text-xs py-2.5 pl-3 pr-7 rounded-xl outline-none focus:border-[#003d29] shadow-2xs truncate cursor-pointer"
            >
              {NUSANTARA_ORIGIN_TABS.map((tab) => (
                <option key={tab.id || 'all-origin'} value={tab.city}>
                  {tab.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mobile Button: Buka Drawer Filter Lengkap */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="p-2.5 bg-white border border-stone-200 text-stone-800 rounded-xl hover:border-[#003d29] shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
            title="Filter Lengkap"
            aria-label="Filter Lengkap"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#003d29]" />
          </button>
        </div>

        {/* Mobile Active Filter Chips & Quick Reset */}
        {(categorySlug || originParam || hasActiveFilters) && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {categorySlug && (
              <span className="inline-flex items-center gap-1 bg-[#003d29]/10 text-[#003d29] text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                <span>{selectedCategory?.name || categorySlug}</span>
                <button
                  type="button"
                  onClick={() => updateParam('category', null)}
                  className="hover:text-black cursor-pointer"
                  title="Hapus filter kategori"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {originParam && (
              <span className="inline-flex items-center gap-1 bg-[#003d29]/10 text-[#003d29] text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                <span>Khas {originParam}</span>
                <button
                  type="button"
                  onClick={() => updateParam('origin', null)}
                  className="hover:text-black cursor-pointer"
                  title="Hapus filter daerah"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                resetFilters();
                updateParam('category', null);
                updateParam('origin', null);
              }}
              className="text-[10.5px] font-bold text-stone-500 hover:text-stone-900 underline shrink-0 ml-1 cursor-pointer"
            >
              Hapus Semua
            </button>
          </div>
        )}
      </div>

      {/* 2. DESKTOP FILTER BAR (Spacious pills for tablet/desktop) */}
      <div className="hidden sm:block space-y-3 pb-1">
        {/* Categories Strip */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => updateParam('category', null)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 transition-colors ${
              !categorySlug
                ? 'bg-[#003d29] text-white border-[#003d29]'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
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
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#003d29] text-white border-[#003d29]'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Origin City Strip */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-0.5 pb-1">
          <span className="text-[11px] font-bold text-[#003d29] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#003d29]" />
            <span>Daerah:</span>
          </span>
          {NUSANTARA_ORIGIN_TABS.map((tab) => {
            const isSelected = originParam === tab.city;
            return (
              <button
                key={tab.id || 'all-origin'}
                onClick={() => updateParam('origin', tab.city || null)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-[#003d29] text-white border-[#003d29] shadow-2xs'
                    : 'bg-[#FAF9F5] text-stone-700 border-stone-200 hover:border-stone-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Desktop Quick Filter Bar */}
        <div className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mr-0.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#003d29]" />
              <span>Filter:</span>
            </span>

            {/* Price Filter Pills */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as any)}
              className="bg-white border border-stone-200 text-stone-800 font-semibold px-2.5 py-1 rounded-lg text-xs outline-none focus:border-[#003d29] cursor-pointer"
            >
              <option value="all">Semua Harga</option>
              <option value="under50k">&lt; Rp 50rb</option>
              <option value="50k-150k">Rp 50rb - 150rb</option>
              <option value="above150k">&gt; Rp 150rb</option>
            </select>

            {/* Rating Filter Pill */}
            <button
              onClick={() => setMinRating(minRating === 4.5 ? null : 4.5)}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors flex items-center gap-1 ${
                minRating === 4.5
                  ? 'bg-[#003d29] text-white border-[#003d29]'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
              }`}
            >
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>4.5+</span>
            </button>

            {/* Free Shipping Pill */}
            <button
              onClick={() => setFreeShippingOnly(!freeShippingOnly)}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors flex items-center gap-1 ${
                freeShippingOnly
                  ? 'bg-[#003d29] text-white border-[#003d29]'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
              }`}
            >
              <Truck className="w-3 h-3 text-[#003d29]" />
              <span>Bebas Ongkir</span>
            </button>

            {/* In Stock Pill */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors flex items-center gap-1 ${
                inStockOnly
                  ? 'bg-[#003d29] text-white border-[#003d29]'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
              }`}
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Ready Stock</span>
            </button>
          </div>

          {/* Reset Action */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-stone-600 hover:text-[#003d29] underline flex items-center gap-1 shrink-0 ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Grid (2 columns on Mobile, 3 on Tablet, 4 on Desktop) */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 py-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-square bg-[#F5F6F6] rounded-2xl" />
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm font-semibold text-stone-800">
            Tidak ada produk yang sesuai dengan kriteria filter kamu.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-[#003d29] underline"
              >
                Reset Filter Pencarian
              </button>
            )}
            <button
              onClick={() => {
                resetFilters();
                updateParam('category', null);
                updateParam('origin', null);
              }}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 underline"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {displayedProducts.map((product, index) => {
            const defaultVariant = product.variants?.[0];
            const price = Number(defaultVariant?.priceOverride || product.basePrice || 0);
            const isFav = isInWishlist(product.id);
            const imageUrl =
              product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80';
            const origin = getProductOrigin(product);
            const store = getProductStore(product);

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-2.5 sm:p-4 shadow-xs transition-colors"
              >
                <div>
                  {/* Image Box with Wishlist Heart */}
                  <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-lg flex items-center justify-center p-2.5 sm:p-4 mb-2.5 sm:mb-3 overflow-hidden border border-stone-100">
                    <button
                      onClick={(e) => toggleWishlist(e, product)}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center transition-colors z-10 border border-stone-200 ${
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
                        priority={index < 4}
                        loading={index < 4 ? undefined : 'lazy'}
                        decoding="async"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                    </Link>
                  </div>

                  {/* Store / Seller Name (Directly Below Product Image) */}
                  <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-stone-600 font-semibold mb-1.5 pb-1.5 border-b border-stone-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedStore(store);
                      }}
                      className="inline-flex items-center gap-1 hover:text-[#003d29] hover:underline truncate text-left min-w-0"
                      title="Lihat profil toko penjual"
                    >
                      <Store className="w-3 h-3 text-[#003d29] shrink-0" />
                      <span className="truncate">{store.name}</span>
                    </button>
                    <span className="hidden sm:inline text-[10px] text-stone-400 font-medium shrink-0">
                      {store.city}
                    </span>
                  </div>

                  {/* Origin Badge & Category */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#003d29] bg-[#003d29]/8 px-1.5 sm:px-2 py-0.5 rounded-md inline-flex items-center gap-1 truncate max-w-full">
                      <MapPin className="w-2.5 h-2.5 text-[#003d29] shrink-0" />
                      <span className="truncate">{origin.badge}</span>
                    </span>
                    <span className="hidden sm:inline text-[11px] text-stone-400 font-medium truncate">
                      {product.category?.name}
                    </span>
                  </div>

                  {/* Title & Price (Stacked cleanly for mobile 2-col responsiveness) */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-xs font-bold text-stone-900 group-hover:text-[#003d29] line-clamp-2 transition-colors block leading-snug h-8 sm:h-9"
                  >
                    {product.title}
                  </Link>

                  <div className="mt-1">
                    <span className="text-xs sm:text-base font-extrabold text-[#003d29] block">
                      {formatCurrency(price)}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-stone-500">
                    <span className="font-bold text-stone-800">4.9</span>
                    <span className="text-amber-500 text-xs">★</span>
                    <span className="text-stone-400 text-[10px]">(121)</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="pt-2 sm:pt-3 border-t border-stone-100 mt-2">
                  <button
                    onClick={(e) => handleQuickAdd(e, product)}
                    className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold border transition-colors flex items-center justify-center gap-1 ${
                      addedSlug === product.slug
                        ? 'bg-[#003d29] text-white border-[#003d29]'
                        : 'border-stone-300 text-stone-800 hover:bg-[#003d29] hover:text-white hover:border-[#003d29]'
                    }`}
                  >
                    {addedSlug === product.slug ? (
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

      {/* Interactive Store Profile Modal */}
      <StoreProfileModal
        store={selectedStore}
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
      />

      {/* 3. MOBILE FILTER BOTTOM SHEET DRAWER (Sliding panel for mobile) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Sheet Container */}
          <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl z-10 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Filter Pilihan Oleh-oleh</h3>
                <p className="text-[11px] text-stone-500">Pilih kategori dan kota asal khas daerah</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:text-black cursor-pointer"
                title="Tutup"
                aria-label="Tutup Filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-5 text-xs">
              {/* Kategori */}
              <div>
                <span className="font-bold text-stone-900 block mb-2">Kategori Produk:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateParam('category', null)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-colors ${
                      !categorySlug
                        ? 'bg-[#003d29] text-white border-[#003d29]'
                        : 'bg-[#FAF9F5] text-stone-700 border-stone-200'
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => updateParam('category', cat.slug)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-colors truncate ${
                        categorySlug === cat.slug
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'bg-[#FAF9F5] text-stone-700 border-stone-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daerah Asal */}
              <div>
                <span className="font-bold text-stone-900 block mb-2">Daerah Asal:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {NUSANTARA_ORIGIN_TABS.map((tab) => (
                    <button
                      key={tab.id || 'all-origin'}
                      type="button"
                      onClick={() => updateParam('origin', tab.city || null)}
                      className={`py-2 px-2 rounded-lg border text-center font-semibold text-[11px] transition-colors truncate ${
                        originParam === tab.city
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'bg-[#FAF9F5] text-stone-700 border-stone-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Tambahan */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <span className="font-bold text-stone-900 block mb-1">Filter Tambahan:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMinRating(minRating === 4.5 ? null : 4.5)}
                    className={`px-3 py-1.5 rounded-lg font-semibold border flex items-center gap-1 ${
                      minRating === 4.5
                        ? 'bg-[#003d29] text-white border-[#003d29]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Rating 4.5+</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFreeShippingOnly(!freeShippingOnly)}
                    className={`px-3 py-1.5 rounded-lg font-semibold border flex items-center gap-1 ${
                      freeShippingOnly
                        ? 'bg-[#003d29] text-white border-[#003d29]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-[#003d29]" />
                    <span>Bebas Ongkir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`px-3 py-1.5 rounded-lg font-semibold border flex items-center gap-1 ${
                      inStockOnly
                        ? 'bg-[#003d29] text-white border-[#003d29]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ready Stock</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  updateParam('category', null);
                  updateParam('origin', null);
                }}
                className="w-1/3 py-2.5 bg-white border border-stone-300 text-stone-700 font-bold rounded-xl text-center text-xs cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#003d29] text-white font-bold rounded-xl text-center text-xs shadow-xs cursor-pointer"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
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
      <NusavaCatalogContent />
    </Suspense>
  );
}
