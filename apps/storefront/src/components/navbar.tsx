'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  X,
  Menu,
  Globe,
  Sparkles,
  ArrowRight,
  Heart,
  Package,
  MapPin,
  CreditCard,
  LogOut,
  HelpCircle,
  Tag,
  Star,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '../stores/cart-store';
import { useAuthStore } from '../stores/auth-store';
import { useLanguageStore } from '../stores/language-store';
import { useWishlistStore } from '../stores/wishlist-store';
import { useRewardsStore } from '../stores/rewards-store';
import { apiRequest } from '../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { NusavaLogo } from './nusava-logo';

export function Navbar() {
  const router = useRouter();
  const { itemCount } = useCartStore();
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { items: wishlistItems } = useWishlistStore();
  const { points, tier } = useRewardsStore();
  const isId = language === 'id';
  const wishlistCount = wishlistItems.length;

  const [topBarVisible, setTopBarVisible] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('top_bar_dismissed');
    if (isDismissed === 'true') {
      setTopBarVisible(false);
    }
  }, []);

  const dismissTopBar = () => {
    setTopBarVisible(false);
    sessionStorage.setItem('top_bar_dismissed', 'true');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await apiRequest<any[]>(
          `/products/search/suggest?q=${encodeURIComponent(searchQuery.trim())}`,
        );
        setSearchSuggestions(results || []);
        setShowSearchDropdown(true);
      } catch {
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'Oleh-oleh & Makanan Khas', slug: 'kudapan-khas' },
    { name: 'Kopi & Minuman Tradisional', slug: 'kopi-minuman' },
    { name: 'Batik & Wastra Nusantara', slug: 'batik-wastra' },
    { name: 'Kriya Kayu & Gerabah', slug: 'kriya-kerajinan' },
    { name: 'Sambal & Bumbu Dapur', slug: 'sambal-bumbu' },
  ];

  const popularOrigins = [
    { name: 'Khas Yogyakarta', city: 'Jogja' },
    { name: 'Khas Bali', city: 'Bali' },
    { name: 'Khas Bandung', city: 'Bandung' },
    { name: 'Khas Medan', city: 'Medan' },
    { name: 'Khas Solo', city: 'Solo' },
    { name: 'Khas Surabaya', city: 'Surabaya' },
  ];

  const displayName = user ? user.firstName : '';
  const fullName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : '';
  const userEmail = user?.email || '';
  const initials = user?.firstName ? user.firstName[0].toUpperCase() : '';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 font-sans">
      {/* 1. Simple Top Promo Bar */}
      {topBarVisible && (
        <div className="bg-[#003d29] text-white text-xs py-1.5 px-4 sm:px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>100% Oleh-oleh Asli Khas Daerah</span>
            </span>

            <div className="text-left sm:text-center font-medium flex-1 text-[11px] sm:text-xs text-white truncate">
              <span>Gratis Ongkir se-Indonesia min. Rp150.000 | </span>
              <Link href="/products" className="underline font-bold hover:text-white/80 ml-0.5">
                Belanja Sekarang
              </Link>
            </div>

            <div className="flex items-center gap-2 text-white/90 shrink-0">
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors text-white text-[11px] font-semibold cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-white/80" />
                  <span>{language === 'id' ? 'ID' : 'EN'}</span>
                  <ChevronDown className="w-3 h-3 text-white/70" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-white text-stone-800 rounded-xl shadow-xl border border-stone-200 py-1.5 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('id');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 ${
                        language === 'id' ? 'font-bold text-[#003d29] bg-stone-50' : 'text-stone-700'
                      }`}
                    >
                      <span>Indonesia (ID)</span>
                      {language === 'id' && <span className="w-1.5 h-1.5 rounded-full bg-[#003d29]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 ${
                        language === 'en' ? 'font-bold text-[#003d29] bg-stone-50' : 'text-stone-700'
                      }`}
                    >
                      <span>English (EN)</span>
                      {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#003d29]" />}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={dismissTopBar}
                className="p-1 text-white/70 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup informasi"
                aria-label="Tutup bar pengumuman"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Simplified Main Navigation Bar: Logo + Kategori + Search + Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 flex items-center justify-between gap-3 sm:gap-5">
        {/* Left: NUSAVA Logo + Kategori Dropdown */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <Link href="/" className="group focus:outline-none">
            <NusavaLogo size="md" showTagline={true} />
          </Link>

          {/* Simple Kategori Button Dropdown */}
          <div className="hidden lg:block relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-[#FAF9F5] text-stone-700 hover:text-[#003d29] rounded-xl transition-colors text-xs font-semibold"
            >
              <span>Kategori</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
            </button>

            {categoryOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 z-50 space-y-3">
                <div>
                  <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                    Kategori Pilihan
                  </span>
                  {categories.map((cat, idx) => (
                    <Link
                      key={idx}
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setCategoryOpen(false)}
                      className="block px-2.5 py-2 text-xs text-stone-700 hover:bg-[#FAF9F5] hover:text-[#003d29] rounded-lg font-medium transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Sentra Daerah Populer
                  </span>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {popularOrigins.map((orig) => (
                      <Link
                        key={orig.city}
                        href={`/products?origin=${orig.city}`}
                        onClick={() => setCategoryOpen(false)}
                        className="px-2 py-1.5 text-[11px] text-stone-600 hover:bg-[#FAF9F5] hover:text-[#003d29] rounded-md font-medium transition-colors flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-[#003d29]" />
                        <span>{orig.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 px-2">
                  <Link
                    href="/products"
                    onClick={() => setCategoryOpen(false)}
                    className="text-xs font-bold text-[#003d29] hover:underline flex items-center justify-between py-1"
                  >
                    <span>Lihat Semua Katalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Clean Wide Search Input */}
        <div className="flex-1 max-w-xl hidden md:block relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari produk oleh-oleh, kopi gayo, batik, sambal..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => {
                if (searchSuggestions.length > 0) setShowSearchDropdown(true);
              }}
              className="w-full pl-4 pr-10 py-2.5 bg-[#F5F6F6] hover:bg-[#EFEFEF] focus:bg-white border border-stone-200 focus:border-[#003d29] rounded-xl text-xs text-stone-800 placeholder-stone-400 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#003d29]"
              title="Cari"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Search Results Dropdown */}
          {showSearchDropdown && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#003d29]" />
                  <span>Hasil Pencarian Cepat</span>
                </span>
                {isSearching && <span className="text-[11px] text-stone-400">Mencari...</span>}
              </div>

              {searchSuggestions.length > 0 ? (
                <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                  {searchSuggestions.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/products/${prod.slug}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="p-3 flex items-center gap-3 hover:bg-[#FAF9F5] transition-colors"
                    >
                      <div className="relative w-12 h-12 bg-white rounded-lg border border-stone-200 overflow-hidden shrink-0">
                        {prod.images?.[0]?.url ? (
                          <Image
                            src={prod.images[0].url}
                            alt={prod.title}
                            fill
                            loading="lazy"
                            decoding="async"
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                            IMG
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {prod.title}
                        </h4>
                        <span className="text-[10px] text-stone-500 block">
                          {prod.category?.name || 'Oleh-oleh Khas'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#003d29] block">
                          {formatCurrency(prod.basePrice)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full p-2.5 text-center text-xs font-semibold text-[#003d29] hover:bg-[#FAF9F5] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Lihat semua hasil untuk &ldquo;{searchQuery}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : !isSearching ? (
                <div className="p-4 text-center text-xs text-stone-500">
                  Tidak ada produk yang cocok dengan &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Side: Wishlist, Cart, & Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#003d29] transition-colors relative p-2 rounded-xl hover:bg-stone-50"
            title={isId ? 'Wishlist Saya' : 'My Wishlist'}
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-stone-700" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline">Wishlist</span>
          </Link>

          {/* Keranjang -> Langsung ke Halaman /cart */}
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#003d29] transition-colors relative p-2 rounded-xl hover:bg-stone-50"
            title="Keranjang Belanja"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-stone-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#003d29] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline">Keranjang</span>
          </Link>

          <div className="hidden lg:block h-5 w-px bg-stone-200 mx-0.5" />

          {/* Profile Button & Expanded Marketplace Profile Dropdown (ONLY on Desktop lg+ when user is logged in) */}
          {user ? (
            <div className="hidden lg:block relative" ref={accountDropdownRef}>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-2 sm:px-2.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-[#FAF9F5] transition-colors text-xs font-semibold text-stone-800"
              >
                {/* Initial Badge: Pure Green & White */}
                <span className="w-6 h-6 rounded-full bg-[#003d29] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {initials}
                </span>
                <span className="hidden sm:inline max-w-[96px] truncate">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:inline" />
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 z-50 space-y-2.5">
                  {/* 1. User Profile Header Card */}
                  <Link
                    href="/account?section=profile"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="p-3 bg-[#FAF9F5] hover:bg-stone-100/80 rounded-xl border border-stone-200/80 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#003d29] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-stone-900 truncate">{fullName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{userEmail}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#003d29] font-bold mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-[#003d29]" />
                        <span>{tier}</span>
                      </span>
                    </div>
                  </Link>

                  {/* 2. Quick Poin Rewards & Voucher Summary Strip */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/account?section=vouchers"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="p-2.5 rounded-xl border border-stone-200 hover:border-[#003d29] bg-white transition-colors"
                    >
                      <span className="text-[10px] text-stone-400 font-semibold block">NUSAVA Poin</span>
                      <span className="text-xs font-bold text-[#003d29] flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                        <span className="truncate">{points.toLocaleString('id-ID')} Poin</span>
                      </span>
                    </Link>

                    <Link
                      href="/account?section=vouchers"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="p-2.5 rounded-xl border border-stone-200 hover:border-[#003d29] bg-white transition-colors"
                    >
                      <span className="text-[10px] text-stone-400 font-semibold block">Voucher</span>
                      <span className="text-xs font-bold text-[#003d29] flex items-center gap-1 mt-0.5">
                        <Tag className="w-3.5 h-3.5 text-[#003d29] shrink-0" />
                        <span>3 Kupon</span>
                      </span>
                    </Link>
                  </div>

                  {/* 3. Menu Aktivitas & Pesanan (Ringkas) */}
                  <div className="space-y-0.5 text-xs font-medium text-stone-700 pt-1 border-t border-stone-100">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Transaksi
                    </span>
                    <Link
                      href="/account?section=orders"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-stone-500" />
                        <span>Pesanan Saya</span>
                      </span>
                      <span className="text-[10px] font-bold bg-[#003d29]/10 text-[#003d29] px-1.5 py-0.5 rounded">
                        2
                      </span>
                    </Link>

                    <Link
                      href="/account?section=orders"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                    >
                      <Truck className="w-4 h-4 text-stone-500" />
                      <span>Lacak Paket</span>
                    </Link>

                    <Link
                      href="/account?section=reviews"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                    >
                      <Star className="w-4 h-4 text-stone-500" />
                      <span>Ulasan</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-stone-500" />
                        <span>Wishlist</span>
                      </span>
                      {wishlistCount > 0 && (
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  <div className="space-y-0.5 text-xs font-medium text-stone-700 pt-1.5 border-t border-stone-100">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Akun Saya
                    </span>
                    <Link
                      href="/account?section=profile"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      <span>Profil</span>
                    </Link>

                    <Link
                      href="/account?section=addresses"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-stone-500" />
                      <span>Alamat</span>
                    </Link>

                    <Link
                      href="/account?section=payments"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-stone-500" />
                      <span>Pembayaran</span>
                    </Link>

                    <Link
                      href="/account?section=vouchers"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                    >
                      <Tag className="w-4 h-4 text-stone-500" />
                      <span>Voucher & Poin</span>
                    </Link>

                    <Link
                      href="/account?section=help"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-stone-500" />
                      <span>Bantuan</span>
                    </Link>
                  </div>

                  {/* 4. Sign Out Footer */}
                  <div className="pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        logout();
                        router.push('/');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl border border-[#003d29] text-[#003d29] hover:bg-[#FAF9F5] text-xs font-bold transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex px-3.5 py-2 rounded-xl bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-700 hover:text-[#003d29] rounded-lg"
            aria-label="Menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Persistent Mobile Search Bar (< md) */}
      <div className="md:hidden px-4 pb-2.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Cari bakpia, pie susu, kopi gayo, batik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3.5 pr-9 py-2 bg-[#F5F6F6] border border-stone-200 focus:bg-white focus:border-[#003d29] rounded-xl text-xs text-stone-800 outline-none"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
            aria-label="Cari"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-4 max-h-[82vh] overflow-y-auto">
          {user ? (
            <div className="space-y-3">
              {/* 1. User Profile Header Card inside Hamburger Menu */}
              <Link
                href="/account?section=profile"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-[#FAF9F5] rounded-xl border border-stone-200 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#003d29] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-stone-900 truncate">{fullName}</p>
                  <p className="text-[11px] text-stone-500 truncate">{userEmail}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#003d29] font-bold mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-[#003d29]" />
                    <span>{tier}</span>
                  </span>
                </div>
              </Link>

              {/* 2. Quick Poin & Voucher Summary inside Hamburger Menu */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/account?section=vouchers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                >
                  <span className="text-[10px] text-stone-400 font-semibold block">NUSAVA Poin</span>
                  <span className="text-xs font-bold text-[#003d29] flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                    <span className="truncate">{points.toLocaleString('id-ID')} Poin</span>
                  </span>
                </Link>

                <Link
                  href="/account?section=vouchers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                >
                  <span className="text-[10px] text-stone-400 font-semibold block">Voucher</span>
                  <span className="text-xs font-bold text-[#003d29] flex items-center gap-1 mt-0.5">
                    <Tag className="w-3.5 h-3.5 text-[#003d29] shrink-0" />
                    <span>3 Kupon</span>
                  </span>
                </Link>
              </div>

              {/* 3. Menu Akun & Transaksi Lengkap */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-stone-700">
                <Link
                  href="/account?section=orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#003d29]" />
                    <span>Pesanan Saya</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#003d29]/10 text-[#003d29] px-1.5 py-0.5 rounded">
                    2
                  </span>
                </Link>
                <Link
                  href="/account?section=orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
                >
                  <Truck className="w-4 h-4 text-[#003d29]" />
                  <span>Lacak Paket</span>
                </Link>
                <Link
                  href="/account?section=profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-[#003d29]" />
                  <span>Profil</span>
                </Link>
                <Link
                  href="/account?section=addresses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-[#003d29]" />
                  <span>Alamat</span>
                </Link>
                <Link
                  href="/account?section=payments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-[#003d29]" />
                  <span>Pembayaran</span>
                </Link>
                <Link
                  href="/account?section=vouchers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
                >
                  <Tag className="w-4 h-4 text-[#003d29]" />
                  <span>Voucher & Poin</span>
                </Link>
                <Link
                  href="/account?section=reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-[#003d29]" />
                  <span>Ulasan</span>
                </Link>
                <Link
                  href="/account?section=help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-[#003d29]" />
                  <span>Bantuan</span>
                </Link>
              </div>

              {/* 4. Tombol Keluar di Mobile Hamburger Menu */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  router.push('/');
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/60 text-xs font-bold text-rose-600 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-[#003d29] text-[#003d29] text-center hover:bg-[#FAF9F5] transition-colors"
              >
                Masuk Akun
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-[#003d29] text-white text-center hover:bg-[#002b1c] transition-colors"
              >
                Daftar Baru
              </Link>
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs font-medium text-stone-700">
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Kategori Belanja</p>
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 hover:text-[#003d29]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
