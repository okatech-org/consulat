'use client'

import { useTranslations } from 'next-intl'
import { FullProfile } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileBasicInfo } from './review/basic-info'
import { ProfileDocuments } from './review/documents'
import { ProfileContact } from './review/contact'
import { ProfileFamily } from './review/family'
import { ProfileProfessional } from './review/professional'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { ProfileStatusBadge } from '@/components/profile/profile-status-badge'
import { useState } from 'react'
import { ReviewNotes } from './review/notes'

interface ProfileReviewProps {
  profile: FullProfile
}

export function ProfileReview({ profile }: ProfileReviewProps) {
  const t = useTranslations('admin.profiles.review')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState<string>('')

  const handleValidate = async () => {
    setIsSubmitting(true)
    // TODO: Implémenter la validation
    setIsSubmitting(false)
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    // TODO: Implémenter le rejet
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statut et actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold">
                {profile.firstName} {profile.lastName}
              </h3>
              <div className="flex items-center gap-2">
                <ProfileStatusBadge status={profile.status} />
                <span className="text-sm text-muted-foreground">
                  {t('submitted_on')}: {new Date(profile.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                {t('actions.reject')}
              </Button>
              <Button
                variant={"success"}
                onClick={handleValidate}
                disabled={isSubmitting}
              >
                <Check className="mr-2 h-4 w-4" />
                {t('actions.validate')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
              <TabsTrigger value="documents">{t('tabs.documents')}</TabsTrigger>
              <TabsTrigger value="contact">{t('tabs.contact')}</TabsTrigger>
              <TabsTrigger value="family">{t('tabs.family')}</TabsTrigger>
              <TabsTrigger value="professional">{t('tabs.professional')}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <ProfileBasicInfo profile={profile} />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <ProfileDocuments profile={profile} />
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <ProfileContact profile={profile} />
            </TabsContent>

            <TabsContent value="family" className="space-y-4">
              <ProfileFamily profile={profile} />
            </TabsContent>

            <TabsContent value="professional" className="space-y-4">
              <ProfileProfessional profile={profile} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Panneau latéral pour les notes et validations */}
        <div className="space-y-6">
          <ReviewNotes
            notes={notes}
            onChange={setNotes}
            onSubmit={() => {
              // TODO: Sauvegarder les notes
            }}
          />
        </div>
      </div>
    </div>
  )
}