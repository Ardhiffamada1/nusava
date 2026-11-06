'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../../stores/cart-store';
import { useLanguageStore, translations } from '../../stores/language-store';

function MindiCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguageStore();
  const t = translations[language];

  const categorySlug = searchParams.get('category') || '';
  const search = searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest<any[]>('/categories'),
  });

  const selectedCategory = categories?.find((c) => c.slug === categorySlug);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', categorySlug, search, sortBy, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('categoryId', selectedCategory.id);
      if (search) params.set('search', search);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', page.toString());
      params.set('limit', '18');
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

  // Traditional UMKM Souvenir Categories
  const categoryFilters = [
    { label: t.catalog.categories.all, slug: '' },
    { label: t.catalog.categories.craft, slug: 'living-ceramics' },
    { label: t.catalog.categories.food, slug: 'apparel' },
    { label: t.catalog.categories.apparel, slug: 'apparel' },
    { label: t.catalog.categories.leather, slug: 'leather-goods' },
    { label: t.catalog.categories.coffee, slug: 'workspace' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-16">
      {/* Top Title & Sort Controls */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-2xl font-light text-gray-900 tracking-tight">{t.catalog.title}</h1>

        {/* Minimal Sort Dropdown (MINDI reference style) */}
        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            type="button"
            className="flex items-center gap-4 px-3.5 py-1.5 border border-gray-200 hover:border-gray-300 text-xs text-gray-700 bg-white rounded-lg transition-colors shadow-2xs"
          >
            <span className="capitalize font-medium">
              {sortBy === 'newest'
                ? t.catalog.sortOptions.newest
                : sortBy === 'price_asc'
                ? t.catalog.sortOptions.price_asc
                : sortBy === 'price_desc'
                ? t.catalog.sortOptions.price_desc
                : t.catalog.sortOptions.popular}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {sortDropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30 text-xs">
              {[
                { label: t.catalog.sortOptions.newest, val: 'newest' },
                { label: t.catalog.sortOptions.price_asc, val: 'price_asc' },
                { label: t.catalog.sortOptions.price_desc, val: 'price_desc' },
                { label: t.catalog.sortOptions.popular, val: 'popular' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => {
                    updateParam('sortBy', opt.val);
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 transition-colors ${
                    sortBy === opt.val
                      ? 'font-bold text-black bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main MINDI Layout: Left Category Text List + Right 3-Column Studio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Column: Quiet Vertical Text Category Navigation */}
        <aside className="md:col-span-3 lg:col-span-2 space-y-4 select-none">
          {categoryFilters.map((cat, idx) => {
            const isSelected =
              (!cat.slug && !categorySlug) || (cat.slug && categorySlug === cat.slug);
            return (
              <button
                key={idx}
                onClick={() => updateParam('category', cat.slug || null)}
                className={`block text-xs text-left tracking-wide transition-colors ${
                  isSelected
                    ? 'text-black font-bold'
                    : 'text-gray-500 hover:text-black font-normal'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </aside>

        {/* Right Column: 3-Column Airy Studio Grid */}
        <main className="md:col-span-9 lg:col-span-10">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded" />
                  <div className="h-4 bg-gray-100 w-2/3 rounded" />
                  <div className="h-3 bg-gray-100 w-1/4 rounded" />
                </div>
              ))}
            </div>
          ) : productsData?.items?.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-gray-500">{t.catalog.emptyState}</p>
              <button
                onClick={() => updateParam('category', null)}
                className="mt-4 text-xs font-semibold text-black underline"
              >
                {t.catalog.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {productsData?.items?.map((product) => {
                const defaultVariant = product.variants?.[0];
                const price = Number(defaultVariant?.price || 0);
                const imageUrl =
                  product.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80';

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group flex flex-col text-center focus:outline-none"
                  >
                    {/* Square Image Backdrop (#F6F6F6 studio feel) */}
                    <div className="relative aspect-square w-full bg-[#F7F7F7] flex items-center justify-center overflow-hidden mb-4 rounded-xs transition-colors group-hover:bg-[#F2F2F2]">
                      <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-8 group-hover:scale-104 transition-transform duration-500 ease-out"
                      />

                      {/* Subtle hover quick add button */}
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white text-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white"
                        title={t.catalog.quickAddSuccess}
                      >
                        {addedSlug === product.slug ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xs font-semibold text-gray-900 tracking-tight group-hover:opacity-75 transition-opacity">
                      {product.title}
                    </h3>

                    {/* Price */}
                    <span className="text-xs text-gray-500 mt-1 font-normal">
                      {formatCurrency(price)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-xs text-gray-400">
          Memuat produk...
        </div>
      }
    >
      <MindiCatalogContent />
    </Suspense>
  );
}
