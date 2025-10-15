import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFormStorage } from '@/lib/form-storage';
import { Gender, NationalityAcquisition, ParentalRole } from '@/convex/lib/constants';
import {
  type ChildCompleteFormData,
  type ChildDocumentsFormData,
  type ChildBasicInfoFormData,
  type LinkFormData,
  LinkInfoSchema,
  ChildBasicInfoSchema,
} from '@/schemas/child-registration';
import { UserDocumentSchema } from '@/schemas/inputs';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { tryCatch } from '@/lib/utils';
import type { CountryCode } from '@/lib/autocomplete-datas';

const homeLandCountry = process.env.NEXT_PUBLIC_BASE_COUNTRY_CODE as CountryCode;

export function useChildRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [profileId, setProfileId] = useState<Id<'childProfiles'> | undefined>();
  const { saveData, loadSavedData, clearData } = createFormStorage(
    'child_registration_form_data',
  );

  // Convex mutations
  const createChildProfile = useMutation(api.functions.childProfile.createChildProfile);
  const updateChildPersonalInfo = useMutation(
    api.functions.childProfile.updateChildPersonalInfo,
  );

  // Initialisation des formulaires avec les données sauvegardées
  const initialData = loadSavedData();

  const forms = {
    link: useForm<LinkFormData>({
      resolver: zodResolver(LinkInfoSchema),
      defaultValues: {
        ...initialData?.link,
        firstName: initialData?.link?.firstName ?? '',
        lastName: initialData?.link?.lastName ?? '',
        parentRole: initialData?.link?.parentRole ?? ParentalRole.Father,
        hasOtherParent: initialData?.link?.hasOtherParent ?? false,
      },
    }),
    documents: useForm<ChildDocumentsFormData>({
      resolver: zodResolver(
        z.object({
          passport: UserDocumentSchema.optional(),
          birthCertificate: UserDocumentSchema,
          residencePermit: UserDocumentSchema.nullable().optional(),
          addressProof: UserDocumentSchema.optional().nullable(),
        }),
      ),
      defaultValues: initialData?.documents,
    }),
    basicInfo: useForm<ChildBasicInfoFormData>({
      resolver: zodResolver(ChildBasicInfoSchema),
      defaultValues: {
        ...initialData?.basicInfo,
        acquisitionMode:
          initialData?.basicInfo?.acquisitionMode ?? NationalityAcquisition.Birth,
        gender: initialData?.basicInfo?.gender ?? Gender.Male,
        nationality: initialData?.basicInfo?.nationality ?? homeLandCountry,
        birthCountry: initialData?.basicInfo?.birthCountry ?? homeLandCountry,
      },
    }),
  };

  // Mapping functions for Convex
  const mapBasicInfoToConvex = useCallback((data: ChildBasicInfoFormData) => {
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

  // Create child profile
  const createProfile = useCallback(
    async (linkData: LinkFormData, authorUserId: Id<'users'>) => {
      const { error, data } = await tryCatch(
        createChildProfile({
          authorUserId,
          firstName: linkData.firstName,
          lastName: linkData.lastName,
          parentRole: linkData.parentRole,
          hasOtherParent: linkData.hasOtherParent,
          otherParentFirstName: linkData.otherParentFirstName,
          otherParentLastName: linkData.otherParentLastName,
          otherParentEmail: linkData.otherParentEmail,
          otherParentPhone: linkData.otherParentPhone,
          otherParentRole: linkData.otherParentRole,
        }),
      );

      if (error) {
        console.error('Error creating child profile:', error);
        throw error;
      }

      return data;
    },
    [createChildProfile],
  );

  // Update child personal info
  const updateBasicInfo = useCallback(
    async (childProfileId: Id<'childProfiles'>, data: ChildBasicInfoFormData) => {
      const { error } = await tryCatch(
        updateChildPersonalInfo({
          childProfileId,
          personal: mapBasicInfoToConvex(data),
        }),
      );

      if (error) {
        console.error('Error updating child personal info:', error);
        throw error;
      }
    },
    [updateChildPersonalInfo, mapBasicInfoToConvex],
  );

  // Sauvegarde automatique des données
  const handleDataChange = useCallback(
    (newData: Partial<ChildCompleteFormData>) => {
      const currentData = loadSavedData();
      saveData({
        ...currentData,
        ...newData,
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
    profileId,
    setProfileId,
    createProfile,
    updateBasicInfo,
  };
}
