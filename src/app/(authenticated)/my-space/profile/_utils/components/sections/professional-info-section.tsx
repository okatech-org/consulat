'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Profile, WorkStatus } from '@prisma/client';
import {
  ProfessionalInfoSchema,
  type ProfessionalInfoFormData,
} from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/actions/profile';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import { ProfessionalInfoForm } from '@/components/registration/professional-info';

interface ProfessionalInfoSectionProps {
  profile: Profile;
  onSave: () => void;
  requestId?: string;
}

export function ProfessionalInfoSection({
  profile,
  onSave,
  requestId,
}: ProfessionalInfoSectionProps) {
  const t_messages = useTranslations('messages.profile');
  const t_errors = useTranslations('messages.errors');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(ProfessionalInfoSchema),
    defaultValues: {
      workStatus: profile.workStatus ?? WorkStatus.EMPLOYEE,
      profession: profile.profession || '',
      employer: profile.employer || '',
      employerAddress: profile.employerAddress || '',
      activityInGabon: profile.activityInGabon || '',
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<ProfessionalInfoFormData>(data, form.formState.dirtyFields);

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
      setIsLoading(false);
      setIsEditing(false);
      onSave();
    }
  };

  return (
    <EditableSection isEditing={isEditing} onSave={handleSave} isLoading={isLoading}>
      <ProfessionalInfoForm form={form} onSubmit={handleSave} isLoading={isLoading} />
    </EditableSection>
  );
}
