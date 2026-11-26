"use client";

import type { ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ClipboardCheck } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import SummaryTable from "@/features/admin/components/SummaryTable";
import formatCurrency from "@/lib/formatCurrency";
import type { Analytics } from "../lib/analytics";

const compactNaira = (v: number) =>
  `₦${new Intl.NumberFormat("en", { notation: "compact" }).format(v)}`;

const truncate = (text: string, max = 14) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

const tooltipRow = (name: string, value: string) => (
  <div className="flex w-full justify-between gap-4">
    <span className="text-muted-foreground">{name}</span>
    <span className="font-mono font-medium">{value}</span>
  </div>
);

/** Card with a title; shows an empty state when there is nothing to plot. */
export function ChartPanel({
  title,
  empty,
  className,
  children,
}: {
  title: string;
  empty?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <SummaryTable className={`min-w-0 ${className ?? ""}`}>
      <SummaryTable.Header>
        <SummaryTable.Title>{title}</SummaryTable.Title>
      </SummaryTable.Header>
      <SummaryTable.Content>
        {empty ? (
          <SummaryTable.Empty>
            <ClipboardCheck />
            <p className="font-bold">No data for this period</p>
          </SummaryTable.Empty>
        ) : (
          <div className="w-full min-w-0">{children}</div>
        )}
      </SummaryTable.Content>
    </SummaryTable>
  );
}

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--primary)" },
} satisfies ChartConfig;

export function RevenueChart({ data }: { data: Analytics["revenueSeries"] }) {
  return (
    <ChartContainer config={revenueConfig} className="aspect-auto h-64 w-full justify-start">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
        <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={compactNaira} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) =>
                tooltipRow(
                  `Revenue (${item?.payload?.orders ?? 0} orders)`,
                  formatCurrency(Number(value)),
                )
              }
            />
          }
        />
        <Area
          dataKey="revenue"
          type="monotone"
          stroke="var(--color-revenue)"
          fill="var(--color-revenue)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}

const splitConfig = {
  new: { label: "New", color: "var(--accent)" },
  returning: { label: "Returning", color: "var(--secondary)" },
} satisfies ChartConfig;

export function CustomerSplitChart({ newCount, returningCount }: Analytics["customerSplit"]) {
  const data = [
    { name: "new", value: newCount, fill: "var(--color-new)" },
    { name: "returning", value: returningCount, fill: "var(--color-returning)" },
  ];
  return (
    <div className="flex flex-col items-center gap-4">
      <ChartContainer config={splitConfig} className="aspect-square h-48 w-full max-w-60">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} strokeWidth={2} />
        </PieChart>
      </ChartContainer>
      <ul className="flex gap-6 text-xs">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: d.fill }} />
            <span className="capitalize">{d.name}</span>
            <span className="font-semibold">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal bars: category revenue, orders by state. */
export function BarList({
  data,
  label,
  color,
  format = String,
}: {
  data: { name: string; value: number }[];
  label: string;
  color: string;
  format?: (value: number) => string;
}) {
  const config = { value: { label, color } } satisfies ChartConfig;
  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full justify-start"
      style={{ height: Math.max(160, data.length * 44) }}
    >
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={96}
          tickFormatter={(v: string) => truncate(v)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent formatter={(value) => tooltipRow(label, format(Number(value)))} />}
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={2} />
      </BarChart>
    </ChartContainer>
  );
}

export function TopProducts({ products }: { products: Analytics["topProducts"] }) {
  return (
    <ol className="flex flex-col divide-y divide-foreground/10 text-sm">
      {products.map((p, i) => (
        <li key={p.name} className="flex items-center gap-3 py-3">
          <span className="font-serif italic text-primary w-5">{i + 1}</span>
          <span className="flex-1 min-w-0">
            <span className="block truncate font-medium">{p.name}</span>
            <span className="text-xs text-foreground/60">{p.units} sold</span>
          </span>
          <span className="shrink-0">{formatCurrency(p.revenue)}</span>
        </li>
      ))}
    </ol>
  );
}
