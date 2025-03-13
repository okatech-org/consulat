'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FamilyInfoSchema, type FamilyInfoFormData } from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/actions/profile';
import { Users, User2 } from 'lucide-react';
import { FullProfile } from '@/types';
import { extractFieldsFromObject, filterUneditedKeys, tryCatch } from '@/lib/utils';
import { InfoField } from '@/components/ui/info-field';
import { FamilyInfoForm } from '@/components/registration/family-info';

interface FamilyInfoSectionProps {
  profile: FullProfile;
}

export function FamilyInfoSection({ profile }: FamilyInfoSectionProps) {
  const t_inputs = useTranslations('inputs');
  const t_messages = useTranslations('messages.profile');
  const t_errors = useTranslations('messages.errors');
  const t_profile = useTranslations('profile');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    // @ts-expect-error - we know that the maritalStatus is a MaritalStatus
    defaultValues: {
      ...profile,
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<FamilyInfoFormData>(data, form.formState.dirtyFields);

    const result = await tryCatch(updateProfile(profile.id, data));

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
      profileStatus={profile.status}
    >
      {isEditing ? (
        <FamilyInfoForm form={form} onSubmit={handleSave} isLoading={isLoading} />
      ) : (
        <div className="space-y-6">
          {/* Situation matrimoniale */}
          <div className="space-y-4">
            <InfoField
              label={t_inputs('maritalStatus.label')}
              value={
                profile.maritalStatus
                  ? t_inputs(`maritalStatus.options.${profile.maritalStatus}`)
                  : undefined
              }
              icon={<Users className="size-4" />}
              required
            />

            {showSpouseField && (
              <InfoField
                label={t_inputs('spouse.fullName.label')}
                value={profile.spouseFullName}
                icon={<User2 className="size-4" />}
                required
              />
            )}
          </div>

          {/* Parents */}
          <div className="grid gap-4">
            <InfoField
              label={t_inputs('father.fullName.label')}
              value={profile.fatherFullName}
              icon={<User2 className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('mother.fullName.label')}
              value={profile.motherFullName}
              icon={<User2 className="size-4" />}
              required
            />
          </div>
        </div>
      )}
    </EditableSection>
  );
}
