'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, ShieldCheck, Clock } from 'lucide-react';
import { OFFICIAL_WA_NUMBER } from '../lib/storefront-helpers';

export function WhatsAppFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const defaultMessage =
    'Halo CS MINDI! Saya ingin bertanya seputar rekomendasi oleh-oleh Nusantara, ketersediaan stok, dan estimasi pengiriman ke alamat saya.';

  const waUrl = `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans flex flex-col items-end">
      {/* Concierge Support Popover */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white border border-stone-200 rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg bg-[#003d29] text-white flex items-center justify-center font-bold text-xs tracking-wider">
                <span>CS</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 leading-tight">Layanan Bantuan Pelanggan</h4>
                <p className="text-xs text-emerald-700 font-medium">Online • Respon Cepat</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
              aria-label="Tutup bantuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="py-3 space-y-2">
            <div className="text-xs text-stone-600 leading-relaxed bg-[#FAF9F5] rounded-lg p-3 border border-stone-200/60">
              <p>
                Selamat datang di MINDI. Ada yang bisa kami bantu seputar pesanan oleh-oleh, konfirmasi pembayaran, atau pelacakan kurir ekspedisi?
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500 px-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Jam Layanan: Setiap Hari 08.00 - 21.00 WIB</span>
            </div>
          </div>

          {/* CTA Link to WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-1 py-2.5 px-4 bg-[#003d29] hover:bg-[#002b1d] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Mulai Chat Customer Service</span>
          </a>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-[#003d29] hover:bg-[#002b1d] text-white py-2.5 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Bantuan Customer Service"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#003d29]" />
        </div>
        <span className="text-xs font-semibold hidden sm:inline tracking-wide">
          Bantuan CS
        </span>
      </button>
    </div>
  );
}
