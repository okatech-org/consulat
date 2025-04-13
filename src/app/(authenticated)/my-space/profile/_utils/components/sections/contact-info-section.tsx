'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ContactInfoSchema, type ContactInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/actions/profile';
import { FullProfile } from '@/types';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import { ContactInfoForm } from '@/components/registration/contact-form';

interface ContactInfoSectionProps {
  profile: FullProfile;
  onSave: () => void;
  requestId?: string;
}

export function ContactInfoSection({
  profile,
  onSave,
  requestId,
}: ContactInfoSectionProps) {
  const t_messages = useTranslations('messages.profile');
  const t_errors = useTranslations('messages.errors');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(ContactInfoSchema),
    // @ts-expect-error -- TODO: fic the don't accept null values
    defaultValues: {
      ...profile,
      phoneNumber: profile.phoneNumber ?? '+33-',
      address: { ...profile.address, country: profile.address?.country ?? 'FR' },
      residentContact: {
        ...profile.residentContact,
        phoneNumber: profile.residentContact?.phoneNumber ?? '+33-',
        address: {
          ...profile.residentContact?.address,
          country: profile.residentContact?.address?.country ?? 'FR',
        },
      },
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<ContactInfoFormData>(data, form.formState.dirtyFields);

    if (data.residentContact) {
      filterUneditedKeys<ContactInfoFormData['residentContact']>(
        data.residentContact,
        form.formState.dirtyFields,
      );
    }

    if (data.homeLandContact) {
      // @ts-expect-error -- not sure why this is not working
      filterUneditedKeys<ContactInfoFormData['homeLandContact']>(
        data.homeLandContact,
        form.formState.dirtyFields,
      );
    }

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
      <ContactInfoForm
        profile={profile}
        form={form}
        onSubmitAction={handleSave}
        isLoading={isLoading}
      />
    </EditableSection>
  );
}
