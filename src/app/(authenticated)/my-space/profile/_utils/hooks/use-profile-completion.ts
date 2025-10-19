import { useMemo } from 'react';
import type { CompleteProfile as ConvexCompleteProfile } from '@/types/convex-profile';

interface SectionCompletion {
  name: string;
  completed: number;
  total: number;
  percentage: number;
  missingFields: string[];
}

interface ProfileCompletion {
  overall: number;
  sections: SectionCompletion[];
  totalFields: number;
  completedFields: number;
  canSubmit: boolean;
}

export function useProfileCompletion(
  profile: ConvexCompleteProfile | null,
): ProfileCompletion {
  return useMemo(() => {
    if (!profile) {
      return {
        overall: 0,
        sections: [],
        totalFields: 0,
        completedFields: 0,
        canSubmit: false,
      };
    }

    const sections: SectionCompletion[] = [];

    // Basic Info Section
    const basicInfoFields = [
      'firstName',
      'lastName',
      'gender',
      'birthDate',
      'birthPlace',
      'birthCountry',
      'nationality',
      'acquisitionMode',
      'identityPicture',
    ];

    const basicInfoCompleted = basicInfoFields.filter((field) => {
      if (field === 'identityPicture') {
        return profile.identityPicture;
      }
      if (field === 'firstName' || field === 'lastName') {
        return profile.personal?.[field];
      }
      if (
        [
          'gender',
          'birthDate',
          'birthPlace',
          'birthCountry',
          'nationality',
          'acquisitionMode',
        ].includes(field)
      ) {
        return profile.personal?.[field as keyof typeof profile.personal];
      }
      return false;
    });

    const basicInfoMissing = basicInfoFields.filter((field) => {
      if (field === 'identityPicture') {
        return !profile.identityPicture;
      }
      if (field === 'firstName' || field === 'lastName') {
        return !profile.personal?.[field];
      }
      if (
        [
          'gender',
          'birthDate',
          'birthPlace',
          'birthCountry',
          'nationality',
          'acquisitionMode',
        ].includes(field)
      ) {
        return !profile.personal?.[field as keyof typeof profile.personal];
      }
      return true;
    });

    sections.push({
      name: 'basic-info',
      completed: basicInfoCompleted.length,
      total: basicInfoFields.length,
      percentage: Math.round((basicInfoCompleted.length / basicInfoFields.length) * 100),
      missingFields: basicInfoMissing,
    });

    // Contact Info Section
    const contactInfoFields = ['email', 'phoneNumber', 'address'];

    const contactInfoCompleted = contactInfoFields.filter((field) => {
      if (field === 'address') {
        return (
          profile.personal?.address &&
          profile.personal.address.street &&
          profile.personal.address.city &&
          profile.personal.address.country
        );
      }
      if (field === 'email') {
        return profile.contacts?.email || profile.email;
      }
      if (field === 'phoneNumber') {
        return profile.contacts?.phone || profile.phoneNumber;
      }
      return false;
    });

    const contactInfoMissing = contactInfoFields.filter((field) => {
      if (field === 'address') {
        return !(
          profile.personal?.address &&
          profile.personal.address.street &&
          profile.personal.address.city &&
          profile.personal.address.country
        );
      }
      if (field === 'email') {
        return !(profile.contacts?.email || profile.email);
      }
      if (field === 'phoneNumber') {
        return !(profile.contacts?.phone || profile.phoneNumber);
      }
      return true;
    });

    sections.push({
      name: 'contact-info',
      completed: contactInfoCompleted.length,
      total: contactInfoFields.length,
      percentage: Math.round(
        (contactInfoCompleted.length / contactInfoFields.length) * 100,
      ),
      missingFields: contactInfoMissing,
    });

    // Family Info Section
    const familyInfoFields = ['maritalStatus', 'fatherFullName', 'motherFullName'];

    // Add spouse if married
    if (profile.personal?.maritalStatus === 'married') {
      familyInfoFields.push('spouseFullName');
    }

    const familyInfoCompleted = familyInfoFields.filter((field) => {
      if (field === 'maritalStatus') {
        return profile.personal?.maritalStatus;
      }
      if (field === 'fatherFullName') {
        return profile.family?.father?.firstName && profile.family?.father?.lastName;
      }
      if (field === 'motherFullName') {
        return profile.family?.mother?.firstName && profile.family?.mother?.lastName;
      }
      if (field === 'spouseFullName') {
        return profile.family?.spouse?.firstName && profile.family?.spouse?.lastName;
      }
      return false;
    });

    const familyInfoMissing = familyInfoFields.filter((field) => {
      if (field === 'maritalStatus') {
        return !profile.personal?.maritalStatus;
      }
      if (field === 'fatherFullName') {
        return !(profile.family?.father?.firstName && profile.family?.father?.lastName);
      }
      if (field === 'motherFullName') {
        return !(profile.family?.mother?.firstName && profile.family?.mother?.lastName);
      }
      if (field === 'spouseFullName') {
        return !(profile.family?.spouse?.firstName && profile.family?.spouse?.lastName);
      }
      return true;
    });

    sections.push({
      name: 'family-info',
      completed: familyInfoCompleted.length,
      total: familyInfoFields.length,
      percentage: Math.round(
        (familyInfoCompleted.length / familyInfoFields.length) * 100,
      ),
      missingFields: familyInfoMissing,
    });

    // Professional Info Section
    const professionalInfoFields = ['workStatus'];

    if (profile.personal?.workStatus === 'employee') {
      professionalInfoFields.push('profession', 'employer', 'employerAddress');
    } else if (
      profile.personal?.workStatus &&
      profile.personal?.workStatus !== 'unemployed'
    ) {
      professionalInfoFields.push('profession');
    }

    const professionalInfoCompleted = professionalInfoFields.filter((field) => {
      if (field === 'workStatus') {
        return profile.personal?.workStatus;
      }
      if (field === 'profession') {
        return profile.professionSituation?.profession;
      }
      if (field === 'employer') {
        return profile.professionSituation?.employer;
      }
      if (field === 'employerAddress') {
        return profile.professionSituation?.employerAddress;
      }
      return false;
    });

    const professionalInfoMissing = professionalInfoFields.filter((field) => {
      if (field === 'workStatus') {
        return !profile.personal?.workStatus;
      }
      if (field === 'profession') {
        return !profile.professionSituation?.profession;
      }
      if (field === 'employer') {
        return !profile.professionSituation?.employer;
      }
      if (field === 'employerAddress') {
        return !profile.professionSituation?.employerAddress;
      }
      return true;
    });

    sections.push({
      name: 'professional-info',
      completed: professionalInfoCompleted.length,
      total: professionalInfoFields.length,
      percentage:
        professionalInfoFields.length > 0
          ? Math.round(
              (professionalInfoCompleted.length / professionalInfoFields.length) * 100,
            )
          : 0,
      missingFields: professionalInfoMissing,
    });

    // Documents Section
    const requiredDocuments = [
      { type: 'passport', field: 'passport' },
      { type: 'birthCertificate', field: 'birthCertificate' },
      { type: 'addressProof', field: 'addressProof' },
    ];

    const documentsCompleted = requiredDocuments.filter((doc) => {
      return profile[doc.type as keyof ConvexCompleteProfile];
    });

    const documentsMissing = requiredDocuments
      .filter((doc) => {
        return !profile[doc.type as keyof ConvexCompleteProfile];
      })
      .map((doc) => doc.field);

    sections.push({
      name: 'documents',
      completed: documentsCompleted.length,
      total: requiredDocuments.length,
      percentage: Math.round(
        (documentsCompleted.length / requiredDocuments.length) * 100,
      ),
      missingFields: documentsMissing,
    });

    // Calculate overall completion
    const totalFields = sections.reduce((sum, section) => sum + section.total, 0);
    const completedFields = sections.reduce((sum, section) => sum + section.completed, 0);
    const overall =
      totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    return {
      overall,
      sections,
      totalFields,
      completedFields,
      canSubmit: overall === 100,
    };
  }, [profile]);
}
