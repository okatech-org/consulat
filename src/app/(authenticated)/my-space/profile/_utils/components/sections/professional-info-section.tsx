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
import { updateProfile } from '@/app/(authenticated)/my-space/_utils/profile';
import { Briefcase, Building2, MapPin } from 'lucide-react';
import { filterUneditedKeys } from '@/lib/utils';
import { ProfessionalInfoForm } from '@/components/registration/professional-info';
import { InfoField } from '@/components/ui/info-field';

interface ProfessionalInfoSectionProps {
  profile: Profile;
}

export function ProfessionalInfoSection({ profile }: ProfessionalInfoSectionProps) {
  const t = useTranslations('registration');
  const t_assets = useTranslations('assets');
  const t_messages = useTranslations('messages.profile');
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
      lastActivityGabon: profile.activityInGabon || '',
    },
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const data = form.getValues();

      filterUneditedKeys<ProfessionalInfoFormData>(data, form.formState.dirtyFields);

      const formData = new FormData();
      formData.append('professionalInfo', JSON.stringify(data));

      const result = await updateProfile(formData, 'professionalInfo');

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
      console.error(error);
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
              label={t('form.work_status')}
              value={t_assets(`work_status.${profile.workStatus?.toLowerCase()}`)}
              icon={<Briefcase className="size-4" />}
            />

            {showProfessionField && (
              <InfoField
                label={t('form.profession')}
                value={profile.profession}
                icon={<Briefcase className="size-4" />}
              />
            )}
          </div>

          {/* Informations employeur */}
          {showEmployerFields && (
            <div className="grid gap-4">
              <InfoField
                label={t('form.employer')}
                value={profile.employer}
                icon={<Building2 className="size-4" />}
              />
              <InfoField
                label={t('form.work_address')}
                value={profile.employerAddress}
                icon={<MapPin className="size-4" />}
              />
            </div>
          )}

          {/* Activité au Gabon */}
          <div className="space-y-2">
            <h4 className="font-medium">{t('form.gabon_activity')}</h4>
            <p className="text-sm text-muted-foreground">
              {profile.activityInGabon || (
                <span className="italic">{t('form.not_provided')}</span>
              )}
            </p>
          </div>
        </div>
      )}
    </EditableSection>
  );
}
