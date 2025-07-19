'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ContactInfoSchema, type ContactInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/actions/profile';
import type { FullProfile } from '@/types';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import { ContactInfoForm } from '@/components/registration/contact-form';
import { ContactInfoDisplay } from './contact-info-display';

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
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(ContactInfoSchema),
    // @ts-expect-error -- TODO: fix the don't accept null values
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
      setIsLoading(false);
      onSave();
    }
  };

  return (
    <EditableSection
      onSave={handleSave}
      isLoading={isLoading}
      id="contact-info"
      previewContent={<ContactInfoDisplay profile={profile} />}
    >
      <ContactInfoForm
        profile={profile}
        // @ts-expect-error - Type conflict in React Hook Form versions
        form={form}
        onSubmitAction={handleSave}
        isLoading={isLoading}
      />
    </EditableSection>
  );
}
