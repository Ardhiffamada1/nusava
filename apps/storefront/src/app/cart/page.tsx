'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../stores/cart-store';
import { formatCurrency } from '@commerceos/ui';
import { useLanguageStore } from '../../stores/language-store';

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, isLoading } = useCartStore();
  const { language } = useLanguageStore();
  const isId = language === 'id';

  const freeShippingThreshold = 250000;
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 25000;
  const grandTotal = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center mx-auto mb-4 bg-[#F5F6F6] text-gray-400">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isId ? 'Wah, keranjang belanjamu masih kosong nih' : 'Your shopping bag is empty'}
        </h1>
        <p className="text-sm text-gray-500 mt-2 mb-8 max-w-md mx-auto">
          {isId
            ? 'Yuk intip aneka oleh-oleh lezat dan kerajinan khas Nusantara langsung dari para pengrajin lokal.'
            : 'Explore our curated collection of authentic Indonesian gifts and handicrafts.'}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-sm font-semibold py-3 px-7 rounded-full transition-all shadow-sm"
        >
          <span>{isId ? 'Mulai Belanja Oleh-oleh' : 'Start Browsing'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
      <div className="border-b border-gray-100 pb-5 mb-8 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#003d29]">
            {isId ? 'Rincian Pesanan' : 'Review Selection'}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mt-1">
            {isId ? 'Keranjang Belanja Kamu' : 'Shopping Cart'}
          </h1>
        </div>
        <span className="text-sm font-semibold text-gray-500">{itemCount} {isId ? 'Barang' : 'Items'}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Line Items Table */}
        <div className="lg:col-span-8 divide-y divide-gray-100 border-y border-gray-100">
          {items.map((item) => (
            <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-6 items-start">
              {/* Product Thumbnail */}
              <div className="relative w-24 h-28 bg-[#F5F6F6] rounded-2xl shrink-0 overflow-hidden border border-gray-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productTitle}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                        className="text-base font-semibold text-gray-900 hover:text-[#003d29] transition-colors"
                      >
                        {item.productTitle}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">{item.variantTitle}</p>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">SKU: {item.sku}</p>
                    </div>

                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>

                  {item.availableStock <= 5 && item.availableStock > 0 && (
                    <p className="text-xs text-amber-700 font-medium mt-2">
                      {isId ? `Stok menipis: Sisa ${item.availableStock} buah lagi!` : `Only ${item.availableStock} left in stock!`}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-200 rounded-full bg-white px-1">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={isLoading || item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black disabled:opacity-30 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 font-semibold text-sm text-gray-900 select-none">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isLoading || item.quantity >= item.availableStock}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-gray-400 hover:text-rose-600 flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isId ? 'Hapus' : 'Remove'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-[#F9FAFA] border border-gray-100 p-6 rounded-2xl sticky top-24">
          <h2 className="text-base font-bold text-gray-900 mb-5">
            {isId ? 'Ringkasan Belanja' : 'Order Summary'}
          </h2>

          <div className="space-y-3.5 text-sm divide-y divide-gray-100">
            <div className="flex justify-between text-gray-600 pt-1">
              <span>{isId ? 'Subtotal Produk' : 'Item Subtotal'}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-gray-600 pt-3.5">
              <span>{isId ? 'Estimasi Ongkir' : 'Shipping'}</span>
              <span className="font-semibold text-gray-900">
                {shippingCost === 0 ? (
                  <span className="text-emerald-700 font-bold">{isId ? 'Gratis Ongkir' : 'Free'}</span>
                ) : (
                  formatCurrency(shippingCost)
                )}
              </span>
            </div>

            <div className="flex justify-between text-gray-900 font-bold text-lg pt-4">
              <span>{isId ? 'Total Tagihan' : 'Grand Total'}</span>
              <span className="text-[#003d29]">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-2.5 text-xs text-gray-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{isId ? 'Bisa bayar di tempat (COD) & transfer bank aman.' : 'COD & Secure Bank Transfer available.'}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full mt-6 flex items-center justify-center gap-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-sm font-semibold py-3.5 px-4 rounded-full transition-all shadow-sm"
          >
            <span>{isId ? 'Lanjut ke Pembayaran' : 'Proceed to Checkout'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="mt-4 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isId ? 'Mau tambah oleh-oleh lain? Lanjut Belanja' : 'Continue Shopping'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
