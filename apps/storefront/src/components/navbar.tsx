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
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useCartStore } from '../stores/cart-store';
import { useAuthStore } from '../stores/auth-store';
import { useLanguageStore } from '../stores/language-store';
import { useWishlistStore } from '../stores/wishlist-store';
import { apiRequest } from '../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { NusavaLogo } from './nusava-logo';

export function Navbar() {
  const router = useRouter();
  const { openCart, itemCount } = useCartStore();
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { items: wishlistItems } = useWishlistStore();
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

  // Check persisted top bar dismissal state
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

  // Close dropdowns when clicking outside
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

  // Search autocomplete with 200ms debounce
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

  const displayName = user ? `${user.firstName}` : 'Akun Saya';
  const fullName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Budi Santoso';
  const initials = (user?.firstName?.[0] || 'B').toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 font-sans">
      {/* 1. Top Marketplace Utility Bar */}
      {topBarVisible && (
        <div className="bg-[#003d29] text-white text-xs py-1.5 sm:py-2 px-4 sm:px-6 lg:px-12 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Marketplace Quick Assurance Links */}
            <div className="hidden md:flex items-center gap-4 text-white/90 text-[11px] shrink-0">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>100% Mitra UMKM Terverifikasi</span>
              </span>
              <span className="text-white/30">|</span>
              <Link
                href="/account?section=orders"
                className="hover:text-[#F5E6C4] transition-colors font-medium"
              >
                Lacak Pesanan
              </Link>
            </div>

            {/* Center Promo Text */}
            <div className="text-left sm:text-center font-medium flex-1 text-[11px] sm:text-xs text-white truncate">
              <span>Gratis Ongkir min. Rp150rb | </span>
              <Link href="/products" className="underline font-bold text-[#F5E6C4] hover:text-white ml-0.5">
                Klaim Voucher
              </Link>
            </div>

            {/* Right: Help + Language Selector + Close Button */}
            <div className="flex items-center gap-2 sm:gap-3 text-white/90 shrink-0">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Layanan%20Pelanggan%20NUSAVA!"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] text-white/85 hover:text-white transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-white/75" />
                <span>Bantuan</span>
              </a>

              {/* Language Switcher Dropdown */}
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
                  <div className="absolute right-0 mt-1.5 w-36 bg-white text-gray-800 rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('id');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 transition-colors ${
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
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-stone-50 transition-colors ${
                        language === 'en' ? 'font-bold text-[#003d29] bg-stone-50' : 'text-stone-700'
                      }`}
                    >
                      <span>English (EN)</span>
                      {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#003d29]" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Dismiss (Close) Button */}
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

      {/* 2. Main Marketplace Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
        {/* Brand Logo: NUSAVA Green & Gold Nusantara Emblem */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <Link href="/" className="group focus:outline-none">
            <NusavaLogo size="md" showTagline={true} />
          </Link>
        </div>

        {/* Categories Dropdown + Marketplace Navigation */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-stone-700 shrink-0">
          {/* Categories Dropdown */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF9F5] hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-lg transition-colors font-semibold"
            >
              <span>Kategori</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
            </button>

            {categoryOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 space-y-3">
                <div>
                  <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                    Kategori Produk
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
                    Asal Daerah Populer
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
              </div>
            )}
          </div>

          <Link href="/products" className="hover:text-[#003d29] transition-colors">
            Semua Produk
          </Link>
          <Link href="/products?sortBy=popular" className="hover:text-[#003d29] transition-colors">
            Terlaris
          </Link>
          <Link href="/#flash-sale" className="hover:text-[#003d29] transition-colors">
            Kejar Diskon
          </Link>
        </nav>

        {/* Center Search Input with Instant Autocomplete */}
        <div className="flex-1 max-w-md hidden md:block relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari di NUSAVA: bakpia pathok, pie susu bali, kopi gayo..."
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#003d29]"
              title="Cari produk"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Search Results Dropdown */}
          {showSearchDropdown && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
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

        {/* Right Side: Wishlist, Cart, Transactions & Account Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#003d29] transition-colors relative p-1.5 sm:px-2 rounded-lg hover:bg-stone-50"
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
            <span className="hidden xl:inline">{isId ? 'Wishlist' : 'Wishlist'}</span>
          </Link>

          {/* Cart Button */}
          <button
            onClick={() => openCart()}
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#003d29] transition-colors relative p-1.5 sm:px-2 rounded-lg hover:bg-stone-50"
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
            <span className="hidden xl:inline">Keranjang</span>
          </button>

          {/* Transactions / Orders Quick Link */}
          <Link
            href="/account?section=orders"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#003d29] transition-colors py-1.5 px-2 rounded-lg hover:bg-stone-50"
            title="Daftar Transaksi"
          >
            <Package className="w-5 h-5 text-stone-700" />
            <span className="hidden xl:inline">Transaksi</span>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-stone-200" />

          {/* Account Dropdown Menu */}
          <div className="relative" ref={accountDropdownRef}>
            <button
              type="button"
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-[#FAF9F5] hover:bg-stone-100 transition-colors text-xs font-semibold text-stone-800"
            >
              <span className="w-6 h-6 rounded-full bg-[#003d29] text-[#D4AF37] font-bold text-[11px] flex items-center justify-center shrink-0">
                {initials}
              </span>
              <span className="hidden sm:inline max-w-[100px] truncate">{displayName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:inline" />
            </button>

            {accountDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                {/* User Mini Card */}
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-stone-200/80 mb-1.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#003d29] text-[#D4AF37] font-extrabold text-sm flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-stone-900 truncate">{fullName}</p>
                    <p className="text-[10px] text-[#003d29] font-semibold">Member Setia NUSAVA</p>
                  </div>
                </div>

                <div className="space-y-0.5 text-xs font-medium text-stone-700">
                  <Link
                    href="/account?section=profile"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                  >
                    <User className="w-4 h-4 text-stone-500" />
                    <span>Biodata Diri (Profil)</span>
                  </Link>
                  <Link
                    href="/account?section=addresses"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-stone-500" />
                    <span>Daftar Alamat</span>
                  </Link>
                  <Link
                    href="/account?section=payments"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-stone-500" />
                    <span>Pembayaran Tersimpan</span>
                  </Link>
                  <Link
                    href="/account?section=orders"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#FAF9F5] hover:text-[#003d29] transition-colors"
                  >
                    <Package className="w-4 h-4 text-stone-500" />
                    <span>Daftar Transaksi</span>
                  </Link>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-stone-100">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        logout();
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar Akun</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="w-full flex items-center justify-center py-2 px-3 rounded-lg bg-[#003d29] text-white text-xs font-bold hover:bg-[#002b1c] transition-colors"
                    >
                      Masuk / Daftar Akun
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-600 hover:text-black rounded-lg"
            aria-label="Menu navigasi"
          >
            <Menu className="w-5 h-5" />
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
        <div className="lg:hidden bg-white border-t border-stone-100 px-6 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari di NUSAVA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-[#F5F6F6] border border-stone-200 rounded-xl text-xs text-stone-800 outline-none"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold text-stone-700">
            <Link
              href="/account?section=profile"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#003d29]" />
              <span>Profil Saya</span>
            </Link>
            <Link
              href="/account?section=orders"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-[#003d29]" />
              <span>Transaksi</span>
            </Link>
            <Link
              href="/account?section=addresses"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#003d29]" />
              <span>Daftar Alamat</span>
            </Link>
            <Link
              href="/account?section=payments"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-[#003d29]" />
              <span>Pembayaran</span>
            </Link>
          </div>

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
