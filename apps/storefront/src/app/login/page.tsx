'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDto, LoginDtoSchema } from '@commerceos/contracts';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';

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
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCustomer = () => {
    setValue('email', 'customer@commerceos.dev');
    setValue('password', 'Customer12345!');
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="border border-border bg-white p-8 rounded-xs shadow-xs">
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-ink-secondary">Client Access</span>
          <h1 className="text-2xl font-light text-ink tracking-tight mt-1">Sign In</h1>
          <p className="text-xs text-ink-secondary mt-1">
            Access your order history, delivery tracking, and saved profile.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
              placeholder="customer@commerceos.dev"
            />
            {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
              Password
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
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-ink-secondary font-medium mb-2">
            Demo Environment Fill
          </p>
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="w-full text-left text-xs p-2.5 bg-surface border border-border rounded-xs hover:border-ink/50 transition-colors"
          >
            <div className="font-medium text-ink">Fill Demo Customer</div>
            <div className="text-[11px] text-ink-secondary font-mono mt-0.5">customer@commerceos.dev / Customer12345!</div>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-ink-secondary">
          Don&apos;t have an account yet?{' '}
          <Link href={`/register?redirect=${redirect}`} className="text-ink font-medium underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-6 py-20 text-xs">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
