'use client';

import { useTranslations } from 'next-intl';
import { ServiceCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, FileText, Globe } from 'lucide-react';
import { IdCardIcon } from '@radix-ui/react-icons';
import CardContainer from '../layouts/card-container';
import { MultiSelect } from '../ui/multi-select';

interface ServiceCategorySelectorProps {
  onCategorySelect: (category: ServiceCategory) => void;
  selectedCategory?: ServiceCategory;
}

export function ServiceCategorySelector({
  onCategorySelect,
  selectedCategory,
}: ServiceCategorySelectorProps) {
  const tServices = useTranslations('services');
  const t_inputs = useTranslations('inputs');
  // Category icons and descriptions
  const categoryInfo: Record<
    ServiceCategory,
    { icon: React.ReactNode; description: string }
  > = {
    [ServiceCategory.TRANSCRIPT]: {
      icon: <FileText className="size-icon" />,
      description: t_inputs('serviceCategory.options.TRANSCRIPT'),
    },
    [ServiceCategory.IDENTITY]: {
      icon: <IdCardIcon className="size-icon" />,
      description: t_inputs('serviceCategory.options.IDENTITY'),
    },
    [ServiceCategory.CIVIL_STATUS]: {
      icon: <FileText className="size-icon" />,
      description: t_inputs('serviceCategory.options.CIVIL_STATUS'),
    },
    [ServiceCategory.VISA]: {
      icon: <Globe className="size-icon" />,
      description: t_inputs('serviceCategory.options.VISA'),
    },
    [ServiceCategory.CERTIFICATION]: {
      icon: <FileText className="size-icon" />,
      description: t_inputs('serviceCategory.options.CERTIFICATION'),
    },
    [ServiceCategory.REGISTRATION]: {
      icon: <FileText className="size-icon" />,
      description: t_inputs('serviceCategory.options.REGISTRATION'),
    },
    [ServiceCategory.OTHER]: {
      icon: <FileText className="size-icon" />,
      description: t_inputs('serviceCategory.options.OTHER'),
    },
  };

  return (
    <CardContainer
      title={tServices('category_selector.title')}
      subtitle={tServices('category_selector.subtitle')}
    >
      <div className="flex justify-center items-center space-y-4">
        <MultiSelect<ServiceCategory>
          options={Object.values(ServiceCategory).map((category) => ({
            label: t_inputs(`serviceCategory.options.${category}`),
            value: category,
          }))}
          onChange={(value) => onCategorySelect(value)}
          type="single"
          className="w-full"
        />
      </div>
    </CardContainer>
  );
}
