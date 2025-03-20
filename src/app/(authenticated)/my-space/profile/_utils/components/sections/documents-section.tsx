'use client';

import { useTranslations } from 'next-intl';
import {
  UserDocument as PrismaUserDocument,
  DocumentType,
  RequestStatus,
} from '@prisma/client';
import { EditableSection } from '../editable-section';
import { AppUserDocument } from '@/types';
import { UserDocument } from '@/components/user-document';

interface DocumentsSectionProps {
  documents: {
    passport?: PrismaUserDocument | null;
    birthCertificate?: PrismaUserDocument | null;
    residencePermit?: PrismaUserDocument | null;
    addressProof?: PrismaUserDocument | null;
    identityPhoto?: PrismaUserDocument | null;
  };
  profileId: string;
  className?: string;
  profileStatus: RequestStatus;
  onSave: () => void;
}

export function DocumentsSection({
  documents,
  className,
  profileId,
  profileStatus,
  onSave,
}: DocumentsSectionProps) {
  const t = useTranslations('profile');
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
    <EditableSection
      title={t('sections.documents')}
      isEditing={false}
      className={className}
      profileStatus={profileStatus}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <UserDocument
          label={t_common('documents.types.identity_photo')}
          description={t_common('documents.descriptions.identity_photo')}
          document={convertDocument(documents.identityPhoto)}
          expectedType={DocumentType.IDENTITY_PHOTO}
          profileId={profileId}
          allowEdit={true}
          required
          accept="image/*"
          onDelete={onSave}
          onUpload={onSave}
          noFormLabel={true}
        />

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
        />

        <UserDocument
          label={t_common('documents.types.residence_permit')}
          description={t_common('documents.descriptions.residence_permit')}
          document={convertDocument(documents.residencePermit)}
          expectedType={DocumentType.RESIDENCE_PERMIT}
          profileId={profileId}
          allowEdit={true}
          required
          onDelete={onSave}
          onUpload={onSave}
          noFormLabel={true}
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
        />
      </div>
    </EditableSection>
  );
}
