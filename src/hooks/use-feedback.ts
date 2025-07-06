'use client';

import { api } from '@/trpc/react';
import { toast } from 'sonner';



export function useCreateFeedback() {
  const utils = api.useUtils();
  
  const mutation = api.feedback.create.useMutation({
    onSuccess: () => {
      utils.feedback.getMyFeedbacks.invalidate();
      utils.feedback.getStats.invalidate();
      toast.success('Feedback envoyé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi du feedback');
    },
  });

  return {
    createFeedback: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useMyFeedbacks() {
  const query = api.feedback.getMyFeedbacks.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    feedbacks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useFeedbackStats() {
  const query = api.feedback.getStats.useQuery(undefined, {
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
} 