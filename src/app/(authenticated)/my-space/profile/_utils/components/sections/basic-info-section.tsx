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
import type { Doc, Id } from '@/convex/_generated/dataModel';

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

  const convexUpdate = useMutation(api.functions.profile.updateProfile);

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<BasicInfoFormData>(data, form.formState.dirtyFields);

    const personalUpdate: Partial<Doc<'profiles'>['personal']> = {};
    if (typeof data.firstName !== 'undefined') personalUpdate.firstName = data.firstName;
    if (typeof data.lastName !== 'undefined') personalUpdate.lastName = data.lastName;
    if (typeof data.gender !== 'undefined')
      personalUpdate.gender = data.gender as Doc<'profiles'>['personal']['gender'];
    if (typeof data.birthPlace !== 'undefined')
      personalUpdate.birthPlace = data.birthPlace;
    if (typeof data.birthCountry !== 'undefined')
      personalUpdate.birthCountry = data.birthCountry as string;
    if (typeof data.nationality !== 'undefined')
      personalUpdate.nationality = data.nationality as string;
    if (typeof data.acquisitionMode !== 'undefined')
      personalUpdate.acquisitionMode =
        data.acquisitionMode as Doc<'profiles'>['personal']['acquisitionMode'];
    if (typeof data.birthDate !== 'undefined' && data.birthDate) {
      personalUpdate.birthDate = new Date(data.birthDate as unknown as string).getTime();
    }

    const { data: result, error } = await tryCatch(
      convexUpdate({
        profileId: profile._id as Id<'profiles'>,
        personal: Object.keys(personalUpdate).length
          ? (personalUpdate as Doc<'profiles'>['personal'])
          : undefined,
      }),
    );

    if (error) {
      toast({
        title: t_messages('errors.profile_failed'),
        description: t_errors(error.message),
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
