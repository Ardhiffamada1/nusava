'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Phone,
  ChevronDown,
  X,
  Menu,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '../stores/cart-store';
import { useAuthStore } from '../stores/auth-store';
import { useLanguageStore } from '../stores/language-store';
import { apiRequest } from '../lib/api';
import { formatCurrency } from '@commerceos/ui';

export function Navbar() {
  const router = useRouter();
  const { openCart, itemCount } = useCartStore();
  const { user } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();

  const [topBarVisible, setTopBarVisible] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

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
    { name: 'Kudapan & Makanan Khas', slug: 'kudapan-khas' },
    { name: 'Kopi & Minuman Tradisional', slug: 'kopi-minuman' },
    { name: 'Batik & Wastra Nusantara', slug: 'batik-wastra' },
    { name: 'Kriya Kayu & Gerabah', slug: 'kriya-kerajinan' },
    { name: 'Sambal & Bumbu Dapur', slug: 'sambal-bumbu' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 font-sans">
      {/* 1. Top Utility Header (Dismissible) */}
      {topBarVisible && (
        <div className="bg-[#003d29] text-white text-xs py-2 px-6 lg:px-12 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Phone Contact */}
            <div className="hidden sm:flex items-center gap-2 text-white/90 shrink-0">
              <Phone className="w-3.5 h-3.5 text-white/80" />
              <span className="font-semibold">+62 812-3456-7890</span>
            </div>

            {/* Center Promo Text */}
            <div className="text-center font-medium flex-1 text-[11px] sm:text-xs text-white">
              <span>Dapatkan Diskon Spesial s/d 50% Untuk Pilihan Oleh-oleh Nusantara | </span>
              <Link href="/products" className="underline font-bold hover:text-white/80 ml-1">
                Beli Sekarang
              </Link>
            </div>

            {/* Right: Language Selector + Location + Close Button */}
            <div className="flex items-center gap-4 text-white/90 shrink-0">
              {/* Language Switcher Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-white font-semibold cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-white/80" />
                  <span>{language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
                  <ChevronDown className="w-3 h-3 text-white/70" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-40 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('id');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                        language === 'id' ? 'font-bold text-[#003d29] bg-[#F5F6F6]' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-base">🇮🇩</span>
                      <span>Indonesia (ID)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                        language === 'en' ? 'font-bold text-[#003d29] bg-[#F5F6F6]' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-base">🇬🇧</span>
                      <span>English (EN)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Location Pill (Matching Shopcart reference) */}
              <div className="hidden md:flex items-center gap-1 text-white/80 text-xs">
                <span>Indonesia</span>
                <ChevronDown className="w-3 h-3 text-white/70" />
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

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between gap-6">
        {/* Brand Logo: Clean Shopcart with Green Cart icon */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <ShoppingCart className="w-7 h-7 text-[#003d29] shrink-0" />
            <span className="text-2xl font-black text-[#003d29] tracking-tight">
              Shopcart
            </span>
          </Link>
        </div>

        {/* Categories Dropdown + Quick Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
          {/* Categories Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 hover:text-[#003d29] rounded-lg transition-colors font-semibold"
            >
              <span>Kategori</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {categoryOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/products?category=${cat.slug}`}
                    onClick={() => setCategoryOpen(false)}
                    className="block px-4 py-2.5 text-xs text-gray-700 hover:bg-[#F5F6F6] hover:text-[#003d29] font-medium transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/products" className="hover:text-[#003d29] transition-colors">
            Promo Spesial
          </Link>
          <Link href="/products?sortBy=newest" className="hover:text-[#003d29] transition-colors">
            Produk Baru
          </Link>
          <Link href="/checkout" className="hover:text-[#003d29] transition-colors">
            Checkout Cepat
          </Link>
        </nav>

        {/* Center Search Input with Instant Autocomplete Algorithm */}
        <div className="flex-1 max-w-md hidden md:block relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari bakpia, kopi gayo, batik, rendang, pie susu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => {
                if (searchSuggestions.length > 0) setShowSearchDropdown(true);
              }}
              className="w-full pl-5 pr-11 py-2.5 bg-[#F5F6F6] hover:bg-[#EFEFEF] focus:bg-white border border-transparent focus:border-[#003d29] rounded-full text-xs text-gray-800 placeholder-gray-400 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003d29]"
              title="Cari"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Search Results Dropdown */}
          {showSearchDropdown && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#003d29]" />
                  <span>Saran Pencarian</span>
                </span>
                {isSearching && <span className="text-[11px] text-gray-400">Mencari...</span>}
              </div>

              {searchSuggestions.length > 0 ? (
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {searchSuggestions.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/products/${prod.slug}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="p-3 flex items-center gap-3 hover:bg-[#F5F6F6] transition-colors"
                    >
                      <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-100 overflow-hidden shrink-0">
                        {prod.images?.[0]?.url ? (
                          <Image
                            src={prod.images[0].url}
                            alt={prod.title}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            IMG
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {prod.title}
                        </h4>
                        <span className="text-[10px] text-gray-500 block">
                          {prod.category?.name || 'Oleh-oleh'}
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
                    className="w-full p-2.5 text-center text-xs font-semibold text-[#003d29] hover:bg-[#F5F6F6] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Lihat semua hasil untuk &ldquo;{searchQuery}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : !isSearching ? (
                <div className="p-4 text-center text-xs text-gray-500">
                  Tidak ada produk yang cocok dengan &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Side: Account & Cart Icons */}
        <div className="flex items-center gap-5">
          {/* User Account / Profile */}
          <Link
            href={user ? '/account' : '/login'}
            className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#003d29] transition-colors"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="hidden sm:inline">{user ? user.firstName : 'Akun'}</span>
          </Link>

          {/* Cart Icon with Item Counter Badge */}
          <button
            onClick={() => openCart()}
            type="button"
            className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#003d29] transition-colors relative"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#003d29] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Keranjang</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-gray-600 hover:text-black rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari oleh-oleh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-[#F5F6F6] rounded-full text-xs text-gray-800 outline-none"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs font-medium text-gray-700">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Kategori</p>
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 hover:text-[#003d29]"
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
