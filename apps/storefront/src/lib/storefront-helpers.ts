// Storefront helper utilities for Indonesian Nusantara marketplace features

export interface ProductOrigin {
  city: string;
  province: string;
  badge: string;
}

export function getProductOrigin(product: {
  title?: string;
  description?: string;
  slug?: string;
}): ProductOrigin {
  const text = `${product.title || ''} ${product.description || ''} ${product.slug || ''}`.toLowerCase();

  if (text.includes('jogja') || text.includes('yogyakarta') || text.includes('imogiri') || text.includes('kasongan')) {
    return { city: 'Yogyakarta', province: 'DI Yogyakarta', badge: '📍 Yogyakarta' };
  }
  if (text.includes('bali') || text.includes('denpasar') || text.includes('dewata')) {
    return { city: 'Bali', province: 'Bali', badge: '📍 Bali' };
  }
  if (text.includes('bandung') || text.includes('kartika sari') || text.includes('harum manis')) {
    return { city: 'Bandung', province: 'Jawa Barat', badge: '📍 Bandung' };
  }
  if (text.includes('medan') || text.includes('bika ambon') || text.includes('bolu meranti')) {
    return { city: 'Medan', province: 'Sumatera Utara', badge: '📍 Medan' };
  }
  if (text.includes('solo') || text.includes('surakarta') || text.includes('laweyan')) {
    return { city: 'Solo', province: 'Jawa Tengah', badge: '📍 Solo' };
  }
  if (text.includes('malang') || text.includes('apel')) {
    return { city: 'Malang', province: 'Jawa Timur', badge: '📍 Malang' };
  }
  if (text.includes('palembang') || text.includes('pempek') || text.includes('cuko')) {
    return { city: 'Palembang', province: 'Sumatera Selatan', badge: '📍 Palembang' };
  }
  if (text.includes('padang') || text.includes('rendang') || text.includes('payakumbuh')) {
    return { city: 'Padang', province: 'Sumatera Barat', badge: '📍 Padang' };
  }
  if (text.includes('surabaya') || text.includes('bu rudy') || text.includes('almond')) {
    return { city: 'Surabaya', province: 'Jawa Timur', badge: '📍 Surabaya' };
  }
  if (text.includes('aceh') || text.includes('gayo')) {
    return { city: 'Aceh', province: 'Aceh', badge: '📍 Aceh' };
  }
  if (text.includes('garut') || text.includes('dodol')) {
    return { city: 'Garut', province: 'Jawa Barat', badge: '📍 Garut' };
  }
  if (text.includes('bogor') || text.includes('lapis talas')) {
    return { city: 'Bogor', province: 'Jawa Barat', badge: '📍 Bogor' };
  }
  if (text.includes('jepara') || text.includes('troso')) {
    return { city: 'Jepara', province: 'Jawa Tengah', badge: '📍 Jepara' };
  }
  if (text.includes('toraja')) {
    return { city: 'Toraja', province: 'Sulawesi Selatan', badge: '📍 Toraja' };
  }
  if (text.includes('bangka') || text.includes('getas')) {
    return { city: 'Bangka', province: 'Kep. Bangka Belitung', badge: '📍 Bangka' };
  }
  if (text.includes('cirebon') || text.includes('megamendung')) {
    return { city: 'Cirebon', province: 'Jawa Barat', badge: '📍 Cirebon' };
  }
  if (text.includes('samarinda')) {
    return { city: 'Samarinda', province: 'Kalimantan Timur', badge: '📍 Samarinda' };
  }
  if (text.includes('lampung')) {
    return { city: 'Lampung', province: 'Lampung', badge: '📍 Lampung' };
  }
  if (text.includes('lombok')) {
    return { city: 'Lombok', province: 'Nusa Tenggara Barat', badge: '📍 Lombok' };
  }
  if (text.includes('jakarta') || text.includes('betawi') || text.includes('batavia')) {
    return { city: 'Jakarta', province: 'DKI Jakarta', badge: '📍 Jakarta' };
  }

  return { city: 'Nusantara', province: 'Indonesia', badge: '📍 Nusantara' };
}

export const NUSANTARA_ORIGIN_TABS = [
  { id: '', label: 'Semua Nusantara', city: '' },
  { id: 'Jogja', label: 'Yogyakarta', city: 'Jogja' },
  { id: 'Bali', label: 'Bali', city: 'Bali' },
  { id: 'Bandung', label: 'Bandung', city: 'Bandung' },
  { id: 'Medan', label: 'Medan', city: 'Medan' },
  { id: 'Solo', label: 'Solo', city: 'Solo' },
  { id: 'Malang', label: 'Malang', city: 'Malang' },
  { id: 'Palembang', label: 'Palembang', city: 'Palembang' },
  { id: 'Padang', label: 'Padang', city: 'Padang' },
  { id: 'Surabaya', label: 'Surabaya', city: 'Surabaya' },
  { id: 'Aceh', label: 'Aceh', city: 'Aceh' },
];

// Courier Shipping Estimator Rates
export interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  cost: number;
  etd: string;
  badge?: string;
  logo: string;
}

export const DESTINATION_CITIES = [
  { id: 'jakarta', name: 'DKI Jakarta (Jabodetabek)', baseMultiplier: 1.0 },
  { id: 'bandung', name: 'Bandung & Sekitarnya', baseMultiplier: 1.1 },
  { id: 'yogyakarta', name: 'DI Yogyakarta', baseMultiplier: 1.0 },
  { id: 'semarang', name: 'Semarang (Jawa Tengah)', baseMultiplier: 1.1 },
  { id: 'surabaya', name: 'Surabaya & Jawa Timur', baseMultiplier: 1.15 },
  { id: 'denpasar', name: 'Denpasar & Bali', baseMultiplier: 1.3 },
  { id: 'medan', name: 'Medan & Sumatera Utara', baseMultiplier: 1.45 },
  { id: 'palembang', name: 'Palembang (Sumsel)', baseMultiplier: 1.35 },
  { id: 'padang', name: 'Padang (Sumbar)', baseMultiplier: 1.4 },
  { id: 'makassar', name: 'Makassar (Sulsel)', baseMultiplier: 1.6 },
  { id: 'balikpapan', name: 'Balikpapan / Samarinda', baseMultiplier: 1.65 },
];

export function calculateShippingOptions(
  subtotal: number,
  cityId = 'jakarta',
): ShippingOption[] {
  const city = DESTINATION_CITIES.find((c) => c.id === cityId) || DESTINATION_CITIES[0];
  const mult = city.baseMultiplier;
  const isFreeEligible = subtotal >= 150000;

  return [
    {
      id: 'jne-reg',
      courier: 'JNE Express',
      service: 'Reguler (REG)',
      cost: isFreeEligible ? 0 : Math.round(18000 * mult / 1000) * 1000,
      etd: '2 - 3 Hari Kerja',
      badge: isFreeEligible ? 'Gratis Ongkir' : 'Populer',
      logo: '📦',
    },
    {
      id: 'jne-yes',
      courier: 'JNE Express',
      service: 'YES (Yakin Esok Sampai)',
      cost: Math.round(32000 * mult / 1000) * 1000,
      etd: '1 Hari (Esok Tiba)',
      badge: 'Kilat Prioritas',
      logo: '⚡',
    },
    {
      id: 'jnt-ez',
      courier: 'J&T Express',
      service: 'EZ Standard',
      cost: isFreeEligible ? 0 : Math.round(19000 * mult / 1000) * 1000,
      etd: '2 - 3 Hari Kerja',
      badge: isFreeEligible ? 'Gratis Ongkir' : undefined,
      logo: '🚚',
    },
    {
      id: 'sicepat-best',
      courier: 'SiCepat',
      service: 'BEST (Besok Sampai Tujuan)',
      cost: Math.round(25000 * mult / 1000) * 1000,
      etd: '1 - 2 Hari Kerja',
      badge: 'Rekomendasi Kudapan',
      logo: '🛡️',
    },
  ];
}

// WhatsApp Order Integration
export const OFFICIAL_WA_NUMBER = '6281234567890';

export function createProductWhatsAppUrl({
  productTitle,
  variantTitle,
  quantity,
  unitPrice,
  slug,
}: {
  productTitle: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: number;
  slug?: string;
}): string {
  const total = quantity * unitPrice;
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(total);

  const productUrl = typeof window !== 'undefined' && slug ? `${window.location.origin}/products/${slug}` : '';

  const message = `Halo Onestore Oleh-oleh Nusantara! 👋

Saya ingin memesan langsung produk berikut:
📦 *${productTitle}*
🏷️ *Varian/Rasa:* ${variantTitle || 'Standar'}
🔢 *Jumlah:* ${quantity} pcs
💰 *Estimasi Total:* ${formattedTotal}
${productUrl ? `🔗 *Link Produk:* ${productUrl}\n` : ''}
Mohon info ketersediaan stok & estimasi ongkir ke kota saya ya kak. Terima kasih! 🙏`;

  return `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function createCartWhatsAppUrl({
  items,
  grandTotal,
}: {
  items: Array<{
    productTitle: string;
    variantTitle?: string;
    quantity: number;
    unitPrice: number;
  }>;
  grandTotal: number;
}): string {
  const formattedGrandTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(grandTotal);

  const itemsList = items
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.productTitle}* (${it.variantTitle || 'Standar'}) x ${it.quantity} pcs`,
    )
    .join('\n');

  const message = `Halo Onestore Nusantara! 👋

Saya ingin memesan keranjang belanja berikut:

${itemsList}

💰 *Total Pembelian:* ${formattedGrandTotal}

Mohon bantu proses pesanan & kirimkan nomor rekening / QRIS pembayarannya ya. Terima kasih banyak! 🙏`;

  return `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Authentic Customer Reviews & Testimonials
export interface CustomerReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  variant: string;
  content: string;
  helpfulCount: number;
  verified: boolean;
  avatarBg: string;
}

export const SAMPLE_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Dewi Lestari',
    city: 'Surabaya',
    rating: 5,
    date: '3 hari yang lalu',
    variant: 'Original / Kemasan Standar',
    content:
      'Alhamdulillah paket tiba dalam kondisi sangat prima! Packing bubble wrap-nya tebal banget jadi makanan tidak hancur sama sekali di jalan. Rasanya otentik khas daerah, mirip persis saat dulu beli langsung di tokonya. Pasti langganan di sini!',
    helpfulCount: 24,
    verified: true,
    avatarBg: 'bg-emerald-700',
  },
  {
    id: 'rev-2',
    author: 'Budi Santoso',
    city: 'Jakarta Selatan',
    rating: 5,
    date: '1 minggu yang lalu',
    variant: 'Kotak Isi 10 Pcs',
    content:
      'Pengiriman kilat via JNE YES, kemarin pesan siang ini sudah mendarat di kantor. Masih fresh dan wangi khasnya kecium. Buat buah tangan rekan kantor pas banget, pada nanya beli di mana.',
    helpfulCount: 18,
    verified: true,
    avatarBg: 'bg-[#003d29]',
  },
  {
    id: 'rev-3',
    author: 'Siti Rahmawati',
    city: 'Bandung',
    rating: 5,
    date: '2 minggu yang lalu',
    variant: 'Premium Pilihan',
    content:
      'Senang banget nemu toko yang kurasi oleh-oleh Nusantara selengkap ini. Kualitas barang terjamin asli, tanggal kadaluarsanya juga masih panjang. Admin via WhatsApp-nya sangat ramah dan responsif pas nanya ongkir.',
    helpfulCount: 12,
    verified: true,
    avatarBg: 'bg-teal-700',
  },
  {
    id: 'rev-4',
    author: 'Hendra Wijaya',
    city: 'Semarang',
    rating: 4,
    date: '3 minggu yang lalu',
    variant: 'Standar Toko',
    content:
      'Kualitas produk juara, tekstur dan bumbunya nendang. Sedikit catatan untuk kurir agar lebih hati-hati saat meletakkan paket di pagar, tapi secara keseluruhan puas dengan layanan Onestore.',
    helpfulCount: 9,
    verified: true,
    avatarBg: 'bg-slate-700',
  },
];
