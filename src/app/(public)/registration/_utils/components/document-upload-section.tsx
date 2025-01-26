'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanBarcode } from 'lucide-react';
import LottieAnimation from '@/components/ui/lottie-animation';
import { DocumentsFormData } from '@/schemas/registration';
import { DocumentUploadField } from '@/components/ui/document-upload';
import { Form, FormField } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { getFieldsForDocument } from '@/lib/document-fields';
import { DocumentField } from '@/lib/utils';
import { analyzeDocuments } from '@/actions/documents';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadSectionProps {
  form: UseFormReturn<DocumentsFormData>;
  handleSubmit: (data: DocumentsFormData) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnalysisComplete?: (data: any) => void;
  isLoading?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
}

export function DocumentUploadSection({
  form,
  handleSubmit,
  isLoading,
  onAnalysisComplete,
  formRef,
}: DocumentUploadSectionProps) {
  const t = useTranslations('registration');
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const requiredDocuments = [
    {
      id: 'passportFile' as const,
      label: t('documents.passport.label'),
      description: t('documents.passport.description'),
      required: true,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024, // 5MB
      analysisFields: getFieldsForDocument('passportFile'),
    },
    {
      id: 'birthCertificateFile' as const,
      label: t('documents.birth_certificate.label'),
      description: t('documents.birth_certificate.description'),
      required: true,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      analysisFields: getFieldsForDocument('birthCertificateFile'),
    },
    {
      id: 'residencePermitFile' as const,
      label: t('documents.residence_permit.label'),
      description: t('documents.residence_permit.description'),
      required: false,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      analysisFields: getFieldsForDocument('residencePermitFile'),
    },
    {
      id: 'addressProofFile' as const,
      label: t('documents.address_proof.label'),
      description: t('documents.address_proof.description'),
      required: true,
      acceptedTypes: ['image/*', 'application/pdf'],
      maxSize: 5 * 1024 * 1024,
      analysisFields: getFieldsForDocument('addressProofFile'),
    },
  ] as const;

  const handleAnalysis = async () => {
    const analysisFormData = new FormData();
    const analysisFields: { key: keyof DocumentsFormData; fields: DocumentField[] }[] =
      [];

    // Collecter les documents et leurs champs d'analyse respectifs
    Object.entries(form.getValues()).forEach(([key, fileList]) => {
      const doc = requiredDocuments.find((d) => d.id === key);
      if (fileList && doc) {
        analysisFields.push({
          key: key as keyof DocumentsFormData,
          fields: doc.analysisFields,
        });
        analysisFormData.append(key, fileList);
      }
    });

    if (analysisFields.length === 0) {
      toast({
        title: t('documents.analysis.error.title'),
        description: t('documents.analysis.error.no_documents'),
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const results = await analyzeDocuments(analysisFormData, analysisFields);

      if (results.success && results.mergedData) {
        onAnalysisComplete?.(results.mergedData);
      }
    } catch (error) {
      toast({
        title: t('documents.analysis.error.title'),
        description: error instanceof Error ? error.message : t('errors.unknown'),
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
        onSubmit={form.handleSubmit(handleSubmit)}
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
                      <DocumentUploadField
                        id={doc.id}
                        field={field}
                        label={doc.label}
                        required={doc.required}
                        description={doc.description}
                        accept={doc.acceptedTypes.join(',')}
                        maxSize={doc.maxSize}
                        form={form}
                        disabled={isLoading}
                      />
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
          <CardFooter>
            <div className={'w-full space-y-4'}>
              {/* Section d'analyse */}
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
                          <LottieAnimation
                            src="https://lottie.host/3dcbeb73-3c3f-4dbe-93de-a973430b6c4c/aX6F1INJXN.json"
                            className="size-5"
                          />
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
