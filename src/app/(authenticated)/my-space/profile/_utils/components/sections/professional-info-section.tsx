'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  ProfessionalInfoSchema,
  type ProfessionalInfoFormData,
} from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import type { CompleteProfile } from '@/convex/lib/types';
import { ProfessionalInfoForm } from '@/components/registration/professional-info';
import { ProfessionalInfoDisplay } from './professional-info-display';

interface ProfessionalInfoSectionProps {
  profile: CompleteProfile;
  onSave: () => void;
  requestId?: string;
}

export function ProfessionalInfoSection({
  profile,
  onSave,
}: ProfessionalInfoSectionProps) {
  if (!profile) return null;
  const t_messages = useTranslations('messages.profile');
  const t_errors = useTranslations('messages.errors');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(ProfessionalInfoSchema),
    defaultValues: {
      workStatus: profile.professionSituation?.workStatus,
      profession: profile.professionSituation?.profession,
      employer: profile.professionSituation?.employer,
      employerAddress: profile.professionSituation?.employerAddress,
      activityInGabon: profile.professionSituation?.activityInGabon,
    },
  });

  const convexUpdate = useMutation(api.functions.profile.updateProfile);

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<ProfessionalInfoFormData>(data, form.formState.dirtyFields);

    const result = await tryCatch(
      convexUpdate({
        profileId: profile._id,
        professionSituation: { ...data },
      }),
    );

    if (result.error) {
      toast.error(t_errors(result.error.message), {
        description: t_errors(result.error.message),
      });
    } else {
      toast.success(t_messages('success.update_title'), {
        description: t_messages('success.update_description'),
      });
      onSave();
      setIsLoading(false);
    }
  };

  return (
    <EditableSection
      onSave={handleSave}
      isLoading={isLoading}
      id="professional-info"
      previewContent={<ProfessionalInfoDisplay profile={profile} />}
    >
      <ProfessionalInfoForm form={form} onSubmit={handleSave} isLoading={isLoading} />
    </EditableSection>
  );
}
