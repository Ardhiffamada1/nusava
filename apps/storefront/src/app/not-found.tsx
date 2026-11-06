import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32 text-center flex flex-col items-center justify-center">
      <span className="text-[11px] font-mono tracking-widest uppercase text-gray-400 mb-2">
        404 • HALAMAN TIDAK DITEMUKAN
      </span>
      <h1 className="text-3xl font-light text-gray-900 tracking-tight">
        Halaman yang Anda tuju tidak tersedia
      </h1>
      <p className="text-xs text-gray-500 mt-2 mb-8 max-w-md">
        Karya atau tautan yang Anda cari mungkin telah dipindahkan atau tidak lagi aktif.
      </p>
      <Link
        href="/"
        className="text-xs font-semibold uppercase tracking-wider text-black border-b border-black pb-1 hover:opacity-70 transition-opacity"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
