'use client';

import { useTranslations } from 'next-intl';
import { ServiceCategory } from '@/convex/lib/constants';
import CardContainer from '../layouts/card-container';
import { MultiSelect } from '../ui/multi-select';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

export function ServiceCategorySelector() {
  const tServices = useTranslations('services');
  const t_inputs = useTranslations('inputs');
  const router = useRouter();

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
          onChange={(value) => router.push(ROUTES.dashboard.new_service(value))}
          type="single"
          className="w-full"
        />
      </div>
    </CardContainer>
  );
}
