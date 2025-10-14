'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FamilyInfoSchema, type FamilyInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { FullProfile } from '@/types/convex-profile';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import { FamilyInfoForm } from '@/components/registration/family-info';
import { FamilyInfoDisplay } from './family-info-display';

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
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    // @ts-expect-error - we know that the maritalStatus is a MaritalStatus
    defaultValues: {
      ...profile,
    },
  });

  const convexUpdate = useMutation(api.functions.profile.updateProfile);

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<FamilyInfoFormData>(data, form.formState.dirtyFields);

    // Mapper vers Convex: family.father/mother/spouse + personal.maritalStatus
    const familyUpdate: Record<string, unknown> = {};
    if (typeof data.fatherFullName !== 'undefined' && data.fatherFullName) {
      const [firstName, ...rest] = data.fatherFullName.split(' ');
      familyUpdate.father = { firstName, lastName: rest.join(' ') };
    }
    if (typeof data.motherFullName !== 'undefined' && data.motherFullName) {
      const [firstName, ...rest] = data.motherFullName.split(' ');
      familyUpdate.mother = { firstName, lastName: rest.join(' ') };
    }
    if (typeof data.spouseFullName !== 'undefined' && data.spouseFullName) {
      const [firstName, ...rest] = data.spouseFullName.split(' ');
      familyUpdate.spouse = { firstName, lastName: rest.join(' ') };
    }

    const personalUpdate: Record<string, unknown> = {};
    if (typeof data.maritalStatus !== 'undefined')
      personalUpdate.maritalStatus = data.maritalStatus as any;

    const result = await tryCatch(
      convexUpdate({
        profileId: profile._id as any,
        family: Object.keys(familyUpdate).length ? (familyUpdate as any) : undefined,
        personal: Object.keys(personalUpdate).length
          ? (personalUpdate as any)
          : undefined,
      }),
    );

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
      onSave();
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
