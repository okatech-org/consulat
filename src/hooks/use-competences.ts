'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Hook for getting skills directory with pagination and filters
 */
export function useSkillsDirectory(params: {
  search?: string;
  category?: string;
  level?: string;
  marketDemand?: 'high' | 'medium' | 'low';
  workStatus?: string;
  hasCompleteProfile?: boolean;
  page: number;
  limit: number;
  sortBy?: 'name' | 'profession' | 'updatedAt' | 'marketDemand';
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery(api.functions.competences.getDirectory, params);
}

/**
 * Hook for getting profile CV with synthesized information
 */
export function useProfileCV(profileId: Id<'profiles'> | null) {
  return useQuery(
    api.functions.competences.getProfileCV,
    profileId ? { profileId } : 'skip'
  );
}

/**
 * Hook for getting skills statistics for Gabon
 */
export function useSkillsStatistics(region?: string) {
  return useQuery(api.functions.competences.getSkillsStatistics, {
    region,
  });
}
