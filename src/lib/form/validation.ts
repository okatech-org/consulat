import { ConsularFormData, CreateProfileInput } from '@/schemas/registration';
import { UseFormReturn } from 'react-hook-form';

export async function validateStep(
  step: number,
  forms: {
    newProfile: UseFormReturn<CreateProfileInput>;
    documents: UseFormReturn<ConsularFormData['documents']>;
    basicInfo: UseFormReturn<ConsularFormData['basicInfo']>;
    familyInfo: UseFormReturn<ConsularFormData['familyInfo']>;
    contactInfo: UseFormReturn<ConsularFormData['contactInfo']>;
    professionalInfo: UseFormReturn<ConsularFormData['professionalInfo']>;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ isValid: boolean; data?: any }> {
  try {
    switch (step) {
      case 0: // New profile
        const isNewProfileValid = await forms.newProfile.trigger();
        if (!isNewProfileValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.newProfile.getValues(),
        };
      case 1: // Documents
        const isDocumentsValid = await forms.documents.trigger();
        if (!isDocumentsValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.documents.getValues(),
        };

      case 2: // Informations de base
        const isBasicInfoValid = await forms.basicInfo.trigger();
        if (!isBasicInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.basicInfo.getValues(),
        };

      case 3: // Informations familiales
        const isFamilyInfoValid = await forms.familyInfo.trigger();
        if (!isFamilyInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.familyInfo.getValues(),
        };

      case 4: // Informations de contact
        const isContactInfoValid = await forms.contactInfo.trigger();
        if (!isContactInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.contactInfo.getValues(),
        };

      case 5: // Informations professionnelles
        const isProfessionalInfoValid = await forms.professionalInfo.trigger();
        if (!isProfessionalInfoValid) return { isValid: false };
        return {
          isValid: true,
          data: forms.professionalInfo.getValues(),
        };

      case 6: // Révision
        return { isValid: true, data: {} };

      default:
        return { isValid: false };
    }
  } catch (error) {
    console.error('Validation error:', error);
    return { isValid: false };
  }
}
