'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDto, LoginDtoSchema } from '@commerceos/contracts';
import { apiRequest } from '../../lib/api';
import { ShieldCheck, ArrowRight, AlertCircle, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginDtoSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await apiRequest<{ user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (res.user.role !== 'ADMIN') {
        setErrorMessage('Access denied: Administrator privileges required.');
        return;
      }

      router.push('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrative credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setValue('email', 'admin@commerceos.dev');
    setValue('password', 'Admin12345!');
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white border border-border p-8 rounded-xs shadow-xs">
        <div className="text-center mb-6">
          <div className="w-9 h-9 bg-ink text-white rounded-xs flex items-center justify-center mx-auto mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-light text-ink tracking-tight">Admin Console</h1>
          <p className="text-xs text-ink-secondary mt-1">
            Authenticate to access store operations and ledger.
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
              Admin Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink font-mono"
              placeholder="admin@commerceos.dev"
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
              className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink font-mono"
              placeholder="••••••••••••"
            />
            {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-ink text-white text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xs hover:bg-ink/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Verifying...' : 'Sign In as Admin'}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-ink-secondary font-medium mb-2">
            Preset Demo Account
          </p>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="w-full text-left text-xs p-2.5 bg-surface border border-border rounded-xs hover:border-ink/50 transition-colors"
          >
            <div className="font-medium text-ink">Fill Admin Credentials</div>
            <div className="text-[11px] text-ink-secondary font-mono mt-0.5">admin@commerceos.dev / Admin12345!</div>
          </button>
        </div>
      </div>
    </div>
  );
}
