'use client';

import type { FullProfile } from '@/types';

interface ChildBasicInfoSectionProps {
  profile: FullProfile;
}

export function ChildBasicInfoSection({ profile }: ChildBasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informations de base</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Prénom</label>
          <p>{profile.firstName || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Nom</label>
          <p>{profile.lastName || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Date de naissance
          </label>
          <p>{profile.birthDate?.toLocaleDateString() || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Lieu de naissance
          </label>
          <p>{profile.birthPlace || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Nationalité</label>
          <p>{profile.nationality || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Genre</label>
          <p>{profile.gender || '-'}</p>
        </div>
      </div>
    </div>
  );
}
