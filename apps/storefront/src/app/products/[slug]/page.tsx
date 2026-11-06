'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Check, AlertCircle, ChevronRight, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { useCartStore } from '../../../stores/cart-store';

export default function ProductDetailPage() {
  const params = useParams();
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

  const { addItem } = useCartStore();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-3/4 bg-border/40" />
          <div className="space-y-4">
            <div className="h-4 bg-border/40 w-1/4" />
            <div className="h-8 bg-border/40 w-3/4" />
            <div className="h-4 bg-border/40 w-1/3" />
            <div className="h-24 bg-border/40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-xl font-light text-ink">Product not found</h1>
        <p className="text-xs text-ink-secondary mt-2 mb-6">
          The requested product may have been archived or is temporarily unavailable.
        </p>
        <Link
          href="/products"
          className="text-xs font-semibold uppercase tracking-wider text-ink border border-border px-4 py-2 hover:bg-muted transition-colors"
        >
          Return to Catalog
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

  const stockOnHand = activeVariant?.inventory?.quantityOnHand ?? 0;
  const isOutOfStock = stockOnHand <= 0;

  const handleAddToCart = async () => {
    if (!activeVariant || isOutOfStock) return;
    try {
      setIsAdding(true);
      await addItem(activeVariant.id, quantity);
    } catch (err: any) {
      alert(err.message || 'Failed to add item to bag');
    } finally {
      setIsAdding(false);
    }
  };

  const images = product.images?.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80', altText: product.title }];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[11px] text-ink-secondary uppercase tracking-widest mb-8">
        <Link href="/" className="hover:text-ink transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-ink-tertiary" />
        <Link href="/products" className="hover:text-ink transition-colors">Products</Link>
        <ChevronRight className="w-3 h-3 text-ink-tertiary" />
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-ink transition-colors">
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3 h-3 text-ink-tertiary" />
        <span className="text-ink truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible shrink-0">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-20 bg-muted overflow-hidden border transition-colors ${
                    selectedImageIndex === idx ? 'border-ink' : 'border-border/60 hover:border-ink/40'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || product.title}
                    fill
                    className="object-cover object-center"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Visual Display */}
          <div className="relative aspect-3/4 flex-1 bg-surface border border-border overflow-hidden">
            <Image
              src={images[selectedImageIndex]?.url}
              alt={images[selectedImageIndex]?.altText || product.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>
        </div>

        {/* Right: Purchase Control Panel */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="border-b border-border pb-6 mb-6">
            <span className="text-[11px] uppercase tracking-widest text-ink-secondary block mb-1">
              {product.category?.name}
            </span>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-ink">
              {product.title}
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-lg font-mono text-ink">
                {formatCurrency(currentPrice)}
              </span>
              <span className="text-xs text-ink-tertiary font-mono">
                SKU: {activeVariant?.sku}
              </span>
            </div>
          </div>

          {/* Editorial Description */}
          <div className="text-xs text-ink-secondary leading-relaxed font-normal mb-8">
            <p>{product.description}</p>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs uppercase tracking-wider font-semibold text-ink">
                  Variant Option:
                </span>
                <span className="text-xs text-ink-secondary font-medium">
                  {activeVariant?.title}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => {
                  const isSelected = (selectedVariantId || product.variants[0].id) === v.id;
                  const vStock = v.inventory?.quantityOnHand ?? 0;
                  const isVOutOfStock = vStock <= 0;

                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setQuantity(1);
                      }}
                      className={`text-xs px-3.5 py-2 rounded-xs border transition-all text-left flex items-center gap-2 ${
                        isSelected
                          ? 'border-ink bg-ink text-white font-medium shadow-xs'
                          : isVOutOfStock
                          ? 'border-border/60 bg-muted/50 text-ink-tertiary line-through cursor-not-allowed'
                          : 'border-border bg-white text-ink hover:border-ink/50'
                      }`}
                      disabled={isVOutOfStock}
                    >
                      <span>{v.title}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Real-Time Stock Status */}
          <div className="flex items-center gap-2 text-xs mb-6 p-3 bg-surface border border-border">
            {isOutOfStock ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-rose-700 font-medium">Out of stock. Available for pre-order replenishment.</span>
              </>
            ) : stockOnHand <= 5 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-900 font-medium">
                  Low Stock: Only {stockOnHand} units remain in inventory
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-ink-secondary">
                  Ready to dispatch • <span className="font-mono text-ink">{stockOnHand}</span> units available
                </span>
              </>
            )}
          </div>

          {/* Quantity and Add to Cart Action */}
          <div className="flex items-stretch gap-3 mb-8">
            <div className="flex items-center border border-border bg-white rounded-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="px-3 py-3 text-ink hover:bg-muted disabled:opacity-30 transition-colors"
              >
                -
              </button>
              <span className="px-3 font-mono text-xs text-ink select-none">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(stockOnHand, quantity + 1))}
                disabled={quantity >= stockOnHand || isOutOfStock}
                className="px-3 py-3 text-ink hover:bg-muted disabled:opacity-30 transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="flex-1 bg-ink text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-6 rounded-xs hover:bg-ink/90 disabled:opacity-30 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Adding to Bag...' : isOutOfStock ? 'Sold Out' : `Add to Bag • ${formatCurrency(currentPrice * quantity)}`}</span>
            </button>
          </div>

          {/* Shipping & Assurance details */}
          <div className="border-t border-border pt-6 space-y-4 text-xs text-ink-secondary">
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-ink shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink">Free Express Shipping on Orders $150+</p>
                <p className="text-[11px] text-ink-tertiary mt-0.5">Dispatched within 24 business hours from Portland fulfillment center.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-ink shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink">Verified Demo Payments</p>
                <p className="text-[11px] text-ink-tertiary mt-0.5">Supports Cash on Delivery & Manual Bank Transfer with guaranteed atomic stock allocation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
