'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useCartStore, GIFT_WRAP_COST } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { useRewardsStore } from '../../stores/rewards-store';
import { apiRequest } from '../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { PaymentMethod } from '@commerceos/contracts';
import { CourierLogo } from '../../components/courier-logos';
import { AVAILABLE_COUPONS, validateAndApplyCoupon, Coupon } from '../../lib/coupon-helpers';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Check,
  AlertCircle,
  Truck,
  Banknote,
  Tag,
  X,
  Gift,
  Star,
  User,
  MapPin,
  ChevronDown,
  ChevronRight,
  Store,
  CheckCircle2,
  QrCode,
  CreditCard,
  Lock,
  Pencil,
  Plus,
} from 'lucide-react';

// Data Domisili Provinsi -> Kota/Kabupaten -> Kecamatan & Kode Pos
interface DistrictOption {
  name: string;
  postalCode: string;
}

interface CityOption {
  name: string;
  shippingKey: string;
  districts: DistrictOption[];
}

interface ProvinceOption {
  province: string;
  cities: CityOption[];
}

const DOMICILE_DATA: ProvinceOption[] = [
  {
    province: 'DKI Jakarta',
    cities: [
      {
        name: 'Jakarta Selatan',
        shippingKey: 'jakarta',
        districts: [
          { name: 'Kebayoran Baru', postalCode: '12160' },
          { name: 'Tebet', postalCode: '12810' },
          { name: 'Cilandak', postalCode: '12430' },
          { name: 'Setiabudi', postalCode: '12910' },
          { name: 'Pasar Minggu', postalCode: '12520' },
        ],
      },
      {
        name: 'Jakarta Pusat',
        shippingKey: 'jakarta',
        districts: [
          { name: 'Menteng', postalCode: '10310' },
          { name: 'Tanah Abang', postalCode: '10230' },
          { name: 'Gambir', postalCode: '10110' },
          { name: 'Kemayoran', postalCode: '10610' },
        ],
      },
      {
        name: 'Jakarta Barat',
        shippingKey: 'jakarta',
        districts: [
          { name: 'Kebon Jeruk', postalCode: '11530' },
          { name: 'Palmerah', postalCode: '11480' },
          { name: 'Grogol Petamburan', postalCode: '11450' },
          { name: 'Cengkareng', postalCode: '11730' },
        ],
      },
      {
        name: 'Jakarta Timur',
        shippingKey: 'jakarta',
        districts: [
          { name: 'Duren Sawit', postalCode: '13440' },
          { name: 'Jatinegara', postalCode: '13310' },
          { name: 'Kramat Jati', postalCode: '13510' },
          { name: 'Cakung', postalCode: '13910' },
        ],
      },
      {
        name: 'Jakarta Utara',
        shippingKey: 'jakarta',
        districts: [
          { name: 'Kelapa Gading', postalCode: '14240' },
          { name: 'Penjaringan (PIK)', postalCode: '14440' },
          { name: 'Tanjung Priok', postalCode: '14310' },
        ],
      },
    ],
  },
  {
    province: 'DI Yogyakarta',
    cities: [
      {
        name: 'Kota Yogyakarta',
        shippingKey: 'yogyakarta',
        districts: [
          { name: 'Gedong Tengen (Malioboro)', postalCode: '55271' },
          { name: 'Gondokusuman', postalCode: '55221' },
          { name: 'Kotagede', postalCode: '55171' },
          { name: 'Umbulharjo', postalCode: '55161' },
        ],
      },
      {
        name: 'Kab. Sleman',
        shippingKey: 'yogyakarta',
        districts: [
          { name: 'Depok (Seturan / Gejayan)', postalCode: '55281' },
          { name: 'Mlati', postalCode: '55284' },
          { name: 'Ngaglik', postalCode: '55581' },
          { name: 'Kalasan', postalCode: '55571' },
        ],
      },
      {
        name: 'Kab. Bantul',
        shippingKey: 'yogyakarta',
        districts: [
          { name: 'Kasihan', postalCode: '55181' },
          { name: 'Banguntapan', postalCode: '55191' },
          { name: 'Sewon', postalCode: '55186' },
        ],
      },
    ],
  },
  {
    province: 'Jawa Barat',
    cities: [
      {
        name: 'Kota Bandung',
        shippingKey: 'bandung',
        districts: [
          { name: 'Coblong (Dago)', postalCode: '40132' },
          { name: 'Sumur Bandung (Braga)', postalCode: '40111' },
          { name: 'Cicendo', postalCode: '40171' },
          { name: 'Buahbatu', postalCode: '40286' },
        ],
      },
      {
        name: 'Kota Bekasi',
        shippingKey: 'jakarta',
        districts: [
          { name: 'Bekasi Selatan', postalCode: '17141' },
          { name: 'Bekasi Barat', postalCode: '17134' },
          { name: 'Rawalumbu', postalCode: '17116' },
          { name: 'Pondokgede', postalCode: '17411' },
        ],
      },
      {
        name: 'Kota Depok',
        shippingKey: 'jakarta',
        districts: [
          { name: 'Beji (Margonda)', postalCode: '16424' },
          { name: 'Cimanggis', postalCode: '16451' },
          { name: 'Cinere', postalCode: '16514' },
          { name: 'Sukmajaya', postalCode: '16412' },
        ],
      },
      {
        name: 'Kota Bogor',
        shippingKey: 'bandung',
        districts: [
          { name: 'Bogor Tengah', postalCode: '16121' },
          { name: 'Bogor Utara', postalCode: '16151' },
          { name: 'Tanah Sareal', postalCode: '16161' },
        ],
      },
    ],
  },
  {
    province: 'Banten',
    cities: [
      {
        name: 'Kota Tangerang Selatan',
        shippingKey: 'jakarta',
        districts: [
          { name: 'Serpong (BSD)', postalCode: '15310' },
          { name: 'Pondok Aren (Bintaro)', postalCode: '15224' },
          { name: 'Ciputat', postalCode: '15411' },
          { name: 'Pamulang', postalCode: '15417' },
        ],
      },
      {
        name: 'Kota Tangerang',
        shippingKey: 'jakarta',
        districts: [
          { name: 'Karawaci', postalCode: '15115' },
          { name: 'Ciledug', postalCode: '15151' },
          { name: 'Cipondoh', postalCode: '15148' },
        ],
      },
    ],
  },
  {
    province: 'Jawa Tengah',
    cities: [
      {
        name: 'Kota Semarang',
        shippingKey: 'semarang',
        districts: [
          { name: 'Semarang Tengah', postalCode: '50131' },
          { name: 'Banyumanik', postalCode: '50261' },
          { name: 'Tembalang', postalCode: '50275' },
          { name: 'Candisari', postalCode: '50252' },
        ],
      },
      {
        name: 'Kota Surakarta (Solo)',
        shippingKey: 'solo',
        districts: [
          { name: 'Laweyan', postalCode: '57141' },
          { name: 'Banjarsari', postalCode: '57131' },
          { name: 'Pasar Kliwon', postalCode: '57111' },
        ],
      },
      {
        name: 'Kab. Jepara',
        shippingKey: 'semarang',
        districts: [
          { name: 'Pecangaan (Troso)', postalCode: '59462' },
          { name: 'Tahunan', postalCode: '59421' },
          { name: 'Jepara Kota', postalCode: '59411' },
        ],
      },
    ],
  },
  {
    province: 'Jawa Timur',
    cities: [
      {
        name: 'Kota Surabaya',
        shippingKey: 'surabaya',
        districts: [
          { name: 'Gubeng', postalCode: '60281' },
          { name: 'Wonokromo', postalCode: '60241' },
          { name: 'Tegalsari', postalCode: '60261' },
          { name: 'Sukolilo', postalCode: '60111' },
          { name: 'Rungkut', postalCode: '60293' },
        ],
      },
      {
        name: 'Kota Malang',
        shippingKey: 'malang',
        districts: [
          { name: 'Klojen', postalCode: '65111' },
          { name: 'Lowokwaru', postalCode: '65141' },
          { name: 'Blimbing', postalCode: '65126' },
        ],
      },
      {
        name: 'Kab. Sidoarjo',
        shippingKey: 'surabaya',
        districts: [
          { name: 'Waru', postalCode: '61256' },
          { name: 'Sidoarjo Kota', postalCode: '61211' },
          { name: 'Taman', postalCode: '61257' },
        ],
      },
    ],
  },
  {
    province: 'Bali',
    cities: [
      {
        name: 'Kota Denpasar',
        shippingKey: 'denpasar',
        districts: [
          { name: 'Denpasar Selatan', postalCode: '80221' },
          { name: 'Denpasar Barat', postalCode: '80111' },
          { name: 'Denpasar Timur', postalCode: '80235' },
        ],
      },
      {
        name: 'Kab. Badung',
        shippingKey: 'denpasar',
        districts: [
          { name: 'Kuta', postalCode: '80361' },
          { name: 'Kuta Utara (Canggu)', postalCode: '80363' },
          { name: 'Kuta Selatan (Jimbaran)', postalCode: '80362' },
        ],
      },
      {
        name: 'Kab. Gianyar',
        shippingKey: 'denpasar',
        districts: [
          { name: 'Ubud', postalCode: '80571' },
          { name: 'Sukawati', postalCode: '80582' },
        ],
      },
    ],
  },
  {
    province: 'Sumatera Utara',
    cities: [
      {
        name: 'Kota Medan',
        shippingKey: 'medan',
        districts: [
          { name: 'Medan Baru', postalCode: '20152' },
          { name: 'Medan Petisah', postalCode: '20112' },
          { name: 'Medan Timur', postalCode: '20231' },
        ],
      },
    ],
  },
  {
    province: 'Sumatera Barat',
    cities: [
      {
        name: 'Kota Padang',
        shippingKey: 'padang',
        districts: [
          { name: 'Padang Barat', postalCode: '25111' },
          { name: 'Padang Utara', postalCode: '25131' },
          { name: 'Kuranji', postalCode: '25152' },
        ],
      },
    ],
  },
  {
    province: 'Sumatera Selatan',
    cities: [
      {
        name: 'Kota Palembang',
        shippingKey: 'palembang',
        districts: [
          { name: 'Ilir Timur I', postalCode: '30121' },
          { name: 'Ilir Barat I', postalCode: '30137' },
          { name: 'Sukarami', postalCode: '30151' },
        ],
      },
    ],
  },
  {
    province: 'Aceh',
    cities: [
      {
        name: 'Kota Banda Aceh',
        shippingKey: 'medan',
        districts: [
          { name: 'Baiturrahman', postalCode: '23241' },
          { name: 'Kuta Alam', postalCode: '23121' },
        ],
      },
      {
        name: 'Kab. Aceh Tengah (Takengon)',
        shippingKey: 'medan',
        districts: [
          { name: 'Bebesen', postalCode: '24552' },
          { name: 'Lut Tawar', postalCode: '24519' },
        ],
      },
    ],
  },
  {
    province: 'Sulawesi Selatan',
    cities: [
      {
        name: 'Kota Makassar',
        shippingKey: 'makassar',
        districts: [
          { name: 'Panakkukang', postalCode: '90231' },
          { name: 'Rappocini', postalCode: '90222' },
          { name: 'Ujung Pandang', postalCode: '90111' },
        ],
      },
    ],
  },
];

interface SavedAddressItem {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  isPrimary?: boolean;
}

const DEFAULT_SAVED_ADDRESSES: SavedAddressItem[] = [
  {
    id: 'addr-1',
    label: 'Rumah',
    recipientName: 'Budi Santoso',
    phone: '081234567890',
    streetAddress: 'Jl. Wijaya II No. 48, RT 04/RW 02',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12160',
    notes: 'Pagar hitam samping apotek, titip ke pos satpam jika sedang di luar',
    isPrimary: true,
  },
  {
    id: 'addr-2',
    label: 'Kantor',
    recipientName: 'Budi Santoso',
    phone: '081234567890',
    streetAddress: 'Gedung Menara Mandiri Lt. 14, Jl. Jend. Sudirman Kav. 54-55',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12190',
    notes: 'Resepsionis lantai 14 pada jam kerja (09.00 - 17.00 WIB)',
    isPrimary: false,
  },
  {
    id: 'addr-3',
    label: 'Rumah Orang Tua',
    recipientName: 'Keluarga Santoso',
    phone: '081328192011',
    streetAddress: 'Jl. Kaliurang Km 5.5 Gg. Megatruh No. 12',
    city: 'Kab. Sleman',
    province: 'DI Yogyakarta',
    postalCode: '55281',
    notes: 'Rumah cat krem pagar kayu',
    isPrimary: false,
  },
];

// Pilihan metode bayar ala Blibli / Tokopedia / Shopee
type MarketplacePaymentChannel =
  | 'BCA_VA'
  | 'MANDIRI_VA'
  | 'BNI_VA'
  | 'BRI_VA'
  | 'QRIS'
  | 'COD';

interface PaymentChannelOption {
  id: MarketplacePaymentChannel;
  group: 'VA' | 'QRIS' | 'COD';
  name: string;
  subtitle: string;
  accountInfo: string;
  badge?: string;
  contractMethod: PaymentMethod;
}

const PAYMENT_CHANNELS: PaymentChannelOption[] = [
  {
    id: 'BCA_VA',
    group: 'VA',
    name: 'BCA Virtual Account',
    subtitle: 'Verifikasi otomatis • M-BCA, KlikBCA, ATM',
    accountInfo: '87301 • 081234567890',
    badge: 'Populer',
    contractMethod: PaymentMethod.MANUAL_BANK_TRANSFER,
  },
  {
    id: 'MANDIRI_VA',
    group: 'VA',
    name: 'Mandiri Virtual Account',
    subtitle: 'Verifikasi otomatis • Livin by Mandiri, ATM',
    accountInfo: '88708 • 081234567890',
    contractMethod: PaymentMethod.MANUAL_BANK_TRANSFER,
  },
  {
    id: 'BNI_VA',
    group: 'VA',
    name: 'BNI Virtual Account',
    subtitle: 'Verifikasi otomatis • Wondr by BNI, ATM',
    accountInfo: '8810 • 081234567890',
    contractMethod: PaymentMethod.MANUAL_BANK_TRANSFER,
  },
  {
    id: 'BRI_VA',
    group: 'VA',
    name: 'BRI Virtual Account (BRIVA)',
    subtitle: 'Verifikasi otomatis • BRImo, ATM BRI',
    accountInfo: '12889 • 081234567890',
    contractMethod: PaymentMethod.MANUAL_BANK_TRANSFER,
  },
  {
    id: 'QRIS',
    group: 'QRIS',
    name: 'QRIS (GoPay, OVO, ShopeePay, DANA)',
    subtitle: 'Scan QR instan dari aplikasi e-wallet atau m-banking',
    accountInfo: 'NMID: ID202609182910 (PT Oleh Oleh Nusantara)',
    badge: 'Bebas Biaya Admin',
    contractMethod: PaymentMethod.MANUAL_BANK_TRANSFER,
  },
  {
    id: 'COD',
    group: 'COD',
    name: 'COD (Bayar di Tempat)',
    subtitle: 'Bayar tunai langsung ke kurir saat paket tiba',
    accountInfo: 'Siapkan uang pas saat kurir mengantar paket',
    contractMethod: PaymentMethod.CASH_ON_DELIVERY,
  },
];

const CheckoutFormSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  fullName: z.string().min(2, 'Nama lengkap wajib diisi minimal 2 karakter'),
  phone: z.string().min(8, 'Nomor HP / WhatsApp minimal 8 digit'),
  streetAddress: z.string().min(5, 'Alamat lengkap wajib diisi (jalan, nomor, RT/RW)'),
  city: z.string().min(2, 'Kota/Kabupaten wajib dipilih'),
  state: z.string().min(2, 'Provinsi wajib dipilih'),
  postalCode: z.string().min(3, 'Kode pos wajib diisi'),
  country: z.string().default('ID'),
  notes: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, fetchCart, clearCart, giftDetails, setGiftDetails } = useCartStore();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { points, tier, calculateEarnedPoints, redeemPoints, addEarnedPoints } = useRewardsStore();

  const [usePoints, setUsePoints] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Marketplace UI states (ala Tokopedia / Blibli / Shopee)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>(DEFAULT_SAVED_ADDRESSES);
  const [selectedAddressPresetId, setSelectedAddressPresetId] = useState<string>('addr-1');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Kebayoran Baru');
  const [isEditingAddressDetail, setIsEditingAddressDetail] = useState<boolean>(false);

  const [selectedCourierId, setSelectedCourierId] = useState('jne-reg');
  const [showCourierSelector, setShowCourierSelector] = useState<boolean>(false);
  const [shippingInsurance, setShippingInsurance] = useState<boolean>(true);
  const [sellerNote, setSellerNote] = useState<string>('');

  const [isDropship, setIsDropship] = useState(false);
  const [dropshipSenderName, setDropshipSenderName] = useState('');
  const [dropshipSenderPhone, setDropshipSenderPhone] = useState('');
  const [hidePriceInSlip, setHidePriceInSlip] = useState(true);

  const [selectedPaymentChannel, setSelectedPaymentChannel] =
    useState<MarketplacePaymentChannel>('BCA_VA');

  const isFreeEligible = subtotal >= 150000;
  const totalWeightGrams = Math.max(1000, items.reduce((acc, it) => acc + it.quantity, 0) * 500);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      email: user?.email || 'customer@commerceos.dev',
      fullName: user ? `${user.firstName} ${user.lastName}` : 'Budi Santoso',
      phone: '081234567890',
      state: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      postalCode: '12160',
      streetAddress: 'Jl. Wijaya II No. 48, RT 04/RW 02',
      notes: 'Pagar hitam samping apotek, titip ke pos satpam jika sedang di luar',
      country: 'ID',
      paymentMethod: PaymentMethod.MANUAL_BANK_TRANSFER,
    },
  });

  const watchedFullName = watch('fullName');
  const watchedPhone = watch('phone');
  const watchedStreetAddress = watch('streetAddress');
  const selectedState = watch('state');
  const selectedCity = watch('city');
  const watchedPostalCode = watch('postalCode');
  const watchedNotes = watch('notes');

  // Sync payment channel to backend contract enum
  const activePaymentObj =
    PAYMENT_CHANNELS.find((p) => p.id === selectedPaymentChannel) || PAYMENT_CHANNELS[0];

  const handleSelectPaymentChannel = (channel: PaymentChannelOption) => {
    setSelectedPaymentChannel(channel.id);
    setValue('paymentMethod', channel.contractMethod, { shouldValidate: true });
  };

  // Load saved addresses from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('nusava_saved_addresses_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
          }
        }
      } catch {
        // ignore storage parse error
      }
    }
  }, []);

  // Derive available cities & districts based on selected province & city
  const activeProvinceObj = useMemo(
    () => DOMICILE_DATA.find((p) => p.province === selectedState) || DOMICILE_DATA[0],
    [selectedState]
  );

  const availableCities = useMemo(() => activeProvinceObj.cities, [activeProvinceObj]);

  const activeCityObj = useMemo(
    () => availableCities.find((c) => c.name === selectedCity) || availableCities[0],
    [availableCities, selectedCity]
  );

  const availableDistricts = useMemo(() => activeCityObj?.districts || [], [activeCityObj]);
  const shippingDestKey = activeCityObj?.shippingKey || 'jakarta';

  // Fetch dynamic shipping cost based on selected domicile city
  const { data: shippingCostApi } = useQuery({
    queryKey: ['checkout-rajaongkir', shippingDestKey, subtotal, totalWeightGrams],
    queryFn: async () => {
      const q = new URLSearchParams({
        origin: 'yogyakarta',
        destination: shippingDestKey,
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
      service: 'Reguler (Estimasi tiba 2-3 Hari)',
      cost: isFreeEligible ? 0 : 18000,
      badge: isFreeEligible ? 'Bebas Ongkir' : 'Rekomendasi',
    },
    {
      id: 'jne-yes',
      name: 'JNE Express',
      service: 'YES - Next Day (Tiba Besok)',
      cost: 32000,
      badge: 'Kilat 1 Hari',
    },
    {
      id: 'jnt-ez',
      name: 'J&T Express',
      service: 'EZ Regular (Estimasi tiba 2-3 Hari)',
      cost: isFreeEligible ? 0 : 19000,
      badge: isFreeEligible ? 'Bebas Ongkir' : undefined,
    },
    {
      id: 'sicepat-best',
      name: 'SiCepat Ekspres',
      service: 'BEST (Estimasi tiba 1-2 Hari)',
      cost: 25000,
      badge: 'Cepat',
    },
    {
      id: 'pos-reg',
      name: 'Pos Indonesia',
      service: 'Pos Reguler (Estimasi tiba 2-4 Hari)',
      cost: isFreeEligible ? 0 : 16000,
      badge: isFreeEligible ? 'Bebas Ongkir' : 'Ekonomis',
    },
  ];

  const courierOptions = shippingCostApi?.options
    ? shippingCostApi.options.map((opt: any) => ({
        id: opt.id,
        name: opt.courier,
        service: `${opt.service} (Estimasi tiba ${opt.etd})`,
        cost: opt.cost,
        badge: opt.badge,
      }))
    : fallbackCourierOptions;

  const activeCourier =
    courierOptions.find((c: any) => c.id === selectedCourierId) || courierOptions[0];

  useEffect(() => {
    if (user) {
      setValue('email', user.email);
      if (selectedAddressPresetId === 'addr-1') {
        setValue('fullName', `${user.firstName} ${user.lastName}`.trim());
      }
    }
  }, [user, setValue, selectedAddressPresetId]);

  const activePresetLabel =
    savedAddresses.find((a) => a.id === selectedAddressPresetId)?.label || 'Alamat Pengiriman';

  // Handler when user selects a Saved Address from the Dropdown
  const handleSelectAddressPreset = (presetId: string) => {
    setSelectedAddressPresetId(presetId);
    if (presetId === 'new') {
      setValue('streetAddress', '');
      setValue('notes', '');
      setIsEditingAddressDetail(true);
      return;
    }

    const found = savedAddresses.find((a) => a.id === presetId);
    if (found) {
      setValue('fullName', found.recipientName, { shouldValidate: true });
      setValue('phone', found.phone.replace(/[^0-9+]/g, ''), { shouldValidate: true });
      setValue('state', found.province, { shouldValidate: true });
      setValue('city', found.city, { shouldValidate: true });
      setValue('postalCode', found.postalCode, { shouldValidate: true });
      setValue('streetAddress', found.streetAddress, { shouldValidate: true });
      setValue('notes', found.notes || '');

      const matchedProv = DOMICILE_DATA.find((p) => p.province === found.province);
      const matchedCity = matchedProv?.cities.find((c) => c.name === found.city);
      if (matchedCity?.districts?.[0]) {
        const matchedDist =
          matchedCity.districts.find((d) => d.postalCode === found.postalCode) ||
          matchedCity.districts[0];
        setSelectedDistrictName(matchedDist.name);
      }
    }
  };

  // Handler when user changes Province dropdown
  const handleProvinceChange = (newProvince: string) => {
    setSelectedAddressPresetId('custom');
    setValue('state', newProvince, { shouldValidate: true });
    const provObj = DOMICILE_DATA.find((p) => p.province === newProvince);
    const firstCity = provObj?.cities[0];
    if (firstCity) {
      setValue('city', firstCity.name, { shouldValidate: true });
      const firstDist = firstCity.districts[0];
      if (firstDist) {
        setSelectedDistrictName(firstDist.name);
        setValue('postalCode', firstDist.postalCode, { shouldValidate: true });
      }
    }
  };

  // Handler when user changes City dropdown
  const handleCityChange = (newCity: string) => {
    setSelectedAddressPresetId('custom');
    setValue('city', newCity, { shouldValidate: true });
    const cityObj = availableCities.find((c) => c.name === newCity);
    const firstDist = cityObj?.districts[0];
    if (firstDist) {
      setSelectedDistrictName(firstDist.name);
      setValue('postalCode', firstDist.postalCode, { shouldValidate: true });
    }
  };

  // Handler when user changes District (Kecamatan) dropdown
  const handleDistrictChange = (newDistrictName: string) => {
    setSelectedAddressPresetId('custom');
    setSelectedDistrictName(newDistrictName);
    const distObj = availableDistricts.find((d) => d.name === newDistrictName);
    if (distObj) {
      setValue('postalCode', distObj.postalCode, { shouldValidate: true });
    }
  };

  const rawShippingCost = items.length === 0 ? 0 : activeCourier.cost;
  const effectiveShippingCost = appliedCoupon?.discountType === 'SHIPPING' ? 0 : rawShippingCost;
  const giftCost = giftDetails.isGiftWrap ? GIFT_WRAP_COST : 0;
  const insuranceCost = shippingInsurance ? 0 : 0; // Gratis Asuransi Pengiriman Member NUSAVA
  const totalBeforePoints = Math.max(
    0,
    subtotal +
      effectiveShippingCost +
      giftCost +
      insuranceCost -
      (appliedCoupon?.discountType === 'SHIPPING' ? 0 : couponDiscount)
  );
  const pointsDiscount = usePoints ? Math.min(points, totalBeforePoints) : 0;
  const grandTotal = Math.max(0, totalBeforePoints - pointsDiscount);
  const earnedPoints = calculateEarnedPoints(subtotal);

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
    if (!user) {
      router.push('/register?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Keranjang belanja kamu masih kosong.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const courierNote = `[Kurir: ${activeCourier.name} - ${activeCourier.service}]`;
      const paymentChannelNote = `[Metode Bayar: ${activePaymentObj.name}]`;
      const districtNote = selectedDistrictName ? `[Kecamatan: ${selectedDistrictName}]` : '';
      const sellerMsgNote = sellerNote.trim() ? `[Pesan Penjual: "${sellerNote.trim()}"]` : '';
      const giftNote = giftDetails.isGiftWrap
        ? `[HAMPERS: ${giftDetails.packagingType === 'besek' ? 'Besek Tradisional Bambu' : 'Hardbox Eksklusif'} | Pesan: "${giftDetails.message || '-'}" | Dari: ${giftDetails.senderName || data.fullName} | Kepada: ${giftDetails.recipientName || data.fullName}]`
        : '';
      const dropshipNote = isDropship
        ? `[DROPSHIP: Pengirim: ${dropshipSenderName || data.fullName} (${dropshipSenderPhone || data.phone}) | Sembunyikan Harga: ${hidePriceInSlip ? 'YA' : 'TIDAK'}]`
        : '';
      const pointsNote =
        pointsDiscount > 0 ? `[TUKAR POIN: -Rp${pointsDiscount.toLocaleString('id-ID')}]` : '';
      const combinedNotes = [
        courierNote,
        paymentChannelNote,
        districtNote,
        sellerMsgNote,
        giftNote,
        dropshipNote,
        pointsNote,
        data.notes,
      ]
        .filter(Boolean)
        .join(' ');

      const payload: any = {
        paymentMethod: activePaymentObj.contractMethod,
        notes: combinedNotes,
        items: items.map((it) => ({
          variantId: it.variantId,
          quantity: it.quantity,
        })),
        newAddress: {
          fullName: data.fullName,
          phone: data.phone,
          streetAddress: `${data.streetAddress}${selectedDistrictName ? `, Kec. ${selectedDistrictName}` : ''}`,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country || 'ID',
        },
      };

      const order = await apiRequest<any>('/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (pointsDiscount > 0) {
        redeemPoints(pointsDiscount, order.orderNumber);
      }
      if (earnedPoints > 0) {
        addEarnedPoints(
          earnedPoints,
          `Cashback Poin Pesanan #${order.orderNumber}`,
          order.orderNumber
        );
      }

      clearCart();
      await fetchCart();
      router.push(`/checkout/success/${order.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Gagal memproses pesanan. Silakan periksa kembali kelengkapan alamat pengiriman.'
      );
      setIsEditingAddressDetail(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wajib Register / Login sebelum bisa Checkout
  if (!isAuthLoading && !user) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 font-sans">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#003d29]/10 text-[#003d29] flex items-center justify-center mx-auto">
            <User className="w-7 h-7 text-[#003d29]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#003d29] block">
              Langkah Sebelum Pembayaran
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Daftar Akun untuk Melanjutkan Checkout
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Untuk keamanan pengiriman, pelacakan resi otomatis, dan memperoleh{' '}
              <strong className="text-[#003d29]">Cashback NUSAVA Poin</strong>, silakan daftar akun terlebih dahulu.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-left space-y-2 text-xs">
            <p className="font-bold text-stone-900 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
              <span>Keuntungan Member NUSAVA:</span>
            </p>
            <ul className="space-y-1 text-stone-600 text-[11px] pl-5 list-disc">
              <li>Bonus langsung <strong>25.000 NUSAVA Poin</strong> (bisa ditukar potongan Rp 25.000)</li>
              <li>Dapat tambahan <strong>+{earnedPoints.toLocaleString('id-ID')} Poin</strong> dari pesanan ini</li>
              <li>Simpan alamat pengiriman & pantau kurir real-time</li>
            </ul>
          </div>

          <div className="space-y-2.5 pt-1">
            <Link
              href="/register?redirect=/checkout"
              className="w-full py-3 px-5 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Daftar Akun Baru & Lanjut Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login?redirect=/checkout"
              className="w-full py-2.5 px-5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors block"
            >
              Sudah Punya Akun? Masuk di Sini
            </Link>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <Link
              href="/cart"
              className="text-xs text-stone-500 hover:text-stone-900 font-semibold"
            >
              ← Kembali ke Keranjang Belanja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-500">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Keranjang Belanja Masih Kosong</h1>
        <p className="text-sm text-stone-500 mt-2 mb-6">
          Kamu belum memilih oleh-oleh atau produk khas Nusantara untuk dibeli.
        </p>
        <Link
          href="/products"
          className="inline-flex px-7 py-3 bg-[#003d29] text-white text-sm font-semibold rounded-xl hover:bg-[#002b1d] transition-colors shadow-xs"
        >
          Lihat Katalog Oleh-oleh
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F5F7] min-h-screen py-5 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Top Marketplace Checkout Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-stone-200/80">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:text-[#003d29] hover:border-[#003d29] transition-colors"
              title="Kembali ke Keranjang"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                Checkout
              </h1>
              <p className="text-[11px] text-stone-500">
                Pastikan alamat pengiriman, layanan ekspedisi, dan metode pembayaran sudah sesuai.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#003d29] bg-white border border-stone-200 px-3 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-[#003d29]" />
            <span>Pembayaran Resmi & Terlindungi</span>
          </div>
        </div>

        {(errorMessage || Object.keys(errors).length > 0) && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">
              {errorMessage || 'Mohon lengkapi detail nama penerima, nomor HP, dan alamat jalan.'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
            {/* =================================================================
                KOLOM KIRI (8 Kolom — Gaya Tokopedia / Shopee / Blibli)
            ================================================================= */}
            <div className="lg:col-span-8 space-y-4">
              {/* ---------------------------------------------------------------
                  1. KARTU ALAMAT PENGIRIMAN (Compact Address Card + Dropdown Domisili)
              --------------------------------------------------------------- */}
              <section className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                {/* Garis Aksen Atas Khas Shopee/Tokopedia */}
                <div className="h-1 w-full bg-[#003d29]" />

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Baris Header Alamat + Dropdown Ganti Alamat */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#003d29] shrink-0" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                        Alamat Pengiriman
                      </span>
                      <span className="text-[10px] font-bold bg-[#003d29]/10 text-[#003d29] px-2 py-0.5 rounded">
                        {activePresetLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Dropdown Pilih Alamat Tersimpan */}
                      <div className="relative flex-1 sm:flex-initial">
                        <select
                          value={selectedAddressPresetId}
                          onChange={(e) => handleSelectAddressPreset(e.target.value)}
                          className="w-full sm:w-56 appearance-none bg-[#FAF9F5] hover:bg-stone-100 border border-stone-200 focus:border-[#003d29] text-stone-800 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer transition-colors"
                        >
                          <optgroup label="Pilih Alamat Tersimpan">
                            {savedAddresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {addr.label} ({addr.city})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Lainnya">
                            <option value="new">+ Tambah Alamat Baru</option>
                            {selectedAddressPresetId === 'custom' && (
                              <option value="custom">Domisili Pilihan</option>
                            )}
                          </optgroup>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditingAddressDetail(!isEditingAddressDetail)}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-[#003d29] text-xs font-semibold text-[#003d29] bg-white transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>{isEditingAddressDetail ? 'Selesai' : 'Ubah Detail'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Ringkasan Penerima & Alamat Aktif (Tampilan Bersih ala Tokopedia/Blibli) */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      <span className="font-extrabold text-stone-900">{watchedFullName || 'Nama Penerima'}</span>
                      <span className="text-stone-300">•</span>
                      <span className="font-semibold text-stone-600">{watchedPhone || '-'}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {watchedStreetAddress || 'Alamat jalan belum diisi'}, Kec. {selectedDistrictName},{' '}
                      <strong className="text-stone-800">{selectedCity}</strong>,{' '}
                      <strong className="text-stone-800">{selectedState}</strong> {watchedPostalCode}
                    </p>
                    {watchedNotes && (
                      <p className="text-[11px] text-stone-400">
                        Patokan: {watchedNotes}
                      </p>
                    )}
                  </div>

                  {/* Baris Dropdown Domisili Cepat (Provinsi • Kota/Kabupaten • Kecamatan • Kode Pos) */}
                  <div className="p-3 bg-[#FAF9F5] border border-stone-200/80 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700">
                        Domisili Tujuan (Otomatis Hitung Ongkir):
                      </span>
                      <span className="text-[10px] font-semibold text-[#003d29]">
                        Kode Pos: {watchedPostalCode}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Dropdown Provinsi */}
                      <div className="relative">
                        <label className="text-[10px] font-semibold text-stone-500 block mb-0.5">
                          Provinsi
                        </label>
                        <div className="relative">
                          <select
                            value={selectedState}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full appearance-none text-xs font-semibold text-stone-900 px-3 py-2 pr-7 bg-white border border-stone-200 focus:border-[#003d29] rounded-lg outline-none cursor-pointer"
                          >
                            {DOMICILE_DATA.map((p) => (
                              <option key={p.province} value={p.province}>
                                {p.province}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Dropdown Kota / Kabupaten */}
                      <div className="relative">
                        <label className="text-[10px] font-semibold text-stone-500 block mb-0.5">
                          Kota / Kabupaten
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCity}
                            onChange={(e) => handleCityChange(e.target.value)}
                            className="w-full appearance-none text-xs font-semibold text-stone-900 px-3 py-2 pr-7 bg-white border border-stone-200 focus:border-[#003d29] rounded-lg outline-none cursor-pointer"
                          >
                            {availableCities.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Dropdown Kecamatan */}
                      <div className="relative">
                        <label className="text-[10px] font-semibold text-stone-500 block mb-0.5">
                          Kecamatan
                        </label>
                        <div className="relative">
                          <select
                            value={selectedDistrictName}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="w-full appearance-none text-xs font-semibold text-stone-900 px-3 py-2 pr-7 bg-white border border-stone-200 focus:border-[#003d29] rounded-lg outline-none cursor-pointer"
                          >
                            {availableDistricts.map((d) => (
                              <option key={d.name} value={d.name}>
                                {d.name} ({d.postalCode})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Collapse: Muncul saat user klik "Ubah Detail" atau "+ Tambah Alamat Baru" */}
                  {isEditingAddressDetail && (
                    <div className="pt-3 border-t border-stone-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            Nama Penerima
                          </label>
                          <input
                            {...register('fullName')}
                            placeholder="Nama lengkap penerima"
                            className="w-full text-xs px-3 py-2 bg-white border border-stone-200 focus:border-[#003d29] rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            Nomor HP / WhatsApp
                          </label>
                          <input
                            {...register('phone')}
                            placeholder="081234567890"
                            className="w-full text-xs px-3 py-2 bg-white border border-stone-200 focus:border-[#003d29] rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            Kode Pos
                          </label>
                          <input
                            {...register('postalCode')}
                            placeholder="12160"
                            className="w-full text-xs font-mono px-3 py-2 bg-white border border-stone-200 focus:border-[#003d29] rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            Nama Jalan, Gedung, No. Rumah, RT/RW
                          </label>
                          <input
                            {...register('streetAddress')}
                            placeholder="Contoh: Jl. Wijaya II No. 48, RT 04/RW 02"
                            className="w-full text-xs px-3 py-2 bg-white border border-stone-200 focus:border-[#003d29] rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            Detail Patokan (Opsional)
                          </label>
                          <input
                            {...register('notes')}
                            placeholder="Contoh: Pagar hitam samping apotek"
                            className="w-full text-xs px-3 py-2 bg-white border border-stone-200 focus:border-[#003d29] rounded-lg outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Kartu Alamat: Toggle Kirim Sebagai Dropshipper */}
                  <div className="pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-stone-700 font-medium">
                      <input
                        type="checkbox"
                        checked={isDropship}
                        onChange={(e) => setIsDropship(e.target.checked)}
                        className="rounded border-stone-300 text-[#003d29] focus:ring-[#003d29]"
                      />
                      <span>Kirim sebagai Dropshipper (Cantumkan nama pengirim Anda)</span>
                    </label>

                    {isDropship && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={dropshipSenderName}
                          onChange={(e) => setDropshipSenderName(e.target.value)}
                          placeholder="Nama Pengirim"
                          className="text-xs px-2.5 py-1.5 bg-[#FAF9F5] border border-stone-200 rounded-lg outline-none focus:border-[#003d29] w-40"
                        />
                        <input
                          type="text"
                          value={dropshipSenderPhone}
                          onChange={(e) => setDropshipSenderPhone(e.target.value)}
                          placeholder="No. HP Pengirim"
                          className="text-xs px-2.5 py-1.5 bg-[#FAF9F5] border border-stone-200 rounded-lg outline-none focus:border-[#003d29] w-36"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------------------
                  2. KARTU RINCIAN PESANAN PER TOKO & PENGIRIMAN (Gaya Tokopedia / Shopee)
              --------------------------------------------------------------- */}
              <section className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
                {/* Store Header (Persis Tokopedia / Blibli Official Store) */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#003d29] shrink-0" />
                    <span className="text-xs sm:text-sm font-extrabold text-stone-900">
                      NUSAVA Official Hub & Mitra Toko Daerah
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      Dikirim dari Yogyakarta
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-500">
                    {itemCount} Barang ({(totalWeightGrams / 1000).toFixed(1)} kg)
                  </span>
                </div>

                {/* Daftar Produk yang Dipesan */}
                <div className="divide-y divide-stone-100">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex items-start gap-3.5 first:pt-0 last:pb-0">
                      <div className="relative w-16 h-16 bg-[#F5F6F6] rounded-lg overflow-hidden shrink-0 border border-stone-200">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.productTitle}
                            fill
                            loading="lazy"
                            decoding="async"
                            className="object-contain p-1.5"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                          {item.productTitle}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Varian: {item.variantTitle}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-stone-500">
                            {item.quantity} barang x {formatCurrency(item.unitPrice)}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-stone-900">
                            {formatCurrency(item.lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Baris Pilih Pengiriman / Kurir (Gaya Selector Bar Tokopedia & Blibli) */}
                <div className="p-3.5 bg-[#FAF9F5] border border-stone-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CourierLogo courierId={activeCourier.id} className="h-7 w-auto" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-stone-900">
                            {activeCourier.name}
                          </span>
                          {activeCourier.badge && (
                            <span className="text-[10px] font-bold bg-[#003d29] text-white px-1.5 py-0.5 rounded">
                              {activeCourier.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          {activeCourier.service} ke <strong className="text-stone-800">{selectedCity}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/70">
                      <span className="text-xs sm:text-sm font-extrabold text-[#003d29]">
                        {activeCourier.cost === 0 ? 'Rp 0 (Bebas Ongkir)' : formatCurrency(activeCourier.cost)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCourierSelector(!showCourierSelector)}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-bold text-[#003d29] flex items-center gap-1 transition-colors"
                      >
                        <span>Ubah Kurir</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCourierSelector ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown / Daftar Lengkap Ekspedisi saat "Ubah Kurir" diklik */}
                  {showCourierSelector && (
                    <div className="pt-3 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {courierOptions.map((courier: any) => {
                        const isSelected = selectedCourierId === courier.id;
                        return (
                          <button
                            type="button"
                            key={courier.id}
                            onClick={() => {
                              setSelectedCourierId(courier.id);
                              setShowCourierSelector(false);
                            }}
                            className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'border-[#003d29] bg-white ring-1 ring-[#003d29]'
                                : 'border-stone-200 bg-white/70 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CourierLogo courierId={courier.id} className="h-6 w-auto" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-stone-900 truncate">{courier.name}</p>
                                <p className="text-[10px] text-stone-500 truncate">{courier.service}</p>
                              </div>
                            </div>
                            <span className="text-xs font-extrabold text-[#003d29] shrink-0">
                              {courier.cost === 0 ? 'Gratis' : formatCurrency(courier.cost)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Proteksi Pengiriman Makanan / Barang Pecah Belah */}
                  <div className="pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700">
                      <input
                        type="checkbox"
                        checked={shippingInsurance}
                        onChange={(e) => setShippingInsurance(e.target.checked)}
                        className="rounded border-stone-300 text-[#003d29] focus:ring-[#003d29]"
                      />
                      <span>Proteksi Kerusakan Pengiriman & Bubble Wrap Tebal</span>
                    </label>
                    <span className="text-[11px] font-bold text-[#003d29]">Gratis</span>
                  </div>
                </div>

                {/* Baris Catatan untuk Penjual & Opsi Hampers (Gaya Shopee / Tokopedia) */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-600 shrink-0">Pesan:</span>
                    <input
                      type="text"
                      value={sellerNote}
                      onChange={(e) => setSellerNote(e.target.value)}
                      placeholder="Tinggalkan catatan untuk penjual (opsional)..."
                      className="w-full text-xs px-3 py-2 bg-[#FAF9F5] border border-stone-200 focus:bg-white focus:border-[#003d29] rounded-lg outline-none"
                    />
                  </div>

                  <label className="flex items-center justify-between px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-lg cursor-pointer select-none text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <Gift className="w-3.5 h-3.5 text-[#003d29]" />
                      <span>Kemas Hampers & Kartu Ucapan</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#003d29]">
                        +{formatCurrency(GIFT_WRAP_COST)}
                      </span>
                      <input
                        type="checkbox"
                        checked={giftDetails.isGiftWrap}
                        onChange={(e) => setGiftDetails({ isGiftWrap: e.target.checked })}
                        className="rounded border-stone-300 text-[#003d29] focus:ring-[#003d29]"
                      />
                    </div>
                  </label>
                </div>

                {giftDetails.isGiftWrap && (
                  <div className="p-3 bg-[#FAF9F5] border border-stone-200 rounded-xl flex flex-col sm:flex-row gap-2.5">
                    <select
                      value={giftDetails.packagingType}
                      onChange={(e) =>
                        setGiftDetails({ packagingType: e.target.value as 'besek' | 'hardbox' })
                      }
                      className="text-xs font-semibold text-stone-800 bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#003d29]"
                    >
                      <option value="besek">Wadah: Besek Bambu Pita Tradisional</option>
                      <option value="hardbox">Wadah: Hardbox Eksklusif NUSAVA</option>
                    </select>
                    <input
                      type="text"
                      value={giftDetails.message}
                      onChange={(e) => setGiftDetails({ message: e.target.value })}
                      placeholder="Tulis ucapan pada kartu hampers..."
                      className="flex-1 text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg outline-none focus:border-[#003d29]"
                    />
                  </div>
                )}
              </section>

              {/* ---------------------------------------------------------------
                  3. KARTU METODE PEMBAYARAN (VA Bank, QRIS, COD ala Blibli/Tokopedia)
              --------------------------------------------------------------- */}
              <section className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#003d29]" />
                    <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-700">
                      Metode Pembayaran
                    </h2>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Pilih salah satu kanal pembayaran resmi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PAYMENT_CHANNELS.map((channel) => {
                    const isSelected = selectedPaymentChannel === channel.id;
                    return (
                      <button
                        type="button"
                        key={channel.id}
                        onClick={() => handleSelectPaymentChannel(channel)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-[#003d29] bg-[#FAF9F5] ring-1 ring-[#003d29]'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                            {channel.group === 'QRIS' ? (
                              <QrCode className="w-4 h-4 text-[#003d29]" />
                            ) : channel.group === 'COD' ? (
                              <Banknote className="w-4 h-4 text-[#003d29]" />
                            ) : (
                              <Building2 className="w-4 h-4 text-[#003d29]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-stone-900">
                                {channel.name}
                              </span>
                              {channel.badge && (
                                <span className="text-[9px] font-bold bg-[#003d29]/10 text-[#003d29] px-1.5 py-0.5 rounded">
                                  {channel.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                              {channel.subtitle}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                            isSelected ? 'border-[#003d29] bg-[#003d29]' : 'border-stone-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Info Nomor VA / Instruksi Pembayaran yang Dipilih */}
                <div className="p-3 bg-[#FAF9F5] border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-700">
                    <ShieldCheck className="w-4 h-4 text-[#003d29] shrink-0" />
                    <span>
                      Metode aktif: <strong className="text-stone-900">{activePaymentObj.name}</strong>
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#003d29] text-[11px]">
                    {activePaymentObj.accountInfo}
                  </span>
                </div>
              </section>
            </div>

            {/* =================================================================
                KOLOM KANAN (4 Kolom Sticky — Promo, Koin/Poin & Ringkasan Belanja)
            ================================================================= */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              {/* 1. Kartu Promo Voucher & Tukar NUSAVA Poin (Persis Tokopedia / Shopee) */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
                {/* Bagian Voucher */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#003d29]" />
                      <span>Makin hemat pakai promo</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[#003d29]">
                      3 Kupon Tersedia
                    </span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                          <Check className="w-3 h-3" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-emerald-900 font-mono block">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Hemat {formatCurrency(appliedCoupon.discountType === 'SHIPPING' ? rawShippingCost : couponDiscount)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-emerald-700 hover:text-rose-600 p-1"
                        title="Hapus promo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Masukkan kode promo"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          className="flex-1 text-xs px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-lg outline-none focus:border-[#003d29] uppercase font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="px-3.5 py-2 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                        >
                          Pakai
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                      )}

                      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                        {AVAILABLE_COUPONS.map((cp) => (
                          <button
                            key={cp.code}
                            type="button"
                            onClick={() => handleApplyCoupon(cp.code)}
                            className="text-[10px] font-mono font-bold py-1.5 px-2 bg-[#FAF9F5] hover:bg-emerald-50 hover:border-[#003d29] text-[#003d29] rounded-lg border border-stone-200 transition-colors truncate"
                            title={cp.description}
                          >
                            {cp.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Toggle Tukar NUSAVA Poin (Gaya GoPay Coins / Shopee Koin) */}
                {points > 0 && (
                  <div className="pt-3 border-t border-stone-100">
                    <label className="flex items-center justify-between p-3 bg-[#FAF9F5] border border-stone-200 rounded-xl cursor-pointer select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-stone-900 block">
                            Tukar {points.toLocaleString('id-ID')} NUSAVA Poin
                          </span>
                          <span className="text-[10px] text-stone-500">
                            Potong tagihan langsung <strong className="text-[#003d29]">-{formatCurrency(Math.min(points, totalBeforePoints))}</strong>
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                        className="w-4 h-4 rounded text-[#003d29] focus:ring-[#003d29] cursor-pointer"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* 2. Kartu Ringkasan Belanja & Tombol Bayar Sekarang */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold text-stone-900 pb-2.5 border-b border-stone-100">
                  Ringkasan Belanja
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Total Harga ({itemCount} Barang)</span>
                    <span className="font-semibold text-stone-900">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Total Ongkos Kirim</span>
                    <span className="font-semibold text-stone-900">
                      {effectiveShippingCost === 0 ? (
                        <span className="text-[#003d29] font-bold">Rp 0 (Bebas Ongkir)</span>
                      ) : (
                        formatCurrency(effectiveShippingCost)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Asuransi Pengiriman</span>
                    <span className="font-semibold text-[#003d29]">Gratis ({tier})</span>
                  </div>

                  {giftCost > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Biaya Kemasan Hampers</span>
                      <span className="font-semibold text-stone-900">+{formatCurrency(giftCost)}</span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Diskon Promo ({appliedCoupon.code})</span>
                      <span>
                        -{formatCurrency(
                          appliedCoupon.discountType === 'SHIPPING' ? rawShippingCost : couponDiscount
                        )}
                      </span>
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Tukar NUSAVA Poin</span>
                      <span>-{formatCurrency(pointsDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-3 mt-2 border-t border-stone-200">
                    <span className="text-sm font-extrabold text-stone-900">Total Tagihan</span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#003d29]">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  {earnedPoints > 0 && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-200/80 text-[11px] text-emerald-900 mt-2">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                        <span>Potensi Cashback Poin</span>
                      </span>
                      <span className="font-bold text-[#003d29]">
                        +{earnedPoints.toLocaleString('id-ID')} Poin
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSubmitting ? (
                    <span>Memproses Pembayaran...</span>
                  ) : (
                    <span>Bayar Sekarang</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
