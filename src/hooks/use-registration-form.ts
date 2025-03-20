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
import {
  ErrorMessageKey,
  extractFieldsFromObject,
  getValuable,
  removeNullOrUndefined,
} from '@/lib/utils';
import { FullProfile } from '@/types';
import { CountryCode, getCountryCode } from '@/lib/autocomplete-datas';
import {
  Gender,
  MaritalStatus,
  NationalityAcquisition,
  WorkStatus,
} from '@prisma/client';

const homeLandCountry = process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE as CountryCode;

export const documentsFields: (keyof FullProfile)[] = [
  'passport',
  'birthCertificate',
  'residencePermit',
  'addressProof',
];

export const basicInfoFields: (keyof FullProfile)[] = [
  'firstName',
  'lastName',
  'gender',
  'acquisitionMode',
  'birthDate',
  'birthPlace',
  'birthCountry',
  'nationality',
  'identityPicture',
  'passportNumber',
  'passportIssueDate',
  'passportExpiryDate',
  'passportIssueAuthority',
  'cardPin',
];

export const familyInfoFields: (keyof FullProfile)[] = [
  'maritalStatus',
  'fatherFullName',
  'motherFullName',
  'spouseFullName',
];

export const contactInfoFields: (keyof FullProfile)[] = [
  'email',
  'phoneNumber',
  'address',
  'residentContact',
  'homeLandContact',
];

export const professionalInfoFields: (keyof FullProfile)[] = [
  'workStatus',
  'profession',
  'employer',
  'employerAddress',
  'activityInGabon',
];

export function useRegistrationForm({ profile }: { profile: FullProfile }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorMessageKey | undefined>();
  const defaultNumber = `${getCountryCode(profile?.residenceCountyCode as CountryCode)}-`;
  const { saveData, loadSavedData, clearData } = createFormStorage('consular_form_data');
  const cleanedProfile = getValuable({ ...profile });

  const documentsFormData = extractFieldsFromObject(
    cleanedProfile,
    documentsFields,
  ) as DocumentsFormData;
  const basicInfoFormData = extractFieldsFromObject(
    {
      ...cleanedProfile,
      birthDate: cleanedProfile.birthDate?.toISOString().split('T')[0],
      passportIssueDate: cleanedProfile.passportIssueDate?.toISOString().split('T')[0],
      passportExpiryDate: cleanedProfile.passportExpiryDate?.toISOString().split('T')[0],
    },
    basicInfoFields,
  ) as BasicInfoFormData;
  const familyInfoFormData = extractFieldsFromObject(
    cleanedProfile,
    familyInfoFields,
  ) as FamilyInfoFormData;
  const contactInfoFormData = extractFieldsFromObject(
    cleanedProfile,
    contactInfoFields,
  ) as ContactInfoFormData;
  const professionalInfoFormData = extractFieldsFromObject(
    cleanedProfile,
    professionalInfoFields,
  ) as ProfessionalInfoFormData;

  const forms = {
    documents: useForm<DocumentsFormData>({
      resolver: zodResolver(DocumentsSchema),
      defaultValues: {
        ...documentsFormData,
      },
    }),
    basicInfo: useForm<BasicInfoFormData>({
      resolver: zodResolver(BasicInfoSchema),
      defaultValues: {
        ...basicInfoFormData,
        birthCountry: basicInfoFormData?.birthCountry ?? homeLandCountry,
        nationality: basicInfoFormData?.nationality ?? homeLandCountry,
        gender: basicInfoFormData?.gender ?? Gender.MALE,
        acquisitionMode:
          basicInfoFormData?.acquisitionMode ?? NationalityAcquisition.BIRTH,
      },
      reValidateMode: 'onBlur',
    }),
    familyInfo: useForm<FamilyInfoFormData>({
      resolver: zodResolver(FamilyInfoSchema),
      defaultValues: {
        ...familyInfoFormData,
        maritalStatus: familyInfoFormData?.maritalStatus ?? MaritalStatus.SINGLE,
      },
    }),
    contactInfo: useForm<ContactInfoFormData>({
      resolver: zodResolver(ContactInfoSchema),
      defaultValues: {
        ...contactInfoFormData,
        phoneNumber: contactInfoFormData?.phoneNumber ?? defaultNumber,
        address: {
          ...contactInfoFormData?.address,
          country:
            contactInfoFormData?.address?.country ??
            profile?.residenceCountyCode ??
            undefined,
        },
        residentContact: {
          ...contactInfoFormData?.residentContact,
          address: {
            ...contactInfoFormData?.residentContact?.address,
            country:
              contactInfoFormData?.residentContact?.address?.country ??
              profile?.residenceCountyCode ??
              undefined,
          },
          phoneNumber: contactInfoFormData?.residentContact?.phoneNumber ?? defaultNumber,
        },
      },
    }),
    professionalInfo: useForm<ProfessionalInfoFormData>({
      resolver: zodResolver(ProfessionalInfoSchema),
      defaultValues: {
        ...professionalInfoFormData,
        workStatus: professionalInfoFormData?.workStatus ?? WorkStatus.UNEMPLOYED,
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
