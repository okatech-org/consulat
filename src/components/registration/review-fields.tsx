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
import {
  BasicInfoFormData,
  ContactInfoFormData,
  DocumentsFormData,
  FamilyInfoFormData,
  FullProfileUpdateFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration';
import { DocumentStatus, InfoField } from '@/components/ui/info-field';
import { extractFieldsFromObject, useDateLocale } from '@/lib/utils';
import { CountryCode } from '@/lib/autocomplete-datas';
import CardContainer from '../layouts/card-container';
import { FlagIcon } from '../ui/flag-icon';
import { DisplayAddress } from '../ui/display-address';
import { Address } from '@prisma/client';

interface ReviewFieldsProps {
  data: Partial<FullProfileUpdateFormData>;
}

export function ReviewFields({ data }: ReviewFieldsProps) {
  const t = useTranslations('registration');
  const t_assets = useTranslations('assets');
  const t_inputs = useTranslations('inputs');
  const t_countries = useTranslations('countries');
  const { formatDate } = useDateLocale();

  const documents: Partial<DocumentsFormData> = extractFieldsFromObject(data, [
    'passport',
    'birthCertificate',
    'residencePermit',
    'addressProof',
    'identityPicture',
  ]);

  const basicInfo: Partial<BasicInfoFormData> = extractFieldsFromObject(data, [
    'firstName',
    'lastName',
    'gender',
    'birthDate',
    'birthPlace',
    'birthCountry',
    'nationality',
    'acquisitionMode',
    'passportNumber',
    'passportIssueAuthority',
    'passportIssueDate',
    'passportExpiryDate',
    'cardPin',
  ]);

  const familyInfo: Partial<FamilyInfoFormData> = extractFieldsFromObject(data, [
    'maritalStatus',
    'spouseFullName',
    'fatherFullName',
    'motherFullName',
  ]);

  const contactInfo: Partial<ContactInfoFormData> = extractFieldsFromObject(data, [
    'email',
    'phone',
    'address',
    'residentContact',
    'homeLandContact',
  ]);

  const professionalInfo: Partial<ProfessionalInfoFormData> = extractFieldsFromObject(
    data,
    ['workStatus', 'profession', 'employer', 'employerAddress', 'activityInGabon'],
  );

  return (
    <>
      {documents && (
        <div className="grid gap-4 sm:grid-cols-2">
          <DocumentStatus
            type={t('documents.passport.label')}
            isUploaded={!documents.passport?.fileUrl}
          />
          <DocumentStatus
            type={t('documents.birth_certificate.label')}
            isUploaded={!documents.birthCertificate?.fileUrl}
          />
          <DocumentStatus
            type={t('documents.residence_permit.label')}
            isUploaded={!documents.residencePermit?.fileUrl}
            required={false}
          />
          <DocumentStatus
            type={t('documents.address_proof.label')}
            isUploaded={!documents.addressProof?.fileUrl}
          />
        </div>
      )}

      {/* Informations de base */}
      {basicInfo && (
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <DocumentStatus
              type={t('documents.identity_picture.label')}
              isUploaded={!basicInfo.identityPicture?.fileUrl}
              required={true}
              className="col-span-2"
            />
            <InfoField
              label={t_inputs('firstName.label')}
              value={basicInfo.firstName}
              icon={<User className="size-4" />}
              required
              className="col-span-2"
            />
            <InfoField
              label={t_inputs('lastName.label')}
              value={basicInfo.lastName}
              icon={<User className="size-4" />}
              required
              className="col-span-2"
            />
            <InfoField
              label={t_inputs('gender.label')}
              value={
                basicInfo.gender &&
                (basicInfo.gender === 'MALE'
                  ? t_assets.raw('gender.male_type')
                  : t_assets.raw('gender.female_type'))
              }
              icon={<User className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('birthDate.label')}
              value={basicInfo.birthDate && formatDate(basicInfo.birthDate)}
              icon={<Calendar className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('birthPlace.label')}
              value={basicInfo.birthPlace}
              icon={<MapPin className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('birthCountry.label')}
              value={
                basicInfo.birthCountry && (
                  <p className="flex items-center gap-2">
                    <FlagIcon countryCode={basicInfo.birthCountry as CountryCode} />
                    {t_countries(basicInfo.birthCountry as CountryCode)}
                  </p>
                )
              }
              icon={<Globe className="size-4" />}
              required
            />
            <InfoField
              label={t('form.nationality')}
              value={
                basicInfo.nationality && (
                  <p className="flex items-center gap-2">
                    <FlagIcon countryCode={basicInfo.nationality as CountryCode} />
                    {t_countries(basicInfo.nationality as CountryCode)}
                  </p>
                )
              }
              icon={<Flag className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('nationality_acquisition.label')}
              value={
                basicInfo.acquisitionMode &&
                t_inputs.raw(
                  `nationality_acquisition.options.${basicInfo.acquisitionMode}`,
                )
              }
              icon={<Flag className="size-4" />}
              required
              className="col-span-2"
            />
          </div>

          {/* Informations du passeport */}
          <CardContainer contentClass="space-y-4 p-4">
            <h4 className="text-sm font-medium">{t_inputs('passport.label')}</h4>
            <div className="grid gap-4 grid-cols-2">
              <InfoField
                label={t_inputs('passport.number.label')}
                value={basicInfo.passportNumber}
                required
                className="col-span-2"
              />
              <InfoField
                label={t_inputs('passport.issueAuthority.label')}
                value={basicInfo.passportIssueAuthority}
                required
                className="col-span-2"
              />
              <InfoField
                label={t_inputs('passport.issueDate.label')}
                value={
                  basicInfo.passportIssueDate && formatDate(basicInfo.passportIssueDate)
                }
                required
                className="col-span-1"
              />
              <InfoField
                label={t_inputs('passport.expiryDate.label')}
                value={
                  basicInfo.passportExpiryDate && formatDate(basicInfo.passportExpiryDate)
                }
                required
                className="col-span-1"
              />
            </div>
          </CardContainer>
        </div>
      )}

      {/* Contact */}
      {contactInfo && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoField
            label={t_inputs('email.label')}
            value={contactInfo.email}
            icon={<Mail className="size-4" />}
            required
          />
          <InfoField
            label={t_inputs('phone.label')}
            value={
              contactInfo.phone
                ? `${contactInfo.phone.countryCode} ${contactInfo.phone.number}`
                : undefined
            }
            icon={<Phone className="size-4" />}
            required
          />

          <InfoField
            label={
              t_inputs('address.label') +
              ' - ' +
              t_countries(contactInfo.address?.country as CountryCode)
            }
            value={<DisplayAddress address={contactInfo.address as Address} />}
            icon={<MapPin className="size-4" />}
            className="sm:col-span-2"
          />

          {/* Contact résident */}
          {contactInfo.residentContact && (
            <CardContainer
              contentClass="p-4 pt-0 space-y-2"
              headerClass="p-4"
              title={
                <h4 className="text-sm font-medium">
                  {t_inputs('emergencyContact.label')}
                  {' - '}
                  {t_countries(
                    contactInfo.residentContact.address.country as CountryCode,
                  )}
                </h4>
              }
            >
              <InfoField
                label={t_inputs('fullName.label')}
                value={`${contactInfo.residentContact.firstName} ${contactInfo.residentContact.lastName}`}
                icon={<User className="size-4" />}
              />
              <InfoField
                label={t_inputs('familyLink.label')}
                value={
                  contactInfo.residentContact.relationship &&
                  t_inputs.raw(
                    `familyLink.options.${contactInfo.residentContact.relationship}`,
                  )
                }
                icon={<Users className="size-4" />}
              />
              <InfoField
                label={t_inputs('phone.label')}
                value={
                  contactInfo.residentContact.phone
                    ? `${contactInfo.residentContact.phone.countryCode} ${contactInfo.residentContact.phone.number}`
                    : undefined
                }
                icon={<Phone className="size-4" />}
              />
              {contactInfo.residentContact.email && (
                <InfoField
                  label={t_inputs('email.label')}
                  value={contactInfo.residentContact.email}
                  icon={<Mail className="size-4" />}
                />
              )}
              {contactInfo.residentContact.address && (
                <InfoField
                  label={
                    t_inputs('address.label') +
                    ' - ' +
                    t_countries(
                      contactInfo.residentContact.address.country as CountryCode,
                    )
                  }
                  value={
                    contactInfo.residentContact.address && (
                      <DisplayAddress
                        address={contactInfo.residentContact.address as Address}
                      />
                    )
                  }
                  icon={<MapPin className="size-4" />}
                />
              )}
            </CardContainer>
          )}

          {/* Contact pays d'origine */}
          {contactInfo.homeLandContact && (
            <CardContainer
              contentClass="space-y-2 p-4 pt-0"
              headerClass="p-4"
              title={
                <h4 className="text-sm font-medium">
                  {t_inputs('emergencyContact.label')}
                  {' - '}
                  {t_countries(
                    contactInfo.homeLandContact.address.country as CountryCode,
                  )}
                </h4>
              }
            >
              <InfoField
                label={t_inputs('fullName.label')}
                value={`${contactInfo.homeLandContact.firstName} ${contactInfo.homeLandContact.lastName}`}
                icon={<User className="size-4" />}
              />
              <InfoField
                label={t_inputs('familyLink.label')}
                value={
                  contactInfo.homeLandContact.relationship &&
                  t_inputs.raw(
                    `familyLink.options.${contactInfo.homeLandContact.relationship}`,
                  )
                }
                icon={<Users className="size-4" />}
              />
              <InfoField
                label={t_inputs('phone.label')}
                value={
                  contactInfo.homeLandContact.phone
                    ? `${contactInfo.homeLandContact.phone.countryCode} ${contactInfo.homeLandContact.phone.number}`
                    : undefined
                }
                icon={<Phone className="size-4" />}
              />
              {contactInfo.homeLandContact.email && (
                <InfoField
                  label={t_inputs('email.label')}
                  value={contactInfo.homeLandContact.email}
                  icon={<Mail className="size-4" />}
                />
              )}
              {contactInfo.homeLandContact.address && (
                <InfoField
                  label={
                    t_inputs('address.label') +
                    ' - ' +
                    t_countries(
                      contactInfo.homeLandContact.address.country as CountryCode,
                    )
                  }
                  value={
                    <DisplayAddress
                      address={contactInfo.homeLandContact.address as Address}
                    />
                  }
                  icon={<MapPin className="size-4" />}
                />
              )}
            </CardContainer>
          )}
        </div>
      )}

      {/* Famille */}
      {familyInfo && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoField
            label={t_inputs('maritalStatus.label')}
            value={
              familyInfo.maritalStatus &&
              t_inputs(`maritalStatus.options.${familyInfo.maritalStatus}`)
            }
            icon={<Users className="size-4" />}
            required
            className="sm:col-span-2"
          />
          {familyInfo.spouseFullName && (
            <InfoField
              label={t_inputs('spouseName.label')}
              value={familyInfo.spouseFullName}
              icon={<User className="size-4" />}
              className="sm:col-span-2"
            />
          )}
          <InfoField
            label={t_inputs('fatherName.label')}
            value={familyInfo.fatherFullName}
            icon={<User className="size-4" />}
            required
          />
          <InfoField
            label={t_inputs('motherName.label')}
            value={familyInfo.motherFullName}
            icon={<User className="size-4" />}
            required
          />
        </div>
      )}

      {/* Professionnel */}
      {professionalInfo && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoField
            label={t_inputs('workStatus.label')}
            value={
              professionalInfo.workStatus &&
              t_inputs(`workStatus.options.${professionalInfo.workStatus}`)
            }
            icon={<Briefcase className="size-4" />}
            required
          />
          {professionalInfo.profession && (
            <InfoField
              label={t_inputs('profession.label')}
              value={professionalInfo.profession}
              icon={<Briefcase className="size-4" />}
            />
          )}
          {professionalInfo.employer && (
            <>
              <InfoField
                label={t_inputs('employer.label')}
                value={professionalInfo.employer}
                icon={<Building className="size-4" />}
              />
              <InfoField
                label={t_inputs('employerAddress.label')}
                value={professionalInfo.employerAddress}
                icon={<MapPin className="size-4" />}
              />
            </>
          )}
          <InfoField
            label={t_inputs('activityInGabon.label')}
            value={professionalInfo.activityInGabon}
            icon={<Briefcase className="size-4" />}
          />
        </div>
      )}
    </>
  );
}
