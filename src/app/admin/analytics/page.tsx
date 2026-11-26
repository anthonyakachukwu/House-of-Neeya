"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import ErrorState from "@/components/ui/ErrorState";
import Loader from "@/components/ui/Loader";
import Select from "@/components/ui/SelectInput";
import AdminPageContent from "@/features/admin/components/AdminPageContent";
import AdminPageHeader from "@/features/admin/components/AdminPageHeader";
import StatCard from "@/features/admin/components/StatCard";
import { useAnalytics } from "@/features/admin/analytics/hooks/useAnalytics";
import { pctChange } from "@/features/admin/analytics/lib/analytics";
import {
  BarList,
  ChartPanel,
  CustomerSplitChart,
  RevenueChart,
  TopProducts,
} from "@/features/admin/analytics/components/AnalyticsCharts";
import formatCurrency from "@/lib/formatCurrency";

const PERIODS = [
  { days: 30, label: "Last 30 days" },
  { days: 60, label: "Last 60 days" },
  { days: 90, label: "Last 90 days" },
  { days: 365, label: "Last 12 months" },
];

function Change({ current, previous, days }: { current: number; previous: number; days: number }) {
  const pct = pctChange(current, previous);
  if (pct === null) return <>No earlier data to compare</>;
  const Icon = pct >= 0 ? ArrowUp : ArrowDown;
  return (
    <>
      <Icon size={12} />
      {Math.abs(pct).toFixed(1)}% vs previous {days === 365 ? "year" : `${days} days`}
    </>
  );
}

const valueClass = "text-[clamp(20px,5.5vw,32px)] break-words";

export default function Page() {
  const [days, setDays] = useState(30);
  const { data, isLoading, error } = useAnalytics(days);

  return (
    <>
      <AdminPageHeader>
        <AdminPageHeader.Content>
          <AdminPageHeader.Meta>Overview</AdminPageHeader.Meta>
          <AdminPageHeader.Title>Store Performance</AdminPageHeader.Title>
          <AdminPageHeader.Description>
            Revenue, orders and customer activity across House of Neeya.
          </AdminPageHeader.Description>
        </AdminPageHeader.Content>
        <AdminPageHeader.Actions>
          <Select
            aria-label="Period"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {PERIODS.map((p) => (
              <option key={p.days} value={p.days}>
                {p.label}
              </option>
            ))}
          </Select>
        </AdminPageHeader.Actions>
      </AdminPageHeader>

      {error && <ErrorState error={error.message} />}
      {isLoading && <Loader />}

      {data && (
        <>
          <AdminPageContent>
            <div className="grid auto-rows-min gap-4 grid-cols-2 md:grid-cols-4">
              <StatCard>
                <StatCard.Label>Revenue</StatCard.Label>
                <StatCard.Value className={valueClass}>{formatCurrency(data.current.revenue)}</StatCard.Value>
                <StatCard.Progress><Change current={data.current.revenue} previous={data.previous.revenue} days={days} /></StatCard.Progress>
              </StatCard>
              <StatCard>
                <StatCard.Label>Orders</StatCard.Label>
                <StatCard.Value className={valueClass}>{data.current.orders}</StatCard.Value>
                <StatCard.Progress><Change current={data.current.orders} previous={data.previous.orders} days={days} /></StatCard.Progress>
              </StatCard>
              <StatCard>
                <StatCard.Label>New Customers</StatCard.Label>
                <StatCard.Value className={valueClass}>{data.current.newCustomers}</StatCard.Value>
                <StatCard.Progress><Change current={data.current.newCustomers} previous={data.previous.newCustomers} days={days} /></StatCard.Progress>
              </StatCard>
              <StatCard>
                <StatCard.Label>Avg. Order Value</StatCard.Label>
                <StatCard.Value className={valueClass}>{formatCurrency(Math.round(data.current.aov))}</StatCard.Value>
                <StatCard.Progress><Change current={data.current.aov} previous={data.previous.aov} days={days} /></StatCard.Progress>
              </StatCard>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
              <ChartPanel title="Revenue trend" className="flex-6" empty={data.current.revenue === 0}>
                <RevenueChart data={data.revenueSeries} />
              </ChartPanel>
              <ChartPanel
                title="New vs returning"
                className="flex-4"
                empty={data.customerSplit.newCount + data.customerSplit.returningCount === 0}
              >
                <CustomerSplitChart {...data.customerSplit} />
              </ChartPanel>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
              <ChartPanel title="Category performance" className="flex-6" empty={data.categories.length === 0}>
                <BarList data={data.categories} label="Revenue" color="var(--accent)" format={formatCurrency} />
              </ChartPanel>
              <ChartPanel title="Top products" className="flex-4" empty={data.topProducts.length === 0}>
                <TopProducts products={data.topProducts} />
              </ChartPanel>
            </div>

            <ChartPanel title="Orders by state" empty={data.states.length === 0}>
              <BarList data={data.states} label="Orders" color="var(--primary)" />
            </ChartPanel>
          </AdminPageContent>
        </>
      )}
    </>
  );
}
