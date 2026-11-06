'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  History,
  Search,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Settings,
  LogOut,
  Layers,
  Sparkles,
  Store,
  Grid,
  Plus,
  PanelLeftClose,
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [catalogOpen, setCatalogOpen] = useState(
    pathname.startsWith('/products') || pathname.startsWith('/inventory'),
  );

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <aside className="w-68 bg-white border-r border-[#E5E7EB] min-h-screen flex flex-col shrink-0 px-4 py-5 select-none justify-between">
      <div>
        {/* Top Header: Logo + Collapse Button */}
        <div className="flex items-center justify-between px-2 mb-5">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-black flex items-center">
              Wi<span className="text-black font-extrabold">N</span>k
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-medium">
              OS
            </span>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Store Selector Dropdown */}
        <div className="mb-4">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#E5E7EB] hover:border-gray-300 rounded-xl text-xs font-medium text-gray-800 shadow-2xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-gray-500" />
              <span>Mob Shop</span>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Search Bar with ⌘K Badge */}
        <div className="mb-6">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-9 py-2 bg-[#F4F4F6] border-0 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
            />
            <span className="absolute right-2.5 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-2xs">
              ⌘K
            </span>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-1 mb-6">
          <span className="px-3 text-[11px] font-medium text-gray-400 block mb-2">Menu</span>

          {/* Home */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              pathname === '/'
                ? 'bg-[#F4F4F6] text-black font-semibold'
                : 'text-gray-600 hover:text-black hover:bg-[#FAFAFA]'
            }`}
          >
            <Home className="w-4 h-4 text-gray-600" />
            <span>Home</span>
          </Link>

          {/* Catalog (Collapsible) */}
          <div>
            <button
              onClick={() => setCatalogOpen(!catalogOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                pathname.startsWith('/products') || pathname.startsWith('/inventory')
                  ? 'bg-[#F4F4F6] text-black font-semibold'
                  : 'text-gray-600 hover:text-black hover:bg-[#FAFAFA]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-600" />
                <span>Catalog</span>
              </div>
              {catalogOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
            {catalogOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <Link
                  href="/products"
                  className={`block py-1.5 px-2 text-xs rounded-lg transition-colors ${
                    pathname === '/products'
                      ? 'text-black font-semibold bg-gray-100/60'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Products
                </Link>
                <Link
                  href="/inventory"
                  className={`block py-1.5 px-2 text-xs rounded-lg transition-colors ${
                    pathname === '/inventory'
                      ? 'text-black font-semibold bg-gray-100/60'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Inventory & Stock
                </Link>
              </div>
            )}
          </div>

          {/* Orders */}
          <Link
            href="/orders"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              pathname === '/orders'
                ? 'bg-[#F4F4F6] text-black font-semibold'
                : 'text-gray-600 hover:text-black hover:bg-[#FAFAFA]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-gray-600" />
            <span>Orders</span>
          </Link>

          {/* Customers */}
          <Link
            href="/customers"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              pathname === '/customers'
                ? 'bg-[#F4F4F6] text-black font-semibold'
                : 'text-gray-600 hover:text-black hover:bg-[#FAFAFA]'
            }`}
          >
            <Users className="w-4 h-4 text-gray-600" />
            <span>Customers</span>
          </Link>

          {/* Analytics / Reports */}
          <Link
            href="/reports"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              pathname === '/reports'
                ? 'bg-[#F4F4F6] text-black font-semibold'
                : 'text-gray-600 hover:text-black hover:bg-[#FAFAFA]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <span>Analytics</span>
          </Link>

          {/* Audit Logs */}
          <Link
            href="/audit"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              pathname === '/audit'
                ? 'bg-[#F4F4F6] text-black font-semibold'
                : 'text-gray-600 hover:text-black hover:bg-[#FAFAFA]'
            }`}
          >
            <History className="w-4 h-4 text-gray-600" />
            <span>Audit Logs</span>
          </Link>
        </div>

        {/* Integrations Section */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-medium text-gray-400">Integrations</span>
            <Plus className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700 cursor-pointer" />
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-gray-600 hover:bg-[#FAFAFA] rounded-xl transition-colors cursor-pointer">
            <Grid className="w-4 h-4 text-gray-500" />
            <span>Integrations</span>
          </div>
        </div>

        {/* Sales Channels Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-medium text-gray-400">Sales Channels</span>
            <Plus className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700 cursor-pointer" />
          </div>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs text-gray-600 hover:text-black hover:bg-[#FAFAFA] rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 text-gray-500" />
              <span>Online Store</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Bottom User Card & Actions */}
      <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-amber-200 to-indigo-200 border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
              JW
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 leading-tight">Jenny Wilson</span>
              <span className="text-[11px] text-gray-400 font-mono">orbix@mail.com</span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="space-y-0.5">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 text-xs text-gray-600 hover:text-black hover:bg-gray-100/60 rounded-lg transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-gray-500" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
