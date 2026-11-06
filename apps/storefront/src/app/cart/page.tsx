'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, Shield } from 'lucide-react';
import { useCartStore } from '../../stores/cart-store';
import { formatCurrency } from '@commerceos/ui';

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, isLoading } = useCartStore();

  const freeShippingThreshold = 150;
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const grandTotal = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="w-12 h-12 rounded-xs border border-border flex items-center justify-center mx-auto mb-4 bg-surface">
          <ShoppingBag className="w-6 h-6 text-ink" />
        </div>
        <h1 className="text-2xl font-light text-ink tracking-tight">Your shopping bag is empty</h1>
        <p className="text-xs text-ink-secondary mt-2 mb-8 max-w-sm mx-auto">
          Explore our permanent collection of raw textiles, vegetable-tanned leather, and machined workspace objects.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-ink text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-6 rounded-xs hover:bg-ink/90 transition-all"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="border-b border-border pb-6 mb-8 flex items-baseline justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-ink-secondary">Review Selection</span>
          <h1 className="text-2xl md:text-3xl font-light text-ink tracking-tight mt-1">Shopping Bag</h1>
        </div>
        <span className="text-xs font-mono text-ink-secondary">{itemCount} Items</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Line Items Table */}
        <div className="lg:col-span-8 divide-y divide-border border-y border-border">
          {items.map((item) => (
            <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-6 items-start">
              {/* Product Thumbnail */}
              <div className="relative w-24 h-32 bg-muted shrink-0 overflow-hidden border border-border">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productTitle}
                    fill
                    className="object-cover object-center"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-tertiary">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Details & Controls */}
              <div className="flex-1 w-full flex flex-col justify-between self-stretch">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="text-sm font-medium text-ink hover:underline"
                      >
                        {item.productTitle}
                      </Link>
                      <p className="text-xs text-ink-secondary mt-1">{item.variantTitle}</p>
                      <p className="text-[11px] font-mono text-ink-tertiary mt-0.5">SKU: {item.sku}</p>
                    </div>

                    <span className="text-sm font-mono font-medium text-ink">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>

                  {item.availableStock <= 5 && item.availableStock > 0 && (
                    <p className="text-[11px] text-amber-800 font-medium mt-2">
                      Low stock: Only {item.availableStock} units remaining
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-border rounded-xs bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={isLoading || item.quantity <= 1}
                      className="px-2.5 py-1 text-ink hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 font-mono text-xs text-ink">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isLoading || item.quantity >= item.availableStock}
                      className="px-2.5 py-1 text-ink hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-ink-secondary hover:text-rose-600 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-surface border border-border p-6 rounded-xs sticky top-24">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink mb-6">
            Summary
          </h2>

          <div className="space-y-3 text-xs divide-y divide-border/60">
            <div className="flex justify-between text-ink-secondary pt-1">
              <span>Item Subtotal</span>
              <span className="font-mono text-ink">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-ink-secondary pt-3">
              <span>Delivery</span>
              <span className="font-mono text-ink">
                {shippingCost === 0 ? 'Complimentary' : formatCurrency(shippingCost)}
              </span>
            </div>

            <div className="flex justify-between text-ink font-medium text-sm pt-4">
              <span>Grand Total</span>
              <span className="font-mono">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <p className="text-[11px] text-ink-tertiary mt-4 mb-6 leading-relaxed">
            Free shipping applied on orders over $150. Tax and customs duties included.
          </p>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-ink text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-xs hover:bg-ink/90 transition-all shadow-xs"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="mt-4 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
