import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BasicInfoSchema,
  ContactInfoSchema,
  FamilyInfoSchema,
  ProfessionalInfoSchema,
  DocumentsSchema,
  ConsularFormData
} from '@/schemas/registration'
import { createFormStorage } from '@/lib/form-storage'

export function useRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const { saveData, loadSavedData, clearData } = createFormStorage('consular_form_data')

  // Initialisation des formulaires avec les données sauvegardées
  const initialData = loadSavedData()

  const forms = {
    documents: useForm({
      resolver: zodResolver(DocumentsSchema),
      defaultValues: initialData?.documents
    }),
    basicInfo: useForm({
      resolver: zodResolver(BasicInfoSchema),
      defaultValues: initialData?.basicInfo
    }),
    familyInfo: useForm({
      resolver: zodResolver(FamilyInfoSchema),
      defaultValues: initialData?.familyInfo
    }),
    contactInfo: useForm({
      resolver: zodResolver(ContactInfoSchema),
      defaultValues: initialData?.contactInfo
    }),
    professionalInfo: useForm({
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