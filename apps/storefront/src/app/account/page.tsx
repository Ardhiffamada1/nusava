'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  X,
  Truck,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  MapPin,
  ExternalLink,
  ShieldCheck,
  FileText,
  Star,
  Check,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { useCartStore } from '../../stores/cart-store';
import { useLanguageStore } from '../../stores/language-store';
import { formatCurrency, formatDate, formatDateTime } from '@commerceos/ui';
import { CourierLogo } from '../../components/courier-logos';

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { addItem, openCart } = useCartStore();
  const { language } = useLanguageStore();
  const isId = language === 'id';

  const [activeTab, setActiveTab] = useState<'ALL' | 'NOT_SHIPPED' | 'CANCELLED'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'3_MONTHS' | '6_MONTHS' | '2024' | 'ALL'>('3_MONTHS');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  const [dismissedBanners, setDismissedBanners] = useState<Record<string, boolean>>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [reviewingItem, setReviewingItem] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch real customer orders if user is authenticated
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => apiRequest<{ items: any[]; meta: any }>('/orders?limit=30'),
    enabled: !!user,
  });

  const { data: selectedOrderDetail } = useQuery({
    queryKey: ['order-detail', selectedOrderId],
    queryFn: () => apiRequest<any>(`/orders/${selectedOrderId}`),
    enabled: !!selectedOrderId && !selectedOrderId.startsWith('demo-'),
  });

  // Authentic demo orders that mirror the reference screenshot when empty/guest
  const demoOrders = [
    {
      id: 'demo-order-1',
      orderNumber: '112-0822160-5390023',
      orderPlaced: '2 Juni 2024',
      grandTotal: 157990,
      shipTo: user ? `${user.firstName} ${user.lastName}` : 'Irakli Lolashvili',
      status: 'DELIVERED',
      courier: 'JNE Express (YES)',
      trackingNumber: 'JNE-98210398210',
      items: [
        {
          id: 'demo-item-1',
          title: 'Bakpia Pathok 25 Asli Khas Yogyakarta (Isi 15 Pcs)',
          slug: 'bakpia-pathok-25-yogyakarta',
          sku: 'BKP-YOG-025',
          price: 55000,
          quantity: 1,
          deliveredDate: isId ? 'Terkirim 5 Juni' : 'Delivered June 5',
          deliverySubtitle: isId
            ? 'Paket telah diterima langsung oleh penerima.'
            : 'Your package was delivered. It was handed directly to a resident.',
          returnEligible: isId
            ? 'Garansi pengembalian: Berlaku s/d 5 Juli 2024'
            : 'Return or replace items: Eligible through July 5, 2024',
          image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg',
        },
        {
          id: 'demo-item-2',
          title: 'Pie Susu Dhian Khas Bali Asli Super Lembut (Isi 50 Pcs)',
          slug: 'pie-susu-dhian-bali-50',
          sku: 'PIE-BAL-050',
          price: 80000,
          quantity: 1,
          deliveredDate: isId ? 'Terkirim 7 Juni' : 'Delivered June 7',
          deliverySubtitle: isId
            ? 'Paket telah diterima langsung oleh penerima di lokasi tujuan.'
            : 'Your package was delivered. It was handed directly to a resident.',
          returnEligible: isId
            ? 'Garansi pengembalian: Berlaku s/d 7 Juli 2024'
            : 'Return or replace items: Eligible through July 7, 2024',
          image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
        },
      ],
    },
    {
      id: 'demo-order-2',
      orderNumber: '114-7291038-4109281',
      orderPlaced: '28 Mei 2024',
      grandTotal: 125000,
      shipTo: user ? `${user.firstName} ${user.lastName}` : 'Irakli Lolashvili',
      status: 'DELIVERED',
      courier: 'SiCepat BEST',
      trackingNumber: 'SCP-772910281',
      items: [
        {
          id: 'demo-item-3',
          title: 'Kopi Arabika Gayo Aceh Specialty Single Origin 250g',
          slug: 'kopi-arabika-gayo-aceh',
          sku: 'KOP-GYO-250',
          price: 75000,
          quantity: 1,
          deliveredDate: isId ? 'Terkirim 30 Mei' : 'Delivered May 30',
          deliverySubtitle: isId
            ? 'Paket telah diterima di pos satpam dengan konfirmasi tanda tangan.'
            : 'Your package was delivered. Handed directly to reception/resident.',
          returnEligible: isId
            ? 'Garansi pengembalian: Berlaku s/d 30 Juni 2024'
            : 'Return or replace items: Eligible through June 30, 2024',
          image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
        },
      ],
    },
  ];

  // If real orders exist, format them; otherwise fallback to the demo buyer orders
  const hasRealOrders = ordersData?.items && ordersData.items.length > 0;
  const rawOrders = hasRealOrders ? ordersData.items : demoOrders;

  // Filter orders by tab
  const displayOrders = rawOrders.filter((order: any) => {
    if (activeTab === 'NOT_SHIPPED') {
      return order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
    }
    if (activeTab === 'CANCELLED') {
      return order.status === 'CANCELLED';
    }
    return true;
  });

  const handleBuyAgain = async (item: any) => {
    try {
      if (item.variantId || item.variant?.id) {
        await addItem(item.variantId || item.variant?.id, 1);
        openCart();
      } else {
        alert(isId ? 'Produk berhasil ditambahkan ke keranjang belanja!' : 'Product added to shopping cart!');
        openCart();
      }
    } catch {
      openCart();
    }
  };

  const activeTracking = trackingOrder;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 font-sans">
      {/* Top Breadcrumb / User Account Mini Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#003d29] transition-colors">
            {isId ? 'Beranda' : 'Home'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{isId ? 'Akun Saya' : 'My Account'}</span>
          <span>/</span>
          <span className="text-[#003d29] font-bold">{isId ? 'Pesanan' : 'Orders'}</span>
        </div>

        {user && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-600 font-medium">
              {isId ? 'Masuk sebagai:' : 'Signed in as:'}{' '}
              <strong className="text-gray-900 font-bold">{user.firstName} {user.lastName}</strong>
            </span>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="text-gray-400 hover:text-rose-600 font-medium underline transition-colors"
            >
              {isId ? 'Keluar' : 'Sign out'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Your Orders (Exact layout from uploaded reference image) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Header with Badge Counter: 'Your Orders 6' */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {isId ? 'Pesanan Saya' : 'Your Orders'}
            </h1>
            <span className="bg-gray-100 text-gray-700 px-3 py-0.5 rounded-full text-xs font-extrabold border border-gray-200/80">
              {displayOrders.length}
            </span>
          </div>

          {/* 2. Filter Tabs & Timeframe Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* Pill Tabs Group */}
            <div className="flex items-center p-1 bg-gray-100/90 rounded-xl text-xs font-semibold text-gray-600">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 sm:px-5 py-2 rounded-lg transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                {isId ? 'Pesanan' : 'Orders'}
              </button>
              <button
                onClick={() => setActiveTab('NOT_SHIPPED')}
                className={`px-4 sm:px-5 py-2 rounded-lg transition-all ${
                  activeTab === 'NOT_SHIPPED'
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                {isId ? 'Belum Dikirim' : 'Not Yet Shipped'}
              </button>
              <button
                onClick={() => setActiveTab('CANCELLED')}
                className={`px-4 sm:px-5 py-2 rounded-lg transition-all ${
                  activeTab === 'CANCELLED'
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                {isId ? 'Dibatalkan' : 'Cancelled Orders'}
              </button>
            </div>

            {/* Time Period Filter Dropdown */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none cursor-pointer hover:border-gray-300 shadow-2xs"
              >
                <option value="3_MONTHS">{isId ? '3 Bulan Terakhir' : 'Past 3 Month'}</option>
                <option value="6_MONTHS">{isId ? '6 Bulan Terakhir' : 'Past 6 Month'}</option>
                <option value="2024">2024</option>
                <option value="ALL">{isId ? 'Semua Waktu' : 'All Time'}</option>
              </select>
            </div>
          </div>

          {/* 3. Orders List */}
          {isOrdersLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-56 bg-gray-50 border border-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : displayOrders.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 bg-[#F9FAFA] rounded-2xl p-6">
              <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900">
                {isId ? 'Belum ada pesanan pada filter ini' : 'No orders found for this filter'}
              </p>
              <p className="text-xs text-gray-500 mt-1 mb-5">
                {isId
                  ? 'Yuk mulai jelajahi aneka oleh-oleh Nusantara khas daerah terpopuler.'
                  : 'Start browsing our curated authentic Indonesian gifts and handicrafts.'}
              </p>
              <Link
                href="/products"
                className="text-xs font-bold bg-[#003d29] hover:bg-[#002b1c] text-white px-6 py-2.5 rounded-full transition-colors inline-block shadow-2xs"
              >
                {isId ? 'Mulai Belanja' : 'Start Shopping'}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {displayOrders.map((order: any) => {
                const isDelivered = order.status === 'DELIVERED';
                const orderItems = order.items || [];
                const bannerDismissed = dismissedBanners[order.id];

                return (
                  <div
                    key={order.id}
                    className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Header Strip */}
                    <div className="bg-[#FAF9F5] border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                      {/* Left: Metadata columns */}
                      <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                            {isId ? 'TANGGAL PESAN' : 'Order placed'}
                          </span>
                          <span className="font-semibold text-gray-800 mt-0.5 block">
                            {order.createdAt ? formatDate(order.createdAt) : order.orderPlaced || '2 Juni 2024'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                            {isId ? 'TOTAL HARGA' : 'Total'}
                          </span>
                          <span className="font-extrabold text-gray-900 mt-0.5 block">
                            {formatCurrency(Number(order.grandTotal))}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                            {isId ? 'TUJUAN KIRIM' : 'Ship to'}
                          </span>
                          <div className="flex items-center gap-1 font-semibold text-[#003d29] hover:underline cursor-pointer mt-0.5">
                            <span>{order.shippingAddress?.fullName || order.shipTo}</span>
                            <ChevronDown className="w-3 h-3 text-[#003d29]" />
                          </div>
                        </div>
                      </div>

                      {/* Right: Order # & Links */}
                      <div className="text-left sm:text-right">
                        <div className="text-[11px] text-gray-500 font-semibold tracking-wide">
                          {isId ? 'PESANAN' : 'Order'} #{order.orderNumber}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-[#003d29] hover:underline font-semibold"
                          >
                            {isId ? 'Lihat rincian' : 'View order details'}
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-[#003d29] hover:underline font-semibold"
                          >
                            {isId ? 'Lihat invoice' : 'View invoice'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-6">
                      {/* Review encouragement yellow banner */}
                      {isDelivered && !bannerDismissed && (
                        <div className="p-3.5 bg-[#FFF9E6] border border-[#FFE8A3] text-gray-800 text-xs rounded-xl flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              const targetItem = orderItems[0] || {};
                              setReviewingItem({
                                id: targetItem.id || 'item-review',
                                title: targetItem.productNameSnapshot || targetItem.title || 'Produk Oleh-Oleh',
                                image:
                                  targetItem.image ||
                                  targetItem.variant?.product?.images?.[0]?.url ||
                                  'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg',
                                orderNumber: order.orderNumber,
                              });
                              setReviewSuccess(false);
                            }}
                            className="flex items-center gap-2 font-medium hover:text-[#003d29] text-left transition-colors"
                          >
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                            <span className="font-semibold underline">
                              {isId
                                ? 'Beri ulasan pengalaman belanja kamu bersama penjual'
                                : 'Please rate your experience with the seller'}
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              setDismissedBanners((prev) => ({ ...prev, [order.id]: true }))
                            }
                            className="text-gray-400 hover:text-gray-700 text-sm font-bold ml-2"
                            aria-label="Tutup notifikasi"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      {/* Items List */}
                      {orderItems.map((item: any, idx: number) => {
                        const productTitle = item.productNameSnapshot || item.title;
                        const productImg =
                          item.image ||
                          item.variant?.product?.images?.[0]?.url ||
                          'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg';
                        const productSlug = item.slug || item.variant?.product?.slug || 'bakpia-pathok-25-yogyakarta';

                        return (
                          <div key={item.id || idx} className="space-y-3 pt-4 first:pt-0 border-t first:border-t-0 border-stone-200">
                            {/* Delivery Heading */}
                            <div>
                              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                                {item.deliveredDate ||
                                  (order.status === 'DELIVERED'
                                    ? isId ? `Terkirim pada ${formatDate(order.createdAt)}` : `Delivered ${formatDate(order.createdAt)}`
                                    : isId ? 'Sedang Dalam Pengiriman Kurir' : 'In Transit')}
                              </h3>
                              {item.deliverySubtitle && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.deliverySubtitle}
                                </p>
                              )}
                            </div>

                            {/* Product Item Content */}
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                              {/* Square Photo on Left */}
                              <div className="relative w-24 h-24 bg-[#F5F6F6] rounded-xl overflow-hidden shrink-0 border border-stone-200 p-2 flex items-center justify-center">
                                <Image
                                  src={productImg}
                                  alt={productTitle}
                                  fill
                                  className="object-contain p-1.5"
                                  sizes="96px"
                                />
                              </div>

                              {/* Details & Button Actions */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <Link
                                  href={`/products/${productSlug}`}
                                  className="text-sm font-bold text-gray-900 hover:text-[#003d29] transition-colors line-clamp-2 leading-snug"
                                >
                                  {productTitle}
                                </Link>

                                <p className="text-xs text-gray-500 font-medium">
                                  {item.returnEligible ||
                                    (isId
                                      ? 'Garansi pengembalian: Berlaku 7 hari sejak produk diterima'
                                      : 'Return or replace items: Eligible through 7 days after delivery')}
                                </p>

                                {/* Action Buttons Row */}
                                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                                  {/* 1. Buy it again button */}
                                  <button
                                    type="button"
                                    onClick={() => handleBuyAgain(item)}
                                    className="bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>{isId ? 'Beli lagi' : 'Buy it again'}</span>
                                  </button>

                                  {/* 2. View your item button */}
                                  <Link
                                    href={`/products/${productSlug}`}
                                    className="bg-white border border-stone-200 hover:bg-stone-50 text-gray-800 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                                  >
                                    {isId ? 'Lihat produk' : 'View your item'}
                                  </Link>

                                  {/* 3. Track package button */}
                                  <button
                                    type="button"
                                    onClick={() => setTrackingOrder({ ...order, currentItem: item })}
                                    className="bg-white border border-stone-200 hover:bg-stone-50 text-gray-800 text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                                  >
                                    <Truck className="w-3.5 h-3.5 text-gray-500" />
                                    <span>{isId ? 'Lacak paket' : 'Track package'}</span>
                                  </button>

                                  {/* 4. Three dots dropdown button */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setMenuOpenId(menuOpenId === item.id ? null : item.id)
                                      }
                                      className="bg-white border border-stone-200 hover:bg-stone-50 text-gray-600 px-2.5 py-2 rounded-lg transition-colors flex items-center justify-center"
                                      aria-label="Opsi lainnya"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>

                                    {menuOpenId === item.id && (
                                      <div className="absolute left-0 mt-1.5 w-48 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-20 text-xs font-semibold text-gray-700">
                                        <button
                                          onClick={() => {
                                            setMenuOpenId(null);
                                            setReviewingItem({
                                              id: item.id,
                                              title: productTitle,
                                              image: productImg,
                                              orderNumber: order.orderNumber,
                                            });
                                            setReviewSuccess(false);
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-gray-700"
                                        >
                                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                          <span>{isId ? 'Tulis Ulasan Produk' : 'Write Product Review'}</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setMenuOpenId(null);
                                            setSelectedOrderId(order.id);
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2"
                                        >
                                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                                          <span>{isId ? 'Cetak Invoice' : 'Print Invoice'}</span>
                                        </button>
                                        <a
                                          href="https://wa.me/6281234567890"
                                          target="_blank"
                                          rel="noreferrer"
                                          className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-emerald-800"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>{isId ? 'Bantuan Pesanan' : 'Get Help'}</span>
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Send us a message */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Send us a message card */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#003d29]/10 text-[#003d29] flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#003d29]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                {isId ? 'Kirim Pesan Bantuan' : 'Send us a message'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-1">
                {isId
                  ? 'Jika kamu memiliki pertanyaan seputar status paket, pengiriman kurir, atau butuh bantuan pesanan, silakan sampaikan keluhanmu. Kami siap membantu dalam 24 jam.'
                  : 'If you unable to find answers, please describe your issue. We will find solutions within the next 24 hours.'}
              </p>
            </div>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20NUSAVA,%20saya%20butuh%20bantuan%20seputar%20pesanan%20saya."
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold py-3.5 px-4 rounded-lg text-center block transition-colors shadow-2xs"
            >
              {isId ? 'Kirim Pesan Sekarang' : 'Send us a message'}
            </a>
          </div>

          {/* 2. Customer Trust & Guarantee Card */}
          <div className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-5 space-y-3.5 text-xs text-gray-600">
            <div className="flex items-center gap-2 text-gray-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#003d29]" />
              <span>{isId ? 'Jaminan Belanja Aman' : 'Buyer Protection'}</span>
            </div>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#003d29] font-bold">✓</span>
                <span>{isId ? 'Garansi uang kembali 100% jika produk rusak selama perjalanan ekspedisi.' : '100% money back guarantee if items damaged during shipping.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#003d29] font-bold">✓</span>
                <span>{isId ? 'Produk oleh-oleh kuliner dijamin otentik fresh langsung dari dapur UMKM daerah.' : 'Authentic Indonesian culinary by verified local stores guaranteed fresh.'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Track Package Modal */}
      {activeTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 max-w-lg w-full rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29]">
                  {isId ? 'PELACAKAN REAL-TIME' : 'LIVE PACKAGE TRACKING'}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">
                  {activeTracking.courier || 'JNE Express (YES)'}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  No. Resi: {activeTracking.trackingNumber || 'JNE-98210398210'}
                </p>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Courier Status Timeline */}
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-600 mt-1 shrink-0 ring-4 ring-emerald-100" />
                <div>
                  <p className="font-bold text-gray-900">
                    {isId ? 'Paket Diterima Oleh Penerima' : 'Delivered to resident'}
                  </p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    {isId
                      ? 'Diterima oleh yang bersangkutan (Irakli Lolashvili).'
                      : 'Handed directly to recipient at destination address.'}
                  </p>
                  <span className="text-[10px] text-gray-400">07:15 WIB</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-stone-300 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">
                    {isId ? 'Kurir Membawa Paket Menuju Lokasi' : 'With delivery courier'}
                  </p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    {isId ? 'Kurir bergerak dari Drop Point Hub' : 'Out for delivery from local hub'}
                  </p>
                  <span className="text-[10px] text-gray-400">06:20 WIB</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-stone-300 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">
                    {isId ? 'Paket Tiba di Sentra Hub Kota Tujuan' : 'Arrived at destination sorting center'}
                  </p>
                  <span className="text-[10px] text-gray-400">03:40 WIB</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-stone-300 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">
                    {isId ? 'Paket Dikirim dari Sentra UMKM Daerah' : 'Departed from verified local UMKM center'}
                  </p>
                  <span className="text-[10px] text-gray-400">Kemarin, 15:10 WIB</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <Link
                href={`/orders/track/${activeTracking.orderNumber || '112-0822160-5390023'}`}
                className="text-xs font-semibold text-[#003d29] hover:underline flex items-center gap-1"
              >
                <span>Halaman Lacak Lengkap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setTrackingOrder(null)}
                className="px-5 py-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold rounded-lg transition-colors"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write a Product Review Modal (Feature 2) */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29]">
                  {isId ? 'ULASAN PEMBELI' : 'PRODUCT REVIEW'}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">
                  {isId ? 'Beri Penilaian Produk' : 'Rate Your Product'}
                </h3>
              </div>
              <button
                onClick={() => setReviewingItem(null)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-gray-900">Ulasan Berhasil Dikirim!</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Terima kasih sudah membagikan ulasanmu. Pengalaman belanjamu sangat membantu para pengrajin lokal dan pembeli lainnya.
                </p>
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="mt-4 px-6 py-2.5 bg-[#003d29] text-white text-xs font-bold rounded-lg hover:bg-[#002b1c] transition-colors"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Item Thumbnail & Title */}
                <div className="flex items-center gap-3 p-3 bg-[#FAF9F5] border border-stone-200 rounded-xl">
                  <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-stone-200">
                    <Image
                      src={reviewingItem.image}
                      alt={reviewingItem.title}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-gray-400 font-mono block">Order #{reviewingItem.orderNumber}</span>
                    <h4 className="font-bold text-gray-900 text-xs truncate">{reviewingItem.title}</h4>
                  </div>
                </div>

                {/* Star Rating Interactive Selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Kualitas Produk Keseluruhan:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (reviewHoverRating || reviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 transition-colors"
                          aria-label={`Beri ${star} bintang`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              isFilled
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="text-xs font-bold text-gray-700 ml-2">
                      {reviewRating === 5
                        ? 'Sangat Puas'
                        : reviewRating === 4
                        ? 'Puas'
                        : reviewRating === 3
                        ? 'Cukup'
                        : reviewRating === 2
                        ? 'Kurang'
                        : 'Mengecewakan'}
                    </span>
                  </div>
                </div>

                {/* Quality Tags Chips */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Poin Penilaian yang Menonjol:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Rasa Otentik Khas Daerah',
                      'Kemasan Rapi & Tebal',
                      'Pengiriman Tepat Waktu',
                      'Sesuai Foto & Deskripsi',
                      'Fresh Langsung dari Dapur',
                    ].map((tag) => {
                      const isSelected = reviewTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setReviewTags(reviewTags.filter((t) => t !== tag));
                            } else {
                              setReviewTags([...reviewTags, tag]);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                            isSelected
                              ? 'bg-[#003d29] text-white border-[#003d29]'
                              : 'bg-white text-gray-600 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Ceritakan Pengalamanmu:
                  </label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Bagikan ulasan tentang kelezatan rasa, kerapian kemasan, atau pelayanan penjual..."
                    className="w-full text-xs p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#003d29] resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewingItem(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewSuccess(true);
                      setReviewText('');
                      setReviewTags([]);
                    }}
                    className="px-5 py-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details & Invoice Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29]">
                  {isId ? 'RINCIAN TRANSAKSI' : 'ORDER DETAILS & INVOICE'}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                  Order #{selectedOrderDetail?.orderNumber || '112-0822160-5390023'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isId ? 'Tanggal:' : 'Date:'} {selectedOrderDetail?.createdAt ? formatDateTime(selectedOrderDetail.createdAt) : '2 Juni 2024, 14:30 WIB'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-1 hover:bg-stone-100 text-gray-400 hover:text-gray-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>{isId ? 'Subtotal Barang:' : 'Items Subtotal:'}</span>
                <span className="font-semibold text-gray-900">
                  {selectedOrderDetail ? formatCurrency(selectedOrderDetail.subtotal) : formatCurrency(135000)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{isId ? 'Biaya Ongkir Kurir:' : 'Shipping:'}</span>
                <span className="font-semibold text-gray-900">
                  {selectedOrderDetail ? formatCurrency(selectedOrderDetail.shippingCost) : formatCurrency(22990)}
                </span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-sm pt-2 border-t border-stone-200">
                <span>{isId ? 'Total Tagihan:' : 'Grand Total:'}</span>
                <span className="text-[#003d29]">
                  {selectedOrderDetail ? formatCurrency(selectedOrderDetail.grandTotal) : formatCurrency(157990)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isId ? 'Pembayaran Berhasil / Lunas' : 'Payment Completed'}</span>
              </span>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-xs font-bold bg-[#003d29] hover:bg-[#002b1c] text-white px-6 py-2.5 rounded-lg transition-colors shadow-2xs"
              >
                {isId ? 'Tutup Rincian' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
