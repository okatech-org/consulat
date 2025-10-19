'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ContactInfoSchema, type ContactInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { CompleteProfile } from '@/convex/lib/types';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import { ContactInfoForm } from '@/components/registration/contact-form';
import { ContactInfoDisplay } from './contact-info-display';

interface ContactInfoSectionProps {
  profile: CompleteProfile;
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
      email: profile.contacts?.email ?? undefined,
      phoneNumber: profile.contacts?.phone ?? '+33-',
      address: {
        firstLine: profile.personal?.address?.street ?? '',
        city: profile.personal?.address?.city ?? '',
        zipCode: profile.personal?.address?.postalCode ?? '',
        country: (profile.personal?.address?.country as any) ?? 'FR',
        secondLine: profile.personal?.address?.complement ?? '',
      },
      residentContact: undefined,
    },
  });

  const convexUpdate = useMutation(api.functions.profile.updateProfile);

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<ContactInfoFormData>(data, form.formState.dirtyFields);

    // Mapper vers Convex: contacts et personal.address
    const personalUpdate: Record<string, unknown> = {};
    const contactsUpdate: Record<string, unknown> = {};

    if (data.address) {
      personalUpdate.address = {
        street: data.address.firstLine,
        complement: data.address.secondLine,
        city: data.address.city,
        postalCode: data.address.zipCode,
        country: data.address.country as any,
      };
    }
    if (typeof data.email !== 'undefined') contactsUpdate.email = data.email;
    if (typeof data.phoneNumber !== 'undefined') contactsUpdate.phone = data.phoneNumber;

    const result = await tryCatch(
      convexUpdate({
        profileId: profile._id as any,
        personal: Object.keys(personalUpdate).length
          ? (personalUpdate as any)
          : undefined,
        contacts: Object.keys(contactsUpdate).length
          ? (contactsUpdate as any)
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
