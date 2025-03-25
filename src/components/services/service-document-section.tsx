'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Form,
  FormField,
  TradFormMessage,
  FormItem,
  FormControl,
} from '@/components/ui/form';
import { useForm, UseFormReturn } from 'react-hook-form';
import { DocumentType } from '@prisma/client';
import { UserDocument } from '../user-document';
import { AppUserDocument } from '@/types';
import CardContainer from '../layouts/card-container';
import { ServiceForm } from '@/hooks/use-service-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';

interface ServiceDocumentSectionProps {
  formData: ServiceForm;
  isLoading?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
  onNext: (data: Record<string, unknown>) => void;
  onPrevious: () => void;
  userId: string;
}

export function ServiceDocumentSection({
  formData,
  isLoading,
  formRef,
  onNext,
  onPrevious,
  userId,
}: ServiceDocumentSectionProps) {
  const form = useForm({
    resolver: zodResolver(formData.schema),
    defaultValues: formData.defaultValues,
  });

  const isValid = form.formState.isValid;

  const handleSubmit = (data: Record<string, unknown>) => {
    if (!isValid) {
      toast({
        title: 'Formulaire incomplet ou invalide',
        description: 'Veuillez vérifier que tous les champs sont correctement remplis',
        variant: 'destructive',
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
                    <FormField
                      control={form.control}
                      name={doc.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <UserDocument
                              document={field.value as AppUserDocument}
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
                          </FormControl>
                          <TradFormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </form>
      </Form>
    </CardContainer>
  );
}
