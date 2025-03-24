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
import { Check } from 'lucide-react';

interface ServiceCategorySelectorProps {
  onCategorySelect: (category: ServiceCategory) => void;
  selectedCategory?: ServiceCategory;
}

export function ServiceCategorySelector({
  onCategorySelect,
  selectedCategory,
}: ServiceCategorySelectorProps) {
  const t = useTranslations('common');
  const tServices = useTranslations('services');

  // Category icons and descriptions
  const categoryInfo = {
    [ServiceCategory.IDENTITY]: {
      icon: '🪪',
      description: "Services liés aux documents d'identité",
    },
    [ServiceCategory.CIVIL_STATUS]: {
      icon: '📝',
      description: "Services liés à l'état civil",
    },
    [ServiceCategory.VISA]: {
      icon: '🛂',
      description: 'Services liés aux visas et permis de séjour',
    },
    [ServiceCategory.CERTIFICATION]: {
      icon: '📜',
      description: 'Services de certification et légalisation',
    },
    [ServiceCategory.REGISTRATION]: {
      icon: '📋',
      description: "Services d'inscription consulaire",
    },
    [ServiceCategory.OTHER]: {
      icon: '📌',
      description: 'Autres services consulaires',
    },
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-semibold">
        {tServices('category_selector.title') || 'Sélectionnez une catégorie'}
      </h2>
      <p className="text-muted-foreground">
        {tServices('category_selector.subtitle') ||
          'Choisissez le type de service que vous souhaitez créer'}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Object.values(ServiceCategory).map((category) => (
          <Card
            key={category}
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              selectedCategory === category ? 'border-2 border-primary' : ''
            }`}
            onClick={() => onCategorySelect(category)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="text-2xl">{categoryInfo[category].icon}</div>
                {selectedCategory === category && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardTitle className="text-lg">
                {t(`service_categories.${category}`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="min-h-[60px]">
                {categoryInfo[category].description}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="w-full"
                onClick={() => onCategorySelect(category)}
              >
                {selectedCategory === category
                  ? tServices('category_selector.selected') || 'Sélectionné'
                  : tServices('category_selector.select') || 'Sélectionner'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
