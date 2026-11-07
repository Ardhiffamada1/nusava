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
} from 'lucide-react';
import { apiRequest } from '../../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../../../stores/cart-store';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiRequest<any>(`/products/${slug}`),
    enabled: !!slug,
  });

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addItem, openCart } = useCartStore();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 animate-pulse font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-[#F5F6F6] rounded-3xl" />
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
          className="inline-flex px-6 py-3 bg-[#003d29] text-white text-xs font-bold rounded-full"
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

  const handleAddToCart = async () => {
    if (!activeVariant || isOutOfStock) return;
    try {
      setIsAdding(true);
      await addItem(activeVariant.id, quantity);
      openCart();
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
      router.push('/checkout');
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
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 font-sans">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8 select-none">
        <Link href="/" className="hover:text-[#003d29] transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/products" className="hover:text-[#003d29] transition-colors">
          Katalog
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link
          href={`/products?category=${product.category?.slug}`}
          className="hover:text-[#003d29] transition-colors"
        >
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Layout (Matching Shopcart reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Product Images with Preview Swatches */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Visual Display */}
          <div className="relative aspect-square w-full bg-[#F5F6F6] rounded-3xl overflow-hidden flex items-center justify-center p-12">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`absolute top-6 right-6 w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center transition-colors z-10 ${
                isWishlisted ? 'text-[#003d29] fill-[#003d29]' : 'text-gray-400 hover:text-[#003d29]'
              }`}
              title="Simpan ke favorit"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            <Image
              src={images[selectedImageIndex]?.url}
              alt={images[selectedImageIndex]?.altText || product.title}
              fill
              className="object-contain p-8"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />
          </div>

          {/* Thumbnail Swatches below */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 bg-[#F5F6F6] rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-[#003d29] shadow-xs'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || product.title}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Buy Box & Options */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {product.title}
            </h1>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{product.description}</p>

            {/* Star Rating (Shopcart dark green stars) */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex text-[#003d29] text-xs">{'★'.repeat(5)}</div>
              <span className="text-xs text-gray-500 font-semibold">(121 ulasan pembeli)</span>
            </div>

            {/* Price Headline */}
            <div className="flex items-baseline gap-3 mt-4 pt-4 border-t border-gray-100">
              <span className="text-3xl font-extrabold text-gray-900">
                {formatCurrency(currentPrice)}
              </span>
              <span className="text-xs text-[#003d29] font-semibold bg-[#F5F6F6] px-2.5 py-1 rounded-full">
                Harga Pas Pengrajin
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

          {/* Quantity Stepper & Buy Action Buttons */}
          <div className="space-y-4 pt-2">
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

            {/* Action Buttons (Style from image) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || isAdding}
                className="flex-1 py-3.5 px-6 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all text-center hover:scale-102 disabled:opacity-40"
              >
                Beli Sekarang
              </button>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex-1 py-3.5 px-6 bg-white hover:bg-[#F5F6F6] text-gray-900 border border-gray-300 text-xs font-bold uppercase tracking-wider rounded-full transition-all text-center flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4 text-gray-600" />
                <span>Tambah ke Keranjang</span>
              </button>
            </div>
          </div>

          {/* Trust Assurances Card (Delivery & Return from reference image) */}
          <div className="border border-gray-200/80 rounded-2xl p-4 divide-y divide-gray-100 text-xs space-y-3">
            <div className="flex items-start gap-3 pb-1">
              <Truck className="w-5 h-5 text-[#003d29] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">Gratis Pengiriman</span>
                <span className="text-[11px] text-gray-500 block">
                  Bebas ongkir untuk pembelanjaan di atas Rp 150.000 ke seluruh Indonesia.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3">
              <RotateCcw className="w-5 h-5 text-[#003d29] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">Garansi Paket Rusak</span>
                <span className="text-[11px] text-gray-500 block">
                  Penggantian 100% jika produk oleh-oleh atau gerabah rusak selama di perjalanan kurir.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
