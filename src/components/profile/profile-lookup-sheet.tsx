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
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ProfileLookupSheetProps {
  // Mode direct : profil fourni directement
  profile?: FullProfile | null;

  // Mode recherche : email, téléphone ou ID utilisateur
  email?: string;
  phoneNumber?: string;
  userId?: string;

  profileId?: string;

  // Autres props
  requestId?: string;
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost';
  triggerIcon?: React.ReactNode;
  children?: React.ReactNode;
  tooltipContent?: string;
  icon?: React.ReactNode;
}

export function ProfileLookupSheet({
  profile: providedProfile,
  email,
  phoneNumber,
  userId,
  profileId,
  requestId,
  triggerLabel,
  triggerVariant = 'outline',
  triggerIcon,
  children,
  tooltipContent,
  icon,
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
      profileId,
    },
    {
      enabled: !!(userId || email || phoneNumber || profileId) && !providedProfile,
      retry: false,
    },
  );

  // Profil à afficher

  const getTriggerButton = () => {
    if (children) {
      return children;
    }

    if (icon && tooltipContent) {
      return (
        <Button variant="ghost" size="icon" className="aspect-square p-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                {icon}
                <span className="sr-only">
                  {triggerLabel || t('profile.lookup.view_profile')}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <span>{tooltipContent}</span>
            </TooltipContent>
          </Tooltip>
        </Button>
      );
    }

    const label = triggerLabel || t('profile.lookup.view_profile');

    return (
      <Button
        variant={triggerVariant}
        size="sm"
        leftIcon={triggerIcon || <User className="size-icon" />}
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
            <ChildProfileTabs
              profile={fetchedProfile}
              requestId={requestId}
              noTabs={true}
            />
          ) : (
            <ProfileTabs profile={fetchedProfile} requestId={requestId} noTabs={true} />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{getTriggerButton()}</SheetTrigger>
      <SheetContent className="w-full max-w-4xl overflow-y-auto sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>{t('profile.lookup.profile_details')}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">{renderContent()}</div>
      </SheetContent>
    </Sheet>
  );
}
