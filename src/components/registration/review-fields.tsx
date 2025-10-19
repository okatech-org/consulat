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
  ArrowLeft,
  ArrowRight,
  TriangleAlert,
  EyeIcon,
  PencilIcon,
} from 'lucide-react';
import { DocumentStatus, InfoField } from '@/components/ui/info-field';
import { calculateProfileCompletion, useDateLocale } from '@/lib/utils';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { FlagIcon } from '../ui/flag-icon';
import { DisplayAddress } from '../ui/display-address';
import type { CompleteProfile } from '@/convex/lib/types';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { ROUTES } from '@/schemas/routes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ReviewFieldsProps {
  profile: CompleteProfile;
  onPrevious: () => void;
  onNext: () => void;
}

export function ReviewFields({ profile, onPrevious, onNext }: ReviewFieldsProps) {
  const t = useTranslations('registration');
  const t_assets = useTranslations('assets');
  const t_inputs = useTranslations('inputs');
  const t_countries = useTranslations('countries');
  const { formatDate } = useDateLocale();
  const completion = calculateProfileCompletion(profile);
  const router = useRouter();

  if (!profile) return null;

  return (
    <>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
        <h2 className="text-lg col-span-2 font-medium">
          {t('steps.documents')}{' '}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="p-[5px] ml-2 aspect-square rounded-full"
          >
            <Link
              href={ROUTES.user.profile_form + '?tab=documents'}
              className="text-sm text-primary"
            >
              <PencilIcon className="size-4" />
            </Link>
          </Button>
        </h2>

        <DocumentStatus
          type={t('documents.passport.label')}
          isUploaded={!!profile.passport?._id}
        />
        <DocumentStatus
          type={t('documents.birth_certificate.label')}
          isUploaded={!!profile.birthCertificate?._id}
        />
        <DocumentStatus
          type={t('documents.residence_permit.label')}
          isUploaded={!!profile.residencePermit?._id}
          required={false}
        />
        <DocumentStatus
          type={t('documents.address_proof.label')}
          isUploaded={!!profile.addressProof?._id}
        />
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        <h2 className="text-lg font-medium">
          {t('steps.basic-info')}{' '}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="p-[5px] ml-2 aspect-square rounded-full"
          >
            <Link
              href={ROUTES.user.profile_form + '?tab=basic-info'}
              className="text-sm text-primary"
            >
              <PencilIcon className="size-4" />
            </Link>
          </Button>
        </h2>
        <div className="grid gap-4 grid-cols-2">
          <DocumentStatus
            type={t('documents.identity_picture.label')}
            isUploaded={!!profile.identityPicture?._id}
            required={true}
            className="col-span-2"
          />
          <InfoField
            label={t_inputs('firstName.label')}
            value={profile.personal.firstName}
            icon={<User className="size-4" />}
            required
          />
          <InfoField
            label={t_inputs('lastName.label')}
            value={profile.personal.lastName}
            icon={<User className="size-4" />}
            required
          />
          <InfoField
            label={t_inputs('gender.label')}
            value={
              profile.personal.gender &&
              (profile.personal.gender === 'male'
                ? t_assets.raw('gender.male_type')
                : t_assets.raw('gender.female_type'))
            }
            icon={<User className="size-4" />}
            required
          />
          <InfoField
            label={t_inputs('birthDate.label')}
            value={
              profile.personal.birthDate &&
              formatDate(new Date(profile.personal.birthDate), 'dd/MM/yyyy')
            }
            icon={<Calendar className="size-4" />}
            required
          />
          <InfoField
            label={t_inputs('birthPlace.label')}
            value={profile.personal.birthPlace}
            icon={<MapPin className="size-4" />}
            required
          />
          <InfoField
            label={t_inputs('birthCountry.label')}
            value={
              profile.personal.birthCountry && (
                <p className="flex items-center gap-2">
                  <FlagIcon countryCode={profile.personal.birthCountry as CountryCode} />
                  {t_countries(profile.personal.birthCountry as CountryCode)}
                </p>
              )
            }
            icon={<Globe className="size-4" />}
            required
          />
          <InfoField
            label={t('form.nationality')}
            value={
              profile.personal.nationality && (
                <p className="flex items-center gap-2">
                  <FlagIcon countryCode={profile.personal.nationality as CountryCode} />
                  {t_countries(profile.personal.nationality as CountryCode)}
                </p>
              )
            }
            icon={<Flag className="size-4" />}
            required
          />
          <InfoField
            label={t_inputs('nationality_acquisition.label')}
            value={
              profile.personal.acquisitionMode &&
              t_inputs.raw(
                `nationality_acquisition.options.${profile.personal.acquisitionMode}`,
              )
            }
            icon={<Flag className="size-4" />}
            required
            className="col-span-2"
          />
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">{t_inputs('passport.label')}</h4>
          <div className="grid gap-4 grid-cols-2">
            <InfoField
              label={t_inputs('passport.number.label')}
              value={profile.personal.passportInfos?.number}
              className="col-span-2"
            />
            <InfoField
              label={t_inputs('passport.issueAuthority.label')}
              value={profile.personal.passportInfos?.issueAuthority}
              className="col-span-2"
            />
            <InfoField
              label={t_inputs('passport.issueDate.label')}
              value={
                profile.personal.passportInfos?.issueDate &&
                formatDate(
                  new Date(profile.personal.passportInfos.issueDate),
                  'dd/MM/yyyy',
                )
              }
              className="col-span-1"
            />
            <InfoField
              label={t_inputs('passport.expiryDate.label')}
              value={
                profile.personal.passportInfos?.expiryDate &&
                formatDate(
                  new Date(profile.personal.passportInfos.expiryDate),
                  'dd/MM/yyyy',
                )
              }
              className="col-span-1"
            />
          </div>
        </div>

        <Separator className="my-6" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <h2 className="text-lg font-medium col-span-2">
          {t('steps.contact-info')}{' '}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="p-[5px] ml-2 aspect-square rounded-full"
          >
            <Link
              href={ROUTES.user.profile + '?tab=contact-info'}
              className="text-sm text-primary"
            >
              <PencilIcon className="size-4" />
            </Link>
          </Button>
        </h2>
        <InfoField
          label={t_inputs('email.label')}
          value={profile.contacts.email}
          icon={<Mail className="size-4" />}
          required
        />
        <InfoField
          label={t_inputs('phone.label')}
          value={profile.contacts.phone}
          icon={<Phone className="size-4" />}
          required
        />

        <InfoField
          label={
            t_inputs('address.label') +
            ' - ' +
            t_countries(profile.contacts.address?.country as CountryCode)
          }
          value={
            <DisplayAddress
              address={{
                street: profile.contacts.address?.street ?? '',
                complement: profile.contacts.address?.complement ?? '',
                city: profile.contacts.address?.city ?? '',
                postalCode: profile.contacts.address?.postalCode ?? '',
                country: profile.contacts.address?.country ?? '',
              }}
            />
          }
          icon={<MapPin className="size-4" />}
          className="sm:col-span-2"
        />

        <Separator className="my-6" />

        <h2 className="text-lg font-medium col-span-2">
          {"Contacts d'urgence"}{' '}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="p-[5px] ml-2 aspect-square rounded-full"
          >
            <Link
              href={ROUTES.user.profile_form + '?tab=contact-info'}
              className="text-sm text-primary"
            >
              <PencilIcon className="size-4" />
            </Link>
          </Button>
        </h2>
        {/* Emergency contacts */}
        {profile.emergencyContacts.map((contact, index) => (
          <div key={index} className="space-y-4">
            <h4 className="text-sm font-medium">
              {t_inputs('emergencyContact.label')}
              {contact.address?.country &&
                ' - ' + t_countries(contact.address.country as CountryCode)}
            </h4>

            <InfoField
              label={t_inputs('fullName.label')}
              value={`${contact.firstName} ${contact.lastName}`}
              icon={<User className="size-4" />}
            />
            <InfoField
              label={t_inputs('familyLink.label')}
              value={
                contact.relationship &&
                t_inputs.raw(`familyLink.options.${contact.relationship}`)
              }
              icon={<Users className="size-4" />}
            />
            <InfoField
              label={t_inputs('phone.label')}
              value={contact.phoneNumber}
              icon={<Phone className="size-4" />}
            />
            {contact.email && (
              <InfoField
                label={t_inputs('email.label')}
                value={contact.email}
                icon={<Mail className="size-4" />}
              />
            )}
            {contact.address && (
              <InfoField
                label={
                  t_inputs('address.label') +
                  (contact.address.country
                    ? ' - ' + t_countries(contact.address.country as CountryCode)
                    : '')
                }
                value={
                  <DisplayAddress
                    address={
                      {
                        firstLine: contact.address.street,
                        secondLine: contact.address.complement,
                        city: contact.address.city,
                        zipCode: contact.address.postalCode,
                        country: contact.address.country,
                      } as any
                    }
                  />
                }
                icon={<MapPin className="size-4" />}
              />
            )}
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="grid gap-4 sm:grid-cols-2">
        <h2 className="text-lg font-medium col-span-2 ">
          {t('steps.family-info')}{' '}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="p-[5px] ml-2 aspect-square rounded-full"
          >
            <Link
              href={ROUTES.user.profile_form + '?tab=family-info'}
              className="text-sm text-primary"
            >
              <PencilIcon className="size-4" />
            </Link>
          </Button>
        </h2>
        <InfoField
          label={t_inputs('maritalStatus.label')}
          value={
            profile.family?.maritalStatus &&
            t_inputs(`maritalStatus.options.${profile.family.maritalStatus}`)
          }
          icon={<Users className="size-4" />}
          required
          className="sm:col-span-2"
        />
        {profile.family?.spouse &&
          (profile.family.spouse.firstName || profile.family.spouse.lastName) && (
            <InfoField
              label={t_inputs('spouseName.label')}
              value={`${profile.family.spouse.firstName || ''} ${profile.family.spouse.lastName || ''}`.trim()}
              icon={<User className="size-4" />}
              className="sm:col-span-2"
            />
          )}
        {profile.family?.father &&
          (profile.family.father.firstName || profile.family.father.lastName) && (
            <InfoField
              label={t_inputs('fatherName.label')}
              value={`${profile.family.father.firstName || ''} ${profile.family.father.lastName || ''}`.trim()}
              icon={<User className="size-4" />}
            />
          )}
        {profile.family?.mother &&
          (profile.family.mother.firstName || profile.family.mother.lastName) && (
            <InfoField
              label={t_inputs('motherName.label')}
              value={`${profile.family.mother.firstName || ''} ${profile.family.mother.lastName || ''}`.trim()}
              icon={<User className="size-4" />}
            />
          )}
      </div>

      <Separator className="my-6" />

      {/* Professionnel */}
      {profile.professionSituation && (
        <div className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-lg font-medium col-span-2">
            {t('steps.professional-info')}{' '}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="p-[5px] ml-2 aspect-square rounded-full"
            >
              <Link
                href={ROUTES.user.profile_form + '?tab=professional-info'}
                className="text-sm text-primary"
              >
                <PencilIcon className="size-4" />
              </Link>
            </Button>
          </h2>
          <InfoField
            label={t_inputs('professionalStatus.label')}
            value={
              profile.professionSituation.workStatus &&
              t_inputs(
                `professionalStatus.options.${profile.professionSituation.workStatus}`,
              )
            }
            icon={<Briefcase className="size-4" />}
            required
          />
          {profile.professionSituation.profession && (
            <InfoField
              label={t_inputs('profession.label')}
              value={profile.professionSituation.profession}
              icon={<Briefcase className="size-4" />}
            />
          )}
          {profile.professionSituation.employer && (
            <>
              <InfoField
                label={t_inputs('employer.label')}
                value={profile.professionSituation.employer}
                icon={<Building className="size-4" />}
              />
              {profile.professionSituation.employerAddress && (
                <InfoField
                  label={t_inputs('employerAddress.label')}
                  value={profile.professionSituation.employerAddress}
                  icon={<MapPin className="size-4" />}
                />
              )}
            </>
          )}
          {profile.professionSituation.activityInGabon && (
            <InfoField
              label={t_inputs('activityInGabon.label')}
              value={profile.professionSituation.activityInGabon}
              icon={<Briefcase className="size-4" />}
              className="sm:col-span-2"
            />
          )}
        </div>
      )}

      <Separator className="my-6" />

      <div className="flex flex-col md:flex-row justify-between gap-4">
        {onPrevious && (
          <Button
            type="button"
            onClick={onPrevious}
            variant="outline"
            leftIcon={<ArrowLeft className="size-icon" />}
          >
            Précédent
          </Button>
        )}

        <Button
          type="submit"
          onClick={onNext}
          disabled={!completion.canSubmit}
          rightIcon={<ArrowRight className="size-icon" />}
        >
          Soumettre ma demande
        </Button>
      </div>

      {!completion.canSubmit && (
        <div className="flex flex-col gap-2 pt-4">
          {completion.overall < 100 && (
            <div className="flex flex-col items-center gap-2">
              <TriangleAlert className="size-icon text-yellow-500" />
              <p className="text-sm text-yellow-500">
                Vous devez compléter tous les champs requis pour soumettre votre demande.
              </p>
              <ul className="flex flex-col items-center gap-2">
                {completion.sections.map((section) => (
                  <li key={section.name} className="text-sm text-yellow-500">
                    {section.missingFields.map((field) => (
                      <li key={field} className="text-sm text-yellow-500">
                        {t_inputs(`profile.${field}.label`)}
                      </li>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {!completion.canSubmit && completion.overall === 100 && (
        <div className="flex flex-col items-center col-span-2 gap-2 pt-4">
          <InfoCircledIcon className="size-icon text-info" />
          <p className="text-sm text-info">
            Vous avez déjà soumis votre demande. vous pouvez la retrouver dans votre
            tableau de bord.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.user.profile)}
            leftIcon={<EyeIcon className="size-icon" />}
          >
            Voir mon profil
          </Button>
        </div>
      )}
    </>
  );
}
