import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  CountryCode,
  OrganizationStatus,
  OrganizationType,
} from '@/convex/lib/constants';
import type { Id } from '@/convex/_generated/dataModel';

interface CreateOrganizationInput {
  code: string;
  name: string;
  logo?: string;
  type: OrganizationType;
  status?: OrganizationStatus;
  parentId?: Id<'organizations'>;
  countryCodes?: string[];
}

interface UpdateOrganizationInput {
  code?: string;
  name?: string;
  logo?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;
  countryCodes?: CountryCode[];
  settings?: any;
  metadata?: any;
}

export function useOrganizationActions() {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('sa.organizations.messages');

  const createOrg = useMutation(api.functions.organization.createOrganization);
  const updateOrg = useMutation(api.functions.organization.updateOrganization);
  const updateOrgStatus = useMutation(
    api.functions.organization.updateOrganizationStatus,
  );
  const deleteOrg = useMutation(api.functions.organization.deleteOrganization);

  const handleCreate = async (data: CreateOrganizationInput) => {
    setIsLoading(true);
    try {
      await createOrg({
        code: data.code,
        name: data.name,
        logo: data.logo,
        type: data.type as any,
        status: data.status as any,
        parentId: data.parentId,
        countryCodes: data.countryCodes as any,
      });
      toast.success(t('createSuccess'));
      return true;
    } catch (error) {
      console.error(error);
      toast.error(t('error.create'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: Id<'organizations'>, data: UpdateOrganizationInput) => {
    setIsLoading(true);
    try {
      await updateOrg({
        organizationId: id,
        ...data,
      });
      toast.success(t('updateSuccess'));
      return true;
    } catch (error) {
      console.error(error);
      toast.error(t('error.update'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    id: Id<'organizations'>,
    status: OrganizationStatus,
  ) => {
    setIsLoading(true);
    try {
      await updateOrgStatus({
        organizationId: id,
        status: status as any,
      });
      toast.success(t('updateSuccess'));
      return true;
    } catch (error) {
      console.error(error);
      toast.error(t('error.update'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: Id<'organizations'>) => {
    setIsLoading(true);
    try {
      await deleteOrg({ organizationId: id });
      toast.success(t('deleteSuccess'));
      return true;
    } catch (error) {
      console.error(error);
      toast.error(t('error.delete'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    id: Id<'organizations'>,
    status: OrganizationStatus,
  ) => {
    return handleStatusUpdate(id, status);
  };

  return {
    isLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleStatusChange,
  };
}
