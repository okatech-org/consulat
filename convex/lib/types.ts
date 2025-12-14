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

export type CompleteChildProfile = NonNullable<FunctionReturnType<
  typeof api.functions.childProfile.getCurrentChildProfile
>>;

export type CompleteProfile = NonNullable<FunctionReturnType<
  typeof api.functions.profile.getCurrentProfile
>>;

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

export type AllOrganizations = FunctionReturnType<
  typeof api.functions.organization.getAllOrganizations
>;

// Type pour un pays enrichi avec compteurs
export type CountryListing = FunctionReturnType<
  typeof api.functions.country.getCountryListingItems
>;

export type CountryListingItem = CountryListing[number];

export type MembershipWithOrganization = FunctionReturnType<
  typeof api.functions.membership.getMembershipWithOrganizationByUserId
>;

export type OrganizationListSearchResult = FunctionReturnType<
  typeof api.functions.organization.getOrganizationsListEnriched
>;

export type UserListSearchResult = FunctionReturnType<
  typeof api.functions.user.getUsersListEnriched
>;
export type UserListItem = UserListSearchResult['users'][number];

export type RequestSearchResult = FunctionReturnType<
  typeof api.functions.request.getRequestsListEnriched
>;
export type RequestListItem = RequestSearchResult['items'][number];

export type ProfileSearchResult = FunctionReturnType<
  typeof api.functions.profile.getProfilesListEnriched
>;
export type ProfileListItem = ProfileSearchResult['items'][number];

export type ChildProfileSearchResult = FunctionReturnType<
  typeof api.functions.childProfile.getChildProfilesListEnriched
>;
export type ChildProfileListItem = ChildProfileSearchResult['items'][number];

export type Organization = FunctionReturnType<
  typeof api.functions.organization.getOrganization
>;

export type AgentsListResult = FunctionReturnType<
  typeof api.functions.membership.getAgentsList
>;
export type AgentListItem = AgentsListResult['agents'][number];

export type ProfilesMapData = FunctionReturnType<
  typeof api.functions.profile.getProfilesMapData
>;
export type ProfilesMapDataItem = ProfilesMapData[number];
