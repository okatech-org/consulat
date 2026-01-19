import {
  type BasicInfoFormData,
  type DocumentsFormData,
  type ProfessionalInfoFormData,
  type ContactInfoFormData,
  type FamilyInfoFormData,
} from '@/schemas/registration';
import type { UseFormReturn, FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';

export async function validateStep(
  step: number,
  forms: {
    documents: UseFormReturn<DocumentsFormData>;
    basicInfo: UseFormReturn<BasicInfoFormData>;
    familyInfo: UseFormReturn<FamilyInfoFormData>;
    contactInfo: UseFormReturn<ContactInfoFormData>;
    professionalInfo: UseFormReturn<ProfessionalInfoFormData>;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ isValid: boolean; data?: any }> {
  try {
    switch (step) {
      case 0: {
        // Documents
        const isDocumentsValid = await forms.documents.trigger();
        if (!isDocumentsValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.documents.getValues(),
        };
      }

      case 1: {
        // Informations de base
        const isBasicInfoValid = await forms.basicInfo.trigger();
        if (!isBasicInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.basicInfo.getValues(),
        };
      }

      case 2: { // Informations familiales
        const isFamilyInfoValid = await forms.familyInfo.trigger();
        if (!isFamilyInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.familyInfo.getValues(),
        };
      }
      case 3: { // Informations de contact
        const isContactInfoValid = await forms.contactInfo.trigger();
        if (!isContactInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.contactInfo.getValues(),
        };
      }
      case 4: { // Informations professionnelles
        const isProfessionalInfoValid = await forms.professionalInfo.trigger();
        if (!isProfessionalInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.professionalInfo.getValues(),
        };
      }
      case 5: { // Révision
        return { isValid: true, data: {} };
      }

      default:
        return { isValid: false };
    }
  } catch (error) {
    console.error('Validation error:', error);
    return { isValid: false };
  }
}

/**
 * Scroll to the first error field in the form
 * Handles nested field names (e.g., "emergencyContacts.0.firstName")
 */
export function scrollToFirstError(errors: FieldErrors): void {
  const getFirstErrorField = (errors: any, prefix = ''): string | null => {
    for (const key in errors) {
      const fieldName = prefix ? `${prefix}.${key}` : key;

      // Check if this field has a direct error message
      if (errors[key]?.message) {
        return fieldName;
      }

      // Check if this is a nested object with errors
      if (typeof errors[key] === 'object' && !errors[key]?.message) {
        const nested = getFirstErrorField(errors[key], fieldName);
        if (nested) return nested;
      }
    }
    return null;
  };

  const firstErrorField = getFirstErrorField(errors);

  if (firstErrorField) {
    // Try to find the element by name attribute
    const errorElement = document.querySelector(`[name="${firstErrorField}"]`);

    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Focus the element if it's focusable
      if (errorElement instanceof HTMLElement && 'focus' in errorElement) {
        setTimeout(() => {
          (errorElement as any).focus();
        }, 300);
      }
    }
  }
}

/**
 * Generic error handler for form submissions
 * Displays errors in toast and scrolls to first error
 */
export function handleFormInvalid(
  errors: FieldErrors,
  getFieldLabel: (field: string) => string,
): void {
  console.log('Validation errors:', errors);

  // Scroll to first error
  scrollToFirstError(errors);

  // Get invalid field names
  const getInvalidFieldNames = (errors: any, prefix = ''): string[] => {
    const fields: string[] = [];

    for (const key in errors) {
      const fieldName = prefix ? `${prefix}.${key}` : key;

      if (errors[key]?.message) {
        fields.push(fieldName);
      } else if (typeof errors[key] === 'object') {
        fields.push(...getInvalidFieldNames(errors[key], fieldName));
      }
    }

    return fields;
  };

  const invalidFieldNames = getInvalidFieldNames(errors);
  const invalidFields = invalidFieldNames
    .map((field) => getFieldLabel(field))
    .filter(Boolean)
    .join(', ');

  toast.error('Champs invalides ou manquants', {
    description: invalidFields
      ? `Champs à corriger : ${invalidFields}`
      : 'Veuillez corriger les champs invalides avant de continuer',
  });
}
