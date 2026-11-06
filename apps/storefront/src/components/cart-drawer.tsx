'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../stores/cart-store';
import { formatCurrency } from '@commerceos/ui';

export function CartDrawer() {
  const { isOpen, closeCart, items, itemCount, subtotal, updateQuantity, removeItem, isLoading } = useCartStore();

  if (!isOpen) return null;

  const freeShippingThreshold = 150;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-xs transition-opacity duration-200"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-border animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-ink" />
            <span className="text-sm font-semibold tracking-tight text-ink uppercase">Your Bag</span>
            <span className="text-xs text-ink-secondary">({itemCount})</span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-ink-secondary hover:text-ink transition-colors rounded-sm hover:bg-muted"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="bg-surface px-6 py-3 border-b border-border text-xs">
          {remainingForFreeShipping > 0 ? (
            <p className="text-ink-secondary mb-2">
              Add <span className="font-semibold text-ink">{formatCurrency(remainingForFreeShipping)}</span> more for complimentary shipping
            </p>
          ) : (
            <p className="font-medium text-emerald-800 mb-2">You qualify for complimentary standard shipping.</p>
          )}
          <div className="w-full bg-border h-1 rounded-full overflow-hidden">
            <div
              className="bg-ink h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-8 h-8 text-ink-tertiary mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-ink">Your bag is empty</p>
              <p className="text-xs text-ink-secondary mt-1 mb-6">Discover our latest collection of essentials.</p>
              <button
                onClick={closeCart}
                className="text-xs font-semibold uppercase tracking-wider text-ink border border-border px-5 py-2.5 hover:bg-muted transition-colors"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                {/* Image */}
                <div className="relative w-16 h-20 bg-muted shrink-0 overflow-hidden rounded-xs border border-border/50">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productTitle}
                      fill
                      className="object-cover object-center"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-tertiary">
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
                        className="text-xs font-medium text-ink hover:underline line-clamp-1"
                      >
                        {item.productTitle}
                      </Link>
                      <span className="text-xs font-mono text-ink">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>

                    <p className="text-[11px] text-ink-secondary mt-0.5">{item.variantTitle}</p>
                    {item.availableStock <= 3 && item.availableStock > 0 && (
                      <p className="text-[10px] text-amber-700 font-medium mt-1">
                        Only {item.availableStock} left
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-xs">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isLoading || item.quantity <= 1}
                        className="p-1 hover:bg-muted disabled:opacity-30 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3 text-ink" />
                      </button>
                      <span className="px-2 text-xs font-mono text-ink select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.availableStock}
                        className="p-1 hover:bg-muted disabled:opacity-30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3 text-ink" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-ink-tertiary hover:text-rose-600 transition-colors p-1"
                      aria-label="Remove item"
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
          <div className="p-6 border-t border-border bg-surface">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-ink-secondary">Subtotal</span>
              <span className="text-sm font-mono font-medium text-ink">{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-[11px] text-ink-tertiary mb-4">Taxes and shipping calculated at checkout.</p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 bg-ink text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-4 hover:bg-ink/90 transition-all rounded-xs shadow-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="mt-2 text-center">
              <Link
                href="/cart"
                onClick={closeCart}
                className="text-[11px] text-ink-secondary hover:text-ink underline transition-colors"
              >
                View full bag details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
