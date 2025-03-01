'use client';

import { useState } from 'react';
import { ChildProfileFormData } from '@/app/(authenticated)/my-space/children/_components/child-form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { createChildProfileAction } from '@/actions/child-profiles';
import { useTranslations } from 'next-intl';

export function useChildForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('user.children');

  const handleSubmit = async (data: ChildProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Préparer les données pour la Server Action
      const result = await createChildProfileAction({
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        birthDate: data.birthDate.toISOString(),
        birthPlace: data.birthPlace,
        birthCountry: data.birthCountry,
        nationality: data.nationality,
        parentRole: data.parentRole,
      });

      if (!result.success) {
        throw new Error(result.error || t('create_form.error'));
      }

      // Succès
      toast({
        title: t('create_form.title'),
        description: t('create_form.success'),
        variant: 'success',
      });

      // Rediriger vers la liste des enfants
      router.push(ROUTES.user.children);
      router.refresh();
    } catch (err) {
      console.error('Erreur:', err);
      if (err instanceof Error) {
        setError(err.message);
        toast({
          title: t('create_form.title'),
          description: err.message,
          variant: 'destructive',
        });
      } else {
        setError(t('create_form.error'));
        toast({
          title: t('create_form.title'),
          description: t('create_form.error'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleSubmit,
  };
}
