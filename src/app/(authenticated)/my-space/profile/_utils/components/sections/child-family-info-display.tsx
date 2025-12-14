'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import { User } from 'lucide-react';
import type { CompleteChildProfile } from '@/convex/lib/types';
import { Fragment } from 'react';
import { Separator } from '@/components/ui/separator';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';

interface ChildFamilyInfoDisplayProps {
  profile: CompleteChildProfile;
}

export function ChildFamilyInfoDisplay({ profile }: ChildFamilyInfoDisplayProps) {
  if (!profile) return null;

  const t_inputs = useTranslations('inputs');

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-lg">Parents</h4>

        {profile.parents?.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {profile.parents.map((parent, index) => (
                <Fragment key={index}>
                    <div className="flex flex-col gap-4 p-4 border rounded-md">
                        <h5 className="font-medium text-sm text-muted-foreground">Parent {index + 1}</h5>
                         <InfoField
                            label="Prénom"
                            value={parent.firstName}
                            icon={<User className="size-4" />}
                            required
                        />
                        <InfoField
                            label="Nom"
                            value={parent.lastName}
                            icon={<User className="size-4" />}
                            required
                        />
                         <InfoField
                            label="Relation"
                            value={parent.role ? t_inputs(`familyLink.options.${parent.role}`) : undefined}
                            icon={<User className="size-4" />}
                        />
                        <ProfileLookupSheet profileId={parent.profileId}/>
                    </div>
                </Fragment>
            ))}
            </div>
        ) : (
             <p className="text-muted-foreground">Aucun parent enregistré.</p>
        )}
      </div>
    </div>
  );
}
