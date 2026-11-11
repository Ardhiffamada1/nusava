'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck, MessageSquare, Tag, X, Check, Gift } from 'lucide-react';
import { useCartStore, GIFT_WRAP_COST } from '../../stores/cart-store';
import { formatCurrency } from '@commerceos/ui';
import { useLanguageStore } from '../../stores/language-store';
import { createCartWhatsAppUrl } from '../../lib/storefront-helpers';
import { AVAILABLE_COUPONS, validateAndApplyCoupon, Coupon } from '../../lib/coupon-helpers';

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, isLoading, giftDetails, setGiftDetails } = useCartStore();
  const { language } = useLanguageStore();
  const isId = language === 'id';

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  const freeShippingThreshold = 150000;
  const rawShippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 20000;
  const shippingCost = appliedCoupon?.discountType === 'SHIPPING' ? 0 : rawShippingCost;
  const giftCost = giftDetails.isGiftWrap ? GIFT_WRAP_COST : 0;
  const grandTotal = Math.max(0, subtotal + shippingCost + giftCost - couponDiscount);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;

    setCouponError(null);
    const result = validateAndApplyCoupon({
      code,
      subtotal,
      shippingCost: rawShippingCost,
    });

    if (result.success && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
      setCouponInput('');
    } else {
      setCouponError(result.error || 'Kupon tidak dapat digunakan.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

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
        <div className="lg:col-span-4 bg-[#FAF9F5] border border-stone-200 p-6 rounded-xl sticky top-24">
          <h2 className="text-base font-bold text-stone-900 mb-4">
            {isId ? 'Ringkasan Belanja' : 'Order Summary'}
          </h2>

          {/* Gift Wrap / Hampers Section */}
          <div className="mb-4 p-3.5 bg-white border border-stone-200 rounded-lg">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={giftDetails.isGiftWrap}
                onChange={(e) => setGiftDetails({ isGiftWrap: e.target.checked })}
                className="mt-0.5 rounded text-[#003d29] focus:ring-[#003d29] w-4 h-4"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#003d29]" />
                    <span>{isId ? 'Kemas Sebagai Hampers / Kado' : 'Gift Packaging & Card'}</span>
                  </span>
                  <span className="text-xs font-semibold text-[#003d29]">+{formatCurrency(GIFT_WRAP_COST)}</span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isId
                    ? 'Kemasan rapi dengan pita serta kartu ucapan kustom untuk penerima.'
                    : 'Authentic gift packaging with ribbon and customized greeting card.'}
                </p>
              </div>
            </label>

            {giftDetails.isGiftWrap && (
              <div className="mt-3 pt-3 border-t border-stone-100 space-y-2.5">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">
                    {isId ? 'Pilihan Jenis Wadah Kemasan:' : 'Packaging Style:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGiftDetails({ packagingType: 'besek' })}
                      className={`py-2 px-2.5 rounded-md text-left border transition-colors text-xs ${
                        giftDetails.packagingType === 'besek'
                          ? 'border-[#003d29] bg-stone-50 font-bold text-[#003d29]'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      <span className="block text-xs font-bold">Besek Tradisional</span>
                      <span className="text-xs text-stone-400 font-normal">Anyaman Bambu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGiftDetails({ packagingType: 'hardbox' })}
                      className={`py-2 px-2.5 rounded-md text-left border transition-colors text-xs ${
                        giftDetails.packagingType === 'hardbox'
                          ? 'border-[#003d29] bg-stone-50 font-bold text-[#003d29]'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      <span className="block text-xs font-bold">Hardbox Eksklusif</span>
                      <span className="text-xs text-stone-400 font-normal">Warna Hijau & Emas</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">
                    {isId ? 'Tuliskan Pesan Kartu Ucapan:' : 'Gift Card Message:'}
                  </label>
                  <textarea
                    rows={2}
                    value={giftDetails.message}
                    onChange={(e) => setGiftDetails({ message: e.target.value })}
                    placeholder={
                      isId
                        ? 'Contoh: Selamat menikmati oleh-oleh khas Nusantara dari Jogja!'
                        : 'Your warm greeting message...'
                    }
                    className="w-full text-xs p-2.5 rounded-md border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#003d29] resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Coupon Code Section */}
          <div className="mb-5 p-3.5 bg-white border border-stone-200 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#003d29] mb-2.5">
              <Tag className="w-3.5 h-3.5" />
              <span>{isId ? 'Kupon & Voucher Belanja' : 'Discount Voucher'}</span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</span>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 tracking-wider font-mono">
                      {appliedCoupon.code}
                    </span>
                    <p className="text-xs text-emerald-700">
                      {appliedCoupon.description} (-{formatCurrency(couponDiscount)})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-emerald-700 hover:text-rose-600 p-1"
                  title="Hapus kupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    placeholder={isId ? 'Masukkan kode kupon' : 'Enter voucher code'}
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono font-bold tracking-wider rounded-md border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#003d29] focus:border-[#003d29] bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-3.5 py-2 text-xs font-semibold bg-[#003d29] hover:bg-[#002b1c] text-white rounded-md transition-colors shrink-0"
                  >
                    {isId ? 'Pakai' : 'Apply'}
                  </button>
                </div>

                {couponError && (
                  <p className="text-xs text-rose-600 font-medium">{couponError}</p>
                )}

                {/* Quick Chips */}
                <div className="pt-1">
                  <p className="text-xs text-stone-400 mb-1.5 font-medium">{isId ? 'Kupon tersedia:' : 'Available vouchers:'}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_COUPONS.map((cp) => (
                      <button
                        key={cp.code}
                        type="button"
                        onClick={() => handleApplyCoupon(cp.code)}
                        className="text-xs font-mono font-bold px-2 py-1 bg-stone-100 hover:bg-[#FCF0E4] hover:text-[#003d29] text-stone-700 rounded-md transition-colors border border-stone-200"
                        title={cp.description}
                      >
                        {cp.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3.5 text-sm divide-y divide-stone-200">
            <div className="flex justify-between text-stone-600 pt-1">
              <span>{isId ? 'Subtotal Produk' : 'Item Subtotal'}</span>
              <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-stone-600 pt-3.5">
              <span>{isId ? 'Estimasi Ongkir' : 'Shipping'}</span>
              <span className="font-semibold text-stone-900">
                {shippingCost === 0 ? (
                  <span className="text-[#003d29] font-bold">{isId ? 'Gratis Ongkir' : 'Free'}</span>
                ) : (
                  formatCurrency(shippingCost)
                )}
              </span>
            </div>

            {giftCost > 0 && (
              <div className="flex justify-between text-[#003d29] pt-3.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#003d29]" />
                  <span>{isId ? 'Kemasan Hampers & Kartu' : 'Gift Wrapping & Card'}</span>
                </span>
                <span>+{formatCurrency(giftCost)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 pt-3.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{isId ? 'Diskon Kupon' : 'Voucher Discount'} ({appliedCoupon?.code})</span>
                </span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-900 font-bold text-lg pt-4">
              <span>{isId ? 'Total Tagihan' : 'Grand Total'}</span>
              <span className="text-[#003d29]">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white border border-stone-200 rounded-lg flex items-center gap-2.5 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-[#003d29] shrink-0" />
            <span>{isId ? 'Bisa bayar di tempat (COD) & transfer bank aman.' : 'COD & Secure Bank Transfer available.'}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full mt-5 flex items-center justify-center gap-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-semibold py-3 px-4 rounded-lg transition-colors shadow-xs"
          >
            <span>{isId ? 'Lanjut ke Pembayaran' : 'Proceed to Checkout'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={createCartWhatsAppUrl({
              items: items.map((it) => ({
                productTitle: it.productTitle,
                variantTitle: it.variantTitle,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
              })),
              grandTotal,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-2.5 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold py-2.5 px-4 rounded-lg transition-colors shadow-2xs"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{isId ? 'Checkout Cepat via WhatsApp' : 'Order via WhatsApp'}</span>
          </a>

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
