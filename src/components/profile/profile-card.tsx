import { useTranslations } from 'next-intl';
import type { CompleteProfile } from '@/convex/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProfileStatusBadge } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-status-badge';
import type { CountryCode } from '@/lib/autocomplete-datas';

interface ProfileCardProps {
  profile: CompleteProfile;
  onClick: () => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const t = useTranslations('inputs');
  const t_common = useTranslations('common');
  const t_countries = useTranslations('countries');

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="size-10">
          {profile.identityPicture ? (
            <AvatarImage
              src={profile.identityPicture.fileUrl}
              alt={profile?.firstName ?? ''}
            />
          ) : (
            <AvatarFallback>{profile.firstName?.[0]}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">
            {profile.firstName} {profile.lastName}
          </h3>
          <ProfileStatusBadge status={profile.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          {t('nationality.label')}:{' '}
          {profile.nationality ? t_countries(profile.nationality as CountryCode) : '-'}
        </p>
        <p>
          {t('birthDate.label')}:{' '}
          {profile.birthDate
            ? format(new Date(profile.birthDate), 'PPP', { locale: fr })
            : ''}
        </p>
        <p>
          {t('submittedAt.label')}:{' '}
          {profile.updatedAt
            ? format(new Date(profile.updatedAt), 'PPP', { locale: fr })
            : '-'}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onClick}>
          {t_common('actions.view')}
        </Button>
      </CardFooter>
    </Card>
  );
}
