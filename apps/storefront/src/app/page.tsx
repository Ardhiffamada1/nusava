'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Plus, Check, ShieldCheck, Package, Truck, Heart } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../stores/cart-store';
import { useLanguageStore, translations } from '../stores/language-store';

export default function HomePage() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { addItem, openCart } = useCartStore();
  const [addedId, setAddedId] = useState<string | null>(null);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => apiRequest<{ items: any[] }>('/products?limit=6&sortBy=newest'),
  });

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

  const curatedCategories = [
    {
      title: t.categories.wood.title,
      origin: t.categories.wood.origin,
      count: t.categories.wood.count,
      slug: 'living-ceramics',
      image:
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: t.categories.ceramic.title,
      origin: t.categories.ceramic.origin,
      count: t.categories.ceramic.count,
      slug: 'living-ceramics',
      image:
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: t.categories.culinary.title,
      origin: t.categories.culinary.origin,
      count: t.categories.culinary.count,
      slug: 'workspace',
      image:
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: t.categories.textile.title,
      origin: t.categories.textile.origin,
      count: t.categories.textile.count,
      slug: 'apparel',
      image:
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80',
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 1. EDITORIAL ASYMMETRIC HERO */}
      <section className="border-b border-[#F0F0EE] bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>{t.hero.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 leading-[1.15]">
                {t.hero.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-600 max-w-xl font-normal leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[#18181B] hover:bg-black text-white text-xs font-semibold px-6 py-3.5 rounded-full transition-all shadow-2xs"
                >
                  <span>{t.hero.exploreBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black border border-gray-300 hover:border-gray-900 px-6 py-3.5 rounded-full transition-colors"
                >
                  <span>{t.hero.storyBtn}</span>
                </Link>
              </div>

              {/* Provenance Micro-strip */}
              <div className="pt-8 border-t border-[#EAE9E4] grid grid-cols-3 gap-4 text-left">
                <div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Yogyakarta</span>
                  <span className="text-xs font-medium text-gray-800">Gerabah Kasongan</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Jepara</span>
                  <span className="text-xs font-medium text-gray-800">Kayu Jati Pahat</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">Aceh</span>
                  <span className="text-xs font-medium text-gray-800">Kopi Sangrai Gayo</span>
                </div>
              </div>
            </div>

            {/* Right Featured Imagery */}
            <div className="lg:col-span-5">
              <div className="relative aspect-4/5 w-full bg-[#EBE9E3] rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80"
                  alt="Ceramic Craft Studio"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-white/80 block">
                    Karya Pilihan Musim Ini
                  </span>
                  <span className="text-sm font-semibold block mt-0.5">
                    Cangkir Tanah Liat Bakar & Nampan Kayu Jati
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REGIONAL CRAFT STRIPS (Ragam Kriya & Cita Rasa) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-b border-[#F0F0EE]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 block mb-1">
              PROVENANSI NUSANTARA
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">
              {t.categories.heading}
            </h2>
          </div>
          <p className="text-xs text-gray-500 max-w-sm mt-3 md:mt-0 leading-relaxed">
            {t.categories.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curatedCategories.map((cat, i) => (
            <Link
              key={i}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col focus:outline-none"
            >
              <div className="relative aspect-4/5 w-full bg-[#F5F4F0] rounded-xl overflow-hidden mb-4 transition-transform duration-500 group-hover:-translate-y-1">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <span className="absolute top-3 right-3 text-[10px] font-mono font-semibold bg-white/90 backdrop-blur-xs text-gray-800 px-2 py-0.5 rounded-full">
                  {cat.count}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:underline">
                {cat.title}
              </h3>
              <span className="text-xs text-gray-500 mt-0.5">{cat.origin}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. MINDI CURATED SHOWCASE (Pilihan Kurator Bulan Ini) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-b border-[#F0F0EE]">
        <div className="flex justify-between items-baseline mb-12">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 block mb-1">
              {t.showcase.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">
              {t.showcase.heading}
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-gray-900 hover:opacity-70 transition-opacity flex items-center gap-1"
          >
            <span>{t.showcase.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-[#F7F7F6] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {productsData?.items?.slice(0, 6).map((product) => {
              const defaultVariant = product.variants?.[0];
              const price = Number(defaultVariant?.priceOverride || product.basePrice || 0);
              const imageUrl =
                product.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80';

              return (
                <div key={product.id} className="group flex flex-col text-left">
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative aspect-square w-full bg-[#F7F7F6] flex items-center justify-center overflow-hidden mb-4 rounded-xl transition-colors group-hover:bg-[#F2F1ED]"
                  >
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-8 group-hover:scale-104 transition-transform duration-500 ease-out"
                    />

                    {/* Quick Add Pill on Hover */}
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="absolute bottom-4 right-4 bg-white/95 text-gray-900 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white flex items-center gap-1.5"
                    >
                      {addedId === product.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.showcase.added}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.showcase.quickAdd}</span>
                        </>
                      )}
                    </button>
                  </Link>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-semibold text-gray-900 tracking-tight hover:underline block"
                      >
                        {product.title}
                      </Link>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">
                        {product.category?.name || 'Kriya Tradisi'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 font-mono">
                      {formatCurrency(price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. EDITORIAL PHILOSOPHY & ARTISAN VALUES */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-b border-[#F0F0EE]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Artisan Working Imagery */}
          <div className="lg:col-span-5">
            <div className="relative aspect-4/5 w-full bg-[#EBE9E3] rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80"
                alt="Artisan hands shaping pottery"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Manifesto & Pillars */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 block mb-2">
                {t.philosophy.tag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight leading-snug">
                {t.philosophy.title}
              </h2>
              <blockquote className="text-sm sm:text-base italic text-gray-600 mt-4 leading-relaxed border-l-2 border-gray-900 pl-4 font-normal">
                {t.philosophy.quote}
              </blockquote>
            </div>

            <div className="space-y-6 pt-4 border-t border-[#F0F0EE]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  1. {t.philosophy.pillar1Title}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {t.philosophy.pillar1Desc}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  2. {t.philosophy.pillar2Title}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {t.philosophy.pillar2Desc}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  3. {t.philosophy.pillar3Title}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {t.philosophy.pillar3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ARTISAN ASSURANCES (4-Item Clean Strip) */}
      <section className="bg-[#FAF9F5] border-b border-[#F0F0EE] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#EAE9E4]">
            {t.assurances.map((item, i) => (
              <div key={i} className={`flex flex-col ${i > 0 ? 'sm:pl-8' : ''} ${i > 0 ? 'pt-6 sm:pt-0' : ''}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WARTA PENGRAJIN (Journal Stories) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="flex justify-between items-baseline mb-12">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 block mb-1">
              {t.journal.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">
              {t.journal.title}
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-xs font-semibold text-gray-900 hover:opacity-70 transition-opacity"
          >
            {t.journal.readArticle} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.journal.articles.map((art, idx) => (
            <article key={idx} className="group flex flex-col space-y-3 cursor-pointer">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase">
                <span>{art.category}</span>
                <span>•</span>
                <span>{art.date}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
                {art.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Catatan mendalam seputar materialitas, teknik pembakaran, dan ketekunan pengrajin lokal Nusantara.
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
