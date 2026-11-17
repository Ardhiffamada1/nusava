'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  X,
  Truck,
  CheckCircle2,
  MoreHorizontal,
  MapPin,
  ExternalLink,
  ShieldCheck,
  FileText,
  Star,
  Check,
  User,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Building2,
  Wallet,
  Lock,
  LogOut,
  Search,
  Phone,
  Mail,
  Calendar,
  Tag,
  Copy,
  HelpCircle,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { useCartStore } from '../../stores/cart-store';
import { useLanguageStore } from '../../stores/language-store';
import { formatCurrency, formatDate, formatDateTime } from '@commerceos/ui';

type AccountSection = 'profile' | 'addresses' | 'payments' | 'orders' | 'vouchers' | 'reviews' | 'help';
const VALID_SECTIONS: AccountSection[] = ['profile', 'addresses', 'payments', 'orders', 'vouchers', 'reviews', 'help'];

interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
  isPrimary: boolean;
}

interface SavedPaymentMethod {
  id: string;
  type: 'BANK_VA' | 'CARD' | 'REFUND_BANK';
  provider: string;
  accountNumber: string;
  holderName: string;
  expiry?: string;
  isPrimary: boolean;
}

interface ConnectedWallet {
  id: string;
  name: string;
  phone: string;
  connected: boolean;
}

const ADDRESS_STORAGE_KEY = 'nusava_saved_addresses_v1';
const PAYMENT_STORAGE_KEY = 'nusava_saved_payments_v1';
const WALLET_STORAGE_KEY = 'nusava_connected_wallets_v1';

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Rumah',
    recipientName: 'Budi Santoso',
    phone: '0812-3456-7890',
    streetAddress: 'Jl. Wijaya II No. 48, Kebayoran Baru',
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
    phone: '0812-3456-7890',
    streetAddress: 'Gedung Menara Mandiri Lt. 14, Jl. Jend. Sudirman Kav. 54-55',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12190',
    notes: 'Resepsionis lantai 14 pada jam kerja (09.00 - 17.00 WIB)',
    isPrimary: false,
  },
];

const DEFAULT_PAYMENTS: SavedPaymentMethod[] = [
  {
    id: 'pay-1',
    type: 'BANK_VA',
    provider: 'BCA OneKlik / Virtual Account',
    accountNumber: '•••• •••• 8829',
    holderName: 'Budi Santoso',
    isPrimary: true,
  },
  {
    id: 'pay-2',
    type: 'CARD',
    provider: 'Mandiri Debit Visa',
    accountNumber: '4512 •••• •••• 9024',
    holderName: 'Budi Santoso',
    expiry: '08/28',
    isPrimary: false,
  },
  {
    id: 'pay-3',
    type: 'REFUND_BANK',
    provider: 'Bank BCA (Rekening Pencairan Refund)',
    accountNumber: '5240 •••• 1920',
    holderName: 'Budi Santoso',
    isPrimary: false,
  },
];

const DEFAULT_WALLETS: ConnectedWallet[] = [
  { id: 'gopay', name: 'GoPay', phone: '0812-3456-7890', connected: true },
  { id: 'shopeepay', name: 'ShopeePay', phone: '0812-3456-7890', connected: true },
  { id: 'ovo', name: 'OVO', phone: '0812-3456-7890', connected: false },
  { id: 'dana', name: 'DANA', phone: '0812-3456-7890', connected: false },
];

function AccountCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading, logout, updateProfile } = useAuthStore();
  const { addItem, openCart } = useCartStore();
  const { language } = useLanguageStore();
  const isId = language === 'id';

  // Active Section State (synced with ?section= query parameter)
  const initialSectionParam = searchParams.get('section') as AccountSection | null;
  const [activeSection, setActiveSection] = useState<AccountSection>(
    initialSectionParam && VALID_SECTIONS.includes(initialSectionParam)
      ? initialSectionParam
      : 'profile',
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const param = searchParams.get('section') as AccountSection | null;
    if (param && VALID_SECTIONS.includes(param)) {
      setActiveSection(param);
    }
  }, [searchParams]);

  const switchSection = (sec: AccountSection) => {
    setActiveSection(sec);
    router.replace(`/account?section=${sec}`, { scroll: false });
  };

  // ---------------- 1. PROFILE STATE ----------------
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '0812-3456-7890');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '1994-08-17');
  const [gender, setGender] = useState(user?.gender || 'Laki-laki');
  const [isEditingNameOnly, setIsEditingNameOnly] = useState(false);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName ?? '');
      setEmail(user.email || '');
      setPhone(user.phone || '0812-3456-7890');
      setBirthDate(user.birthDate || '1994-08-17');
      setGender(user.gender || 'Laki-laki');
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthDate,
      gender,
    });
    setIsEditingNameOnly(false);
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 3000);
  };

  // ---------------- 2. ADDRESSES STATE ----------------
  const [addresses, setAddresses] = useState<SavedAddress[]>(DEFAULT_ADDRESSES);
  const [addressSearch, setAddressSearch] = useState('');
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<SavedAddress, 'id'>>({
    label: 'Rumah',
    recipientName: '',
    phone: '',
    streetAddress: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
    isPrimary: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ADDRESS_STORAGE_KEY);
        if (stored) {
          setAddresses(JSON.parse(stored));
        }
      } catch {
        // fallback to default
      }
    }
  }, []);

  const persistAddresses = (next: SavedAddress[]) => {
    setAddresses(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddrForm({
      label: 'Rumah',
      recipientName: `${firstName} ${lastName}`.trim(),
      phone: phone || '0812-3456-7890',
      streetAddress: '',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '',
      notes: '',
      isPrimary: addresses.length === 0,
    });
    setIsAddingAddress(true);
  };

  const openEditAddressModal = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setAddrForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalCode,
      notes: addr.notes,
      isPrimary: addr.isPrimary,
    });
    setIsAddingAddress(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.recipientName.trim() || !addrForm.streetAddress.trim()) return;

    let updatedList: SavedAddress[];
    if (editingAddress) {
      updatedList = addresses.map((item) => {
        if (item.id === editingAddress.id) {
          return { ...addrForm, id: editingAddress.id };
        }
        return addrForm.isPrimary ? { ...item, isPrimary: false } : item;
      });
    } else {
      const newEntry: SavedAddress = {
        ...addrForm,
        id: `addr-${Date.now()}`,
      };
      updatedList = addrForm.isPrimary
        ? [...addresses.map((a) => ({ ...a, isPrimary: false })), newEntry]
        : [...addresses, newEntry];
    }

    persistAddresses(updatedList);
    setIsAddingAddress(false);
    setEditingAddress(null);
  };

  const handleSetPrimaryAddress = (id: string) => {
    const next = addresses.map((a) => ({
      ...a,
      isPrimary: a.id === id,
    }));
    persistAddresses(next);
  };

  const handleDeleteAddress = (id: string) => {
    const next = addresses.filter((a) => a.id !== id);
    if (next.length > 0 && !next.some((a) => a.isPrimary)) {
      next[0].isPrimary = true;
    }
    persistAddresses(next);
  };

  const filteredAddresses = addresses.filter((a) => {
    if (!addressSearch.trim()) return true;
    const q = addressSearch.toLowerCase();
    return (
      a.label.toLowerCase().includes(q) ||
      a.recipientName.toLowerCase().includes(q) ||
      a.streetAddress.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    );
  });

  // ---------------- 3. PAYMENTS STATE ----------------
  const [payments, setPayments] = useState<SavedPaymentMethod[]>(DEFAULT_PAYMENTS);
  const [wallets, setWallets] = useState<ConnectedWallet[]>(DEFAULT_WALLETS);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SavedPaymentMethod | null>(null);
  const [payForm, setPayForm] = useState<Omit<SavedPaymentMethod, 'id'>>({
    type: 'BANK_VA',
    provider: 'BCA Virtual Account',
    accountNumber: '',
    holderName: '',
    expiry: '',
    isPrimary: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedPay = localStorage.getItem(PAYMENT_STORAGE_KEY);
        if (storedPay) setPayments(JSON.parse(storedPay));
        const storedWal = localStorage.getItem(WALLET_STORAGE_KEY);
        if (storedWal) setWallets(JSON.parse(storedWal));
      } catch {
        // fallback
      }
    }
  }, []);

  const persistPayments = (next: SavedPaymentMethod[]) => {
    setPayments(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const persistWallets = (next: ConnectedWallet[]) => {
    setWallets(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const openAddPaymentModal = () => {
    setEditingPayment(null);
    setPayForm({
      type: 'BANK_VA',
      provider: 'Bank BCA',
      accountNumber: '',
      holderName: `${firstName} ${lastName}`.trim(),
      expiry: '',
      isPrimary: payments.length === 0,
    });
    setIsPaymentModalOpen(true);
  };

  const openEditPaymentModal = (pay: SavedPaymentMethod) => {
    setEditingPayment(pay);
    setPayForm({
      type: pay.type,
      provider: pay.provider,
      accountNumber: pay.accountNumber,
      holderName: pay.holderName,
      expiry: pay.expiry || '',
      isPrimary: pay.isPrimary,
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.provider.trim() || !payForm.accountNumber.trim()) return;

    const rawNum = payForm.accountNumber.trim();
    const maskedNum =
      rawNum.includes('•') || rawNum.length <= 4
        ? rawNum
        : `•••• •••• ${rawNum.slice(-4)}`;

    let next: SavedPaymentMethod[];
    if (editingPayment) {
      next = payments.map((p) => {
        if (p.id === editingPayment.id) {
          return { ...payForm, accountNumber: maskedNum, id: editingPayment.id };
        }
        return payForm.isPrimary ? { ...p, isPrimary: false } : p;
      });
    } else {
      const created: SavedPaymentMethod = {
        ...payForm,
        accountNumber: maskedNum,
        id: `pay-${Date.now()}`,
      };
      next = payForm.isPrimary
        ? [...payments.map((p) => ({ ...p, isPrimary: false })), created]
        : [...payments, created];
    }

    persistPayments(next);
    setIsPaymentModalOpen(false);
    setEditingPayment(null);
  };

  const handleSetPrimaryPayment = (id: string) => {
    persistPayments(
      payments.map((p) => ({
        ...p,
        isPrimary: p.id === id,
      })),
    );
  };

  const handleDeletePayment = (id: string) => {
    const next = payments.filter((p) => p.id !== id);
    if (next.length > 0 && !next.some((p) => p.isPrimary)) {
      next[0].isPrimary = true;
    }
    persistPayments(next);
  };

  const toggleWalletConnection = (id: string) => {
    const next = wallets.map((w) =>
      w.id === id ? { ...w, connected: !w.connected, phone: phone || w.phone } : w,
    );
    persistWallets(next);
  };

  // ---------------- 4. ORDERS STATE ----------------
  const [activeOrderTab, setActiveOrderTab] = useState<'ALL' | 'NOT_SHIPPED' | 'CANCELLED'>('ALL');
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

  const fullNameDisplay = `${firstName} ${lastName}`.trim() || 'Pelanggan NUSAVA';
  const initials = (firstName?.[0] || 'N').toUpperCase();
  const primaryAddress = addresses.find((a) => a.isPrimary) || addresses[0];
  const primaryPayment = payments.find((p) => p.isPrimary) || payments[0];

  const demoOrders = [
    {
      id: 'demo-order-1',
      orderNumber: '112-0822160-5390023',
      orderPlaced: '2 Juni 2024',
      grandTotal: 157990,
      shipTo: fullNameDisplay,
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
      shipTo: fullNameDisplay,
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

  const hasRealOrders = ordersData?.items && ordersData.items.length > 0;
  const rawOrders = hasRealOrders ? ordersData.items : demoOrders;

  const displayOrders = rawOrders.filter((order: any) => {
    if (activeOrderTab === 'NOT_SHIPPED') {
      return order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
    }
    if (activeOrderTab === 'CANCELLED') {
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
        openCart();
      }
    } catch {
      openCart();
    }
  };

  const sectionLabels: Record<AccountSection, string> = {
    profile: 'Biodata Diri',
    addresses: 'Daftar Alamat',
    payments: 'Pembayaran Tersimpan',
    orders: 'Daftar Transaksi',
    vouchers: 'Voucher & Kupon Promo',
    reviews: 'Ulasan Produk Saya',
    help: 'Pusat Bantuan',
  };

  if (!isAuthLoading && !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 font-sans text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#003d29]/10 text-[#003d29] flex items-center justify-center mx-auto">
          <User className="w-7 h-7 text-[#003d29]" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-extrabold text-stone-900">
            Masuk ke Akun NUSAVA Anda
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed">
            Silakan masuk terlebih dahulu untuk melihat profil, mengelola daftar alamat pengiriman, metode pembayaran tersimpan, serta melacak pesanan Anda.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold transition-colors"
          >
            Masuk Sekarang
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-stone-200 hover:bg-[#FAF9F5] text-stone-800 text-xs font-bold transition-colors"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-8 font-sans overflow-x-hidden">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 sm:pb-4 mb-4 sm:mb-6 border-b border-stone-200 gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-stone-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#003d29] transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-stone-700 font-semibold">Akun Saya</span>
          <span>/</span>
          <span className="text-[#003d29] font-bold">{sectionLabels[activeSection]}</span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <span className="text-stone-500 truncate">
            Akun aktif: <strong className="text-stone-900">{fullNameDisplay}</strong>
          </span>
          {user && (
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="text-stone-400 hover:text-rose-600 font-semibold underline transition-colors shrink-0"
            >
              Keluar
            </button>
          )}
        </div>
      </div>

      {/* Main 12-Column Marketplace Account Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* LEFT SIDEBAR: User Card & Account Navigation (3 Cols) */}
        <aside className="lg:col-span-3 space-y-4 sm:space-y-5">
          {/* User Summary Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#003d29] text-white font-extrabold text-base sm:text-lg flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-extrabold text-stone-900 truncate">
                    {fullNameDisplay}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      switchSection('profile');
                      setIsEditingNameOnly(true);
                    }}
                    className="text-stone-400 hover:text-[#003d29] transition-colors shrink-0"
                    title="Ubah nama"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 truncate">{email}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#003d29] bg-[#003d29]/8 px-2 py-0.5 rounded-md mt-1">
                  <ShieldCheck className="w-3 h-3 text-[#003d29]" />
                  <span>Member Setia NUSAVA</span>
                </span>
              </div>
            </div>

            {/* Navigation Menu (Grid on Mobile, Vertical Stack on Desktop) */}
            <nav className="pt-3 border-t border-stone-100 grid grid-cols-2 lg:flex lg:flex-col gap-1.5 lg:gap-1">
              <button
                type="button"
                onClick={() => switchSection('profile')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSection === 'profile'
                    ? 'bg-[#003d29] text-white shadow-2xs'
                    : 'bg-[#FAF9F5] lg:bg-transparent text-stone-700 hover:bg-[#FAF9F5] hover:text-[#003d29]'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Profil Saya</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchSection('orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSection === 'orders'
                    ? 'bg-[#003d29] text-white shadow-2xs'
                    : 'bg-[#FAF9F5] lg:bg-transparent text-stone-700 hover:bg-[#FAF9F5] hover:text-[#003d29]'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Transaksi</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    activeSection === 'orders'
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {rawOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchSection('addresses')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSection === 'addresses'
                    ? 'bg-[#003d29] text-white shadow-2xs'
                    : 'bg-[#FAF9F5] lg:bg-transparent text-stone-700 hover:bg-[#FAF9F5] hover:text-[#003d29]'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Alamat</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    activeSection === 'addresses'
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {addresses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchSection('payments')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSection === 'payments'
                    ? 'bg-[#003d29] text-white shadow-2xs'
                    : 'bg-[#FAF9F5] lg:bg-transparent text-stone-700 hover:bg-[#FAF9F5] hover:text-[#003d29]'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Pembayaran</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    activeSection === 'payments'
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {payments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchSection('vouchers')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSection === 'vouchers'
                    ? 'bg-[#003d29] text-white shadow-2xs'
                    : 'bg-[#FAF9F5] lg:bg-transparent text-stone-700 hover:bg-[#FAF9F5] hover:text-[#003d29]'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Voucher Promo</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    activeSection === 'vouchers'
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  3
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchSection('reviews')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSection === 'reviews'
                    ? 'bg-[#003d29] text-white shadow-2xs'
                    : 'bg-[#FAF9F5] lg:bg-transparent text-stone-700 hover:bg-[#FAF9F5] hover:text-[#003d29]'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Ulasan Saya</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchSection('help')}
                className={`col-span-2 lg:col-span-1 w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSection === 'help'
                    ? 'bg-[#003d29] text-white shadow-2xs'
                    : 'bg-[#FAF9F5] lg:bg-transparent text-stone-700 hover:bg-[#FAF9F5] hover:text-[#003d29]'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Pusat Bantuan & Komplain</span>
                </span>
              </button>
            </nav>
          </div>

          {/* Customer Care Support Card (Desktop Sidebar) */}
          <div className="hidden lg:block bg-[#FAF9F5] border border-stone-200 rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <MessageSquare className="w-4 h-4 text-[#003d29]" />
              <span>Bantuan Pelanggan 24/7</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Ada kendala pengiriman kurir atau pengembalian dana? Tim Layanan NUSAVA siap membantu.
            </p>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20NUSAVA,%20saya%20butuh%20bantuan%20seputar%20akun%20dan%20pesanan%20saya."
              target="_blank"
              rel="noreferrer"
              className="w-full bg-white hover:bg-stone-100 text-[#003d29] border border-stone-200 font-bold py-2.5 px-4 rounded-xl text-center block transition-colors"
            >
              Chat WhatsApp Resmi
            </a>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT (9 Cols) */}
        <main className="lg:col-span-9 space-y-5 sm:space-y-6 min-w-0">
          {/* =====================================================================
              SECTION 1: BIODATA DIRI & UBAH NAMA / PROFIL
          ===================================================================== */}
          {activeSection === 'profile' && (
            <div className="space-y-5 sm:space-y-6">
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xs space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-stone-100">
                  <div>
                    <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                      Biodata Diri
                    </h1>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Kelola informasi nama, kontak, dan identitas akun Anda untuk kemudahan transaksi di NUSAVA.
                    </p>
                  </div>
                </div>

                {profileSavedNotice && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Perubahan nama dan biodata profil Anda berhasil disimpan!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileSavedNotice(false)}
                      className="text-emerald-700 hover:text-emerald-950"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
                  {/* Left: Profile Avatar Card */}
                  <div className="md:col-span-4 bg-[#FAF9F5] border border-stone-200 rounded-2xl p-4 sm:p-5 text-center space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3.5 md:flex-col text-left md:text-center">
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#003d29] text-white font-extrabold text-2xl md:text-3xl flex items-center justify-center shrink-0 md:mx-auto shadow-xs">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-extrabold text-stone-900 truncate">
                          {fullNameDisplay}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5 truncate">{email}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-stone-200/80 text-left space-y-1.5 text-[11px] text-stone-600">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Status Akun:</span>
                        <span className="font-bold text-[#003d29]">Terverifikasi</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Voucher Ongkir:</span>
                        <span className="font-bold text-stone-800">3 Tersedia</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Editable Profile Form */}
                  <form onSubmit={handleSaveProfile} className="md:col-span-8 space-y-4 text-xs">
                    <div className="p-3.5 sm:p-4 bg-[#FAF9F5] border border-stone-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#003d29]" />
                          <span>Ubah Nama Lengkap</span>
                        </span>
                        {isEditingNameOnly && (
                          <span className="text-[10px] font-bold text-[#003d29] bg-[#003d29]/10 px-2 py-0.5 rounded">
                            Mode Edit Nama
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">
                            Nama Depan
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            placeholder="Nama depan"
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#003d29]"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">
                            Nama Belakang
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Nama belakang"
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#003d29]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Alamat Email
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-[#003d29]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Nomor HP / WhatsApp
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-[#003d29]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Tanggal Lahir
                        </label>
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-[#003d29]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Jenis Kelamin
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-[#003d29] cursor-pointer"
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="submit"
                        className="w-full sm:w-auto justify-center px-6 py-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan Perubahan Profil</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Quick Overview Cards: Address & Saved Payment Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Primary Address Preview */}
                <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#003d29]" />
                        <span>Alamat Pengiriman Utama</span>
                      </span>
                      <span className="text-[10px] font-bold bg-[#003d29]/10 text-[#003d29] px-2 py-0.5 rounded">
                        {primaryAddress?.label || 'Rumah'}
                      </span>
                    </div>
                    {primaryAddress ? (
                      <div className="text-xs text-stone-600 space-y-0.5">
                        <p className="font-bold text-stone-900">
                          {primaryAddress.recipientName} ({primaryAddress.phone})
                        </p>
                        <p>{primaryAddress.streetAddress}</p>
                        <p className="text-stone-500">
                          {primaryAddress.city}, {primaryAddress.province} {primaryAddress.postalCode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400">Belum ada alamat tersimpan.</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        switchSection('addresses');
                        if (primaryAddress) openEditAddressModal(primaryAddress);
                      }}
                      className="text-xs font-bold text-[#003d29] hover:underline flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Ubah Alamat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => switchSection('addresses')}
                      className="text-xs font-semibold text-stone-500 hover:text-stone-900"
                    >
                      Lihat Semua ({addresses.length}) →
                    </button>
                  </div>
                </div>

                {/* Primary Payment Preview */}
                <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#003d29]" />
                        <span>Pembayaran Tersimpan Utama</span>
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                        Aktif
                      </span>
                    </div>
                    {primaryPayment ? (
                      <div className="text-xs text-stone-600 space-y-0.5">
                        <p className="font-bold text-stone-900">{primaryPayment.provider}</p>
                        <p className="font-mono text-stone-700">{primaryPayment.accountNumber}</p>
                        <p className="text-stone-500">a.n. {primaryPayment.holderName}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400">Belum ada metode pembayaran tersimpan.</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => switchSection('payments')}
                      className="text-xs font-bold text-[#003d29] hover:underline"
                    >
                      Kelola Metode Pembayaran →
                    </button>
                    <span className="text-[11px] text-stone-400">
                      {wallets.filter((w) => w.connected).length} E-Wallet Terhubung
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              SECTION 2: DAFTAR ALAMAT (BUKU ALAMAT & UBAH ALAMAT)
          ===================================================================== */}
          {activeSection === 'addresses' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xs space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                    Daftar Alamat Pengiriman
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Kelola alamat tujuan pengiriman oleh-oleh untuk rumah, kantor, maupun kerabat.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddAddressModal}
                  className="w-full sm:w-auto justify-center px-4 py-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Alamat Baru</span>
                </button>
              </div>

              {/* Search Address Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={addressSearch}
                  onChange={(e) => setAddressSearch(e.target.value)}
                  placeholder="Cari nama penerima, jalan, atau kota..."
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:border-[#003d29] outline-none"
                />
              </div>

              {/* Address Cards List */}
              <div className="space-y-3.5 sm:space-y-4">
                {filteredAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                      addr.isPrimary
                        ? 'bg-[#FAF9F5] border-[#003d29]'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 sm:gap-4">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-700 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-md">
                            {addr.label}
                          </span>
                          {addr.isPrimary && (
                            <span className="bg-[#003d29] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Alamat Utama</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-extrabold text-stone-900 pt-1">
                          {addr.recipientName}
                        </h3>
                        <p className="text-stone-600 font-medium">{addr.phone}</p>
                        <p className="text-stone-800 leading-relaxed max-w-xl">
                          {addr.streetAddress}
                        </p>
                        <p className="text-stone-500">
                          {addr.city}, {addr.province} • Kode Pos {addr.postalCode}
                        </p>
                        {addr.notes && (
                          <p className="text-[11px] text-stone-500 bg-white border border-stone-200/80 px-3 py-1.5 rounded-lg inline-block mt-1">
                            <strong>Patokan Kurir:</strong> {addr.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-200/70 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditAddressModal(addr)}
                          className="px-3.5 py-2 bg-white hover:bg-stone-50 text-[#003d29] border border-stone-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Ubah Alamat</span>
                        </button>

                        {!addr.isPrimary && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryAddress(addr.id)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-[#003d29] hover:underline"
                            >
                              Jadikan Utama
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Hapus alamat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              SECTION 3: PEMBAYARAN TERSIMPAN (KARTU, VA, REKENING & E-WALLET)
          ===================================================================== */}
          {activeSection === 'payments' && (
            <div className="space-y-5 sm:space-y-6">
              {/* Saved Cards & Virtual Accounts */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xs space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                      Pembayaran Tersimpan
                    </h1>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Kelola rekening Virtual Account, kartu debit/kredit, dan rekening pencairan pengembalian dana (refund).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAddPaymentModal}
                    className="w-full sm:w-auto justify-center px-4 py-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Metode Pembayaran</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {payments.map((pay) => (
                    <div
                      key={pay.id}
                      className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-colors ${
                        pay.isPrimary
                          ? 'bg-[#FAF9F5] border-[#003d29]'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-900 truncate">
                            {pay.type === 'CARD' ? (
                              <CreditCard className="w-4 h-4 text-[#003d29] shrink-0" />
                            ) : (
                              <Building2 className="w-4 h-4 text-[#003d29] shrink-0" />
                            )}
                            <span className="truncate">{pay.provider}</span>
                          </span>
                          {pay.isPrimary && (
                            <span className="bg-[#003d29] text-white text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                              Utama
                            </span>
                          )}
                        </div>

                        <p className="text-sm sm:text-base font-extrabold font-mono text-stone-900 tracking-wider pt-1">
                          {pay.accountNumber}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-stone-500">
                          <span>Pemilik: <strong className="text-stone-700">{pay.holderName}</strong></span>
                          {pay.expiry && <span>Berlaku s/d: {pay.expiry}</span>}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEditPaymentModal(pay)}
                            className="font-bold text-[#003d29] hover:underline flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>
                          {!pay.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryPayment(pay.id)}
                              className="font-semibold text-stone-600 hover:text-stone-900 hover:underline"
                            >
                              Jadikan Utama
                            </button>
                          )}
                        </div>

                        {!pay.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(pay.id)}
                            className="text-stone-400 hover:text-rose-600 transition-colors"
                            title="Hapus metode pembayaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Digital Wallets (E-Wallets & QRIS) */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xs space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-[#003d29]" />
                      <span>Dompet Digital (E-Wallet) Terhubung</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Hubungkan e-wallet untuk pembayaran instan satu klik saat checkout.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {wallets.map((w) => (
                    <div
                      key={w.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-stone-200 bg-[#FAF9F5] flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 text-xs min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 text-sm">{w.name}</span>
                          {w.connected ? (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                              Terhubung
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-stone-200 text-stone-600 px-2 py-0.5 rounded">
                              Belum
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {w.connected ? `No: ${w.phone}` : 'Klik hubungkan untuk aktivasi'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleWalletConnection(w.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                          w.connected
                            ? 'bg-white border border-stone-200 text-stone-700 hover:text-rose-600 hover:border-rose-200'
                            : 'bg-[#003d29] text-white hover:bg-[#002b1c]'
                        }`}
                      >
                        {w.connected ? 'Putuskan' : 'Hubungkan'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-[#FAF9F5] border border-stone-200 rounded-xl flex items-start sm:items-center gap-2.5 text-[11px] text-stone-600">
                  <Lock className="w-4 h-4 text-[#003d29] shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    Seluruh informasi pembayaran Anda dienkripsi dan dilindungi standar keamanan transaksi NUSAVA. Kami tidak pernah menyimpan kode CVV/PIN Anda.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              SECTION 4: DAFTAR TRANSAKSI (PESANAN SAYA)
          ===================================================================== */}
          {activeSection === 'orders' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                    Daftar Transaksi
                  </h1>
                  <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-stone-200">
                    {displayOrders.length}
                  </span>
                </div>

                {/* Time Period Filter Dropdown */}
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                  className="text-xs font-semibold text-stone-800 bg-white border border-stone-200 rounded-xl px-3 py-1.5 sm:py-2 outline-none cursor-pointer hover:border-stone-300 shadow-2xs"
                >
                  <option value="3_MONTHS">3 Bulan Terakhir</option>
                  <option value="6_MONTHS">6 Bulan Terakhir</option>
                  <option value="2024">Tahun 2024</option>
                  <option value="ALL">Semua Waktu</option>
                </select>
              </div>

              {/* Order Status Filter Pills */}
              <div className="flex items-center p-1 bg-stone-100 rounded-xl text-xs font-semibold text-stone-600 w-full sm:w-fit overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveOrderTab('ALL')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-center ${
                    activeOrderTab === 'ALL'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOrderTab('NOT_SHIPPED')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-center ${
                    activeOrderTab === 'NOT_SHIPPED'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Dikirim
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOrderTab('CANCELLED')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-center ${
                    activeOrderTab === 'CANCELLED'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Dibatalkan
                </button>
              </div>

              {/* Orders List */}
              {isOrdersLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-56 bg-stone-50 border border-stone-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : displayOrders.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-stone-200 bg-[#FAF9F5] rounded-2xl p-6">
                  <Package className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-900">
                    Belum ada transaksi pada kategori ini
                  </p>
                  <p className="text-xs text-stone-500 mt-1 mb-5">
                    Yuk mulai jelajahi aneka oleh-oleh Nusantara khas daerah terpopuler.
                  </p>
                  <Link
                    href="/products"
                    className="text-xs font-bold bg-[#003d29] hover:bg-[#002b1c] text-white px-6 py-2.5 rounded-xl transition-colors inline-block shadow-2xs"
                  >
                    Mulai Belanja
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
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
                        <div className="bg-[#FAF9F5] border-b border-stone-200 p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs">
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-start sm:items-center gap-3 sm:gap-10">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                                TANGGAL TRANSAKSI
                              </span>
                              <span className="font-semibold text-stone-800 mt-0.5 block">
                                {order.createdAt ? formatDate(order.createdAt) : order.orderPlaced || '2 Juni 2024'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                                TOTAL BELANJA
                              </span>
                              <span className="font-extrabold text-stone-900 mt-0.5 block">
                                {formatCurrency(Number(order.grandTotal))}
                              </span>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                                DIKIRIM KE
                              </span>
                              <button
                                type="button"
                                onClick={() => switchSection('addresses')}
                                className="flex items-center gap-1 font-semibold text-[#003d29] hover:underline mt-0.5"
                              >
                                <span className="truncate">{order.shippingAddress?.fullName || fullNameDisplay}</span>
                                <ChevronDown className="w-3 h-3 text-[#003d29] shrink-0" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/70 flex sm:block items-center justify-between text-left sm:text-right">
                            <div className="text-[11px] text-stone-500 font-semibold truncate">
                              #{order.orderNumber}
                            </div>
                            <div className="flex items-center gap-2 sm:mt-0.5 text-xs shrink-0">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderId(order.id)}
                                className="text-[#003d29] hover:underline font-semibold"
                              >
                                Rincian
                              </button>
                              <span className="text-stone-300">|</span>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderId(order.id)}
                                className="text-[#003d29] hover:underline font-semibold"
                              >
                                Invoice
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                          {isDelivered && !bannerDismissed && (
                            <div className="p-3 bg-[#FFF9E6] border border-[#FFE8A3] text-stone-800 text-xs rounded-xl flex items-center justify-between gap-2">
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
                                  Beri ulasan pengalaman belanja kamu bersama toko mitra UMKM
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDismissedBanners((prev) => ({ ...prev, [order.id]: true }))
                                }
                                className="text-stone-400 hover:text-stone-700 text-sm font-bold ml-1 shrink-0"
                              >
                                ×
                              </button>
                            </div>
                          )}

                          {orderItems.map((item: any, idx: number) => {
                            const productTitle = item.productNameSnapshot || item.title;
                            const productImg =
                              item.image ||
                              item.variant?.product?.images?.[0]?.url ||
                              'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg';
                            const productSlug = item.slug || item.variant?.product?.slug || 'bakpia-pathok-25-yogyakarta';

                            return (
                              <div
                                key={item.id || idx}
                                className="space-y-3 pt-4 first:pt-0 border-t first:border-t-0 border-stone-200"
                              >
                                <div>
                                  <h3 className="text-xs sm:text-sm font-extrabold text-stone-900">
                                    {item.deliveredDate ||
                                      (order.status === 'DELIVERED'
                                        ? `Terkirim pada ${formatDate(order.createdAt)}`
                                        : 'Sedang Dalam Pengiriman Kurir')}
                                  </h3>
                                  {item.deliverySubtitle && (
                                    <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                                      {item.deliverySubtitle}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-row items-start gap-3 sm:gap-4">
                                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F6F6] rounded-xl overflow-hidden shrink-0 border border-stone-200 p-1.5 sm:p-2 flex items-center justify-center">
                                    <Image
                                      src={productImg}
                                      alt={productTitle}
                                      fill
                                      className="object-contain p-1"
                                      sizes="80px"
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0 space-y-1.5">
                                    <Link
                                      href={`/products/${productSlug}`}
                                      className="text-xs sm:text-sm font-bold text-stone-900 hover:text-[#003d29] transition-colors line-clamp-2 leading-snug block"
                                    >
                                      {productTitle}
                                    </Link>

                                    <p className="text-[11px] sm:text-xs text-stone-500">
                                      {item.returnEligible ||
                                        'Garansi pengembalian: Berlaku 7 hari sejak produk diterima'}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleBuyAgain(item)}
                                    className="bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                                    <span>Beli Lagi</span>
                                  </button>

                                  <Link
                                    href={`/products/${productSlug}`}
                                    className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors text-center"
                                  >
                                    Lihat Produk
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => setTrackingOrder({ ...order, currentItem: item })}
                                    className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                  >
                                    <Truck className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                    <span>Lacak Paket</span>
                                  </button>

                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setMenuOpenId(menuOpenId === item.id ? null : item.id)
                                      }
                                      className="w-full sm:w-auto bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-semibold"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                      <span className="sm:hidden">Lainnya</span>
                                    </button>

                                    {menuOpenId === item.id && (
                                      <div className="absolute right-0 sm:left-0 mt-1.5 w-48 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-20 text-xs font-semibold text-stone-700">
                                            <button
                                              type="button"
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
                                              className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                                            >
                                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                              <span>Tulis Ulasan Produk</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setMenuOpenId(null);
                                                setSelectedOrderId(order.id);
                                              }}
                                              className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2"
                                            >
                                              <FileText className="w-3.5 h-3.5 text-stone-400" />
                                              <span>Cetak Invoice</span>
                                            </button>
                                          </div>
                                        )}
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
          )}

          {/* =====================================================================
              SECTION 5: VOUCHER & KUPON PROMO SAYA
          ===================================================================== */}
          {activeSection === 'vouchers' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xs space-y-5 sm:space-y-6">
              <div className="pb-4 border-b border-stone-100">
                <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  Voucher & Kupon Promo Saya
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Salin kode voucher aktif di bawah ini dan gunakan pada halaman Keranjang atau Pembayaran (Checkout).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    code: 'NUSANTARA',
                    title: 'Diskon Spesial 15% Karya Nusantara',
                    desc: 'Potongan harga 15% (maks. Rp50.000) untuk seluruh produk oleh-oleh, kopi, batik, dan kriya.',
                    minSpend: 'Min. belanja Rp100.000',
                    validUntil: 'Berlaku s/d 31 Desember 2026',
                  },
                  {
                    code: 'ONGKIRGRATIS',
                    title: 'Subsidi Bebas Ongkir Nasional',
                    desc: 'Gratis ongkos kirim hingga Rp25.000 untuk pengiriman JNE, J&T, dan SiCepat ke seluruh Indonesia.',
                    minSpend: 'Min. belanja Rp150.000',
                    validUntil: 'Berlaku setiap hari',
                  },
                  {
                    code: 'OLEHOLEH10',
                    title: 'Potongan Langsung Rp10.000 Kuliner Daerah',
                    desc: 'Hemat Rp10.000 khusus kategori Oleh-oleh & Makanan Khas Daerah (Bakpia, Pie Susu, Sambal).',
                    minSpend: 'Min. belanja Rp75.000',
                    validUntil: 'Berlaku untuk semua metode bayar',
                  },
                ].map((v) => (
                  <div
                    key={v.code}
                    className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-[#FAF9F5] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-[#003d29] text-white text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{v.code}</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Siap Pakai
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-stone-900 pt-1">{v.title}</h3>
                      <p className="text-xs text-stone-600 leading-relaxed">{v.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2 text-xs">
                      <div className="text-[11px] text-stone-500">
                        <span className="font-semibold text-stone-700 block">{v.minSpend}</span>
                        <span>{v.validUntil}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== 'undefined') {
                            navigator.clipboard.writeText(v.code);
                            setCopiedCode(v.code);
                            setTimeout(() => setCopiedCode(null), 2000);
                          }
                        }}
                        className="px-3.5 py-2 bg-white hover:bg-[#003d29] hover:text-white text-[#003d29] border border-stone-200 font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        {copiedCode === v.code ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Kode</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              SECTION 6: ULASAN PRODUK SAYA
          ===================================================================== */}
          {activeSection === 'reviews' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xs space-y-5 sm:space-y-6">
              <div className="pb-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                    Ulasan Produk Saya
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Riwayat penilaian dan testimoni yang Anda berikan untuk produk UMKM di NUSAVA.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'my-rev-1',
                    productTitle: 'Bakpia Pathok 25 Asli Khas Yogyakarta (Isi 15 Pcs)',
                    slug: 'bakpia-pathok-25-yogyakarta',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg',
                    date: '6 Juni 2024',
                    rating: 5,
                    tags: ['Rasa Otentik Khas Daerah', 'Kemasan Rapi & Tebal'],
                    comment:
                      'Paket mendarat dengan sangat aman di Jakarta. Bakpia masih hangat dan lembut, kulitnya berlapis renyah persis seperti beli langsung di Jogja!',
                  },
                  {
                    id: 'my-rev-2',
                    productTitle: 'Kopi Arabika Gayo Aceh Specialty Single Origin 250g',
                    slug: 'kopi-arabika-gayo-aceh',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
                    date: '31 Mei 2024',
                    rating: 5,
                    tags: ['Fresh Langsung dari Dapur', 'Pengiriman Tepat Waktu'],
                    comment:
                      'Aroma biji kopinya luar biasa harum begitu kemasan dibuka. Roast date masih sangat baru dan cocok untuk seduhan V60 setiap pagi.',
                  },
                ].map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-[#FAF9F5] space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-200/70">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl bg-white border border-stone-200 overflow-hidden shrink-0">
                          <Image
                            src={rev.image}
                            alt={rev.productTitle}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${rev.slug}`}
                            className="font-bold text-stone-900 hover:text-[#003d29] truncate block"
                          >
                            {rev.productTitle}
                          </Link>
                          <span className="text-[11px] text-stone-400">Diulas pada {rev.date}</span>
                        </div>
                      </div>
                      <div className="flex text-amber-500 text-xs shrink-0">
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {rev.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-semibold bg-white border border-stone-200 text-stone-700 px-2.5 py-0.5 rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <p className="text-stone-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              SECTION 7: PUSAT BANTUAN & KOMPLAIN PESANAN
          ===================================================================== */}
          {activeSection === 'help' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xs space-y-6">
              <div className="pb-4 border-b border-stone-100">
                <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  Pusat Bantuan & Komplain Pesanan
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Layanan perlindungan pembeli NUSAVA siap membantu kendala pengiriman, klaim garansi produk rusak, dan pengembalian dana.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200 space-y-2">
                  <Truck className="w-5 h-5 text-[#003d29]" />
                  <h3 className="font-bold text-stone-900">Kendala Kurir & Resi</h3>
                  <p className="text-stone-500 leading-relaxed">
                    Paket terlambat atau status resi belum bergerak lebih dari 24 jam.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200 space-y-2">
                  <RotateCcw className="w-5 h-5 text-[#003d29]" />
                  <h3 className="font-bold text-stone-900">Klaim Garansi Ganti Baru</h3>
                  <p className="text-stone-500 leading-relaxed">
                    Penggantian 100% gratis jika makanan tiba dalam kondisi basi atau kemasan hancur.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200 space-y-2">
                  <CreditCard className="w-5 h-5 text-[#003d29]" />
                  <h3 className="font-bold text-stone-900">Pencairan Refund Instan</h3>
                  <p className="text-stone-500 leading-relaxed">
                    Dana pengembalian langsung ditransfer ke rekening utama yang tersimpan di akun Anda.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <h3 className="text-sm font-extrabold text-stone-900">
                    Hubungi Concierge WhatsApp Resmi NUSAVA
                  </h3>
                  <p className="text-stone-500">
                    Sertakan nomor pesanan dan foto kondisi paket untuk penanganan prioritas dalam 15 menit.
                  </p>
                </div>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Layanan%20Pelanggan%20NUSAVA,%20saya%20ingin%20mengajukan%20bantuan%20pesanan."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto justify-center px-5 py-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Hubungi via WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
          MODAL 1: TAMBAH / UBAH ALAMAT PENGIRIMAN
      ===================================================================== */}
      {isAddingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29]">
                  BUKU ALAMAT NUSAVA
                </span>
                <h3 className="text-base font-extrabold text-stone-900 mt-0.5">
                  {editingAddress ? 'Ubah Alamat Pengiriman' : 'Tambah Alamat Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingAddress(false)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Label Alamat
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Rumah', 'Kantor', 'Apartemen', 'Kos', 'Keluarga'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddrForm({ ...addrForm, label: lbl })}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold border transition-colors ${
                        addrForm.label === lbl
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nama Penerima
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.recipientName}
                    onChange={(e) => setAddrForm({ ...addrForm, recipientName: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#003d29]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nomor HP Penerima
                  </label>
                  <input
                    type="tel"
                    required
                    value={addrForm.phone}
                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#003d29]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    placeholder="Jakarta Selatan"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#003d29]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.province}
                    onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })}
                    placeholder="DKI Jakarta"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#003d29]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.postalCode}
                    onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })}
                    placeholder="12160"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#003d29]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Kelurahan)
                </label>
                <textarea
                  rows={2}
                  required
                  value={addrForm.streetAddress}
                  onChange={(e) => setAddrForm({ ...addrForm, streetAddress: e.target.value })}
                  placeholder="Jl. Wijaya II No. 48, Kebayoran Baru..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#003d29] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Catatan / Patokan untuk Kurir (Opsional)
                </label>
                <input
                  type="text"
                  value={addrForm.notes}
                  onChange={(e) => setAddrForm({ ...addrForm, notes: e.target.value })}
                  placeholder="Pagar warna hitam di sebelah taman..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#003d29]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addrForm.isPrimary}
                  onChange={(e) => setAddrForm({ ...addrForm, isPrimary: e.target.checked })}
                  className="rounded border-stone-300 text-[#003d29] focus:ring-[#003d29]"
                />
                <span className="font-semibold text-stone-700">
                  Jadikan sebagai alamat pengiriman utama
                </span>
              </label>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white font-bold rounded-xl transition-colors"
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: TAMBAH / UBAH METODE PEMBAYARAN TERSIMPAN
      ===================================================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29]">
                  METODE PEMBAYARAN
                </span>
                <h3 className="text-base font-extrabold text-stone-900 mt-0.5">
                  {editingPayment ? 'Ubah Metode Pembayaran' : 'Tambah Metode Pembayaran'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Kategori Metode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'BANK_VA', label: 'Virtual Account' },
                    { id: 'CARD', label: 'Kartu Debit/Kredit' },
                    { id: 'REFUND_BANK', label: 'Rekening Bank' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPayForm({ ...payForm, type: t.id as any })}
                      className={`py-2 px-2 rounded-lg font-semibold border text-center transition-colors ${
                        payForm.type === t.id
                          ? 'bg-[#003d29] text-white border-[#003d29]'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Bank / Penyedia Kartu
                </label>
                <select
                  value={payForm.provider}
                  onChange={(e) => setPayForm({ ...payForm, provider: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-semibold text-stone-800 focus:outline-none focus:border-[#003d29]"
                >
                  <option value="BCA OneKlik / Virtual Account">BCA OneKlik / Virtual Account</option>
                  <option value="Mandiri Debit / Livin VA">Mandiri Debit / Livin VA</option>
                  <option value="BNI Virtual Account">BNI Virtual Account</option>
                  <option value="BRI Briva / Debit">BRI Briva / Debit</option>
                  <option value="Visa / Mastercard Credit Card">Visa / Mastercard Credit Card</option>
                  <option value="Bank BCA (Rekening Pencairan Refund)">Bank BCA (Rekening Pencairan Refund)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nomor Rekening / Nomor Kartu
                </label>
                <input
                  type="text"
                  required
                  value={payForm.accountNumber}
                  onChange={(e) => setPayForm({ ...payForm, accountNumber: e.target.value })}
                  placeholder="Contoh: 5240 8821 9012"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono focus:outline-none focus:border-[#003d29]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nama Pemilik Rekening/Kartu
                  </label>
                  <input
                    type="text"
                    required
                    value={payForm.holderName}
                    onChange={(e) => setPayForm({ ...payForm, holderName: e.target.value })}
                    placeholder="Budi Santoso"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#003d29]"
                  />
                </div>
                {payForm.type === 'CARD' && (
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Masa Berlaku (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={payForm.expiry}
                      onChange={(e) => setPayForm({ ...payForm, expiry: e.target.value })}
                      placeholder="08/28"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#003d29]"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={payForm.isPrimary}
                  onChange={(e) => setPayForm({ ...payForm, isPrimary: e.target.checked })}
                  className="rounded border-stone-300 text-[#003d29] focus:ring-[#003d29]"
                />
                <span className="font-semibold text-stone-700">
                  Jadikan metode pembayaran utama
                </span>
              </label>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white font-bold rounded-xl transition-colors"
                >
                  Simpan Metode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: PELACAKAN PAKET REAL-TIME
      ===================================================================== */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 max-w-lg w-full rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29]">
                  PELACAKAN REAL-TIME
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-0.5">
                  {trackingOrder.courier || 'JNE Express (YES)'}
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  No. Resi: {trackingOrder.trackingNumber || 'JNE-98210398210'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-600 mt-1 shrink-0 ring-4 ring-emerald-100" />
                <div>
                  <p className="font-bold text-stone-900">Paket Diterima Oleh Penerima</p>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Diterima langsung oleh {fullNameDisplay} di alamat tujuan.
                  </p>
                  <span className="text-[10px] text-stone-400">07:15 WIB</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-stone-300 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-700">Kurir Membawa Paket Menuju Lokasi</p>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Kurir bergerak dari Drop Point Hub menuju alamat penerima
                  </p>
                  <span className="text-[10px] text-stone-400">06:20 WIB</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-stone-300 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-700">Paket Tiba di Sentra Hub Kota Tujuan</p>
                  <span className="text-[10px] text-stone-400">03:40 WIB</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-stone-300 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-700">Paket Dikirim dari Sentra UMKM Daerah</p>
                  <span className="text-[10px] text-stone-400">Kemarin, 15:10 WIB</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <Link
                href={`/orders/track/${trackingOrder.orderNumber || '112-0822160-5390023'}`}
                className="text-xs font-semibold text-[#003d29] hover:underline flex items-center gap-1"
              >
                <span>Halaman Lacak Lengkap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="px-5 py-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: TULIS ULASAN PRODUK
      ===================================================================== */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29]">
                  ULASAN PEMBELI
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-0.5">
                  Beri Penilaian Produk
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewingItem(null)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-stone-900">Ulasan Berhasil Dikirim!</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Terima kasih sudah membagikan ulasanmu bagi perkembangan UMKM lokal.
                </p>
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="mt-4 px-6 py-2.5 bg-[#003d29] text-white text-xs font-bold rounded-lg hover:bg-[#002b1c]"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
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
                    <span className="text-[10px] text-stone-400 font-mono block">
                      Order #{reviewingItem.orderNumber}
                    </span>
                    <h4 className="font-bold text-stone-900 text-xs truncate">
                      {reviewingItem.title}
                    </h4>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
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
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              isFilled ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Poin Penilaian yang Menonjol:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Rasa Otentik Khas Daerah',
                      'Kemasan Rapi & Tebal',
                      'Pengiriman Tepat Waktu',
                      'Fresh Langsung dari Dapur',
                    ].map((tag) => {
                      const isSelected = reviewTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setReviewTags(
                              isSelected
                                ? reviewTags.filter((t) => t !== tag)
                                : [...reviewTags, tag],
                            )
                          }
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold border ${
                            isSelected
                              ? 'bg-[#003d29] text-white border-[#003d29]'
                              : 'bg-white text-stone-600 border-stone-200'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Ceritakan Pengalamanmu:
                  </label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Bagikan ulasan tentang kelezatan rasa atau kerapian kemasan..."
                    className="w-full text-xs p-3 rounded-lg border border-stone-200 focus:outline-none focus:border-[#003d29] resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewingItem(null)}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold"
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
                    className="px-5 py-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold rounded-lg"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5: RINCIAN TRANSAKSI & INVOICE
      ===================================================================== */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d29]">
                  RINCIAN TRANSAKSI & INVOICE
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  Order #{selectedOrderDetail?.orderNumber || '112-0822160-5390023'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tanggal: {selectedOrderDetail?.createdAt ? formatDateTime(selectedOrderDetail.createdAt) : '2 Juni 2024, 14:30 WIB'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="p-1 hover:bg-stone-100 text-stone-400 hover:text-stone-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Penerima:</span>
                <span className="font-semibold text-stone-900">{fullNameDisplay}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Barang:</span>
                <span className="font-semibold text-stone-900">
                  {selectedOrderDetail ? formatCurrency(selectedOrderDetail.subtotal) : formatCurrency(135000)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Biaya Ongkir Kurir:</span>
                <span className="font-semibold text-stone-900">
                  {selectedOrderDetail ? formatCurrency(selectedOrderDetail.shippingCost) : formatCurrency(22990)}
                </span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                <span>Total Tagihan:</span>
                <span className="text-[#003d29]">
                  {selectedOrderDetail ? formatCurrency(selectedOrderDetail.grandTotal) : formatCurrency(157990)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pembayaran Berhasil / Lunas</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="text-xs font-bold bg-[#003d29] hover:bg-[#002b1c] text-white px-6 py-2.5 rounded-lg"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-xs text-stone-400 font-sans">
          Memuat halaman akun...
        </div>
      }
    >
      <AccountCenterContent />
    </Suspense>
  );
}
