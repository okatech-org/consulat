import { useTranslations } from 'next-intl';
import { FullProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { DocumentPreview } from '@/components/ui/document-preview';
import { documentValidations, validateDocument } from '@/lib/document-validation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentValidationDialog } from '@/app/(authenticated)/admin/_utils/profiles/review/document-validation-dialog';
import { useRouter } from 'next/navigation';
import { DocumentType } from '@prisma/client';

interface ProfileDocumentsProps {
  profile: FullProfile;
}

export function ProfileDocuments({ profile }: ProfileDocumentsProps) {
  const t = useTranslations('common');
  const t_review = useTranslations('actions.profiles.review');
  const router = useRouter();

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const documents = [
    {
      type: DocumentType.PASSPORT,
      label: t_review('profile.passport'),
      document: profile.passport,
    },
    {
      type: DocumentType.BIRTH_CERTIFICATE,
      label: t_review('profile.birth_certificate'),
      document: profile.birthCertificate,
    },
    {
      type: DocumentType.RESIDENCE_PERMIT,
      label: t_review('profile.residence_permit'),
      document: profile.residencePermit,
    },
    {
      type: DocumentType.PROOF_OF_ADDRESS,
      label: t_review('profile.address_proof'),
      document: profile.addressProof,
    },
  ];

  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    type: string;
  } | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t_review('sections.components')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.map(({ type, label, document }) => {
          const validation = validateDocument(document);

          return (
            <div
              key={type}
              className="flex items-center justify-between border-b py-4 last:border-0"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{label}</p>
                  {documentValidations?.[document?.type as DocumentType]?.required && (
                    <Badge variant="outline">{t_review('profile.required')}</Badge>
                  )}
                </div>
                {document && (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {document.issuedAt && (
                      <p>
                        {t_review('profile.issued_at')}:{' '}
                        {format(new Date(document.issuedAt), 'PPP', { locale: fr })}
                      </p>
                    )}
                    {document.expiresAt && (
                      <p>
                        {t_review('profile.expires_at')}:{' '}
                        {format(new Date(document.expiresAt), 'PPP', { locale: fr })}
                      </p>
                    )}
                  </div>
                )}
                {validation.errors.length > 0 && (
                  <div className="mt-2">
                    {validation.errors.map((error, index) => (
                      <p key={index} className="text-sm text-destructive">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {document && (
                  <>
                    <Badge variant={document.status.toLowerCase() as BadgeVariant}>
                      {t(`status.${document.status.toLowerCase()}`)}
                    </Badge>
                    <DocumentPreview
                      url={document.fileUrl}
                      title={label}
                      type={type}
                      onDownload={() =>
                        handleDownload(
                          document.fileUrl,
                          `${type.toLowerCase()}.${document.fileUrl.split('.').pop()}`,
                        )
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedDocument({
                          id: document.id,
                          type: label,
                        })
                      }
                    >
                      <Shield className="size-4" />
                    </Button>
                    <Tooltip>
                      <TooltipTrigger>
                        {validation.isValid ? (
                          <CheckCircle2 className="text-success size-5" />
                        ) : (
                          <AlertCircle className="size-5 text-destructive" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {validation.isValid
                          ? t_review('profile.valid')
                          : validation.errors.join(', ')}
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>

      {selectedDocument && (
        <DocumentValidationDialog
          documentId={selectedDocument.id}
          documentType={selectedDocument.type}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onValidated={() => {
            router.refresh();
          }}
        />
      )}
    </Card>
  );
}
