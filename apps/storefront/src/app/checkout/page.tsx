'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useCartStore, GIFT_WRAP_COST } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { apiRequest } from '../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { PaymentMethod } from '@commerceos/contracts';
import { CourierLogo } from '../../components/courier-logos';
import { AVAILABLE_COUPONS, validateAndApplyCoupon, Coupon } from '../../lib/coupon-helpers';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Building2,
  Check,
  AlertCircle,
  Truck,
  HelpCircle,
  CreditCard,
  Banknote,
  Tag,
  X,
  Gift,
} from 'lucide-react';

const CheckoutFormSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  fullName: z.string().min(2, 'Nama lengkap wajib diisi minimal 2 karakter'),
  phone: z.string().min(8, 'Nomor HP / WhatsApp minimal 8 digit'),
  streetAddress: z.string().min(5, 'Alamat lengkap wajib diisi (jalan, nomor, RT/RW)'),
  city: z.string().min(2, 'Kota/Kabupaten wajib diisi'),
  state: z.string().min(2, 'Provinsi wajib diisi'),
  postalCode: z.string().min(3, 'Kode pos wajib diisi'),
  country: z.string().default('ID'),
  notes: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, fetchCart, clearCart, giftDetails, setGiftDetails } = useCartStore();
  const { user } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState('jne-reg');
  const [isDropship, setIsDropship] = useState(false);
  const [dropshipSenderName, setDropshipSenderName] = useState('');
  const [dropshipSenderPhone, setDropshipSenderPhone] = useState('');
  const [hidePriceInSlip, setHidePriceInSlip] = useState(true);

  const isFreeEligible = subtotal >= 150000;
  const totalWeightGrams = Math.max(1000, items.reduce((acc, it) => acc + it.quantity, 0) * 500);

  const { data: shippingCostApi } = useQuery({
    queryKey: ['checkout-rajaongkir', subtotal, totalWeightGrams],
    queryFn: async () => {
      const q = new URLSearchParams({
        origin: 'yogyakarta',
        destination: 'jakarta',
        weight: String(totalWeightGrams),
        subtotal: String(subtotal),
      });
      const res = await fetch(`/api/shipping/cost?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch shipping options');
      return res.json();
    },
  });

  const fallbackCourierOptions = [
    {
      id: 'jne-reg',
      name: 'JNE Express',
      service: 'Reguler (2-3 Hari)',
      cost: isFreeEligible ? 0 : 18000,
      badge: isFreeEligible ? 'Gratis Ongkir' : 'Paling Populer',
    },
    {
      id: 'jne-yes',
      name: 'JNE Express',
      service: 'YES - Kilat (1 Hari Sampai)',
      cost: 32000,
      badge: 'Prioritas Makanan Basah',
    },
    {
      id: 'jnt-ez',
      name: 'J&T Express',
      service: 'EZ Regular (2-3 Hari)',
      cost: isFreeEligible ? 0 : 19000,
      badge: isFreeEligible ? 'Gratis Ongkir' : undefined,
    },
    {
      id: 'sicepat-best',
      name: 'SiCepat Ekspres',
      service: 'BEST (1-2 Hari Sampai)',
      cost: 25000,
      badge: 'Rekomendasi Oleh-oleh',
    },
    {
      id: 'pos-reg',
      name: 'Pos Indonesia',
      service: 'Pos Reguler / Kilat Khusus (2-4 Hari)',
      cost: isFreeEligible ? 0 : 16000,
      badge: isFreeEligible ? 'Gratis Ongkir' : 'Hemat',
    },
  ];

  const courierOptions = shippingCostApi?.options
    ? shippingCostApi.options.map((opt: any) => ({
        id: opt.id,
        name: opt.courier,
        service: `${opt.service} (${opt.etd})`,
        cost: opt.cost,
        badge: opt.badge,
      }))
    : fallbackCourierOptions;

  const activeCourier = courierOptions.find((c: any) => c.id === selectedCourierId) || courierOptions[0];
  const { data: addresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => apiRequest<any[]>('/users/addresses'),
    enabled: !!user,
  });

  const defaultAddress = addresses?.find((a) => a.isDefaultShipping) || addresses?.[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      email: user?.email || '',
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
      country: 'ID',
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  useEffect(() => {
    if (user) {
      setValue('email', user.email);
      setValue('fullName', `${user.firstName} ${user.lastName}`);
    }
    if (defaultAddress) {
      setValue('fullName', defaultAddress.fullName);
      setValue('phone', defaultAddress.phone);
      setValue('streetAddress', defaultAddress.streetAddress);
      setValue('city', defaultAddress.city);
      setValue('state', defaultAddress.state);
      setValue('postalCode', defaultAddress.postalCode);
      setValue('country', defaultAddress.country || 'ID');
    }
  }, [user, defaultAddress, setValue]);

  const rawShippingCost = items.length === 0 ? 0 : activeCourier.cost;
  const effectiveShippingCost = appliedCoupon?.discountType === 'SHIPPING' ? 0 : rawShippingCost;
  const giftCost = giftDetails.isGiftWrap ? GIFT_WRAP_COST : 0;
  const grandTotal = Math.max(0, subtotal + effectiveShippingCost + giftCost - (appliedCoupon?.discountType === 'SHIPPING' ? 0 : couponDiscount));

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponCode;
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
      setCouponCode('');
    } else {
      setCouponError(result.error || 'Kupon tidak dapat digunakan.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      setErrorMessage('Keranjang belanja kamu masih kosong.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      let order: any;
      const courierNote = `[Kurir: ${activeCourier.name} - ${activeCourier.service}]`;
      const giftNote = giftDetails.isGiftWrap
        ? `[HAMPERS: ${giftDetails.packagingType === 'besek' ? 'Besek Tradisional Bambu' : 'Hardbox Eksklusif'} | Pesan: "${giftDetails.message || '-'}" | Dari: ${giftDetails.senderName || data.fullName} | Kepada: ${giftDetails.recipientName || data.fullName}]`
        : '';
      const dropshipNote = isDropship
        ? `[GIFT DELIVERY (DROPSHIP): Pengirim: ${dropshipSenderName || data.fullName} (${dropshipSenderPhone || data.phone}) | Sembunyikan Harga: ${hidePriceInSlip ? 'YA' : 'TIDAK'}]`
        : '';
      const combinedNotes = [courierNote, giftNote, dropshipNote, data.notes].filter(Boolean).join(' ');

      if (!user) {
        // GUEST CHECKOUT (Tanpa perlu login / register)
        const guestPayload = {
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country || 'ID',
          paymentMethod: data.paymentMethod,
          notes: combinedNotes,
          items: items.map((it) => ({
            variantId: it.variantId,
            quantity: it.quantity,
          })),
        };

        order = await apiRequest<any>('/checkout/guest', {
          method: 'POST',
          body: JSON.stringify(guestPayload),
        });
      } else {
        // Logged in user checkout
        const payload: any = {
          paymentMethod: data.paymentMethod,
          notes: combinedNotes,
          items: items.map((it) => ({
            variantId: it.variantId,
            quantity: it.quantity,
          })),
          newAddress: {
            fullName: data.fullName,
            phone: data.phone,
            streetAddress: data.streetAddress,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country || 'ID',
          },
        };

        order = await apiRequest<any>('/checkout', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      // Bersihkan keranjang lokal dan sinkronkan
      clearCart();
      await fetchCart();
      router.push(`/checkout/success/${order.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses pesanan. Silakan periksa kembali formulir pengiriman.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-500">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja Masih Kosong</h1>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          Kamu belum memilih oleh-oleh atau produk khas Nusantara untuk dibeli.
        </p>
        <Link
          href="/products"
          className="inline-flex px-7 py-3 bg-[#003d29] text-white text-sm font-semibold rounded-full hover:bg-[#002b1d] transition-colors shadow-sm"
        >
          Lihat Katalog Oleh-oleh
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#003d29] block mb-1">
            Checkout Pembelian Oleh-oleh
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Pengiriman & Pembayaran
          </h1>
        </div>

        <Link
          href="/cart"
          className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1.5 transition-colors"
        >
          <span>Kembali ke Keranjang</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Review Items & Delivery Address */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 1: Review Item And Shipping */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">
                  Ringkasan Item Belanja ({items.length} Macam)
                </h2>
                <span className="text-xs font-semibold text-[#003d29] bg-[#F5F6F6] px-2.5 py-1 rounded-full">
                  Stok Terverifikasi
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-[#F5F6F6] rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productTitle}
                          fill
                          className="object-contain p-1.5"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {item.productTitle}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variantTitle}
                      </p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        Jumlah: {item.quantity} pcs
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 block">
                        {formatCurrency(item.lineTotal)}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        @{formatCurrency(item.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Delivery Information */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Alamat Pengiriman Paket
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {user ? 'Data pengiriman kamu otomatis terisi dari profil akun.' : 'Isi formulir di bawah ini untuk pengiriman langsung (Guest Checkout).'}
                  </p>
                </div>
                {!user && (
                  <span className="text-[11px] font-semibold bg-[#F5F6F6] text-[#003d29] px-3 py-1 rounded-full border border-gray-200">
                    Beli Langsung (Tamu)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Nama Lengkap Penerima
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                  />
                  {errors.fullName && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Alamat Email (Untuk Tanda Terima & Resi)
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="budi@example.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                  />
                  {errors.email && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Nomor WhatsApp / HP Aktif (Wajib untuk Kurir)
                </label>
                <input
                  {...register('phone')}
                  placeholder="081234567890"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                />
                {errors.phone && (
                  <span className="text-[11px] text-rose-500 mt-0.5 block">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Alamat Lengkap Pengiriman (Jalan, No. Rumah, RT/RW, Patokan)
                </label>
                <textarea
                  {...register('streetAddress')}
                  rows={2}
                  placeholder="Jl. Malioboro No. 45, RT 02/RW 03, Sosromenduran"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                />
                {errors.streetAddress && (
                  <span className="text-[11px] text-rose-500 mt-0.5 block">
                    {errors.streetAddress.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Kota / Kabupaten
                  </label>
                  <input
                    {...register('city')}
                    placeholder="Yogyakarta"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                  />
                  {errors.city && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">
                      {errors.city.message}
                    </span>
                  )}
                </div>

                {/* State / Province */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Provinsi</label>
                  <input
                    {...register('state')}
                    placeholder="DI Yogyakarta"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                  />
                  {errors.state && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">
                      {errors.state.message}
                    </span>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Kode Pos</label>
                  <input
                    {...register('postalCode')}
                    placeholder="55271"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                  />
                  {errors.postalCode && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">
                      {errors.postalCode.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Catatan Untuk Kurir Pengantar (Opsional)
                </label>
                <input
                  {...register('notes')}
                  placeholder="Contoh: Titipkan di pos satpam, pagar warna hitam..."
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                />
              </div>
            </div>

            {/* Mode Kirim Sebagai Hadiah / Dropship */}
            <div className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-5 space-y-3 font-sans">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-[#003d29] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-stone-900">
                      Kirim Sebagai Hadiah Langsung ke Kerabat / Teman
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Paket dikirim langsung ke alamat penerima di atas dengan nama pengirim Anda.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isDropship}
                    onChange={(e) => setIsDropship(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#003d29]"></div>
                </label>
              </div>

              {isDropship && (
                <div className="pt-3 border-t border-stone-200 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        Nama Pengirim (Tampil di Slip Pengiriman)
                      </label>
                      <input
                        type="text"
                        value={dropshipSenderName}
                        onChange={(e) => setDropshipSenderName(e.target.value)}
                        placeholder="Contoh: Budi Santoso & Keluarga"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-stone-200 rounded-lg outline-none focus:border-[#003d29]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        Nomor HP / WhatsApp Pengirim
                      </label>
                      <input
                        type="text"
                        value={dropshipSenderPhone}
                        onChange={(e) => setDropshipSenderPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-stone-200 rounded-lg outline-none focus:border-[#003d29]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="hide-price-slip"
                      checked={hidePriceInSlip}
                      onChange={(e) => setHidePriceInSlip(e.target.checked)}
                      className="rounded border-stone-300 text-[#003d29] focus:ring-[#003d29]"
                    />
                    <label htmlFor="hide-price-slip" className="text-xs text-stone-700 font-medium cursor-pointer">
                      Sembunyikan nominal harga pada label/slip packing paket (Gift Receipt)
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Pilihan Ekspedisi & Kurir Pengiriman (Feature 4) */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#003d29]" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Pilihan Ekspedisi & Layanan Pengiriman
                  </h2>
                </div>
                {isFreeEligible && (
                  <span className="text-[10px] font-bold text-[#003d29] bg-[#003d29]/10 px-2.5 py-0.5 rounded-full">
                    Kualifikasi Bebas Ongkir
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courierOptions.map((courier) => {
                  const isSelected = selectedCourierId === courier.id;
                  return (
                    <div
                      key={courier.id}
                      onClick={() => setSelectedCourierId(courier.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#003d29] bg-[#FAF9F5] ring-1 ring-[#003d29]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <CourierLogo courierId={courier.id} className="h-6 w-auto" />
                          {courier.badge && (
                            <span className="text-[9px] font-bold bg-[#003d29] text-white px-2 py-0.5 rounded-full">
                              {courier.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-gray-900">{courier.name}</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">{courier.service}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">
                          {courier.cost === 0 ? (
                            <span className="text-[#003d29] font-bold">Gratis</span>
                          ) : (
                            formatCurrency(courier.cost)
                          )}
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#003d29] bg-[#003d29]' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Opsi Kemasan Hampers / Gift Box & Kartu Ucapan Adat (Feature 3) */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#003d29]" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Kemas Sebagai Paket Hadiah / Hampers Khas Nusantara
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#003d29]">+{formatCurrency(GIFT_WRAP_COST)}</span>
              </div>

              <label className="flex items-start gap-3 p-3.5 bg-[#FAF9F5] border border-gray-200 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={giftDetails.isGiftWrap}
                  onChange={(e) => setGiftDetails({ isGiftWrap: e.target.checked })}
                  className="mt-0.5 rounded text-[#003d29] focus:ring-[#003d29] w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Ya, tambahkan kemasan hampers eksklusif & kartu ucapan kustom
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5 leading-relaxed">
                    Sangat cocok untuk kiriman cinderamata bagi sahabat, kerabat, atau relasi bisnis.
                  </span>
                </div>
              </label>

              {giftDetails.isGiftWrap && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      Pilihan Wadah Kemasan:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setGiftDetails({ packagingType: 'besek' })}
                        className={`p-3 rounded-xl border text-left transition-all text-xs ${
                          giftDetails.packagingType === 'besek'
                            ? 'border-[#003d29] bg-[#FAF9F5] font-bold text-[#003d29] ring-1 ring-[#003d29]'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="block font-bold">Besek Tradisional</span>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          Anyaman Bambu Natural & Pita Etnik
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGiftDetails({ packagingType: 'hardbox' })}
                        className={`p-3 rounded-xl border text-left transition-all text-xs ${
                          giftDetails.packagingType === 'hardbox'
                            ? 'border-[#003d29] bg-[#FAF9F5] font-bold text-[#003d29] ring-1 ring-[#003d29]'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="block font-bold">Hardbox Eksklusif</span>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          Kotak Tebal Hijau Nusantara & Pita Satin Emas
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Nama Pengirim (di kartu ucapan)
                      </label>
                      <input
                        type="text"
                        value={giftDetails.senderName}
                        onChange={(e) => setGiftDetails({ senderName: e.target.value })}
                        placeholder="Contoh: Keluarga Budi"
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-[#003d29] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Nama Penerima (di kartu ucapan)
                      </label>
                      <input
                        type="text"
                        value={giftDetails.recipientName}
                        onChange={(e) => setGiftDetails({ recipientName: e.target.value })}
                        placeholder="Contoh: Sahabatku Maya"
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-[#003d29] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Pesan Kartu Ucapan
                    </label>
                    <textarea
                      rows={2}
                      value={giftDetails.message}
                      onChange={(e) => setGiftDetails({ message: e.target.value })}
                      placeholder="Tuliskan ucapan kado hangat untuk penerima..."
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:border-[#003d29] outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Payment Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-6 sticky top-28">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Ringkasan Tagihan
              </h2>

              {/* Coupon / Voucher Code Box */}
              <div className="p-3.5 bg-[#FAF9F5] border border-dashed border-gray-300 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#003d29] mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Kupon & Voucher Belanja</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                      <div>
                        <span className="text-xs font-bold text-emerald-800 tracking-wider font-mono">
                          {appliedCoupon.code}
                        </span>
                        <p className="text-[11px] text-emerald-700">
                          {appliedCoupon.description} (-{formatCurrency(appliedCoupon.discountType === 'SHIPPING' ? rawShippingCost : couponDiscount)})
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
                        placeholder="Contoh: NUSANTARA"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#003d29] uppercase font-mono font-bold tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-4 py-2.5 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
                      >
                        Gunakan
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                    )}

                    <div className="pt-1">
                      <p className="text-[10px] text-gray-400 mb-1 font-medium">Pilih voucher langsung:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_COUPONS.map((cp) => (
                          <button
                            key={cp.code}
                            type="button"
                            onClick={() => handleApplyCoupon(cp.code)}
                            className="text-[10px] font-mono font-bold px-2 py-1 bg-white hover:bg-[#FCF0E4] hover:text-[#003d29] text-gray-700 rounded transition-colors border border-gray-200"
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

              {/* Payment Details */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-900 block">
                  Pilih Cara Pembayaran
                </label>

                {/* Option 1: Cash on Delivery */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === PaymentMethod.CASH_ON_DELIVERY
                      ? 'border-[#003d29] bg-[#F5F6F6] text-gray-900 ring-1 ring-[#003d29]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={PaymentMethod.CASH_ON_DELIVERY}
                    {...register('paymentMethod')}
                    className="mt-0.5 text-[#003d29] focus:ring-[#003d29]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#003d29]" />
                      <span className="text-xs font-bold text-gray-900">
                        Bayar di Tempat (COD)
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 block mt-1 leading-relaxed">
                      Bayar tunai aman kepada kurir saat paket oleh-oleh tiba di depan pintu rumahmu.
                    </span>
                  </div>
                </label>

                {/* Option 2: Manual Bank Transfer */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === PaymentMethod.MANUAL_BANK_TRANSFER
                      ? 'border-[#003d29] bg-[#F5F6F6] text-gray-900 ring-1 ring-[#003d29]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={PaymentMethod.MANUAL_BANK_TRANSFER}
                    {...register('paymentMethod')}
                    className="mt-0.5 text-[#003d29] focus:ring-[#003d29]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#003d29]" />
                      <span className="text-xs font-bold text-gray-900">
                        Transfer Bank Manual (BCA / Mandiri / BNI)
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 block mt-1 leading-relaxed">
                      Kirim transfer manual ke rekening resmi toko. Status bayar dapat diverifikasi setelah checkout.
                    </span>

                    {/* Bank Account Details Card when selected */}
                    {selectedPaymentMethod === PaymentMethod.MANUAL_BANK_TRANSFER && (
                      <div className="mt-3 p-3 bg-white border border-gray-200 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center text-gray-700">
                          <span className="font-semibold">Bank BCA:</span>
                          <span className="font-bold text-gray-900">873-019-2819</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700">
                          <span className="font-semibold">Bank Mandiri:</span>
                          <span className="font-bold text-gray-900">137-00-1928-1122</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700">
                          <span className="font-semibold">Bank BNI:</span>
                          <span className="font-bold text-gray-900">092-182-3819</span>
                        </div>
                        <p className="text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                          Atas Nama: <strong className="text-gray-800">PT Oleh Oleh Nusantara</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Belanja</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Ongkir ({activeCourier.name} - {activeCourier.service.split('(')[0].trim()})</span>
                  <span className="font-semibold text-gray-900">
                    {effectiveShippingCost === 0 ? (
                      <span className="text-[#003d29] font-bold">GRATIS ONGKIR</span>
                    ) : (
                      formatCurrency(effectiveShippingCost)
                    )}
                  </span>
                </div>

                {giftCost > 0 && (
                  <div className="flex justify-between text-[#003d29] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#003d29]" />
                      <span>Kemasan Hampers & Kartu Ucapan</span>
                    </span>
                    <span>+{formatCurrency(giftCost)}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between text-[#003d29] font-semibold">
                    <span>Diskon Kupon ({appliedCoupon.code})</span>
                    <span>
                      -{formatCurrency(
                        appliedCoupon.discountType === 'SHIPPING' ? rawShippingCost : couponDiscount
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-3 border-t border-gray-200 text-sm font-bold text-gray-900">
                  <span>Total Tagihan</span>
                  <span className="text-xl font-bold text-[#003d29]">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Memproses Pesanan Kamu...</span>
                ) : (
                  <span>Konfirmasi & Buat Pesanan</span>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#003d29]" />
                  <span>Jaminan garansi produk asli & pengemasan higienis</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
