'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ContactInfoSchema, type ContactInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/actions/profile';
import { Badge } from '@/components/ui/badge';
import { Flag, Mail, Phone } from 'lucide-react';
import { FullProfile } from '@/types';
import { filterUneditedKeys, extractFieldsFromObject } from '@/lib/utils';
import { ContactInfoForm } from '@/components/registration/contact-form';
import { InfoField } from '@/components/ui/info-field';
import { DisplayAddress } from '@/components/ui/display-address';
import { CountryCode } from '@/lib/autocomplete-datas';
import { Address } from '@prisma/client';

interface ContactInfoSectionProps {
  profile: FullProfile;
}

export function ContactInfoSection({ profile }: ContactInfoSectionProps) {
  const t_inputs = useTranslations('inputs');
  const t_countries = useTranslations('countries');
  const t = useTranslations('registration');
  const t_messages = useTranslations('messages.profile');
  const t_sections = useTranslations('profile.sections');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contactInfo = extractFieldsFromObject(profile, [
    'email',
    'phone',
    'address',
    'residentContact',
    'homeLandContact',
  ]);

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(ContactInfoSchema),
    // @ts-expect-error -- TODO: fic the don't accept null values
    defaultValues: contactInfo,
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const data = form.getValues();

      filterUneditedKeys<ContactInfoFormData>(data, form.formState.dirtyFields);

      const formData = new FormData();
      formData.append('contactInfo', JSON.stringify(data));

      const result = await updateProfile(formData, 'contactInfo');

      if (result.error) {
        toast({
          title: t_messages('errors.update_failed'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t_messages('success.update_title'),
        description: t_messages('success.update_description'),
        variant: 'success',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast({
        title: t_messages('errors.update_failed'),
        description: t_messages('errors.unknown'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <EditableSection
      title={t_sections('contact_info')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
      profileStatus={profile.status}
    >
      {isEditing ? (
        <ContactInfoForm form={form} onSubmitAction={handleSave} isLoading={isLoading} />
      ) : (
        <div className="space-y-4">
          {/* Coordonnées principales */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InfoField
              label={t_inputs('email.label')}
              value={profile?.email}
              icon={<Mail className="size-4" />}
            />
            <InfoField
              label={t_inputs('phone.label')}
              value={`${profile?.phone?.countryCode}${profile?.phone?.number}`}
              icon={<Phone className="size-4" />}
            />
          </div>

          {/* Adresses */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-6">
              {profile.address ? (
                <DisplayAddress
                  address={profile.address}
                  title={t_inputs('address.label')}
                />
              ) : (
                <Badge variant="destructive">{t('form.required')}</Badge>
              )}
            </div>

            <div className="space-y-6">
              {profile.residentContact ? (
                <InfoField
                  label={
                    t_inputs('emergencyContact.label') +
                    `${profile.residentContact?.address?.country ? ` - ${t_countries(profile.residentContact?.address?.country as CountryCode)}` : ''}`
                  }
                  value={
                    <DisplayAddress
                      address={profile.residentContact.address as Address}
                    />
                  }
                  icon={<Flag className="size-4" />}
                />
              ) : (
                <Badge variant="outline">{t('form.required')}</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-6">
              {profile.homeLandContact ? (
                <InfoField
                  label={
                    t_inputs('emergencyContact.label') +
                    `${profile.homeLandContact?.address?.country ? ` - ${t_countries(profile.homeLandContact?.address?.country as CountryCode)}` : ''}`
                  }
                  value={
                    <DisplayAddress
                      address={profile.homeLandContact.address as Address}
                    />
                  }
                  icon={<Flag className="size-4" />}
                />
              ) : (
                <Badge variant="outline">{t('form.required')}</Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </EditableSection>
  );
}
