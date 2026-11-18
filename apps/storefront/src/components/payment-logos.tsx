'use client';

import React from 'react';

/**
 * Clean, professional payment method badges without excessive tags or decorations.
 * QRIS, BCA, Mandiri, BNI, BRI, COD (Bayar di Tempat)
 */

export function QrisBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center h-8 px-3 bg-white border border-stone-200 rounded-md select-none ${className}`}
      title="QRIS"
    >
      <span className="font-black text-xs tracking-tight text-[#EA1D25]">QR</span>
      <span className="font-black text-xs tracking-tight text-stone-800">IS</span>
    </div>
  );
}

export function BcaBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center h-8 px-3 bg-white border border-stone-200 rounded-md select-none ${className}`}
      title="BCA"
    >
      <span className="font-extrabold text-xs tracking-tight text-[#005FAA]">BCA</span>
    </div>
  );
}

export function MandiriBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center h-8 px-3 bg-white border border-stone-200 rounded-md select-none ${className}`}
      title="Mandiri"
    >
      <span className="font-bold text-xs tracking-tight text-[#003366]">mandiri</span>
    </div>
  );
}

export function BniBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center h-8 px-3 bg-white border border-stone-200 rounded-md select-none ${className}`}
      title="BNI"
    >
      <span className="font-black text-xs tracking-tight text-[#005E6A]">BNI</span>
    </div>
  );
}

export function BriBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center h-8 px-3 bg-white border border-stone-200 rounded-md select-none ${className}`}
      title="BRI"
    >
      <span className="font-extrabold text-xs tracking-tight text-[#00529C]">BRI</span>
    </div>
  );
}

export function CodBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center h-8 px-3 bg-white border border-stone-200 rounded-md select-none ${className}`}
      title="COD (Bayar di Tempat)"
    >
      <span className="font-bold text-xs text-stone-800">COD (Bayar di Tempat)</span>
    </div>
  );
}
