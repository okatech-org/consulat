import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BasicInfoSchema,
  ContactInfoSchema,
  FamilyInfoSchema,
  ProfessionalInfoSchema,
  DocumentsSchema,
  ConsularFormData,
  DocumentsFormData,
  BasicInfoFormData,
  FamilyInfoFormData,
  ContactInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration'
import { createFormStorage } from '@/lib/form-storage'
import { Gender, NationalityAcquisition } from '@prisma/client'
import { useCurrentUser } from '@/hooks/use-current-user'

export function useRegistrationForm() {
  const currentUser = useCurrentUser()

  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const { saveData, loadSavedData, clearData } = createFormStorage('consular_form_data')

  // Initialisation des formulaires avec les données sauvegardées
  const initialData = loadSavedData()

  function getDefaultPhone() {
    if (currentUser?.phone) {
      return {
        number: currentUser.phone.number,
        countryCode: currentUser.phone.countryCode
      }
    }
    return initialData?.contactInfo?.phone ?? { number: '', countryCode: '+33' }
  }

  const forms = {
    documents: useForm<DocumentsFormData>({
      resolver: zodResolver(DocumentsSchema),
      defaultValues: initialData?.documents
    }),
    basicInfo: useForm<BasicInfoFormData>({
      resolver: zodResolver(BasicInfoSchema),
      defaultValues: {
        ...initialData?.basicInfo,
        acquisitionMode: initialData?.basicInfo?.acquisitionMode ?? NationalityAcquisition.BIRTH,
        gender: initialData?.basicInfo?.gender ?? Gender.MALE,
        nationality: initialData?.basicInfo?.nationality ?? 'gabon',
        birthCountry: initialData?.basicInfo?.birthCountry ?? 'gabon'
      }
    }),
    familyInfo: useForm<FamilyInfoFormData>({
      resolver: zodResolver(FamilyInfoSchema),
      defaultValues: {
        ...initialData?.familyInfo,
        maritalStatus: initialData?.familyInfo?.maritalStatus ?? 'SINGLE'
      }
    }),
    contactInfo: useForm<ContactInfoFormData>({
      resolver: zodResolver(ContactInfoSchema),
      defaultValues: {
        ...initialData?.contactInfo,
        phone: getDefaultPhone(),
        email: currentUser?.email ?? initialData?.contactInfo?.email ?? ''
      }
    }),
    professionalInfo: useForm<ProfessionalInfoFormData>({
      resolver: zodResolver(ProfessionalInfoSchema),
      defaultValues: initialData?.professionalInfo
    })
  }

  // Sauvegarde automatique des données
  const handleDataChange = useCallback((newData: Partial<ConsularFormData>) => {
    saveData(newData)
  }, [saveData])

  return {
    currentStep,
    setCurrentStep,
    isLoading,
    setIsLoading,
    error,
    setError,
    forms,
    handleDataChange,
    clearData
  }
}