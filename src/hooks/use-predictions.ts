'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Hook for getting AI models with real-time statistics
 */
export function useAIModels() {
  return useQuery(api.functions.predictions.getAIModels, {});
}

/**
 * Hook for getting AI predictions with filters
 */
export function useAIPredictions(params?: {
  model?: string;
  type?: string;
  timeframe?: string;
  status?: string;
  minConfidence?: number;
}) {
  return useQuery(api.functions.predictions.getAIPredictions, params || {});
}

/**
 * Hook for getting predictions statistics
 */
export function usePredictionsStatistics() {
  return useQuery(api.functions.predictions.getPredictionsStatistics, {});
}
