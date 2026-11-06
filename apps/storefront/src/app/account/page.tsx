'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Clock, ShieldCheck, MapPin, AlertCircle, X, ChevronRight, Ban } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { formatCurrency, formatDate, formatDateTime } from '@commerceos/ui';

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading, logout } = useAuthStore();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => apiRequest<{ items: any[]; meta: any }>('/orders?limit=20'),
    enabled: !!user,
  });

  const { data: addresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => apiRequest<any[]>('/users/addresses'),
    enabled: !!user,
  });

  const { data: selectedOrderDetail } = useQuery({
    queryKey: ['order-detail', selectedOrderId],
    queryFn: () => apiRequest<any>(`/orders/${selectedOrderId}`),
    enabled: !!selectedOrderId,
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      return apiRequest(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      setCancelModalOrder(null);
      setCancelReason('');
      alert('Order successfully cancelled and inventory restored to stock ledger.');
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to cancel order');
    },
  });

  if (isAuthLoading) {
    return <div className="max-w-7xl mx-auto px-6 py-20 text-xs">Loading account...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-xl font-light text-ink">Sign in to your account</h1>
        <p className="text-xs text-ink-secondary mt-2 mb-6">
          Access your past orders, real-time shipment status, and saved address book.
        </p>
        <Link
          href="/login?redirect=/account"
          className="inline-block text-xs font-semibold uppercase tracking-wider bg-ink text-white px-6 py-3 rounded-xs hover:bg-ink/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Account Header */}
      <div className="border-b border-border pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-ink-secondary">Customer Portal</span>
          <h1 className="text-2xl md:text-3xl font-light text-ink tracking-tight mt-1">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-xs text-ink-secondary mt-1">{user.email} • Client since {formatDate(user.createdAt)}</p>
        </div>

        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="text-xs uppercase tracking-wider text-ink-secondary hover:text-ink border border-border px-3 py-1.5 rounded-xs transition-colors self-start sm:self-auto"
        >
          Sign out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Orders History */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
              <Package className="w-4 h-4 text-ink" />
              <span>Order History</span>
            </h2>
            <span className="text-xs font-mono text-ink-secondary">{ordersData?.meta?.total ?? 0} Orders</span>
          </div>

          {isOrdersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-surface border border-border animate-pulse" />
              ))}
            </div>
          ) : ordersData?.items?.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border bg-surface p-6">
              <Package className="w-8 h-8 text-ink-tertiary mx-auto mb-2" />
              <p className="text-xs font-medium text-ink">No orders on record yet</p>
              <p className="text-[11px] text-ink-secondary mt-1 mb-4">Explore our catalogue to place your first order.</p>
              <Link
                href="/products"
                className="text-xs font-semibold uppercase tracking-wider border border-border px-4 py-2 hover:bg-white transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border border border-border bg-white">
              {ordersData?.items?.map((order) => {
                const isCancelled = order.status === 'CANCELLED';
                const isDelivered = order.status === 'DELIVERED';
                const canCancel = !isCancelled && !isDelivered;

                return (
                  <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-medium text-ink">{order.orderNumber}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold rounded-xs ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : order.status === 'CANCELLED'
                              ? 'bg-zinc-100 text-zinc-500 line-through border border-border'
                              : order.status === 'SHIPPED'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="text-xs text-ink-secondary mt-1">
                        Placed on {formatDate(order.createdAt)} • {order._count?.items || 1} distinct item(s)
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-ink-secondary">
                        <span>Payment: {order.payment?.method === 'CASH_ON_DELIVERY' ? 'COD' : 'Bank Wire'}</span>
                        <span>•</span>
                        <span className={order.payment?.status === 'PAID' ? 'text-emerald-700 font-medium' : 'text-amber-800'}>
                          {order.payment?.status || 'PENDING'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <span className="font-mono text-sm font-semibold text-ink">
                        {formatCurrency(order.grandTotal)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="text-xs uppercase tracking-wider text-ink border border-border px-3 py-1.5 rounded-xs hover:bg-muted transition-colors"
                        >
                          Details
                        </button>

                        {canCancel && (
                          <button
                            onClick={() => setCancelModalOrder(order)}
                            className="text-xs uppercase tracking-wider text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xs hover:bg-rose-50 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Saved Address Book */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
              <MapPin className="w-4 h-4 text-ink" />
              <span>Address Book</span>
            </h2>
          </div>

          <div className="space-y-3">
            {addresses?.map((addr) => (
              <div key={addr.id} className="p-4 bg-surface border border-border rounded-xs text-xs">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-ink">{addr.fullName}</span>
                  {addr.isDefaultShipping && (
                    <span className="text-[10px] uppercase tracking-wider bg-white border border-border px-1.5 py-0.5 text-ink-secondary">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-ink-secondary mt-1">{addr.streetAddress}</p>
                <p className="text-ink-secondary">{addr.city}, {addr.state} {addr.postalCode}</p>
                <p className="text-ink-tertiary mt-2 text-[11px] font-mono">{addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-white border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xs shadow-2xl p-6">
            <div className="flex justify-between items-start border-b border-border pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-ink-secondary">Order Snapshot</span>
                <h3 className="text-lg font-mono font-medium text-ink mt-0.5">{selectedOrderDetail.orderNumber}</h3>
                <p className="text-xs text-ink-secondary mt-0.5">Ordered at {formatDateTime(selectedOrderDetail.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-1 hover:bg-muted text-ink-secondary hover:text-ink rounded-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item Snapshots */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-3">Line Item Snapshots</h4>
              <div className="border border-border divide-y divide-border text-xs">
                {selectedOrderDetail.items?.map((it: any) => (
                  <div key={it.id} className="p-3 flex justify-between items-center bg-white">
                    <div>
                      <p className="font-medium text-ink">{it.productNameSnapshot}</p>
                      <p className="text-[11px] font-mono text-ink-secondary">SKU: {it.variantSkuSnapshot}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-ink">{formatCurrency(it.lineTotal)}</p>
                      <p className="text-[11px] text-ink-secondary">
                        {it.quantity} × {formatCurrency(it.unitPriceSnapshot)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Specs */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
              <div className="p-3 bg-surface border border-border">
                <span className="text-[10px] uppercase tracking-wider text-ink-tertiary block mb-1">Shipping Destination</span>
                <p className="font-medium text-ink">{selectedOrderDetail.shippingAddress?.fullName}</p>
                <p className="text-ink-secondary mt-0.5">{selectedOrderDetail.shippingAddress?.streetAddress}</p>
                <p className="text-ink-secondary">{selectedOrderDetail.shippingAddress?.city}, {selectedOrderDetail.shippingAddress?.state}</p>
              </div>

              <div className="p-3 bg-surface border border-border">
                <span className="text-[10px] uppercase tracking-wider text-ink-tertiary block mb-1">Payment Method & Status</span>
                <p className="font-medium text-ink">
                  {selectedOrderDetail.payment?.method === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Manual Bank Wire'}
                </p>
                <p className="text-ink-secondary mt-0.5 font-mono">
                  Status: <span className="font-semibold text-ink">{selectedOrderDetail.payment?.status}</span>
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-surface border border-border text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-ink-secondary">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrderDetail.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-secondary">
                <span>Shipping:</span>
                <span>{formatCurrency(selectedOrderDetail.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-ink font-semibold text-sm pt-2 border-t border-border">
                <span>Grand Total:</span>
                <span>{formatCurrency(selectedOrderDetail.grandTotal)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-xs uppercase tracking-wider bg-ink text-white px-5 py-2.5 rounded-xs hover:bg-ink/90 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-white border border-border max-w-md w-full rounded-xs shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-700 mb-3">
              <Ban className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">Confirm Cancellation</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed mb-4">
              Cancelling order <span className="font-mono font-medium text-ink">{cancelModalOrder.orderNumber}</span> will immediately release allocated stock back into available inventory and create an immutable cancellation stock movement ledger record.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1.5">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="e.g. Ordered incorrect size, changed mind"
                className="w-full text-xs p-2.5 border border-border bg-white rounded-xs focus:outline-hidden focus:border-ink"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="text-xs uppercase tracking-wider border border-border px-4 py-2 rounded-xs hover:bg-muted transition-colors text-ink"
              >
                Dismiss
              </button>
              <button
                onClick={() => cancelMutation.mutate({ orderId: cancelModalOrder.id, reason: cancelReason })}
                disabled={cancelMutation.isPending}
                className="text-xs uppercase tracking-wider bg-rose-700 text-white px-4 py-2 rounded-xs hover:bg-rose-800 disabled:opacity-40 transition-colors"
              >
                {cancelMutation.isPending ? 'Restocking...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
