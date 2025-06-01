'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { tryCatch } from '@/lib/utils';
import {
  AgentDetails,
  updateAgent,
  getAgentDetails,
  getServicesForOrganization,
} from '@/actions/agents';
import { getActiveCountries } from '@/actions/countries';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/ui/multi-select';

const editAgentSchema = z.object({
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  linkedCountryIds: z.array(z.string()).min(1, 'Au moins un pays doit être sélectionné'),
  assignedServiceIds: z.array(z.string()).min(1, 'Au moins un service doit être assigné'),
});

type EditAgentFormData = z.infer<typeof editAgentSchema>;

interface EditAgentFormProps {
  agent: AgentDetails;
  onSuccess: (updatedAgent: AgentDetails) => void;
  onCancel: () => void;
}

export function EditAgentForm({ agent, onSuccess, onCancel }: EditAgentFormProps) {
  const currentUser = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<
    { id: string; code: string; name: string }[]
  >([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditAgentFormData>({
    resolver: zodResolver(editAgentSchema),
    defaultValues: {
      email: agent.email || '',
      phoneNumber: agent.phoneNumber || '',
      linkedCountryIds: agent.linkedCountries?.map((c) => c.id) || [],
      assignedServiceIds: agent.assignedServices?.map((s) => s.id) || [],
    },
  });

  const watchedCountryIds = watch('linkedCountryIds');
  const watchedServiceIds = watch('assignedServiceIds');

  useEffect(() => {
    async function loadData() {
      const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');
      const organizationId = isSuperAdmin
        ? undefined
        : agent.assignedOrganizationId || undefined;

      const [countriesResult, servicesResult] = await Promise.all([
        tryCatch(getActiveCountries()),
        tryCatch(getServicesForOrganization(organizationId)),
      ]);

      if (countriesResult.data) {
        setCountries(
          countriesResult.data.map((c) => ({ id: c.id, code: c.code, name: c.name })),
        );
      }

      if (servicesResult.data) {
        setServices(servicesResult.data.map((s) => ({ id: s.id, name: s.name })));
      }
    }

    loadData();
  }, [currentUser, agent.assignedOrganizationId]);

  const onSubmit = async (data: EditAgentFormData) => {
    setIsLoading(true);
    try {
      const updateData = {
        email: data.email || undefined,
        phoneNumber: data.phoneNumber || undefined,
        countryIds: data.linkedCountryIds,
        serviceIds: data.assignedServiceIds,
      };

      const result = await tryCatch(updateAgent(agent.id, updateData));

      if (result.error) {
        toast.error('Erreur lors de la mise à jour', {
          description: result.error.message || 'Une erreur est survenue',
        });
        return;
      }

      toast.success('Agent mis à jour', {
        description: "Les informations de l'agent ont été mises à jour avec succès",
      });

      // Refetch agent data to get updated information
      const updatedAgentResult = await tryCatch(getAgentDetails(agent.id));
      if (updatedAgentResult.data) {
        onSuccess(updatedAgentResult.data);
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="agent@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Téléphone */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+33 1 23 45 67 89"
          {...register('phoneNumber')}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Pays liés */}
      <div className="space-y-2">
        <Label>Pays liés</Label>
        <MultiSelect<string>
          className="w-full"
          options={countries.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
          selected={watchedCountryIds}
          type="multiple"
          onChange={(ids: string[]) => setValue('linkedCountryIds', ids)}
          placeholder="Sélectionner les pays"
        />
        {errors.linkedCountryIds && (
          <p className="text-sm text-destructive">{errors.linkedCountryIds.message}</p>
        )}
      </div>

      {/* Services assignés */}
      <div className="space-y-2">
        <Label>Services assignés</Label>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
          {services.map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox
                id={`service-${service.id}`}
                checked={watchedServiceIds.includes(service.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setValue('assignedServiceIds', [...watchedServiceIds, service.id]);
                  } else {
                    setValue(
                      'assignedServiceIds',
                      watchedServiceIds.filter((id) => id !== service.id),
                    );
                  }
                }}
              />
              <Label htmlFor={`service-${service.id}`} className="text-sm">
                {service.name}
              </Label>
            </div>
          ))}
        </div>
        {errors.assignedServiceIds && (
          <p className="text-sm text-destructive">{errors.assignedServiceIds.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
