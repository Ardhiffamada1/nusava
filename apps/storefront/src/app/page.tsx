'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatCurrency } from '@commerceos/ui';

export default function HomePage() {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => apiRequest<{ items: any[] }>('/products?limit=6&sortBy=newest'),
  });

  return (
    <div className="flex flex-col">
      {/* Editorial Minimalist Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28 text-center flex flex-col items-center justify-center">
        <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-gray-400 mb-4">
          Objects of Simplicity & Quiet Utility
        </span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-gray-900 max-w-2xl leading-[1.25]">
          Honest materials crafted for daily life.
        </h1>
        <p className="text-xs md:text-sm text-gray-500 max-w-md mt-4 leading-relaxed font-normal">
          Designed with architectural precision, powered by a transactional inventory ledger.
        </p>

        <div className="flex items-center gap-6 mt-8">
          <Link
            href="/products"
            className="text-xs font-semibold uppercase tracking-wider text-black border-b border-black pb-1 hover:opacity-70 transition-opacity"
          >
            Explore Catalog
          </Link>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
          >
            Admin Console →
          </a>
        </div>
      </section>

      {/* MINDI Studio Product Grid Showcase */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24 w-full">
        <div className="flex justify-between items-baseline mb-10 border-b border-gray-100 pb-4">
          <h2 className="text-sm font-medium tracking-wide uppercase text-gray-900">
            Selected Editions
          </h2>
          <Link
            href="/products"
            className="text-xs text-gray-500 hover:text-black transition-colors"
          >
            View all 31 objects
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {productsData?.items?.slice(0, 6).map((product) => {
              const defaultVariant = product.variants?.[0];
              const price = Number(defaultVariant?.price || 0);
              const imageUrl =
                product.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80';

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col text-center"
                >
                  <div className="relative aspect-square w-full bg-[#F7F7F7] flex items-center justify-center overflow-hidden mb-4 rounded-xs transition-colors group-hover:bg-[#F2F2F2]">
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-8 group-hover:scale-104 transition-transform duration-500 ease-out"
                    />
                  </div>
                  <h3 className="text-xs font-medium text-gray-900 tracking-tight group-hover:opacity-75 transition-opacity">
                    {product.title}
                  </h3>
                  <span className="text-xs text-gray-500 mt-1 font-normal">
                    {formatCurrency(price)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
