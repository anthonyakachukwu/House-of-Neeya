"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminOrders } from "@/features/admin/orders/api/order.services";
import type { AdminOrder } from "@/features/admin/orders/api/order.mappers";
import { fetchLowStockProducts } from "../api/dashboard.services";
import { dashboardKeys, REFRESH } from "./useDashboardStats";

const LIST_SIZE = 5;

const ordersQuery = {
  queryKey: ["admin", "orders"] as const,
  queryFn: getAdminOrders,
  ...REFRESH,
};

const needsAttention = (o: AdminOrder) =>
  o.status !== "cancelled" &&
  (o.paymentStatus === "pending" ||
    (o.paymentStatus === "paid" && o.status === "unfulfilled"));

export type TopProduct = { productId: string; name: string; units: number; revenue: number };

export const useRecentOrders = () =>
  useQuery({ ...ordersQuery, select: (orders: AdminOrder[]) => orders.slice(0, LIST_SIZE) });

/** Oldest first, so the order that has waited longest is at the top. */
export const useAttentionOrders = () =>
  useQuery({
    ...ordersQuery,
    select: (orders: AdminOrder[]) =>
      orders
        .filter(needsAttention)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, LIST_SIZE),
  });

/** Paid, non-cancelled orders only, ranked by units sold. */
export const useTopProducts = () =>
  useQuery({
    ...ordersQuery,
    select: (orders: AdminOrder[]): TopProduct[] => {
      const totals = new Map<string, TopProduct>();
      for (const order of orders) {
        if (order.paymentStatus !== "paid" || order.status === "cancelled") continue;
        for (const item of order.items) {
          const t = totals.get(item.id) ?? {
            productId: item.id,
            name: item.name,
            units: 0,
            revenue: 0,
          };
          t.units += item.quantity;
          t.revenue += item.unitPrice * item.quantity;
          totals.set(item.id, t);
        }
      }
      return [...totals.values()]
        .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
        .slice(0, LIST_SIZE);
    },
  });

export const useLowStockProducts = () =>
  useQuery({
    // Different key from the count query in dashboardKeys.lowStock on purpose.
    queryKey: [...dashboardKeys.lowStock, "list"] as const,
    queryFn: () => fetchLowStockProducts(LIST_SIZE),
    ...REFRESH,
  });