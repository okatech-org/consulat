'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { ContactInfoSchema, type ContactInfoFormData } from '@/schemas/registration'
import { EditableSection } from '../editable-section'
import { useToast } from '@/hooks/use-toast'
import { updateProfile } from '@/app/(authenticated)/user/_utils/profile'
import { Badge } from '@/components/ui/badge'
import { MapPin, Mail, Phone } from 'lucide-react'
import { ContactInfoForm } from '@/app/(public)/registration/_utils/components/contact-form'
import { FullProfile } from '@/types'
import { Address, AddressGabon } from '@prisma/client'

interface ContactInfoSectionProps {
  profile: FullProfile
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

function AddressDisplay({
                          address,
                          title
                        }: {
  address: Address | AddressGabon
  title: string
}) {
  const t_countries = useTranslations('countries')

  if (!address) return null

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <span>{title}</span>
      </div>
      <div className="text-sm">
        {('address' in address && address.address) && (
          <>{address.address}</>
        )}
        {
          ('firstLine' in address && address.firstLine) && (
            <>{address.firstLine}</>
          )
        }
        {('secondLine' in address && address.secondLine) && (
          <>, {address.secondLine}</>
        )}
        {('district' in address && address.district) && (
          <>, {address.district}</>
        )}
      </div>
      <div className="text-sm">
        {address?.city}
        {('zipCode' in address && address.zipCode) && (
          <>, {address.zipCode}</>
        )}
      </div>
      {('country' in address && address.country) && (
        <div className="text-sm">
          {t_countries(address.country)}
        </div>
      )}
    </div>
  )
}

export function ContactInfoSection({ profile }: ContactInfoSectionProps) {
  const t = useTranslations('registration')
  const t_messages = useTranslations('messages.components')
  const t_sections = useTranslations('components.sections')
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const profileAddrress = profile?.address ?? undefined

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(ContactInfoSchema),
    defaultValues: {
      email: profile?.email ?? undefined,
      phone: profile.phone ? {
        countryCode: profile.phone.countryCode,
        number: profile.phone.number
      } : undefined,
      address: {
        firstLine: profileAddrress?.firstLine ?? undefined,
        secondLine: profileAddrress?.secondLine ?? undefined,
        city: profileAddrress?.city ?? undefined,
        zipCode: profileAddrress?.zipCode ?? undefined,
        country: profileAddrress?.country ?? undefined,
      },
      addressInGabon: profile.addressInGabon || undefined,
    }
  })

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const data = form.getValues()

      const formData = new FormData()
      formData.append('contactInfo', JSON.stringify(data))

      const result = await updateProfile(formData, 'contactInfo')

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

  return (
    <EditableSection
      title={t_sections('contact_info')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
    >
      {isEditing ? (
        <ContactInfoForm
          form={form}
          onSubmit={handleSave}
          isLoading={isLoading}
        />
      ) : (
        <div className="space-y-4">
          {/* Coordonnées principales */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <InfoField
              label={t('form.email')}
              value={profile?.email}
              icon={<Mail className="h-4 w-4" />}
              required
            />
            <InfoField
              label={t('form.phone')}
              value={`${profile?.phone?.countryCode}${profile?.phone?.number}`}
              icon={<Phone className="h-4 w-4" />}
              required
            />
          </div>

          {/* Adresses */}
          <div className="grid gap-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-6">
              {profile.address ? (
                <AddressDisplay
                  address={profile.address}
                  title={t('form.current_address')}
                />
              ) : (
                <Badge variant="destructive">
                  {t('form.required')}
                </Badge>
              )}
            </div>

            <div className="space-y-6">
              {profile.addressInGabon ? (
                <AddressDisplay
                  address={profile.addressInGabon}
                  title={t('form.gabon_address')}
                />
              ) : (
                <Badge variant="outline">
                  {t('form.optional')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </EditableSection>
  )
}