'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import type { Doc } from '@/convex/_generated/dataModel';
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
import { type AgentFormData, AgentSchema } from '@/schemas/user';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';
import { UserRole } from '@/convex/lib/constants';
import { Badge } from '@/components/ui/badge';
import CardContainer from '@/components/layouts/card-container';
import { PhoneInput } from '../ui/phone-input';
import type { Id } from '@/convex/_generated/dataModel';

interface AgentFormProps {
  initialData?: Partial<AgentFormData>;
  countries: Doc<'countries'>[];
  services: Array<Doc<'services'>>;
  managers?: Array<{ id: Id<'users'>; name: string }>;
  agents?: Array<{ id: Id<'memberships'>; name: string }>;
  onSuccess?: () => void;
  isEditMode?: boolean;
  agentId?: Id<'memberships'>;
  organizationId: Id<'organizations'>;
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
  organizationId,
}: AgentFormProps) {
  const t_inputs = useTranslations('inputs');
  const t_common = useTranslations('common');
  const t_messages = useTranslations('messages');
  const [isLoading, setIsLoading] = React.useState(false);
  const [managedAgents, setManagedAgents] = React.useState<string[]>(
    initialData?.managedAgentIds ?? [],
  );

  const addMemberMutation = useMutation(api.functions.membership.addMember);
  const updateMembershipMutation = useMutation(api.functions.membership.updateMembership);
  const createUserMutation = useMutation(api.functions.user.createUser);

  const form = useForm<AgentFormData>({
    resolver: zodResolver(AgentSchema),
    defaultValues: {
      ...initialData,
      countryCodes: initialData?.countryCodes ?? [],
      serviceIds: initialData?.serviceIds ?? [],
      phoneNumber: initialData?.phoneNumber,
      roles: initialData?.roles ?? [UserRole.Agent],
    },
    mode: 'onSubmit',
  });

  const watchedRole = form.watch('roles');

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
        // Update existing membership
        await updateMembershipMutation({
          membershipId: agentId,
          role: data.roles?.[0],
        });

        toast.success(t_messages('success.update'));
        onSuccess?.();
      } else {
        // Create new user
        const userId = await createUserMutation({
          userId: `temp_${Date.now()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          roles: data.roles || [UserRole.Agent],
        });

        // Add membership to organization
        await addMemberMutation({
          userId,
          organizationId,
          role: data.roles?.[0] as string,
          permissions: [],
        });

        toast.success(t_messages('success.create'));
        onSuccess?.();
      }
    } catch (error) {
      toast.error(
        isEditMode ? t_messages('errors.update') : t_messages('errors.create'),
        {
          description:
            error instanceof Error ? error.message : t_messages('errors.create'),
        },
      );
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
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      placeholder={t_inputs('phone.placeholder')}
                      countries={
                        countries?.map((country) => country.code as string) as any
                      }
                      defaultCountry={countries?.[0]?.code as any}
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
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <FormControl>
                    <MultiSelect<UserRole>
                      options={Object.values(UserRole).map((role) => ({
                        label: role,
                        value: role,
                      }))}
                      selected={field.value}
                      type="multiple"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Manager assignment for AGENT role */}
            {watchedRole?.includes(UserRole.Agent) && (
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
            {watchedRole?.includes(UserRole.Manager) && (
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
              name="countryCodes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t_inputs('country.label')}</FormLabel>
                  <FormControl>
                    <MultiSelect<string>
                      placeholder={t_inputs('country.select_placeholder')}
                      options={countries.map((country) => ({
                        label: country.name,
                        value: country.code,
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
                        value: service._id,
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
          <Button type="submit" loading={isLoading}>
            {isEditMode ? t_common('actions.update') : t_common('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
