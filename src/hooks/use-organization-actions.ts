'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from '@/schemas/organization';
import type { Id } from '@/convex/_generated/dataModel';

export function useOrganizationActions() {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('organization');

  const createOrganizationMutation = useMutation(
    api.functions.organization.createOrganization,
  );
  const updateOrganizationMutation = useMutation(
    api.functions.organization.updateOrganization,
  );

  const handleCreate = async (data: CreateOrganizationInput) => {
    setIsLoading(true);
    try {
      const code = data.code || `ORG_${Date.now().toString(36).toUpperCase()}`;

      const organizationId = await createOrganizationMutation({
        code,
        name: data.name,
        type: data.type,
        status: data.status,
        countryCodes: data.countryIds as any[],
      });

      toast.success(t('messages.create_success'));
      return organizationId;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error(t('messages.create_error'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    organizationId: Id<'organizations'>,
    data: UpdateOrganizationInput,
  ) => {
    setIsLoading(true);
    try {
      await updateOrganizationMutation({
        organizationId,
        name: data.name,
        type: data.type,
        status: data.status,
        countryCodes: data.countryIds as any[],
      });

      toast.success(t('messages.update_success'));
      return true;
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error(t('messages.update_error'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCreate,
    handleUpdate,
    isLoading,
  };
}
