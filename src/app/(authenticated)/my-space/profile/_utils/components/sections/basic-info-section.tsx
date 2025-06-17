'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { BasicInfoSchema, type BasicInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import {
  extractFieldsFromObject,
  filterUneditedKeys,
  tryCatch,
  useDateLocale,
} from '@/lib/utils';
import { updateProfile } from '@/actions/profile';
import { BasicInfoForm } from '@/components/registration/basic-info';
import { FullProfile } from '@/types';

interface BasicInfoSectionProps {
  profile: FullProfile;
  onSave: () => void;
  requestId?: string;
}

export function BasicInfoSection({ profile, onSave, requestId }: BasicInfoSectionProps) {
  const t_messages = useTranslations('messages');
  const t_errors = useTranslations('messages.errors');
  const { toast } = useToast();
  const { formatDate } = useDateLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const basicInfo = extractFieldsFromObject(profile, [
    'firstName',
    'lastName',
    'gender',
    'birthDate',
    'birthPlace',
    'birthCountry',
    'nationality',
    'acquisitionMode',
    'passportNumber',
    'passportIssueDate',
    'passportExpiryDate',
    'passportIssueAuthority',
    'cardPin',
    'identityPicture',
    'residenceCountyCode',
  ]);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    // @ts-expect-error - we rely on the nullifyUndefined function to handle null values
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

    const { data: result, error } = await tryCatch(
      updateProfile(profile.id, data, requestId),
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
      setIsEditing(false);
      onSave();
    }

    setIsLoading(false);
  };

  return (
    <EditableSection
      isEditing={isEditing}
      onSave={handleSave}
      isLoading={isLoading}
      id="basic-info"
    >
      <BasicInfoForm
        form={form}
        onSubmit={handleSave}
        isLoading={isLoading}
        profileId={profile.id}
      />
    </EditableSection>
  );
}
