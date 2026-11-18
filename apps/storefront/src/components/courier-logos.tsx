import React from 'react';

export function JneLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center bg-white border border-stone-200 rounded-lg px-2 py-1 shadow-2xs shrink-0 ${className}`}
    >
      <img
        src="/couriers/jne.png"
        alt="JNE Express"
        width={80}
        height={32}
        className="h-4 sm:h-4.5 w-auto object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function JntLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center bg-white border border-stone-200 rounded-lg px-2 py-1 shadow-2xs shrink-0 ${className}`}
    >
      <img
        src="/couriers/jnt.svg"
        alt="J&T Express"
        width={60}
        height={24}
        className="h-3.5 sm:h-4 w-auto object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function SicepatLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center bg-white border border-stone-200 rounded-lg px-2 py-1 shadow-2xs shrink-0 ${className}`}
    >
      <img
        src="/couriers/sicepat.png"
        alt="SiCepat Ekspres"
        width={40}
        height={40}
        className="h-4 sm:h-4.5 w-auto object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function PosLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center bg-white border border-stone-200 rounded-lg px-2 py-1 shadow-2xs shrink-0 ${className}`}
    >
      <img
        src="/couriers/pos.png"
        alt="Pos Indonesia"
        width={40}
        height={40}
        className="h-4 sm:h-4.5 w-auto object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function CourierLogo({
  courierId,
  className = 'h-7',
}: {
  courierId: string;
  className?: string;
}) {
  const id = (courierId || '').toLowerCase();
  if (id.includes('jne')) {
    return <JneLogo className={className} />;
  }
  if (id.includes('jnt') || id.includes('j&t')) {
    return <JntLogo className={className} />;
  }
  if (id.includes('sicepat')) {
    return <SicepatLogo className={className} />;
  }
  if (id.includes('pos')) {
    return <PosLogo className={className} />;
  }
  return <JneLogo className={className} />;
}
