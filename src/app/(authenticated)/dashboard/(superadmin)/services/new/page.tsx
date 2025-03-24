'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { ServiceCategory, Country } from '@prisma/client';
import CardContainer from '@/components/layouts/card-container';
import { ServiceCategorySelector } from '@/components/organization/service-category-selector';
import { NewServiceForm } from '@/components/organization/new-service-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { createService } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import { NewServiceSchemaInput } from '@/schemas/consular-service';
import { PageContainer } from '@/components/layouts/page-container';
import { ROUTES } from '@/schemas/routes';

interface ServiceCreationPageProps {
  countries: Country[];
}

export default function ServiceCreationPage({ countries }: ServiceCreationPageProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const selectedCategory = searchParams.get('category') as ServiceCategory | null;

  const handleSubmit = async (data: NewServiceSchemaInput) => {
    try {
      const result = await createService(data);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: t('messages.createSuccess'),
        variant: 'success',
      });
      router.push('/services');
    } catch (error) {
      toast({
        title: t('messages.error.create'),
        description: `${error}`,
        variant: 'destructive',
      });
    }
  };

  function getServiceCategoryForm(category: ServiceCategory) {
    switch (category) {
      default:
        return (
          <CardContainer>
            <NewServiceForm
              initialData={{ category }}
              handleSubmit={handleSubmit}
              countries={countries}
            />
          </CardContainer>
        );
    }
  }

  return (
    <PageContainer
      title={t('services.form.create_title')}
      description={
        selectedCategory
          ? t(`inputs.serviceCategory.options.${selectedCategory}`)
          : t('services.category_selector.subtitle')
      }
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={
              selectedCategory ? ROUTES.dashboard.services_new : ROUTES.dashboard.services
            }
          >
            <ArrowLeft className="size-icon" />
            {selectedCategory
              ? t('services.actions.backToCategorySelector')
              : t('services.actions.backToServices')}
          </Link>
        </Button>
      }
    >
      {selectedCategory ? (
        getServiceCategoryForm(selectedCategory)
      ) : (
        <ServiceCategorySelector
          onCategorySelect={(category: ServiceCategory) =>
            router.push(ROUTES.dashboard.new_service(category))
          }
        />
      )}
    </PageContainer>
  );
}
