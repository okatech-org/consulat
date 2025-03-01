import { useState } from 'react';
import { ChildProfileFormData } from '@/app/(authenticated)/my-space/children/_components/child-form';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

export function useChildForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: ChildProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Formater les données pour l'API
      const formData = new FormData();

      // Ajouter les champs principaux
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('gender', data.gender);
      formData.append('birthDate', data.birthDate.toISOString());
      formData.append('birthPlace', data.birthPlace);
      formData.append('birthCountry', data.birthCountry);
      formData.append('nationality', data.nationality);
      formData.append('parentRole', data.parentRole);

      // Appel à l'API pour créer le profil enfant
      const response = await fetch('/api/children', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            'Une erreur est survenue lors de la création du profil enfant',
        );
      }

      // Succès
      toast({
        title: 'Profil enfant créé',
        description: 'Le profil de votre enfant a été créé avec succès.',
      });

      // Rediriger vers la liste des enfants
      router.push(ROUTES.user.children);
    } catch (err) {
      console.error('Erreur:', err);
      if (err instanceof Error) {
        setError(err.message);
        toast({
          title: 'Erreur',
          description: err.message,
          variant: 'destructive',
        });
      } else {
        setError('Une erreur inconnue est survenue');
        toast({
          title: 'Erreur',
          description: 'Une erreur inconnue est survenue',
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
