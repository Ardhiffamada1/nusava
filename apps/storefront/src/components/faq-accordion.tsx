'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { OFFICIAL_WA_NUMBER } from '../lib/storefront-helpers';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Bagaimana NUSAVA menjamin makanan oleh-oleh tidak rusak atau basi selama pengiriman?',
    answer:
      'Setiap produk kuliner basah (seperti Bakpia, Pie Susu, Bika Ambon, Pempek) dikemas dengan standardisasi food-grade, vacuum pack higienis, serta proteksi multi-layer bubble wrap dan kardus tebal. Untuk produk dengan masa simpan di bawah 7 hari, kami mengarahkan rekomendasi ke kurir Kilat 1 Hari (JNE YES / SiCepat BEST) agar kesegaran dan cita rasa aslinya tetap terjaga prima saat tiba di tangan Anda.',
  },
  {
    id: 'faq-2',
    question: 'Apakah seluruh produk di NUSAVA asli langsung dari UMKM dan sentra daerahnya?',
    answer:
      'Ya, 100% asli. NUSAVA bermitra langsung dengan produsen resmi, dapur sentral, dan pengrajin UMKM di berbagai kota Nusantara (Yogyakarta, Bali, Bandung, Medan, Solo, Malang, Palembang, dan daerah lainnya). Kami tidak menjual produk tiruan atau kemasan ulang tanpa izin resmi produsen.',
  },
  {
    id: 'faq-3',
    question: 'Bagaimana jika paket saya tiba dalam kondisi rusak, remuk, atau salah varian?',
    answer:
      'Kami memberikan Garansi Penggantian Penuh (100% Replacement / Refund). Cukup ambil foto atau video unboxing paket Anda dan kirimkan ke Layanan Pelanggan WhatsApp kami dalam waktu 1x24 jam sejak barang diterima. Tim kami akan segera mengirimkan paket pengganti baru tanpa biaya tambahan atau memproses pengembalian dana Anda.',
  },
  {
    id: 'faq-4',
    question: 'Bisakah saya mengirimkan produk sebagai hampers atau kado langsung ke kerabat (Dropship)?',
    answer:
      'Tentu bisa. Pada halaman Pembayaran (Checkout), Anda cukup mengaktifkan centang "Kirim Sebagai Hadiah / Dropship". Anda dapat mencantumkan nama dan nomor ponsel Anda sebagai pengirim resmi, menyembunyikan nominal harga pada slip pengiriman, serta menitipkan pesan kartu ucapan personal untuk penerima.',
  },
  {
    id: 'faq-5',
    question: 'Metode pembayaran apa saja yang tersedia di NUSAVA?',
    answer:
      'Kami menyediakan berbagai metode pembayaran aman dan fleksibel: QRIS untuk semua e-wallet dan mobile banking (BCA, Mandiri, GoPay, OVO, ShopeePay, DANA), Virtual Account bank nasional (BCA, BRI, BNI, Mandiri), Transfer Bank Langsung, hingga opsi Bayar di Tempat (COD) untuk kurir tertentu.',
  },
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const customerCareUrl = `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(
    'Halo Layanan Pelanggan NUSAVA! Saya ingin menanyakan informasi lebih lanjut mengenai pemesanan.',
  )}`;

  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 font-sans space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#003d29] font-bold block mb-1">
            PUSAT BANTUAN
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Informasi lengkap seputar standar pengemasan aman, ketahanan produk kuliner, kurir ekspedisi resmi, dan garansi belanja di NUSAVA.
          </p>
        </div>

        <a
          href={customerCareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-[#FAF9F5] hover:bg-stone-100 border border-stone-200 text-stone-800 transition-colors shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#003d29]" />
          <span>Tanya Admin via WhatsApp</span>
        </a>
      </div>

      <div className="divide-y divide-stone-200">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="py-4">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between gap-4 text-left group focus:outline-none"
              >
                <span className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#003d29] transition-colors">
                  {item.question}
                </span>
                <span
                  className={`w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-stone-100' : 'bg-white'
                  }`}
                >
                  <ChevronDown className="w-3.5 h-3.5 text-stone-600" />
                </span>
              </button>

              {isOpen && (
                <div className="pt-3 pr-8 text-xs text-stone-600 leading-relaxed animate-in fade-in duration-200">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
