'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  BasicInfoSchema,
  ContactInfoSchema,
  FamilyInfoSchema,
  ProfessionalInfoSchema,
  DocumentsSchema,
  type DocumentsFormData,
  type BasicInfoFormData,
  type FamilyInfoFormData,
  type ContactInfoFormData,
  type ProfessionalInfoFormData,
} from '@/schemas/registration';
import { createFormStorage } from '@/lib/form-storage';
import {
  type ErrorMessageKey,
  extractFieldsFromObject,
  getValuable,
  tryCatch,
} from '@/lib/utils';
import { type CountryCode, getCountryCode } from '@/lib/autocomplete-datas';
import {
  MaritalStatus,
  NationalityAcquisition,
  WorkStatus,
} from '@/convex/lib/constants';
import type { CompleteProfile } from '@/convex/lib/types';

const homeLandCountry = process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE as CountryCode;

// Constantes pour les champs de chaque section - correspondent exactement à Convex
export const documentsFields = [
  'passport',
  'birthCertificate',
  'residencePermit',
  'addressProof',
] as const;

export const basicInfoFields = [
  'firstName',
  'lastName',
  'gender',
  'acquisitionMode',
  'birthDate',
  'birthPlace',
  'birthCountry',
  'nationality',
  'passportInfos',
  'nipCode',
  'identityPicture',
] as const;

export const familyInfoFields = ['maritalStatus', 'father', 'mother', 'spouse'] as const;

export const contactInfoFields = ['email', 'phone', 'address'] as const;

export const professionalInfoFields = [
  'workStatus',
  'profession',
  'employer',
  'employerAddress',
  'activityInGabon',
] as const;

export function useRegistrationForm({ profile }: { profile: CompleteProfile }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorMessageKey | undefined>();
  const defaultNumber = `${getCountryCode(profile?.residenceCountry as CountryCode)}-`;
  const { saveData, loadSavedData, clearData } = createFormStorage('consular_form_data');
  const cleanedProfile = getValuable({ ...profile });

  // Mutations Convex pour mettre à jour le profil
  const updatePersonalInfo = useMutation(api.functions.profile.updatePersonalInfo);
  const updateFamilyInfo = useMutation(api.functions.profile.updateFamilyInfo);
  const updateProfessionalInfo = useMutation(
    api.functions.profile.updateProfessionalInfo,
  );
  const updateContacts = useMutation(api.functions.profile.updateContacts);

  // Extraction directe des données Convex - pas de conversions complexes
  const documentsFormData = extractFieldsFromObject(
    {
      passport: cleanedProfile.passport
        ? { ...cleanedProfile.passport, id: cleanedProfile.passport._id }
        : undefined,
      birthCertificate: cleanedProfile.birthCertificate
        ? { ...cleanedProfile.birthCertificate, id: cleanedProfile.birthCertificate._id }
        : undefined,
      residencePermit: cleanedProfile.residencePermit
        ? { ...cleanedProfile.residencePermit, id: cleanedProfile.residencePermit._id }
        : undefined,
      addressProof: cleanedProfile.addressProof
        ? { ...cleanedProfile.addressProof, id: cleanedProfile.addressProof._id }
        : undefined,
    },
    documentsFields,
  ) as DocumentsFormData;

  const basicInfoFormData = extractFieldsFromObject(
    {
      ...cleanedProfile.personal,
      // Conversion minimale des dates pour l'interface
      birthDate: cleanedProfile.personal?.birthDate
        ? new Date(cleanedProfile.personal.birthDate).toISOString().split('T')[0]
        : undefined,
      passportInfos: cleanedProfile.personal?.passportInfos
        ? {
            ...cleanedProfile.personal.passportInfos,
            issueDate: cleanedProfile.personal.passportInfos.issueDate
              ? new Date(cleanedProfile.personal.passportInfos.issueDate)
                  .toISOString()
                  .split('T')[0]
              : undefined,
            expiryDate: cleanedProfile.personal.passportInfos.expiryDate
              ? new Date(cleanedProfile.personal.passportInfos.expiryDate)
                  .toISOString()
                  .split('T')[0]
              : undefined,
          }
        : undefined,
      identityPicture: cleanedProfile.identityPicture
        ? { ...cleanedProfile.identityPicture, id: cleanedProfile.identityPicture._id }
        : undefined,
    },
    basicInfoFields,
  ) as BasicInfoFormData;

  const familyInfoFormData = extractFieldsFromObject(
    cleanedProfile.family || {},
    familyInfoFields,
  ) as FamilyInfoFormData;

  const contactInfoFormData = extractFieldsFromObject(
    cleanedProfile.contacts || {},
    contactInfoFields,
  ) as ContactInfoFormData;

  const professionalInfoFormData = extractFieldsFromObject(
    cleanedProfile.professionSituation || {},
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
        nationality: basicInfoFormData?.nationality ?? homeLandCountry,
        gender: basicInfoFormData?.gender,
        acquisitionMode:
          basicInfoFormData?.acquisitionMode ?? NationalityAcquisition.Birth,
      },
      reValidateMode: 'onBlur',
    }),
    familyInfo: useForm<FamilyInfoFormData>({
      resolver: zodResolver(FamilyInfoSchema),
      defaultValues: {
        ...familyInfoFormData,
        maritalStatus: familyInfoFormData?.maritalStatus ?? MaritalStatus.Single,
      },
    }),
    contactInfo: useForm<ContactInfoFormData>({
      resolver: zodResolver(ContactInfoSchema),
      defaultValues: {
        ...contactInfoFormData,
        phone: contactInfoFormData?.phone ?? defaultNumber,
      },
    }),
    professionalInfo: useForm<ProfessionalInfoFormData>({
      resolver: zodResolver(ProfessionalInfoSchema),
      defaultValues: {
        ...professionalInfoFormData,
        workStatus: professionalInfoFormData?.workStatus ?? WorkStatus.Unemployed,
      },
    }),
  };

  // Fonctions de mapping simplifiées - correspondent directement à Convex
  const mapBasicInfoToConvex = useCallback((data: BasicInfoFormData) => {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      acquisitionMode: data.acquisitionMode,
      birthDate: data.birthDate ? new Date(data.birthDate).getTime() : undefined,
      birthPlace: data.birthPlace,
      birthCountry: data.birthCountry,
      nationality: data.nationality,
      passportInfos: data.passportInfos
        ? {
            number: data.passportInfos.number,
            issueDate: data.passportInfos.issueDate
              ? new Date(data.passportInfos.issueDate).getTime()
              : undefined,
            expiryDate: data.passportInfos.expiryDate
              ? new Date(data.passportInfos.expiryDate).getTime()
              : undefined,
            issueAuthority: data.passportInfos.issueAuthority,
          }
        : undefined,
      nipCode: data.nipCode,
    };
  }, []);

  const mapFamilyInfoToConvex = useCallback((data: FamilyInfoFormData) => {
    return {
      maritalStatus: data.maritalStatus,
      father: data.father,
      mother: data.mother,
      spouse: data.spouse,
    };
  }, []);

  const mapContactInfoToConvex = useCallback((data: ContactInfoFormData) => {
    return {
      email: data.email,
      phone: data.phone || undefined,
      address: data.address
        ? {
            street: data.address.firstLine,
            city: data.address.city,
            postalCode: data.address.zipCode || '',
            country: data.address.country,
            complement: data.address.secondLine || undefined,
          }
        : undefined,
    };
  }, []);

  const mapProfessionalInfoToConvex = useCallback((data: ProfessionalInfoFormData) => {
    return {
      workStatus: data.workStatus,
      profession: data.profession,
      employer: data.employer,
      employerAddress: data.employerAddress,
      activityInGabon: data.activityInGabon,
    };
  }, []);

  // Sauvegarde automatique des données
  const handleDataChange = useCallback(
    (data: Record<string, unknown>) => {
      const currentData = loadSavedData();

      saveData({
        ...currentData,
        ...data,
      });
    },
    [saveData, loadSavedData],
  );

  // Sauvegarde des données vers Convex
  const saveToConvex = useCallback(
    async (
      step: keyof typeof forms,
      formData: Record<string, unknown>,
    ): Promise<unknown> => {
      if (!profile?._id) return undefined;

      const { error } = await tryCatch(
        (async () => {
          switch (step) {
            case 'basicInfo':
              await updatePersonalInfo({
                profileId: profile._id,
                personal: mapBasicInfoToConvex(formData as BasicInfoFormData),
              });
              break;
            case 'familyInfo':
              await updateFamilyInfo({
                profileId: profile._id,
                family: mapFamilyInfoToConvex(formData as FamilyInfoFormData),
              });
              break;
            case 'contactInfo':
              await updateContacts({
                profileId: profile._id,
                contacts: mapContactInfoToConvex(formData as ContactInfoFormData),
              });
              break;
            case 'professionalInfo':
              await updateProfessionalInfo({
                profileId: profile._id,
                professionSituation: mapProfessionalInfoToConvex(
                  formData as ProfessionalInfoFormData,
                ),
              });
              break;
          }
        })(),
      );

      if (error) {
        console.error('Erreur lors de la sauvegarde vers Convex:', error);
        throw error;
      }

      return undefined;
    },
    [
      profile?._id,
      updatePersonalInfo,
      updateFamilyInfo,
      updateContacts,
      updateProfessionalInfo,
      mapBasicInfoToConvex,
      mapFamilyInfoToConvex,
      mapContactInfoToConvex,
      mapProfessionalInfoToConvex,
    ],
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
    saveToConvex,
  };
}
