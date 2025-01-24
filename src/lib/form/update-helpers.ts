import { UseFormReturn } from 'react-hook-form';
import {
  BasicInfoFormData,
  ContactInfoFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration';
import { AnalysisData } from '@/types';

/**
 * Type utilitaire pour vérifier si une valeur est non nulle et non vide
 */
function isValidValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Fonction utilitaire pour mettre à jour un champ de formulaire
 */
function updateFormField<T>(
  form: UseFormReturn<T>,
  fieldName: keyof T,
  value: unknown,
  options: {
    shouldValidate?: boolean;
    shouldDirty?: boolean;
  } = {},
) {
  if (isValidValue(value)) {
    form.setValue(fieldName as string, value, {
      shouldValidate: options.shouldValidate ?? true,
      shouldDirty: options.shouldDirty ?? true,
    });
  }
}

/**
 * Type pour représenter la mise à jour d'un objet imbriqué
 */
type NestedUpdate<T> = {
  path: (keyof T)[];
  value: unknown;
};

/**
 * Fonction pour mettre à jour un objet imbriqué dans le formulaire
 */
function updateNestedField<T>(
  form: UseFormReturn<T>,
  update: NestedUpdate<T>,
  options: {
    shouldValidate?: boolean;
    shouldDirty?: boolean;
  } = {},
) {
  if (isValidValue(update.value)) {
    const fieldPath = update.path.join('.');
    form.setValue(fieldPath as unknown, update.value, {
      shouldValidate: options.shouldValidate ?? true,
      shouldDirty: options.shouldDirty ?? true,
    });
  }
}

// Fonction principale pour mettre à jour les formulaires
export function updateFormsFromAnalysis(
  data: AnalysisData,
  forms: {
    basicInfo: UseFormReturn<BasicInfoFormData>;
    contactInfo: UseFormReturn<ContactInfoFormData>;
    familyInfo: UseFormReturn<FamilyInfoFormData>;
    professionalInfo: UseFormReturn<ProfessionalInfoFormData>;
  },
) {
  // Mise à jour des informations de base
  const basicInfoUpdates = [
    { field: 'firstName', value: data.firstName },
    { field: 'lastName', value: data.lastName },
    { field: 'gender', value: data.gender },
    { field: 'birthDate', value: data.birthDate },
    { field: 'birthPlace', value: data.birthPlace },
    { field: 'birthCountry', value: data.birthCountry },
    { field: 'nationality', value: data.nationality },
    { field: 'acquisitionMode', value: data.acquisitionMode },
    { field: 'passportNumber', value: data.passportNumber },
    { field: 'passportIssueDate', value: data.passportIssueDate },
    { field: 'passportExpiryDate', value: data.passportExpiryDate },
    { field: 'passportIssueAuthority', value: data.passportIssueAuthority },
  ];

  basicInfoUpdates.forEach(({ field, value }) => {
    updateFormField(forms.basicInfo, field as keyof BasicInfoFormData, value);
  });

  // Mise à jour de l'adresse
  if (data.address) {
    const addressUpdates: NestedUpdate<ContactInfoFormData>[] = [
      { path: ['address', 'firstLine'], value: data.address.firstLine },
      { path: ['address', 'secondLine'], value: data.address.secondLine },
      { path: ['address', 'city'], value: data.address.city },
      { path: ['address', 'zipCode'], value: data.address.zipCode },
      { path: ['address', 'country'], value: data.address.country },
    ];

    addressUpdates.forEach((update) => {
      updateNestedField(forms.contactInfo, update);
    });
  }

  // Mise à jour des informations familiales
  const familyUpdates = [
    { field: 'maritalStatus', value: data.maritalStatus },
    { field: 'fatherFullName', value: data.fatherFullName },
    { field: 'motherFullName', value: data.motherFullName },
  ];

  familyUpdates.forEach(({ field, value }) => {
    updateFormField(forms.familyInfo, field as keyof FamilyInfoFormData, value);
  });

  // Mise à jour des informations professionnelles
  const professionalUpdates = [
    { field: 'workStatus', value: data.workStatus },
    { field: 'profession', value: data.profession },
    { field: 'employer', value: data.employer },
    { field: 'employerAddress', value: data.employerAddress },
  ];

  professionalUpdates.forEach(({ field, value }) => {
    updateFormField(
      forms.professionalInfo,
      field as keyof ProfessionalInfoFormData,
      value,
    );
  });

  return {
    hasBasicInfo: basicInfoUpdates.some(({ value }) => isValidValue(value)),
    hasContactInfo: data.address !== undefined,
    hasFamilyInfo: familyUpdates.some(({ value }) => isValidValue(value)),
    hasProfessionalInfo: professionalUpdates.some(({ value }) => isValidValue(value)),
  };
}
