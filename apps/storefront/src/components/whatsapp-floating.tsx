'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { OFFICIAL_WA_NUMBER } from '../lib/storefront-helpers';

export function WhatsAppFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  const defaultMessage =
    'Halo Admin Onestore! Saya ingin bertanya seputar pilihan oleh-oleh Nusantara, ketersediaan stok, dan ongkos kirim ke alamat saya.';

  const waUrl = `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans flex flex-col items-end">
      {/* Mini Chat Greeting Balloon */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white border border-gray-200/90 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-[#003d29] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <span>OS</span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Customer Support</h4>
                <p className="text-[10px] text-emerald-600 font-semibold">Online • Siap Melayani</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Balloon Message */}
          <div className="py-3 text-xs text-gray-700 leading-relaxed bg-[#F9FAFA] rounded-xl p-3 my-2 border border-gray-100">
            <p>
              Halo kak! 👋 Ada yang bisa kami bantu seputar pesanan oleh-oleh, cek resi kurir, atau rekomendasi makanan khas Nusantara?
            </p>
          </div>

          {/* CTA Link to WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Mulai Chat via WhatsApp</span>
          </a>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-[#003d29] hover:bg-[#002b1c] text-white py-3 px-4 sm:px-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-103"
        aria-label="Bantuan WhatsApp"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#003d29] animate-pulse" />
        </div>
        <span className="text-xs font-bold hidden sm:inline tracking-wide">
          Tanya CS WhatsApp
        </span>
      </button>
    </div>
  );
}
