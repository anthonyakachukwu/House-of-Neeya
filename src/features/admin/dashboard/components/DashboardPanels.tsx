"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  PackageCheck,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SummaryTable from "@/features/admin/components/SummaryTable";
import { badge, formatOrderDate, statusTone } from "@/features/admin/lib/adminUi";
import type { AdminOrder } from "@/features/admin/orders/api/order.mappers";
import formatCurrency from "@/lib/formatCurrency";
import type { LowStockProduct } from "../api/dashboard.services";
import {
  useAttentionOrders,
  useLowStockProducts,
  useRecentOrders,
  useTopProducts,
  type TopProduct,
} from "../hooks/useDashboardLists";

const panelClass = "min-w-0 md:flex-1";

type PanelState<T> = { data?: T[]; isLoading: boolean; error: Error | null };

function PanelBody<T>({
  state,
  empty,
  children,
}: {
  state: PanelState<T>;
  empty: ReactNode;
  children: (items: T[]) => ReactNode;
}) {
  if (state.isLoading) {
    return (
      <SummaryTable.Content>
        <div className="flex w-full flex-col gap-3 pt-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </SummaryTable.Content>
    );
  }
  if (state.error) {
    return (
      <SummaryTable.Content>
        <p role="alert" className="w-full py-12 text-center text-xs text-destructive">
          {state.error.message}
        </p>
      </SummaryTable.Content>
    );
  }
  if (!state.data?.length) {
    return <SummaryTable.Content>{empty}</SummaryTable.Content>;
  }
  return (
    <SummaryTable.Content>
      <ul className="flex w-full flex-col divide-y divide-foreground/10 pt-2">
        {children(state.data)}
      </ul>
    </SummaryTable.Content>
  );
}

/* ---------- orders ---------- */

function attentionLabel(order: AdminOrder) {
  return order.paymentStatus === "pending"
    ? { text: "Awaiting payment", tone: "orange" as const }
    : { text: "Ready to ship", tone: "blue" as const };
}

function recentLabel(order: AdminOrder) {
  if (order.status === "cancelled") return { text: "cancelled", tone: "red" as const };
  if (order.paymentStatus === "pending") return { text: "Unpaid", tone: "orange" as const };
  return { text: order.status, tone: statusTone[order.status] };
}

function OrderRow({ order, variant }: { order: AdminOrder; variant: "attention" | "recent" }) {
  const label = variant === "attention" ? attentionLabel(order) : recentLabel(order);
  return (
    <li>
      <Link
        href="/admin/orders"
        className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-foreground/5"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{order.reference}</p>
          <p className="truncate text-xs text-foreground/60">
            {order.customer.name} • {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm">{formatCurrency(order.total)}</span>
          <span className={badge(label.tone)}>{label.text}</span>
        </div>
      </Link>
    </li>
  );
}

export function NeedsAttentionPanel() {
  const state = useAttentionOrders();
  return (
    <SummaryTable className={`${panelClass} md:flex-6`}>
      <SummaryTable.Header>
        <SummaryTable.Title>Need your attention</SummaryTable.Title>
        <SummaryTable.Action href="/admin/orders">View all orders <ArrowRight /></SummaryTable.Action>
      </SummaryTable.Header>
      <PanelBody
        state={state}
        empty={
          <SummaryTable.Empty>
            <ClipboardCheck />
            <p className="font-bold">No orders need attention</p>
            <p className="normal-case">You&apos;re all caught up!</p>
          </SummaryTable.Empty>
        }
      >
        {(orders) => orders.map((o) => <OrderRow key={o.id} order={o} variant="attention" />)}
      </PanelBody>
    </SummaryTable>
  );
}

export function RecentOrdersPanel() {
  const state = useRecentOrders();
  return (
    <SummaryTable className={`${panelClass} md:flex-6`}>
      <SummaryTable.Header>
        <SummaryTable.Title>Recent Orders</SummaryTable.Title>
        <SummaryTable.Action href="/admin/orders">View all <ArrowRight /></SummaryTable.Action>
      </SummaryTable.Header>
      <PanelBody
        state={state}
        empty={
          <SummaryTable.Empty>
            <ShoppingBag />
            <p className="font-bold">No recent orders</p>
            <p className="normal-case">New orders will appear here when customers place them</p>
          </SummaryTable.Empty>
        }
      >
        {(orders) => orders.map((o) => <OrderRow key={o.id} order={o} variant="recent" />)}
      </PanelBody>
    </SummaryTable>
  );
}

/* ---------- products ---------- */

function LowStockRow({ product }: { product: LowStockProduct }) {
  const soldOut = product.stock <= 0;
  return (
    <li>
      <Link
        href="/admin/products"
        className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 hover:bg-foreground/5"
      >
        {product.image?.src ? (
          <Image
            src={product.image.src}
            alt={product.name}
            width={40}
            height={50}
            className="h-12.5 w-10 shrink-0 object-cover"
          />
        ) : (
          <div className="h-12.5 w-10 shrink-0 bg-foreground/10" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="truncate text-[10px] text-foreground/60">SKU: {product.sku}</p>
        </div>
        <span className={badge(soldOut ? "red" : "orange")}>
          {soldOut ? "Sold out" : `${product.stock} left`}
        </span>
      </Link>
    </li>
  );
}

export function LowStockPanel() {
  const state = useLowStockProducts();
  return (
    <SummaryTable className={`${panelClass} md:flex-4`}>
      <SummaryTable.Header>
        <SummaryTable.Title>Low stock</SummaryTable.Title>
        <SummaryTable.Action href="/admin/products">Manage products <ArrowRight /></SummaryTable.Action>
      </SummaryTable.Header>
      <PanelBody
        state={state}
        empty={
          <SummaryTable.Empty>
            <PackageCheck />
            <p className="font-bold">No low stock items</p>
            <p className="normal-case">All products are sufficiently stocked!</p>
          </SummaryTable.Empty>
        }
      >
        {(products) => products.map((p) => <LowStockRow key={p.id} product={p} />)}
      </PanelBody>
    </SummaryTable>
  );
}

function TopProductRow({ product, rank }: { product: TopProduct; rank: number }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="w-5 shrink-0 font-serif text-lg italic text-primary">{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{product.name}</p>
        <p className="text-xs text-foreground/60">
          {product.units} {product.units === 1 ? "unit" : "units"} sold
        </p>
      </div>
      <span className="shrink-0 text-sm">{formatCurrency(product.revenue)}</span>
    </li>
  );
}

export function TopProductsPanel() {
  const state = useTopProducts();
  return (
    <SummaryTable className={`${panelClass} md:flex-4`}>
      <SummaryTable.Header>
        <SummaryTable.Title>Top Products</SummaryTable.Title>
        <SummaryTable.Action href="/admin/analytics">View analytics <ArrowRight /></SummaryTable.Action>
      </SummaryTable.Header>
      <PanelBody
        state={state}
        empty={
          <SummaryTable.Empty>
            <Trophy />
            <p className="font-bold">No top product yet</p>
            <p className="normal-case">Paid orders will rank your best sellers here</p>
          </SummaryTable.Empty>
        }
      >
        {(products) => products.map((p, i) => <TopProductRow key={p.productId} product={p} rank={i + 1} />)}
      </PanelBody>
    </SummaryTable>
  );
}