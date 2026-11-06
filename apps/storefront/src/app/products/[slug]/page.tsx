'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Check,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { apiRequest } from '../../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../../../stores/cart-store';
import { useLanguageStore, translations } from '../../../stores/language-store';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { language } = useLanguageStore();
  const t = translations[language];

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiRequest<any>(`/products/${slug}`),
    enabled: !!slug,
  });

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');

  const { addItem, openCart } = useCartStore();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-[#F7F7F6] rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 w-1/4 rounded" />
            <div className="h-8 bg-gray-100 w-3/4 rounded" />
            <div className="h-4 bg-gray-100 w-1/3 rounded" />
            <div className="h-24 bg-gray-100 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-xl font-light text-gray-900">
          {language === 'id' ? 'Karya tidak ditemukan' : 'Object not found'}
        </h1>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          {language === 'id'
            ? 'Produk mungkin telah diarsipkan atau habis terjual.'
            : 'The requested object may have been archived or is temporarily unavailable.'}
        </p>
        <Link
          href="/products"
          className="text-xs font-semibold uppercase tracking-wider text-black border-b border-black pb-1 hover:opacity-70 transition-opacity"
        >
          {language === 'id' ? 'Kembali ke Katalog' : 'Return to Collection'}
        </Link>
      </div>
    );
  }

  const activeVariant =
    product.variants?.find((v: any) => v.id === selectedVariantId) ||
    product.variants?.[0];

  const currentPrice = activeVariant?.priceOverride
    ? Number(activeVariant.priceOverride)
    : Number(product.basePrice);

  const stockOnHand = activeVariant?.inventory?.quantityOnHand ?? 15;
  const isOutOfStock = stockOnHand <= 0;

  const handleAddToCart = async () => {
    if (!activeVariant || isOutOfStock) return;
    try {
      setIsAdding(true);
      await addItem(activeVariant.id, quantity);
      openCart();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan ke keranjang');
    } finally {
      setIsAdding(false);
    }
  };

  const images =
    product.images?.length > 0
      ? product.images
      : [
          {
            url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
            altText: product.title,
          },
        ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[11px] text-gray-400 uppercase tracking-widest mb-10 select-none">
        <Link href="/" className="hover:text-black transition-colors">
          {language === 'id' ? 'Beranda' : 'Home'}
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <Link href="/products" className="hover:text-black transition-colors">
          {language === 'id' ? 'Katalog' : 'Collection'}
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <Link
          href={`/products?category=${product.category?.slug}`}
          className="hover:text-black transition-colors"
        >
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Studio Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible shrink-0">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-16 bg-[#F7F7F6] rounded-xl overflow-hidden border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-gray-900 shadow-2xs'
                      : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || product.title}
                    fill
                    className="object-contain p-2"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Visual Display (Square MINDI Studio Canvas) */}
          <div className="relative aspect-square flex-1 bg-[#F7F7F6] rounded-2xl overflow-hidden flex items-center justify-center">
            <Image
              src={images[selectedImageIndex]?.url}
              alt={images[selectedImageIndex]?.altText || product.title}
              fill
              className="object-contain p-12"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />
          </div>
        </div>

        {/* Right: Purchase Control Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400 block mb-1">
                {product.category?.name || 'KRIYA TRADISI'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-gray-900">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-4 mt-3">
                <span className="text-xl font-bold font-mono text-gray-900">
                  {formatCurrency(currentPrice)}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  SKU: {activeVariant?.sku}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-900">
                    {language === 'id' ? 'Pilihan Varian / Ukuran:' : 'Option:'}
                  </span>
                  <span className="text-gray-500">{activeVariant?.title}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => {
                    const isSelected = (selectedVariantId || product.variants[0].id) === v.id;
                    const vStock = v.inventory?.quantityOnHand ?? 10;
                    const isVOutOfStock = vStock <= 0;

                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setQuantity(1);
                        }}
                        disabled={isVOutOfStock}
                        className={`text-xs px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white font-medium shadow-2xs'
                            : isVOutOfStock
                            ? 'border-gray-200 bg-gray-50 text-gray-300 line-through cursor-not-allowed'
                            : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                        }`}
                      >
                        <span>{v.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Real-time Inventory Status Indicator */}
            <div className="flex items-center gap-2 text-xs py-2 border-y border-[#F0F0EE]">
              {isOutOfStock ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-rose-600 font-medium">
                    {language === 'id'
                      ? 'Stok habis di pengrajin'
                      : 'Out of stock at artisan workshop'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-gray-600">
                    {language === 'id' ? 'Siap kirim dari pengrajin' : 'Ready to dispatch'} •{' '}
                    <strong className="text-gray-900 font-mono font-semibold">{stockOnHand}</strong>{' '}
                    {language === 'id' ? 'unit tersedia' : 'units available'}
                  </span>
                </>
              )}
            </div>

            {/* Quantity and Add to Cart Action */}
            <div className="flex items-stretch gap-3 pt-2">
              <div className="flex items-center border border-gray-200 bg-white rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3.5 py-3 text-gray-600 hover:text-black disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-3 font-mono text-xs font-semibold text-gray-900 select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(stockOnHand, quantity + 1))}
                  disabled={quantity >= stockOnHand || isOutOfStock}
                  className="px-3.5 py-3 text-gray-600 hover:text-black disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex-1 bg-[#18181B] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs disabled:opacity-40"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>
                  {isAdding
                    ? language === 'id'
                      ? 'Menambahkan...'
                      : 'Adding...'
                    : language === 'id'
                    ? 'Tambah ke Keranjang'
                    : 'Add to Bag'}
                </span>
              </button>
            </div>
          </div>

          {/* Understated Details Tabs */}
          <div className="pt-8 mt-8 border-t border-[#F0F0EE]">
            <div className="flex gap-6 border-b border-[#F0F0EE] pb-2 text-xs">
              <button
                onClick={() => setActiveTab('details')}
                className={`font-semibold transition-colors pb-1 ${
                  activeTab === 'details'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                {language === 'id' ? 'Spesifikasi & Bahan' : 'Specifications'}
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`font-semibold transition-colors pb-1 ${
                  activeTab === 'care'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                {language === 'id' ? 'Perawatan Tradisi' : 'Care & Maintenance'}
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`font-semibold transition-colors pb-1 ${
                  activeTab === 'shipping'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                {language === 'id' ? 'Kemasan Ekspedisi' : 'Transit Protection'}
              </button>
            </div>

            <div className="py-4 text-xs text-gray-500 leading-relaxed font-normal">
              {activeTab === 'details' && (
                <p>
                  {language === 'id'
                    ? 'Dibuat secara handmade oleh pengrajin lokal berpengalaman. Menggunakan bahan mentah berkualitas tinggi tanpa campuran bahan sintesis yang merusak keaslian karakter produk.'
                    : 'Handcrafted by skilled regional artisans. Made with sustainable natural raw materials free from harmful synthetic additives.'}
                </p>
              )}
              {activeTab === 'care' && (
                <p>
                  {language === 'id'
                    ? 'Bersihkan dengan kain lembap lembut atau air hangat. Hindari perendaman berlebih untuk kriya kayu, dan simpan di tempat kering dengan sirkulasi udara baik.'
                    : 'Gently wipe with a soft damp cloth. Avoid prolonged soaking for wooden objects and store in a dry, well-ventilated area.'}
                </p>
              )}
              {activeTab === 'shipping' && (
                <p>
                  {language === 'id'
                    ? 'Setiap barang dibungkus dengan proteksi ganda: bubble wrap tebal tahan benturan, bantalan kertas daur ulang, dan kardus kuat berlapis untuk menjamin keamanan perjalanan.'
                    : 'Packaged with reinforced multi-layer cushioning, recyclable paper infill, and impact-resistant outer boxing to ensure safe arrival.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
