'use client';

import { api } from '@/trpc/react';
import { toast } from 'sonner';
import type { FeedbackStatus, FeedbackCategory } from '@prisma/client';

export function useCreateFeedback() {
  const utils = api.useUtils();

  const mutation = api.feedback.create.useMutation({
    onSuccess: () => {
      utils.feedback.getMyFeedbacks.invalidate();
      utils.feedback.getStats.invalidate();
      utils.feedback.getAdminList.invalidate();
      toast.success('Feedback envoyé avec succès');
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi du feedback");
    },
  });

  return {
    createFeedback: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useMyFeedbacks() {
  const query = api.feedback.getMyFeedbacks.useQuery(undefined);

  return {
    feedbacks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useFeedbackStats() {
  const query = api.feedback.getStats.useQuery(undefined);

  return {
    stats: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

// Hooks pour l'administration des tickets

export function useAdminFeedbackList(params: {
  page: number;
  limit: number;
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  organizationId?: string;
}) {
  const query = api.feedback.getAdminList.useQuery(params);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useRespondToFeedback() {
  const utils = api.useUtils();

  const mutation = api.feedback.respondToFeedback.useMutation({
    onSuccess: () => {
      utils.feedback.getAdminList.invalidate();
      utils.feedback.getStats.invalidate();
      toast.success('Réponse envoyée avec succès');
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi de la réponse");
    },
  });

  return {
    respondToFeedback: mutation.mutate,
    isResponding: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateFeedbackStatus() {
  const utils = api.useUtils();

  const mutation = api.feedback.updateStatus.useMutation({
    onSuccess: () => {
      utils.feedback.getAdminList.invalidate();
      utils.feedback.getStats.invalidate();
      toast.success('Statut mis à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });

  return {
    updateStatus: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}
