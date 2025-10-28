'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Hook for getting network data (nodes, clusters, stats)
 */
export function useNetworkData(params?: {
  search?: string;
  influenceLevel?: 'all' | 'high' | 'medium' | 'low';
}) {
  return useQuery(api.functions.networks.getNetworkData, params || {});
}

/**
 * Hook for getting detailed cluster information
 */
export function useClusterDetails(clusterId: string | null) {
  return useQuery(
    api.functions.networks.getClusterDetails,
    clusterId ? { clusterId } : 'skip'
  );
}
