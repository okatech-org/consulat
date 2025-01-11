'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Profile, WorkStatus } from '@prisma/client'
import { ProfessionalInfoSchema, type ProfessionalInfoFormData } from '@/schemas/registration'
import { EditableSection } from '../editable-section'
import { useToast } from '@/hooks/use-toast'
import { updateProfile } from '@/app/(authenticated)/profile/_utils/profile'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Building2, MapPin } from 'lucide-react'
import { ProfessionalInfoForm } from '@/app/(public)/registration/_utils/components/professional-info'

interface ProfessionalInfoSectionProps {
  profile: Profile
}

interface InfoFieldProps {
  label: string
  value?: string | null
  required?: boolean
  isCompleted?: boolean
  icon?: React.ReactNode
}

function InfoField({ label, value, required, isCompleted = !!value, icon }: InfoFieldProps) {
  const t = useTranslations('registration')

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        {!isCompleted && (
          <Badge
            variant={required ? "destructive" : "secondary"}
            className="text-xs"
          >
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
  )
}

export function ProfessionalInfoSection({ profile }: ProfessionalInfoSectionProps) {
  const t = useTranslations('registration')
  const t_assets = useTranslations('assets')
  const t_messages = useTranslations('messages.components')
  const t_sections = useTranslations('components.sections')
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(ProfessionalInfoSchema),
    defaultValues: {
      workStatus: profile.workStatus ?? WorkStatus.EMPLOYEE,
      profession: profile.profession || '',
      employer: profile.employer || '',
      employerAddress: profile.employerAddress || '',
      lastActivityGabon: profile.activityInGabon || ''
    }
  })

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const data = form.getValues()

      const formData = new FormData()
      formData.append('professionalInfo', JSON.stringify(data))

      const result = await updateProfile(formData, 'professionalInfo')

      if (result.error) {
        toast({
          title: t_messages('errors.update_failed'),
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: t_messages('success.update_title'),
        description: t_messages('success.update_description'),
        variant: "success"
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: t_messages('errors.update_failed'),
        description: t_messages('errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  const showEmployerFields = profile.workStatus === 'EMPLOYEE'
  const showProfessionField = ['EMPLOYEE', 'ENTREPRENEUR'].includes(profile.workStatus || '')

  return (
    <EditableSection
      title={t_sections('professional_info')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
    >
      {isEditing ? (
        <ProfessionalInfoForm
          form={form}
          onSubmit={handleSave}
          isLoading={isLoading}
        />
      ) : (
        <div className="space-y-6">
          {/* Statut professionnel */}
          <div className="space-y-4">
            <InfoField
              label={t('form.work_status')}
              value={t_assets(`work_status.${profile.workStatus?.toLowerCase()}`)}
              icon={<Briefcase className="h-4 w-4" />}
              required
            />

            {showProfessionField && (
              <InfoField
                label={t('form.profession')}
                value={profile.profession}
                icon={<Briefcase className="h-4 w-4" />}
                required={showEmployerFields}
              />
            )}
          </div>

          {/* Informations employeur */}
          {showEmployerFields && (
            <div className="grid gap-4">
              <InfoField
                label={t('form.employer')}
                value={profile.employer}
                icon={<Building2 className="h-4 w-4" />}
                required
              />
              <InfoField
                label={t('form.work_address')}
                value={profile.employerAddress}
                icon={<MapPin className="h-4 w-4" />}
                required
              />
            </div>
          )}

          {/* Activité au Gabon */}
          <div className="space-y-2">
            <h4 className="font-medium">{t('form.gabon_activity')}</h4>
            <p className="text-sm text-muted-foreground">
              {profile.activityInGabon || (
                <span className="italic">
                  {t('form.not_provided')}
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </EditableSection>
  )
}