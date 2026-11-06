'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Globe,
  Sparkles,
  Crown,
  X,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  ArrowRight,
  Lightbulb,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatCurrency, formatDate } from '@commerceos/ui';
import { useAdminLanguageStore, adminTranslations } from '../stores/language-store';

export default function WiNkDashboardOverview() {
  const { language } = useAdminLanguageStore();
  const t = adminTranslations[language].dashboard;

  const [activeTimeframe, setActiveTimeframe] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Week');
  const [showBanner, setShowBanner] = useState(true);

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => apiRequest<any>('/analytics/overview'),
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => apiRequest<{ meta: { total: number } }>('/products?limit=1'),
  });

  // Calculate dynamic metrics or fallback to sleek design mockup values
  const totalRevenue = overview?.totalRevenue ?? 14020110;
  const totalOrders = overview?.totalOrders ?? 128;
  const totalProducts = productsData?.meta?.total ?? 31;
  const lowStockCount = overview?.lowStockCount ?? 0;

  // Chart coordinate calculation for the signature WiNk vertical drop-pin curve
  const points = [
    { month: 'Jan', val: 290 },
    { month: 'Feb', val: 320 },
    { month: 'Mar', val: 370 },
    { month: 'Apr', val: 310 },
    { month: 'May', val: 330 },
    { month: 'Jun', val: 320 },
    { month: 'Jul', val: 340 },
    { month: 'Aug', val: 330 },
    { month: 'Sep', val: 387 },
    { month: 'Oct', val: 340 },
    { month: 'Nov', val: 360 },
    { month: 'Dec', val: 380 },
  ];

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 35;
  const paddingY = 25;
  const maxVal = 420;
  const minVal = 0;

  const getX = (index: number) =>
    paddingX + (index * (svgWidth - paddingX * 2)) / (points.length - 1);
  const getY = (val: number) =>
    svgHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (svgHeight - paddingY * 2);

  // Generate smooth SVG curve path
  const pathD = points.reduce((acc, curr, idx) => {
    const x = getX(idx);
    const y = getY(curr.val);
    if (idx === 0) return `M ${x} ${y}`;
    const prevX = getX(idx - 1);
    const prevY = getY(points[idx - 1].val);
    const midX = (prevX + x) / 2;
    return `${acc} C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
  }, '');

  // Tooltip point index (Sep - index 8)
  const highlightIdx = 8;
  const highlightPoint = points[highlightIdx];
  const highlightX = getX(highlightIdx);
  const highlightY = getY(highlightPoint.val);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar: Greeting & Open Site Pill */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t.greeting}</h1>
        </div>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-black text-white hover:bg-gray-800 text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-2xs"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t.openSite}</span>
        </a>
      </div>

      {/* Notice Banner: Upgrade Plan */}
      {showBanner && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#EAEAF0]/60 border border-[#DCDCE2] rounded-2xl text-xs text-gray-800">
          <div className="flex items-center gap-2.5">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-gray-800">{t.upgradeBanner}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-1 font-bold text-gray-900 hover:underline"
            >
              <span>{t.selectPlan}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column (68%) & Right Column (32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Overview Performance Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-gray-900">{t.overviewTitle}</h2>

              {/* Timeframe pill tabs */}
              <div className="inline-flex p-1 bg-[#F4F4F6] rounded-xl text-xs">
                {(['Day', 'Week', 'Month', 'Year'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTimeframe(tab)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      activeTimeframe === tab
                        ? 'bg-white text-gray-900 shadow-2xs font-bold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {t.timeframes[tab]}
                  </button>
                ))}
              </div>
            </div>

            {/* 4-Metric Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Metric 1 */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">{t.metrics.views}</span>
                <span className="text-2xl font-bold text-gray-900 block tracking-tight">142,580</span>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {t.metrics.subtitle7Days}
                </span>
              </div>

              {/* Metric 2 */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">{t.metrics.visits}</span>
                <span className="text-2xl font-bold text-gray-900 block tracking-tight">98,420</span>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {t.metrics.subtitle7Days}
                </span>
              </div>

              {/* Metric 3 */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">{t.metrics.orders}</span>
                <span className="text-2xl font-bold text-gray-900 block tracking-tight">
                  {totalOrders}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {t.metrics.subtitle7Days}
                </span>
              </div>

              {/* Metric 4 */}
              <div>
                <span className="text-xs text-gray-500 block mb-1">{t.metrics.conversion}</span>
                <span className="text-2xl font-bold text-gray-900 block tracking-tight">3.42%</span>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {t.metrics.subtitle7Days}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Revenue Card with Signature WiNk Area/Drop-pin Line Chart */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">{t.revenueTitle}</h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <span>2026</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Revenue Headline */}
            <div className="mb-6">
              <span className="text-xs text-gray-500 block mb-0.5">{t.revenueSubtitle}</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-0.5 block">
                <span className="text-gray-700 font-semibold">+$420.00</span> {t.monthGain}
              </span>
            </div>

            {/* SVG Chart Container */}
            <div className="relative w-full overflow-hidden">
              {/* Highlight Tooltip Pill */}
              <div
                className="absolute z-10 bg-white border border-[#E5E7EB] rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 -translate-x-1/2 -translate-y-full pointer-events-none"
                style={{
                  left: `${(highlightX / svgWidth) * 100}%`,
                  top: `${(highlightY / svgHeight) * 100 - 8}%`,
                }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">24 Sep 2026</span>
                  <span className="text-xs font-bold text-gray-900">$387.54</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +2.4%
                </span>
              </div>

              {/* Main SVG with vertical drop lines */}
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-56 select-none"
                preserveAspectRatio="none"
              >
                {/* Horizontal guide lines */}
                {[0, 100, 200, 300, 400].map((val) => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <text
                        x="5"
                        y={y + 3}
                        className="text-[10px] fill-gray-300 font-sans"
                        textAnchor="start"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical drop pin lines under the curve (signature WiNk design) */}
                {Array.from({ length: 65 }).map((_, i) => {
                  const x = paddingX + (i * (svgWidth - paddingX * 2)) / 64;
                  const pct = i / 64;
                  const idxFloat = pct * (points.length - 1);
                  const lowerIdx = Math.floor(idxFloat);
                  const upperIdx = Math.min(points.length - 1, Math.ceil(idxFloat));
                  const stepT = idxFloat - lowerIdx;
                  const val =
                    points[lowerIdx].val * (1 - stepT) + points[upperIdx].val * stepT;
                  const y = getY(val);
                  const isHighlighted = Math.abs(x - highlightX) < 3;

                  return (
                    <line
                      key={i}
                      x1={x}
                      y1={y}
                      x2={x}
                      y2={svgHeight - paddingY}
                      stroke={isHighlighted ? '#111827' : '#E5E7EB'}
                      strokeWidth={isHighlighted ? '1.5' : '1'}
                    />
                  );
                })}

                {/* Main smooth curve line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#111827"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Highlight Point Node */}
                <circle
                  cx={highlightX}
                  cy={highlightY}
                  r="4"
                  fill="#111827"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </svg>

              {/* X-axis months */}
              <div className="flex justify-between items-center px-4 pt-2 text-[10px] text-gray-400 font-medium border-t border-[#F0F0F2]">
                {points.map((p) => (
                  <span key={p.month}>{p.month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (32%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Shop Advisor Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">{t.shopAdvisor}</h2>
              <Link
                href="/reports"
                className="text-xs text-gray-500 hover:text-black font-medium flex items-center gap-1 transition-colors"
              >
                <span>Lihat</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Advice box */}
            <div className="p-4 bg-[#F9F9FB] rounded-xl border border-[#F0F0F4] space-y-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-amber-500">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 leading-snug">{t.advisorTitle}</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{t.advisorDesc}</p>
              </div>
              <button
                type="button"
                className="w-full text-center py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-xs font-semibold text-gray-800 rounded-lg transition-colors shadow-2xs"
              >
                {t.learnMore}
              </button>
            </div>
          </div>

          {/* 2. Products Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">{t.productsTitle}</h2>
              <Link
                href="/products"
                className="text-xs text-gray-500 hover:text-black font-medium flex items-center gap-1 transition-colors"
              >
                <span>Lihat</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3 divide-y divide-gray-100">
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-600">{t.activeListings}</span>
                <span className="text-xs font-bold text-gray-900 font-mono">{totalProducts}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-gray-600">{t.expired}</span>
                <span className="text-xs font-bold text-gray-900 font-mono">2</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-gray-600">{t.soldOut}</span>
                <span className="text-xs font-bold text-gray-900 font-mono">{lowStockCount}</span>
              </div>
            </div>
          </div>

          {/* 3. Recent Activities Feed */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">{t.recentActivities}</h2>
              <Link
                href="/audit"
                className="text-xs text-gray-500 hover:text-black font-medium flex items-center gap-1 transition-colors"
              >
                <span>Lihat</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                {
                  name: 'Dewi Lestari',
                  action: t.actions.favorited,
                  time: '6 menit lalu',
                  initials: 'DL',
                  color: 'bg-emerald-100 text-emerald-800',
                },
                {
                  name: 'Budi Santoso',
                  action: t.actions.purchased,
                  time: '18 menit lalu',
                  initials: 'BS',
                  color: 'bg-indigo-100 text-indigo-800',
                },
                {
                  name: 'Siti Rahma',
                  action: t.actions.favorited,
                  time: '20 menit lalu',
                  initials: 'SR',
                  color: 'bg-amber-100 text-amber-800',
                },
                {
                  name: 'Ahmad Fauzi',
                  action: t.actions.purchased,
                  time: '32 menit lalu',
                  initials: 'AF',
                  color: 'bg-rose-100 text-rose-800',
                },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${act.color}`}
                  >
                    {act.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 leading-tight">
                      <span className="font-semibold">{act.name}</span>{' '}
                      <span className="text-gray-500">{act.action}</span>
                    </p>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Dark Chat Button in bottom right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all hover:scale-105"
          title="Bantuan Pengelola"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
