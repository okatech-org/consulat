import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BasicInfoSchema,
  DocumentsSchema,
  BasicInfoFormData,
} from '@/schemas/registration';
import { createFormStorage } from '@/lib/form-storage';
import { Gender, NationalityAcquisition } from '@prisma/client';
import {
  ChildCompleteFormData,
  ChildDocumentsFormData,
  LinkFormData,
  LinkInfoSchema,
} from '@/schemas/child-registration';

export function useChildRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { saveData, loadSavedData, clearData } = createFormStorage('consular_form_data');

  // Initialisation des formulaires avec les données sauvegardées
  const initialData = loadSavedData();

  const forms = {
    link: useForm<LinkFormData>({
      resolver: zodResolver(LinkInfoSchema),
      defaultValues: { ...initialData?.link, hasOtherParent: false },
    }),
    documents: useForm<ChildDocumentsFormData>({
      resolver: zodResolver(DocumentsSchema),
      defaultValues: initialData?.documents,
    }),
    basicInfo: useForm<BasicInfoFormData>({
      resolver: zodResolver(
        BasicInfoSchema.omit({
          passportNumber: true,
          passportIssueDate: true,
          passportExpiryDate: true,
          passportIssueAuthority: true,
        }),
      ),
      defaultValues: {
        ...initialData?.basicInfo,
        acquisitionMode:
          initialData?.basicInfo?.acquisitionMode ?? NationalityAcquisition.BIRTH,
        gender: initialData?.basicInfo?.gender ?? Gender.MALE,
        nationality: initialData?.basicInfo?.nationality ?? 'GA',
        birthCountry: initialData?.basicInfo?.birthCountry ?? 'GA',
      },
    }),
  };

  // Sauvegarde automatique des données
  const handleDataChange = useCallback(
    (newData: Partial<ChildCompleteFormData>) => {
      saveData(newData);
    },
    [saveData],
  );

  return {
    currentStep,
    setCurrentStep,
    isLoading,
    setIsLoading,
    error,
    setError,
    forms,
    handleDataChange,
    clearData,
  };
}
