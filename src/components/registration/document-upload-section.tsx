'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderIcon, ScanBarcode } from 'lucide-react';
import { DocumentsFormData } from '@/schemas/registration';
import {
  Form,
  FormField,
  TradFormMessage,
  FormItem,
  FormControl,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { getFieldsForDocument } from '@/lib/document-fields';
import { DocumentField } from '@/lib/utils';
import { analyzeDocuments } from '@/actions/documents';
import { useToast } from '@/hooks/use-toast';
import { DocumentType } from '@prisma/client';
import { UserDocument } from '../user-document';
import { AppUserDocument } from '@/types';

interface DocumentUploadSectionProps {
  form: UseFormReturn<DocumentsFormData>;
  handleSubmitAction: (data: DocumentsFormData) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnalysisComplete?: (data: any) => void;
  isLoading?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
  profileId?: string;
}

export function DocumentUploadSection({
  form,
  handleSubmitAction,
  isLoading,
  onAnalysisComplete,
  formRef,
  profileId,
}: DocumentUploadSectionProps) {
  const t = useTranslations('registration');
  const t_inputs = useTranslations('inputs');
  const t_errors = useTranslations('messages.errors');
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const requiredDocuments = [
    {
      id: 'passport' as const,
      label: t_inputs('passport.label'),
      description: t_inputs('passport.help'),
      required: true,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024, // 5MB
      analysisFields: getFieldsForDocument('passportFile'),
      expectedType: DocumentType.PASSPORT,
    },
    {
      id: 'birthCertificate' as const,
      label: t_inputs('birthCertificate.label'),
      description: t_inputs('birthCertificate.help'),
      required: true,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      analysisFields: getFieldsForDocument('birthCertificateFile'),
      expectedType: DocumentType.BIRTH_CERTIFICATE,
    },
    {
      id: 'residencePermit' as const,
      label: t_inputs('residencePermit.label'),
      description: t_inputs('residencePermit.help'),
      required: false,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      analysisFields: getFieldsForDocument('residencePermitFile'),
      expectedType: DocumentType.RESIDENCE_PERMIT,
    },
    {
      id: 'addressProof' as const,
      label: t_inputs('addressProof.label'),
      description: t_inputs('addressProof.help'),
      required: true,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      analysisFields: getFieldsForDocument('addressProofFile'),
      expectedType: DocumentType.PROOF_OF_ADDRESS,
    },
  ] as const;

  const handleAnalysis = async () => {
    const documentUrls: Record<string, string> = {};
    const analysisFields: { key: keyof DocumentsFormData; fields: DocumentField[] }[] =
      [];

    // Collecter les URLs des documents et leurs champs d'analyse
    Object.entries(form.getValues()).forEach(([key, document]) => {
      const doc = requiredDocuments.find((d) => d.id === key);
      if (document && doc) {
        const userDoc = document as AppUserDocument;
        if (userDoc.fileUrl) {
          documentUrls[key] = userDoc.fileUrl;
          analysisFields.push({
            key: key as keyof DocumentsFormData,
            fields: doc.analysisFields,
          });
        }
      }
    });

    if (Object.keys(documentUrls).length === 0) {
      toast({
        title: t('documents.analysis.error.title'),
        description: t('documents.analysis.error.no_documents'),
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const results = await analyzeDocuments(documentUrls, analysisFields);

      if (results.success && results.mergedData) {
        onAnalysisComplete?.(results.mergedData);
      }
    } catch (error) {
      toast({
        title: t('documents.analysis.error.title'),
        description: error instanceof Error ? error.message : t_errors('unknown'),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(handleSubmitAction)}
        className="space-y-8"
      >
        {/* Section des documents */}
        <Card className="overflow-hidden">
          <CardContent className="grid gap-4 pt-4 sm:grid-cols-2 md:grid-cols-2">
            <AnimatePresence mode="sync">
              {requiredDocuments.map((doc, index) => (
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
                          />
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
          <CardFooter>
            <div className={'w-full space-y-4'}>
              {/* Section d'analyse */}
              {onAnalysisComplete && (
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <Button
                        type="button"
                        onClick={handleAnalysis}
                        disabled={isAnalyzing || isLoading}
                        className="w-full gap-2 md:w-auto"
                      >
                        {isAnalyzing ? (
                          <>
                            <LoaderIcon className="size-5 animate-spin" />
                            {t('documents.analysis.analyzing')}
                          </>
                        ) : (
                          <>
                            <ScanBarcode className="size-5" />
                            {t('documents.analysis.start')}
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        {t('documents.analysis.help')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Guide d'aide */}
              <DocumentUploadGuide />
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

function DocumentUploadGuide() {
  const t = useTranslations('registration');

  const documentTips = [
    t('documents.tips.list.quality'),
    t('documents.tips.list.lighting'),
    t('documents.tips.list.reflection'),
    t('documents.tips.list.corners'),
    t('documents.tips.list.validity'),
  ];

  return (
    <div className="rounded-lg bg-muted p-4">
      <h3 className="font-medium">{t('documents.tips.title')}</h3>
      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
        {documentTips.map((tip, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            {tip}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
