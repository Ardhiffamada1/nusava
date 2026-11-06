'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Filter,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  DollarSign,
  AlertCircle,
  Truck,
  CheckCircle2,
  Ban,
  Search,
  ExternalLink,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@commerceos/ui';
import { OrderStatus, PaymentStatus } from '@commerceos/contracts';

export default function SpodutOrderListPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, currentPage],
    queryFn: () => {
      const p = new URLSearchParams();
      if (statusFilter) p.set('status', statusFilter);
      p.set('page', currentPage.toString());
      p.set('limit', '10');
      return apiRequest<{ items: any[]; meta: any }>(`/orders?${p.toString()}`);
    },
  });

  const { data: orderDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['order-detail', selectedOrderId],
    queryFn: () => apiRequest<any>(`/orders/${selectedOrderId}`),
    enabled: !!selectedOrderId,
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: (err: any) => alert(err.message || 'Status transition failed'),
  });

  // Payment mutation (Demo toggle)
  const paymentMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: PaymentStatus }) =>
      apiRequest(`/orders/${orderId}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: (err: any) => alert(err.message || 'Payment update failed'),
  });

  // Cancel & restock mutation
  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      apiRequest(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    },
    onError: (err: any) => alert(err.message || 'Cancellation failed'),
  });

  // Helper for Spodut soft pastel status pills
  const renderStatusPill = (status: string, paymentStatus?: string) => {
    if (status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FDEDEC] text-[#EB5757]">
          Out of Stock
        </span>
      );
    }
    if (paymentStatus === 'PAID' || status === 'DELIVERED' || status === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8F8F5] text-[#27AE60]">
          Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EBF5FB] text-[#2D9CDB]">
        Pending
      </span>
    );
  };

  const totalPages = ordersData?.meta?.totalPages || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header of Spodut Screen */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order List</h1>

        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 rounded-xl text-xs font-medium text-gray-700 shadow-2xs transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>Filter</span>
            </button>

            {filterMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-2 z-30 space-y-1">
                {['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setFilterMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                        statusFilter === st
                          ? 'bg-[#5E5CE6] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {st || 'All Orders'}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Add New Order Button */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5E5CE6] hover:bg-[#5250D6] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Order</span>
          </a>
        </div>
      </div>

      {/* Spodut Floating White Card Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F0F0F2] text-xs font-semibold text-gray-500">
                <th className="py-4 pl-6 pr-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded text-[#5E5CE6] focus:ring-[#5E5CE6] border-gray-300 w-4 h-4"
                  />
                </th>
                <th className="py-4 px-3 cursor-pointer hover:text-gray-900 select-none">
                  Order ID <span className="text-[10px] text-gray-400">⌄</span>
                </th>
                <th className="py-4 px-3 cursor-pointer hover:text-gray-900 select-none">
                  Product Name <span className="text-[10px] text-gray-400">⌄</span>
                </th>
                <th className="py-4 px-3 cursor-pointer hover:text-gray-900 select-none">
                  Date <span className="text-[10px] text-gray-400">⌄</span>
                </th>
                <th className="py-4 px-3 cursor-pointer hover:text-gray-900 select-none">
                  Customers <span className="text-[10px] text-gray-400">⌄</span>
                </th>
                <th className="py-4 px-3 cursor-pointer hover:text-gray-900 select-none">
                  Price <span className="text-[10px] text-gray-400">⌄</span>
                </th>
                <th className="py-4 px-3 cursor-pointer hover:text-gray-900 select-none">
                  Vendor <span className="text-[10px] text-gray-400">⌄</span>
                </th>
                <th className="py-4 px-3 cursor-pointer hover:text-gray-900 select-none">
                  Status <span className="text-[10px] text-gray-400">⌄</span>
                </th>
                <th className="py-4 pr-6 pl-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F4F4F6] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : ordersData?.items?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                ordersData?.items?.map((order) => {
                  const firstItem = order.items?.[0];
                  const productName = firstItem?.productName || 'Order Items';
                  const customerName = `${order.user?.firstName || 'Customer'} ${
                    order.user?.lastName || ''
                  }`;
                  const vendorName =
                    order.payment?.method === 'CASH_ON_DELIVERY' ? 'Logistics Express' : 'Direct Bank';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FBFBFD] transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-6 pr-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded text-[#5E5CE6] focus:ring-[#5E5CE6] border-gray-300 w-4 h-4"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="py-3.5 px-3 font-medium text-gray-900">
                        #{order.orderNumber.replace('ORD-', '')}
                      </td>

                      {/* Product Name with Thumbnail */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative border border-gray-200">
                            <Image
                              src={
                                firstItem?.productVariant?.product?.images?.[0]?.url ||
                                'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=150&q=80'
                              }
                              alt={productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 group-hover:text-[#5E5CE6] transition-colors">
                              {productName}
                            </span>
                            {order.items?.length > 1 && (
                              <span className="text-[10px] text-gray-400">
                                +{order.items.length - 1} more item
                                {order.items.length > 2 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-gray-500 whitespace-nowrap">
                        {formatDate(order.createdAt)} 12:00am
                      </td>

                      {/* Customers */}
                      <td className="py-3.5 px-3 font-medium text-gray-900">{customerName}</td>

                      {/* Price */}
                      <td className="py-3.5 px-3 font-semibold text-gray-900">
                        {formatCurrency(order.grandTotal)}
                      </td>

                      {/* Vendor / Payment Method */}
                      <td className="py-3.5 px-3 text-gray-500">{vendorName}</td>

                      {/* Status pill badge */}
                      <td className="py-3.5 px-3">
                        {renderStatusPill(order.status, order.payment?.status)}
                      </td>

                      {/* Action Menu dots */}
                      <td className="py-3.5 pr-6 pl-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Spodut Bottom Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0F0F2] text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#5E5CE6] text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-1 text-gray-400 font-mono">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === totalPages
                    ? 'bg-[#5E5CE6] text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Order Detail Modal with Real Business Actions */}
      {selectedOrderId && orderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E7EB] max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-start border-b border-[#F0F0F2] pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400">
                  Order Details
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  #{orderDetail.orderNumber.replace('ORD-', '')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Created at {formatDateTime(orderDetail.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Control Ribbon */}
            <div className="p-4 bg-[#F9F9FB] border border-[#F0F0F4] rounded-2xl mb-6 space-y-4">
              {/* Transition Fulfillment */}
              <div>
                <span className="text-xs font-semibold text-gray-800 block mb-2">
                  Update Fulfillment Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() =>
                          statusMutation.mutate({ orderId: orderDetail.id, status: st })
                        }
                        disabled={orderDetail.status === st || orderDetail.status === 'CANCELLED'}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                          orderDetail.status === st
                            ? 'bg-[#5E5CE6] text-white'
                            : 'bg-white border border-[#E5E7EB] text-gray-700 hover:bg-gray-50 disabled:opacity-40'
                        }`}
                      >
                        {st}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Demo Payment Switch */}
              <div className="pt-3 border-t border-[#EAEAF0] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-800 block">
                    Payment Status (Demo Action)
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Current:{' '}
                    <strong className="text-gray-800">
                      {orderDetail.payment?.status || 'PENDING'}
                    </strong>{' '}
                    via {orderDetail.payment?.method === 'CASH_ON_DELIVERY' ? 'COD' : 'Bank Transfer'}
                  </span>
                </div>

                <div className="flex gap-2">
                  {orderDetail.payment?.status !== 'PAID' && (
                    <button
                      onClick={() =>
                        paymentMutation.mutate({
                          orderId: orderDetail.id,
                          status: 'PAID' as PaymentStatus,
                        })
                      }
                      className="px-3 py-1.5 bg-[#E8F8F5] text-[#27AE60] hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}
                  {orderDetail.payment?.status === 'PAID' && (
                    <button
                      onClick={() =>
                        paymentMutation.mutate({
                          orderId: orderDetail.id,
                          status: 'REFUNDED' as PaymentStatus,
                        })
                      }
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Simulate Refund
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-semibold text-gray-800 block">
                Purchased Line Items
              </span>
              <div className="divide-y divide-[#F0F0F2] border border-[#E5E7EB] rounded-2xl overflow-hidden">
                {orderDetail.items?.map((item: any) => (
                  <div key={item.id} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        {item.productName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        SKU: {item.sku} • Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-900">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5 text-xs mb-6">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(orderDetail.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="font-mono">{formatCurrency(orderDetail.shippingAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-sm">
                <span>Grand Total</span>
                <span className="font-mono">{formatCurrency(orderDetail.grandTotal)}</span>
              </div>
            </div>

            {/* Cancel & Atomic Restock Button */}
            {orderDetail.status !== 'CANCELLED' && (
              <div className="pt-3 border-t border-[#F0F0F2] flex justify-end">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        'Cancel this order and atomically restore stock quantities back into the ledger?',
                      )
                    ) {
                      cancelMutation.mutate({
                        orderId: orderDetail.id,
                        reason: 'Cancelled by administrator in demo console',
                      });
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Order & Restock Ledger</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
