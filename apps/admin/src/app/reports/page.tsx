'use client';

import React from 'react';
import { FileSpreadsheet, Download, ShoppingBag, Layers, Package } from 'lucide-react';

export default function AdminReportsPage() {
  const reports = [
    {
      title: 'Orders Transaction Ledger',
      description:
        'Comprehensive historical export of every order placed, customer identification, line item values, payment method, and settlement status.',
      type: 'orders',
      icon: ShoppingBag,
    },
    {
      title: 'Inventory & Stock Valuation',
      description:
        'Warehouse stock balances, SKU breakdown, safety thresholds, and replenishment metrics across all product variants.',
      type: 'inventory',
      icon: Layers,
    },
    {
      title: 'Product Catalog Performance',
      description:
        'Complete product catalog export including base pricing, category associations, publication status, and active SKU counts.',
      type: 'products',
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Data Exports</h1>
          <p className="text-xs text-gray-500 mt-1">
            Export relational database records in standard RFC 4180 CSV format.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((rep) => {
          const Icon = rep.icon;
          return (
            <div
              key={rep.type}
              className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{rep.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">{rep.description}</p>
              </div>

              <a
                href={`/api/v1/reports/export-csv?type=${rep.type}`}
                target="_blank"
                rel="noreferrer"
                download
                className="w-full inline-flex items-center justify-center gap-2 bg-[#5E5CE6] hover:bg-[#5250D6] text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
