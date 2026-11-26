import { parseDbDate } from "@/lib/formatDate";

export type RawOrder = {
  id: string;
  userId: string | null;
  addressId: string;
  status: string;
  paymentStatus: string;
  total: number | string;
  createdAt: string;
};
export type RawAddress = { id: string; email: string | null; state: string | null };
export type RawItem = {
  orderId: string;
  productId: string;
  quantity: number | string;
  priceAtPurchase: number | string;
};
export type RawProduct = { id: string; name: string; category: string | null };
export type RawAnalytics = {
  orders: RawOrder[];
  addresses: RawAddress[];
  items: RawItem[];
  products: RawProduct[];
};

export type Totals = {
  revenue: number;
  orders: number;
  newCustomers: number;
  aov: number;
};

export type Analytics = {
  current: Totals;
  previous: Totals;
  revenueSeries: { label: string; revenue: number; orders: number }[];
  customerSplit: { newCount: number; returningCount: number };
  categories: { name: string; value: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  states: { name: string; value: number }[];
};

const WAT = 3_600_000; // Nigeria is UTC+1 all year
const DAY = 86_400_000;

const dayKey = (ms: number) => new Date(ms + WAT).toISOString().slice(0, 10);

export function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Revenue = paid orders (cancelled excluded). Orders = every non-cancelled order.
 * Customers are matched by delivery email, then user id.
 * A "new" customer placed their first non-cancelled order inside the period.
 */
export function buildAnalytics(raw: RawAnalytics, days: number, now = new Date()): Analytics {
  const end = Math.floor((now.getTime() + WAT) / DAY) * DAY - WAT + DAY; // end of today (WAT)
  const start = end - days * DAY;
  const prevStart = start - days * DAY;

  const addressById = new Map(raw.addresses.map((a) => [a.id, a]));
  const productById = new Map(raw.products.map((p) => [p.id, p]));

  const live = raw.orders
    .filter((o) => o.status !== "cancelled")
    .map((o) => ({
      ...o,
      total: Number(o.total),
      time: parseDbDate(o.createdAt).getTime(),
    }));

  const keyOf = (o: (typeof live)[number]) =>
    addressById.get(o.addressId)?.email?.toLowerCase() || o.userId || o.id;

  const firstSeen = new Map<string, number>();
  for (const o of live) {
    const key = keyOf(o);
    const seen = firstSeen.get(key);
    if (seen === undefined || o.time < seen) firstSeen.set(key, o.time);
  }

  const within = (t: number, from: number, to: number) => t >= from && t < to;

  const summarise = (from: number, to: number) => {
    const rows = live.filter((o) => within(o.time, from, to));
    const paid = rows.filter((o) => o.paymentStatus === "paid");
    const revenue = paid.reduce((sum, o) => sum + o.total, 0);
    const customers = new Set(rows.map(keyOf));
    const newCustomers = [...customers].filter((k) =>
      within(firstSeen.get(k)!, from, to),
    ).length;
    return {
      rows,
      paid,
      customers: customers.size,
      totals: {
        revenue,
        orders: rows.length,
        newCustomers,
        aov: paid.length ? revenue / paid.length : 0,
      } satisfies Totals,
    };
  };

  const cur = summarise(start, end);
  const prev = summarise(prevStart, start);

  // Revenue over time: daily, or monthly for long ranges
  const monthly = days > 120;
  const bucketKey = (ms: number) => (monthly ? dayKey(ms).slice(0, 7) : dayKey(ms));
  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (let t = start; t < end; t += DAY) {
    const key = bucketKey(t);
    if (!buckets.has(key)) buckets.set(key, { revenue: 0, orders: 0 });
  }
  for (const o of cur.rows) {
    const bucket = buckets.get(bucketKey(o.time));
    if (!bucket) continue;
    bucket.orders += 1;
    if (o.paymentStatus === "paid") bucket.revenue += o.total;
  }
  const revenueSeries = [...buckets.entries()].map(([key, v]) => ({
    label: new Date(monthly ? `${key}-01T00:00:00Z` : `${key}T00:00:00Z`).toLocaleDateString(
      "en-GB",
      monthly
        ? { month: "short", year: "2-digit", timeZone: "UTC" }
        : { day: "numeric", month: "short", timeZone: "UTC" },
    ),
    ...v,
  }));

  // Category and product revenue (paid orders in range)
  const paidIds = new Set(cur.paid.map((o) => o.id));
  const categoryTotals = new Map<string, number>();
  const productTotals = new Map<string, { units: number; revenue: number }>();
  for (const item of raw.items) {
    if (!paidIds.has(item.orderId)) continue;
    const qty = Number(item.quantity);
    const amount = qty * Number(item.priceAtPurchase);
    const product = productById.get(item.productId);
    const category = product?.category ?? "Unknown";
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + amount);
    const name = product?.name ?? "Deleted product";
    const row = productTotals.get(name) ?? { units: 0, revenue: 0 };
    productTotals.set(name, { units: row.units + qty, revenue: row.revenue + amount });
  }

  const stateTotals = new Map<string, number>();
  for (const o of cur.rows) {
    const state = addressById.get(o.addressId)?.state || "Unknown";
    stateTotals.set(state, (stateTotals.get(state) ?? 0) + 1);
  }

  const byValue = (a: { value: number }, b: { value: number }) => b.value - a.value;

  return {
    current: cur.totals,
    previous: prev.totals,
    revenueSeries,
    customerSplit: {
      newCount: cur.totals.newCustomers,
      returningCount: cur.customers - cur.totals.newCustomers,
    },
    categories: [...categoryTotals].map(([name, value]) => ({ name, value })).sort(byValue),
    topProducts: [...productTotals]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    states: [...stateTotals]
      .map(([name, value]) => ({ name, value }))
      .sort(byValue)
      .slice(0, 8),
  };
}
