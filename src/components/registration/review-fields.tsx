'use client';

import { useTranslations } from 'next-intl';
import {
  MapPin,
  User,
  Phone,
  Mail,
  Briefcase,
  Users,
  Calendar,
  Globe,
  Flag,
  Building,
} from 'lucide-react';
import { ConsularFormData } from '@/schemas/registration';
import { DocumentStatus, InfoField } from '@/components/ui/info-field';
import { useDateLocale } from '@/lib/utils';

interface ReviewFieldsProps<T extends keyof ConsularFormData> {
  id: T;
  data: ConsularFormData[T];
}

export function ReviewFields<T extends keyof ConsularFormData>({
  data,
  id,
}: ReviewFieldsProps<T>) {
  const t = useTranslations('registration');
  const t_assets = useTranslations('assets');
  const { formatDate } = useDateLocale();

  const documents: ConsularFormData['documents'] | undefined =
    id === 'documents' ? (data as ConsularFormData['documents']) : undefined;
  const basicInfo: ConsularFormData['basicInfo'] | undefined =
    id === 'basicInfo' ? (data as ConsularFormData['basicInfo']) : undefined;
  const familyInfo: ConsularFormData['familyInfo'] | undefined =
    id === 'familyInfo' ? (data as ConsularFormData['familyInfo']) : undefined;
  const contactInfo: ConsularFormData['contactInfo'] | undefined =
    id === 'contactInfo' ? (data as ConsularFormData['contactInfo']) : undefined;
  const professionalInfo: ConsularFormData['professionalInfo'] | undefined =
    id === 'professionalInfo'
      ? (data as ConsularFormData['professionalInfo'])
      : undefined;

  return (
    <>
      {documents && (
        <div className="space-y-4">
          <h3 className="font-medium">{t('review.documents')}</h3>
          <div className="grid gap-3">
            <DocumentStatus
              type={t('profile.passport.label')}
              isUploaded={!documents.passportFile?.length}
            />
            <DocumentStatus
              type={t('profile.birth_certificate.label')}
              isUploaded={!documents.birthCertificateFile?.length}
            />
            <DocumentStatus
              type={t('profile.residence_permit.label')}
              isUploaded={!documents.residencePermitFile?.length}
              required={false}
            />
            <DocumentStatus
              type={t('profile.address_proof.label')}
              isUploaded={!documents.addressProofFile?.length}
            />
          </div>
        </div>
      )}

      {/* Informations de base */}
      {basicInfo && (
        <div className="space-y-4">
          <h3 className="font-medium">{t('review.basic_info')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <DocumentStatus
              type={t('profile.identity_picture.label')}
              isUploaded={!basicInfo.identityPictureFile?.length}
            />
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
            <InfoField
              label={t('form.gender')}
              value={
                basicInfo.gender && t_assets(`gender.${basicInfo.gender.toLowerCase()}`)
              }
              icon={<User className="size-4" />}
              required
            />
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
          </div>

          {/* Informations du passeport */}
          <div className="mt-4 space-y-4">
            <h4 className="text-sm font-medium">{t('form.passport.section_title')}</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={t('form.passport.number.label')}
                value={basicInfo.passportNumber}
                required
              />
              <InfoField
                label={t('form.passport.authority.label')}
                value={basicInfo.passportIssueAuthority}
                required
              />
              <InfoField
                label={t('form.passport.issue_date.label')}
                value={
                  basicInfo.passportIssueDate && formatDate(basicInfo.passportIssueDate)
                }
                required
              />
              <InfoField
                label={t('form.passport.expiry_date.label')}
                value={
                  basicInfo.passportExpiryDate && formatDate(basicInfo.passportExpiryDate)
                }
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      {contactInfo && (
        <div className="space-y-4">
          <h3 className="font-medium">{t('review.contact_info')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoField
              label={t('form.email')}
              value={contactInfo.email}
              icon={<Mail className="size-4" />}
              required
            />
            <InfoField
              label={t('form.phone')}
              value={
                contactInfo.phone
                  ? `${contactInfo.phone.countryCode} ${contactInfo.phone.number}`
                  : undefined
              }
              icon={<Phone className="size-4" />}
              required
            />
          </div>

          {/* Adresse principale */}
          {contactInfo.address && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">{t('form.address')}</h4>
              <div className="rounded-lg border p-3">
                <p>{contactInfo.address.firstLine}</p>
                {contactInfo.address.secondLine && (
                  <p>{contactInfo.address.secondLine}</p>
                )}
                <p>
                  {contactInfo.address.zipCode} {contactInfo.address.city}
                </p>
                <p>{contactInfo.address.country}</p>
              </div>
            </div>
          )}

          {/* Adresse au Gabon */}
          {contactInfo.addressInGabon && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">{t('form.address_gabon')}</h4>
              <div className="rounded-lg border p-3">
                <p>{contactInfo.addressInGabon.address}</p>
                <p>
                  {contactInfo.addressInGabon.district}, {contactInfo.addressInGabon.city}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Famille */}
      {familyInfo && (
        <div className="space-y-4">
          <h3 className="font-medium">{t('review.family_info')}</h3>
          <div className="grid gap-4">
            <InfoField
              label={t('form.marital_status')}
              value={
                familyInfo.maritalStatus &&
                t_assets(`marital_status.${familyInfo.maritalStatus.toLowerCase()}`)
              }
              icon={<Users className="size-4" />}
              required
            />
            {familyInfo.spouseFullName && (
              <InfoField
                label={t('form.spouse_name')}
                value={familyInfo.spouseFullName}
                icon={<User className="size-4" />}
              />
            )}
            <InfoField
              label={t('form.father_name')}
              value={familyInfo.fatherFullName}
              icon={<User className="size-4" />}
              required
            />
            <InfoField
              label={t('form.mother_name')}
              value={familyInfo.motherFullName}
              icon={<User className="size-4" />}
              required
            />
          </div>

          {/* Contact d'urgence */}
          {familyInfo.emergencyContact && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">{t('form.emergency_contact')}</h4>
              <div className="space-y-2 rounded-lg border p-3">
                <InfoField
                  label={t('form.emergency_contact_name')}
                  value={familyInfo.emergencyContact.fullName}
                  icon={<User className="size-4" />}
                />
                <InfoField
                  label={t('form.emergency_contact_relationship')}
                  value={familyInfo.emergencyContact.relationship}
                  icon={<Users className="size-4" />}
                />
                <InfoField
                  label={t('form.emergency_contact_phone')}
                  value={
                    familyInfo.emergencyContact.phone
                      ? `${familyInfo.emergencyContact.phone.countryCode}${familyInfo.emergencyContact.phone.number}`
                      : undefined
                  }
                  icon={<Phone className="size-4" />}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Professionnel */}
      {professionalInfo && (
        <div className="space-y-4">
          <h3 className="font-medium">{t('review.professional_info')}</h3>
          <div className="grid gap-4">
            <InfoField
              label={t('form.work_status')}
              value={
                professionalInfo.workStatus &&
                t_assets(`work_status.${professionalInfo.workStatus.toLowerCase()}`)
              }
              icon={<Briefcase className="size-4" />}
              required
            />
            {professionalInfo.profession && (
              <InfoField
                label={t('form.profession')}
                value={professionalInfo.profession}
                icon={<Briefcase className="size-4" />}
              />
            )}
            {professionalInfo.employer && (
              <>
                <InfoField
                  label={t('form.employer')}
                  value={professionalInfo.employer}
                  icon={<Building className="size-4" />}
                />
                <InfoField
                  label={t('form.work_address')}
                  value={professionalInfo.employerAddress}
                  icon={<MapPin className="size-4" />}
                />
              </>
            )}
            <InfoField
              label={t('form.gabon_activity')}
              value={professionalInfo.activityInGabon}
              icon={<Briefcase className="size-4" />}
            />
          </div>
        </div>
      )}
    </>
  );
}
