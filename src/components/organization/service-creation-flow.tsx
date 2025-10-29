'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ServiceCategory } from '@/convex/lib/constants';
import { NewServiceForm } from '@/components/organization/new-service-form';
import { ServiceCategorySelector } from '@/components/organization/service-category-selector';
import { NewServiceSchemaInput } from '@/schemas/consular-service';
import { Country, Organization } from '@/types';
import { Steps } from '../ui/steps';
import { Step } from '../ui/steps';

interface ServiceCreationFlowProps {
  handleSubmit: (data: NewServiceSchemaInput) => Promise<void>;
  isLoading?: boolean;
  countries: Country[];
  initialData?: Partial<NewServiceSchemaInput>;
}

export function ServiceCreationFlow({
  countries,
  organizations,
  initialData,
}: ServiceCreationFlowProps) {
  const t = useTranslations('services');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(
    initialData?.category,
  );

  const steps = [
    {
      label: t('creation_flow.steps.select_category'),
      description: t('creation_flow.steps.select_category_description'),
    },
    {
      label: t('creation_flow.steps.fill_details'),
      description: t('creation_flow.steps.fill_details_description'),
    },
  ];

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setCurrentStep(1);
  };

  const goBack = () => {
    setCurrentStep(0);
  };

  return (
    <div className="space-y-8">
      <Steps currentStep={currentStep} className="mb-8">
        {steps.map((step, index) => (
          <Step
            key={index}
            label={step.label}
            description={step.description}
            status={
              index < currentStep
                ? 'complete'
                : index === currentStep
                  ? 'current'
                  : 'upcoming'
            }
            onClick={index < currentStep ? () => setCurrentStep(index) : undefined}
          />
        ))}
      </Steps>

      {currentStep === 0 && (
        <div>
          <ServiceCategorySelector />
        </div>
      )}

      {currentStep === 1 && selectedCategory && (
        <div className="space-y-4">
          <button
            onClick={goBack}
            className="mb-4 flex items-center text-sm font-medium text-primary hover:underline"
          >
            ← {t('creation_flow.back_to_categories')}
          </button>

          <NewServiceForm
            countries={countries}
            organizations={organizations}
            initialData={{
              ...initialData,
              category: selectedCategory,
            }}
          />
        </div>
      )}
    </div>
  );
}
