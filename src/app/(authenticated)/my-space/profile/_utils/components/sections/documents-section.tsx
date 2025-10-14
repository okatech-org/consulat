'use client';

import { useTranslations } from 'next-intl';
import type { Doc } from '@/convex/_generated/dataModel';
import { EditableSection } from '../editable-section';
import { UserDocument } from '@/components/documents/user-document';
import { DocumentType } from '@/convex/lib/constants';
interface DocumentsSectionProps {
  documents: {
    passport?: Doc<'documents'>;
    birthCertificate?: Doc<'documents'>;
    residencePermit?: Doc<'documents'>;
    addressProof?: Doc<'documents'>;
    identityPhoto?: Doc<'documents'>;
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

  return (
    <EditableSection allowEdit={false} id="documents">
      <div className="grid gap-6 lg:grid-cols-2">
        <UserDocument
          label={t_common('documents.types.birth_certificate')}
          description={t_common('documents.descriptions.birth_certificate')}
          document={documents.birthCertificate}
          expectedType={DocumentType.BirthCertificate}
          profileId={profileId}
          allowEdit={true}
          required
          onDelete={onSave}
          onUpload={onSave}
          noFormLabel={true}
          enableBackgroundRemoval={true}
          requestId={requestId}
        />

        <UserDocument
          label={t_common('documents.types.passport')}
          description={t_common('documents.descriptions.passport')}
          document={documents.passport}
          expectedType={DocumentType.Passport}
          profileId={profileId}
          allowEdit={true}
          required
          onDelete={onSave}
          onUpload={onSave}
          noFormLabel={true}
          enableBackgroundRemoval={true}
          requestId={requestId}
        />

        <UserDocument
          label={t_common('documents.types.residence_permit')}
          description={t_common('documents.descriptions.residence_permit')}
          document={documents.residencePermit}
          expectedType={DocumentType.ResidencePermit}
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
          document={documents.addressProof}
          expectedType={DocumentType.ProofOfAddress}
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
