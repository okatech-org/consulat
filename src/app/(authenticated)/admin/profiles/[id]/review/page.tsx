import { getProfileById } from '@/actions/admin/profiles'
import { ProfileReview } from '@/components/admin/profiles/profile-review'
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
  const t = await getTranslations('admin.profiles.review')
  const t_common = await getTranslations('common')
  const profile = await getProfileById(params.id)

  if (!profile) {
    notFound()
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href={ROUTES.admin_profiles}
            className={buttonVariants({ variant: 'ghost' })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
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