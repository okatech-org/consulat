import React, { Suspense } from 'react'
import { getUserFullProfile } from '@/lib/user/getters'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'

import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { InfoIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { calculateProfileCompletion, getProfileFieldsStatus } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotesList } from '@/app/(authenticated)/admin/_utils/profiles/profile-notes'
import { BasicInfoSection } from '@/app/(authenticated)/user/profile/_utils/components/sections/basic-info-section'
import { ContactInfoSection } from '@/app/(authenticated)/user/profile/_utils/components/sections/contact-info-section'
import { FamilyInfoSection } from '@/app/(authenticated)/user/profile/_utils/components/sections/family-info-section'
import {
  ProfessionalInfoSection
} from '@/app/(authenticated)/user/profile/_utils/components/sections/professional-info-section'
import { DocumentsSection } from '@/app/(authenticated)/user/profile/_utils/components/sections/documents-section'
import { ProfileHeaderClient } from '@/app/(authenticated)/user/profile/_utils/components/profile-header-client'
import {
  ProfileCompletionAssistant
} from '@/app/(authenticated)/user/profile/_utils/components/profile-completion-assistant'
import { ProfileCompletion } from '@/app/(authenticated)/user/profile/_utils/components/profile-completion'
import { SubmitProfileButton } from '@/app/(authenticated)/user/profile/_utils/components/submit-profile-button'

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
          <CardContent className={"flex flex-col items-center gap-4"}>
            <p className="text-muted-foreground">{t('no_profile')}</p>
            <Link
              href={ROUTES.registration}
              className={
                buttonVariants({
                  variant: 'default',
                }) + 'w-max'
              }
            >
              <Plus className="size-4" />
              {t('actions.create')}
            </Link>
          </CardContent>
        </Card>
        <div className="flex items-center gap-2">
          <InfoIcon className="size-5 text-primary" />
          <h3 className="font-medium">
            {t('no_profile_help')}
          </h3>
        </div>
      </div>
    )
  }

  const profileTabs = [
    {
      id: 'basic-info',
      title: t('sections.basic_info'),
      content: <BasicInfoSection profile={profile} />,
    },
    {
      id: 'contact-info',
      title: t('sections.contact_info'),
      content: <ContactInfoSection profile={profile} />,
    },
    {
      id: 'family-info',
      title: t('sections.family_info'),
      content: <FamilyInfoSection profile={profile} />,
    },
    {
      id: 'professional-info',
      title: t('sections.professional_info'),
      content: <ProfessionalInfoSection profile={profile} />,
    },
    {
      id: 'documents',
      title: t('sections.components'),
      content: (
        <DocumentsSection
          documents={{
            passport: profile.passport,
            birthCertificate: profile.birthCertificate,
            residencePermit: profile.residencePermit,
            addressProof: profile.addressProof,
            identityPhoto: profile.identityPicture
          }}
          profileId={profile.id}
          className="md:col-span-2"
        />
      ),
    },
  ]

  return (
    <div className="container relative space-y-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="flex flex-col gap-4">
          <ProfileHeaderClient profile={profile} />
          <ProfileCompletionAssistant
            profile={profile}
            user={user}
          />
        </div>
        <div className="grid grid-cols-8 gap-4">
          {profile && (
            <Tabs
              className={"col-span-full lg:col-span-6"}
              defaultValue="basic-info"
            >
              <TabsList className="mb-2 w-full">
                <div className="carousel-zone flex items-center gap-2">
                  {profileTabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.title}
                    </TabsTrigger>
                  ))}
                </div>
              </TabsList>
              {profileTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          )}
          <div className={"col-span-full flex flex-col gap-4 lg:col-span-2"}>
            {profile.notes.filter(note => note.type === 'FEEDBACK').length > 0 && (
              <NotesList notes={profile.notes.filter(note => note.type === 'FEEDBACK')} />
            )}
            <ProfileCompletion
              completionRate={completionRate}
              fieldStatus={fieldStatus}
            />

            <div className="flex flex-col items-center">
              <SubmitProfileButton
                isComplete={completionRate === 100}
                profileId={profile.id}
              />
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  )
}