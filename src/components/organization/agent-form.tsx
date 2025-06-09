'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, User } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { AgentFormData, AgentSchema } from '@/schemas/user';
import { useToast } from '@/hooks/use-toast';

import { createNewAgent } from '@/actions/organizations';
import { updateAgent } from '@/actions/agents';
import { Organization } from '@/types/organization';
import { tryCatch } from '@/lib/utils';
import { PhoneNumberInput } from '../ui/phone-number';
import { CountryCode } from '@/lib/autocomplete-datas';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';
import { UserRole } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import CardContainer from '@/components/layouts/card-container';

interface AgentFormProps {
  initialData?: Partial<AgentFormData>;
  countries: Organization['countries'];
  services: { id: string; name: string }[];
  managers?: { id: string; name: string }[];
  agents?: { id: string; name: string }[];
  onSuccess?: () => void;
  isEditMode?: boolean;
  agentId?: string;
}

export function AgentForm({
  initialData,
  countries = [],
  services = [],
  managers = [],
  agents = [],
  onSuccess,
  isEditMode = false,
  agentId,
}: AgentFormProps) {
  const t_inputs = useTranslations('inputs');
  const t_common = useTranslations('common');
  const t_messages = useTranslations('messages');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [managedAgents, setManagedAgents] = React.useState<string[]>(
    initialData?.managedAgentIds ?? [],
  );

  const form = useForm<AgentFormData>({
    resolver: zodResolver(AgentSchema),
    defaultValues: {
      ...initialData,
      countryIds: initialData?.countryIds ?? [],
      serviceIds: initialData?.serviceIds ?? [],
      phoneNumber: initialData?.phoneNumber ?? '+33-',
      role: initialData?.role ?? UserRole.AGENT,
    },
    mode: 'onSubmit',
  });

  const watchedRole = form.watch('role');

  // Find current manager info for display
  const currentManager = React.useMemo(() => {
    if (initialData?.managedByUserId && managers.length > 0) {
      return managers.find((m) => m.id === initialData.managedByUserId);
    }
    return null;
  }, [initialData?.managedByUserId, managers]);

  async function onSubmit(data: AgentFormData) {
    setIsLoading(true);

    try {
      if (isEditMode && agentId) {
        // Update existing agent
        const updateData = {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phoneNumber: data.phoneNumber,
          countryIds: data.countryIds,
          serviceIds: watchedRole === UserRole.AGENT ? data.serviceIds : [],
          managedByUserId:
            watchedRole === UserRole.AGENT ? data.managedByUserId : undefined,
          role: data.role,
          managedAgentIds: watchedRole === UserRole.MANAGER ? managedAgents : [],
        };

        const result = await tryCatch(updateAgent(agentId, updateData));

        if (result.data) {
          toast({
            title: t_messages('success.update'),
            variant: 'success',
          });
          onSuccess?.();
        } else if (result.error) {
          toast({
            title: t_messages('errors.update'),
            description: `${result.error.message}`,
            variant: 'destructive',
          });
        }
      } else {
        // Create new agent
        const createData = {
          ...data,
          managedAgentIds: watchedRole === UserRole.MANAGER ? managedAgents : [],
        };

        const result = await tryCatch(createNewAgent(createData));

        if (result.data) {
          toast({
            title: t_messages('success.create'),
            variant: 'success',
          });
          onSuccess?.();
        } else if (result.error) {
          toast({
            title: t_messages('errors.create'),
            description: `${result.error.message}`,
            variant: 'destructive',
          });
        }
      }
    } catch {
      toast({
        title: isEditMode ? t_messages('errors.update') : t_messages('errors.create'),
        description: t_messages('errors.create'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations personnelles */}
        <CardContainer
          title="Informations personnelles"
          subtitle="Renseignez les informations de base de l'agent"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className={'col-span-full lg:col-span-1'}>
                  <FormLabel>{t_inputs('firstName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t_inputs('firstName.placeholder')}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className={'col-span-full lg:col-span-1'}>
                  <FormLabel>{t_inputs('lastName.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t_inputs('lastName.placeholder')}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className={'col-span-full'}>
                  <FormLabel>{t_inputs('email.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t_inputs('email.placeholder')}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>{t_inputs('phone.label')}</FormLabel>
                  <FormControl>
                    <PhoneNumberInput
                      value={field.value ?? '+33-'}
                      onChangeAction={field.onChange}
                      disabled={isLoading}
                      options={countries.map((country) => country.code as CountryCode)}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContainer>

        {/* Rôle et hiérarchie */}
        <CardContainer
          title="Rôle et hiérarchie"
          subtitle="Définissez le rôle et les relations hiérarchiques"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.AGENT}>Agent</SelectItem>
                        <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Manager assignment for AGENT role */}
            {watchedRole === UserRole.AGENT && (
              <div className="space-y-4">
                {/* Current manager display (edit mode) */}
                {isEditMode && currentManager && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Manager actuel</span>
                    </div>
                    <Badge variant="outline" className="mb-2">
                      {currentManager.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Pour changer de manager, contactez un administrateur
                    </p>
                  </div>
                )}

                {/* Manager selection (create mode or if no current manager) */}
                {(!isEditMode || !currentManager) && managers.length > 0 && (
                  <FormField
                    control={form.control}
                    name="managedByUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager (optionnel)</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value || 'none'}
                            onValueChange={(value) => {
                              // Handle clearing selection
                              field.onChange(value === 'none' ? undefined : value);
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un manager" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucun manager</SelectItem>
                              {managers.map((manager) => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Agent assignment for MANAGER role */}
            {watchedRole === UserRole.MANAGER && (
              <FormField
                control={form.control}
                name="managedAgentIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Agents à superviser</FormLabel>
                    <FormControl>
                      <MultiSelect<string>
                        placeholder="Sélectionner les agents"
                        options={agents.map((agent) => ({
                          label: agent.name,
                          value: agent.id,
                        }))}
                        selected={managedAgents}
                        onChange={setManagedAgents}
                        type={'multiple'}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                    {managedAgents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          Agents sélectionnés ({managedAgents.length}) :
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {managedAgents.map((agentId) => {
                            const agent = agents.find((a) => a.id === agentId);
                            return agent ? (
                              <Badge key={agentId} variant="secondary">
                                {agent.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />
            )}
          </div>
        </CardContainer>

        {/* Assignations géographiques et services */}
        <CardContainer
          title="Assignations"
          subtitle="Définissez les pays et services assignés"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="countryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('country.label')}</FormLabel>
                  <FormControl>
                    <MultiSelect<string>
                      placeholder={t_inputs('country.select_placeholder')}
                      options={countries.map((country) => ({
                        label: country.name,
                        value: country.id,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      type={'multiple'}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services (optionnel)</FormLabel>
                  <FormControl>
                    <MultiSelect<string>
                      placeholder="Sélectionner les services"
                      options={services.map((service) => ({
                        label: service.name,
                        value: service.id,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      type={'multiple'}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContainer>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEditMode ? t_common('actions.update') : t_common('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
