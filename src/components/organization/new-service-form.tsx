'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
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
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { ServiceCategory } from '@/convex/lib/constants';
import { NewServiceSchema, type NewServiceSchemaInput } from '@/schemas/consular-service';
import { CountrySelect } from '../ui/country-select';
import { CountryCode } from '@/convex/lib/constants';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { ErrorCard } from '../ui/error-card';
import { useServices } from '@/hooks/use-services';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';

interface ServiceFormProps {
  initialData?: Partial<NewServiceSchemaInput>;
  countries: Doc<'countries'>[];
  organizations: Doc<'organizations'>[];
}

export function NewServiceForm({
  initialData,
  countries,
  organizations,
}: ServiceFormProps) {
  const router = useRouter();
  const tInputs = useTranslations('inputs');
  const t = useTranslations('services');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createService } = useServices();

  const isCategoryPreSelected = initialData?.category !== undefined;

  const form = useForm<NewServiceSchemaInput>({
    resolver: zodResolver(NewServiceSchema),
    defaultValues: {
      id: initialData?.id ?? '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || ServiceCategory.CivilStatus,
      organizationId: initialData?.organizationId ?? '',
      countryCode: initialData?.countryCode ?? '',
    },
  });

  const handleSubmit = async (data: NewServiceSchemaInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const serviceId = await createService({
        code: data.id || `SRV-${Date.now()}`,
        name: data.name,
        description: data.description,
        category: data.category,
        organizationId: data.organizationId as Id<'organizations'>,
        countries: data.countryCode ? [data.countryCode] : [],
        steps: [],
        processing: {
          mode: 'online_only' as const,
          appointment: {
            requires: false,
          },
        },
        delivery: {
          modes: [],
        },
        pricing: {
          isFree: true,
        },
      });
      router.push(ROUTES.dashboard.edit_service(serviceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="new-service-name">
                  {t('form.name.label')}
                </FieldLabel>
                <Input
                  {...field}
                  id="new-service-name"
                  placeholder={t('form.name.placeholder')}
                  disabled={isLoading}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="new-service-description">
                  {t('form.description.label')}
                </FieldLabel>
                <Textarea
                  {...field}
                  id="new-service-description"
                  placeholder={t('form.description.placeholder')}
                  disabled={isLoading}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="w-full flex flex-col gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="new-service-category">
                  {tInputs('serviceCategory.label')}
                </FieldLabel>
                <MultiSelect<ServiceCategory>
                  type="single"
                  options={Object.values(ServiceCategory).map((category) => ({
                    label: tInputs(`serviceCategory.options.${category}`),
                    value: category,
                  }))}
                  onChange={field.onChange}
                  selected={field.value}
                  disabled={isLoading || isCategoryPreSelected}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="organizationId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="w-full flex flex-col gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="new-service-organization">
                  {tInputs('organization.label')}
                </FieldLabel>
                <MultiSelect<string>
                  type="single"
                  options={organizations?.map((organization) => ({
                    label: organization.name,
                    value: organization._id,
                  }))}
                  onChange={field.onChange}
                  selected={field.value}
                  disabled={isLoading || Boolean(initialData?.organizationId)}
                  className="min-w-max"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="countryCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="new-service-country">
                  {tInputs('country.label')}
                </FieldLabel>
                <CountrySelect
                  type="single"
                  selected={field.value ? (field.value as unknown as CountryCode) : undefined}
                  onChange={(value) => field.onChange(value as string)}
                  options={countries?.map((item) => item.code as unknown as CountryCode)}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading || !form.formState.isValid}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
        {error && <ErrorCard title={t('messages.error.create')} description={error} />}
      </form>
    </Form>
  );
}
