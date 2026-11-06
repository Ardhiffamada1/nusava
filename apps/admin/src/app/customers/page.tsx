'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, ShoppingBag, ExternalLink, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { formatCurrency, formatDate } from '@commerceos/ui';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: () => {
      const p = new URLSearchParams();
      if (search) p.set('search', search);
      p.set('limit', '50');
      return apiRequest<{ items: any[]; meta: any }>(`/customers?${p.toString()}`);
    },
  });

  const { data: customerDetail } = useQuery({
    queryKey: ['customer-detail', selectedCustomerId],
    queryFn: () => apiRequest<any>(`/customers/${selectedCustomerId}`),
    enabled: !!selectedCustomerId,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Directory</h1>
        <span className="text-xs font-semibold text-gray-500 bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-xl shadow-2xs">
          {customersData?.meta?.total ?? 0} Clients
        </span>
      </div>

      {/* Search Toolbar */}
      <div className="relative w-full sm:w-96">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 shadow-2xs transition-all"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F0F0F2] font-semibold text-gray-500">
                <th className="py-4 pl-6 pr-3">Customer Name</th>
                <th className="py-4 px-3">Email Address</th>
                <th className="py-4 px-3">Member Since</th>
                <th className="py-4 px-3 text-right">Orders Placed</th>
                <th className="py-4 px-3 text-right">Lifetime Spend</th>
                <th className="py-4 pr-6 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F6]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading customers...
                  </td>
                </tr>
              ) : customersData?.items?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    No customers found matching query.
                  </td>
                </tr>
              ) : (
                customersData?.items?.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#FBFBFD] transition-colors">
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-700">
                          {cust.firstName?.[0] || 'C'}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {cust.firstName} {cust.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-gray-500">{cust.email}</td>
                    <td className="py-3.5 px-3 text-gray-500">{formatDate(cust.createdAt)}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-gray-900">
                      {cust.ordersCount ?? 0}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-gray-900">
                      {formatCurrency(cust.totalSpent ?? 0)}
                    </td>
                    <td className="py-3.5 pr-6 pl-3 text-right">
                      <button
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className="text-xs px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomerId && customerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E7EB] max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-start border-b border-[#F0F0F2] pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400">
                  Customer Record
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                  {customerDetail.firstName} {customerDetail.lastName}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{customerDetail.email}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-semibold text-gray-800 block">Saved Addresses</span>
              {customerDetail.addresses?.length === 0 ? (
                <p className="text-xs text-gray-400">No addresses on file.</p>
              ) : (
                <div className="space-y-2">
                  {customerDetail.addresses?.map((addr: any) => (
                    <div
                      key={addr.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-0.5"
                    >
                      <span className="font-semibold text-gray-900 block">{addr.street}</span>
                      <span className="text-gray-500 block">
                        {addr.city}, {addr.province} {addr.postalCode} • {addr.country}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-800 block">Order History</span>
              {customerDetail.orders?.length === 0 ? (
                <p className="text-xs text-gray-400">No orders placed yet.</p>
              ) : (
                <div className="divide-y divide-gray-100 border border-[#E5E7EB] rounded-2xl overflow-hidden">
                  {customerDetail.orders?.map((ord: any) => (
                    <div key={ord.id} className="p-3 bg-white flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-gray-900 block">
                          #{ord.orderNumber.replace('ORD-', '')}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {formatDate(ord.createdAt)} • {ord.status}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-gray-900">
                        {formatCurrency(ord.grandTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
