'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ContactInfoSchema, type ContactInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { toast } from 'sonner';
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
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(ContactInfoSchema),
    defaultValues: {
      email: profile.contacts?.email,
      phone: profile.contacts?.phone,
      address: {
        street: profile.contacts?.address?.street ?? '',
        city: profile.contacts?.address?.city ?? '',
        postalCode: profile.contacts?.address?.postalCode ?? '',
        country: profile.contacts?.address?.country ?? 'FR',
        complement: profile.contacts?.address?.complement ?? '',
      },
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
        street: data.address.street,
        complement: data.address.complement,
        city: data.address.city,
        postalCode: data.address.postalCode,
        country: data.address.country,
      };
    }
    if (data.email) contactsUpdate.email = data.email;
    if (data.phone) contactsUpdate.phone = data.phone;

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
      toast.error(t_errors(result.error.message), {
        description: t_errors(result.error.message),
      });
    } else {
      toast.success(t_messages('success.update_title'), {
        description: t_messages('success.update_description'),
      });
      onSave();
    }
    setIsLoading(false);
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
