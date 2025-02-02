'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FamilyLink, MaritalStatus } from '@prisma/client';
import { FamilyInfoSchema, type FamilyInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/app/(authenticated)/user/_utils/profile';
import { Badge } from '@/components/ui/badge';
import { Users, User2, Phone } from 'lucide-react';
import { FamilyInfoForm } from '@/app/(public)/registration/_utils/components/family-info';
import { Separator } from '@/components/ui/separator';
import { FullProfile } from '@/types';
import { filterUneditedKeys } from '@/lib/utils';

interface FamilyInfoSectionProps {
  profile: FullProfile;
}

interface InfoFieldProps {
  label: string;
  value?: string | null;
  required?: boolean;
  isCompleted?: boolean;
  icon?: React.ReactNode;
}

function InfoField({
  label,
  value,
  required,
  isCompleted = !!value,
  icon,
}: InfoFieldProps) {
  const t = useTranslations('registration');

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        {!isCompleted && (
          <Badge variant={required ? 'destructive' : 'secondary'} className="text-xs">
            {t(required ? 'form.required' : 'form.optional')}
          </Badge>
        )}
      </div>
      <div className="mt-1">
        {value || (
          <span className="text-sm italic text-muted-foreground">
            {t('form.not_provided')}
          </span>
        )}
      </div>
    </div>
  );
}

export function FamilyInfoSection({ profile }: FamilyInfoSectionProps) {
  const t = useTranslations('registration');
  const t_messages = useTranslations('messages.profile');
  const t_assets = useTranslations('assets');
  const t_profile = useTranslations('profile');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    defaultValues: {
      maritalStatus: profile.maritalStatus ?? MaritalStatus.SINGLE,
      fatherFullName: profile.fatherFullName || '',
      motherFullName: profile.motherFullName || '',
      spouseFullName: profile.spouseFullName || '',
      emergencyContact: {
        fullName: profile.emergencyContact?.fullName || '',
        relationship: profile.emergencyContact?.relationship || FamilyLink.OTHER,
        phone: profile.emergencyContact?.phone,
      },
    },
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const data = form.getValues();

      filterUneditedKeys<FamilyInfoFormData>(data, form.formState.dirtyFields);

      const formData = new FormData();
      formData.append('familyInfo', JSON.stringify(data));

      const result = await updateProfile(formData, 'familyInfo');

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
      console.error('Error updating family info:', error);
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

  const showSpouseField =
    profile.maritalStatus === 'MARRIED' ||
    profile.maritalStatus === 'COHABITING' ||
    profile.maritalStatus === 'CIVIL_UNION';

  return (
    <EditableSection
      title={t_profile('sections.family_info')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
    >
      {isEditing ? (
        <FamilyInfoForm form={form} onSubmit={handleSave} isLoading={isLoading} />
      ) : (
        <div className="space-y-6">
          {/* Situation matrimoniale */}
          <div className="space-y-4">
            <InfoField
              label={t('form.marital_status')}
              value={t_assets(`marital_status.${profile.maritalStatus?.toLowerCase()}`)}
              icon={<Users className="size-4" />}
              required
            />

            {showSpouseField && (
              <InfoField
                label={t('form.spouse_name')}
                value={profile.spouseFullName}
                icon={<User2 className="size-4" />}
                required
              />
            )}
          </div>

          {/* Parents */}
          <div className="grid gap-4">
            <InfoField
              label={t('form.father_name')}
              value={profile.fatherFullName}
              icon={<User2 className="size-4" />}
              required
            />
            <InfoField
              label={t('form.mother_name')}
              value={profile.motherFullName}
              icon={<User2 className="size-4" />}
              required
            />
          </div>

          <Separator className="col-span-full" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{t('form.emergency_contact')}</h4>
              {!profile.emergencyContact && (
                <Badge variant="destructive">{t('form.required')}</Badge>
              )}
            </div>

            {profile.emergencyContact ? (
              <div className="grid gap-4 md:grid-cols-3">
                <InfoField
                  label={t('form.emergency_contact_name')}
                  value={profile.emergencyContact.fullName}
                  icon={<User2 className="size-4" />}
                />
                <InfoField
                  label={t('form.emergency_contact_relationship')}
                  value={t_profile(
                    `fields.family_link.${profile.emergencyContact.relationship.toLowerCase()}`,
                  )}
                  icon={<Users className="size-4" />}
                />
                <InfoField
                  label={t('form.emergency_contact_phone')}
                  value={
                    profile.emergencyContact?.phone
                      ? `${profile.emergencyContact.phone?.countryCode}${profile.emergencyContact.phone?.number}`
                      : undefined
                  }
                  icon={<Phone className="size-4" />}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('form.emergency_contact_description')}
              </p>
            )}
          </div>
        </div>
      )}
    </EditableSection>
  );
}
