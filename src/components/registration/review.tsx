'use client';

import { useTranslations } from 'next-intl';
import { FullProfileUpdateFormData } from '@/schemas/registration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewFields } from './review-fields';

export type RegistrationSection =
  | 'documents'
  | 'basicInfo'
  | 'familyInfo'
  | 'contactInfo'
  | 'professionalInfo';

interface ReviewProps {
  data: Record<RegistrationSection, Partial<FullProfileUpdateFormData>>;
  onEditAction: (step: number) => void;
}

export function ReviewForm({ data, onEditAction }: ReviewProps) {
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
          onEdit={() => onEditAction(section.step)}
        />
      ))}
    </div>
  );
}

function ReviewSection({
  id,
  title,
  data,
  onEdit,
}: {
  title: string;
  id: RegistrationSection;
  data: Partial<FullProfileUpdateFormData>;
  onEdit: () => void;
}) {
  const t = useTranslations('registration');
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className={'text-md'}>{title}</CardTitle>
        <Button 
          variant="outline" 
          size="mobile" 
          onClick={onEdit}
          leftIcon={<Pencil className="size-4" />}
        >
          {t('actions.edit')}
        </Button>
      </CardHeader>
      <CardContent>
        <ReviewFields data={data} />
      </CardContent>
    </Card>
  );
}
