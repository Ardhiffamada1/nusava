'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Store,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  Package,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { StoreProfile, OFFICIAL_WA_NUMBER } from '../lib/storefront-helpers';

interface StoreProfileModalProps {
  store: StoreProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StoreProfileModal({ store, isOpen, onClose }: StoreProfileModalProps) {
  if (!isOpen || !store) return null;

  const waStoreMessage = `Halo ${store.name}! Saya melihat profil toko Anda di Onestore Nusantara dan ingin menanyakan produk oleh-oleh yang tersedia.`;
  const waUrl = `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(waStoreMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
      <div className="bg-white border border-stone-200 max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#003d29]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#003d29]">
              Profil Toko & Produsen UMKM
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Tutup profil toko"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Hero Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#FAF9F5] p-5 rounded-xl border border-stone-200">
          <div className="relative w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0 border border-stone-200">
            <Image
              src={store.avatar}
              alt={store.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-stone-900 leading-snug">
                {store.name}
              </h2>
              {store.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{store.type}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-stone-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#003d29] shrink-0" />
              <span>{store.city}, {store.province}</span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600 font-medium">Mitra sejak {store.joinedYear}</span>
            </p>
          </div>
        </div>

        {/* Store Metrics Grid (Like Shopee / Tokopedia seller box) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-[#F5F6F6] rounded-xl border border-stone-200">
            <div className="flex items-center justify-center gap-1 text-stone-900 font-bold text-sm">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{store.rating}</span>
            </div>
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              {store.reviewCount.toLocaleString('id-ID')} Ulasan
            </span>
          </div>

          <div className="p-3 bg-[#F5F6F6] rounded-xl border border-stone-200">
            <div className="flex items-center justify-center gap-1 text-stone-900 font-bold text-sm">
              <Package className="w-3.5 h-3.5 text-[#003d29]" />
              <span>{store.productCount}+</span>
            </div>
            <span className="text-[10px] text-stone-500 mt-0.5 block">Produk Aktif</span>
          </div>

          <div className="p-3 bg-[#F5F6F6] rounded-xl border border-stone-200">
            <div className="flex items-center justify-center gap-1 text-stone-900 font-bold text-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{store.chatResponseRate}</span>
            </div>
            <span className="text-[10px] text-stone-500 mt-0.5 block">Balas Chat</span>
          </div>

          <div className="p-3 bg-[#F5F6F6] rounded-xl border border-stone-200">
            <div className="flex items-center justify-center gap-1 text-stone-900 font-bold text-sm">
              <Calendar className="w-3.5 h-3.5 text-stone-600" />
              <span>{store.chatResponseTime}</span>
            </div>
            <span className="text-[10px] text-stone-500 mt-0.5 block">Waktu Respon</span>
          </div>
        </div>

        {/* Story & Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Tentang Dapur / Bengkel UMKM
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed bg-white border border-stone-200 p-4 rounded-xl">
            {store.description}
          </p>
        </div>

        {/* Legalitas & Keamanan Pangan */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Legalitas & Standar Keaslian
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-3 bg-[#FAF9F5] border border-stone-200 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block text-xs">
                  {store.pirtNumber ? 'Izin Resmi P-IRT' : 'Terdaftar di Pemda'}
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  {store.pirtNumber || 'UMKM Binaan Daerah'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-[#FAF9F5] border border-stone-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block text-xs">Sertifikasi Halal MUI</span>
                <span className="text-[11px] text-stone-500">Bahan Baku 100% Halal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="text-xs text-stone-500 pt-1">
          <span className="font-semibold text-stone-700">Alamat Sentra / Workshop:</span>{' '}
          <span>{store.address}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-stone-200 text-xs">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 rounded-lg text-center flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Chat Penjual via WhatsApp</span>
          </a>

          <Link
            href={`/products?q=${encodeURIComponent(store.city)}`}
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 bg-[#003d29] hover:bg-[#002b1c] text-white font-bold rounded-lg text-center flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Store className="w-4 h-4 text-white" />
            <span>Katalog Toko ({store.productCount} Produk)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
