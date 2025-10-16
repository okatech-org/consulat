'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import type { FullProfile } from '@/types/convex-profile';
import { Mail, Phone, MapPin, Users } from 'lucide-react';
import { DisplayAddress } from '@/components/ui/display-address';
import { Separator } from '@/components/ui/separator';

interface ContactInfoDisplayProps {
  profile: FullProfile;
}

export function ContactInfoDisplay({ profile }: ContactInfoDisplayProps) {
  if (!profile) return null;

  const t_profile = useTranslations('profile.fields');
  const t_inputs = useTranslations('inputs');

  return (
    <div className="space-y-6">
      {/* Coordonnées principales */}
      <div className="space-y-4">
        <h4 className="font-medium text-lg">Coordonnées principales</h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoField
            label={t_profile('email')}
            value={profile.contacts?.email}
            icon={<Mail className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('phoneNumber')}
            value={profile.contacts?.phone}
            icon={<Phone className="size-4" />}
            required
          />
        </div>

        {/* Adresse actuelle */}
        <InfoField
          label={t_profile('address')}
          value={<DisplayAddress address={profile.contacts?.address} />}
          icon={<MapPin className="size-4" />}
          required
        />
      </div>

      {profile.emergencyContacts.length &&
        profile.emergencyContacts.map((contact) => (
          <div key={contact._id}>
            <h4 className="font-medium text-lg">{contact.name}</h4>
          </div>
        ))}

      {/* Contact résident */}
      {profile.emergencyContacts && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Contact d&apos;urgence résident</h4>

            <div className="grid gap-4 grid-cols-2">
              <InfoField
                label="Prénom"
                value={profile.residentContact.firstName}
                icon={<Users className="size-4" />}
              />
              <InfoField
                label="Nom"
                value={profile.residentContact.lastName}
                icon={<Users className="size-4" />}
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <InfoField
                label="Email"
                value={profile.residentContact.email}
                icon={<Mail className="size-4" />}
              />
              <InfoField
                label="Téléphone"
                value={profile.residentContact.phoneNumber}
                icon={<Phone className="size-4" />}
              />
              <InfoField
                label="Relation"
                value={
                  profile.residentContact.relationship
                    ? t_inputs(
                        `familyLink.options.${profile.residentContact.relationship}`,
                      )
                    : undefined
                }
                icon={<Users className="size-4" />}
              />
              {profile.residentContact.address && (
                <div className="col-span-2">
                  <InfoField
                    label="Adresse"
                    value={<DisplayAddress address={profile.residentContact.address} />}
                    icon={<MapPin className="size-4" />}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Contact au pays d'origine */}
      {profile.homeLandContact && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Contact au pays d&apos;origine</h4>

            <div className="grid gap-4 grid-cols-2">
              <InfoField
                label="Prénom"
                value={profile.homeLandContact.firstName}
                icon={<Users className="size-4" />}
              />
              <InfoField
                label="Nom"
                value={profile.homeLandContact.lastName}
                icon={<Users className="size-4" />}
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <InfoField
                label="Téléphone"
                value={profile.homeLandContact.phoneNumber}
                icon={<Phone className="size-4" />}
              />
              <InfoField
                label="Email"
                value={profile.homeLandContact.email}
                icon={<Mail className="size-4" />}
              />
              <InfoField
                label="Relation"
                value={
                  profile.homeLandContact.relationship
                    ? t_inputs(
                        `familyLink.options.${profile.homeLandContact.relationship}`,
                      )
                    : undefined
                }
                icon={<Users className="size-4" />}
              />
            </div>

            {profile.homeLandContact.address && (
              <div className="col-span-2">
                <InfoField
                  label="Adresse"
                  value={<DisplayAddress address={profile.homeLandContact.address} />}
                  icon={<MapPin className="size-4" />}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
