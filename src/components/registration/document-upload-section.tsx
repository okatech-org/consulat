'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ScanBarcode } from 'lucide-react';
import { type DocumentsFormData, DocumentsSchema } from '@/schemas/registration';
import {
  Form,
  FormField,
  TradFormMessage,
  FormItem,
  FormControl,
} from '@/components/ui/form';
import { DocumentType } from '@/convex/lib/constants';
import { UserDocument } from '../documents/user-document';
import type { CompleteProfile } from '@/convex/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';

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
  profile: CompleteProfile;
  onSave: () => void;
  banner?: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  documents?: DocumentUploadItem[];
  onAnalysisComplete?: (data: Record<string, Record<string, unknown>>) => void;
}

export function DocumentUploadSection({
  profile,
  onSave,
  banner,
  onNext,
  onPrevious,
  documents = [],
  onAnalysisComplete,
}: DocumentUploadSectionProps) {
  const analyzeDocuments = useAction(api.functions.ai.analyzeMultipleDocuments);
  const t = useTranslations('registration');
  const t_errors = useTranslations('messages.errors');
  const [isLoading, setIsLoading] = useState(false);
  const [analysingState, setAnalysingState] = useState<
    'idle' | 'analyzing' | 'success' | 'error'
  >('idle');

  if (!profile) return null;

  const form = useForm<DocumentsFormData>({
    resolver: zodResolver(DocumentsSchema),
    defaultValues: {
      passport: profile.passport,
      birthCertificate: profile.birthCertificate,
      residencePermit: profile.residencePermit,
      addressProof: profile.addressProof,
    },
    reValidateMode: 'onBlur',
  });

  // Effect to update form values when profile changes (e.g. after upload)
  React.useEffect(() => {
    form.reset({
      passport: profile.passport,
      birthCertificate: profile.birthCertificate,
      residencePermit: profile.residencePermit,
      addressProof: profile.addressProof,
    });
  }, [profile, form]);

  const handleAnalysis = async () => {
    const documentsToAnalyze: Array<{
      storageId: Id<'_storage'>;
      documentType: string;
    }> = [];

    Object.entries(form.getValues()).forEach(([key, document]) => {
      const doc = documents.find((d) => d.id === key);
      if (document && doc) {
        const userDoc = document as Doc<'documents'>;
        if (userDoc?.storageId) {
          documentsToAnalyze.push({
            storageId: userDoc.storageId as Id<'_storage'>,
            documentType: doc.expectedType,
          });
        }
      }
    });

    if (documentsToAnalyze.length === 0) {
      toast.error(t('documents.analysis.error.title'), {
        description: t('documents.analysis.error.no_documents'),
      });
      return;
    }

    setAnalysingState('analyzing');

    try {
      const results = await analyzeDocuments({
        documents: documentsToAnalyze,
      });

      if (results.success && results.mergedData) {
        setAnalysingState('success');
        onAnalysisComplete?.(results.mergedData);
        toast.success(t('documents.analysis.success.description'));
      } else {
        setAnalysingState('error');
        toast.error(results.error || t('documents.analysis.error.description'));
      }
    } catch (error) {
      setAnalysingState('error');
      toast.error(error instanceof Error ? error.message : t_errors('unknown'));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      onSave();
      if (onNext) onNext();
    } catch (error) {
      toast.error(t('documents.error.description'));
      console.error('Failed to process documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {banner}
        <div className="grid gap-4 pt-4 grid-cols-2 lg:grid-cols-4">
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
                          document={field.value as Doc<'documents'>}
                          expectedType={doc.expectedType}
                          label={doc.label}
                          description={doc.description}
                          required={doc.required}
                          disabled={isLoading}
                          profileId={profile._id}
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

        <div className="flex flex-col md:flex-row justify-between gap-4">
          {onPrevious && (
            <Button
              type="button"
              onClick={onPrevious}
              variant="outline"
              leftIcon={<ArrowLeft className="size-icon" />}
            >
              Précédent
            </Button>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            rightIcon={<ArrowRight className="size-icon" />}
          >
            Continuer
          </Button>
        </div>
      </form>
    </Form>
  );
}
