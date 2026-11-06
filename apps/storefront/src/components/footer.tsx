import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <span className="font-semibold text-sm tracking-[0.25em] text-gray-900 uppercase">
              MINDI
            </span>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Quiet daily objects crafted from ceramic, wood, and tin. Made for thoughtful spaces.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li>
                <Link href="/products?category=living-ceramics" className="hover:text-black transition-colors">
                  Wood & Living
                </Link>
              </li>
              <li>
                <Link href="/products?category=living-ceramics" className="hover:text-black transition-colors">
                  Ceramic
                </Link>
              </li>
              <li>
                <Link href="/products?category=workspace" className="hover:text-black transition-colors">
                  Tin & Workspace
                </Link>
              </li>
              <li>
                <Link href="/products?category=apparel" className="hover:text-black transition-colors">
                  Apparel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">
              Info
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li>Cash on Delivery</li>
              <li>Manual Bank Transfer (Demo)</li>
              <li>Shipping & Returns</li>
              <li>Terms of Service</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">
              Architecture
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fullstack modular monolith portfolio project built with NestJS, Next.js 15, Prisma, and PostgreSQL.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400">
          <p>© 2026 MINDI / CommerceOS. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">
              Admin Management Console (:3001)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
