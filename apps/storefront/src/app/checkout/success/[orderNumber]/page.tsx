'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, Truck, Calendar, CreditCard, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@commerceos/ui';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="border border-border p-8 md:p-12 bg-white text-center">
        <CheckCircle2 className="w-12 h-12 text-ink mx-auto mb-4 stroke-[1.5]" />
        <span className="text-[11px] uppercase tracking-widest text-ink-secondary">Order Confirmed</span>
        <h1 className="text-3xl font-light text-ink tracking-tight mt-1 mb-2">Thank you for your order</h1>
        <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed">
          Your order has been recorded into our atomic transactional ledger. Inventory has been reserved and stock movements logged.
        </p>

        <div className="mt-8 p-4 bg-surface border border-border rounded-xs inline-flex items-center gap-6 text-xs">
          <div>
            <span className="text-ink-tertiary block text-[10px] uppercase tracking-wider">Order Reference</span>
            <span className="font-mono font-medium text-ink mt-0.5 block">{orderNumber}</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div>
            <span className="text-ink-tertiary block text-[10px] uppercase tracking-wider">Date</span>
            <span className="font-mono text-ink mt-0.5 block">{formatDate(new Date())}</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div>
            <span className="text-ink-tertiary block text-[10px] uppercase tracking-wider">Payment Status</span>
            <span className="text-amber-800 font-medium mt-0.5 block">PENDING (Demo)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-left text-xs border-t border-border pt-8">
          <div className="p-4 bg-surface border border-border">
            <div className="flex items-center gap-2 mb-2 font-medium text-ink">
              <Truck className="w-4 h-4 text-ink" />
              <span>Dispatch Information</span>
            </div>
            <p className="text-ink-secondary leading-relaxed text-[11px]">
              Orders are packaged in recyclable archival cartons and dispatched from our logistics terminal within 24 hours.
            </p>
          </div>

          <div className="p-4 bg-surface border border-border">
            <div className="flex items-center gap-2 mb-2 font-medium text-ink">
              <CreditCard className="w-4 h-4 text-ink" />
              <span>Demo Settlement Action</span>
            </div>
            <p className="text-ink-secondary leading-relaxed text-[11px]">
              Payment status is intentionally set to PENDING. An administrator can mark this order as PAID or CANCELLED in the management console.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 bg-ink text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded-xs hover:bg-ink/90 transition-all shadow-xs"
          >
            <span>View Order in Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white border border-border text-ink text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded-xs hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
