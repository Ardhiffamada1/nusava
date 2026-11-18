'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Check,
} from 'lucide-react';
import { useWishlistStore } from '../../stores/wishlist-store';
import { useCartStore } from '../../stores/cart-store';
import { useLanguageStore } from '../../stores/language-store';
import { formatCurrency } from '@commerceos/ui';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const { language } = useLanguageStore();
  const isId = language === 'id';

  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAddToCart = async (item: any) => {
    try {
      await addItem(item.id, 1);
      setAddedIds((prev) => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [item.id]: false }));
      }, 1500);
      openCart();
    } catch {
      openCart();
    }
  };

  const handleAddAllToCart = async () => {
    for (const it of items) {
      try {
        await addItem(it.id, 1);
      } catch {
        // continue
      }
    }
    openCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 font-sans space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#003d29]">
              {isId ? 'DAFTAR KEINGINAN' : 'SAVED ITEMS'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {isId ? 'Oleh-oleh Favorit Saya' : 'My Wishlist'}
            </h1>
            <span className="bg-gray-100 text-gray-700 px-3 py-0.5 rounded-full text-xs font-bold border border-gray-200">
              {items.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-lg">
            {isId
              ? 'Daftar produk oleh-oleh Nusantara yang kamu simpan untuk dibeli nanti.'
              : 'Keep track of traditional gifts and regional snacks you want to purchase.'}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearWishlist}
              className="text-xs font-semibold text-stone-500 hover:text-rose-600 px-3.5 py-2 rounded-lg border border-stone-200 hover:border-rose-200 transition-colors"
            >
              {isId ? 'Hapus Semua' : 'Clear All'}
            </button>
            <button
              onClick={handleAddAllToCart}
              className="text-xs font-semibold bg-[#003d29] hover:bg-[#002b1c] text-white px-4 py-2 rounded-lg transition-colors shadow-xs flex items-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{isId ? 'Beli Semua' : 'Add All to Cart'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Items Grid */}
      {items.length === 0 ? (
        <div className="max-w-md mx-auto py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5F6F6] flex items-center justify-center mx-auto mb-4 text-[#003d29]">
            <Heart className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {isId ? 'Belum ada oleh-oleh favorit' : 'Your wishlist is empty'}
          </h2>
          <p className="text-xs text-gray-500 mt-2 mb-6 leading-relaxed">
            {isId
              ? 'Tekan ikon hati (❤️) pada produk oleh-oleh mana pun untuk menyimpannya di daftar favorit ini.'
              : 'Tap the heart icon on any craft or souvenir to save it for later.'}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold px-7 py-3 rounded-full transition-all shadow-sm"
          >
            <span>{isId ? 'Jelajahi Oleh-oleh Nusantara' : 'Explore Catalog'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const isAdded = addedIds[item.id];

            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-4 shadow-xs flex flex-col justify-between group transition-colors"
              >
                <div>
                  {/* Photo with Remove Button */}
                  <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-lg overflow-hidden mb-3 border border-stone-100 flex items-center justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white hover:bg-stone-50 text-stone-400 hover:text-rose-600 shadow-xs flex items-center justify-center transition-colors z-10 border border-stone-200"
                      title={isId ? 'Hapus dari favorit' : 'Remove item'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Link href={`/products/${item.slug}`} className="relative w-full h-full block">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        loading="lazy"
                        decoding="async"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </Link>
                  </div>

                  {/* Origin Badge */}
                  {item.origin && (
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-[#003d29] bg-[#003d29]/8 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#003d29]" />
                        <span>{item.origin}</span>
                      </span>
                    </div>
                  )}

                  {/* Title & Price */}
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-xs font-bold text-stone-900 hover:text-[#003d29] transition-colors line-clamp-2 block leading-snug"
                  >
                    {item.title}
                  </Link>

                  <div className="mt-2 text-base font-bold text-stone-900">
                    {formatCurrency(item.price)}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border ${
                      isAdded
                        ? 'bg-[#003d29] text-white border-[#003d29]'
                        : 'bg-white text-stone-800 border-stone-300 hover:border-[#003d29] hover:bg-[#002b1c] hover:text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{isId ? 'Sudah di Keranjang' : 'In Cart'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{isId ? 'Beli Sekarang' : 'Add to Cart'}</span>
                      </>
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
