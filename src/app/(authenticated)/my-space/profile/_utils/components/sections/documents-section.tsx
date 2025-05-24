'use client';

import { useTranslations } from 'next-intl';
import { UserDocument as PrismaUserDocument, DocumentType } from '@prisma/client';
import { EditableSection } from '../editable-section';
import { AppUserDocument } from '@/types';
import { UserDocument } from '@/components/documents/user-document';

interface DocumentsSectionProps {
  documents: {
    passport?: PrismaUserDocument | null;
    birthCertificate?: PrismaUserDocument | null;
    residencePermit?: PrismaUserDocument | null;
    addressProof?: PrismaUserDocument | null;
    identityPhoto?: PrismaUserDocument | null;
  };
  profileId: string;
  onSave: () => void;
  requestId?: string;
}

export function DocumentsSection({
  documents,
  profileId,
  onSave,
  requestId,
}: DocumentsSectionProps) {
  const t_common = useTranslations('common');

  const convertDocument = (
    doc: PrismaUserDocument | null | undefined,
  ): AppUserDocument | null => {
    if (!doc) return null;

    return {
      ...doc,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: doc.metadata as Record<string, any> | null,
    };
  };

  return (
    <EditableSection isEditing={false} allowEdit={false}>
      <div className="grid gap-6 lg:grid-cols-2">
        <UserDocument
          label={t_common('documents.types.birth_certificate')}
          description={t_common('documents.descriptions.birth_certificate')}
          document={convertDocument(documents.birthCertificate)}
          expectedType={DocumentType.BIRTH_CERTIFICATE}
          profileId={profileId}
          allowEdit={true}
          required
          onDelete={onSave}
          onUpload={onSave}
          noFormLabel={true}
          requestId={requestId}
        />

        <UserDocument
          label={t_common('documents.types.passport')}
          description={t_common('documents.descriptions.passport')}
          document={convertDocument(documents.passport)}
          expectedType={DocumentType.PASSPORT}
          profileId={profileId}
          allowEdit={true}
          required
          onDelete={onSave}
          onUpload={onSave}
          noFormLabel={true}
          requestId={requestId}
        />

        <UserDocument
          label={t_common('documents.types.residence_permit')}
          description={t_common('documents.descriptions.residence_permit')}
          document={convertDocument(documents.residencePermit)}
          expectedType={DocumentType.RESIDENCE_PERMIT}
          profileId={profileId}
          allowEdit={true}
          onDelete={onSave}
          onUpload={onSave}
          noFormLabel={true}
          requestId={requestId}
        />

        <UserDocument
          label={t_common('documents.types.proof_of_address')}
          description={t_common('documents.descriptions.proof_of_address')}
          document={convertDocument(documents.addressProof)}
          expectedType={DocumentType.PROOF_OF_ADDRESS}
          profileId={profileId}
          allowEdit={true}
          required
          onDelete={onSave}
          onUpload={onSave}
          noFormLabel={true}
          requestId={requestId}
        />
      </div>
    </EditableSection>
  );
}
