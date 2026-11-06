'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, ShieldCheck, X } from 'lucide-react';
import { useCartStore } from '../stores/cart-store';
import { useAuthStore } from '../stores/auth-store';

export function Navbar() {
  const pathname = usePathname();
  const { openCart, itemCount } = useCartStore();
  const { user, logout } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const count = itemCount;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Left: Brand Logo styled like MINDI */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-base font-semibold tracking-[0.28em] uppercase text-gray-900 hover:opacity-80 transition-opacity"
          >
            MINDI
          </Link>
        </div>

        {/* Center: Clean Minimalist Nav Links */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className={`text-xs font-medium tracking-wide transition-colors ${
              pathname === '/' ? 'text-black font-semibold' : 'text-gray-500 hover:text-black'
            }`}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={`text-xs font-medium tracking-wide transition-colors ${
              pathname.startsWith('/products')
                ? 'text-black font-semibold'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-xs font-medium tracking-wide text-gray-500 hover:text-black transition-colors"
          >
            About
          </Link>
          <Link
            href="/blog"
            className="text-xs font-medium tracking-wide text-gray-500 hover:text-black transition-colors"
          >
            Blog
          </Link>
        </nav>

        {/* Right: Search, Cart, User & Admin */}
        <div className="flex items-center gap-6">
          {/* Quick Admin Portal shortcut */}
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-black bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full transition-colors"
            title="Open Admin Console"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gray-700" />
            <span>Admin</span>
          </a>

          {/* Search Trigger */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              type="button"
              className="text-gray-700 hover:text-black p-1 transition-colors"
              title="Search products"
            >
              <Search className="w-4 h-4" />
            </button>

            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 text-xs px-2 py-1 outline-none text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* User Account / Sign in */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="text-xs text-gray-600 hover:text-black flex items-center gap-1 transition-colors"
                title="Account"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-gray-700 hover:text-black p-1 transition-colors"
              title="Sign in"
            >
              <User className="w-4 h-4" />
            </Link>
          )}

          {/* Cart Icon with Item Badge */}
          <button
            onClick={() => openCart()}
            type="button"
            className="text-gray-700 hover:text-black p-1 relative transition-colors"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
