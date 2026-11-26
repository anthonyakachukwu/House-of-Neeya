"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsData } from "../api/analytics.services";
import { buildAnalytics } from "../lib/analytics";

/** Fetch once, then re-slice locally when the period changes. */
export function useAnalytics(days: number) {
  const query = useQuery({
    queryKey: ["admin", "analytics", "raw"],
    queryFn: fetchAnalyticsData,
    staleTime: 60_000,
  });

  const data = useMemo(
    () => (query.data ? buildAnalytics(query.data, days) : undefined),
    [query.data, days],
  );

  return { data, isLoading: query.isLoading, error: query.error };
}
