'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BasicInfoSchema } from '@/schemas/registration';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gender } from '@prisma/client';
import type { z } from 'zod';

type BasicInfoFormData = z.infer<typeof BasicInfoSchema>;

interface ProfileUpdateFormProps {
  profileId: string;
  initialData?: Partial<BasicInfoFormData>;
  onSuccess?: () => void;
}

export function ProfileUpdateForm({
  profileId,
  initialData,
  onSuccess,
}: ProfileUpdateFormProps) {
  const utils = api.useUtils();

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: initialData,
  });

  const updateMutation = api.profile.updateSection.useMutation({
    onSuccess: () => {
      toast.success('Profil mis à jour avec succès');
      // Invalider le cache pour forcer le rechargement
      utils.profile.getCurrent.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  const onSubmit = async (data: BasicInfoFormData) => {
    await updateMutation.mutateAsync({
      profileId,
      section: 'basicInfo',
      data: { basicInfo: data },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un genre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Gender.MALE}>Homme</SelectItem>
                    <SelectItem value={Gender.FEMALE}>Femme</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value?.toString()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={updateMutation.isPending}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
