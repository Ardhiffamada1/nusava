'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { useCartStore } from '../stores/cart-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const checkAuth = useAuthStore((s) => s.checkAuth);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    checkAuth();
    fetchCart();
  }, [checkAuth, fetchCart]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
