import { ServiceCategory, DocumentType } from '@/convex/lib/constants';
import type { CountryCode } from '@/lib/autocomplete-datas';
import type { Doc, Id } from '@/convex/_generated/dataModel';

// ============================================================================
// Field Types for Dynamic Forms
// ============================================================================

export type BasicField = {
  name: string;
  label: string;
  required: boolean;
  description?: string;
  autoComplete?: string;
  profilePath?: string; // Path to profile field for default value (e.g., "personal.firstName", "contacts.email")
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
  documentType: string; // Convex uses string enum values
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

// Union type for all field types
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

// ============================================================================
// Service Step Types (Convex-compatible)
// ============================================================================

export interface ServiceStep {
  id: string | null;
  order: number;
  title: string;
  description: string | null;
  type: string; // Convex service step types are strings
  isRequired: boolean;
  fields: ServiceField[];
  validations: Record<string, unknown> | null;
}

// ============================================================================
// Service Types (Convex-compatible)
// ============================================================================

// Type alias for a Convex service document
export type ConvexService = Doc<'services'>;

// Extended service type with populated relationships
export interface ServiceWithRelations extends ConvexService {
  organization?: Doc<'organizations'>;
}

// ============================================================================
// Request Types (Convex-compatible)
// ============================================================================

export type ConvexRequest = Doc<'requests'>;

export interface RequestWithService extends ConvexRequest {
  service: Doc<'services'>;
}

export interface RequestWithServiceAndProfile extends ConvexRequest {
  service: Doc<'services'>;
  profile?: Doc<'profiles'>;
  requester: Doc<'users'>;
}

// ============================================================================
// Document Type Mappings
// ============================================================================

export type ProfileDocument =
  | 'passport'
  | 'birthCertificate'
  | 'residencePermit'
  | 'addressProof'
  | 'identityPicture';

// Mapping from Convex DocumentType enum to profile field names
export const documentTypeToField: Partial<Record<string, string>> = {
  [DocumentType.Passport]: 'passport',
  [DocumentType.BirthCertificate]: 'birthCertificate',
  [DocumentType.ResidencePermit]: 'residencePermit',
  [DocumentType.ProofOfAddress]: 'addressProof',
  [DocumentType.IdentityPhoto]: 'identityPicture',
} as const;

// Reverse mapping from field name to DocumentType
export const fieldToDocumentType: Record<ProfileDocument, string> = {
  passport: DocumentType.Passport,
  birthCertificate: DocumentType.BirthCertificate,
  residencePermit: DocumentType.ResidencePermit,
  addressProof: DocumentType.ProofOfAddress,
  identityPicture: DocumentType.IdentityPhoto,
} as const;

// ============================================================================
// Service Listing Types
// ============================================================================

export interface ServiceListingItem {
  _id: Id<'services'>;
  code: string;
  name: string;
  description?: string;
  category: string;
  status: string;
  organizationId: Id<'organizations'>;
  requiresAppointment: boolean;
  isFree: boolean;
  price?: number;
  currency?: string;
}

// ============================================================================
// Form Field Mapping
// ============================================================================

export interface ProfileFieldMapping {
  [formField: string]: string;
}

// ============================================================================
// Legacy Type Compatibility
// (Keep these for gradual migration, mark as deprecated)
// ============================================================================

/** @deprecated Use ConvexService instead */
export type ConsularServiceItem = ConvexService;

/** @deprecated Use ServiceListingItem instead */
export interface ConsularServiceListingItem {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  isActive: boolean;
  organizationId: string | null;
}
