// src/components/components/review.tsx
'use client';

import { useTranslations } from 'next-intl';
import { ConsularFormData } from '@/schemas/registration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewFields } from './review-fields';

interface ReviewProps {
  data: ConsularFormData;
  onEdit: (step: number) => void;
}

export function ReviewForm({ data, onEdit }: ReviewProps) {
  const t = useTranslations('registration');

  const sections = [
    {
      key: 'documents',
      title: t('review.documents'),
      data: data.documents,
      step: 0,
    },
    {
      key: 'basicInfo',
      title: t('review.basic_info'),
      data: data.basicInfo,
      step: 1,
    },
    {
      key: 'familyInfo',
      title: t('review.family_info'),
      data: data.familyInfo,
      step: 2,
    },
    {
      key: 'contactInfo',
      title: t('review.contact_info'),
      data: data.contactInfo,
      step: 3,
    },
    {
      key: 'professionalInfo',
      title: t('review.professional_info'),
      data: data.professionalInfo,
      step: 4,
    },
  ] as const;

  return (
    <div className="space-y-4 md:space-y-6">
      {sections.map((section) => (
        <ReviewSection
          key={section.key}
          id={section.key}
          title={section.title}
          data={section.data}
          onEdit={() => onEdit(section.step)}
        />
      ))}
    </div>
  );
}

function ReviewSection<T extends keyof ConsularFormData>({
  title,
  data,
  onEdit,
  id,
}: {
  title: string;
  id: T;
  data: ConsularFormData[T];
  onEdit: () => void;
}) {
  const t = useTranslations('registration');
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className={'text-md'}>{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="size-4" />
          {t('actions.edit')}
        </Button>
      </CardHeader>
      <CardContent>
        <ReviewFields id={id} data={data} />
      </CardContent>
    </Card>
  );
}
