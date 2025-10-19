'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import type { CompleteProfile } from '@/convex/lib/types';
import { Mail, Phone, MapPin, Users } from 'lucide-react';
import { DisplayAddress } from '@/components/ui/display-address';
import { Separator } from '@/components/ui/separator';
import { Fragment } from 'react';
import { EmergencyContactType } from '@/convex/lib/constants';

interface ContactInfoDisplayProps {
  profile: CompleteProfile;
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
          <Fragment key={contact.type}>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-lg">
                {contact.type === EmergencyContactType.Resident
                  ? "Contact d'urgence résident"
                  : "Contact d'urgence pays d'origine"}
              </h4>

              <div className="grid gap-4 grid-cols-2">
                <InfoField
                  label="Prénom"
                  value={contact.firstName}
                  icon={<Users className="size-4" />}
                />
                <InfoField
                  label="Nom"
                  value={contact.lastName}
                  icon={<Users className="size-4" />}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <InfoField
                  label="Email"
                  value={contact.email}
                  icon={<Mail className="size-4" />}
                />
                <InfoField
                  label="Téléphone"
                  value={contact.phoneNumber}
                  icon={<Phone className="size-4" />}
                />
                <InfoField
                  label="Relation"
                  value={
                    contact.relationship
                      ? t_inputs(`familyLink.options.${contact.relationship}`)
                      : undefined
                  }
                  icon={<Users className="size-4" />}
                />
                {contact.address && (
                  <div className="col-span-2">
                    <InfoField
                      label="Adresse"
                      value={<DisplayAddress address={contact.address} />}
                      icon={<MapPin className="size-4" />}
                    />
                  </div>
                )}
              </div>
            </div>
          </Fragment>
        ))}
    </div>
  );
}
