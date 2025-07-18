'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';
import { calculateAge, useDateLocale } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import { useChildProfiles } from '@/hooks/use-child-profiles';
import type { UserData } from '@/types/role-data';

interface ChildProfileCardProps {
  child: UserData['children'][number];
}

export function ChildProfileCard({ child }: ChildProfileCardProps) {
  const t = useTranslations('user.children');
  const tInputs = useTranslations('inputs');
  const tBase = useTranslations();
  const { formatDate } = useDateLocale();

  const { deleteChild, isDeleting } = useChildProfiles();

  // Calculer l'âge à partir de la date de naissance
  const age = child?.profile?.birthDate
    ? calculateAge(child.profile.birthDate.toISOString())
    : 0;

  const handleDelete = () => {
    if (!child?.profile?.id) return;
    deleteChild({ id: child.profile.id });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 rounded-full overflow-hidden border">
            <Image
              src={child?.parentUser?.image || '/avatar-placeholder.png'}
              alt={`${child?.profile?.firstName || ''} ${child?.profile?.lastName || ''}`}
              fill
              className="object-cover"
            />
            {child.role && (
              <div className="absolute bottom-0 w-full text-center right-0 bg-primary text-[0.5em] text-white px-1 rounded-sm">
                {tInputs(`parentRole.options.${child.role}`)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {`${child?.profile?.firstName || ''} ${child?.profile?.lastName || ''}`}{' '}
              <span className="text-xs text-muted-foreground">
                - {tBase(`common.status.${child?.profile?.status}`)}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('child_card.age', { age })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">{tInputs('profile.birthDate')}</p>
            <p>{child?.profile?.birthDate ? formatDate(child.profile.birthDate) : '-'}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t pt-4">
        <Button variant="outline" asChild size="sm" className="flex-1">
          <Link href={ROUTES.user.child_profile(child?.profile?.id)}>
            <ExternalLink className="size-icon" />
            {t('child_card.view_profile')}
          </Link>
        </Button>
        {child?.profile?.status === 'DRAFT' ? (
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="size-icon" />
            {isDeleting ? t('child_card.deleting') : t('child_card.delete')}
          </Button>
        ) : (
          <Button disabled variant="default" size="sm" className="flex-1">
            <FileText className="size-icon" />
            {t('child_card.make_request')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
