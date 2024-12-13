import React, { Suspense } from 'react'
import { getUserFullProfile } from '@/lib/user/getters'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'

import { ProfileHeaderClient } from '@/components/profile/profile-header-client'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { InfoIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { calculateProfileCompletion } from '@/lib/services/dashboard/utils'
import { ProfileCompletion } from '@/components/profile/profile-completion'
import { getProfileFieldsStatus } from '@/lib/utils'
import { BasicInfoSection } from '@/components/profile/sections/basic-info-section'
import { ContactInfoSection } from '@/components/profile/sections/contact-info-section'
import { FamilyInfoSection } from '@/components/profile/sections/family-info-section'
import { ProfessionalInfoSection } from '@/components/profile/sections/professional-info-section'
import { ProfileCompletionAssistant } from '@/components/profile/profile-completion-assistant'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  const t = await getTranslations('profile')

  if (!user) {
    redirect(ROUTES.login)
  }

  const profile = await getUserFullProfile(user.id)

  const completionRate = calculateProfileCompletion(profile)
  const fieldStatus = getProfileFieldsStatus(profile)

  if (!profile) {
    return (
      <div className={"container flex flex-col gap-4"}>
        <Card>
          <CardHeader>
            <CardTitle>
              {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className={"flex flex-col gap-4 items-center"}>
            <p className="text-muted-foreground">{t('no_profile')}</p>
            <Link
              href={ROUTES.registration}
              className={
                buttonVariants({
                  variant: 'default',
                }) + 'w-max'
              }
            >
              <Plus className="h-4 w-4" />
              {t('actions.create')}
            </Link>
          </CardContent>
        </Card>
        <div className="flex gap-2 items-center">
          <InfoIcon className="size-5 text-primary" />
          <h3 className="font-medium">
            {t('no_profile_help')}
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className="container space-y-6 py-6 md:py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <ProfileHeaderClient profile={profile} />
        <ProfileCompletion
          completionRate={completionRate}
          fieldStatus={fieldStatus}
        />
        <ProfileCompletionAssistant
          profile={profile}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {profile && (
            <>
              <BasicInfoSection profile={profile} />
              <ContactInfoSection
                profile={profile}
              />
              <FamilyInfoSection profile={profile} />
              <ProfessionalInfoSection profile={profile} />
            </>
          )}

          {/**<DocumentsSection
            documents={{
              passport: profile.passport,
              birthCertificate: profile.birthCertificate,
              residencePermit: profile.residencePermit,
              addressProof: profile.addressProof
            }}
            className="md:col-span-2"
          />*/}
        </div>
      </Suspense>
    </div>
  )
}