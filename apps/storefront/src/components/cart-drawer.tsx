'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../stores/cart-store';
import { formatCurrency } from '@commerceos/ui';
import { useLanguageStore } from '../stores/language-store';

export function CartDrawer() {
  const { isOpen, closeCart, items, itemCount, subtotal, updateQuantity, removeItem, isLoading } =
    useCartStore();
  const { language } = useLanguageStore();

  if (!isOpen) return null;

  const isId = language === 'id';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#F0F0EE] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-gray-900" />
            <span className="text-xs font-semibold tracking-wider text-gray-900 uppercase">
              {isId ? 'Keranjang Belanja' : 'Your Bag'}
            </span>
            <span className="text-xs font-mono text-gray-400">({itemCount})</span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#F0F0EE]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 text-gray-400">
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {isId ? 'Keranjang masih kosong' : 'Your bag is empty'}
              </p>
              <p className="text-xs text-gray-500 mt-1 mb-6 max-w-xs">
                {isId
                  ? 'Temukan ragam karya pengrajin dan oleh-oleh Nusantara pilihan kami.'
                  : 'Discover our latest collection of handcrafted artisan heirlooms.'}
              </p>
              <button
                onClick={closeCart}
                className="text-xs font-semibold uppercase tracking-wider text-black border-b border-black pb-1 hover:opacity-70 transition-opacity"
              >
                {isId ? 'Mulai Belanja' : 'Start Browsing'}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                {/* Image */}
                <div className="relative w-16 h-16 bg-[#F7F7F6] shrink-0 overflow-hidden rounded-xl border border-gray-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productTitle}
                      fill
                      className="object-contain p-2"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`/products/${item.productSlug}`}
                        onClick={closeCart}
                        className="text-xs font-semibold text-gray-900 hover:underline line-clamp-1"
                      >
                        {item.productTitle}
                      </Link>
                      <span className="text-xs font-bold text-gray-900">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-0.5">{item.variantTitle}</p>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isLoading || item.quantity <= 1}
                        className="px-2 py-1 text-gray-500 hover:text-black disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.availableStock}
                        className="px-2 py-1 text-gray-500 hover:text-black disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                      title="Hapus item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#F0F0EE] bg-[#FAF9F5]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">{isId ? 'Subtotal' : 'Subtotal'}</span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mb-4">
              {isId
                ? 'Ongkos kirim kurir dihitung saat checkout.'
                : 'Courier shipping calculated at checkout.'}
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-4 transition-all rounded-full shadow-sm"
            >
              <span>{isId ? 'Lanjut ke Pembayaran' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="mt-3 text-center">
              <Link
                href="/cart"
                onClick={closeCart}
                className="text-[11px] text-gray-500 hover:text-black underline transition-colors"
              >
                {isId ? 'Lihat rincian lengkap keranjang' : 'View full bag details'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
