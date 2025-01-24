'use client';

import { useState } from 'react';
import { ActionResult } from '@/lib/auth/action';
import { useToast } from './use-toast';
import { useTranslations } from 'next-intl';

export function useProtectedAction<TInput, TOutput>() {
  const [isPending, startTransition] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('errors');

  async function mutate(
    action: (input: TInput) => Promise<ActionResult<TOutput>>,
    input: TInput,
    options?: {
      onSuccess?: (data: TOutput) => void;
      onError?: (error: string) => void;
      successMessage?: string;
    },
  ) {
    try {
      startTransition(true);
      const result = await action(input);

      if (result.error) {
        toast({
          title: t('common.error_title'),
          description: result.error,
          variant: 'destructive',
        });
        options?.onError?.(result.error);
        return;
      }

      if (result.data) {
        if (options?.successMessage) {
          toast({
            title: t('common.success_title'),
            description: options.successMessage,
            variant: 'success',
          });
        }
        options?.onSuccess?.(result.data);
      }
    } catch (error) {
      console.error('Action error:', error);
      toast({
        title: t('common.error_title'),
        description: t('common.unknown_error'),
        variant: 'destructive',
      });
    } finally {
      startTransition(false);
    }
  }

  return {
    mutate,
    isPending,
  };
}
