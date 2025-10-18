'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ChildProfilePageClient() {
  const params = useParams<{ id: string }>();
  const childProfileId = params.id as Id<'childProfiles'>;
  const t = useTranslations('user.children');

  const childProfile = useQuery(
    api.functions.childProfile.getCurrentChildProfile,
    childProfileId ? { childProfileId } : 'skip',
  );

  const isLoading = childProfile === undefined;

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSkeleton variant="form" />
      </PageContainer>
    );
  }

  if (!childProfile) {
    return (
      <PageContainer>
        <ErrorCard
          title={t('errors.not_found')}
          description={t('errors.not_found_description')}
        />
        <Button asChild className="mt-4">
          <Link href={ROUTES.user.children}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('actions.back')}
          </Link>
        </Button>
      </PageContainer>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'validated':
        return 'success';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {childProfile.personal.firstName} {childProfile.personal.lastName}
          </h1>
          <Badge variant={getStatusBadgeVariant(childProfile.status) as any}>
            {t(`status.${childProfile.status}`)}
          </Badge>
        </div>
        <Button asChild variant="outline">
          <Link href={ROUTES.user.children}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('actions.back')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.personal_info')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('fields.firstName')}
                </label>
                <p className="text-base">{childProfile.personal.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('fields.lastName')}
                </label>
                <p className="text-base">{childProfile.personal.lastName}</p>
              </div>
            </div>

            {childProfile.personal.birthDate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('fields.birthDate')}
                </label>
                <p className="text-base">
                  {format(new Date(childProfile.personal.birthDate), 'PP')}
                </p>
              </div>
            )}

            {childProfile.personal.birthPlace && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('fields.birthPlace')}
                </label>
                <p className="text-base">{childProfile.personal.birthPlace}</p>
              </div>
            )}

            {childProfile.personal.nationality && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('fields.nationality')}
                </label>
                <p className="text-base">{childProfile.personal.nationality}</p>
              </div>
            )}

            {childProfile.personal.gender && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('fields.gender')}
                </label>
                <p className="text-base">{t(`gender.${childProfile.personal.gender}`)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consular Card */}
        {(childProfile.consularCard.cardNumber ||
          childProfile.consularCard.cardIssuedAt ||
          childProfile.consularCard.cardExpiresAt) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('sections.consular_card')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {childProfile.consularCard.cardNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('fields.cardNumber')}
                  </label>
                  <p className="text-base">{childProfile.consularCard.cardNumber}</p>
                </div>
              )}
              {childProfile.consularCard.cardIssuedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('fields.cardIssuedAt')}
                  </label>
                  <p className="text-base">
                    {format(new Date(childProfile.consularCard.cardIssuedAt), 'PP')}
                  </p>
                </div>
              )}
              {childProfile.consularCard.cardExpiresAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('fields.cardExpiresAt')}
                  </label>
                  <p className="text-base">
                    {format(new Date(childProfile.consularCard.cardExpiresAt), 'PP')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Parents Information */}
        {childProfile.parents && childProfile.parents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('sections.parents')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {childProfile.parents.map((parent, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h4 className="font-medium mb-2">{t(`parentalRole.${parent.role}`)}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('fields.name')}
                      </label>
                      <p className="text-base">
                        {parent.firstName} {parent.lastName}
                      </p>
                    </div>
                    {parent.email && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('fields.email')}
                        </label>
                        <p className="text-base">{parent.email}</p>
                      </div>
                    )}
                    {parent.phoneNumber && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('fields.phone')}
                        </label>
                        <p className="text-base">{parent.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {(childProfile.birthCertificate ||
          childProfile.passport ||
          childProfile.identityPicture) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('sections.documents')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {childProfile.birthCertificate && (
                <div className="flex items-center justify-between py-2">
                  <span>{t('documents.birth_certificate')}</span>
                  <Badge variant="success">{t('status.uploaded')}</Badge>
                </div>
              )}
              {childProfile.passport && (
                <div className="flex items-center justify-between py-2">
                  <span>{t('documents.passport')}</span>
                  <Badge variant="success">{t('status.uploaded')}</Badge>
                </div>
              )}
              {childProfile.identityPicture && (
                <div className="flex items-center justify-between py-2">
                  <span>{t('documents.identity_photo')}</span>
                  <Badge variant="success">{t('status.uploaded')}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
