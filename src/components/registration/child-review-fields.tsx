'use client';

import { useTranslations } from 'next-intl';
import {
  MapPin,
  User,
  Calendar,
  Globe,
  Flag,
  Users,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { ChildCompleteFormData } from '@/schemas/child-registration';
import { DocumentStatus, InfoField } from '@/components/ui/info-field';
import { useDateLocale } from '@/lib/utils';
import { ParentalRole } from '@/convex/lib/constants';

interface ChildReviewFieldsProps<T extends keyof ChildCompleteFormData> {
  id: T;
  data: ChildCompleteFormData[T];
}

export function ChildReviewFields<T extends keyof ChildCompleteFormData>({
  data,
  id,
}: ChildReviewFieldsProps<T>) {
  const t = useTranslations('registration');
  const { formatDate } = useDateLocale();

  const linkInfo: ChildCompleteFormData['linkInfo'] | undefined =
    id === 'linkInfo' ? (data as ChildCompleteFormData['linkInfo']) : undefined;
  const documents: ChildCompleteFormData['documents'] | undefined =
    id === 'documents' ? (data as ChildCompleteFormData['documents']) : undefined;
  const basicInfo: ChildCompleteFormData['basicInfo'] | undefined =
    id === 'basicInfo' ? (data as ChildCompleteFormData['basicInfo']) : undefined;

  // Fonction pour obtenir la traduction du rôle parental
  const getParentRoleText = (role: ParentalRole | undefined) => {
    if (!role) return '';

    switch (role) {
      case ParentalRole.FATHER:
        return t('link.father');
      case ParentalRole.MOTHER:
        return t('link.mother');
      case ParentalRole.LEGAL_GUARDIAN:
        return t('link.legal_guardian');
      default:
        return '';
    }
  };

  return (
    <>
      {/* Informations sur le lien avec l'enfant */}
      {linkInfo && (
        <div className="grid gap-4 md:grid-cols-2">
          <InfoField
            label={t('child_review.parental_role')}
            value={getParentRoleText(linkInfo.parentRole)}
            icon={<Users className="size-4" />}
            required
          />
          <InfoField
            label={t('child_review.has_other_parent')}
            value={linkInfo.hasOtherParent ? t('link.yes') : t('link.no')}
            icon={
              linkInfo.hasOtherParent ? (
                <CheckCircle className="size-4" />
              ) : (
                <XCircle className="size-4" />
              )
            }
            required
          />
          {linkInfo.hasOtherParent && (
            <>
              <InfoField
                label={t('child_review.other_parent_full_name')}
                value={linkInfo.otherParentFirstName + ' ' + linkInfo.otherParentLastName}
                icon={<User className="size-4" />}
                required
              />
              <InfoField
                label={t('child_review.other_parent_email')}
                value={linkInfo.otherParentEmail}
                icon={<Mail className="size-4" />}
                required
              />
              <InfoField
                label={t('child_review.other_parent_phone')}
                value={
                  linkInfo.otherParentPhone?.countryCode +
                  ' ' +
                  linkInfo.otherParentPhone?.number
                }
                icon={<Phone className="size-4" />}
                required
              />
            </>
          )}
        </div>
      )}

      {/* Documents */}
      {documents && (
        <div className="space-y-4">
          <div className="grid gap-3">
            <DocumentStatus
              type={t('profile.birth_certificate.label')}
              isUploaded={!!documents.birthCertificateFile}
            />
            <DocumentStatus
              type={t('profile.passport.label')}
              isUploaded={!!documents.passportFile}
              required={false}
            />
            <DocumentStatus
              type={t('profile.residence_permit.label')}
              isUploaded={!!documents.residencePermitFile}
              required={false}
            />
            <DocumentStatus
              type={t('profile.address_proof.label')}
              isUploaded={!!documents.addressProofFile}
              required={false}
            />
          </div>
        </div>
      )}

      {/* Informations de base */}
      {basicInfo && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {basicInfo.identityPictureFile && (
              <DocumentStatus
                type={t('profile.identity_picture.label')}
                isUploaded={!!basicInfo.identityPictureFile}
              />
            )}
            <InfoField
              label={t('form.first_name')}
              value={basicInfo.firstName}
              icon={<User className="size-4" />}
              required
            />
            <InfoField
              label={t('form.last_name')}
              value={basicInfo.lastName}
              icon={<User className="size-4" />}
              required
            />
            {basicInfo.gender && (
              <InfoField
                label={t('form.gender')}
                value={
                  basicInfo.gender === 'MALE'
                    ? t('assets.gender.male')
                    : t('assets.gender.female')
                }
                icon={<User className="size-4" />}
                required
              />
            )}
            <InfoField
              label={t('form.birth_date')}
              value={basicInfo.birthDate && formatDate(basicInfo.birthDate)}
              icon={<Calendar className="size-4" />}
              required
            />
            <InfoField
              label={t('form.birth_place')}
              value={basicInfo.birthPlace}
              icon={<MapPin className="size-4" />}
              required
            />
            <InfoField
              label={t('form.birth_country')}
              value={basicInfo.birthCountry}
              icon={<Globe className="size-4" />}
              required
            />
            <InfoField
              label={t('form.nationality')}
              value={basicInfo.nationality}
              icon={<Flag className="size-4" />}
              required
            />
            {basicInfo.passportNumber && (
              <InfoField
                label={t('form.passport.number.label')}
                value={basicInfo.passportNumber}
                required={false}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
