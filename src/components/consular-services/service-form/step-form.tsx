'use client'
import { useTranslations } from 'next-intl'
import { ServiceStep } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { DynamicField } from './dynamic-field'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { FullProfile } from '@/types'

interface StepFormProps {
  step: ServiceStep
  profile: FullProfile | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function StepForm({
                           step,
                           profile,
                           onSubmit,
                           isLoading = false
                         }: StepFormProps) {
  const t = useTranslations('consular.services.form')

  // Parser les champs du JSON
  const fields = JSON.parse(step.fields as string)

  // Préparer les valeurs par défaut depuis le profil
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultValues = fields.reduce((acc: any, field: any) => {
    // Mapper les champs du formulaire avec les champs du profil
    const profileValue = getProfileValue(field.name, profile)
    if (profileValue !== undefined) {
      acc[field.name] = profileValue
    }
    return acc
  }, {})

  const form = useForm({
    defaultValues
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            {/* Message d'info pour les champs pré-remplis */}
            <Alert className="mb-6">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                {t('prefilled_fields_info')}
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">

              {// eslint-disable-next-line @typescript-eslint/no-explicit-any
                fields.map((field: any) => {
                const isPreFilled = defaultValues[field.name] !== undefined

                return (
                  <DynamicField
                    key={field.name}
                    data={field}
                    form={form}
                    isPreFilled={isPreFilled}
                    disabled={isPreFilled || isLoading}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

// Fonction utilitaire pour récupérer la valeur depuis le profil
function getProfileValue(fieldName: string, profile: FullProfile | null) {
  if (!profile) return undefined

  // Mapping des champs du formulaire vers les champs du profil
  const profileMapping: Record<string, keyof FullProfile> = {
    firstName: 'firstName',
    lastName: 'lastName',
    birthDate: 'birthDate',
    birthPlace: 'birthPlace',
    nationality: 'nationality',
    gender: 'gender',
    phone: 'phone',
    email: 'email',
    profession: 'profession',
    employer: 'employer',
    address: 'address',
    maritalStatus: 'maritalStatus',
    workStatus: 'workStatus',
    acquisitionMode: 'acquisitionMode',
    passportNumber: 'passportNumber',
    passportIssueDate: 'passportIssueDate',
    passportExpiryDate: 'passportExpiryDate',
    passportIssueAuthority: 'passportIssueAuthority',
    identityPicture: 'identityPicture',
    addressInGabon: 'addressInGabon',
    activityInGabon: 'activityInGabon',
    fatherFullName: 'fatherFullName',
    motherFullName: 'motherFullName',
    spouseFullName: 'spouseFullName',
    employerAddress: 'employerAddress',
  }

  const profileField = profileMapping[fieldName]
  if (!profileField) return undefined

  return profile[profileField]
}