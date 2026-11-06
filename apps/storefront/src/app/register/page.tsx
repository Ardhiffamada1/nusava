'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterDto, RegisterDtoSchema } from '@commerceos/contracts';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { ArrowRight, AlertCircle } from 'lucide-react';

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
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="border border-border bg-white p-8 rounded-xs shadow-xs">
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-ink-secondary">New Client</span>
          <h1 className="text-2xl font-light text-ink tracking-tight mt-1">Create Account</h1>
          <p className="text-xs text-ink-secondary mt-1">
            Register to save addresses and track your orders.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                {...register('firstName')}
                className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
                placeholder="Elena"
              />
              {errors.firstName && <p className="text-[10px] text-rose-600 mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...register('lastName')}
                className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
                placeholder="Rostova"
              />
              {errors.lastName && <p className="text-[10px] text-rose-600 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
              placeholder="elena@example.com"
            />
            {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
              Password (Min 8 Characters)
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
              placeholder="••••••••••••"
            />
            {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-ink text-white text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xs hover:bg-ink/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{isSubmitting ? 'Registering Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-ink-secondary">
          Already have an account?{' '}
          <Link href={`/login?redirect=${redirect}`} className="text-ink font-medium underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-6 py-20 text-xs">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
