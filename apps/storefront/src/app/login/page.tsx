'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDto, LoginDtoSchema } from '@commerceos/contracts';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { NusavaLogo } from '../../components/nusava-logo';
import {
  ArrowRight,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';

function GoogleLogoSvg() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const setUser = useAuthStore((s) => s.setUser);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      setGoogleNotice(false);

      const res = await apiRequest<{ user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setUser(res.user);
      router.push(redirect);
    } catch (err: any) {
      setErrorMessage(err.message || 'Email atau kata sandi yang Anda masukkan tidak sesuai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCustomer = () => {
    setGoogleNotice(false);
    setErrorMessage(null);
    setValue('email', 'customer@commerceos.dev');
    setValue('password', 'Customer12345!');
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16 font-sans">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Centered NUSAVA Logo & Heading */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex justify-center focus:outline-none">
            <NusavaLogo size="md" showTagline={true} />
          </Link>

          <div className="pt-2 border-t border-stone-100">
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Masuk ke Akun Anda
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Belum punya akun NUSAVA?{' '}
              <Link
                href={`/register?redirect=${redirect}`}
                className="text-[#003d29] font-bold hover:underline"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Google Sign-In Button (Visual Display Only) */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setGoogleNotice(true)}
            className="w-full py-3 px-4 bg-white hover:bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs font-bold text-stone-800 flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
          >
            <GoogleLogoSvg />
            <span>Masuk dengan Google</span>
          </button>

          {googleNotice && (
            <div className="p-3 bg-[#FAF9F5] border border-stone-200 text-stone-700 text-[11px] rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 text-[#003d29] shrink-0 mt-0.5" />
              <span>
                Tombol <strong>Masuk dengan Google</strong> merupakan tampilan antarmuka. Silakan masuk menggunakan email atau klik <strong>Akun Pelanggan Demo</strong> di bawah.
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 whitespace-nowrap">
            Atau masuk dengan email
          </span>
          <div className="border-t border-stone-200 w-full" />
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                {...register('email')}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 border border-stone-200 bg-white rounded-xl focus:outline-none focus:border-[#003d29] transition-colors"
                placeholder="nama@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={fillDemoCustomer}
                className="text-[11px] font-semibold text-[#003d29] hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 border border-stone-200 bg-white rounded-xl focus:outline-none focus:border-[#003d29] transition-colors"
                placeholder="Masukkan kata sandi"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                aria-label="Tampilkan kata sandi"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#003d29] hover:bg-[#002b1c] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl disabled:opacity-40 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{isSubmitting ? 'Memverifikasi Akun...' : 'Masuk Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Account Helper */}
        <div className="pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Coba Akun Demo
            </span>
            <span className="text-[10px] font-semibold text-[#003d29]">Klik untuk isi otomatis</span>
          </div>
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="w-full text-left text-xs p-3 bg-[#FAF9F5] hover:bg-stone-100/80 border border-stone-200 hover:border-[#003d29] rounded-xl transition-colors flex items-center justify-between gap-2"
          >
            <div>
              <div className="font-bold text-stone-900">Isi Otomatis Akun Pelanggan Demo</div>
              <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                customer@commerceos.dev • Customer12345!
              </div>
            </div>
            <span className="text-xs font-bold text-[#003d29] shrink-0">Isi →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-6 py-20 text-center text-xs text-stone-400 font-sans">
          Memuat halaman masuk...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
