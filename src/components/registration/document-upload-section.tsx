'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScanBarcode } from 'lucide-react';
import type {
  BasicInfoFormData,
  ContactInfoFormData,
  DocumentsFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration';
import {
  Form,
  FormField,
  TradFormMessage,
  FormItem,
  FormControl,
} from '@/components/ui/form';
import type { UseFormReturn } from 'react-hook-form';
import { analyzeDocuments } from '@/actions/documents';
import { useToast } from '@/hooks/use-toast';
import { DocumentType } from '@prisma/client';
import { UserDocument } from '../documents/user-document';
import type { AppUserDocument } from '@/types';

export type DocumentUploadItem = {
  id: 'birthCertificate' | 'passport' | 'residencePermit' | 'addressProof';
  label: string;
  description: string;
  required: boolean;
  acceptedTypes: string[];
  maxSize: number;
  expectedType: DocumentType;
};

interface DocumentUploadSectionProps {
  form: UseFormReturn<DocumentsFormData>;
  handleSubmitAction: (data: DocumentsFormData) => void;
  onAnalysisComplete?: (data: {
    basicInfo?: Partial<BasicInfoFormData>;
    contactInfo?: Partial<ContactInfoFormData>;
    familyInfo?: Partial<FamilyInfoFormData>;
    professionalInfo?: Partial<ProfessionalInfoFormData>;
  }) => void;
  isLoading?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
  profileId?: string;
  documents?: DocumentUploadItem[];
}

export function DocumentUploadSection({
  form,
  handleSubmitAction,
  isLoading,
  onAnalysisComplete,
  formRef,
  profileId,
  documents = [],
}: DocumentUploadSectionProps) {
  const t = useTranslations('registration');
  const t_errors = useTranslations('messages.errors');
  const { toast } = useToast();
  const [analysingState, setAnalysingState] = React.useState<
    'idle' | 'analyzing' | 'success' | 'error'
  >('idle');

  const handleAnalysis = async () => {
    const documentsToAnalyze: Partial<Record<DocumentType, string>> = {};

    // Collecter les URLs des documents et leurs champs d'analyse
    Object.entries(form.getValues()).forEach(([key, document]) => {
      const doc = documents.find((d) => d.id === key);
      if (document && doc) {
        const userDoc = document as AppUserDocument;
        if (userDoc?.fileUrl) {
          documentsToAnalyze[doc.expectedType] = userDoc.fileUrl;
        }
      }
    });

    if (Object.keys(documentsToAnalyze).length === 0) {
      toast({
        title: t('documents.analysis.error.title'),
        description: t('documents.analysis.error.no_documents'),
        variant: 'destructive',
      });
      return;
    }

    setAnalysingState('analyzing');

    try {
      const results = await analyzeDocuments(documentsToAnalyze);

      if (results.success && results.mergedData) {
        setAnalysingState('success');
        console.log('results.mergedData', results.mergedData);
        onAnalysisComplete?.(results.mergedData);
      }
    } catch (error) {
      setAnalysingState('error');
      toast({
        title: t('documents.analysis.error.title'),
        description: error instanceof Error ? error.message : t_errors('unknown'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(handleSubmitAction)}
        className="space-y-8"
      >
        <div className="grid gap-4 pt-4 sm:grid-cols-2 md:grid-cols-2">
          <AnimatePresence mode="sync">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FormField
                  control={form.control}
                  name={doc.id}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <UserDocument
                          document={field.value as AppUserDocument}
                          expectedType={doc.expectedType}
                          label={doc.label}
                          description={doc.description}
                          required={doc.required}
                          disabled={isLoading}
                          profileId={profileId}
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
        <div className={'w-full space-y-4'}>
          {/* Section d'analyse */}
          {onAnalysisComplete && (
            <div className="flex flex-col items-center gap-4 text-center">
              <Button
                type="button"
                onClick={handleAnalysis}
                loading={analysingState === 'analyzing'}
                disabled={isLoading}
                className="w-full md:w-auto"
                leftIcon={
                  analysingState === 'analyzing' ? undefined : (
                    <ScanBarcode className="size-5" />
                  )
                }
              >
                {analysingState === 'analyzing'
                  ? t('documents.analysis.analyzing')
                  : t('documents.analysis.start')}
              </Button>
              {analysingState === 'idle' && (
                <p className="text-sm text-muted-foreground">
                  {t('documents.analysis.help')}
                </p>
              )}
              {analysingState === 'error' && (
                <p className="text-sm text-destructive">
                  {t('documents.analysis.error.description')}
                </p>
              )}
              {analysingState === 'success' && (
                <p className="text-sm p-2 rounded-md bg-green-500/10 text-green-800">
                  {t('documents.analysis.success.description')}
                </p>
              )}
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
