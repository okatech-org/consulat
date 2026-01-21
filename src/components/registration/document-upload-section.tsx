import { getFieldLabel } from '@/lib/utils';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ScanBarcode, Loader2 } from 'lucide-react';
import { type DocumentsFormData, DocumentsSchema } from '@/schemas/registration';
import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldError,
} from '@/components/ui/field';
import { DocumentType } from '@/convex/lib/constants';
import { UserDocument } from '../documents/user-document';
import type { CompleteProfile } from '@/convex/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { useAction, useMutation } from 'convex/react';
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
  const t_inputs = useTranslations('inputs');
  const t_errors = useTranslations('messages.errors');
  const [isLoading, setIsLoading] = useState(false);
  const [analysingState, setAnalysingState] = useState<
    'idle' | 'analyzing' | 'success' | 'error'
  >('idle');

  const router = useRouter();
  if (!profile) return null;

  const form = useForm<DocumentsFormData>({
    resolver: zodResolver(DocumentsSchema),
    defaultValues: {
      passport: profile.passport ?? null,
      birthCertificate: profile.birthCertificate ?? null,
      residencePermit: profile.residencePermit ?? null,
      addressProof: profile.addressProof ?? null,
    },
    reValidateMode: 'onBlur',
  });

  // Effect to update form values when profile changes (e.g. after upload)
  React.useEffect(() => {
    form.reset({
      passport: profile.passport ?? null,
      birthCertificate: profile.birthCertificate ?? null,
      residencePermit: profile.residencePermit ?? null,
      addressProof: profile.addressProof ?? null,
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

        // Save analyzed data
        const mergedData = results.mergedData as {
          personal?: any;
          contacts?: any;
          family?: any;
          professionSituation?: any;
        };

        // We'll update only if we have data to update
        if (Object.keys(mergedData).length > 0) {
          await updateProfileMutation({
            profileId: profile._id,
            ...mergedData,
          });
          toast.success(t('documents.analysis.success.description'), {
            description: t('documents.analysis.saved_description'),
          });
          router.refresh();
        } else {
          toast.info(t('documents.analysis.success.description'), {
            description: "Aucune nouvelle information n'a pu être extraite.",
          });
        }

        onAnalysisComplete?.(results.mergedData);
      } else {
        setAnalysingState('error');
        toast.error(results.error || t('documents.analysis.error.description'));
      }
    } catch (error) {
      setAnalysingState('error');
      toast.error(error instanceof Error ? error.message : t_errors('unknown'));
    }
  };

  const updateProfileMutation = useMutation(api.functions.profile.updateProfile);

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

  const handleInvalid = (errors: any) => {
    const invalidFields = Object.keys(errors)
      .map((field) => getFieldLabel(field, t_inputs))
      .join(', ');

    toast.error(t('documents.error.validation'), {
      description: invalidFields
        ? `Champs à corriger : ${invalidFields}`
        : t('documents.error.validation_desc'),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        className="space-y-8"
      >
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
        <div className={'w-full space-y-4'}>
          {/* Section d'analyse */}
          {onAnalysisComplete && (
            <div className="flex flex-col items-center gap-4 text-center">
              <Button
                type="button"
                onClick={handleAnalysis}
                disabled={analysingState === 'analyzing' || isLoading}
                className="w-full md:w-auto"
              >
                {analysingState === 'analyzing' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ScanBarcode className="mr-2 h-4 w-4" />
                )}
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
            <Button type="button" onClick={onPrevious} variant="outline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
          )}

          <Button type="submit" disabled={isLoading}>
            Continuer
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
