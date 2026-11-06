'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Check, ShieldCheck, Truck, CreditCard, Banknote, Building, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { formatCurrency } from '@commerceos/ui';
import { PaymentMethod } from '@commerceos/contracts';

const CheckoutFormSchema = z.object({
  shippingAddressId: z.string().optional(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  streetAddress: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State or province is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').default('US'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().max(500).optional(),
});

type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, fetchCart } = useCartStore();
  const { user, isLoading: isAuthLoading } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      country: 'US',
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');
  const selectedAddressId = watch('shippingAddressId');

  useEffect(() => {
    if (defaultAddress) {
      setValue('shippingAddressId', defaultAddress.id);
      setValue('fullName', defaultAddress.fullName);
      setValue('phone', defaultAddress.phone);
      setValue('streetAddress', defaultAddress.streetAddress);
      setValue('city', defaultAddress.city);
      setValue('state', defaultAddress.state);
      setValue('postalCode', defaultAddress.postalCode);
      setValue('country', defaultAddress.country);
    }
  }, [defaultAddress, setValue]);

  const shippingCost = subtotal >= 150 ? 0 : 15;
  const grandTotal = subtotal + shippingCost;

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload: any = {
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      };

      if (data.shippingAddressId) {
        payload.shippingAddressId = data.shippingAddressId;
      } else {
        payload.newAddress = {
          fullName: data.fullName,
          phone: data.phone,
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        };
      }

      const order = await apiRequest<any>('/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Refresh cart store
      await fetchCart();

      // Redirect to confirmation view
      router.push(`/checkout/success/${order.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed. Please check stock and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthLoading && !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <ShieldCheck className="w-8 h-8 text-ink mx-auto mb-4" />
        <h1 className="text-xl font-light text-ink">Authentication Required</h1>
        <p className="text-xs text-ink-secondary mt-2 mb-6">
          To ensure transactional order history and verified shipping dispatch, please sign in or create an account.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login?redirect=/checkout"
            className="text-xs font-semibold uppercase tracking-wider bg-ink text-white px-5 py-2.5 rounded-xs hover:bg-ink/90 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register?redirect=/checkout"
            className="text-xs font-semibold uppercase tracking-wider border border-border px-5 py-2.5 rounded-xs hover:bg-muted transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="border-b border-border pb-6 mb-8 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-ink-secondary">Transaction Gateway</span>
          <h1 className="text-2xl md:text-3xl font-light text-ink tracking-tight mt-1">Checkout</h1>
        </div>
        <Link href="/cart" className="text-xs text-ink-secondary hover:text-ink flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Bag</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form: Address & Payment */}
        <div className="lg:col-span-7 space-y-10">
          {/* Section 1: Shipping Address */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">
                1. Shipping Address
              </h2>
              {addresses && addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setValue('shippingAddressId', undefined)}
                  className="text-[11px] text-ink-secondary hover:text-ink underline"
                >
                  Enter new address
                </button>
              )}
            </div>

            {/* Existing Saved Addresses */}
            {addresses && addresses.length > 0 && (
              <div className="space-y-2 mb-6">
                {addresses.map((addr) => {
                  const isChecked = selectedAddressId === addr.id;
                  return (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 border rounded-xs cursor-pointer transition-colors ${
                        isChecked ? 'border-ink bg-surface' : 'border-border hover:border-ink/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="addressRadio"
                        checked={isChecked}
                        onChange={() => {
                          setValue('shippingAddressId', addr.id);
                          setValue('fullName', addr.fullName);
                          setValue('phone', addr.phone);
                          setValue('streetAddress', addr.streetAddress);
                          setValue('city', addr.city);
                          setValue('state', addr.state);
                          setValue('postalCode', addr.postalCode);
                          setValue('country', addr.country);
                        }}
                        className="mt-0.5 text-ink"
                      />
                      <div className="text-xs">
                        <p className="font-medium text-ink">{addr.fullName} <span className="text-ink-tertiary">({addr.phone})</span></p>
                        <p className="text-ink-secondary mt-0.5">{addr.streetAddress}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Address Input Fields */}
            {(!addresses || addresses.length === 0 || !selectedAddressId) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1.5">Full Name</label>
                  <input
                    {...register('fullName')}
                    className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
                    placeholder="e.g. Elena Rostova"
                  />
                  {errors.fullName && <p className="text-[10px] text-rose-600 mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1.5">Phone Number</label>
                  <input
                    {...register('phone')}
                    className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
                    placeholder="+1 555-019-2831"
                  />
                  {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1.5">Country</label>
                  <select
                    {...register('country')}
                    className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
                  >
                    <option value="US">United States (US)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="JP">Japan (JP)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1.5">Street Address</label>
                  <input
                    {...register('streetAddress')}
                    className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
                    placeholder="742 Evergreen Terrace"
                  />
                  {errors.streetAddress && <p className="text-[10px] text-rose-600 mt-1">{errors.streetAddress.message}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1.5">City</label>
                  <input
                    {...register('city')}
                    className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
                    placeholder="Portland"
                  />
                  {errors.city && <p className="text-[10px] text-rose-600 mt-1">{errors.city.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1.5">State</label>
                    <input
                      {...register('state')}
                      className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
                      placeholder="OR"
                    />
                    {errors.state && <p className="text-[10px] text-rose-600 mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1.5">Postal Code</label>
                    <input
                      {...register('postalCode')}
                      className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
                      placeholder="97201"
                    />
                    {errors.postalCode && <p className="text-[10px] text-rose-600 mt-1">{errors.postalCode.message}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">
                2. Payment Method (Demo)
              </h2>
              <span className="text-[11px] text-ink-tertiary">Payment gateway out of scope</span>
            </div>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 border rounded-xs cursor-pointer transition-colors ${
                  selectedPaymentMethod === PaymentMethod.CASH_ON_DELIVERY
                    ? 'border-ink bg-surface'
                    : 'border-border hover:border-ink/40'
                }`}
              >
                <input
                  type="radio"
                  value={PaymentMethod.CASH_ON_DELIVERY}
                  {...register('paymentMethod')}
                  className="mt-0.5 text-ink"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-ink" />
                    <span className="font-semibold text-ink">Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-ink-secondary mt-1">
                    Pay in cash upon physical receipt and verification at your shipping address. Order is placed with pending settlement.
                  </p>
                </div>
              </label>

              {/* Manual Bank Transfer */}
              <label
                className={`flex items-start gap-3 p-4 border rounded-xs cursor-pointer transition-colors ${
                  selectedPaymentMethod === PaymentMethod.MANUAL_BANK_TRANSFER
                    ? 'border-ink bg-surface'
                    : 'border-border hover:border-ink/40'
                }`}
              >
                <input
                  type="radio"
                  value={PaymentMethod.MANUAL_BANK_TRANSFER}
                  {...register('paymentMethod')}
                  className="mt-0.5 text-ink"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-ink" />
                    <span className="font-semibold text-ink">Manual Bank Transfer (Demo)</span>
                  </div>
                  <p className="text-ink-secondary mt-1">
                    Direct wire transfer to CommerceOS treasury. Orders are marked PENDING and manually confirmed by admin in the console.
                  </p>
                  {selectedPaymentMethod === PaymentMethod.MANUAL_BANK_TRANSFER && (
                    <div className="mt-3 p-3 bg-white border border-border text-[11px] space-y-1 font-mono text-ink-secondary">
                      <p>Bank: CommerceOS Treasury Ltd</p>
                      <p>Account: 8849-0192-3810</p>
                      <p>Routing / SWIFT: CMOSUS33</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Order Instructions */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1.5">
              Delivery Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full text-xs p-3 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
              placeholder="e.g. Leave package by side gate, ring bell."
            />
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-5 bg-surface border border-border p-6 rounded-xs sticky top-24">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink mb-6">
            Order Review ({items.length} Items)
          </h2>

          <div className="divide-y divide-border/60 max-h-72 overflow-y-auto mb-6">
            {items.map((it) => (
              <div key={it.id} className="py-3 flex gap-3 items-center first:pt-0 last:pb-0">
                <div className="relative w-12 h-14 bg-muted shrink-0 overflow-hidden border border-border/50">
                  {it.imageUrl && (
                    <Image
                      src={it.imageUrl}
                      alt={it.productTitle}
                      fill
                      className="object-cover object-center"
                      sizes="48px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-medium text-ink truncate">{it.productTitle}</p>
                  <p className="text-[11px] text-ink-secondary">{it.variantTitle} × {it.quantity}</p>
                </div>
                <span className="text-xs font-mono text-ink">{formatCurrency(it.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-xs divide-y divide-border/60 border-t border-border pt-4">
            <div className="flex justify-between text-ink-secondary pt-1">
              <span>Subtotal</span>
              <span className="font-mono text-ink">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-ink-secondary pt-3">
              <span>Shipping</span>
              <span className="font-mono text-ink">
                {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
              </span>
            </div>

            <div className="flex justify-between text-ink font-medium text-sm pt-4">
              <span>Grand Total</span>
              <span className="font-mono">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full mt-6 bg-ink text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-xs hover:bg-ink/90 disabled:opacity-30 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Processing Transaction...' : `Authorize & Place Order`}</span>
          </button>

          <p className="text-[11px] text-ink-tertiary text-center mt-3 leading-relaxed">
            Payment will be marked PENDING until physical delivery or demo admin confirmation.
          </p>
        </div>
      </form>
    </div>
  );
}
