'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@/convex/lib/constants';

/**
 * Hook for getting intelligence notes with optional filters
 */
export function useIntelligenceNotes(filters?: {
  profileId?: Id<'profiles'>;
  type?: IntelligenceNoteType;
  priority?: IntelligenceNotePriority;
  authorId?: Id<'users'>;
  search?: string;
}) {
  return useQuery(api.functions.intelligence.getIntelligenceNotes, { filters });
}

/**
 * Hook for getting note history
 */
export function useNoteHistory(noteId: Id<'intelligenceNotes'>) {
  return useQuery(api.functions.intelligence.getNoteHistory, { noteId });
}

/**
 * Hook for getting profiles with intelligence data
 */
export function useIntelligenceProfiles(
  page: number,
  limit: number,
  filters?: {
    search?: string;
    hasNotes?: boolean;
    nationality?: string;
    birthCountry?: string;
  },
) {
  return useQuery(api.functions.intelligence.getProfiles, {
    page,
    limit,
    filters,
  });
}

/**
 * Hook for getting profiles for map visualization
 */
export function useIntelligenceProfilesMap(filters?: {
  search?: string;
  hasNotes?: boolean;
  priority?: IntelligenceNotePriority;
  region?: string;
}) {
  return useQuery(api.functions.intelligence.getProfilesMap, { filters });
}

/**
 * Hook for getting dashboard statistics
 */
export function useIntelligenceDashboardStats(period: 'day' | 'week' | 'month' | 'year') {
  return useQuery(api.functions.intelligence.getDashboardStats, { period });
}

/**
 * Hook for getting profile details with intelligence data
 */
export function useIntelligenceProfileDetails(profileId: Id<'profiles'>) {
  return useQuery(api.functions.intelligence.getProfileDetails, { profileId });
}

/**
 * Hook for creating an intelligence note
 */
export function useCreateIntelligenceNote() {
  return useMutation(api.functions.intelligence.createNote);
}

/**
 * Hook for updating an intelligence note
 */
export function useUpdateIntelligenceNote() {
  return useMutation(api.functions.intelligence.updateNote);
}

/**
 * Hook for deleting an intelligence note
 */
export function useDeleteIntelligenceNote() {
  return useMutation(api.functions.intelligence.deleteNote);
}
