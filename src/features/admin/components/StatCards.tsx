import StatCard from './StatCard'
import formatCurrency from '@/lib/formatCurrency'
import { useLowStockCount, useNeedsAttention, useOrdersToday, useRevenueToday } from "@/features/admin/dashboard/hooks/useDashboardStats";
import { ArrowUp } from 'lucide-react';

const StatCards = () => {
  const { data: revenueData } = useRevenueToday();
  const { data: ordersData } = useOrdersToday();
  const { data: needsAttention} = useNeedsAttention();
  const { data: lowStockCount } = useLowStockCount();

  

  return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatCard>
            <StatCard.Label>Revenue Today</StatCard.Label>
            <StatCard.Value>{formatCurrency(revenueData?.revenue || 0)}</StatCard.Value>
            <StatCard.Progress><ArrowUp size={12} />{revenueData?.changePct?.toFixed(0) || 0}% vs Yesterday</StatCard.Progress>
          </StatCard>
          <StatCard>
            <StatCard.Label>Orders Today</StatCard.Label>
            <StatCard.Value>{ordersData?.count || 0}</StatCard.Value>
            <StatCard.Progress><ArrowUp size={12} />{ordersData?.diff || 0} vs Yesterday</StatCard.Progress>
          </StatCard>
          <StatCard>
            <StatCard.Label>Needs Attention</StatCard.Label>
            <StatCard.Value>{needsAttention?.total || 0}</StatCard.Value>
            <StatCard.Progress className="text-accent">{needsAttention?.pending || 0} pending • {needsAttention?.unfulfilled || 0} unfulfilled</StatCard.Progress>
          </StatCard>
          <StatCard>
            <StatCard.Label>Low Stock Items</StatCard.Label>
            <StatCard.Value>{lowStockCount || 0}</StatCard.Value>
            <StatCard.Progress className="text-accent">{lowStockCount && lowStockCount>0 ? "Restock recommended" : "No action needed"}</StatCard.Progress>
          </StatCard>
        </div>
  )
}

export default StatCards