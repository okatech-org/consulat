'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form } from '@/components/ui/form';
import { Controller, useForm } from 'react-hook-form';
import {
  Field,
  FieldError,
} from '@/components/ui/field';
import { UserDocument } from '../documents/user-document';
import CardContainer from '../layouts/card-container';
import type { ServiceForm } from '@/hooks/use-service-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { MobileProgress } from '../registration/mobile-progress';
import type { Doc } from '@/convex/_generated/dataModel';

interface ServiceDocumentSectionProps {
  formData: ServiceForm;
  isLoading?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
  onNext: (data: Record<string, unknown>) => void;
  onPrevious: () => void;
  userId: string;
  currentStepIndex: number;
  totalSteps: number;
}

export function ServiceDocumentSection({
  formData,
  isLoading = false,
  formRef,
  onNext,
  onPrevious,
  userId,
  currentStepIndex,
  totalSteps,
}: ServiceDocumentSectionProps) {
  const form = useForm({
    resolver: zodResolver(formData.schema),
    defaultValues: formData.defaultValues,
  });

  const currentStepValidity = form.formState.isValid;
  const currentStepErrors = form.formState.errors;

  const handleSubmit = (data: Record<string, unknown>) => {
    if (!currentStepValidity) {
      toast.error('Formulaire incomplet ou invalide', {
        description:
          'Veuillez vérifier que tous les champs sont correctement remplis et que les documents sont valides',
      });
    } else {
      onNext(data);
    }
  };

  return (
    <CardContainer>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{formData.title}</h3>
            {formData.description && (
              <p className="text-muted-foreground">{formData.description}</p>
            )}
          </div>
          <div className="grid gap-4 pt-4 sm:grid-cols-2 md:grid-cols-2">
            <AnimatePresence mode="sync">
              {formData.stepData?.fields
                .filter((field) => field.type === 'document')
                .map((doc, index) => (
                  <motion.div
                    key={doc.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Controller
                      name={doc.name}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <UserDocument
                            document={field.value as Doc<'documents'>}
                            expectedType={doc.documentType}
                            label={doc.label}
                            description={doc.description}
                            required={doc.required}
                            disabled={isLoading}
                            userId={userId}
                            onUpload={field.onChange}
                            onDelete={() => {
                              field.onChange(null);
                            }}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
          <div className="flex justify-between gap-4">
            <Button
              type="button"
              onClick={onPrevious}
              variant="outline"
              disabled={isLoading || currentStepIndex === 0}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              {'Retour'}
            </Button>

            <Button
              type="submit"
              loading={isLoading}
              disabled={!currentStepValidity}
              className="ml-auto"
              rightIcon={
                currentStepIndex !== totalSteps - 1 ? (
                  <ArrowRight className="size-4" />
                ) : undefined
              }
            >
              {currentStepIndex === totalSteps - 1 ? 'Soumettre ma demande' : 'Suivant'}
            </Button>
          </div>
          {!currentStepValidity && (
            <div className="errors flex flex-col gap-2">
              <p className="text-sm max-w-[90%] mx-auto items-center text-muted-foreground flex gap-2 w-full">
                <Info className="size-icon min-w-max text-blue-500" />
                <span>
                  Veuillez vérifier que tous les champs sont correctement remplis
                </span>
              </p>
              <ul className="flex flex-col items-center gap-2">
                {Object.entries(currentStepErrors).map(([error]) => (
                  <li key={error} className="text-red-500 list-disc">
                    <span className="font-medium text-sm">{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <MobileProgress
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            stepTitle={formData.title}
            isOptional={false}
          />
        </form>
      </Form>
    </CardContainer>
  );
}
