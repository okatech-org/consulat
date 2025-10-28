'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Hook for getting report metrics
 */
export function useReportMetrics(period?: 'week' | 'month' | 'quarter' | 'year') {
  return useQuery(api.functions.reports.getReportMetrics, { period });
}

/**
 * Hook for getting monthly trends
 */
export function useMonthlyTrends() {
  return useQuery(api.functions.reports.getMonthlyTrends, {});
}

/**
 * Hook for getting recent reports
 */
export function useRecentReports(limit?: number) {
  return useQuery(api.functions.reports.getRecentReports, { limit });
}

/**
 * Hook for getting report statistics (combines metrics and trends)
 */
export function useReportStatistics() {
  return useQuery(api.functions.reports.getReportStatistics, {});
}
