'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Hook for getting associations with filters
 */
export function useAssociations(params?: {
  search?: string;
  category?: string;
  zone?: string;
  riskLevel?: 'faible' | 'moyen' | 'eleve' | 'critique';
  monitoringStatus?: 'actif' | 'passif' | 'archive';
  influence?: 'local' | 'regional' | 'national' | 'international';
}) {
  return useQuery(api.functions.associations.getAssociations, params || {});
}

/**
 * Hook for getting a single association by ID
 */
export function useAssociation(associationId: Id<'associations'> | null) {
  return useQuery(
    api.functions.associations.getAssociationById,
    associationId ? { associationId } : 'skip'
  );
}

/**
 * Hook for getting associations statistics
 */
export function useAssociationsStatistics() {
  return useQuery(api.functions.associations.getAssociationsStatistics, {});
}

/**
 * Hook for getting map data for associations
 */
export function useAssociationsMapData(params?: {
  search?: string;
  category?: string;
  zone?: string;
  riskLevel?: string;
  monitoringStatus?: string;
}) {
  return useQuery(api.functions.associations.getAssociationsMapData, params || {});
}

/**
 * Hook for getting association members
 */
export function useAssociationMembers(
  associationId: Id<'associations'> | null,
  activeOnly?: boolean
) {
  return useQuery(
    api.functions.associations.getAssociationMembers,
    associationId ? { associationId, activeOnly } : 'skip'
  );
}

/**
 * Hook for getting profile associations
 */
export function useProfileAssociations(
  profileId: Id<'profiles'> | null,
  activeOnly?: boolean
) {
  return useQuery(
    api.functions.associations.getProfileAssociations,
    profileId ? { profileId, activeOnly } : 'skip'
  );
}

/**
 * Hook for creating an association
 */
export function useCreateAssociation() {
  return useMutation(api.functions.associations.createAssociation);
}

/**
 * Hook for updating an association
 */
export function useUpdateAssociation() {
  return useMutation(api.functions.associations.updateAssociation);
}

/**
 * Hook for deleting an association
 */
export function useDeleteAssociation() {
  return useMutation(api.functions.associations.deleteAssociation);
}

/**
 * Hook for adding a member to an association
 */
export function useAddMember() {
  return useMutation(api.functions.associations.addMember);
}

/**
 * Hook for removing a member from an association
 */
export function useRemoveMember() {
  return useMutation(api.functions.associations.removeMember);
}
