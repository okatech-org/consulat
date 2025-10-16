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
import { analyzeDocuments } from '@/actions/documents';
import { useToast } from '@/hooks/use-toast';
import { DocumentType } from '@/convex/lib/constants';
import { UserDocument } from '../documents/user-document';
import type { FullProfile } from '@/types/convex-profile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
  profile: FullProfile;
  onSave: () => void;
  banner?: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  documents?: DocumentUploadItem[];
  onAnalysisComplete?: (data: any) => void;
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
  if (!profile) return null;
  const t = useTranslations('registration');
  const t_errors = useTranslations('messages.errors');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysingState, setAnalysingState] = useState<
    'idle' | 'analyzing' | 'success' | 'error'
  >('idle');

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

  const handleAnalysis = async () => {
    const documentsToAnalyze: Partial<Record<DocumentType, string>> = {};

    // Collecter les URLs des documents et leurs champs d'analyse
    Object.entries(form.getValues()).forEach(([key, document]) => {
      const doc = documents.find((d) => d.id === key);
      if (document && doc) {
        const userDoc = document;
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

  const handleSubmit = async (data: DocumentsFormData) => {
    setIsLoading(true);
    try {
      // Les documents sont déjà uploadés via UserDocument
      // On peut maintenant passer à l'étape suivante
      onSave();
      if (onNext) onNext();
    } catch (error) {
      toast({
        title: t('documents.error.title'),
        description: t('documents.error.description'),
        variant: 'destructive',
      });
      console.error('Failed to process documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {banner}
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
                          document={field.value}
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
