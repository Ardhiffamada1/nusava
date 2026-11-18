'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PointHistoryItem {
  id: string;
  title: string;
  amount: number; // positive = earned, negative = redeemed
  date: string;
  orderNumber?: string;
}

interface RewardsState {
  points: number;
  tier: 'Member Silver' | 'Member Gold' | 'Member Platinum';
  history: PointHistoryItem[];
  calculateEarnedPoints: (subtotal: number) => number;
  redeemPoints: (amount: number, orderNumber?: string) => void;
  addEarnedPoints: (amount: number, title: string, orderNumber?: string) => void;
}

export const POINT_EARN_RATE = 0.02; // 2% cashback in points (1 Poin = Rp 1)

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set) => ({
      points: 25000,
      tier: 'Member Gold',
      history: [
        {
          id: 'pts-welcome',
          title: 'Bonus Member NUSAVA',
          amount: 15000,
          date: '10 Nov 2026',
        },
        {
          id: 'pts-order-1',
          title: 'Cashback Poin Pesanan #ORD-2026-8821',
          amount: 10000,
          date: '14 Nov 2026',
          orderNumber: 'ORD-2026-8821',
        },
      ],

      calculateEarnedPoints: (subtotal: number) => {
        if (!subtotal || subtotal <= 0) return 0;
        return Math.floor(subtotal * POINT_EARN_RATE);
      },

      redeemPoints: (amount: number, orderNumber?: string) =>
        set((state) => {
          const validDeduction = Math.min(state.points, Math.max(0, amount));
          if (validDeduction <= 0) return state;

          const newItem: PointHistoryItem = {
            id: `pts-redeem-${Date.now()}`,
            title: orderNumber
              ? `Tukar Poin di Pesanan #${orderNumber}`
              : 'Potongan Belanja dengan NUSAVA Poin',
            amount: -validDeduction,
            date: 'Hari ini',
            orderNumber,
          };

          return {
            points: state.points - validDeduction,
            history: [newItem, ...state.history],
          };
        }),

      addEarnedPoints: (amount: number, title: string, orderNumber?: string) =>
        set((state) => {
          if (amount <= 0) return state;
          const newPoints = state.points + amount;
          const newTier =
            newPoints >= 50000
              ? 'Member Platinum'
              : newPoints >= 20000
                ? 'Member Gold'
                : 'Member Silver';

          const newItem: PointHistoryItem = {
            id: `pts-earn-${Date.now()}`,
            title,
            amount,
            date: 'Hari ini',
            orderNumber,
          };

          return {
            points: newPoints,
            tier: newTier,
            history: [newItem, ...state.history],
          };
        }),
    }),
    {
      name: 'nusava-rewards-storage',
    }
  )
);
