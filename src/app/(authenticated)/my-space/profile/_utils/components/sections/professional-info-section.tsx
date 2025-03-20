'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Profile, WorkStatus } from '@prisma/client';
import {
  ProfessionalInfoSchema,
  type ProfessionalInfoFormData,
} from '@/schemas/registration';
import { EditableSection } from '../editable-section';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/actions/profile';
import { Briefcase, Building2, MapPin } from 'lucide-react';
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import { ProfessionalInfoForm } from '@/components/registration/professional-info';
import { InfoField } from '@/components/ui/info-field';

interface ProfessionalInfoSectionProps {
  profile: Profile;
  onSave: () => void;
}

export function ProfessionalInfoSection({
  profile,
  onSave,
}: ProfessionalInfoSectionProps) {
  const t_inputs = useTranslations('inputs');
  const t_messages = useTranslations('messages.profile');
  const t_errors = useTranslations('messages.errors');
  const t_sections = useTranslations('profile.sections');
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(ProfessionalInfoSchema),
    defaultValues: {
      workStatus: profile.workStatus ?? WorkStatus.EMPLOYEE,
      profession: profile.profession || '',
      employer: profile.employer || '',
      employerAddress: profile.employerAddress || '',
      activityInGabon: profile.activityInGabon || '',
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    const data = form.getValues();

    filterUneditedKeys<ProfessionalInfoFormData>(data, form.formState.dirtyFields);

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
      setIsLoading(false);
      setIsEditing(false);
      onSave();
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const showEmployerFields = profile.workStatus === 'EMPLOYEE';
  const showProfessionField = ['EMPLOYEE', 'ENTREPRENEUR'].includes(
    profile.workStatus || '',
  );

  return (
    <EditableSection
      title={t_sections('professional_info')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
      profileStatus={profile.status}
    >
      {isEditing ? (
        <ProfessionalInfoForm form={form} onSubmit={handleSave} isLoading={isLoading} />
      ) : (
        <div className="space-y-6">
          {/* Statut professionnel */}
          <div className="space-y-4">
            <InfoField
              label={t_inputs('workStatus.label')}
              value={
                profile.workStatus
                  ? t_inputs(`workStatus.options.${profile.workStatus}`)
                  : undefined
              }
              icon={<Briefcase className="size-4" />}
            />

            {showProfessionField && (
              <InfoField
                label={t_inputs('profession.label')}
                value={profile.profession}
                icon={<Briefcase className="size-4" />}
              />
            )}
          </div>

          {/* Informations employeur */}
          {showEmployerFields && (
            <div className="grid gap-4">
              <InfoField
                label={t_inputs('employer.label')}
                value={profile.employer}
                icon={<Building2 className="size-4" />}
              />
              <InfoField
                label={t_inputs('employer.address.label')}
                value={profile.employerAddress}
                icon={<MapPin className="size-4" />}
              />
            </div>
          )}

          <InfoField
            label={t_inputs('employer.address.label')}
            value={profile.activityInGabon}
            icon={<Briefcase className="size-4" />}
          />
        </div>
      )}
    </EditableSection>
  );
}
