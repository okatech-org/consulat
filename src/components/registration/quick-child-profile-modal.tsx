'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { tryCatch, capitalize } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/schemas/routes';
import { useCurrentUser } from '@/hooks/use-current-user';
import { handleFormError } from '@/lib/form/errors';

const QuickChildProfileSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
});

type QuickChildProfileFormData = z.infer<typeof QuickChildProfileSchema>;

type QuickChildProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residenceCountry: string;
};

export function QuickChildProfileModal({
  open,
  onOpenChange,
  residenceCountry,
}: QuickChildProfileModalProps) {
  const router = useRouter();
  const t = useTranslations('registration');
  const t_inputs = useTranslations('inputs');
  const { user } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const createChildProfile = useMutation(api.functions.childProfile.createChildProfile);

  const form = useForm<QuickChildProfileFormData>({
    resolver: zodResolver(QuickChildProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  const handleSubmit = async (data: QuickChildProfileFormData) => {
    if (!user) {
      toast.error('Erreur', {
        description: 'Utilisateur non connecté',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await tryCatch(
        createChildProfile({
          authorUserId: user._id,
          residenceCountry,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      );

      if (result.error) {
        const { title, description } = handleFormError(result.error, t);
        toast.error(title, { description });
        return;
      }

      if (result.data) {
        toast.success('Profil créé', {
          description: `Le profil de ${data.firstName} ${data.lastName} a été créé avec succès`,
        });

        onOpenChange(false);
        form.reset();

        router.push(`${ROUTES.user.children}/${result.data}/form`);
      }
    } catch (error) {
      toast.error('Erreur lors de la création du profil');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('child.quick_create.title')}</DialogTitle>
          <DialogDescription>{t('child.quick_create.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FieldGroup>
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="quick-child-firstName">
                      {t_inputs('firstName.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="quick-child-firstName"
                      onChange={(e) => {
                        field.onChange(capitalize(e.target.value));
                      }}
                      placeholder={t_inputs('firstName.placeholder')}
                      disabled={isLoading}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="quick-child-lastName">
                      {t_inputs('lastName.label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="quick-child-lastName"
                      onChange={(e) => {
                        field.onChange(e.target.value.toUpperCase());
                      }}
                      placeholder={t_inputs('lastName.placeholder')}
                      disabled={isLoading}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" loading={isLoading}>
                Créer et continuer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
