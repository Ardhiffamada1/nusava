'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Layers,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  History,
  X,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { formatDateTime } from '@commerceos/ui';
import {
  StockAdjustmentDto,
  StockAdjustmentDtoSchema,
  StockMovementReason,
} from '@commerceos/contracts';

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'levels' | 'movements'>('levels');
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [selectedVariantForAdjust, setSelectedVariantForAdjust] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Current Inventory Query
  const { data: inventoryData, isLoading: isInventoryLoading } = useQuery({
    queryKey: ['admin-inventory', search, lowStockFilter],
    queryFn: () => {
      const p = new URLSearchParams();
      if (search) p.set('search', search);
      if (lowStockFilter) p.set('lowStockOnly', 'true');
      p.set('limit', '50');
      return apiRequest<{ items: any[]; meta: any }>(`/inventory?${p.toString()}`);
    },
  });

  // 2. Stock Movements Query
  const { data: movementsData, isLoading: isMovementsLoading } = useQuery({
    queryKey: ['admin-movements', activeTab],
    queryFn: () => apiRequest<{ items: any[]; meta: any }>('/inventory/movements?limit=50'),
    enabled: activeTab === 'movements',
  });

  // Adjust Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockAdjustmentDto>({
    resolver: zodResolver(StockAdjustmentDtoSchema),
    defaultValues: {
      reason: StockMovementReason.MANUAL_ADJUSTMENT,
    },
  });

  const adjustMutation = useMutation({
    mutationFn: (data: StockAdjustmentDto) =>
      apiRequest('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-movements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      setSelectedVariantForAdjust(null);
      reset();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to adjust stock');
    },
  });

  const onSubmitAdjust = (data: StockAdjustmentDto) => {
    setErrorMessage(null);
    adjustMutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Inventory & Stock Ledger
        </h1>

        {/* View Switcher Tabs */}
        <div className="inline-flex p-1 bg-white border border-[#E5E7EB] rounded-xl text-xs shadow-2xs">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'levels'
                ? 'bg-[#5E5CE6] text-white font-semibold'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'movements'
                ? 'bg-[#5E5CE6] text-white font-semibold'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Audit Ledger
          </button>
        </div>
      </div>

      {activeTab === 'levels' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by SKU, product name or variant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 shadow-2xs transition-all"
              />
            </div>

            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors shadow-2xs ${
                lowStockFilter
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white border-[#E5E7EB] text-gray-700 hover:bg-gray-50'
              }`}
            >
              Low Stock Only
            </button>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#F0F0F2] font-semibold text-gray-500">
                    <th className="py-4 pl-6 pr-3">Product & Variant</th>
                    <th className="py-4 px-3">SKU</th>
                    <th className="py-4 px-3">On Hand</th>
                    <th className="py-4 px-3">Allocated (Reserved)</th>
                    <th className="py-4 px-3">Available</th>
                    <th className="py-4 px-3">Threshold</th>
                    <th className="py-4 pr-6 pl-3 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F4F6]">
                  {isInventoryLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        Loading inventory records...
                      </td>
                    </tr>
                  ) : inventoryData?.items?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-gray-400">
                        No inventory records found.
                      </td>
                    </tr>
                  ) : (
                    inventoryData?.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FBFBFD] transition-colors">
                        <td className="py-3.5 pl-6 pr-3">
                          <span className="font-semibold text-gray-900 block">
                            {item.productVariant?.product?.title}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {item.productVariant?.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-medium text-gray-700">
                          {item.productVariant?.sku}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-gray-900">
                          {item.quantityOnHand}
                        </td>
                        <td className="py-3.5 px-3 text-gray-500">{item.allocatedQuantity}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`font-semibold ${
                              item.availableQuantity <= item.lowStockThreshold
                                ? 'text-amber-600'
                                : 'text-[#27AE60]'
                            }`}
                          >
                            {item.availableQuantity}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-gray-400 font-mono">
                          {item.lowStockThreshold}
                        </td>
                        <td className="py-3.5 pr-6 pl-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedVariantForAdjust(item);
                              reset({
                                variantId: item.variantId,
                                quantityDelta: 10,
                                reason: StockMovementReason.MANUAL_ADJUSTMENT,
                                notes: 'Manual replenishment',
                              });
                            }}
                            className="text-xs px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F0F0F2] font-semibold text-gray-500">
                  <th className="py-4 pl-6 pr-3">Timestamp</th>
                  <th className="py-4 px-3">SKU & Item</th>
                  <th className="py-4 px-3">Reason</th>
                  <th className="py-4 px-3 text-right">Delta</th>
                  <th className="py-4 px-3 text-right">Before</th>
                  <th className="py-4 px-3 text-right">After</th>
                  <th className="py-4 pr-6 pl-3">Reference / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F6]">
                {isMovementsLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Loading stock audit ledger...
                    </td>
                  </tr>
                ) : movementsData?.items?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      No stock movement entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  movementsData?.items?.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FBFBFD] transition-colors">
                      <td className="py-3.5 pl-6 pr-3 text-gray-400 font-mono text-[11px]">
                        {formatDateTime(m.createdAt)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-gray-900 block">
                          {m.productVariant?.product?.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {m.productVariant?.sku}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                          {m.reason}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-3 text-right font-mono font-semibold ${
                          m.quantityChange > 0 ? 'text-[#27AE60]' : 'text-rose-600'
                        }`}
                      >
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-500">
                        {m.quantityBefore}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-gray-900">
                        {m.quantityAfter}
                      </td>
                      <td className="py-3.5 pr-6 pl-3 text-gray-500 text-[11px]">
                        {m.note || m.reference || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedVariantForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E7EB] max-w-md w-full rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-[#F0F0F2] pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Adjust Inventory</h3>
              <button
                onClick={() => setSelectedVariantForAdjust(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmitAdjust)} className="space-y-4">
              <input type="hidden" {...register('variantId')} />

              <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-gray-900 block">
                  {selectedVariantForAdjust.productVariant?.product?.title}
                </span>
                <span className="text-gray-500 block font-mono">
                  SKU: {selectedVariantForAdjust.productVariant?.sku}
                </span>
                <span className="text-gray-700 font-semibold block pt-1">
                  Current on hand: {selectedVariantForAdjust.quantityOnHand} units
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Quantity Delta (Positive to add, Negative to deduct)
                </label>
                <input
                  type="number"
                  {...register('quantityDelta', { valueAsNumber: true })}
                  className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-black font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Reason</label>
                <select
                  {...register('reason')}
                  className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value={StockMovementReason.MANUAL_ADJUSTMENT}>Manual Adjustment</option>
                  <option value={StockMovementReason.RESTOCK}>Restock / Replenishment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Reason Note</label>
                <input
                  {...register('notes')}
                  placeholder="Audit reason / shipment ref..."
                  className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F0F0F2]">
                <button
                  type="button"
                  onClick={() => setSelectedVariantForAdjust(null)}
                  className="px-4 py-2 border border-[#E5E7EB] text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustMutation.isPending}
                  className="px-5 py-2 bg-[#5E5CE6] hover:bg-[#5250D6] text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50"
                >
                  {adjustMutation.isPending ? 'Updating...' : 'Post Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
