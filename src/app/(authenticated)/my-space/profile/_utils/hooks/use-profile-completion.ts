import { useMemo } from 'react';
import { DocumentStatus, UserDocument } from '@prisma/client';
import type { FullProfile } from '@/types';

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

export function useProfileCompletion(profile: FullProfile | null): ProfileCompletion {
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
      'passportNumber',
      'passportIssueDate',
      'passportExpiryDate',
      'passportIssueAuthority',
      'identityPicture',
    ];

    const basicInfoCompleted = basicInfoFields.filter((field) => {
      if (field === 'identityPicture') {
        return profile.identityPicture;
      }
      return profile[field as keyof FullProfile];
    });

    const basicInfoMissing = basicInfoFields.filter((field) => {
      if (field === 'identityPicture') {
        return !profile.identityPicture;
      }
      return !profile[field as keyof FullProfile];
    });

    sections.push({
      name: 'basic-info',
      completed: basicInfoCompleted.length,
      total: basicInfoFields.length,
      percentage: Math.round((basicInfoCompleted.length / basicInfoFields.length) * 100),
      missingFields: basicInfoMissing,
    });

    // Contact Info Section
    const contactInfoFields = ['email', 'phoneNumber', 'address', 'residentContact'];

    const contactInfoCompleted = contactInfoFields.filter((field) => {
      if (field === 'address') {
        return (
          profile.address &&
          profile.address.firstLine &&
          profile.address.city &&
          profile.address.country
        );
      }
      if (field === 'residentContact') {
        return (
          profile.residentContact &&
          profile.residentContact.firstName &&
          profile.residentContact.lastName &&
          profile.residentContact.phoneNumber
        );
      }
      return profile[field as keyof FullProfile];
    });

    const contactInfoMissing = contactInfoFields.filter((field) => {
      if (field === 'address') {
        return !(
          profile.address &&
          profile.address.firstLine &&
          profile.address.city &&
          profile.address.country
        );
      }
      if (field === 'residentContact') {
        return !(
          profile.residentContact &&
          profile.residentContact.firstName &&
          profile.residentContact.lastName &&
          profile.residentContact.phoneNumber
        );
      }
      return !profile[field as keyof FullProfile];
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
    if (profile.maritalStatus === 'MARRIED') {
      familyInfoFields.push('spouseFullName');
    }

    const familyInfoCompleted = familyInfoFields.filter(
      (field) => profile[field as keyof Profile],
    );

    const familyInfoMissing = familyInfoFields.filter(
      (field) => !profile[field as keyof Profile],
    );

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

    if (profile.workStatus === 'EMPLOYEE') {
      professionalInfoFields.push('profession', 'employer', 'employerAddress');
    } else if (profile.workStatus && profile.workStatus !== 'UNEMPLOYED') {
      professionalInfoFields.push('profession');
    }

    const professionalInfoCompleted = professionalInfoFields.filter(
      (field) =>
        profile[field as keyof Profile] !== null &&
        profile[field as keyof Profile] !== undefined,
    );

    const professionalInfoMissing = professionalInfoFields.filter(
      (field) =>
        profile[field as keyof Profile] === null ||
        profile[field as keyof Profile] === undefined,
    );

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
      const document = profile[doc.type as keyof FullProfile] as
        | UserDocument
        | null
        | undefined;
      return document;
    });

    const documentsMissing = requiredDocuments
      .filter((doc) => {
        const document = profile[doc.type as keyof FullProfile] as
          | UserDocument
          | null
          | undefined;
        return !document;
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
