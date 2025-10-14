'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { BasicInfoSchema, type BasicInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { filterUneditedKeys, tryCatch, useDateLocale } from '@/lib/utils';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BasicInfoForm } from '@/components/registration/basic-info';
import { BasicInfoDisplay } from './basic-info-display';
import type { FullProfile } from '@/types/convex-profile';

interface BasicInfoSectionProps {
  profile: FullProfile;
  onSaveAction: () => void;
}

export function BasicInfoSection({ profile, onSaveAction }: BasicInfoSectionProps) {
  const t_messages = useTranslations('messages');
  const t_errors = useTranslations('messages.errors');
  const { toast } = useToast();
  const { formatDate } = useDateLocale();
  const [isLoading, setIsLoading] = useState(false);
  const updateProfile = useMutation(api.functions.profile.updateProfile);

  if (!profile) return null;

  const basicInfo = {
    firstName: profile.personal?.firstName,
    lastName: profile.personal?.lastName,
    gender: profile.personal?.gender,
    birthDate: profile.personal?.birthDate,
    birthPlace: profile.personal?.birthPlace,
    birthCountry: profile.personal?.birthCountry,
    nationality: profile.personal?.nationality,
    acquisitionMode: profile.personal?.acquisitionMode,
    identityPicture: profile.identityPicture ?? undefined,
  } as Partial<BasicInfoFormData & { identityPicture?: unknown }>;

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: {
      ...basicInfo,
      ...(basicInfo.birthDate && {
        birthDate: formatDate(new Date(basicInfo.birthDate), 'yyyy-MM-dd'),
      }),
      ...(basicInfo.passportIssueDate && {
        passportIssueDate: formatDate(
          new Date(basicInfo.passportIssueDate),
          'yyyy-MM-dd',
        ),
      }),
      ...(basicInfo.passportExpiryDate && {
        passportExpiryDate: formatDate(
          new Date(basicInfo.passportExpiryDate),
          'yyyy-MM-dd',
        ),
      }),
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<BasicInfoFormData>(data, form.formState.dirtyFields);

    const result = await tryCatch(
      updateProfile({
        profileId: profile._id,
        personal: { ...data, birthDate: new Date(data.birthDate).getTime() },
      }),
    );

    if (result.error) {
      toast({
        title: t_messages('errors.profile_failed'),
        description: t_errors(result.error.message),
        variant: 'destructive',
      });
    }

    if (result) {
      toast({
        title: t_messages('success.profile.update_success'),
        description: t_messages('success.profile.update_description'),
        variant: 'success',
      });
      onSaveAction();
    }

    setIsLoading(false);
  };

  return (
    <EditableSection
      onSave={handleSave}
      isLoading={isLoading}
      id="basic-info"
      previewContent={<BasicInfoDisplay profile={profile} />}
    >
      <BasicInfoForm
        form={form}
        onSubmit={() => void handleSave()}
        isLoading={isLoading}
        profileId={profile._id as unknown as string}
        displayIdentityPicture={false}
      />
    </EditableSection>
  );
}
