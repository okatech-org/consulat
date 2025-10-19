import { FunctionReturnType } from 'convex/server';
import { api } from '../_generated/api';
import type { Infer } from 'convex/values';
import {
  serviceFieldValidator,
  serviceStepValidator,
  textFieldValidator,
  numberFieldValidator,
  emailFieldValidator,
  phoneFieldValidator,
  dateFieldValidator,
  selectFieldValidator,
  addressFieldValidator,
  fileFieldValidator,
  checkboxFieldValidator,
  radioFieldValidator,
  textareaFieldValidator,
  documentFieldValidator,
  photoFieldValidator,
  fieldOptionValidator,
  profileDocumentFieldValidator,
  pricingValidator,
  organizationSettingsValidator,
  contactValidator,
  ownerIdValidator,
  addressValidator,
  parentalAuthorityValidator,
  participantValidator,
  activityValidator,
  noteValidator,
  validationValidator,
  emergencyContactValidator,
  dayScheduleValidator,
  consularCardValidator,
  weeklyScheduleValidator,
} from './validators';

// ============================================================================
// Profile Types
// ============================================================================

export type CompleteChildProfile = FunctionReturnType<
  typeof api.functions.childProfile.getCurrentChildProfile
>;

export type CompleteProfile = FunctionReturnType<
  typeof api.functions.profile.getCurrentProfile
>;

export type UserData = FunctionReturnType<typeof api.functions.user.getUserByClerkId>;

export type ServicePricing = Infer<typeof pricingValidator>;

export type OrganisationSettings = Infer<typeof organizationSettingsValidator>;

export type OrganisationContact = Infer<typeof contactValidator>;

export type OwnerId = Infer<typeof ownerIdValidator>;

export type Address = Infer<typeof addressValidator>;

export type ParentalAuthority = Infer<typeof parentalAuthorityValidator>;

export type AppointmentParticipant = Infer<typeof participantValidator>;

export type Activity = Infer<typeof activityValidator>;

export type Note = Infer<typeof noteValidator>;

export type Validation = Infer<typeof validationValidator>;

export type EmergencyContact = Infer<typeof emergencyContactValidator>;

export type DaySchedule = Infer<typeof dayScheduleValidator>;

export type WeeklySchedule = Infer<typeof weeklyScheduleValidator>;

export type ContactAddress = Infer<typeof addressValidator>;

export type ConsularCardConfig = Infer<typeof consularCardValidator>;
// ============================================================================
// Service Field Types (Inferred from Validators)
// ============================================================================

// Individual field types
export type TextField = Infer<typeof textFieldValidator>;
export type NumberField = Infer<typeof numberFieldValidator>;
export type EmailField = Infer<typeof emailFieldValidator>;
export type PhoneField = Infer<typeof phoneFieldValidator>;
export type DateField = Infer<typeof dateFieldValidator>;
export type SelectField = Infer<typeof selectFieldValidator>;
export type AddressField = Infer<typeof addressFieldValidator>;
export type FileField = Infer<typeof fileFieldValidator>;
export type CheckboxField = Infer<typeof checkboxFieldValidator>;
export type RadioField = Infer<typeof radioFieldValidator>;
export type TextareaField = Infer<typeof textareaFieldValidator>;
export type DocumentField = Infer<typeof documentFieldValidator>;
export type PhotoField = Infer<typeof photoFieldValidator>;
export type ProfileDocumentField = Infer<typeof profileDocumentFieldValidator>;

// Union type for all field types
export type ServiceField = Infer<typeof serviceFieldValidator>;

// Field option type
export type FieldOption = Infer<typeof fieldOptionValidator>;

// ============================================================================
// Service Step Types
// ============================================================================

export type ServiceStep = Infer<typeof serviceStepValidator>;

// ============================================================================
// Service Configuration Types
// ============================================================================

// ============================================================================
// Helper Type Guards
// ============================================================================

export function isTextField(field: ServiceField): field is TextField {
  return field.type === 'text';
}

export function isNumberField(field: ServiceField): field is NumberField {
  return field.type === 'number';
}

export function isEmailField(field: ServiceField): field is EmailField {
  return field.type === 'email';
}

export function isPhoneField(field: ServiceField): field is PhoneField {
  return field.type === 'phone';
}

export function isDateField(field: ServiceField): field is DateField {
  return field.type === 'date';
}

export function isSelectField(field: ServiceField): field is SelectField {
  return field.type === 'select';
}

export function isAddressField(field: ServiceField): field is AddressField {
  return field.type === 'address';
}

export function isFileField(field: ServiceField): field is FileField {
  return field.type === 'file';
}

export function isCheckboxField(field: ServiceField): field is CheckboxField {
  return field.type === 'checkbox';
}

export function isRadioField(field: ServiceField): field is RadioField {
  return field.type === 'radio';
}

export function isTextareaField(field: ServiceField): field is TextareaField {
  return field.type === 'textarea';
}

export function isDocumentField(field: ServiceField): field is DocumentField {
  return field.type === 'document';
}

export function isPhotoField(field: ServiceField): field is PhotoField {
  return field.type === 'photo';
}
