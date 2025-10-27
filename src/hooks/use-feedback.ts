'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import { FeedbackCategory, FeedbackStatus } from '@/convex/lib/constants';

export function useCreateFeedback() {
  const mutation = useMutation(api.functions.feedback.createFeedback);

  const createFeedback = async (
    data: {
      subject: string;
      message: string;
      category: FeedbackCategory;
      rating?: number;
      email?: string;
      phoneNumber?: string;
      serviceId?: Id<'services'>;
      requestId?: Id<'requests'>;
    },
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    },
  ) => {
    try {
      await mutation(data);
      toast.success('Feedback envoyé avec succès');
      options?.onSuccess?.();
    } catch (error) {
      toast.error("Erreur lors de l'envoi du feedback");
      options?.onError?.(error as Error);
    }
  };

  return {
    createFeedback,
    isCreating: false, // Convex mutations don't have a loading state in the same way
  };
}

export function useMyFeedbacks() {
  const feedbacks = useQuery(api.functions.feedback.getMyFeedbacks);

  return {
    feedbacks: feedbacks ?? [],
    isLoading: feedbacks === undefined,
    error: null,
    refetch: () => {}, // Convex auto-refetches
  };
}

export function useFeedbackStats() {
  const stats = useQuery(api.functions.feedback.getFeedbackStats);

  return {
    stats,
    isLoading: stats === undefined,
    error: null,
  };
}

export function useAdminFeedbackList(params: {
  page: number;
  limit: number;
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  organizationId?: Id<'organizations'>;
}) {
  const data = useQuery(api.functions.feedback.getAdminFeedbackList, {
    status: params.status,
    category: params.category,
    organizationId: params.organizationId,
    limit: params.limit,
  });

  return {
    data,
    isLoading: data === undefined,
    error: null,
  };
}

export function useRespondToFeedback() {
  const mutation = useMutation(api.functions.feedback.respondToFeedback);

  const respondToFeedback = async (
    data: {
      ticketId: Id<'tickets'>;
      response: string;
    },
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    },
  ) => {
    try {
      await mutation(data);
      toast.success('Réponse envoyée avec succès');
      options?.onSuccess?.();
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la réponse");
      options?.onError?.(error as Error);
    }
  };

  return {
    respondToFeedback,
    isResponding: false,
  };
}

export function useUpdateFeedbackStatus() {
  const mutation = useMutation(api.functions.feedback.updateFeedbackStatus);

  const updateStatus = async (
    data: {
      ticketId: Id<'tickets'>;
      status: FeedbackStatus;
    },
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    },
  ) => {
    try {
      await mutation(data);
      toast.success('Statut mis à jour avec succès');
      options?.onSuccess?.();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      options?.onError?.(error as Error);
    }
  };

  return {
    updateStatus,
    isUpdating: false,
  };
}
