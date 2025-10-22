'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { User, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ProfileTabs } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-tabs';
import { ChildProfileTabs } from '@/app/(authenticated)/my-space/children/_components/profile-tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import type { CompleteChildProfile, CompleteProfile } from '@/convex/lib/types';
import type { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

interface ProfileLookupSheetProps {
  // Mode direct : profil fourni directement
  profile?: CompleteProfile;
  childProfile?: CompleteChildProfile;
  profileId?: Id<'profiles'>;
  childProfileId?: Id<'childProfiles'>;

  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost';
  triggerIcon?: React.ReactNode;
  children?: React.ReactNode;
  tooltipContent?: string;
  icon?: React.ReactNode;
}

export function ProfileLookupSheet({
  profile: providedProfile,
  childProfile: providedChildProfile,
  profileId,
  childProfileId,
  triggerLabel,
  triggerVariant = 'outline',
  triggerIcon,
  children,
  tooltipContent,
  icon,
}: ProfileLookupSheetProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const fetchedProfile = useQuery(
    api.functions.profile.getCurrentProfile,
    profileId && open ? { profileId } : 'skip',
  );

  const fetchedChildProfile = useQuery(
    api.functions.childProfile.getCurrentChildProfile,
    childProfileId && open ? { childProfileId } : 'skip',
  );

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
    if (fetchedProfile === undefined && fetchedChildProfile === undefined) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>{t('profile.lookup.loading')}</span>
          </div>
        </div>
      );
    }

    // Affichage du profil
    if (providedChildProfile) {
      return (
        <div className="space-y-4">
          <ChildProfileTabs profile={providedChildProfile} />
        </div>
      );
    }

    if (providedProfile) {
      return (
        <div className="space-y-4">
          <ProfileTabs profile={fetchedProfile} />
        </div>
      );
    }

    if (fetchedProfile) {
      return (
        <div className="space-y-4">
          <ProfileTabs profile={fetchedProfile} noTabs={true} />
        </div>
      );
    }
    if (fetchedChildProfile) {
      return (
        <div className="space-y-4">
          <ChildProfileTabs profile={fetchedChildProfile} noTabs={true} />
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
