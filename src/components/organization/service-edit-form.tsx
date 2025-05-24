'use client';

import { updateService } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import { GenerateDocumentSettingsForm } from '@/components/document-generation/generate-document-settings-form';
import { DynamicFieldsEditor } from '@/components/organization/dynamic-fields-editor';
import { Button } from '@/components/ui/button';
import { CountrySelect } from '@/components/ui/country-select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTabs } from '@/hooks/use-tabs';
import { useToast } from '@/hooks/use-toast';
import { filterUneditedKeys, getValuable } from '@/lib/utils';
import { ServiceSchema, ServiceSchemaInput } from '@/schemas/consular-service';
import { ConsularServiceItem, ServiceStep } from '@/types/consular-service';
import { Country } from '@/types/country';
import { OrganizationListingItem } from '@/types/organization';
import { profileFields } from '@/types/profile';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DeliveryMode,
  DocumentTemplate,
  DocumentType,
  RequestStatus,
  ServiceCategory,
  ServiceStepType,
} from '@prisma/client';
import { ArrowUp, Loader2, Plus, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CardContainer from '../layouts/card-container';

interface ServiceFormProps {
  organizations: OrganizationListingItem[];
  countries: Country[];
  service: Partial<ConsularServiceItem>;
  documentTemplates: DocumentTemplate[];
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
  documentTemplates,
}: ServiceFormProps) {
  const t = useTranslations('services');
  const t_inputs = useTranslations('inputs');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { currentTab, handleTabChange } = useTabs<Tab>('tab', 'general');

  const cleanedService = getValuable(service);

  const form = useForm<typeof ServiceSchema>({
    resolver: zodResolver(ServiceSchema),
    // eslint-disable-next-line
    defaultValues: {
      ...cleanedService,
    },
  });

  const handleSubmit = async (data: ServiceSchemaInput) => {
    setIsLoading(true);
    try {
      if (service.id) {
        filterUneditedKeys(data, form.formState.dirtyFields, ['id', 'steps']);
      }

      const result = await updateService(data);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: t('messages.updateSuccess'),
        variant: 'success',
      });
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

  console.log({ cleanedService });

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
            <TabsTrigger value="documentGeneration">
              {t('tabs.documentGeneration')}
            </TabsTrigger>
          </TabsList>

          <CardContainer>
            <TabsContent value="general" className={'space-y-6'}>
              {/* Informations générales */}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.name.label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.name.placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.description.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('form.description.placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col gap-2">
                    <FormLabel>{t_inputs('serviceCategory.label')}</FormLabel>
                    <MultiSelect<ServiceCategory>
                      type="single"
                      options={Object.values(ServiceCategory).map((category) => ({
                        label: t_inputs(`serviceCategory.options.${category}`),
                        value: category,
                      }))}
                      onChange={field.onChange}
                      selected={field.value}
                      disabled={isLoading}
                    />
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col gap-2">
                    <FormLabel>{t_inputs('organization.label')}</FormLabel>
                    <MultiSelect<string>
                      type="single"
                      options={organizations?.map((organization) => ({
                        label: organization.name,
                        value: organization.id,
                      }))}
                      onChange={field.onChange}
                      selected={field.value}
                      disabled={isLoading || Boolean(service?.organizationId)}
                      className="min-w-max"
                    />
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('country.label')}</FormLabel>
                    <FormControl>
                      <CountrySelect
                        type="single"
                        selected={field.value as CountryCode}
                        onChange={(value) => field.onChange(value)}
                        options={countries?.map((item) => item.code as CountryCode)}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="documents" className={'space-y-6'}>
              {/* Configuration des documents */}
              <FormField
                control={form.control}
                name="requiredDocuments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.required_documents.label')}</FormLabel>
                    <MultiSelect<DocumentType>
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
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="optionalDocuments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.optional_documents.label')}</FormLabel>
                    <MultiSelect<DocumentType>
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
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="delivery">
              <div className="space-y-6">
                {/* Configuration des rendez-vous */}
                <FormField
                  control={form.control}
                  name="requiresAppointment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row gap-2 items-center justify-between rounded-lg border p-4 w-max">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel>
                          {t_inputs('appointment.presidential.label')}
                        </FormLabel>
                        <FormDescription>
                          {t_inputs('appointment.presidential.description')}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('requiresAppointment') && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="appointmentDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t_inputs('appointment.duration.label')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={15}
                              step={5}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              placeholder={t_inputs('appointment.duration.placeholder')}
                            />
                          </FormControl>
                          <FormDescription>
                            {t_inputs('appointment.duration.description')}
                          </FormDescription>
                          <TradFormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="appointmentInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t_inputs('appointment.instructions.label')}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t_inputs(
                                'appointment.instructions.placeholder',
                              )}
                            />
                          </FormControl>
                          <FormDescription>
                            {t_inputs('appointment.instructions.description')}
                          </FormDescription>
                          <TradFormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Separator />

                {/* Modes de livraison */}
                <FormField
                  control={form.control}
                  name="deliveryMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.delivery.modes.label')}</FormLabel>
                      <MultiSelect<DeliveryMode>
                        type={'multiple'}
                        options={Object.values(DeliveryMode).map((mode) => ({
                          label: t(`form.delivery.modes.options.${mode.toLowerCase()}`),
                          value: mode,
                        }))}
                        selected={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('deliveryMode').includes(DeliveryMode.IN_PERSON) && (
                  <FormField
                    control={form.control}
                    name="deliveryAppointmentDesc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('form.delivery.appointment.instructions')}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('form.delivery.appointment.description')}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Options de proxy */}
                {form.watch('deliveryMode').includes(DeliveryMode.BY_PROXY) && (
                  <FormField
                    control={form.control}
                    name="proxyRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('form.delivery.proxy.requirements.label')}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t(
                              'form.delivery.proxy.requirements.placeholder',
                            )}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="pricing">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row gap-2 w-max items-center justify-between">
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={(value) => {
                            field.onChange(value);
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel>{t('form.pricing.label')}</FormLabel>
                        <FormDescription>{t('form.pricing.description')}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('isFree') === true && (
                  <>
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.pricing.label')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              placeholder={t('form.price.placeholder')}
                            />
                          </FormControl>
                          <TradFormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.pricing.currency.label')}</FormLabel>
                          <MultiSelect<string>
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
                          <TradFormMessage />
                        </FormItem>
                      )}
                    />
                  </>
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
                            size="sm"
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
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const steps = form.getValues('steps');
                              const newSteps = steps.filter(
                                (_: never, i: number) => i !== index,
                              );
                              form.setValue('steps', newSteps);
                            }}
                          >
                            <Trash className="size-4" />
                          </Button>
                        </div>
                      }
                    >
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`steps.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('form.steps.title')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('form.steps.step.title.placeholder')}
                                  {...field}
                                />
                              </FormControl>
                              <TradFormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`steps.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t('form.steps.step.description.label')}
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t(
                                    'form.steps.step.description.placeholder',
                                  )}
                                  {...field}
                                />
                              </FormControl>
                              <TradFormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Éditeur de champs dynamiques */}
                        {step.type === ServiceStepType.FORM && (
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
                  onClick={() => {
                    const steps = form.getValues('steps') || [];
                    form.setValue('steps', [
                      ...steps,
                      {
                        title: '',
                        type: ServiceStepType.FORM,
                        isRequired: true,
                        description: '',
                        order: steps.length,
                        fields: [],
                      },
                    ]);
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  {t('form.steps.add')}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="documentGeneration">
              <FormField
                control={form.control}
                name={`generateDocumentSettings`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.steps.step.description.label')}</FormLabel>
                    <FormControl>
                      <GenerateDocumentSettingsForm
                        templates={documentTemplates}
                        statuses={Object.values(RequestStatus)}
                        steps={serviceSteps}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </CardContainer>
        </Tabs>

        <div className="gap-4 lg:flex lg:justify-end">
          <Button type="submit" disabled={isLoading} className={'w-full lg:w-max'}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {service ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
