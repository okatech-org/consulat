'use client';

import { DynamicFieldsEditor } from '@/components/organization/dynamic-fields-editor';
import { Button } from '@/components/ui/button';
import { CountrySelect } from '@/components/ui/country-select';
import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTabs } from '@/hooks/use-tabs';
import { toast } from 'sonner';
import { filterUneditedKeys, getValuable } from '@/lib/utils';
import {
  ServiceSchema,
  type ServiceSchemaInput,
  ServiceStepSchema,
} from '@/schemas/consular-service';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DeliveryMode,
  DocumentType,
  ServiceCategory,
  ServiceStepType,
} from '@/convex/lib/constants';
import { useServices } from '@/hooks/use-services';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { profileFields } from '@/types/profile';
import type { CountryCode } from '@/convex/lib/constants';
import type { z } from 'zod';

type ServiceStep = z.infer<typeof ServiceStepSchema>;
import { ArrowUp, Plus, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CardContainer from '../layouts/card-container';

interface ServiceFormProps {
  organizations: Doc<'organizations'>[];
  countries: Doc<'countries'>[];
  service: Partial<ServiceSchemaInput>;
}

type Tab =
  | 'general'
  | 'documents'
  | 'delivery'
  | 'pricing'
  | 'steps'
  | 'documentGeneration';

export function ConsularServiceForm({
  organizations,
  service,
  countries,
}: ServiceFormProps) {
  const t = useTranslations('services');
  const t_inputs = useTranslations('inputs');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { currentTab, handleTabChange } = useTabs<Tab>('tab', 'general');

  const cleanedService = getValuable(service);

  const form = useForm<ServiceSchemaInput>({
    resolver: zodResolver(ServiceSchema),

    defaultValues: { ...cleanedService },
  });

  const { updateService } = useServices();

  const handleSubmit = async (data: ServiceSchemaInput) => {
    setIsLoading(true);
    try {
      if (service._id) {
        filterUneditedKeys(data, form.formState.dirtyFields, ['id', 'steps']);
        await updateService({
          serviceId: service._id as Id<'services'>,
          name: data.name,
          code: data.id,
          description: data.description,
        });
      }
      toast({ title: t('messages.updateSuccess'), variant: 'success' });
      router.refresh();
    } catch (error) {
      toast({
        title: t('messages.error.update'),
        description: `${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const serviceSteps: ServiceStep[] = form.watch('steps');

  function handleDeliveryModeChange(value: DeliveryMode[]) {
    if (value.includes(DeliveryMode.InPerson) || value.includes(DeliveryMode.ByProxy)) {
      form.setValue('deliveryAppointment', true, { shouldDirty: true });
      form.setValue('deliveryAppointmentDesc', '', { shouldDirty: true });
      form.setValue('deliveryAppointmentDuration', 15, { shouldDirty: true });
    } else {
      form.setValue('deliveryAppointment', false, { shouldDirty: true });
      form.setValue('deliveryAppointmentDesc', undefined, { shouldDirty: true });
      form.setValue('deliveryAppointmentDuration', undefined, { shouldDirty: true });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={'flex h-full flex-col space-y-4'}
      >
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className={'mb-4 flex flex-wrap gap-2 w-max'}>
            <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
            <TabsTrigger value="documents">{t('tabs.documents')}</TabsTrigger>
            <TabsTrigger value="delivery">{t('tabs.delivery')}</TabsTrigger>
            <TabsTrigger value="pricing">{t('tabs.pricing')}</TabsTrigger>
            <TabsTrigger value="steps">{t('tabs.steps')}</TabsTrigger>
          </TabsList>

          <CardContainer>
            <TabsContent value="general" className={'space-y-6'}>
              {/* Informations générales */}

              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="service-edit-name">
                        {t('form.name.label')}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="service-edit-name"
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
                      <FieldLabel htmlFor="service-edit-description">
                        {t('form.description.label')}
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="service-edit-description"
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
                      <FieldLabel htmlFor="service-edit-category">
                        {t_inputs('serviceCategory.label')}
                      </FieldLabel>
                      <MultiSelect<ServiceCategory>
                        id="service-edit-category"
                        type="single"
                        options={Object.values(ServiceCategory).map((category) => ({
                          label: t_inputs(`serviceCategory.options.${category}`),
                          value: category,
                        }))}
                        onChange={field.onChange}
                        selected={field.value}
                        disabled={isLoading}
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
                      <FieldLabel htmlFor="service-edit-organization">
                        {t_inputs('organization.label')}
                      </FieldLabel>
                      <MultiSelect<string>
                        id="service-edit-organization"
                        type="single"
                        options={organizations?.map((organization) => ({
                          label: organization.name,
                          value: organization._id || organization.id,
                        }))}
                        onChange={field.onChange}
                        selected={field.value}
                        disabled={
                          isLoading || Boolean(service?._id || service?.organizationId)
                        }
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
                      <FieldLabel htmlFor="service-edit-country">
                        {t_inputs('country.label')}
                      </FieldLabel>
                      <CountrySelect
                        id="service-edit-country"
                        type="single"
                        selected={
                          field.value ? (field.value as CountryCode) : undefined
                        }
                        onChange={(value) => field.onChange(value)}
                        options={countries?.map((item) => item.code as CountryCode)}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </TabsContent>

            <TabsContent value="documents" className={'space-y-6'}>
              {/* Configuration des documents */}
              <FieldGroup>
                <Controller
                  name="requiredDocuments"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="service-edit-required-docs">
                        {t('form.required_documents.label')}
                      </FieldLabel>
                      <MultiSelect<DocumentType>
                        id="service-edit-required-docs"
                        type={'multiple'}
                        options={Object.values(DocumentType).map((type) => ({
                          label: t(`documents.${type.toLowerCase()}`),
                          value: type,
                        }))}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder={t('form.required_documents.placeholder')}
                        searchPlaceholder={t('form.required_documents.search')}
                        emptyText={t('form.required_documents.empty')}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="optionalDocuments"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="service-edit-optional-docs">
                        {t('form.optional_documents.label')}
                      </FieldLabel>
                      <MultiSelect<DocumentType>
                        id="service-edit-optional-docs"
                        options={Object.values(DocumentType).map((type) => ({
                          label: t(`documents.${type.toLowerCase()}`),
                          value: type,
                        }))}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder={t('form.required_documents.placeholder')}
                        searchPlaceholder={t('form.required_documents.search')}
                        emptyText={t('form.required_documents.empty')}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </TabsContent>

            <TabsContent value="delivery">
              <div className="space-y-6">
                {/* Configuration des rendez-vous */}
                <Controller
                  name="requiresAppointment"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="flex flex-row gap-2 items-center justify-between rounded-lg border p-4 w-max" data-invalid={fieldState.invalid}>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                      <div className="space-y-0.5">
                        <FieldLabel htmlFor="service-edit-requires-appointment">
                          {t_inputs('appointment.presidential.label')}
                        </FieldLabel>
                        <FieldDescription>
                          {t_inputs('appointment.presidential.description')}
                        </FieldDescription>
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {form.watch('requiresAppointment') && (
                  <div className="space-y-4">
                    <Controller
                      name="appointmentDuration"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="service-edit-appointment-duration">
                            {t_inputs('appointment.duration.label')}
                          </FieldLabel>
                          <Input
                            id="service-edit-appointment-duration"
                            type="number"
                            min={15}
                            step={5}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder={t_inputs('appointment.duration.placeholder')}
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldDescription>
                            {t_inputs('appointment.duration.description')}
                          </FieldDescription>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <Controller
                      name="appointmentInstructions"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="service-edit-appointment-instructions">
                            {t_inputs('appointment.instructions.label')}
                          </FieldLabel>
                          <Textarea
                            {...field}
                            id="service-edit-appointment-instructions"
                            placeholder={t_inputs(
                              'appointment.instructions.placeholder',
                            )}
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldDescription>
                            {t_inputs('appointment.instructions.description')}
                          </FieldDescription>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </div>
                )}

                <Separator />

                {/* Modes de livraison */}
                <Controller
                  name="deliveryMode"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="service-edit-delivery-mode">
                        {t('form.delivery.modes.label')}
                      </FieldLabel>
                      <MultiSelect<DeliveryMode>
                        id="service-edit-delivery-mode"
                        type={'multiple'}
                        options={Object.values(DeliveryMode).map((mode) => ({
                          label: t(`form.delivery.modes.options.${mode.toLowerCase()}`),
                          value: mode,
                        }))}
                        selected={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          handleDeliveryModeChange(value);
                        }}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {form.watch('deliveryMode').includes(DeliveryMode.InPerson) && (
                  <Controller
                    name="deliveryAppointmentDesc"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="service-edit-delivery-appointment-desc">
                          {t('form.delivery.appointment.instructions')}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="service-edit-delivery-appointment-desc"
                          placeholder={t('form.delivery.appointment.description')}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                )}

                {form.watch('deliveryMode').includes(DeliveryMode.ByProxy) && (
                  <Controller
                    name="proxyRequirements"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="service-edit-proxy-requirements">
                          {t('form.delivery.proxy.requirements.label')}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="service-edit-proxy-requirements"
                          placeholder={t(
                            'form.delivery.proxy.requirements.placeholder',
                          )}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="pricing">
              <div className="space-y-6">
                <Controller
                  name="isFree"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="flex flex-row gap-2 w-max items-center justify-between" data-invalid={fieldState.invalid}>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                        }}
                        disabled={isLoading}
                      />
                      <div className="space-y-0.5">
                        <FieldLabel htmlFor="service-edit-is-free">
                          {t('form.pricing.label')}
                        </FieldLabel>
                        <FieldDescription>{t('form.pricing.description')}</FieldDescription>
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {form.watch('isFree') === true && (
                  <FieldGroup>
                    <Controller
                      name="price"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="service-edit-price">
                            {t('form.pricing.label')}
                          </FieldLabel>
                          <Input
                            id="service-edit-price"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder={t('form.price.placeholder')}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <Controller
                      name="currency"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="service-edit-currency">
                            {t('form.pricing.currency.label')}
                          </FieldLabel>
                          <MultiSelect<string>
                            id="service-edit-currency"
                            options={[
                              { value: 'EUR', label: 'EUR' },
                              { value: 'XAF', label: 'XAF' },
                              { value: 'USD', label: 'USD' },
                            ]}
                            selected={field.value}
                            onChange={field.onChange}
                            type={'single'}
                            placeholder={t('form.pricing.currency.placeholder')}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                )}
              </div>
            </TabsContent>

            <TabsContent value="steps">
              <div className="space-y-6">
                {/* Liste des étapes existantes */}
                <div className="space-y-4">
                  {serviceSteps.map((step, index) => (
                    <CardContainer
                      key={index + `${step?.id ?? ''}`}
                      title={step.title || t('form.steps.untitled')}
                      action={
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            leftIcon={<ArrowUp className="size-4" />}
                            onClick={() => {
                              const steps = form.getValues('steps');
                              if (index > 0) {
                                const newSteps = [...steps];
                                [newSteps[index - 1], newSteps[index]] = [
                                  newSteps[index],
                                  newSteps[index - 1],
                                ];
                                form.setValue('steps', newSteps);
                              }
                            }}
                            disabled={index === 0}
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            leftIcon={<Trash className="size-4" />}
                            onClick={() => {
                              const steps = form.getValues('steps');
                              const newSteps = steps.filter(
                                (_: never, i: number) => i !== index,
                              );
                              form.setValue('steps', newSteps);
                            }}
                          />
                        </div>
                      }
                    >
                      <div className="space-y-4">
                        <Controller
                          name={`steps.${index}.title`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={`service-step-${index}-title`}>
                                {t('form.steps.title')}
                              </FieldLabel>
                              <Input
                                id={`service-step-${index}-title`}
                                placeholder={t('form.steps.step.title.placeholder')}
                                {...field}
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        <Controller
                          name={`steps.${index}.description`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={`service-step-${index}-description`}>
                                {t('form.steps.step.description.label')}
                              </FieldLabel>
                              <Textarea
                                id={`service-step-${index}-description`}
                                placeholder={t(
                                  'form.steps.step.description.placeholder',
                                )}
                                {...field}
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        {/* Éditeur de champs dynamiques */}
                        {step.type === ServiceStepType.Form && (
                          <DynamicFieldsEditor
                            fields={step.fields}
                            onChange={(fields) => {
                              form.setValue(`steps.${index}.fields`, fields);
                            }}
                            profileFields={profileFields}
                          />
                        )}
                      </div>
                    </CardContainer>
                  ))}
                </div>

                {/* Bouton pour ajouter une étape */}
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<Plus className="size-4" />}
                  onClick={() => {
                    const steps = form.getValues('steps') || [];
                    form.setValue('steps', [
                      ...steps,
                      {
                        title: '',
                        type: ServiceStepType.Form,
                        isRequired: true,
                        description: '',
                        order: steps.length,
                        fields: [],
                      },
                    ]);
                  }}
                >
                  {t('form.steps.add')}
                </Button>
              </div>
            </TabsContent>
          </CardContainer>
        </Tabs>

        <div className="gap-4 lg:flex lg:justify-end">
          <Button type="submit" loading={isLoading} className={'w-full lg:w-max'}>
            {service ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
