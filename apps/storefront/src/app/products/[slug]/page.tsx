'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  Check,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  MessageSquare,
  ThumbsUp,
  Star,
  CheckCircle2,
  MapPin,
  Clock,
  PackageCheck,
  Store,
  Share2,
  Copy,
  Thermometer,
} from 'lucide-react';
import { apiRequest } from '../../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../../../stores/cart-store';
import { useAuthStore } from '../../../stores/auth-store';
import {
  getProductOrigin,
  getProductStore,
  calculateShippingOptions,
  createProductWhatsAppUrl,
  getProductShelfLife,
  DESTINATION_CITIES,
  SAMPLE_REVIEWS,
  OFFICIAL_WA_NUMBER,
} from '../../../lib/storefront-helpers';
import { CourierLogo } from '../../../components/courier-logos';
import { StoreProfileModal } from '../../../components/store-profile-modal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiRequest<any>(`/products/${slug}`),
    enabled: !!slug,
  });

  const { data: relatedProductsData } = useQuery({
    queryKey: ['related-products', product?.category?.id, product?.id],
    queryFn: () => {
      const p = new URLSearchParams();
      if (product?.category?.id) p.set('categoryId', product.category.id);
      p.set('limit', '5');
      return apiRequest<{ items: any[] }>(`/products?${p.toString()}`);
    },
    enabled: !!product?.category?.id,
  });

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedCity, setSelectedCity] = useState('jakarta');
  const [activeTab, setActiveTab] = useState<'DESCRIPTION' | 'REVIEWS'>('DESCRIPTION');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | null>(null);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  const previewOrigin = product ? getProductOrigin(product).city : 'yogyakarta';
  const previewPrice = product
    ? Number(
        (product.variants?.find((v: any) => v.id === selectedVariantId) || product.variants?.[0])
          ?.priceOverride || product.basePrice,
      )
    : 0;

  const { data: shippingApiData } = useQuery({
    queryKey: ['rajaongkir-cost', previewOrigin, selectedCity, quantity, previewPrice],
    queryFn: async () => {
      const q = new URLSearchParams({
        origin: previewOrigin.toLowerCase(),
        destination: selectedCity,
        weight: String(quantity * 500),
        subtotal: String(previewPrice * quantity),
      });
      const res = await fetch(`/api/shipping/cost?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch shipping cost');
      return res.json();
    },
    enabled: !!product,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 animate-pulse font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-[#F5F6F6] rounded-2xl" />
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
      <div className="max-w-md mx-auto px-6 py-24 text-center font-sans">
        <h1 className="text-xl font-bold text-gray-900">Produk Tidak Ditemukan</h1>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          Produk oleh-oleh yang kamu cari mungkin sudah tidak tersedia atau telah diarsipkan.
        </p>
        <Link
          href="/products"
          className="inline-flex px-6 py-3 bg-[#003d29] text-white text-xs font-bold rounded-lg"
        >
          Kembali ke Katalog
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
  const origin = getProductOrigin(product);
  const store = getProductStore(product);
  const shelfLife = getProductShelfLife(product);
  const shippingRates =
    shippingApiData?.options ||
    calculateShippingOptions(currentPrice * quantity, selectedCity, origin.city, quantity * 500);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const text = `Lihat ${product.title} di NUSAVA — Satu Indonesia, Banyak Cerita: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleHelpful = (id: string) => {
    setHelpfulMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const filteredReviews = SAMPLE_REVIEWS.filter((r) => {
    if (reviewRatingFilter) return r.rating === reviewRatingFilter;
    return true;
  });

  const relatedItems =
    relatedProductsData?.items?.filter((it: any) => it.id !== product?.id).slice(0, 4) || [];

  const handleAddToCart = async () => {
    if (!activeVariant || isOutOfStock) return;
    try {
      setIsAdding(true);
      await addItem(activeVariant.id, quantity);
      router.push('/cart');
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan produk ke keranjang');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!activeVariant || isOutOfStock) return;
    try {
      setIsAdding(true);
      await addItem(activeVariant.id, quantity);
      if (!user) {
        router.push('/register?redirect=/checkout');
      } else {
        router.push('/checkout');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal melanjutkan ke pembayaran');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-8 pb-28 lg:pb-12 font-sans overflow-x-hidden">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 mb-4 sm:mb-8 select-none overflow-x-auto scrollbar-none whitespace-nowrap pb-1">
        <Link href="/" className="hover:text-[#003d29] transition-colors shrink-0">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <Link href="/products" className="hover:text-[#003d29] transition-colors shrink-0">
          Katalog
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <Link
          href={`/products?category=${product.category?.slug}`}
          className="hover:text-[#003d29] transition-colors shrink-0"
        >
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Layout (Matching Shopcart reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 items-start">
        {/* Left: Product Images with Preview Swatches */}
        <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
          {/* Main Large Visual Display */}
          <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-2xl overflow-hidden flex items-center justify-center p-3 sm:p-8 lg:p-12 border border-stone-200">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-2xs flex items-center justify-center transition-colors z-10 border border-stone-200/80 ${
                isWishlisted ? 'text-[#003d29] fill-[#003d29]' : 'text-gray-400 hover:text-[#003d29]'
              }`}
              title="Simpan ke favorit"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            <Image
              src={images[selectedImageIndex]?.url}
              alt={images[selectedImageIndex]?.altText || product.title}
              fill
              className="object-contain p-2 sm:p-6 lg:p-8"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />
          </div>

          {/* Thumbnail Swatches below */}
          {images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F6F6] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-[#003d29] shadow-xs'
                      : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || product.title}
                    fill
                    loading="lazy"
                    decoding="async"
                    className="object-contain p-1.5 sm:p-2"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Profil Toko / Penjual UMKM Resmi (Di Bawah Gambar Produk) */}
          <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between text-xs pb-2.5 border-b border-stone-200">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <Store className="w-4 h-4 text-[#003d29]" />
                <span>Toko Penjual Resmi</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{store.type}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-stone-200">
                  <Image
                    src={store.avatar}
                    alt={store.name}
                    fill
                    loading="lazy"
                    decoding="async"
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-stone-900 truncate">{store.name}</h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#003d29] shrink-0" />
                    <span>{store.city}, {store.province}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-stone-600">
                    <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{store.rating}</span>
                    </span>
                    <span className="text-stone-300">•</span>
                    <span>{store.productCount}+ Produk</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-emerald-700 font-medium">Balas {store.chatResponseTime}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStoreModalOpen(true)}
                  className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-bold rounded-xl text-center transition-colors truncate"
                >
                  Lihat Toko
                </button>
                <a
                  href={`https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(`Halo ${store.name}! Saya tertarik dengan produk ${product.title}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors truncate"
                  title="Chat Penjual via WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Chat Toko</span>
                </a>
              </div>
            </div>
          </div>

          {/* Trust Assurances Card (Di Bawah Toko Penjual) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-stone-200 rounded-2xl p-4 bg-white text-xs">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#003d29] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">Gratis Pengiriman</span>
                <span className="text-[11px] text-stone-500 block mt-0.5 leading-relaxed">
                  Bebas ongkir untuk pembelanjaan di atas Rp 150.000 ke seluruh Indonesia.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-stone-200 sm:pl-4">
              <RotateCcw className="w-5 h-5 text-[#003d29] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">Garansi Paket Rusak</span>
                <span className="text-[11px] text-stone-500 block mt-0.5 leading-relaxed">
                  Penggantian 100% jika produk oleh-oleh atau gerabah rusak selama di perjalanan kurir.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Buy Box & Options */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Origin Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-[#003d29] bg-[#003d29]/8 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#003d29]" />
                <span>{origin.badge}</span>
                <span className="text-gray-400 font-normal">•</span>
                <span className="font-semibold text-gray-600">{origin.province}</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-500">
                {product.category?.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {product.title}
            </h1>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{product.description}</p>

            {/* Star Rating (Shopcart dark green stars) */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex text-[#003d29] text-xs">{'★'.repeat(5)}</div>
              <button
                onClick={() => setActiveTab('REVIEWS')}
                className="text-xs text-[#003d29] hover:underline font-semibold"
              >
                (121 ulasan pembeli terverifikasi)
              </button>
            </div>

            {/* Price Headline */}
            <div className="flex items-baseline gap-3 mt-4 pt-4 border-t border-gray-100">
              <span className="text-3xl font-extrabold text-gray-900">
                {formatCurrency(currentPrice)}
              </span>
              <span className="text-xs text-[#003d29] font-semibold bg-[#F5F6F6] px-2.5 py-1 rounded-full">
                Harga Asli UMKM
              </span>
            </div>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-900">Pilihan Varian / Rasa:</span>
                <span className="text-gray-600 font-medium">{activeVariant?.title}</span>
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
                      className={`text-xs px-4 py-2.5 rounded-xl border transition-all font-semibold flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#003d29] bg-[#003d29] text-white shadow-xs'
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

          {/* Ketahanan & Petunjuk Suhu Simpan (Feature 2) */}
          <div className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <Clock className="w-4 h-4 text-[#003d29]" />
                <span>Ketahanan & Petunjuk Suhu Simpan</span>
              </div>
              {shelfLife.isPerishable && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Produk Segar / Basah
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200">
              <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                <span className="text-[10px] text-gray-500 block mb-0.5">Suhu Ruang</span>
                <span className="font-bold text-gray-900 block">{shelfLife.roomTemp}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                <span className="text-[10px] text-gray-500 block mb-0.5">Lemari Pendingin (Kulkas)</span>
                <span className="font-bold text-gray-900 block">{shelfLife.chilled}</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-600 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-stone-200">
              {shelfLife.isPerishable ? (
                <div>
                  <strong className="text-gray-900 font-semibold block mb-0.5">Rekomendasi Ekspedisi:</strong>
                  <span>{shelfLife.recommendedCourier}. {shelfLife.storageTips}</span>
                </div>
              ) : (
                <span>{shelfLife.storageTips}</span>
              )}
            </div>
          </div>

          {/* Quantity Stepper & Buy Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center border border-gray-200 bg-[#F5F6F6] rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-black shadow-2xs flex items-center justify-center font-bold disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-gray-900 select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(stockOnHand, quantity + 1))}
                  disabled={quantity >= stockOnHand || isOutOfStock}
                  className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-black shadow-2xs flex items-center justify-center font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Stock Notice */}
              <span className="text-xs text-gray-500 font-medium">
                Sisa <strong className="text-gray-900 font-bold">{stockOnHand} unit</strong> di gudang
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || isAdding}
                className="flex-1 py-3 px-6 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors text-center disabled:opacity-40"
              >
                Beli Sekarang
              </button>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex-1 py-3 px-6 bg-white hover:bg-[#F5F6F6] text-gray-900 border border-stone-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors text-center flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4 text-gray-600" />
                <span>Tambah ke Keranjang</span>
              </button>
            </div>

            {/* Quick WhatsApp Order Button (Feature 2) */}
            <a
              href={createProductWhatsAppUrl({
                productTitle: product.title,
                variantTitle: activeVariant?.title,
                quantity,
                unitPrice: currentPrice,
                slug: product.slug,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors text-center flex items-center justify-center gap-2 shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Pesan Cepat via WhatsApp</span>
            </a>

            {/* Bagikan Produk (Feature 5) */}
            <div className="pt-2.5 border-t border-stone-200">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>Bagikan Produk:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FAF9F5] hover:bg-stone-100 border border-stone-200 text-gray-800 flex items-center gap-1.5 transition-colors"
                    title="Bagikan ke kerabat via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#003d29]" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FAF9F5] hover:bg-stone-100 border border-stone-200 text-gray-800 flex items-center gap-1.5 transition-colors"
                    title="Salin tautan produk ini"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#003d29]" />
                        <span className="text-[#003d29]">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time RajaOngkir Shipping Estimator Widget */}
          <div className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#003d29]" />
                <span className="text-xs font-bold text-gray-900">
                  Cek Ongkir (JNE, J&T, SiCepat, Pos)
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#003d29] bg-[#003d29]/10 px-2 py-0.5 rounded-full">
                RajaOngkir API
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 bg-white px-3 py-1.5 rounded-lg border border-stone-200/80">
              <span>
                Dikirim dari: <strong className="text-stone-800">{origin.city}</strong>
              </span>
              <span>
                Berat Paket: <strong className="text-stone-800">{Math.max(1, Math.ceil((quantity * 500) / 1000))} kg</strong>
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                Kota Tujuan Pengiriman:
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-stone-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-[#003d29] cursor-pointer"
              >
                {DESTINATION_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Courier Service Rates */}
            <div className="space-y-1.5 pt-1">
              {shippingRates.map((rate: any) => {
                const isRecommendedForPerishable =
                  shelfLife.isPerishable &&
                  (rate.service.includes('YES') ||
                    rate.service.includes('BEST') ||
                    rate.etd.includes('1 Hari'));

                return (
                  <div
                    key={rate.id}
                    className={`flex items-start sm:items-center justify-between gap-2 p-2.5 rounded-lg text-xs transition-colors ${
                      isRecommendedForPerishable
                        ? 'bg-emerald-50/70 border border-emerald-300'
                        : 'bg-white border border-stone-200'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                      <CourierLogo courierId={rate.courierCode} className="h-6 w-auto shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-gray-900">{rate.courier}</span>
                          <span className="text-[11px] text-gray-500">{rate.service}</span>
                          {isRecommendedForPerishable ? (
                            <span className="text-[9px] font-bold bg-[#003d29] text-white px-1.5 py-0.5 rounded">
                              Disarankan Produk Basah
                            </span>
                          ) : rate.badge ? (
                            <span className="text-[9px] font-bold bg-[#003d29] text-white px-1.5 py-0.2 rounded">
                              {rate.badge}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Estimasi tiba: {rate.etd}
                        </span>
                      </div>
                    </div>

                    <span className="font-bold text-gray-900 shrink-0 text-right">
                      {rate.cost === 0 ? (
                        <span className="text-[#003d29] font-bold">Gratis Ongkir</span>
                      ) : (
                        formatCurrency(rate.cost)
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* TABS SECTION: Deskripsi & Ulasan Pembeli (Feature 6) */}
      <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-stone-200 space-y-6 sm:space-y-8">
        {/* Tab Headers */}
        <div className="flex items-center gap-4 sm:gap-8 border-b border-stone-200 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none whitespace-nowrap pb-0.5">
          <button
            onClick={() => setActiveTab('DESCRIPTION')}
            className={`pb-4 border-b-2 transition-all ${
              activeTab === 'DESCRIPTION'
                ? 'border-[#003d29] text-[#003d29]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Deskripsi & Komposisi
          </button>
          <button
            onClick={() => setActiveTab('REVIEWS')}
            className={`pb-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'REVIEWS'
                ? 'border-[#003d29] text-[#003d29]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>Ulasan & Testimoni Pelanggan</span>
            <span className="bg-[#003d29]/10 text-[#003d29] text-xs px-2.5 py-0.5 rounded-full font-bold">
              121
            </span>
          </button>
        </div>

        {/* Tab Content 1: Description & Details */}
        {activeTab === 'DESCRIPTION' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-gray-600">
            <div className="md:col-span-2 space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Tentang Produk</h3>
                <p className="leading-relaxed text-gray-700 text-sm">
                  {product.description ||
                    'Produk oleh-oleh otentik yang diproduksi langsung oleh sentra UMKM dan dapur kuliner daerah dengan bahan baku pilihan terbaik.'}
                </p>
              </div>

              <div className="bg-[#FAF9F5] p-5 rounded-xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Petunjuk Penyimpanan & Konsumsi
                </h4>
                <ul className="space-y-2 list-disc list-inside text-gray-600">
                  <li>Simpan di suhu ruangan sejuk dan terhindar dari sinar matahari langsung.</li>
                  <li>Untuk oleh-oleh basah, disarankan dikonsumsi dalam 4-7 hari sejak paket diterima.</li>
                  <li>Dapat disimpan di lemari pendingin untuk masa ketahanan hingga 14 hari.</li>
                  <li>Kemasan luar dilapisi bubble wrap tebal dan kardus pengaman standar kiriman ekspedisi.</li>
                </ul>
              </div>
            </div>

            {/* Spec Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3.5 shadow-2xs h-fit">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-stone-200 pb-2">
                Spesifikasi Oleh-oleh
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-gray-500">Kota Asal</span>
                  <span className="font-bold text-gray-900">{origin.city}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-gray-500">Provinsi</span>
                  <span className="font-bold text-gray-900">{origin.province}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-gray-500">Kategori</span>
                  <span className="font-bold text-gray-900">{product.category?.name || 'Kuliner Khas'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-gray-500">Sertifikasi Halal</span>
                  <span className="font-bold text-emerald-700">Tersertifikasi ID-MUI</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Kondisi Pengiriman</span>
                  <span className="font-bold text-gray-900">Kemasan Vakum / Dus Aman</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Customer Reviews & Testimonials */}
        {activeTab === 'REVIEWS' && (
          <div className="space-y-8">
            {/* Top Rating Summary Bar */}
            <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Overall Score */}
              <div className="text-center md:text-left shrink-0">
                <div className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                  4.9 <span className="text-base sm:text-xl font-normal text-gray-400">/ 5.0</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1 text-[#003d29] text-base my-1.5">
                  {'★'.repeat(5)}
                </div>
                <p className="text-xs font-semibold text-gray-500">
                  Berdasarkan 121 ulasan pembeli terverifikasi
                </p>
              </div>

              {/* Star Distribution Bars */}
              <div className="w-full max-w-sm space-y-1.5 text-xs">
                {[
                  { stars: 5, pct: 92, count: 111 },
                  { stars: 4, pct: 6, count: 8 },
                  { stars: 3, pct: 2, count: 2 },
                  { stars: 2, pct: 0, count: 0 },
                  { stars: 1, pct: 0, count: 0 },
                ].map((row) => (
                  <div key={row.stars} className="flex items-center gap-3">
                    <span className="w-12 text-gray-600 font-semibold">{row.stars} Bintang</span>
                    <div className="flex-1 bg-gray-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#003d29] h-full rounded-full"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-gray-400 font-medium">{row.count}</span>
                  </div>
                ))}
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                <button
                  onClick={() => setReviewRatingFilter(null)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    reviewRatingFilter === null
                      ? 'bg-[#003d29] text-white border-[#003d29]'
                      : 'bg-white text-gray-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  Semua Ulasan (121)
                </button>
                <button
                  onClick={() => setReviewRatingFilter(5)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    reviewRatingFilter === 5
                      ? 'bg-[#003d29] text-white border-[#003d29]'
                      : 'bg-white text-gray-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  Hanya Bintang 5 (111)
                </button>
                <button
                  onClick={() => setReviewRatingFilter(4)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    reviewRatingFilter === 4
                      ? 'bg-[#003d29] text-white border-[#003d29]'
                      : 'bg-white text-gray-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  Bintang 4 (8)
                </button>
              </div>
            </div>

            {/* Reviews Cards List */}
            <div className="space-y-4">
              {filteredReviews.map((rev) => {
                const helpfulCount = (helpfulMap[rev.id] || 0) + rev.helpfulCount;
                return (
                  <div
                    key={rev.id}
                    className="p-6 bg-white border border-stone-200 rounded-xl shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${rev.avatarBg} text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs`}
                        >
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs">{rev.author}</span>
                            <span className="text-[10px] text-gray-400">({rev.city})</span>
                            {rev.verified && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Pembeli Terverifikasi</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 mt-0.5 block">{rev.date}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex text-[#003d29] text-xs">
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>

                    {/* Variant badge */}
                    <div className="text-[11px] text-gray-500 font-medium">
                      Variasi yang dibeli:{' '}
                      <span className="font-semibold text-gray-700 bg-stone-100 px-2 py-0.5 rounded">
                        {rev.variant}
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-gray-700 leading-relaxed pt-1">{rev.content}</p>

                    {/* Helpful Button */}
                    <div className="pt-2 flex items-center gap-4 text-xs text-gray-500">
                      <button
                        onClick={() => toggleHelpful(rev.id)}
                        className="flex items-center gap-1.5 hover:text-[#003d29] transition-colors font-medium"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Membantu ({helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RELATED PRODUCTS (Cross-Selling) */}
      {relatedItems.length > 0 && (
        <section className="mt-16 pt-10 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#003d29] uppercase tracking-wider block">
                REKOMENDASI OLEH-OLEH
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                Pilihan Serupa Khas {origin.city}
              </h3>
            </div>
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="text-xs font-bold text-[#003d29] hover:underline"
            >
              Lihat Kategori Ini →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedItems.map((item: any) => {
              const relImg =
                item.images?.[0]?.url ||
                'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg';
              const relOrigin = getProductOrigin(item);
              const relStore = getProductStore(item);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs group flex flex-col justify-between hover:border-stone-300 transition-colors"
                >
                  <div>
                    <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-lg overflow-hidden mb-2.5 border border-stone-100 p-2 flex items-center justify-center">
                      <Link href={`/products/${item.slug}`} className="relative w-full h-full block">
                        <Image
                          src={relImg}
                          alt={item.title}
                          fill
                          loading="lazy"
                          decoding="async"
                          className="object-contain"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </Link>
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-bold text-[#003d29] bg-[#003d29]/8 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <MapPin className="w-2 h-2 text-[#003d29]" />
                        <span>{relOrigin.badge}</span>
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium truncate max-w-[90px] flex items-center gap-0.5">
                        <Store className="w-2.5 h-2.5 text-stone-400" />
                        <span>{relStore.name.replace('Resmi', '').trim()}</span>
                      </span>
                    </div>

                    <Link
                      href={`/products/${item.slug}`}
                      className="text-xs font-bold text-gray-900 hover:text-[#003d29] transition-colors line-clamp-1 block"
                    >
                      {item.title}
                    </Link>

                    <span className="text-xs font-extrabold text-gray-900 mt-1 block">
                      {formatCurrency(Number(item.basePrice))}
                    </span>
                  </div>

                  <Link
                    href={`/products/${item.slug}`}
                    className="mt-3 w-full py-2 bg-white hover:bg-[#003d29] text-[#003d29] hover:text-white border border-stone-200 hover:border-[#003d29] rounded-lg text-[11px] font-bold text-center block transition-colors"
                  >
                    Lihat Produk
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Interactive Store Profile Modal */}
      <StoreProfileModal
        store={store}
        isOpen={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
      />

      {/* Mobile Sticky Bottom Action Bar (Tokopedia / Shopee style) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2.5 z-40 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          {/* Chat WhatsApp Icon Button */}
          <a
            href={createProductWhatsAppUrl({
              productTitle: product.title,
              variantTitle: activeVariant?.title,
              quantity,
              unitPrice: currentPrice,
              slug: product.slug,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center justify-center shrink-0 hover:bg-emerald-100 transition-colors"
            title="Chat Penjual via WhatsApp"
            aria-label="Chat Penjual"
          >
            <MessageSquare className="w-4 h-4 text-emerald-700" />
          </a>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className="w-10 h-10 rounded-lg bg-[#FAF9F5] text-stone-800 border border-stone-300 flex items-center justify-center shrink-0 hover:bg-stone-100 transition-colors disabled:opacity-40 cursor-pointer"
            title="Tambah ke Keranjang"
            aria-label="Tambah ke Keranjang"
          >
            <ShoppingCart className="w-4 h-4 text-[#003d29]" />
          </button>

          {/* Buy Now Full Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || isAdding}
            className="flex-1 h-10 px-3 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
          >
            <span>Beli Sekarang</span>
            <span className="font-mono text-[11px] font-semibold text-white/90">
              • {formatCurrency(currentPrice * quantity)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
