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
import { ErrorMessageKey, removeNullValues } from '@/lib/utils';
import { FullProfile } from '@/types';
import { CountryCode, getCountryCode } from '@/lib/autocomplete-datas';

const homeLandCountry = process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE as CountryCode;

export function useRegistrationForm({ profile }: { profile: FullProfile | null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorMessageKey | undefined>();
  const { saveData, loadSavedData, clearData } = createFormStorage('consular_form_data');
  const cleanedProfile = removeNullValues({ ...profile });

  const forms = {
    documents: useForm<DocumentsFormData>({
      resolver: zodResolver(DocumentsSchema),
      // @ts-expect-error - TODO: fix this, don't want to deal with the null values
      defaultValues: {
        ...(cleanedProfile?.passport && { passport: cleanedProfile.passport }),
        ...(cleanedProfile?.birthCertificate && {
          birthCertificate: cleanedProfile.birthCertificate,
        }),
        ...(cleanedProfile?.residencePermit && {
          residencePermit: cleanedProfile.residencePermit,
        }),
        ...(cleanedProfile?.addressProof && {
          addressProof: cleanedProfile.addressProof,
        }),
      },
    }),
    basicInfo: useForm<BasicInfoFormData>({
      resolver: zodResolver(BasicInfoSchema),
      // @ts-expect-error - TODO: fix this, don't want to deal with the null values
      defaultValues: {
        ...cleanedProfile,
        birthCountry: cleanedProfile?.birthCountry ?? homeLandCountry,
        nationality: cleanedProfile?.nationality ?? homeLandCountry,
      },
      reValidateMode: 'onBlur',
    }),
    familyInfo: useForm<FamilyInfoFormData>({
      resolver: zodResolver(FamilyInfoSchema),
      // @ts-expect-error - TODO: fix this, don't want to deal with the null values
      defaultValues: {
        ...cleanedProfile,
      },
    }),
    contactInfo: useForm<ContactInfoFormData>({
      resolver: zodResolver(ContactInfoSchema),
      // @ts-expect-error - TODO: fix this, don't want to deal with the null values
      defaultValues: {
        ...cleanedProfile,
        phone: {
          ...cleanedProfile?.phone,
          countryCode:
            cleanedProfile?.phone?.countryCode ?? profile?.user?.countryCode ?? undefined,
        },
        address: {
          ...cleanedProfile?.address,
          country:
            cleanedProfile?.address?.country ?? profile?.residenceCountyCode ?? undefined,
        },
        residentContact: {
          ...cleanedProfile?.residentContact,
          address: {
            ...cleanedProfile?.residentContact?.address,
            country:
              cleanedProfile?.residentContact?.address?.country ??
              profile?.residenceCountyCode ??
              undefined,
          },
          phone: {
            ...cleanedProfile?.residentContact?.phone,
            countryCode:
              profile?.user?.phone?.countryCode ??
              getCountryCode(profile?.residenceCountyCode as CountryCode),
          },
        },
      },
    }),
    professionalInfo: useForm<ProfessionalInfoFormData>({
      resolver: zodResolver(ProfessionalInfoSchema),
      // @ts-expect-error - TODO: fix this, don't want to deal with the null values
      defaultValues: {
        ...cleanedProfile,
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
