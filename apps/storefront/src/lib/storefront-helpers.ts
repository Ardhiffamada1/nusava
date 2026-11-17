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
    return { city: 'Yogyakarta', province: 'DI Yogyakarta', badge: 'Khas Yogyakarta' };
  }
  if (text.includes('bali') || text.includes('denpasar') || text.includes('dewata')) {
    return { city: 'Bali', province: 'Bali', badge: 'Khas Bali' };
  }
  if (text.includes('bandung') || text.includes('kartika sari') || text.includes('harum manis')) {
    return { city: 'Bandung', province: 'Jawa Barat', badge: 'Khas Bandung' };
  }
  if (text.includes('medan') || text.includes('bika ambon') || text.includes('bolu meranti')) {
    return { city: 'Medan', province: 'Sumatera Utara', badge: 'Khas Medan' };
  }
  if (text.includes('solo') || text.includes('surakarta') || text.includes('laweyan')) {
    return { city: 'Solo', province: 'Jawa Tengah', badge: 'Khas Solo' };
  }
  if (text.includes('malang') || text.includes('apel')) {
    return { city: 'Malang', province: 'Jawa Timur', badge: 'Khas Malang' };
  }
  if (text.includes('palembang') || text.includes('pempek') || text.includes('cuko')) {
    return { city: 'Palembang', province: 'Sumatera Selatan', badge: 'Khas Palembang' };
  }
  if (text.includes('padang') || text.includes('rendang') || text.includes('payakumbuh')) {
    return { city: 'Padang', province: 'Sumatera Barat', badge: 'Khas Padang' };
  }
  if (text.includes('surabaya') || text.includes('bu rudy') || text.includes('almond')) {
    return { city: 'Surabaya', province: 'Jawa Timur', badge: 'Khas Surabaya' };
  }
  if (text.includes('aceh') || text.includes('gayo')) {
    return { city: 'Aceh', province: 'Aceh', badge: 'Khas Aceh' };
  }
  if (text.includes('garut') || text.includes('dodol')) {
    return { city: 'Garut', province: 'Jawa Barat', badge: 'Khas Garut' };
  }
  if (text.includes('bogor') || text.includes('lapis talas')) {
    return { city: 'Bogor', province: 'Jawa Barat', badge: 'Khas Bogor' };
  }
  if (text.includes('jepara') || text.includes('troso')) {
    return { city: 'Jepara', province: 'Jawa Tengah', badge: 'Khas Jepara' };
  }
  if (text.includes('toraja')) {
    return { city: 'Toraja', province: 'Sulawesi Selatan', badge: 'Khas Toraja' };
  }
  if (text.includes('bangka') || text.includes('getas')) {
    return { city: 'Bangka', province: 'Kep. Bangka Belitung', badge: 'Khas Bangka' };
  }
  if (text.includes('cirebon') || text.includes('megamendung')) {
    return { city: 'Cirebon', province: 'Jawa Barat', badge: 'Khas Cirebon' };
  }
  if (text.includes('samarinda')) {
    return { city: 'Samarinda', province: 'Kalimantan Timur', badge: 'Khas Samarinda' };
  }
  if (text.includes('lampung')) {
    return { city: 'Lampung', province: 'Lampung', badge: 'Khas Lampung' };
  }
  if (text.includes('lombok')) {
    return { city: 'Lombok', province: 'Nusa Tenggara Barat', badge: 'Khas Lombok' };
  }
  if (text.includes('jakarta') || text.includes('betawi') || text.includes('batavia')) {
    return { city: 'Jakarta', province: 'DKI Jakarta', badge: 'Khas Jakarta' };
  }

  return { city: 'Nusantara', province: 'Indonesia', badge: 'Otentik Nusantara' };
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

// Courier Shipping Estimator Rates (RajaOngkir Compatible)
export interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  cost: number;
  originalCost?: number;
  etd: string;
  badge?: string;
  courierCode: 'jne' | 'jnt' | 'sicepat' | 'pos';
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
  originCity = 'yogyakarta',
  weightGrams = 1000,
): ShippingOption[] {
  const city = DESTINATION_CITIES.find((c) => c.id === cityId) || DESTINATION_CITIES[0];
  const isSameCity =
    originCity.toLowerCase().includes(cityId.toLowerCase()) ||
    (originCity.toLowerCase() === 'jogja' && cityId === 'yogyakarta') ||
    (originCity.toLowerCase() === 'bali' && cityId === 'denpasar');

  const distanceMult = isSameCity ? 0.65 : city.baseMultiplier;
  const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));
  const isFreeEligible = subtotal >= 150000;

  const jneRegRaw = Math.round((18000 * distanceMult * weightKg) / 1000) * 1000;
  const jneYesRaw = Math.round((32000 * distanceMult * weightKg) / 1000) * 1000;
  const jntEzRaw = Math.round((19000 * distanceMult * weightKg) / 1000) * 1000;
  const sicepatBestRaw = Math.round((25000 * distanceMult * weightKg) / 1000) * 1000;
  const posRegRaw = Math.round((16000 * distanceMult * weightKg) / 1000) * 1000;

  return [
    {
      id: 'jne-reg',
      courier: 'JNE Express',
      service: 'Reguler (REG)',
      cost: isFreeEligible ? 0 : jneRegRaw,
      originalCost: jneRegRaw,
      etd: isSameCity ? '1 - 2 Hari Kerja' : '2 - 3 Hari Kerja',
      badge: isFreeEligible ? 'Gratis Ongkir' : 'Populer',
      courierCode: 'jne',
    },
    {
      id: 'jne-yes',
      courier: 'JNE Express',
      service: 'YES (Yakin Esok Sampai)',
      cost: jneYesRaw,
      originalCost: jneYesRaw,
      etd: '1 Hari (Esok Tiba)',
      badge: 'Kilat Prioritas',
      courierCode: 'jne',
    },
    {
      id: 'jnt-ez',
      courier: 'J&T Express',
      service: 'EZ Regular',
      cost: isFreeEligible ? 0 : jntEzRaw,
      originalCost: jntEzRaw,
      etd: isSameCity ? '1 - 2 Hari Kerja' : '2 - 3 Hari Kerja',
      badge: isFreeEligible ? 'Gratis Ongkir' : undefined,
      courierCode: 'jnt',
    },
    {
      id: 'sicepat-best',
      courier: 'SiCepat Ekspres',
      service: 'BEST (Besok Sampai Tujuan)',
      cost: sicepatBestRaw,
      originalCost: sicepatBestRaw,
      etd: '1 - 2 Hari Kerja',
      badge: 'Rekomendasi Oleh-oleh',
      courierCode: 'sicepat',
    },
    {
      id: 'pos-reg',
      courier: 'Pos Indonesia',
      service: 'Pos Reguler / Kilat Khusus',
      cost: isFreeEligible ? 0 : posRegRaw,
      originalCost: posRegRaw,
      etd: '2 - 4 Hari Kerja',
      badge: isFreeEligible ? 'Gratis Ongkir' : 'Hemat',
      courierCode: 'pos',
    },
  ];
}

// Store & Seller Profile Interface for Indonesian UMKM
export interface StoreProfile {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  verified: boolean;
  type: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  joinedYear: number;
  chatResponseRate: string;
  chatResponseTime: string;
  description: string;
  avatar: string;
  address: string;
  pirtNumber?: string;
  halalCertified?: boolean;
}

export const VERIFIED_UMKM_STORES: Record<string, StoreProfile> = {
  'bakpia-25': {
    id: 'store-bakpia-25',
    name: 'Dapur Bakpia Pathok 25 Resmi',
    slug: 'bakpia-pathok-25',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    verified: true,
    type: 'UMKM Terverifikasi',
    rating: 4.9,
    reviewCount: 12480,
    productCount: 36,
    joinedYear: 2021,
    chatResponseRate: '99%',
    chatResponseTime: '±10 menit',
    description:
      'Sentra produksi bakpia basah dan kering legendaris Yogyakarta sejak 1948. Menggunakan kacang hijau murni pilihan tanpa pemanis buatan, dipanggang dengan tungku tradisional setiap hari.',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
    address: 'Jl. KS Tubun No. 65, Pathuk, Kota Yogyakarta',
    pirtNumber: 'P-IRT 2063471010125-24',
    halalCertified: true,
  },
  'pie-susu-dhian': {
    id: 'store-pie-susu-dhian',
    name: 'Sentra Pie Susu Dhian Bali',
    slug: 'pie-susu-dhian-bali',
    city: 'Denpasar',
    province: 'Bali',
    verified: true,
    type: 'UMKM Terverifikasi',
    rating: 4.9,
    reviewCount: 9820,
    productCount: 24,
    joinedYear: 2022,
    chatResponseRate: '98%',
    chatResponseTime: '±15 menit',
    description:
      'Pelopor pie susu khas Pulau Dewata dengan kulit pastry renyah dan vla susu manis lembut. Dibuat fresh setiap pagi langsung dari dapur sentral Denpasar.',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
    address: 'Jl. Nangka Selatan No. 40, Denpasar, Bali',
    pirtNumber: 'P-IRT 2065171010045-25',
    halalCertified: true,
  },
  'sambal-bu-rudy': {
    id: 'store-sambal-bu-rudy',
    name: 'Dapur Sambal Bu Rudy Surabaya',
    slug: 'sambal-bu-rudy-surabaya',
    city: 'Surabaya',
    province: 'Jawa Timur',
    verified: true,
    type: 'UMKM Terverifikasi',
    rating: 4.9,
    reviewCount: 18900,
    productCount: 42,
    joinedYear: 2020,
    chatResponseRate: '99%',
    chatResponseTime: '±5 menit',
    description:
      'Ikon kuliner sambal pedas khas Surabaya sejak 1995. Spesialis olahan sambal bawang udang rebon asli Jawa Timur dengan kemasan segel aluminium anti-bocor.',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/SAMBAL_BAWANG.jpg',
    address: 'Jl. Dharmahusada No. 140, Gubeng, Surabaya',
    pirtNumber: 'P-IRT 2113578010892-26',
    halalCertified: true,
  },
  'kopi-gayo': {
    id: 'store-kopi-gayo',
    name: 'Koperasi Kopi Gayo Single Origin',
    slug: 'koperasi-kopi-gayo',
    city: 'Aceh Tengah',
    province: 'Aceh',
    verified: true,
    type: 'UMKM Terverifikasi',
    rating: 4.9,
    reviewCount: 7210,
    productCount: 18,
    joinedYear: 2021,
    chatResponseRate: '97%',
    chatResponseTime: '±20 menit',
    description:
      'Kemitraan petani kopi arabika organik dataran tinggi Gayo Takengon (1.400 mdpl). Disangrai segar mingguan dengan profil roasting medium-dark untuk aroma rempah optimal.',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
    address: 'Jl. Takengon - Bireuen Km. 4, Takengon, Aceh Tengah',
    pirtNumber: 'P-IRT 5101104010023-25',
    halalCertified: true,
  },
  'tenun-troso': {
    id: 'store-tenun-troso',
    name: 'Sentra Tenun ATBM Troso Jepara',
    slug: 'sentra-tenun-troso',
    city: 'Jepara',
    province: 'Jawa Tengah',
    verified: true,
    type: 'UMKM Terverifikasi',
    rating: 5.0,
    reviewCount: 4830,
    productCount: 52,
    joinedYear: 2021,
    chatResponseRate: '96%',
    chatResponseTime: '±30 menit',
    description:
      'Pusat tenun ikat tradisional Nusantara menggunakan Alat Tenun Bukan Mesin (ATBM) oleh keluarga penenun generasi ketiga desa Troso Jepara.',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Batik_pedalaman_-_parang_klithik.JPG',
    address: 'Desa Troso RT 03 / RW 02, Pecangaan, Jepara, Jawa Tengah',
    halalCertified: true,
  },
  'kriya-kasongan': {
    id: 'store-kriya-kasongan',
    name: 'Sentra Gerabah Seni Kasongan',
    slug: 'sentra-gerabah-kasongan',
    city: 'Bantul',
    province: 'DI Yogyakarta',
    verified: true,
    type: 'UMKM Terverifikasi',
    rating: 4.8,
    reviewCount: 3420,
    productCount: 28,
    joinedYear: 2022,
    chatResponseRate: '95%',
    chatResponseTime: '±25 menit',
    description:
      'Bengkel kerajinan gerabah tanah liat bakar tradisional Desa Kasongan Bantul. Menyajikan cobek, poci, dan vas tembikar dengan lapisan food-grade dan finishing halus.',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Cobek.jpg',
    address: 'Desa Bangunjiwo, Kasongan, Bantul, DI Yogyakarta',
    halalCertified: true,
  },
  'danar-hadi': {
    id: 'store-danar-hadi',
    name: 'Batik Tradisi Danar Hadi Solo',
    slug: 'batik-danar-hadi-solo',
    city: 'Solo',
    province: 'Jawa Tengah',
    verified: true,
    type: 'UMKM Terverifikasi',
    rating: 4.9,
    reviewCount: 6540,
    productCount: 45,
    joinedYear: 2021,
    chatResponseRate: '98%',
    chatResponseTime: '±15 menit',
    description:
      'Rumah batik cap dan tulis legendaris Surakarta. Menggunakan kain katun primissima mori berkualitas tinggi dengan motif parang, kawung, dan truntum klasik.',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Batik_pedalaman_-_parang_klithik.JPG',
    address: 'Jl. Brigjend Slamet Riyadi No. 261, Laweyan, Solo',
    halalCertified: true,
  },
  'bika-ambon': {
    id: 'store-bika-ambon',
    name: 'Dapur Bika Ambon Medan Asli',
    slug: 'dapur-bika-ambon-medan',
    city: 'Medan',
    province: 'Sumatera Utara',
    verified: true,
    type: 'UMKM Terverifikasi',
    rating: 4.9,
    reviewCount: 8190,
    productCount: 22,
    joinedYear: 2022,
    chatResponseRate: '97%',
    chatResponseTime: '±15 menit',
    description:
      'Produsen bika ambon sarang lebah asli Medan dengan aroma daun pandan wangi dan tuak nira alami. Lembut, legit, dan berserat sempurna.',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
    address: 'Jl. Mojopahit No. 88, Medan Petisah, Medan',
    pirtNumber: 'P-IRT 2061271010321-25',
    halalCertified: true,
  },
  'default': {
    id: 'store-umkm-nusantara',
    name: 'Sentra Oleh-oleh UMKM Nusantara',
    slug: 'sentra-umkm-nusantara',
    city: 'Yogyakarta',
    province: 'Indonesia',
    verified: true,
    type: 'UMKM Terverifikasi',
    rating: 4.9,
    reviewCount: 5120,
    productCount: 64,
    joinedYear: 2021,
    chatResponseRate: '98%',
    chatResponseTime: '±15 menit',
    description:
      'Kolektif kurasi UMKM binaan daerah terverifikasi, menghadirkan produk oleh-oleh kuliner, kopi, dan kerajinan otentik langsung dari pengrajin daerah.',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
    address: 'Kawasan Sentra UMKM Nusantara, Yogyakarta',
    halalCertified: true,
  },
};

export function getProductStore(product: {
  title?: string;
  description?: string;
  slug?: string;
}): StoreProfile {
  const text = `${product.title || ''} ${product.description || ''} ${product.slug || ''}`.toLowerCase();

  if (text.includes('bakpia') || text.includes('pathok')) {
    return VERIFIED_UMKM_STORES['bakpia-25'];
  }
  if (text.includes('pie susu') || text.includes('dhian') || text.includes('bali')) {
    return VERIFIED_UMKM_STORES['pie-susu-dhian'];
  }
  if (text.includes('sambal') || text.includes('bu rudy') || text.includes('surabaya')) {
    return VERIFIED_UMKM_STORES['sambal-bu-rudy'];
  }
  if (text.includes('kopi') || text.includes('gayo') || text.includes('aceh')) {
    return VERIFIED_UMKM_STORES['kopi-gayo'];
  }
  if (text.includes('troso') || text.includes('tenun') || text.includes('jepara')) {
    return VERIFIED_UMKM_STORES['tenun-troso'];
  }
  if (text.includes('gerabah') || text.includes('kasongan') || text.includes('cobek') || text.includes('keramik')) {
    return VERIFIED_UMKM_STORES['kriya-kasongan'];
  }
  if (text.includes('batik') || text.includes('solo') || text.includes('danar hadi') || text.includes('laweyan')) {
    return VERIFIED_UMKM_STORES['danar-hadi'];
  }
  if (text.includes('bika ambon') || text.includes('meranti') || text.includes('medan')) {
    return VERIFIED_UMKM_STORES['bika-ambon'];
  }

  return VERIFIED_UMKM_STORES['default'];
}

// Shelf-Life & Temperature Storage Guide for Indonesian Souvenirs
export interface ShelfLifeInfo {
  roomTemp: string;
  chilled: string;
  isPerishable: boolean;
  courierRecommendation: string;
  recommendedCourier: string;
  note: string;
  storageTips: string;
}

export function getProductShelfLife(product: {
  title?: string;
  description?: string;
  slug?: string;
}): ShelfLifeInfo {
  const text = `${product.title || ''} ${product.description || ''} ${product.slug || ''}`.toLowerCase();

  if (
    text.includes('bakpia') ||
    text.includes('pie susu') ||
    text.includes('bika ambon') ||
    text.includes('bolu') ||
    text.includes('lapis') ||
    text.includes('kue') ||
    text.includes('pempek') ||
    text.includes('mochi')
  ) {
    const courier = 'Kurir Kilat 1 Hari (JNE YES / SiCepat BEST)';
    const tip = 'Oleh-oleh basah tanpa bahan pengawet sintetis. Segera simpan di kulkas setelah paket tiba agar kesegaran tetap optimal.';
    return {
      roomTemp: '4 - 7 Hari',
      chilled: '14 Hari di Kulkas',
      isPerishable: true,
      courierRecommendation: courier,
      recommendedCourier: courier,
      note: tip,
      storageTips: tip,
    };
  }

  if (
    text.includes('sambal') ||
    text.includes('rendang') ||
    text.includes('dodol') ||
    text.includes('abon') ||
    text.includes('camilan') ||
    text.includes('keripik')
  ) {
    const courier = 'Aman untuk semua kurir (JNE / J&T / SiCepat)';
    const tip = 'Kemasan segel aluminium kedap udara. Simpan di tempat sejuk dan terhindar dari paparan sinar matahari langsung.';
    return {
      roomTemp: '30 - 60 Hari',
      chilled: '90 Hari',
      isPerishable: false,
      courierRecommendation: courier,
      recommendedCourier: courier,
      note: tip,
      storageTips: tip,
    };
  }

  if (
    text.includes('kopi') ||
    text.includes('teh') ||
    text.includes('wedang') ||
    text.includes('jamu') ||
    text.includes('herbal')
  ) {
    const courier = 'Aman untuk semua kurir reguler & kargo';
    const tip = 'Biji kopi & rempah kering disangrai fresh. Simpan dalam wadah kedap udara tertutup rapat bersuhu ruangan.';
    return {
      roomTemp: '6 - 12 Bulan',
      chilled: 'Tidak perlu (Suhu Ruang)',
      isPerishable: false,
      courierRecommendation: courier,
      recommendedCourier: courier,
      note: tip,
      storageTips: tip,
    };
  }

  const courier = 'Aman untuk semua ekspedisi dengan proteksi kardus berlapis';
  const tip = 'Karya kriya & wastra otentik. Simpan di tempat kering dan rawat sesuai panduan perawatan produk.';
  return {
    roomTemp: 'Awet & Tahan Lama',
    chilled: 'Tidak berlaku',
    isPerishable: false,
    courierRecommendation: courier,
    recommendedCourier: courier,
    note: tip,
    storageTips: tip,
  };
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

  const message = `Halo NUSAVA — Satu Indonesia, Banyak Cerita!

Saya ingin memesan langsung produk berikut:
- Produk: ${productTitle}
- Varian/Rasa: ${variantTitle || 'Standar'}
- Jumlah: ${quantity} pcs
- Estimasi Total: ${formattedTotal}
${productUrl ? `- Link Produk: ${productUrl}\n` : ''}
Mohon info ketersediaan stok dan estimasi ongkos kirim ke alamat saya. Terima kasih!`;

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
        `${idx + 1}. ${it.productTitle} (${it.variantTitle || 'Standar'}) x ${it.quantity} pcs`,
    )
    .join('\n');

  const message = `Halo Layanan Pelanggan NUSAVA!

Saya ingin memesan keranjang belanja berikut:

${itemsList}

Total Pembelian: ${formattedGrandTotal}

Mohon bantu proses pesanan dan kirimkan informasi pembayaran resmi. Terima kasih banyak!`;

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
      'Kualitas produk juara, tekstur dan bumbunya nendang. Sedikit catatan untuk kurir agar lebih hati-hati saat meletakkan paket di pagar, tapi secara keseluruhan puas dengan layanan NUSAVA.',
    helpfulCount: 9,
    verified: true,
    avatarBg: 'bg-slate-700',
  },
];
