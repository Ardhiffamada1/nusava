'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguageStore, translations } from '../stores/language-store';

export function Footer() {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <footer className="border-t border-[#F0F0EE] bg-[#FAF9F5] mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <span className="font-semibold text-sm tracking-[0.22em] text-gray-900 uppercase">
              {t.brandName}
            </span>
            <span className="text-[10px] tracking-widest text-gray-400 font-mono block mt-0.5">
              {t.brandSub}
            </span>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">
              {t.footer.collectionsTitle}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li>
                <Link
                  href="/products?category=living-ceramics"
                  className="hover:text-black transition-colors"
                >
                  {language === 'id' ? 'Kriya Kayu & Gerabah' : 'Teak & Pottery'}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=apparel"
                  className="hover:text-black transition-colors"
                >
                  {language === 'id' ? 'Wastra & Batik Tulis' : 'Handwoven Textiles'}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=workspace"
                  className="hover:text-black transition-colors"
                >
                  {language === 'id' ? 'Oleh-oleh & Kopi Daerah' : 'Regional Coffee & Bakes'}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=leather-goods"
                  className="hover:text-black transition-colors"
                >
                  {language === 'id' ? 'Kerajinan Kulit Nabati' : 'Vegetable-tanned Leather'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">
              {t.footer.infoTitle}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600">
              {t.footer.infoItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">
              {t.footer.architectureTitle}
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t.footer.architectureDesc}
            </p>
          </div>
        </div>

        <div className="border-t border-[#EAE9E4] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400">
          <p>© 2026 {t.brandName}. {t.footer.rights}</p>
          <div className="flex gap-6 mt-4 sm:mt-0 text-gray-400">
            <span>Beli Oleh-oleh Khas Daerah Aman & Cepat</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
