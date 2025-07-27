import {
  type ConsularService,
  ServiceCategory,
  ServiceStepType,
  type Organization,
  type ServiceRequest,
  type RequestStatus,
  type UserDocument,
  type GenerateDocumentSettings,
  DocumentType,
} from '@prisma/client';
import type { FullProfile } from '@/types/profile';
import type { CountryCode } from '@/lib/autocomplete-datas';

export type BasicField = {
  name: string;
  label: string;
  required: boolean;
  description?: string;
  autoComplete?: string;
};

export type NumberField = BasicField & {
  type: 'number';
  min?: number;
  max?: number;
  autocomplete?: string;
};

export type TextField = BasicField & {
  type: 'text';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

export type EmailField = BasicField & {
  type: 'email';
};

export type PhoneField = BasicField & {
  type: 'phone';
};

export type DateField = BasicField & {
  type: 'date';
  minDate?: string;
  maxDate?: string;
};

export type SelectField = BasicField & {
  type: 'select';
  selectType: 'single' | 'multiple';
  options: Array<{ label: string; value: string }>;
};

export type AddressField = BasicField & {
  type: 'address';
  countries: Array<CountryCode>;
};

export type FileField = BasicField & {
  type: 'file';
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
};

export type CheckboxField = BasicField & {
  type: 'checkbox';
  options?: Array<{ label: string; value: string }>;
};

export type RadioField = BasicField & {
  type: 'radio';
  options: Array<{ label: string; value: string }>;
};

export type TextareaField = BasicField & {
  type: 'textarea';
  minLength?: number;
  maxLength?: number;
};

export type DocumentField = BasicField & {
  type: 'document';
  documentType: DocumentType;
  accept?: 'image/*' | 'application/pdf' | 'image/*,application/pdf';
};

export type PhotoField = BasicField & {
  type: 'photo';
  maxSize?: number;
  accept?: 'image/*';
};

export const fieldTypes = [
  'text',
  'email',
  'phone',
  'date',
  'select',
  'address',
  'file',
  'checkbox',
  'radio',
  'textarea',
  'number',
  'document',
  'photo',
] as const;

export type ServiceFieldType = (typeof fieldTypes)[number];

// Types pour les champs de formulaire dynamiques
export type ServiceField =
  | TextField
  | EmailField
  | PhoneField
  | DateField
  | SelectField
  | AddressField
  | FileField
  | CheckboxField
  | RadioField
  | TextareaField
  | NumberField
  | DocumentField
  | PhotoField;

export interface ServiceStep {
  id: string | null;
  order: number;
  title: string;
  description: string | null;
  type: ServiceStepType;
  isRequired: boolean;
  fields: ServiceField[];
  validations: Record<string, unknown> | null;
}

export type ProfileDocument =
  | 'passport'
  | 'birthCertificate'
  | 'residencePermit'
  | 'addressProof'
  | 'identityPicture';

export interface ConsularServiceItem
  extends Omit<ConsularService, 'fields' | 'profileDocuments'> {
  steps: ServiceStep[];
  organization: Organization | null;
  generateDocumentSettings: GenerateDocumentSettings[];
  profileDocuments: ProfileDocument[];
}

export type UpdateServiceInput = Partial<ConsularServiceItem>;

export interface ProfileFieldMapping {
  [formField: string]: string;
}

export interface ConsularServiceListingItem {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  isActive: boolean;
  organizationId: string | null;
}

export type RegistrationListingItem = {
  id: string;
  status: RequestStatus;
  submittedAt: string | Date | null;
  updatedAt: string | Date | null;
  submittedBy: {
    name: string | null;
    email: string | null;
    nationality: string | null;
    phoneNumber: string | null;
    profile: {
      status: RequestStatus | null;
    } | null;
  };
};

export type RegistrationRequestDetails = ServiceRequest & {
  submittedBy: {
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
    profile: FullProfile | null;
    documents: UserDocument[];
  };
  service: ConsularService;
};

export const documentTypeToField: Partial<Record<DocumentType, string>> = {
  [DocumentType.PASSPORT]: 'passport',
  [DocumentType.BIRTH_CERTIFICATE]: 'birthCertificate',
  [DocumentType.RESIDENCE_PERMIT]: 'residencePermit',
  [DocumentType.PROOF_OF_ADDRESS]: 'addressProof',
  [DocumentType.IDENTITY_PHOTO]: 'identityPicture',
} as const;
