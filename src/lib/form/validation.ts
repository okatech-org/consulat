import {
  BasicInfoFormData,
  DocumentsFormData,
  ProfessionalInfoFormData,
  ContactInfoFormData,
  FamilyInfoFormData,
} from '@/schemas/registration';
import { UseFormReturn } from 'react-hook-form';

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
  console.log('validateStep', step);
  try {
    switch (step) {
      case 0: // Documents
        const isDocumentsValid = await forms.documents.trigger();
        if (!isDocumentsValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.documents.getValues(),
        };

      case 1: // Informations de base
        const isBasicInfoValid = await forms.basicInfo.trigger();
        if (!isBasicInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.basicInfo.getValues(),
        };

      case 2: // Informations familiales
        const isFamilyInfoValid = await forms.familyInfo.trigger();
        if (!isFamilyInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.familyInfo.getValues(),
        };

      case 3: // Informations de contact
        const isContactInfoValid = await forms.contactInfo.trigger();
        if (!isContactInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.contactInfo.getValues(),
        };

      case 4: // Informations professionnelles
        const isProfessionalInfoValid = await forms.professionalInfo.trigger();
        if (!isProfessionalInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.professionalInfo.getValues(),
        };

      case 5: // Révision
        return { isValid: true, data: {} };

      default:
        return { isValid: false };
    }
  } catch (error) {
    console.error('Validation error:', error);
    return { isValid: false };
  }
}
