'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { User, Loader2, AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfileTabs } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-tabs';
import type { FullProfile } from '@/types/profile';
import { ChildProfileTabs } from '@/app/(authenticated)/my-space/children/_components/profile-tabs';
import { api } from '@/trpc/react';

interface ProfileLookupSheetProps {
  // Mode direct : profil fourni directement
  profile?: FullProfile | null;

  // Mode recherche : email, téléphone ou ID utilisateur
  email?: string;
  phoneNumber?: string;
  userId?: string;

  // Autres props
  requestId?: string;
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost';
  children?: React.ReactNode;
}

export function ProfileLookupSheet({
  profile: providedProfile,
  email,
  phoneNumber,
  userId,
  requestId,
  triggerLabel,
  triggerVariant = 'outline',
  children,
}: ProfileLookupSheetProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const {
    data: fetchedProfile,
    isLoading,
    error,
  } = api.profile.getByQuery.useQuery(
    {
      userId,
      email,
      phoneNumber,
    },
    {
      enabled: open && !!(userId || email || phoneNumber) && !providedProfile,
      retry: false,
    },
  );

  // Profil à afficher

  const getTriggerButton = () => {
    if (children) {
      return children;
    }

    const label = triggerLabel || t('profile.lookup.view_profile');

    return (
      <Button
        variant={triggerVariant}
        size="sm"
        leftIcon={<User className="size-icon" />}
      >
        {label}
      </Button>
    );
  };

  const renderContent = () => {
    // État de chargement
    if (isLoading && !providedProfile) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>{t('profile.lookup.loading')}</span>
          </div>
        </div>
      );
    }

    // Gestion des erreurs
    if (error) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{t('profile.lookup.not_found')}</AlertDescription>
          </Alert>
        </div>
      );
    }

    // Affichage du profil
    if (providedProfile) {
      return (
        <div className="space-y-4">
          {providedProfile.category === 'MINOR' ? (
            <ChildProfileTabs profile={providedProfile} requestId={requestId} />
          ) : (
            <ProfileTabs profile={providedProfile} requestId={requestId} />
          )}
        </div>
      );
    }

    if (fetchedProfile) {
      return (
        <div className="space-y-4">
          {fetchedProfile.category === 'MINOR' ? (
            <ChildProfileTabs profile={fetchedProfile} requestId={requestId} />
          ) : (
            <ProfileTabs profile={fetchedProfile} requestId={requestId} />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{getTriggerButton()}</SheetTrigger>
      <SheetContent className="w-full max-w-4xl overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{t('profile.lookup.profile_details')}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">{renderContent()}</div>
      </SheetContent>
    </Sheet>
  );
}
