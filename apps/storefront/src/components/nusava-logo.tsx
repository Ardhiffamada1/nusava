'use client';

import React from 'react';

export interface NusavaLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'stacked' | 'icon';
  theme?: 'light' | 'dark' | 'gold' | 'mono-dark' | 'mono-light';
}

/**
 * High-contrast Optima-style flared geometric vector letterforms for NUSAVA
 * matching the approved reference lockup.
 */
const NUSAVA_OPTIMA_PATHS = (
  <>
    {/* N: thin vertical stems, bold diagonal */}
    <path d="M 2 30 V 2 H 5.2 L 23.4 23.2 V 2 H 26 V 30 H 22.8 L 4.6 8.8 V 30 H 2 Z" />
    {/* U: bold left stem, delicate bottom arc & right stem */}
    <path d="M 40 2 H 44.4 V 18.5 C 44.4 24.5 47.6 27.8 52.6 27.8 C 57.8 27.8 61.4 24.5 61.4 18.5 V 2 H 64 V 18.8 C 64 26.2 59.4 30.4 52.2 30.4 C 44.8 30.4 40 26.2 40 18.8 V 2 Z" />
    {/* S: high-contrast graceful S curve */}
    <path d="M 88.8 1.6 C 93.2 1.6 96.8 3.0 98.4 5.4 L 96.2 7.2 C 94.6 5.0 92.0 4.0 88.6 4.0 C 84.2 4.0 81.6 5.8 81.6 8.4 C 81.6 11.0 84.2 12.2 89.4 13.6 C 95.8 15.3 99.4 17.6 99.4 22.2 C 99.4 27.2 95.0 30.4 88.0 30.4 C 82.6 30.4 78.6 28.6 76.6 25.4 L 78.9 23.6 C 80.8 26.4 84.0 27.9 88.0 27.9 C 92.6 27.9 95.2 25.9 95.2 23.0 C 95.2 20.1 92.8 18.8 87.4 17.4 C 81.2 15.8 77.6 13.5 77.6 9.0 C 77.6 4.4 82.0 1.6 88.8 1.6 Z" />
    {/* A: thin left leg, bold right leg, thin crossbar */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 122.2 1.8 H 124.8 L 136.4 30 H 131.6 L 128.5 22.4 H 116.5 L 113.4 30 H 110.6 L 122.2 1.8 Z M 117.4 20.2 H 127.6 L 122.5 7.4 L 117.4 20.2 Z"
    />
    {/* V: bold left leg, thin right leg */}
    <path d="M 146.0 2 H 150.8 L 159.6 24.2 L 168.4 2 H 171.2 L 159.8 30.2 H 157.2 L 146.0 2 Z" />
    {/* A: thin left leg, bold right leg, thin crossbar */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 192.2 1.8 H 194.8 L 206.4 30 H 201.6 L 198.5 22.4 H 186.5 L 183.4 30 H 180.6 L 192.2 1.8 Z M 187.4 20.2 H 197.6 L 192.5 7.4 L 187.4 20.2 Z"
    />
  </>
);

/**
 * NUSAVA — Satu Indonesia, Banyak Cerita.
 * Unified Deep Forest Green (#123D34) 3x3 Diamond-Lattice Pohon Hayat Emblem
 * with refined, understated Optima-style NUSAVA typography.
 */
export function NusavaLogo({
  className = '',
  showTagline = true,
  size = 'md',
  variant = 'horizontal',
  theme = 'light',
}: NusavaLogoProps) {
  const iconDimensions =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'lg'
      ? 'w-12 h-12'
      : 'w-10 h-10';

  // Proportionately smaller, refined wordmark height relative to the diamond emblem
  const wordmarkHeight =
    size === 'sm'
      ? 'h-3'
      : size === 'lg'
      ? 'h-4.5'
      : 'h-3.5';

  const taglineSize =
    size === 'sm'
      ? 'text-[8px] tracking-[0.02em]'
      : size === 'lg'
      ? 'text-[10px] tracking-[0.03em]'
      : 'text-[8.5px] tracking-[0.025em]';

  const isDark = theme === 'dark' || theme === 'mono-light';
  const isGold = theme === 'gold';

  const diamondFill = isDark
    ? '#FFFFFF'
    : isGold
    ? '#C49642'
    : '#123D34';

  const wordmarkFill = isDark
    ? '#FFFFFF'
    : '#123D34';

  const taglineColor = isDark
    ? 'text-white/85'
    : 'text-[#123D34]/90';

  const IconSvg = (
    <svg
      viewBox="0 0 64 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconDimensions} shrink-0`}
      aria-hidden="true"
    >
      <g fill={diamondFill}>
        <path d="M 30.9 18.3 L 26.2 12.85 Q 24.6 11.0 26.2 9.15 L 30.4 4.25 Q 32.0 2.4 33.6 4.25 L 37.8 9.15 Q 39.4 11.0 37.8 12.85 L 33.1 18.3 V 13.2 C 34.8 13.0 36.2 11.6 35.8 9.8 C 34.2 10.0 33.2 11.2 32.9 12.4 C 33.9 10.6 33.8 7.8 32.0 5.8 C 30.2 7.8 30.1 10.6 31.1 12.4 C 30.8 11.2 29.8 10.0 28.2 9.8 C 27.8 11.6 29.2 13.0 30.9 13.2 Z" />
        <path d="M 21.2 28.9 L 16.8 23.85 Q 15.2 22.0 16.8 20.15 L 21.0 15.25 Q 22.6 13.4 24.2 15.25 L 28.4 20.15 Q 30.0 22.0 28.4 23.85 L 24.0 28.9 V 27.36 A 3.1 3.1 0 1 0 21.2 27.36 Z" />
        <path d="M 40.0 28.9 L 35.6 23.85 Q 34.0 22.0 35.6 20.15 L 39.8 15.25 Q 41.4 13.4 43.0 15.25 L 47.2 20.15 Q 48.8 22.0 47.2 23.85 L 42.8 28.9 V 27.36 A 3.1 3.1 0 1 0 40.0 27.36 Z" />
        <path d="M 14.8 26.25 L 19.0 31.15 Q 20.6 33.0 19.0 34.85 L 14.8 39.75 Q 13.2 41.6 11.6 39.75 L 7.4 34.85 Q 5.8 33.0 7.4 31.15 L 11.6 26.25 Q 13.2 24.4 14.8 26.25 Z" />
        <path d="M 30.3 39.65 L 26.2 34.85 Q 24.6 33.0 26.2 31.15 L 30.4 26.25 Q 32.0 24.4 33.6 26.25 L 37.8 31.15 Q 39.4 33.0 37.8 34.85 L 33.7 39.65 V 31.9 A 1.7 1.7 0 0 0 30.3 31.9 Z" />
        <path d="M 52.4 26.25 L 56.6 31.15 Q 58.2 33.0 56.6 34.85 L 52.4 39.75 Q 50.8 41.6 49.2 39.75 L 45.0 34.85 Q 43.4 33.0 45.0 31.15 L 49.2 26.25 Q 50.8 24.4 52.4 26.25 Z" />
        <path d="M 24.2 37.25 L 28.4 42.15 Q 30.0 44.0 28.6 45.6 C 26.2 48.2 21.0 48.4 17.4 46.4 Q 15.2 44.0 16.8 42.15 L 21.0 37.25 Q 22.6 35.4 24.2 37.25 Z" />
        <path d="M 43.0 37.25 L 47.2 42.15 Q 48.8 44.0 46.6 46.4 C 43.0 48.4 37.8 48.2 35.4 45.6 Q 34.0 44.0 35.6 42.15 L 39.8 37.25 Q 41.4 35.4 43.0 37.25 Z" />
        <path d="M 20.2 50.8 C 23.8 51.8 27.4 51.4 29.8 49.8 C 30.2 49.5 30.4 49.8 30.4 50.4 V 60.8 Q 30.4 62.6 29.0 61.0 L 19.8 52.0 Q 19.0 50.5 20.2 50.8 Z" />
        <path d="M 43.8 50.8 C 40.2 51.8 36.6 51.4 34.2 49.8 C 33.8 49.5 33.6 49.8 33.6 50.4 V 60.8 Q 33.6 62.6 35.0 61.0 L 44.2 52.0 Q 45.0 50.5 43.8 50.8 Z" />
      </g>
    </svg>
  );

  const WordmarkSvg = (
    <svg
      viewBox="0 0 208 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${wordmarkHeight} w-auto shrink-0`}
      aria-label="NUSAVA"
    >
      <g fill={wordmarkFill}>{NUSAVA_OPTIMA_PATHS}</g>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        {IconSvg}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`inline-flex flex-col items-center text-center gap-1.5 select-none font-sans ${className}`}
      >
        {IconSvg}
        <div className="flex flex-col items-center leading-none">
          {WordmarkSvg}
          {showTagline && (
            <span className={`font-semibold mt-1 whitespace-nowrap ${taglineColor} ${taglineSize}`}>
              Satu Indonesia, Banyak Cerita.
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none font-sans ${className}`}>
      {IconSvg}
      <div className="flex flex-col justify-center leading-none">
        {WordmarkSvg}
        {showTagline && (
          <span className={`font-semibold mt-1 whitespace-nowrap ${taglineColor} ${taglineSize}`}>
            Satu Indonesia, Banyak Cerita.
          </span>
        )}
      </div>
    </div>
  );
}
