import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="max-w-md mx-auto py-32 text-center bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-2xs">
      <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400 block mb-2">
        404 • NOT FOUND
      </span>
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">Halaman Tidak Ditemukan</h2>
      <p className="text-xs text-gray-500 mt-2 mb-6">
        Menu atau rute manajemen yang Anda tuju tidak tersedia.
      </p>
      <Link
        href="/"
        className="inline-flex px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
