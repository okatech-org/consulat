import { getProfileById } from '@/app/(authenticated)/admin/_utils/actions/profiles'
import { ProfileReview } from '@/app/(authenticated)/admin/_utils/profiles/profile-review'
import { ROUTES } from '@/schemas/routes'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'

interface ProfileReviewPageProps {
  params: {
    id: string
  }
}

export default async function ProfileReviewPage({ params }: ProfileReviewPageProps) {
  const t = await getTranslations('actions.profiles.review')
  const t_common = await getTranslations('common')
  const profile = await getProfileById(params.id)

  if (!profile) {
    notFound()
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-4">
          <Link
            href={ROUTES.admin_profiles}
            className={buttonVariants({ variant: 'ghost' })}
          >
            <ArrowLeft className="mr-2 size-4" />
            {t_common('actions.back')}
          </Link>
          <h1 className="text-2xl font-bold">
            {t('title')} - {profile.firstName} {profile.lastName}
          </h1>
        </div>
      </div>

      <ProfileReview profile={profile} />
    </div>
  )
}