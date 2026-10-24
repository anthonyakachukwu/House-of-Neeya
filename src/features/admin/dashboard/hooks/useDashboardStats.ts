"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchDailyOrders,
  fetchLowStockCount,
  fetchNeedsAttention,
  PAYMENT_STATUS,
  type DailyOrderRow,
  type DailyOrders,
} from "@/features/admin/dashboard/api/dashboard.services";

export const REFRESH = { staleTime: 30_000, refetchInterval: 60_000 } as const;

export const dashboardKeys = {
  dailyOrders: ["admin", "dashboard", "daily-orders"] as const,
  needsAttention: ["admin", "dashboard", "needs-attention"] as const,
  lowStock: ["admin", "dashboard", "low-stock"] as const,
};

const sumPaid = (rows: DailyOrderRow[]) =>
  rows
    .filter((r) => r.paymentStatus === PAYMENT_STATUS.paid)
    .reduce((sum, r) => sum + r.total, 0);

/** Revenue today (paid orders only) and % change vs yesterday. */
export function useRevenueToday() {
  return useQuery({
    queryKey: dashboardKeys.dailyOrders,
    queryFn: fetchDailyOrders,
    ...REFRESH,
    select: ({ today, yesterday }: DailyOrders) => {
      const revenue = sumPaid(today);
      const previous = sumPaid(yesterday);
      const changePct =
        previous > 0 ? ((revenue - previous) / previous) * 100 : null;
      return { revenue, changePct };
    },
  });
}

/** Orders placed today and the difference vs yesterday. */
export function useOrdersToday() {
  return useQuery({
    queryKey: dashboardKeys.dailyOrders,
    queryFn: fetchDailyOrders,
    ...REFRESH,
    select: ({ today, yesterday }: DailyOrders) => ({
      count: today.length,
      diff: today.length - yesterday.length,
    }),
  });
}

/** Pending payments plus paid-but-unfulfilled orders. */
export function useNeedsAttention() {
  return useQuery({
    queryKey: dashboardKeys.needsAttention,
    queryFn: fetchNeedsAttention,
    ...REFRESH,
    select: ({ pending, unfulfilled }) => ({
      total: pending + unfulfilled,
      pending,
      unfulfilled,
    }),
  });
}

export function useLowStockCount() {
  return useQuery({
    queryKey: dashboardKeys.lowStock,
    queryFn: fetchLowStockCount,
    ...REFRESH,
  });
}