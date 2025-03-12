'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BasicInfoSchema,
  ContactInfoSchema,
  FamilyInfoSchema,
  ProfessionalInfoSchema,
  DocumentsSchema,
  FullProfileUpdateFormData,
  DocumentsFormData,
  BasicInfoFormData,
  FamilyInfoFormData,
  ContactInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration';
import { createFormStorage } from '@/lib/form-storage';
import { CountryCode } from '@/lib/autocomplete-datas';
import { ErrorMessageKey } from '@/lib/utils';
import { FullProfile } from '@/types';

const homeLandCountryCode = process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE as
  | CountryCode
  | undefined;

export function useRegistrationForm({ profile }: { profile: FullProfile | null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorMessageKey | undefined>();
  const { saveData, loadSavedData, clearData } = createFormStorage('consular_form_data');

  const forms = {
    documents: useForm<DocumentsFormData>({
      resolver: zodResolver(DocumentsSchema),
      // @ts-expect-error - TODO: fix this, don't want to deal with the null values
      defaultValues: {
        ...(profile?.passport && { passport: profile.passport }),
        ...(profile?.birthCertificate && { birthCertificate: profile.birthCertificate }),
        ...(profile?.residencePermit && { residencePermit: profile.residencePermit }),
        ...(profile?.addressProof && { addressProof: profile.addressProof }),
      },
    }),
    basicInfo: useForm<BasicInfoFormData>({
      resolver: zodResolver(BasicInfoSchema),
    }),
    familyInfo: useForm<FamilyInfoFormData>({
      resolver: zodResolver(FamilyInfoSchema),
      // @ts-expect-error - TODO: fix this, don't want to deal with the null values
      defaultValues: {
        ...profile,
      },
    }),
    contactInfo: useForm<ContactInfoFormData>({
      resolver: zodResolver(ContactInfoSchema),
      // @ts-expect-error - TODO: fix this, don't want to deal with the null values
      defaultValues: {
        ...profile,
      },
    }),
    professionalInfo: useForm<ProfessionalInfoFormData>({
      resolver: zodResolver(ProfessionalInfoSchema),
      // @ts-expect-error - TODO: fix this, don't want to deal with the null values
      defaultValues: {
        ...profile,
      },
    }),
  };

  // Sauvegarde automatique des données
  const handleDataChange = useCallback(
    (
      data: Record<
        keyof FullProfileUpdateFormData,
        FullProfileUpdateFormData[keyof FullProfileUpdateFormData]
      >,
    ) => {
      const currentData = loadSavedData();

      saveData({
        ...currentData,
        ...data,
      });
    },
    [saveData, loadSavedData],
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
