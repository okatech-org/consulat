import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { FullParentalAuthority } from '@/types/parental-authority';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';
import { calculateAge } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';

interface ChildProfileCardProps {
  parentalAuthority: FullParentalAuthority;
}

export function ChildProfileCard({ parentalAuthority }: ChildProfileCardProps) {
  const t = useTranslations('user.children');
  const tInputs = useTranslations('inputs');
  const profile = parentalAuthority.profile;

  // Calculer l'âge à partir de la date de naissance
  const age = profile?.birthDate ? calculateAge(profile.birthDate) : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 rounded-full overflow-hidden border">
            <Image
              src={profile?.user?.image || '/images/avatar-placeholder.png'}
              alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
              fill
              className="object-cover"
            />
            {parentalAuthority.role && (
              <div className="absolute bottom-0 w-full text-center right-0 bg-primary text-[0.5em] text-white px-1 rounded-sm">
                {tInputs(`parentRole.options.${parentalAuthority.role}`)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg">{`${profile?.firstName || ''} ${profile?.lastName || ''}`}</h3>
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
            <p>{profile?.birthDate || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{tInputs('profile.nationality')}</p>
            <p>{profile?.nationality || '-'}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t pt-4">
        <Button variant="outline" asChild size="sm" className="flex-1">
          <Link href={ROUTES.user.child_profile(profile?.id)}>
            <ExternalLink className="size-icon" />
            {t('child_card.view_profile')}
          </Link>
        </Button>
        <Button disabled variant="default" size="sm" className="flex-1">
          <FileText className="size-icon" />
          {t('child_card.make_request')}
        </Button>
      </CardFooter>
    </Card>
  );
}
