'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDto, LoginDtoSchema } from '@commerceos/contracts';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const setUser = useAuthStore((s) => s.setUser);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginDtoSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await apiRequest<{ user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setUser(res.user);
      router.push(redirect);
    } catch (err: any) {
      setErrorMessage(err.message || 'Email atau kata sandi tidak cocok.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCustomer = () => {
    setValue('email', 'customer@commerceos.dev');
    setValue('password', 'Customer12345!');
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FCF0E4] flex items-center justify-center text-[#003d29] mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Masuk ke Akun</h1>
          <p className="text-xs text-gray-500 mt-1">
            Pantau status pesanan oleh-oleh dan riwayat belanja kamu.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alamat Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full text-sm p-3 border border-gray-200 bg-white rounded-xl focus:outline-hidden focus:border-[#003d29] transition-colors"
              placeholder="nama@email.com"
            />
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full text-sm p-3 border border-gray-200 bg-white rounded-xl focus:outline-hidden focus:border-[#003d29] transition-colors"
              placeholder="••••••••••••"
            />
            {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-[#003d29] hover:bg-[#002b1c] text-white text-sm font-semibold py-3.5 px-4 rounded-full disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{isSubmitting ? 'Memeriksa data...' : 'Masuk Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Coba Akun Demo
          </p>
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="w-full text-left text-xs p-3 bg-[#F9FAFA] border border-gray-200 rounded-xl hover:border-[#003d29] transition-colors"
          >
            <div className="font-semibold text-gray-900">Isi Otomatis Akun Pelanggan Demo</div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">customer@commerceos.dev / Customer12345!</div>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Belum punya akun?{' '}
          <Link href={`/register?redirect=${redirect}`} className="text-[#003d29] font-semibold hover:underline">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-6 py-20 text-xs text-gray-400">Memuat halaman masuk...</div>}>
      <LoginContent />
    </Suspense>
  );
}
