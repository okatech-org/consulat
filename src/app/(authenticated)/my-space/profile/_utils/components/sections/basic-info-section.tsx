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
  nullifyUndefined,
  tryCatch,
  useDateLocale,
} from '@/lib/utils';
import { updateProfile } from '@/actions/profile';
import { CountryCode } from '@/lib/autocomplete-datas';
import { BasicInfoForm } from '@/components/registration/basic-info';
import { InfoField } from '@/components/ui/info-field';
import { FullProfile } from '@/types';

interface BasicInfoSectionProps {
  profile: FullProfile;
}

export function BasicInfoSection({ profile }: BasicInfoSectionProps) {
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
  ]);

  const nonNullBasicInfo = nullifyUndefined(basicInfo);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    // @ts-expect-error - we rely on the nullifyUndefined function to handle null values
    defaultValues: {
      ...nonNullBasicInfo,
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<BasicInfoFormData>(data, form.formState.dirtyFields);

    const formData = new FormData();

    if (data.identityPictureFile) {
      formData.append('identityPictureFile', data.identityPictureFile);
    }

    formData.append('basicInfo', JSON.stringify(data));

    const { data: result, error } = await tryCatch(updateProfile(formData, 'basicInfo'));

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
          displayIdentityPicture={false}
        />
      ) : (
        <div className="space-y-6">
          {/* Informations d'identité */}
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              label={t('form.first_name')}
              value={profile.firstName}
              className={'col-span-1'}
            />
            <InfoField
              label={t('form.last_name')}
              value={profile.lastName}
              className={'col-span-1'}
            />
            <InfoField
              label={t('form.gender')}
              // @ts-expect-error - gender is a string
              value={t(`assets.gender.${profile.gender.toLowerCase()}`)}
            />

            <InfoField
              label={t('form.birth_country')}
              value={t_countries(profile.birthCountry as CountryCode)}
            />

            <InfoField
              label={t('form.birth_date')}
              value={format(new Date(profile.birthDate), 'PPP', { locale: fr })}
            />
            <InfoField label={t('form.birth_place')} value={profile.birthPlace} />
            <InfoField
              label={t('form.nationality')}
              value={t_countries(profile.nationality as CountryCode)}
            />
            <InfoField
              label={t('nationality_acquisition.label')}
              value={t(
                // @ts-expect-error - acquisitionMode is a string
                `nationality_acquisition.modes.${profile.acquisitionMode?.toLowerCase()}`,
              )}
            />
          </div>

          {/* Informations du passeport */}
          <div className="mt-4 space-y-4">
            <h4 className="font-medium">{t('form.passport.section_title')}</h4>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <InfoField
                label={t('form.passport.number.label')}
                value={profile.passportNumber}
                className={'col-span-2'}
              />
              <InfoField
                label={t('form.passport.authority.label')}
                value={profile.passportIssueAuthority}
                className={'col-span-2'}
              />
              <InfoField
                label={t('form.passport.issue_date.label')}
                value={
                  profile.passportIssueDate
                    ? formatDate(new Date(profile.passportIssueDate), 'PPP')
                    : t('form.not_provided')
                }
                className={'col-span-2'}
              />
              <InfoField
                label={t('form.passport.expiry_date.label')}
                value={
                  profile.passportExpiryDate
                    ? formatDate(new Date(profile.passportExpiryDate), 'PPP')
                    : t('form.not_provided')
                }
                className={'col-span-2'}
              />

              <InfoField
                label={t('form.card_pin.label')}
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
