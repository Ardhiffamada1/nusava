'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Archive,
  X,
  AlertCircle,
  Check,
  MoreVertical,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { formatCurrency } from '@commerceos/ui';
import { CreateProductDto, CreateProductDtoSchema, ProductStatus } from '@commerceos/contracts';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest<any[]>('/categories'),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', search, selectedCategory],
    queryFn: () => {
      const p = new URLSearchParams();
      if (search) p.set('search', search);
      if (selectedCategory) p.set('categoryId', selectedCategory);
      p.set('limit', '50');
      return apiRequest<{ items: any[]; meta: any }>(`/products?${p.toString()}`);
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductDto>({
    resolver: zodResolver(CreateProductDtoSchema),
    defaultValues: {
      status: ProductStatus.ACTIVE,
      variants: [
        {
          sku: '',
          title: 'Default Variant',
          initialStock: 25,
          isActive: true,
          attributes: {},
        },
      ],
      images: [
        {
          url: '',
          altText: '',
          displayOrder: 0,
          isThumbnail: true,
        },
      ],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductDto) =>
      apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to create product');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/products/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to archive product');
    },
  });

  const onSubmit = (data: CreateProductDto) => {
    setErrorMessage(null);
    const payload = {
      ...data,
      slug:
        data.slug ||
        data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5E5CE6] hover:bg-[#5250D6] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 shadow-2xs transition-all"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-56 text-xs px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 shadow-2xs"
        >
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Spodut Floating White Card Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F0F0F2] text-xs font-semibold text-gray-500">
                <th className="py-4 pl-6 pr-3">Product Name</th>
                <th className="py-4 px-3">Category</th>
                <th className="py-4 px-3">Base Price</th>
                <th className="py-4 px-3">Variants & SKUs</th>
                <th className="py-4 px-3">Stock on Hand</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 pr-6 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F6] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading catalog records...
                  </td>
                </tr>
              ) : productsData?.items?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    No products found matching query.
                  </td>
                </tr>
              ) : (
                productsData?.items?.map((product) => {
                  const totalStock = product.variants?.reduce(
                    (acc: number, v: any) => acc + (v.stock?.quantity ?? 0),
                    0,
                  );
                  const thumbnail =
                    product.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=150&q=80';

                  return (
                    <tr key={product.id} className="hover:bg-[#FBFBFD] transition-colors">
                      {/* Product Thumbnail + Title */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative border border-gray-200">
                            <Image src={thumbnail} alt={product.title} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block">{product.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-gray-600">
                        {product.category?.name || 'Uncategorized'}
                      </td>

                      {/* Base Price */}
                      <td className="py-3.5 px-3 font-semibold text-gray-900">
                        {formatCurrency(product.basePrice)}
                      </td>

                      {/* Variants & SKUs */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {product.variants?.map((v: any) => (
                            <span
                              key={v.id}
                              className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                            >
                              {v.sku}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Stock on Hand */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-semibold ${
                            totalStock > 5 ? 'text-gray-900' : 'text-amber-600'
                          }`}
                        >
                          {totalStock} units
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            product.status === 'ACTIVE'
                              ? 'bg-[#E8F8F5] text-[#27AE60]'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {product.status === 'ACTIVE' ? 'Active' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-6 pl-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Archive product "${product.title}"?`)) {
                              archiveMutation.mutate(product.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Archive product"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E7EB] max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-[#F0F0F2] pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900">Add New Product</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Product Title
                </label>
                <input
                  {...register('title')}
                  placeholder="e.g. Minimalist Ceramic Cup"
                  className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                />
                {errors.title && (
                  <span className="text-[10px] text-rose-500 mt-0.5 block">
                    {errors.title.message}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Product Slug
                </label>
                <input
                  {...register('slug')}
                  placeholder="e.g. minimalist-ceramic-cup"
                  className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Product craftsmanship details..."
                  className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Category
                  </label>
                  <select
                    {...register('categoryId')}
                    className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('basePrice', { valueAsNumber: true })}
                    className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Primary Image */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Image URL
                </label>
                <input
                  {...register('images.0.url')}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Primary Variant SKU */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <span className="text-xs font-semibold text-gray-800 block">Default Variant</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">SKU</label>
                    <input
                      {...register('variants.0.sku')}
                      placeholder="SKU-001"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Initial Stock</label>
                    <input
                      type="number"
                      {...register('variants.0.initialStock', { valueAsNumber: true })}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Price Override ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('variants.0.priceOverride', { valueAsNumber: true })}
                      placeholder="Optional"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F0F0F2]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E7EB] text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-[#5E5CE6] hover:bg-[#5250D6] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
