'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { apiRequest } from '../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { PaymentMethod } from '@commerceos/contracts';
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
  const { items, subtotal, fetchCart, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch saved user addresses if user is logged in
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

  // Ongkir Gratis di atas Rp 200.000, jika di bawah Rp 20.000
  const shippingCost = subtotal >= 200000 || subtotal === 0 ? 0 : 20000;
  const discount = couponApplied ? 20000 : 0;
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
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
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
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-100">
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
          </div>

          {/* Right Column: Order Summary & Payment Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-6 sticky top-28">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Ringkasan Tagihan
              </h2>

              {/* Coupon / Voucher Code input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="KODE KUPON (Contoh: NUSANTARA)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 bg-[#F9FAFA] border border-gray-200 rounded-xl outline-none focus:border-[#003d29] uppercase font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (couponCode.trim()) {
                      setCouponApplied(true);
                      alert('Selamat! Kupon diskon Rp 20.000 berhasil digunakan.');
                    }
                  }}
                  className="px-4 py-2.5 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Gunakan
                </button>
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
                      ? 'border-[#003d29] bg-emerald-50/40 text-gray-900 ring-1 ring-[#003d29]'
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
                      ? 'border-[#003d29] bg-emerald-50/40 text-gray-900 ring-1 ring-[#003d29]'
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
                      <div className="mt-3 p-3 bg-white border border-emerald-200 rounded-xl space-y-2 text-xs">
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
                  <span>Biaya Pengiriman Kurir</span>
                  <span className="font-semibold text-gray-900">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-bold">GRATIS ONGKIR</span>
                    ) : (
                      formatCurrency(shippingCost)
                    )}
                  </span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Potongan Kupon Promo</span>
                    <span>-{formatCurrency(discount)}</span>
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
                className="w-full py-4 px-6 bg-[#003d29] hover:bg-[#002b1d] text-white text-sm font-bold rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Memproses Pesanan Kamu...</span>
                ) : (
                  <span>Konfirmasi & Buat Pesanan</span>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
