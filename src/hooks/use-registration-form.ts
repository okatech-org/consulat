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
  ConsularFormData,
  DocumentsFormData,
  BasicInfoFormData,
  FamilyInfoFormData,
  ContactInfoFormData,
  ProfessionalInfoFormData,
  CreateProfileSchema,
  CreateProfileInput,
} from '@/schemas/registration';
import { createFormStorage } from '@/lib/form-storage';
import { Gender, NationalityAcquisition } from '@prisma/client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { CountryCode, getCountryCode } from '@/lib/autocomplete-datas';
import { useSearchParams } from 'next/navigation';

const residenceCountryCode = process.env.NEXT_PUBLIC_RESIDENT_COUNTRY_CODE as
  | CountryCode
  | undefined;
const homeLandCountryCode = process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE as
  | CountryCode
  | undefined;

export function useRegistrationForm() {
  const currentUser = useCurrentUser();
  const params = useSearchParams();
  const residenceCountry = (params.get('country') as CountryCode) ?? residenceCountryCode;

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { saveData, loadSavedData, clearData } = createFormStorage('consular_form_data');

  // Initialisation des formulaires avec les données sauvegardées
  const initialData = loadSavedData();

  function getDefaultPhone() {
    if (currentUser?.phone) {
      return {
        number: currentUser.phone.number,
        countryCode: currentUser.phone.countryCode,
      };
    }
    return (
      initialData?.contactInfo?.phone ?? {
        ...initialData?.contactInfo?.phone,
        ...(residenceCountry && {
          countryCode:
            initialData?.contactInfo?.phone?.countryCode ??
            getCountryCode(residenceCountry),
        }),
      }
    );
  }

  const forms = {
    newProfile: useForm<CreateProfileInput>({
      resolver: zodResolver(CreateProfileSchema),
      defaultValues: {
        ...initialData?.newProfile,
        residenceCountyCode: residenceCountry,
        phone: {
          ...initialData?.newProfile?.phone,
          ...(residenceCountry && {
            countryCode:
              initialData?.newProfile?.phone?.countryCode ??
              getCountryCode(residenceCountry),
          }),
        },
      },
    }),
    documents: useForm<DocumentsFormData>({
      resolver: zodResolver(DocumentsSchema),
      defaultValues: initialData?.documents,
    }),
    basicInfo: useForm<BasicInfoFormData>({
      resolver: zodResolver(BasicInfoSchema),
      defaultValues: {
        ...initialData?.basicInfo,
        acquisitionMode:
          initialData?.basicInfo?.acquisitionMode ?? NationalityAcquisition.BIRTH,
        gender: initialData?.basicInfo?.gender ?? Gender.MALE,
        ...(homeLandCountryCode && {
          nationality: initialData?.basicInfo?.nationality ?? homeLandCountryCode,
          birthCountry: initialData?.basicInfo?.birthCountry ?? homeLandCountryCode,
        }),
      },
    }),
    familyInfo: useForm<FamilyInfoFormData>({
      resolver: zodResolver(FamilyInfoSchema),
      defaultValues: {
        ...initialData?.familyInfo,
        maritalStatus: initialData?.familyInfo?.maritalStatus ?? 'SINGLE',
      },
    }),
    contactInfo: useForm<ContactInfoFormData>({
      resolver: zodResolver(ContactInfoSchema),
      defaultValues: {
        ...initialData?.contactInfo,
        phone: getDefaultPhone(),
        email: currentUser?.email ?? initialData?.contactInfo?.email,
        address: {
          ...initialData?.contactInfo?.address,
          ...(residenceCountry && {
            country: residenceCountry,
          }),
        },
        residentContact: {
          ...initialData?.contactInfo?.residentContact,
          address: {
            ...initialData?.contactInfo?.residentContact?.address,
            country: residenceCountry,
          },
          phone: {
            ...initialData?.contactInfo?.residentContact?.phone,
            ...(residenceCountry && {
              countryCode:
                initialData?.contactInfo?.residentContact?.phone?.countryCode ??
                getCountryCode(residenceCountry),
            }),
          },
        },
      },
    }),
    professionalInfo: useForm<ProfessionalInfoFormData>({
      resolver: zodResolver(ProfessionalInfoSchema),
      defaultValues: initialData?.professionalInfo,
    }),
  };

  // Sauvegarde automatique des données
  const handleDataChange = useCallback(
    (newData: Partial<ConsularFormData>) => {
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
