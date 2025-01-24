import { getTranslations } from 'next-intl/server';
import { getProfileById } from '../../../_utils/actions/profiles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '../../../../../../schemas/routes';
import { buttonVariants } from '../../../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProfileReview } from '../../../_utils/profiles/profile-review';

interface ProfileReviewPageProps {
  params: {
    id: string;
  };
}

export default async function ProfileReviewPage({ params }: ProfileReviewPageProps) {
  const t = await getTranslations('actions.profiles.review');
  const t_common = await getTranslations('common');
  const profile = await getProfileById(params.id);

  if (!profile) {
    notFound();
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
  );
}
