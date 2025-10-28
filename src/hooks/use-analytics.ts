'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Hook for getting comprehensive intelligence analytics
 */
export function useIntelligenceAnalytics(period?: 'day' | 'week' | 'month' | 'quarter' | 'year') {
  return useQuery(api.functions.analytics.getIntelligenceAnalytics, {
    period,
  });
}
