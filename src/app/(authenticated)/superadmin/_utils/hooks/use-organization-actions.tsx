import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { OrganizationStatus } from '@prisma/client';
import {
  createOrganization,
  deleteOrganization,
  updateOrganization,
  updateOrganizationStatus,
} from '@/app/(authenticated)/superadmin/_utils/actions/organizations';
import { CreateOrganizationInput, UpdateOrganizationInput } from '@/schemas/organization';

export function useOrganizationActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('sa.organizations.messages');

  const handleCreate = async (data: CreateOrganizationInput) => {
    setIsLoading(true);
    try {
      const result = await createOrganization(data);
      if (result.error) throw new Error(result.error);
      toast({ title: t('createSuccess') });
      return true;
    } catch (error) {
      console.error(error);
      toast({
        title: t('error.create'),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: UpdateOrganizationInput) => {
    setIsLoading(true);
    try {
      const result = await updateOrganization(id, data);
      if (result.error) throw new Error(result.error);
      toast({ title: t('updateSuccess') });
      return true;
    } catch (error) {
      console.error(error);
      toast({
        title: t('error.update'),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: OrganizationStatus) => {
    setIsLoading(true);
    try {
      const result = await updateOrganizationStatus(id, status);
      if (result.error) throw new Error(result.error);
      toast({ title: t('updateSuccess') });
      return true;
    } catch (error) {
      console.error(error);
      toast({
        title: t('error.update'),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await deleteOrganization(id);
      if (result.error) throw new Error(result.error);
      toast({ title: t('deleteSuccess') });
      return true;
    } catch (error) {
      console.error(error);
      toast({
        title: t('error.delete'),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: OrganizationStatus) => {
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
