'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, User } from 'lucide-react';
import type { Doc } from '@/convex/_generated/dataModel';
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
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="col-span-full lg:col-span-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="agent-firstName">
                    {t_inputs('firstName.label')}
                  </FieldLabel>
                  <Input
                    id="agent-firstName"
                    placeholder={t_inputs('firstName.placeholder')}
                    {...field}
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
                <Field className="col-span-full lg:col-span-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="agent-lastName">
                    {t_inputs('lastName.label')}
                  </FieldLabel>
                  <Input
                    id="agent-lastName"
                    placeholder={t_inputs('lastName.placeholder')}
                    {...field}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="col-span-full" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="agent-email">
                    {t_inputs('email.label')}
                  </FieldLabel>
                  <Input
                    id="agent-email"
                    placeholder={t_inputs('email.placeholder')}
                    {...field}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="col-span-full" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="agent-phone">
                    {t_inputs('phone.label')}
                  </FieldLabel>
                  <PhoneInput
                    id="agent-phone"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    placeholder={t_inputs('phone.placeholder')}
                    countries={
                      countries?.map((country) => country.code as string) as
                        | string[]
                        | undefined
                    }
                    defaultCountry={
                      countries?.[0]?.code
                        ? (countries[0].code as string)
                        : undefined
                    }
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContainer>

        {/* Rôle et hiérarchie */}
        <CardContainer
          title="Rôle et hiérarchie"
          subtitle="Définissez le rôle et les relations hiérarchiques"
        >
          <FieldGroup>
            <Controller
              name="roles"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="agent-roles">Rôle</FieldLabel>
                  <MultiSelect<UserRole>
                    options={Object.values(UserRole).map((role) => ({
                      label: role,
                      value: role,
                    }))}
                    selected={field.value}
                    type="multiple"
                    onChange={field.onChange}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
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
                  <Controller
                    name="managedByUserId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="agent-manager">Manager (optionnel)</FieldLabel>
                        <Select
                          value={field.value || 'none'}
                          onValueChange={(value) => {
                            field.onChange(value === 'none' ? undefined : value);
                          }}
                          disabled={isLoading}
                        >
                          <SelectTrigger id="agent-manager" aria-invalid={fieldState.invalid}>
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
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                )}
              </div>
            )}

            {/* Agent assignment for MANAGER role */}
            {watchedRole?.includes(UserRole.Manager) && (
              <Controller
                name="managedAgentIds"
                control={form.control}
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="agent-managed-agents">Agents à superviser</FieldLabel>
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
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </CardContainer>

        {/* Assignations géographiques et services */}
        <CardContainer
          title="Assignations"
          subtitle="Définissez les pays et services assignés"
        >
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="countryCodes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="agent-countries">
                    {t_inputs('country.label')}
                  </FieldLabel>
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="serviceIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="agent-services">Services (optionnel)</FieldLabel>
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContainer>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isEditMode ? t_common('actions.update') : t_common('actions.create')}
            {isLoading && <Loader2 className="size-4 animate-spin" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
