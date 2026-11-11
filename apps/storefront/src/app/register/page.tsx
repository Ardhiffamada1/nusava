'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterDto, RegisterDtoSchema } from '@commerceos/contracts';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const setUser = useAuthStore((s) => s.setUser);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDto>({
    resolver: zodResolver(RegisterDtoSchema),
  });

  const onSubmit = async (data: RegisterDto) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await apiRequest<{ user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setUser(res.user);
      router.push(redirect);
    } catch (err: any) {
      setErrorMessage(err.message || 'Pendaftaran gagal, coba periksa data Anda kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#FCF0E4] flex items-center justify-center text-[#003d29] mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Akun Baru</h1>
          <p className="text-xs text-gray-500 mt-1">
            Simpan alamat pengiriman dan lacak kiriman oleh-oleh favoritmu.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Depan
              </label>
              <input
                type="text"
                {...register('firstName')}
                className="w-full text-sm p-3 border border-stone-200 bg-white rounded-lg focus:outline-hidden focus:border-[#003d29] transition-colors"
                placeholder="Rian"
              />
              {errors.firstName && <p className="text-[11px] text-rose-600 mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Belakang
              </label>
              <input
                type="text"
                {...register('lastName')}
                className="w-full text-sm p-3 border border-stone-200 bg-white rounded-lg focus:outline-hidden focus:border-[#003d29] transition-colors"
                placeholder="Pratama"
              />
              {errors.lastName && <p className="text-[11px] text-rose-600 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alamat Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full text-sm p-3 border border-stone-200 bg-white rounded-lg focus:outline-hidden focus:border-[#003d29] transition-colors"
              placeholder="nama@email.com"
            />
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kata Sandi (Min. 8 Karakter)
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full text-sm p-3 border border-stone-200 bg-white rounded-lg focus:outline-hidden focus:border-[#003d29] transition-colors"
              placeholder="••••••••••••"
            />
            {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{isSubmitting ? 'Mendaftarkan akun...' : 'Buat Akun Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Sudah punya akun?{' '}
          <Link href={`/login?redirect=${redirect}`} className="text-[#003d29] font-semibold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-6 py-20 text-xs text-gray-400">Memuat halaman pendaftaran...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
