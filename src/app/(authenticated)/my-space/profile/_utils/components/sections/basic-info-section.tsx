'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { BasicInfoSchema, type BasicInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  extractFieldsFromObject,
  filterUneditedKeys,
  tryCatch,
  useDateLocale,
} from '@/lib/utils';
import { updateProfile } from '@/actions/profile';
import { CountryCode } from '@/lib/autocomplete-datas';
import { BasicInfoForm } from '@/components/registration/basic-info';
import { InfoField } from '@/components/ui/info-field';
import { FullProfile } from '@/types';
import Image from 'next/image';

interface BasicInfoSectionProps {
  profile: FullProfile;
  onSave: () => void;
}

export function BasicInfoSection({ profile, onSave }: BasicInfoSectionProps) {
  const t_inputs = useTranslations('inputs');
  const t = useTranslations('registration');
  const t_countries = useTranslations('countries');
  const t_messages = useTranslations('messages');
  const t_errors = useTranslations('messages.errors');
  const t_sections = useTranslations('profile.sections');
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
    'cardPin',
    'identityPicture',
    'residenceCountyCode',
  ]);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    // @ts-expect-error - we rely on the nullifyUndefined function to handle null values
    defaultValues: {
      ...basicInfo,
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<BasicInfoFormData>(data, form.formState.dirtyFields);

    const { data: result, error } = await tryCatch(updateProfile(profile.id, data));

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

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <EditableSection
      title={t_sections('basic_info')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
      profileStatus={profile.status}
    >
      {isEditing ? (
        <BasicInfoForm
          form={form}
          onSubmit={handleSave}
          isLoading={isLoading}
          profileId={profile.id}
        />
      ) : (
        <div className="space-y-6">
          {/* Informations d'identité */}
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              label={`${t_inputs('identityPicture.label')} - ${profile.identityPicture?.status ? t_inputs(`documentStatus.options.${profile.identityPicture?.status}`) : ''}`}
              value={
                <Image
                  src={profile.identityPicture?.fileUrl || ''}
                  alt={profile.firstName || ''}
                  width={100}
                  height={100}
                  className="rounded-full w-20 h-20 overflow-hidden aspect-square object-cover"
                />
              }
              className={'col-span-full'}
            />

            <InfoField
              label={t_inputs('firstName.label')}
              value={profile.firstName}
              className={'col-span-1'}
            />
            <InfoField
              label={t_inputs('lastName.label')}
              value={profile.lastName}
              className={'col-span-1'}
            />
            <InfoField
              label={t_inputs('gender.label')}
              value={
                profile.gender
                  ? t_inputs(`gender.options.${profile.gender}`)
                  : t('form.not_provided')
              }
            />

            <InfoField
              label={t_inputs('birthCountry.label')}
              value={
                profile.birthCountry
                  ? t_countries(profile.birthCountry as CountryCode)
                  : t('form.not_provided')
              }
            />

            <InfoField
              label={t_inputs('birthDate.label')}
              value={
                profile.birthDate
                  ? format(new Date(profile.birthDate), 'PPP', { locale: fr })
                  : t('form.not_provided')
              }
            />
            <InfoField label={t_inputs('birthPlace.label')} value={profile.birthPlace} />
            <InfoField
              label={t_inputs('nationality.label')}
              value={t_countries(profile.nationality as CountryCode)}
            />
            <InfoField
              label={t_inputs('nationality_acquisition.label')}
              value={
                profile.acquisitionMode
                  ? t_inputs(`nationality_acquisition.options.${profile.acquisitionMode}`)
                  : t('form.not_provided')
              }
            />
          </div>

          {/* Informations du passeport */}
          <div className="mt-4 space-y-4">
            <h4 className="font-medium">{t('form.passport.section_title')}</h4>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <InfoField
                label={t_inputs('passport.number.label')}
                value={profile.passportNumber}
                className={'col-span-2'}
              />
              <InfoField
                label={t_inputs('passport.issueAuthority.label')}
                value={profile.passportIssueAuthority}
                className={'col-span-2'}
              />
              <InfoField
                label={t_inputs('passport.issueDate.label')}
                value={
                  profile.passportIssueDate
                    ? formatDate(new Date(profile.passportIssueDate), 'PPP')
                    : t('form.not_provided')
                }
                className={'col-span-2'}
              />
              <InfoField
                label={t_inputs('passport.expiryDate.label')}
                value={
                  profile.passportExpiryDate
                    ? formatDate(new Date(profile.passportExpiryDate), 'PPP')
                    : t('form.not_provided')
                }
                className={'col-span-2'}
              />

              <InfoField
                label={t_inputs('nipNumber.label')}
                value={profile.cardPin}
                className={'col-span-2'}
              />
            </div>
          </div>
        </div>
      )}
    </EditableSection>
  );
}
