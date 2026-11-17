'use client';

import React from 'react';

interface NusavaLogoProps {
  className?: string;
  showTagline?: boolean;
  hideTaglineOnMobile?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * NUSAVA — Satu Indonesia, Banyak Cerita.
 * Emblem konsep Hijau Zamrud Tua (#003D29) & Emas Pusaka Nusantara (#C5A059 / #D4AF37)
 * Menggabungkan siluet Gunungan Nusantara, Empat Penjuru Kawung, dan Gelombang Kepulauan.
 */
export function NusavaLogo({
  className = '',
  showTagline = true,
  hideTaglineOnMobile = false,
  size = 'md',
}: NusavaLogoProps) {
  const iconDimensions =
    size === 'sm'
      ? 'w-8 h-8 sm:w-9 sm:h-9'
      : size === 'lg'
      ? 'w-10 h-10 sm:w-12 sm:h-12'
      : 'w-8 h-8 sm:w-10 sm:h-10';
  const titleSize =
    size === 'sm'
      ? 'text-base sm:text-lg tracking-[0.12em] sm:tracking-[0.14em]'
      : size === 'lg'
      ? 'text-xl sm:text-2xl tracking-[0.14em] sm:tracking-[0.16em]'
      : 'text-base sm:text-xl tracking-[0.12em] sm:tracking-[0.15em]';
  const taglineSize =
    size === 'sm'
      ? 'text-[8.5px] sm:text-[9px] tracking-[0.03em]'
      : size === 'lg'
      ? 'text-[10px] sm:text-[11px] tracking-[0.05em]'
      : 'text-[9px] sm:text-[10px] tracking-[0.04em]';

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-3 select-none font-sans ${className}`}>
      {/* Nusantara Green & Gold Crest Emblem */}
      <div
        className={`relative ${iconDimensions} rounded-xl bg-[#003d29] border border-[#C5A059]/60 shadow-xs flex items-center justify-center shrink-0 overflow-hidden group-hover:border-[#D4AF37] transition-colors`}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
          aria-hidden="true"
        >
          {/* Outer Subtle Gold Frame */}
          <rect
            x="2.5"
            y="2.5"
            width="39"
            height="39"
            rx="8"
            stroke="#C5A059"
            strokeWidth="0.85"
            strokeOpacity="0.45"
          />

          {/* Corner Batik Kawung Accents */}
          <circle cx="6.5" cy="6.5" r="1" fill="#D4AF37" fillOpacity="0.6" />
          <circle cx="37.5" cy="6.5" r="1" fill="#D4AF37" fillOpacity="0.6" />
          <circle cx="6.5" cy="37.5" r="1" fill="#D4AF37" fillOpacity="0.6" />
          <circle cx="37.5" cy="37.5" r="1" fill="#D4AF37" fillOpacity="0.6" />

          {/* Nusantara Gunungan (Kayon) Outer Silhouette */}
          <path
            d="M22 6.5C22 6.5 33.5 16.5 33.5 26C33.5 31.2 28.5 35 22 35C15.5 35 10.5 31.2 10.5 26C10.5 16.5 22 6.5 22 6.5Z"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#002B1D"
          />

          {/* Inner Gunungan Gold Filigree */}
          <path
            d="M22 10.5C22 10.5 29.5 18 29.5 25.5C29.5 29.2 26.2 32 22 32C17.8 32 14.5 29.2 14.5 25.5C14.5 18 22 10.5 22 10.5Z"
            stroke="#C5A059"
            strokeWidth="0.9"
            strokeOpacity="0.7"
          />

          {/* 4-Petal Batik Kawung / Compass Star at the Heart of Gunungan */}
          <path
            d="M22 15.5C23.5 18.8 25.2 20.5 28.5 22C25.2 23.5 23.5 25.2 22 28.5C20.5 25.2 18.8 23.5 15.5 22C18.8 20.5 20.5 18.8 22 15.5Z"
            fill="#D4AF37"
          />

          {/* Center Emerald Core */}
          <circle cx="22" cy="22" r="2" fill="#003D29" />
          <circle cx="22" cy="22" r="0.9" fill="#F5E6C4" />

          {/* Archipelago Wave Base (ombak nusantara) */}
          <path
            d="M13.5 37.2C16.2 35.8 19.1 35.8 22 37.2C24.9 38.6 27.8 38.6 30.5 37.2"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Wordmark & Nusantara Tagline */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span
            className={`font-extrabold text-[#003d29] uppercase ${titleSize}`}
          >
            NUSAVA
          </span>
          <span
            className="w-1.5 h-1.5 rotate-45 bg-[#C5A059] inline-block shrink-0"
            aria-hidden="true"
          />
        </div>
        {showTagline && (
          <span
            className={`font-semibold text-[#9A7432] mt-0.5 sm:mt-1 whitespace-nowrap ${taglineSize} ${
              hideTaglineOnMobile ? 'hidden sm:inline-block' : 'inline-block'
            }`}
          >
            Satu Indonesia, Banyak Cerita.
          </span>
        )}
      </div>
    </div>
  );
}
