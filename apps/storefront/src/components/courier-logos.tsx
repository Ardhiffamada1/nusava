import React from 'react';

export function JneLogo({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-white border border-gray-200/90 rounded-lg px-2 py-1 shadow-2xs ${className}`}>
      <svg
        viewBox="0 0 100 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto max-h-5 object-contain"
      >
        {/* JNE Blue 'JN' and Red 'E' */}
        <text
          x="4"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="24"
          letterSpacing="-1"
          fill="#002D62"
        >
          JN
        </text>
        <text
          x="44"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="24"
          letterSpacing="-1"
          fill="#E30613"
        >
          E
        </text>
        {/* Swoosh stroke */}
        <path
          d="M62 6 L96 6 L90 10 L60 10 Z"
          fill="#002D62"
        />
        <path
          d="M60 12 L92 12 L87 15 L58 15 Z"
          fill="#E30613"
        />
        <text
          x="62"
          y="25"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="7"
          letterSpacing="1"
          fill="#002D62"
        >
          EXPRESS
        </text>
      </svg>
    </div>
  );
}

export function JntLogo({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-[#ED1C24] rounded-lg px-2.5 py-1 shadow-2xs ${className}`}>
      <svg
        viewBox="0 0 100 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto max-h-5 object-contain"
      >
        <text
          x="5"
          y="24"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="24"
          letterSpacing="-0.5"
          fill="#FFFFFF"
        >
          J&T
        </text>
        <text
          x="56"
          y="23"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontStyle="italic"
          fontSize="9"
          letterSpacing="1"
          fill="#FFFFFF"
        >
          EXPRESS
        </text>
      </svg>
    </div>
  );
}

export function SicepatLogo({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center bg-white border border-gray-200/90 rounded-lg px-2 py-1 shadow-2xs ${className}`}>
      <svg
        viewBox="0 0 110 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto max-h-5 object-contain"
      >
        {/* SiCepat Lightning bolt Icon */}
        <polygon
          points="14,3 6,18 13,18 9,29 20,13 13,13"
          fill="#DE1A22"
        />
        <text
          x="24"
          y="21"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="17"
          letterSpacing="-0.5"
          fill="#DE1A22"
        >
          SICEPAT
        </text>
        <text
          x="25"
          y="29"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="6.5"
          letterSpacing="2"
          fill="#333333"
        >
          EKSPRES
        </text>
      </svg>
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
  const id = courierId.toLowerCase();
  if (id.includes('jne')) {
    return <JneLogo className={className} />;
  }
  if (id.includes('jnt') || id.includes('j&t')) {
    return <JntLogo className={className} />;
  }
  if (id.includes('sicepat')) {
    return <SicepatLogo className={className} />;
  }
  return <JneLogo className={className} />;
}
