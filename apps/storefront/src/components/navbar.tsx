'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Phone,
  ChevronDown,
  X,
  Menu,
} from 'lucide-react';
import { useCartStore } from '../stores/cart-store';
import { useAuthStore } from '../stores/auth-store';

export function Navbar() {
  const pathname = usePathname();
  const { openCart, itemCount } = useCartStore();
  const { user } = useAuthStore();

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const categories = [
    { name: 'Kudapan & Makanan Khas', slug: 'living-ceramics' },
    { name: 'Kerajinan Kayu & Meja', slug: 'living-ceramics' },
    { name: 'Gerabah & Tembikar Kasongan', slug: 'living-ceramics' },
    { name: 'Batik & Kain Tradisional', slug: 'apparel' },
    { name: 'Kopi & Rempah Nusantara', slug: 'workspace' },
    { name: 'Kerajinan Kulit Asli', slug: 'leather-goods' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 font-sans">
      {/* 1. Top Utility Header (Dark Green #003d29 like reference image) */}
      <div className="bg-[#003d29] text-white text-xs py-2 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Phone Contact */}
          <div className="flex items-center gap-2 text-white/90">
            <Phone className="w-3.5 h-3.5" />
            <span className="font-medium">+62 812-3456-7890</span>
          </div>

          {/* Center Promo Text */}
          <div className="text-center font-medium">
            <span>Dapatkan Diskon Spesial s/d 50% Untuk Pilihan Oleh-oleh Nusantara | </span>
            <Link href="/products" className="underline font-bold hover:text-amber-300 ml-1">
              Beli Sekarang
            </Link>
          </div>

          {/* Right Language & Location Selector */}
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <span>Indonesia</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <span>IDR (Rp)</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Clean White with Green Accents) */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3.5 flex items-center justify-between gap-6">
        {/* Brand Logo: Shopcart style */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#003d29] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#003d29] tracking-tight leading-none">
                Shopcart<span className="text-emerald-600">.</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                Oleh-oleh Nusantara
              </span>
            </div>
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
          <Link href="/products" className="hover:text-[#003d29] transition-colors">
            Pengiriman
          </Link>
        </nav>

        {/* Center Search Input (Rounded-full with search icon) */}
        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari oleh-oleh, bakpia, keripik, batik, kopi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-11 py-2.5 bg-[#F5F6F6] hover:bg-[#EFEFEF] focus:bg-white border border-transparent focus:border-[#003d29] rounded-full text-xs text-gray-800 placeholder-gray-400 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003d29]"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
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
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#003d29] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Keranjang</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-gray-700 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-gray-100 rounded-full text-xs"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-medium text-gray-700 py-1"
          >
            Semua Produk
          </Link>
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs text-gray-600 py-1"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
