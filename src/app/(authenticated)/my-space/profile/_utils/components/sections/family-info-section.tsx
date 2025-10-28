'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FamilyInfoSchema, type FamilyInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { CompleteProfile } from '@/convex/lib/types';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import { FamilyInfoForm } from '@/components/registration/family-info';
import { FamilyInfoDisplay } from './family-info-display';

interface FamilyInfoSectionProps {
  profile: CompleteProfile;
  onSave: () => void;
  requestId?: string;
}

export function FamilyInfoSection({ profile, onSave }: FamilyInfoSectionProps) {
  if (!profile) return null;
  const t_messages = useTranslations('messages.profile');
  const t_errors = useTranslations('messages.errors');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    // @ts-expect-error - we know that the maritalStatus is a MaritalStatus
    defaultValues: {
      ...profile,
    },
  });

  const updateProfile = useMutation(api.functions.profile.updateProfile);

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<FamilyInfoFormData>(data, form.formState.dirtyFields);

    const result = await tryCatch(
      updateProfile({
        profileId: profile._id,
        family: { ...data },
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
      id="family-info"
      previewContent={<FamilyInfoDisplay profile={profile} />}
    >
      <FamilyInfoForm
        // @ts-expect-error - Type conflict in React Hook Form versions
        form={form}
        onSubmit={handleSave}
        isLoading={isLoading}
      />
    </EditableSection>
  );
}
