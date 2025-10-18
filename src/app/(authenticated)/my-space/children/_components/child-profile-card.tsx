'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';
import { calculateAge, useDateLocale } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';
import type { Doc } from 'convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ProfileStatus } from '@/convex/lib/constants';

interface ChildProfileCardProps {
  child: Doc<'childProfiles'>;
}

export function ChildProfileCard({ child }: ChildProfileCardProps) {
  const t = useTranslations('user.children');
  const tInputs = useTranslations('inputs');
  const tBase = useTranslations();
  const { formatDate } = useDateLocale();
  const deleteChild = useMutation(api.functions.childProfile.deleteChildProfile);
  // Calculer l'âge à partir de la date de naissance
  const age = child?.personal?.birthDate
    ? calculateAge(child.personal.birthDate.toString())
    : 0;

  const handleDelete = () => {
    if (!child?._id) return;
    deleteChild({ childProfileId: child._id });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 rounded-full overflow-hidden border">
            <Image
              src={'/avatar-placeholder.png'}
              alt={`${child?.personal?.firstName || ''} ${child?.personal?.lastName || ''}`}
              fill
              className="object-cover"
            />
            {child.parents[0]?.role && (
              <div className="absolute bottom-0 w-full text-center right-0 bg-primary text-[0.5em] text-white px-1 rounded-sm">
                {tInputs(`parentRole.options.${child.parents[0]?.role}`)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {`${child?.personal?.firstName || ''} ${child?.personal?.lastName || ''}`}{' '}
              <span className="text-xs text-muted-foreground">
                - {tBase(`common.status.${child?.status}`)}
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
            <p>
              {child?.personal?.birthDate
                ? formatDate(new Date(child.personal.birthDate.toString()))
                : '-'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t pt-4">
        <Button variant="outline" asChild size="sm" className="flex-1">
          <Link href={ROUTES.user.child_profile(child?._id)}>
            <ExternalLink className="size-icon" />
            {t('child_card.view_profile')}
          </Link>
        </Button>
        {child?.status === ProfileStatus.Draft ? (
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={handleDelete}
          >
            <Trash2 className="size-icon" />
            {t('child_card.delete')}
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
