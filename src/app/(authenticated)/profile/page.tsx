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
import { DocumentsSection } from '@/components/profile/sections/documents-section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubmitProfileButton } from '@/components/profile/submit-profile-button'
import { NotesList } from '@/components/admin/profiles/profile-notes'

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
      title: t('sections.documents'),
      content: (
        <DocumentsSection
          documents={{
            passport: profile.passport,
            birthCertificate: profile.birthCertificate,
            residencePermit: profile.residencePermit,
            addressProof: profile.addressProof
          }}
          className="md:col-span-2"
        />
      ),
    },
  ]

  return (
    <div className="container space-y-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <ProfileHeaderClient profile={profile} />
        <ProfileCompletionAssistant
          profile={profile}
        />
        <div className="grid grid-cols-8 gap-4">
          {profile && (
            <Tabs
              className={"col-span-full lg:col-span-6"}
              defaultValue="basic-info"
            >
              <TabsList className="w-full mb-2">
                <div className="flex gap-2 items-center carousel-zone">
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
            <NotesList notes={profile.notes.filter(note => note.type === 'FEEDBACK')} />
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