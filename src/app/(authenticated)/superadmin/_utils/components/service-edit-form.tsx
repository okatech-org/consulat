'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  ServiceCategory,
  DocumentType,
  ProcessingMode,
  DeliveryMode,
  ServiceStepType,
  ConsularService,
} from '@prisma/client'
import { CreateServiceSchema } from '@/schemas/consular-service'
import { Organization } from '@/types/organization'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, ArrowUp, Trash } from 'lucide-react'
import { CreateServiceInput } from '@/types/consular-service'
import { MultiSelect } from '@/components/ui/multi-select'
import { useEffect, useState } from 'react'
import { updateService } from '@/app/(authenticated)/superadmin/_utils/actions/services'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DynamicFieldsEditor } from '@/app/(authenticated)/superadmin/_utils/components/dynamic-fields-editor'
import { profileFields } from '@/types/profile'

interface ServiceFormProps {
  organizations: Organization[]
  service: ConsularService
}

export function ServiceEditForm({ organizations, service }: ServiceFormProps) {
  const t = useTranslations('superadmin.services')
  const t_inputs = useTranslations('inputs')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(CreateServiceSchema),
    defaultValues: {
      name: service?.name,
      description: service?.description,
      category: service?.category,
      // Configuration
      requiredDocuments: service?.requiredDocuments || [],
      optionalDocuments: service?.optionalDocuments || [],
      requiresAppointment: service?.requiresAppointment || false,
      appointmentDuration: service?.appointmentDuration || 30,
      appointmentInstructions: service?.appointmentInstructions || '',
      // Mode de traitement
      processingMode: service?.processingMode || ProcessingMode.PRESENCE_REQUIRED,
      deliveryMode: service?.deliveryMode || [],
      // Options de proxy
      allowsProxy: service?.allowsProxy || false,
      proxyRequirements: service?.proxyRequirements || '',
      // Options postales
      postalDeliveryAvailable: service?.postalDeliveryAvailable || false,
      postalRequirements: service?.postalRequirements || '',
      postalFees: service?.postalFees || 0,
      // Tarification
      price: service?.price || 0,
      currency: service?.currency || 'EUR',
      steps: service?.steps || [],
    }
  })

  const handleSubmit = form.handleSubmit(async (data: CreateServiceInput) => {
    setIsLoading(true)
    try {
      console.log("CreateServiceInput", data)
      const result = await updateService(service.id, data)
      if (result.error) {
        throw new Error(result.error)
      }
      toast({
        title: t('messages.createSuccess'),
        variant: 'success',
      })
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: t('messages.error.create'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    console.log(form.getValues())
    console.log(form.formState.errors)
  }, [form.formState])


  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={"flex h-full flex-col space-y-4"}>
        <Tabs defaultValue="general" className={"grow"}>
          <TabsList className={"mb-4"}>
            <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
            <TabsTrigger value="documents">{t('tabs.documents')}</TabsTrigger>
            <TabsTrigger value="appointment">{t('tabs.appointment')}</TabsTrigger>
            <TabsTrigger value="delivery">{t('tabs.delivery')}</TabsTrigger>
            <TabsTrigger value="pricing">{t('tabs.pricing')}</TabsTrigger>
            <TabsTrigger value="steps">{t('tabs.steps')}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className={"space-y-6"}>
            {/* Informations générales */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name.label')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('name.placeholder')} disabled={isLoading} />
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
                    <Textarea {...field} placeholder={t('form.description.placeholder')} disabled={isLoading} />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.category.label')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.category.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ServiceCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`categories.${category.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TradFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.organization.label')}</FormLabel>
                  <MultiSelect<string>
                    options={
                      organizations.map((org) => ({
                        label: org.name,
                        value: org.id
                      }))
                    }
                    selected={field.value ? [field.value] : []}
                    onChange={
                      (values) => {
                        if (values.length > 0) {
                          field.onChange(values[0])
                        }
                      }
                    }
                    type={"single"}
                  />
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="documents" className={"space-y-6"}>
            {/* Configuration des documents */}
            <FormField
              control={form.control}
              name="requiredDocuments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.required_documents.label')}</FormLabel>
                  <MultiSelect<DocumentType>
                    options={Object.values(DocumentType).map((type) => ({
                      label: t(`documents.${type.toLowerCase()}`),
                      value: type
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
                  <MultiSelect
                    options={Object.values(DocumentType).map((type) => ({
                      label: t(`documents.${type.toLowerCase()}`),
                      value: type
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

          <TabsContent value="appointment" className={"space-y-6"}>
            {/* Configuration des rendez-vous */}
            <FormField
              control={form.control}
              name="requiresAppointment"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>{t_inputs('appointment.required.label')}</FormLabel>
                    <FormDescription>
                      {t_inputs('appointment.required.description')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
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
                      <FormLabel>{t_inputs('appointment.instructions.label')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t_inputs('appointment.instructions.placeholder')}
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
          </TabsContent>

          <TabsContent value="delivery">
            <div className="space-y-6">
              {/* Modes de livraison */}
              <FormField
                control={form.control}
                name="deliveryMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.delivery.modes.label')}</FormLabel>
                    <MultiSelect
                      options={Object.values(DeliveryMode).map((mode) => ({
                        label: t(`form.delivery.modes.options.${mode.toLowerCase()}`),
                        value: mode,
                      }))}
                      selected={field.value}
                      onChange={(value) => {
                        field.onChange(value)

                        // Si le mode de livraison par proxy est sélectionné, on active l'option de proxy
                        if (value.includes(DeliveryMode.BY_PROXY)) {
                          form.setValue('allowsProxy', true)
                        } else {
                          form.setValue('allowsProxy', false)
                        }

                        // Si le mode de livraison par poste est sélectionné, on active l'option de livraison postale
                        if (value.includes(DeliveryMode.POSTAL)) {
                          form.setValue('postalDeliveryAvailable', true)
                        } else {
                          form.setValue('postalDeliveryAvailable', false)
                        }
                      }}
                    />
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              {/* Options de proxy */}
              {form.watch('deliveryMode').includes(DeliveryMode.BY_PROXY) && (
                <div className={"rounded-lg border p-4 space-y-4"}>
                  <FormField
                    control={form.control}
                    name="allowsProxy"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>{t('form.delivery.proxy.allows')}</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              const deliveryMode = form.getValues('deliveryMode')
                              field.onChange(value)

                              if (value) {
                                form.setValue('deliveryMode', [...deliveryMode, DeliveryMode.BY_PROXY])
                              } else {
                                form.setValue('deliveryMode', deliveryMode.filter((mode) => mode !== DeliveryMode.BY_PROXY))
                              }
                            }}
                            disabled={isLoading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proxyRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.delivery.proxy.requirements.label')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('form.delivery.proxy.requirements.placeholder')}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {form.watch('deliveryMode').includes(DeliveryMode.POSTAL) && (
                <div className={"rounded-lg border p-4 space-y-4"}>
                  <FormField
                    control={form.control}
                    name="postalDeliveryAvailable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>{t('form.delivery.postal.available')}</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={true}
                            onCheckedChange={(value) => {
                              const deliveryMode = form.getValues('deliveryMode')
                              field.onChange(value)

                              if (value) {
                                form.setValue('deliveryMode', [...deliveryMode, DeliveryMode.POSTAL])
                              } else {
                                form.setValue('deliveryMode', deliveryMode.filter((mode) => mode !== DeliveryMode.POSTAL))
                              }
                            }}
                            disabled={isLoading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.delivery.postal.requirements.label')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('form.delivery.postal.requirements.placeholder')}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalFees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.delivery.postal.fees.label')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder={t('form.delivery.postal.fees.placeholder')}
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )
              }
            </div>
          </TabsContent>

          <TabsContent value="pricing">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.pricing.price.label')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder={t('form.pricing.price.placeholder')}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.pricing.currency.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="XAF">XAF</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="steps">
            <div className="space-y-6">
              {/* Liste des étapes existantes */}
              <div className="space-y-4">
                {form.watch('steps')?.map((step, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base">
                        {step.title || t('form.steps.untitled')}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const steps = form.getValues('steps');
                            if (index > 0) {
                              const newSteps = [...steps];
                              [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
                              form.setValue('steps', newSteps);
                            }
                          }}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const steps = form.getValues('steps');
                            const newSteps = steps.filter((_, i) => i !== index);
                            form.setValue('steps', newSteps);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
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
                              <FormLabel>{t('form.steps.step.description.label')}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t('form.steps.step.description.placeholder')}
                                  {...field} />
                              </FormControl>
                              <TradFormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Éditeur de champs dynamiques */}
                        {step.type === ServiceStepType.FORM && (
                          <DynamicFieldsEditor
                            fields={step.fields || []}
                            onChange={(fields) => {
                              form.setValue(`steps.${index}.fields`, fields);
                            }}
                            profileFields={profileFields}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                      order: steps.length,
                      fields: []
                    }
                  ]);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('form.steps.add')}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="gap-4 lg:flex lg:justify-end">
          <Button type="submit" disabled={isLoading} className={"w-full lg:w-max"}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {service ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}