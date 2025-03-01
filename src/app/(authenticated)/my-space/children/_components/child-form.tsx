import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Gender, ParentalRole } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent } from '@/components/ui/card';

// Schéma de validation pour le formulaire enfant
const childProfileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit comporter au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
  gender: z.nativeEnum(Gender, {
    required_error: 'Le genre est requis',
  }),
  birthDate: z.date({
    required_error: 'La date de naissance est requise',
  }),
  birthPlace: z.string().min(2, 'Le lieu de naissance est requis'),
  birthCountry: z.string().min(2, 'Le pays de naissance est requis'),
  nationality: z.string().min(2, 'La nationalité est requise'),
  parentRole: z.nativeEnum(ParentalRole, {
    required_error: 'Votre lien parental est requis',
  }),
});

export type ChildProfileFormData = z.infer<typeof childProfileSchema>;

interface ChildFormProps {
  onSubmit: (data: ChildProfileFormData) => void;
  isLoading?: boolean;
}

export function ChildForm({ onSubmit, isLoading = false }: ChildFormProps) {
  const t = useTranslations('user.children');

  const form = useForm<ChildProfileFormData>({
    resolver: zodResolver(childProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: Gender.MALE,
      birthPlace: '',
      birthCountry: 'France',
      nationality: 'Gabon',
      parentRole: ParentalRole.FATHER,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations d'identité */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">{t('form.identity_section')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.first_name')}</FormLabel>
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
                    <FormLabel>{t('form.last_name')}</FormLabel>
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
                    <FormLabel>{t('form.gender')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.select_gender')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Gender.MALE}>{t('form.male')}</SelectItem>
                        <SelectItem value={Gender.FEMALE}>{t('form.female')}</SelectItem>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('form.birth_date')}</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations de naissance et nationalité */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">
              {t('form.birth_nationality_section')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="birthPlace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.birth_place')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.birth_country')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.nationality')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations de lien parental */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">{t('form.parental_section')}</h3>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="parentRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.parent_role')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.select_role')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ParentalRole.FATHER}>
                          {t('form.father')}
                        </SelectItem>
                        <SelectItem value={ParentalRole.MOTHER}>
                          {t('form.mother')}
                        </SelectItem>
                        <SelectItem value={ParentalRole.LEGAL_GUARDIAN}>
                          {t('form.legal_guardian')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>{t('form.parent_role_description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {t('form.submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
