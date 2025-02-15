'use client';

import { FullServiceRequest } from '@/types/service-request';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDateLocale } from '@/lib/utils';
import { DocumentsList } from '@/components/documents-list';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { User } from 'lucide-react';
import { UserProfile } from '@/components/profile/user-profile';

interface ServiceRequestReviewProps {
  request: FullServiceRequest;
}

export function ServiceRequestReview({ request }: ServiceRequestReviewProps) {
  const { formatDate } = useDateLocale();
  const t = useTranslations('admin.requests');

  return (
    <div className="space-y-6">
      {/* En-tête avec les informations principales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('service_request.title')}</CardTitle>
            <Badge variant="outline">{t(`status.${request.status.toLowerCase()}`)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informations de base */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium">{t('service_request.service_info')}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>{request.service.name}</p>
                <p className="text-muted-foreground">{request.service.description}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium">{t('service_request.submission_info')}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  {t('service_request.submitted_on', {
                    date: formatDate(request.submittedAt ?? ''),
                  })}
                </p>
                <p>
                  {t('service_request.processing_mode')}:{' '}
                  {t(`processing_mode.${request.chosenProcessingMode.toLowerCase()}`)}
                </p>
                <p>
                  {t('service_request.delivery_mode')}:{' '}
                  {t(`delivery_mode.${request.chosenDeliveryMode.toLowerCase()}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Bouton pour voir le profil complet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="size-4" />
                {t('service_request.view_profile')}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-4xl">
              <SheetHeader>
                <SheetTitle>{t('service_request.applicant_profile')}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <UserProfile user={request.submittedBy} />
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      {/* Documents fournis */}
      <Card>
        <CardHeader>
          <CardTitle>{t('service_request.documents')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentsList documents={request.documents} />
        </CardContent>
      </Card>

      {/* Données du formulaire si présentes */}
      {request.formData && (
        <Card>
          <CardHeader>
            <CardTitle>{t('service_request.form_data')}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
              {JSON.stringify(request.formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
