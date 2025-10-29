import { useTranslations } from 'next-intl';
import type { CompleteProfile } from '@/convex/lib/types';
import { Shield } from 'lucide-react';
import { useDateLocale } from '@/lib/utils';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { DocumentPreview } from '@/components/ui/document-preview';
import { documentValidations, validateDocument } from '@/lib/document-validation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DocumentType, ProfileCategory } from '@/convex/lib/constants';
import { DocumentValidationDialog } from './document-validation-dialog';
import CardContainer from '@/components/layouts/card-container';

interface ProfileDocumentsProps {
  profile: CompleteProfile;
}

export function ProfileDocuments({ profile }: ProfileDocumentsProps) {
  const t = useTranslations('common');
  const t_errors = useTranslations('messages.errors');
  const t_review = useTranslations('admin.registrations.review');
  const router = useRouter();
  const { formatDate } = useDateLocale();
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      // Get file extension from content type
      const contentType = response.headers.get('content-type');
      const extension = contentType?.split('/')[1] || 'pdf';
      a.download = `${filename}.${extension}`;
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
      label: t_review('documents.passport'),
      document: profile.passport,
      required: profile.category === ProfileCategory.ADULT,
    },
    {
      type: DocumentType.BIRTH_CERTIFICATE,
      label: t_review('documents.birth_certificate'),
      document: profile.birthCertificate,
      required: true,
    },
    {
      type: DocumentType.RESIDENCE_PERMIT,
      label: t_review('documents.residence_permit'),
      document: profile.residencePermit,
      required: false,
    },
    {
      type: DocumentType.PROOF_OF_ADDRESS,
      label: t_review('documents.address_proof'),
      document: profile.addressProof,
      required: profile.category === ProfileCategory.ADULT,
    },
    {
      type: DocumentType.IDENTITY_PHOTO,
      label: t_review('documents.identity_photo'),
      document: profile.identityPicture,
      required: true,
    },
  ];

  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    type: string;
  } | null>(null);

  return (
    <CardContainer
      title={t_review('sections.documents') + ' ' + profile.id}
      contentClass="grid sm:grid-cols-2 gap-4 sm:gap-6"
    >
      {documents.map(({ type, label, document, required }) => {
        const validation = validateDocument(document, required);

        return (
          <div
            key={type}
            className="flex flex-col justify-between pb-4 border-b gap-4 last:border-0"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{label}</p>
                {documentValidations?.[document?.type as DocumentType]?.required && (
                  <Badge variant="outline">{t_review('documents.required')}</Badge>
                )}
                {document?.status && (
                  <Badge variant={document.status.toLowerCase() as BadgeVariant}>
                    {t(`status.${document.status}`)}
                  </Badge>
                )}
              </div>
              {document && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {document.issuedAt && (
                    <p>
                      {t_review('documents.issued_at')}:{' '}
                      {formatDate(document.issuedAt, 'PPP')}
                    </p>
                  )}
                  {document.expiresAt && (
                    <p>
                      {t_review('documents.expires_at')}:{' '}
                      {formatDate(document.expiresAt, 'PPP')}
                    </p>
                  )}
                </div>
              )}
              {!document && validation.errors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t_errors('not_provided')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {document && (
                <>
                  <DocumentPreview
                    url={document.fileUrl}
                    title={label}
                    type={document.fileType?.includes('image') ? 'image' : 'pdf'}
                    onDownload={() =>
                      handleDownload(
                        document.fileUrl,
                        `${type.toLowerCase()}.${document.fileUrl.split('.').pop()}`,
                      )
                    }
                    isOpen={isOpen}
                    setIsOpenAction={setIsOpen}
                    showTrigger={true}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDocument({ id: document.id, type: label })}
                    leftIcon={<Shield className="size-4" />}
                  >
                    <span className="text-sm">Valider</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}

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
    </CardContainer>
  );
}
