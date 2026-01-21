'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ScanBarcode } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldError,
} from '@/components/ui/field';
import { toast } from 'sonner';
import { DocumentType, OwnerType } from '@/convex/lib/constants';
import { UserDocument } from '../documents/user-document';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserDocumentSchema } from '@/schemas/inputs';
import type { ChildBasicInfoFormData } from '@/schemas/child-registration';
import type { CompleteChildProfile } from '@/convex/lib/types';

const ChildDocumentsSchema = z.object({
  birthCertificate: UserDocumentSchema,
  passport: UserDocumentSchema.optional(),
});

type ChildDocumentsFormData = z.infer<typeof ChildDocumentsSchema>;

export type ChildDocumentUploadItem = {
  id: 'birthCertificate' | 'passport';
  label: string;
  description: string;
  required: boolean;
  acceptedTypes: string[];
  maxSize: number;
  expectedType: DocumentType;
};

type ChildDocumentsFormProps = {
  profile: CompleteChildProfile;
  documents?: ChildDocumentUploadItem[];
  onSave: () => void;
  onPrevious: () => void;
  onAnalysisComplete?: (data: { basicInfo?: Partial<ChildBasicInfoFormData> }) => void;
};

export function ChildDocumentsForm({
  profile,
  documents = [],
  onSave,
  onPrevious,
  onAnalysisComplete,
}: Readonly<ChildDocumentsFormProps>) {
  const analyzeDocuments = useAction(api.functions.ai.analyzeMultipleDocuments);
  const t = useTranslations('registration');
  const t_errors = useTranslations('messages.errors');
  const [isLoading, setIsLoading] = useState(false);
  const [analysingState, setAnalysingState] = useState<
    'idle' | 'analyzing' | 'success' | 'error'
  >('idle');

  const form = useForm<ChildDocumentsFormData>({
    resolver: zodResolver(ChildDocumentsSchema),
    defaultValues: {
      birthCertificate: profile?.birthCertificate,
      passport: profile?.passport,
    },
    reValidateMode: 'onBlur',
  });

  const handleAnalysis = async () => {
    const documentsToAnalyze: Partial<Record<DocumentType, string>> = {};

    Object.entries(form.getValues()).forEach(([key, document]) => {
      const doc = documents.find((d) => d.id === key);
      if (document && doc) {
        const userDoc = document;
        if (userDoc?.storageId) {
          documentsToAnalyze[doc.expectedType] = userDoc.storageId as Id<'_storage'>;
        }
      }
    });

    if (Object.keys(documentsToAnalyze).length === 0) {
      toast.error(t('documents.analysis.error.title'), {
        description: t('documents.analysis.error.no_documents'),
      });
      return;
    }

    setAnalysingState('analyzing');

    try {
      const results = await analyzeDocuments({
        documents: Object.entries(documentsToAnalyze).map(
          ([documentType, documentUrl]) => ({
            storageId: documentUrl as Id<'_storage'>,
            documentType,
          }),
        ),
      });

      if (results.success && results.mergedData) {
        setAnalysingState('success');
        onAnalysisComplete?.(results.mergedData);
      }
    } catch (error) {
      setAnalysingState('error');
      toast.error(t('documents.analysis.error.title'), {
        description: error instanceof Error ? error.message : t_errors('unknown'),
      });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      onSave();
    } catch (error) {
      toast.error(t('documents.error.title'), {
        description: t('documents.error.description'),
      });
      console.error('Failed to process documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid gap-4 pt-4 sm:grid-cols-2 md:grid-cols-2">
          <AnimatePresence mode="sync">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Controller
                  name={doc.id}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <UserDocument
                        document={field.value as Doc<'documents'>}
                        expectedType={doc.expectedType}
                        label={doc.label}
                        description={doc.description}
                        required={doc.required}
                        disabled={isLoading}
                        profileId={profile._id}
                        ownerType={OwnerType.ChildProfile}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className={'w-full space-y-4'}>
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
          <Button
            type="button"
            onClick={onPrevious}
            variant="outline"
            leftIcon={<ArrowLeft className="size-icon" />}
            disabled={isLoading}
          >
            Précédent
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            rightIcon={<ArrowRight className="size-icon" />}
          >
            {form.formState.isDirty ? 'Enregistrer et continuer' : 'Continuer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
