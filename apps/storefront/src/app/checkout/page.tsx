'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  AlertCircle,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { formatCurrency } from '@commerceos/ui';
import { PaymentMethod } from '@commerceos/contracts';

const CheckoutFormSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
  phone: z.string().min(6, 'Nomor HP/WhatsApp aktif wajib diisi'),
  streetAddress: z.string().min(3, 'Alamat lengkap pengiriman wajib diisi'),
  city: z.string().min(2, 'Kota atau Kabupaten wajib diisi'),
  state: z.string().min(2, 'Provinsi wajib diisi'),
  postalCode: z.string().min(2, 'Kode pos wajib diisi'),
  country: z.string().default('ID'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().max(500).optional(),
});

type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

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

  const shippingCost = subtotal >= 150 ? 0 : 15;
  const discount = couponApplied ? 10 : 0;
  const grandTotal = Math.max(0, subtotal + shippingCost - discount);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      setErrorMessage('Keranjang belanja kamu masih kosong.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      let order: any;

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
          notes: data.notes || '',
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
          notes: data.notes,
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

      await fetchCart();
      router.push(`/checkout/success/${order.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses pesanan. Silakan periksa kembali formulir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center font-sans">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-500">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Keranjang Masih Kosong</h1>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          Kamu belum memilih oleh-oleh atau produk untuk dibeli.
        </p>
        <Link
          href="/products"
          className="inline-flex px-6 py-3 bg-[#003d29] text-white text-xs font-bold rounded-full hover:bg-[#002b1d] transition-colors"
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
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold block mb-0.5">
            PROSES PEMBAYARAN CEPAT
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Checkout Pesanan
          </h1>
        </div>

        <Link
          href="/cart"
          className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Keranjang</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Review & Delivery + Right Order Summary (Matches uploaded Shopcart reference) */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (Review Item and Shipping + Delivery Information) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Review Item and Shipping */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-gray-900">
                1. Rincian Produk & Pengiriman
              </h2>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-[#F5F6F6] rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.productTitle}
                            fill
                            className="object-contain p-1.5"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block line-clamp-1">
                          {item.productTitle}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {item.variantTitle} • Qty: {item.quantity}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold font-mono text-gray-900">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Delivery Information (Guest-friendly: Direct Form) */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    2. Informasi Penerima & Alamat Pengiriman
                  </h2>
                  {!user && (
                    <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                      ✓ Belanja langsung tanpa perlu mendaftar atau login
                    </span>
                  )}
                </div>
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
                    <span className="text-[10px] text-rose-500 mt-0.5 block">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Alamat Email (Untuk Tanda Terima)
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="budi@example.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                  />
                  {errors.email && (
                    <span className="text-[10px] text-rose-500 mt-0.5 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Nomor WhatsApp / HP Aktif
                </label>
                <input
                  {...register('phone')}
                  placeholder="081234567890"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                />
                {errors.phone && (
                  <span className="text-[10px] text-rose-500 mt-0.5 block">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Alamat Lengkap Pengiriman (Jalan, No. Rumah, RT/RW, Kelurahan/Kecamatan)
                </label>
                <textarea
                  {...register('streetAddress')}
                  rows={2}
                  placeholder="Jl. Malioboro No. 45, RT 02/RW 03, Sosromenduran"
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                />
                {errors.streetAddress && (
                  <span className="text-[10px] text-rose-500 mt-0.5 block">
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
                    <span className="text-[10px] text-rose-500 mt-0.5 block">
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
                    <span className="text-[10px] text-rose-500 mt-0.5 block">
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
                    className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all font-mono"
                  />
                  {errors.postalCode && (
                    <span className="text-[10px] text-rose-500 mt-0.5 block">
                      {errors.postalCode.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Catatan Untuk Kurir (Opsional)
                </label>
                <input
                  {...register('notes')}
                  placeholder="Titipkan ke satpam jika rumah kosong, pagar hitam..."
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 focus:bg-white focus:border-[#003d29] rounded-xl outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment Details (From uploaded Shopcart reference) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-6 sticky top-28">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Ringkasan Pesanan
              </h2>

              {/* Coupon / Voucher Code input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kode Kupon Promo"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 rounded-xl outline-none focus:border-[#003d29] uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (couponCode.trim()) {
                      setCouponApplied(true);
                      alert('Kupon diskon Rp 10.00 berhasil dipasang!');
                    }
                  }}
                  className="px-4 py-2.5 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Terapkan
                </button>
              </div>

              {/* Payment Details (Methods from reference) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-900 block">
                  Metode Pembayaran
                </label>

                {/* Option 1: Cash on Delivery */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === PaymentMethod.CASH_ON_DELIVERY
                      ? 'border-[#003d29] bg-emerald-50/40 text-gray-900'
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
                    <span className="text-xs font-bold text-gray-900 block">
                      Bayar di Tempat (COD)
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      Bayar tunai aman ke kurir saat paket oleh-oleh tiba di rumahmu.
                    </span>
                  </div>
                </label>

                {/* Option 2: Manual Bank Transfer */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPaymentMethod === PaymentMethod.MANUAL_BANK_TRANSFER
                      ? 'border-[#003d29] bg-emerald-50/40 text-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={PaymentMethod.MANUAL_BANK_TRANSFER}
                    {...register('paymentMethod')}
                    className="mt-0.5 text-[#003d29] focus:ring-[#003d29]"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Transfer Bank Manual (Demo BNI / BCA)
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      Kirim bukti transfer untuk verifikasi pembayaran manual.
                    </span>
                  </div>
                </label>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Belanja</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Biaya Pengiriman</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {shippingCost === 0 ? 'GRATIS' : formatCurrency(shippingCost)}
                  </span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Potongan Kupon</span>
                    <span className="font-mono">-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-3 border-t border-gray-200 text-sm font-extrabold text-gray-900">
                  <span>Total Bayar</span>
                  <span className="text-lg font-mono text-[#003d29]">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Submit CTA Button (Big Dark Green #003d29) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 hover:scale-102 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <span>Bayar Sekarang (Pesan Sekarang)</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-[10px] text-gray-400">
                  🔒 Transaksi aman & terlindungi garansi keaslian pengrajin
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
