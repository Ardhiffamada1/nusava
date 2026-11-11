export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'FIXED' | 'PERCENT' | 'SHIPPING';
  value: number; // e.g. 20000 or 10 or 50
  minPurchase: number;
  maxDiscount?: number;
  badge: string;
}

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'NUSANTARA',
    title: 'Diskon Spesial Nusantara',
    description: 'Potongan Rp 20.000 untuk semua pilihan oleh-oleh khas daerah.',
    discountType: 'FIXED',
    value: 20000,
    minPurchase: 100000,
    badge: 'HEMAT RP 20RB',
  },
  {
    code: 'ONGKIRGRATIS',
    title: 'Voucher Bebas Ongkir',
    description: 'Potongan ongkos kirim kurir s/d Rp 18.000 ke seluruh Indonesia.',
    discountType: 'SHIPPING',
    value: 18000,
    minPurchase: 75000,
    badge: 'BEBAS ONGKIR',
  },
  {
    code: 'DISKON50',
    title: 'Diskon Kilat 50% Pengrajin',
    description: 'Diskon 50% maksimal potongan Rp 50.000 belanja pertama.',
    discountType: 'PERCENT',
    value: 50,
    minPurchase: 50000,
    maxDiscount: 50000,
    badge: 'DISKON 50%',
  },
  {
    code: 'OLEHOLEH10',
    title: 'Promo Spesial Oleh-oleh 10%',
    description: 'Potongan 10% tanpa batas untuk aneka oleh-oleh, kopi, dan camilan Nusantara.',
    discountType: 'PERCENT',
    value: 10,
    minPurchase: 0,
    badge: 'DISKON 10%',
  },
  {
    code: 'KUDAPAN10',
    title: 'Promo Spesial Oleh-oleh 10%',
    description: 'Potongan 10% tanpa batas untuk aneka oleh-oleh, kopi, dan camilan Nusantara.',
    discountType: 'PERCENT',
    value: 10,
    minPurchase: 0,
    badge: 'DISKON 10%',
  },
];

export function validateAndApplyCoupon({
  code,
  subtotal,
  shippingCost = 0,
}: {
  code: string;
  subtotal: number;
  shippingCost?: number;
}): { success: boolean; discount: number; coupon?: Coupon; error?: string } {
  const normalized = code.trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS.find((c) => c.code === normalized);

  if (!coupon) {
    return {
      success: false,
      discount: 0,
      error: `Kode kupon "${code}" tidak ditemukan. Coba gunakan NUSANTARA atau DISKON50.`,
    };
  }

  if (subtotal < coupon.minPurchase) {
    const needed = coupon.minPurchase - subtotal;
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(needed);

    return {
      success: false,
      discount: 0,
      error: `Minimal belanja untuk kupon ${coupon.code} adalah ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(coupon.minPurchase)}. Tambah ${formatted} lagi!`,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'FIXED') {
    discount = Math.min(coupon.value, subtotal);
  } else if (coupon.discountType === 'SHIPPING') {
    discount = Math.min(coupon.value, shippingCost > 0 ? shippingCost : coupon.value);
  } else if (coupon.discountType === 'PERCENT') {
    const rawDiscount = (subtotal * coupon.value) / 100;
    discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
  }

  return {
    success: true,
    discount: Math.round(discount),
    coupon,
  };
}
