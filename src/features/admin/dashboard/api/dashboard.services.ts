import { getDayRangesWAT } from "@/features/admin/dashboard/lib/dayRanges";
import { supabase } from "@/utils/supabase/client";

// Assumed values. Confirm against what your checkout and order flow actually write.
export const PAYMENT_STATUS = { pending: "pending", paid: "paid" } as const;
export const ORDER_STATUS = { unfulfilled: "unfulfilled" } as const;
export const LOW_STOCK_THRESHOLD = 5;

export type DailyOrderRow = {
  total: number;
  paymentStatus: string;
  createdAt: string;
};

export type DailyOrders = {
  today: DailyOrderRow[];
  yesterday: DailyOrderRow[];
};

/** Orders from the start of yesterday onward, split into today and yesterday. */
export async function fetchDailyOrders(): Promise<DailyOrders> {
  const { todayStart, yesterdayStart } = getDayRangesWAT();

  const { data, error } = await supabase()
    .from("Orders")
    .select("total, paymentStatus, createdAt")
    .gte("createdAt", yesterdayStart);

  if (error) throw error;

  const rows = (data ?? []) as DailyOrderRow[];
  return {
    today: rows.filter((r) => r.createdAt >= todayStart),
    yesterday: rows.filter((r) => r.createdAt < todayStart),
  };
}

export type NeedsAttentionCounts = { pending: number; unfulfilled: number };

/** Pending = payment not received. Unfulfilled = paid but not yet shipped. */
export async function fetchNeedsAttention(): Promise<NeedsAttentionCounts> {
  const [pending, unfulfilled] = await Promise.all([
    supabase()
      .from("Orders")
      .select("id", { count: "exact", head: true })
      .eq("paymentStatus", PAYMENT_STATUS.pending),
    supabase()
      .from("Orders")
      .select("id", { count: "exact", head: true })
      .eq("paymentStatus", PAYMENT_STATUS.paid)
      .eq("status", ORDER_STATUS.unfulfilled),
  ]);

  if (pending.error) throw pending.error;
  if (unfulfilled.error) throw unfulfilled.error;

  return { pending: pending.count ?? 0, unfulfilled: unfulfilled.count ?? 0 };
}

export async function fetchLowStockCount(): Promise<number> {

  const { count, error } = await supabase()
    .from("Products")
    .select("id", { count: "exact", head: true })
    .lte("stock", LOW_STOCK_THRESHOLD);

  if (error) throw error;
  return count ?? 0;
}