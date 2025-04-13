'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FamilyInfoSchema, type FamilyInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/actions/profile';
import { FullProfile } from '@/types';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import { FamilyInfoForm } from '@/components/registration/family-info';

interface FamilyInfoSectionProps {
  profile: FullProfile;
  onSave: () => void;
  requestId?: string;
}

export function FamilyInfoSection({
  profile,
  onSave,
  requestId,
}: FamilyInfoSectionProps) {
  const t_messages = useTranslations('messages.profile');
  const t_errors = useTranslations('messages.errors');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    // @ts-expect-error - we know that the maritalStatus is a MaritalStatus
    defaultValues: {
      ...profile,
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<FamilyInfoFormData>(data, form.formState.dirtyFields);

    const result = await tryCatch(updateProfile(profile.id, data, requestId));

    if (result.error) {
      toast({
        title: t_messages('errors.update_failed'),
        description: t_errors(result.error.message),
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (result.data) {
      toast({
        title: t_messages('success.update_title'),
        description: t_messages('success.update_description'),
        variant: 'success',
      });
      setIsEditing(false);
      setIsLoading(false);
      onSave();
    }
  };

  return (
    <EditableSection isEditing={isEditing} onSave={handleSave} isLoading={isLoading}>
      <FamilyInfoForm form={form} onSubmit={handleSave} isLoading={isLoading} />
    </EditableSection>
  );
}
