import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import {
  Note,
  RequestAction,
  RequestStatus as PrismaRequestStatus,
  ProcessingMode as PrismaProcessingMode,
  DeliveryMode as PrismaDeliveryMode,
  ParentalRole as PrismaParentalRole,
  RequestActionType,
  UserRole as PrismaUserRole,
  FamilyLink as PrismaFamilyLink,
  DocumentType as PrismaDocumentType,
  NoteType as PrismaNoteType,
  AppointmentStatus as PrismaAppointmentStatus,
  Address,
  EmergencyContact,
  UserDocument,
  ServiceRequest,
  Appointment,
  ServiceStepType as PrismaServiceStepType,
} from '@prisma/client';
import type {
  ServiceExport,
  UserCentricDataExport,
} from '../../scripts/export-prisma-to-json.ts';

import {
  AppointmentStatus,
  AppointmentType,
  CountryStatus,
  DocumentStatus,
  DocumentType,
  Gender,
  MaritalStatus,
  NationalityAcquisition,
  NotificationType,
  OrganizationStatus,
  OrganizationType,
  ProfileStatus,
  RequestStatus,
  ServiceCategory,
  ServiceStatus,
  UserRole,
  UserStatus,
  MembershipStatus,
  WorkStatus,
  ProcessingMode,
  DeliveryMode,
  FeedbackStatus,
  FeedbackCategory,
  ParentalRole,
  ActivityType,
  FamilyLink,
  RequestPriority,
  OwnerType,
  NoteType,
  ParticipantRole,
  ParticipantStatus,
  NotificationChannel,
  UserPermission,
  EmergencyContactType,
  ServiceStepType,
  SelectType,
  CountryCode,
} from '../lib/constants';
import type { Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';
import { ProfileDocumentField, ServiceField, ServiceStep } from '../lib/types';
import { countryCodeValidator } from '../lib/validators';

// Types pour les anciennes métadonnées d'organisation (par pays)
type DaySlot = { start?: string; end?: string };
type DaySchedule = { isOpen?: boolean; slots?: DaySlot[] };
type ScheduleConfig = {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
};
type ContactAddress = {
  firstLine?: string;
  city?: string;
  zipCode?: string;
  country?: string;
};
type ContactConfig = {
  address?: ContactAddress;
  phone?: string;
  email?: string;
  website?: string;
};
type CountrySettings = {
  contact?: ContactConfig;
  schedule?: ScheduleConfig;
  holidays?: string[];
  closures?: string[];
  consularCard?: {
    rectoModelUrl?: string;
    versoModelUrl?: string;
  };
};

// Mappings pour les enums
const roleMapping: { [key in PrismaUserRole]: UserRole } = {
  USER: UserRole.User,
  AGENT: UserRole.Agent,
  ADMIN: UserRole.Admin,
  SUPER_ADMIN: UserRole.SuperAdmin,
  MANAGER: UserRole.Manager,
  INTEL_AGENT: UserRole.IntelAgent,
  EDUCATION_AGENT: UserRole.EducationAgent,
};

const genderMapping: { [key: string]: Gender } = {
  MALE: Gender.Male,
  FEMALE: Gender.Female,
};

const maritalStatusMapping: { [key: string]: MaritalStatus } = {
  SINGLE: MaritalStatus.Single,
  MARRIED: MaritalStatus.Married,
  DIVORCED: MaritalStatus.Divorced,
  WIDOWED: MaritalStatus.Widowed,
  CIVIL_UNION: MaritalStatus.CivilUnion,
  COHABITING: MaritalStatus.Cohabiting,
};

const workStatusMapping: { [key: string]: WorkStatus } = {
  SELF_EMPLOYED: WorkStatus.SelfEmployed,
  EMPLOYEE: WorkStatus.Employee,
  ENTREPRENEUR: WorkStatus.Entrepreneur,
  UNEMPLOYED: WorkStatus.Unemployed,
  RETIRED: WorkStatus.Retired,
  STUDENT: WorkStatus.Student,
  OTHER: WorkStatus.Other,
};

const nationalityAcquisitionMapping: { [key: string]: NationalityAcquisition } = {
  BIRTH: NationalityAcquisition.Birth,
  NATURALIZATION: NationalityAcquisition.Naturalization,
  MARRIAGE: NationalityAcquisition.Marriage,
  OTHER: NationalityAcquisition.Other,
};

const serviceCategoryMapping: { [key: string]: ServiceCategory } = {
  IDENTITY: ServiceCategory.Identity,
  CIVIL_STATUS: ServiceCategory.CivilStatus,
  VISA: ServiceCategory.Visa,
  CERTIFICATION: ServiceCategory.Certification,
  TRANSCRIPT: ServiceCategory.Transcript,
  REGISTRATION: ServiceCategory.Registration,
  ASSISTANCE: ServiceCategory.Assistance,
  TRAVEL_DOCUMENT: ServiceCategory.TravelDocument,
  OTHER: ServiceCategory.Other,
};

const documentTypeMapping: Record<PrismaDocumentType, DocumentType> = {
  PASSPORT: DocumentType.Passport,
  IDENTITY_CARD: DocumentType.IdentityCard,
  BIRTH_CERTIFICATE: DocumentType.BirthCertificate,
  RESIDENCE_PERMIT: DocumentType.ResidencePermit,
  PROOF_OF_ADDRESS: DocumentType.ProofOfAddress,
  MARRIAGE_CERTIFICATE: DocumentType.MarriageCertificate,
  DEATH_CERTIFICATE: DocumentType.DeathCertificate,
  DIVORCE_DECREE: DocumentType.DivorceDecree,
  NATIONALITY_CERTIFICATE: DocumentType.NationalityCertificate,
  OTHER: DocumentType.Other,
  VISA_PAGES: DocumentType.VisaPages,
  EMPLOYMENT_PROOF: DocumentType.EmploymentProof,
  NATURALIZATION_DECREE: DocumentType.NaturalizationDecree,
  IDENTITY_PHOTO: DocumentType.IdentityPhoto,
  CONSULAR_CARD: DocumentType.ConsularCard,
};

const processingModeMapping: Record<PrismaProcessingMode, ProcessingMode> = {
  ONLINE_ONLY: ProcessingMode.OnlineOnly,
  PRESENCE_REQUIRED: ProcessingMode.PresenceRequired,
  HYBRID: ProcessingMode.Hybrid,
  BY_PROXY: ProcessingMode.ByProxy,
};

const deliveryModeMapping: Record<PrismaDeliveryMode, DeliveryMode> = {
  IN_PERSON: DeliveryMode.InPerson,
  POSTAL: DeliveryMode.Postal,
  ELECTRONIC: DeliveryMode.Electronic,
  BY_PROXY: DeliveryMode.ByProxy,
};

const documentStatusMapping: { [key: string]: DocumentStatus } = {
  PENDING: DocumentStatus.Pending,
  VALIDATED: DocumentStatus.Validated,
  REJECTED: DocumentStatus.Rejected,
  EXPIRED: DocumentStatus.Expired,
  EXPIRING: DocumentStatus.Expiring,
};

const appointmentTypeMapping: { [key: string]: AppointmentType } = {
  DOCUMENT_SUBMISSION: AppointmentType.DocumentSubmission,
  DOCUMENT_COLLECTION: AppointmentType.DocumentCollection,
  INTERVIEW: AppointmentType.Interview,
  MARRIAGE_CEREMONY: AppointmentType.MarriageCeremony,
  EMERGENCY: AppointmentType.Emergency,
  OTHER: AppointmentType.Other,
};

const appointmentStatusMapping: Record<
  PrismaAppointmentStatus | 'SCHEDULED',
  AppointmentStatus
> = {
  PENDING: AppointmentStatus.Pending,
  CONFIRMED: AppointmentStatus.Confirmed,
  CANCELLED: AppointmentStatus.Cancelled,
  COMPLETED: AppointmentStatus.Completed,
  MISSED: AppointmentStatus.Missed,
  RESCHEDULED: AppointmentStatus.Rescheduled,
  SCHEDULED: AppointmentStatus.Scheduled,
};

const notificationTypeMapping: { [key: string]: NotificationType } = {
  APPOINTMENT_REMINDER_3_DAYS: NotificationType.Reminder,
  APPOINTMENT_REMINDER_1_DAY: NotificationType.Reminder,
  APPOINTMENT_CONFIRMATION: NotificationType.Confirmation,
  APPOINTMENT_MODIFICATION: NotificationType.Communication,
  APPOINTMENT_CANCELLATION: NotificationType.Cancellation,
  FEEDBACK: NotificationType.Updated,
  VALIDATED: NotificationType.Updated,
  REJECTED: NotificationType.Updated,
  DOCUMENT_VALIDATED: NotificationType.Updated,
  DOCUMENT_REJECTED: NotificationType.Updated,
  REQUEST_SUBMITTED: NotificationType.Updated,
  REQUEST_ASSIGNED: NotificationType.Updated,
  REQUEST_COMPLETED: NotificationType.Updated,
  REQUEST_CANCELLED: NotificationType.Updated,
  REQUEST_EXPIRED: NotificationType.Updated,
  REQUEST_REJECTED: NotificationType.Updated,
  REQUEST_APPROVED: NotificationType.Updated,
  REQUEST_ADDITIONAL_INFO_NEEDED: NotificationType.Updated,
  REQUEST_PENDING_APPOINTMENT: NotificationType.Updated,
  REQUEST_PENDING_PAYMENT: NotificationType.Updated,
  REQUEST_NEW: NotificationType.Updated,
  CONSULAR_REGISTRATION_SUBMITTED: NotificationType.Updated,
  CONSULAR_REGISTRATION_VALIDATED: NotificationType.Updated,
  CONSULAR_REGISTRATION_REJECTED: NotificationType.Updated,
  CONSULAR_CARD_IN_PRODUCTION: NotificationType.Updated,
  CONSULAR_CARD_READY: NotificationType.Updated,
  CONSULAR_REGISTRATION_COMPLETED: NotificationType.Updated,
};

const parentalRoleMapping: Record<PrismaParentalRole, ParentalRole> = {
  FATHER: ParentalRole.Father,
  MOTHER: ParentalRole.Mother,
  LEGAL_GUARDIAN: ParentalRole.LegalGuardian,
};

const requestStatusMapping: Record<PrismaRequestStatus, RequestStatus> = {
  EDITED: RequestStatus.Edited,
  DRAFT: RequestStatus.Draft,
  SUBMITTED: RequestStatus.Submitted,
  PENDING: RequestStatus.Pending,
  PENDING_COMPLETION: RequestStatus.PendingCompletion,
  VALIDATED: RequestStatus.Validated,
  REJECTED: RequestStatus.Rejected,
  COMPLETED: RequestStatus.Completed,
  CARD_IN_PRODUCTION: RequestStatus.InProduction,
  DOCUMENT_IN_PRODUCTION: RequestStatus.InProduction,
  READY_FOR_PICKUP: RequestStatus.ReadyForPickup,
  APPOINTMENT_SCHEDULED: RequestStatus.AppointmentScheduled,
};

const profileStatusMapping: Record<PrismaRequestStatus, ProfileStatus> = {
  EDITED: ProfileStatus.Pending,
  DRAFT: ProfileStatus.Draft,
  SUBMITTED: ProfileStatus.Pending,
  PENDING: ProfileStatus.Pending,
  PENDING_COMPLETION: ProfileStatus.Pending,
  VALIDATED: ProfileStatus.Active,
  REJECTED: ProfileStatus.Inactive,
  COMPLETED: ProfileStatus.Active,
  CARD_IN_PRODUCTION: ProfileStatus.Active,
  DOCUMENT_IN_PRODUCTION: ProfileStatus.Active,
  READY_FOR_PICKUP: ProfileStatus.Active,
  APPOINTMENT_SCHEDULED: ProfileStatus.Active,
};

const mapRequestActionType: Record<RequestActionType, ActivityType> = {
  ASSIGNMENT: ActivityType.RequestAssigned,
  STATUS_CHANGE: ActivityType.StatusChanged,
  NOTE_ADDED: ActivityType.CommentAdded,
  DOCUMENT_ADDED: ActivityType.DocumentUploaded,
  DOCUMENT_VALIDATED: ActivityType.DocumentValidated,
  DOCUMENT_DELETED: ActivityType.DocumentDeleted,
  PAYMENT_RECEIVED: ActivityType.PaymentReceived,
  COMPLETED: ActivityType.RequestCompleted,
  PROFILE_UPDATE: ActivityType.ProfileUpdate,
  DOCUMENT_UPDATED: ActivityType.DocumentUpdated,
  APPOINTMENT_SCHEDULED: ActivityType.AppointmentScheduled,
};

const familyLinkMapping: Record<PrismaFamilyLink, FamilyLink> = {
  FATHER: FamilyLink.Father,
  MOTHER: FamilyLink.Mother,
  SPOUSE: FamilyLink.Spouse,
  LEGAL_GUARDIAN: FamilyLink.LegalGuardian,
  CHILD: FamilyLink.Child,
  OTHER: FamilyLink.Other,
};

const mapDocumentTypeLabel: Record<DocumentType, string> = {
  [DocumentType.Passport]: 'Passeport',
  [DocumentType.IdentityCard]: "Carte d'identité",
  [DocumentType.BirthCertificate]: 'Acte de naissance',
  [DocumentType.ResidencePermit]: 'Titre de séjour',
  [DocumentType.ProofOfAddress]: 'Justificatif de domicile',
  [DocumentType.MarriageCertificate]: 'Certificat de mariage',
  [DocumentType.DeathCertificate]: 'Certificat de décès',
  [DocumentType.DivorceDecree]: 'Décret de divorce',
  [DocumentType.NationalityCertificate]: 'Certificat de nationalité',
  [DocumentType.Other]: 'Autre',
  [DocumentType.VisaPages]: 'Pages de visa',
  [DocumentType.EmploymentProof]: "Justificatif d'emploi",
  [DocumentType.NaturalizationDecree]: 'Décret de naturalisation',
  [DocumentType.IdentityPhoto]: "Photo d'identité",
  [DocumentType.ConsularCard]: 'Carte consulaire',
  [DocumentType.DriverLicense]: 'Permis de conduire',
  [DocumentType.Photo]: 'Photo',
  [DocumentType.FamilyBook]: 'Livret de famille',
};

const serviceStepTypeMapping: Record<PrismaServiceStepType, ServiceStepType> = {
  FORM: ServiceStepType.Form,
  DOCUMENTS: ServiceStepType.Documents,
  APPOINTMENT: ServiceStepType.Appointment,
  PAYMENT: ServiceStepType.Payment,
  REVIEW: ServiceStepType.Review,
  DELIVERY: ServiceStepType.Delivery,
};

export const importOrganizations = mutation({
  args: {
    organizations: v.array(v.any()),
  },
  returns: v.object({
    importedCount: v.number(),
    orgIds: v.array(v.id('organizations')),
    configsImported: v.number(),
  }),
  handler: async (ctx: MutationCtx, args) => {
    console.log(`🚀 Import de ${args.organizations.length} organisations...`);

    const importedOrgs: Array<Id<'organizations'>> = [];
    const orgCountryConfigs: Array<{
      orgId: Id<'organizations'>;
      countryCode: CountryCode;
      config: CountrySettings;
    }> = [];

    for (const postgresOrg of args.organizations) {
      try {
        // Extraire les codes pays du metadata si disponible
        let countryCodes: Array<CountryCode> = [];
        let parsedMetadata: Record<CountryCode, { settings?: CountrySettings }> | null =
          null;

        if (postgresOrg.metadata) {
          try {
            // Parser le metadata s'il est une chaîne JSON
            parsedMetadata =
              typeof postgresOrg.metadata === 'string'
                ? (JSON.parse(postgresOrg.metadata) as Record<
                    CountryCode,
                    { settings?: CountrySettings }
                  >)
                : (postgresOrg.metadata as Record<
                    CountryCode,
                    { settings?: CountrySettings }
                  >);

            if (parsedMetadata && typeof parsedMetadata === 'object') {
              // Si metadata contient des clés de codes pays (FR, PM, WF, etc.)
              countryCodes = Object.keys(parsedMetadata).filter(
                (key) => key.length === 2 && key.match(/^[A-Z]{2}$/),
              ) as CountryCode[];
            }
          } catch (error) {
            console.error(
              `❌ Erreur parsing metadata pour org ${postgresOrg.id}:`,
              error,
            );
          }
        }

        const orgId = await ctx.db.insert('organizations', {
          code:
            postgresOrg.code || `ORG_${String(postgresOrg.id.toUpperCase().slice(0, 4))}`,
          name: postgresOrg.name,
          logo: postgresOrg.logo || undefined,
          type: postgresOrg.type.toLowerCase() as OrganizationType,
          status: postgresOrg.status.toLowerCase() as OrganizationStatus,
          countryCodes: countryCodes,
          memberIds: [],
          serviceIds: [],
          childIds: [],
          settings: (() => {
            // Construire les settings à partir du metadata parsé
            const settingsArray: Array<{
              appointmentSettings: any;
              workflowSettings: any;
              notificationSettings: any;
              countryCode: CountryCode;
              consularCard?: any;
              contact?: any;
              schedule?: any;
              holidays: number[];
              closures: number[];
            }> = [];

            if (parsedMetadata && typeof parsedMetadata === 'object') {
              for (const countryCode of countryCodes) {
                const countryConfig = parsedMetadata[countryCode];
                if (countryConfig && countryConfig.settings) {
                  const config = countryConfig.settings as CountrySettings;
                  settingsArray.push({
                    appointmentSettings: postgresOrg.appointmentSettings || {},
                    workflowSettings: postgresOrg.workflowSettings || {},
                    notificationSettings: postgresOrg.notificationSettings || {},
                    countryCode: countryCode,
                    consularCard: config.consularCard,
                    contact: config.contact
                      ? {
                          address: config.contact.address
                            ? {
                                street: config.contact.address.firstLine || '',
                                city: config.contact.address.city || '',
                                postalCode: config.contact.address.zipCode || '',
                                country: (config.contact.address.country ||
                                  'FR') as CountryCode,
                              }
                            : undefined,
                          phone: config.contact.phone,
                          email: config.contact.email,
                          website: config.contact.website,
                        }
                      : undefined,
                    schedule: config.schedule
                      ? {
                          monday: {
                            isOpen: Boolean(config.schedule.monday?.isOpen),
                            slots: (config.schedule.monday?.slots || []).map((s) => ({
                              start: s.start ?? '',
                              end: s.end ?? '',
                            })),
                          },
                          tuesday: {
                            isOpen: Boolean(config.schedule.tuesday?.isOpen),
                            slots: (config.schedule.tuesday?.slots || []).map((s) => ({
                              start: s.start ?? '',
                              end: s.end ?? '',
                            })),
                          },
                          wednesday: {
                            isOpen: Boolean(config.schedule.wednesday?.isOpen),
                            slots: (config.schedule.wednesday?.slots || []).map((s) => ({
                              start: s.start ?? '',
                              end: s.end ?? '',
                            })),
                          },
                          thursday: {
                            isOpen: Boolean(config.schedule.thursday?.isOpen),
                            slots: (config.schedule.thursday?.slots || []).map((s) => ({
                              start: s.start ?? '',
                              end: s.end ?? '',
                            })),
                          },
                          friday: {
                            isOpen: Boolean(config.schedule.friday?.isOpen),
                            slots: (config.schedule.friday?.slots || []).map((s) => ({
                              start: s.start ?? '',
                              end: s.end ?? '',
                            })),
                          },
                          saturday: {
                            isOpen: Boolean(config.schedule.saturday?.isOpen),
                            slots: (config.schedule.saturday?.slots || []).map((s) => ({
                              start: s.start ?? '',
                              end: s.end ?? '',
                            })),
                          },
                          sunday: {
                            isOpen: Boolean(config.schedule.sunday?.isOpen),
                            slots: (config.schedule.sunday?.slots || []).map((s) => ({
                              start: s.start ?? '',
                              end: s.end ?? '',
                            })),
                          },
                        }
                      : undefined,
                    holidays: (config.holidays || []).map((h) => new Date(h).getTime()),
                    closures: (config.closures || []).map((c) => new Date(c).getTime()),
                  });
                }
              }
            }
            return settingsArray;
          })(),
          legacyId: postgresOrg.id,
          metadata: {},
        });

        importedOrgs.push(orgId);

        // Préparer les configurations par pays
        if (parsedMetadata && typeof parsedMetadata === 'object') {
          for (const countryCode of countryCodes) {
            const countryConfig = parsedMetadata[countryCode];
            if (countryConfig && countryConfig.settings) {
              orgCountryConfigs.push({
                orgId,
                countryCode,
                config: countryConfig.settings as CountrySettings,
              });
            }
          }
        }

        console.log(
          `✅ Organisation importée: ${postgresOrg.name} (${countryCodes.length} pays)`,
        );
      } catch (error) {
        console.error(`❌ Erreur import organisation ${postgresOrg.id}:`, error);
        console.error(
          "Détails de l'erreur:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    console.log(`✅ ${importedOrgs.length} organisations importées`);
    return {
      importedCount: importedOrgs.length,
      orgIds: importedOrgs,
      configsImported: orgCountryConfigs.length,
    };
  },
});

export const importCountries = mutation({
  args: {
    countries: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        code: countryCodeValidator,
        status: v.string(),
        flag: v.union(v.null(), v.string()),
        createdAt: v.optional(v.any()),
        updatedAt: v.optional(v.any()),
        metadata: v.optional(v.any()),
      }),
    ),
  },
  returns: v.object({
    importedCount: v.number(),
    countryIds: v.array(v.id('countries')),
  }),
  handler: async (ctx: MutationCtx, args) => {
    console.log(`🚀 Import de ${args.countries.length} pays...`);

    const importedCountries: Array<Id<'countries'>> = [];

    for (const postgresCountry of args.countries) {
      try {
        const countryId = await ctx.db.insert('countries', {
          name: postgresCountry.name,
          code: postgresCountry.code,
          status: postgresCountry.status.toLowerCase() as CountryStatus,
          flag: postgresCountry.flag || undefined,
          metadata: postgresCountry.metadata || undefined,
        });

        importedCountries.push(countryId);
      } catch (error) {
        console.error(`❌ Erreur import pays ${postgresCountry.id}:`, error);
        console.error(
          "Détails de l'erreur:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    console.log(`✅ ${importedCountries.length} pays importés`);
    return {
      importedCount: importedCountries.length,
      countryIds: importedCountries,
    };
  },
});

export const importServices = mutation({
  args: {
    services: v.array(v.any()),
  },
  returns: v.object({
    importedCount: v.number(),
    serviceIds: v.array(v.id('services')),
    importedLegacyIds: v.array(v.string()),
  }),
  handler: async (ctx: MutationCtx, args) => {
    console.log(`🚀 Import de ${args.services.length} services...`);

    const typedServices = args.services as unknown as ServiceExport[];

    const importedServices: Array<Id<'services'>> = [];
    const importedLegacyIds: Array<string> = [];

    for (const service of typedServices) {
      try {
        // Trouver l'organisation Convex correspondante
        const organization = await ctx.db
          .query('organizations')
          .filter((q) => q.eq(q.field('legacyId'), service.organizationId))
          .first();

        if (!organization) {
          console.warn(
            `⚠️ Organisation ${service.organizationId} non trouvée pour le service ${service.id}`,
          );
          continue;
        }

        const serviceSteps: Array<ServiceStep> = [];

        if (service.requiredDocuments.length || service.optionalDocuments.length) {
          const fields: Array<ProfileDocumentField> = [];

          for (const document of service.requiredDocuments) {
            fields.push({
              type: 'profileDocument',
              name: documentTypeMapping[document] || DocumentType.Other,
              label:
                mapDocumentTypeLabel[documentTypeMapping[document] || DocumentType.Other],
              required: true,
              documentType: documentTypeMapping[document] || DocumentType.Other,
            });
          }

          for (const document of service.optionalDocuments) {
            fields.push({
              type: 'profileDocument',
              name: documentTypeMapping[document] || DocumentType.Other,
              label:
                mapDocumentTypeLabel[documentTypeMapping[document] || DocumentType.Other],
              required: false,
              documentType: documentTypeMapping[document] || DocumentType.Other,
            });
          }

          serviceSteps.push({
            order: serviceSteps.length,
            title: 'Documents',
            description: 'Documents requis pour la démarche',
            type: ServiceStepType.Documents,
            isRequired: true,
            fields: fields,
          });
        }

        for (const step of service.steps) {
          const fieldsArray: Array<any> = step.fields
            ? JSON.parse(step.fields as string)
            : [];
          const fields: Array<ServiceField> = [];

          for (const field of fieldsArray) {
            const fieldType = field.type as ServiceField['type'];
            switch (fieldType) {
              case 'text':
                fields.push({
                  name: field.name,
                  type: 'text',
                  label: field.label,
                  required: field.required,
                  description: field.description,
                  autoComplete: field.autoComplete,
                  profilePath: field.profilePath,
                  minLength: field.minLength,
                  maxLength: field.maxLength,
                  pattern: field.pattern,
                });
                break;
              case 'email':
                fields.push({
                  name: field.name,
                  type: 'email',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                });
                break;
              case 'phone':
                fields.push({
                  name: field.name,
                  type: 'phone',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                });
                break;
              case 'date':
                fields.push({
                  name: field.name,
                  type: 'date',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                });
                break;
              case 'select':
                fields.push({
                  name: field.name,
                  type: 'select',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                  selectType: (field.selectType as SelectType) || 'single',
                  options: field.options.map((o: any) => ({
                    label: o.label,
                    value: o.value,
                  })),
                });
                break;
              case 'address':
                fields.push({
                  name: field.name,
                  type: 'address',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                  countries: field.countries,
                });
                break;
              case 'file':
                fields.push({
                  name: field.name,
                  type: 'file',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                });
                break;
              case 'checkbox':
                fields.push({
                  name: field.name,
                  type: 'checkbox',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                });
                break;
              case 'textarea':
                fields.push({
                  name: field.name,
                  type: 'textarea',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                });
                break;
              case 'radio':
                fields.push({
                  name: field.name,
                  type: 'radio',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                  options: field.options.map((o: any) => ({
                    label: o.label,
                    value: o.value,
                  })),
                });
                break;
              case 'number':
                fields.push({
                  name: field.name,
                  type: 'number',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                });
                break;
              case 'document':
                fields.push({
                  name: field.name,
                  type: 'document',
                  label: field.label,
                  description: field.description,
                  required: field.required,
                  documentType: field.documentType || 'other',
                });
                break;
              default:
                console.warn(`Field type ${fieldType} not supported`);
                break;
            }
          }

          serviceSteps.push({
            order: serviceSteps.length,
            title: step.title,
            description: step.description || undefined,
            type: serviceStepTypeMapping[step.type] || ServiceStepType.Form,
            isRequired: step.isRequired,
            fields: fields,
          });
        }

        const serviceId = await ctx.db.insert('services', {
          code: `SVC_${service.id.substring(0, 8).toUpperCase()}`,
          name: service.name,
          description: service.description || undefined,
          category: serviceCategoryMapping[service.category] || ServiceCategory.Other,
          status: service.isActive ? ServiceStatus.Active : ServiceStatus.Inactive,
          countries: ['FR'],
          organizationId: organization._id,
          steps: serviceSteps,
          processing: {
            mode:
              processingModeMapping[service.processingMode] || ProcessingMode.OnlineOnly,
            appointment: {
              requires: service.requiresAppointment || false,
              duration: service.appointmentDuration || undefined,
              instructions: service.appointmentInstructions || undefined,
            },
            proxy: {
              allows: service.proxyRequirements ? true : false,
              requirements: service.proxyRequirements || undefined,
            },
          },
          delivery: {
            modes: (service.deliveryMode || []).map(
              (m: string) =>
                deliveryModeMapping[m as PrismaDeliveryMode] || DeliveryMode.InPerson,
            ) || [DeliveryMode.InPerson],
            appointment: {
              requires: service.deliveryAppointment || false,
              duration: service.deliveryAppointmentDuration || undefined,
              instructions: service.deliveryAppointmentDesc || undefined,
            },
            proxy: {
              allows: service.proxyRequirements ? true : false,
              requirements: service.proxyRequirements || undefined,
            },
          },
          pricing: {
            isFree: service.isFree ? true : false,
            price: service.price ? service.price : undefined,
            currency: service.currency || 'EUR',
          },
          automations: undefined,
          legacyId: service.id,
        });

        await ctx.db.patch(organization._id, {
          serviceIds: [...organization.serviceIds, serviceId],
        });

        importedServices.push(serviceId);
        importedLegacyIds.push(service.id as string);
      } catch (error) {
        console.error(`❌ Erreur import service ${service.id}:`, error);
        console.error(
          "Détails de l'erreur:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    console.log(`✅ ${importedServices.length} services importés`);
    return {
      importedCount: importedServices.length,
      serviceIds: importedServices,
      importedLegacyIds,
    };
  },
});

export const importUserWithData = mutation({
  args: {
    userData: v.any(),
  },
  returns: v.object({
    userId: v.id('users'),
    recordsImported: v.number(),
  }),
  handler: async (ctx: MutationCtx, args) => {
    const typedArgs = args.userData as unknown as UserCentricDataExport;
    const {
      id,
      clerkId,
      name,
      email,
      phoneNumber,
      countryCode,
      profile,
      submittedRequests,
      appointmentsToAttend,
      notifications,
      feedbacks,
    } = typedArgs;
    let recordCount = 0;

    if (!clerkId) {
      console.warn(`Utilisateur ${id} sans clerkId`);
    }

    console.log(`Importing user ${clerkId} with id ${id}`);

    // 1. Créer l'utilisateur
    const userId = await ctx.db.insert('users', {
      userId: clerkId || `temp_${id}`,
      legacyId: id,
      firstName: profile?.firstName || name || '',
      lastName: profile?.lastName || '',
      email: email || '',
      phoneNumber: phoneNumber || '',
      roles: [UserRole.User],
      status: UserStatus.Active,
    });
    recordCount++;

    // @ts-expect-error - address is not typed
    const profileAddress = profile?.address as
      | (Address & { coordinates: { latitude: string; longitude: string } })
      | undefined;

    const emergencyContacts: Array<
      EmergencyContact & { address: Address; type: EmergencyContactType }
    > = [
      // @ts-expect-error - residentContact and homeLandContact are not typed
      profile?.residentContact
        ? {
            // @ts-expect-error - residentContact and homeLandContact are not typed
            ...profile.residentContact,
            type: EmergencyContactType.Resident,
          }
        : undefined,
      // @ts-expect-error - residentContact and homeLandContact are not typed
      profile?.homeLandContact
        ? {
            // @ts-expect-error - residentContact and homeLandContact are not typed
            ...profile.homeLandContact,
            type: EmergencyContactType.HomeLand,
          }
        : undefined,
    ].filter((c): c is NonNullable<typeof c> => Boolean(c));

    // 2. Créer le profil si présent
    let profileId: Id<'profiles'> | undefined = undefined;
    if (profile) {
      profileId = await ctx.db.insert('profiles', {
        userId: userId,
        status:
          profileStatusMapping[profile.status as PrismaRequestStatus] ||
          ProfileStatus.Pending,
        residenceCountry:
          (profile.residenceCountyCode as CountryCode) ||
          (countryCode as CountryCode) ||
          undefined,
        consularCard: {
          cardNumber: profile.cardNumber || undefined,
          cardIssuedAt: profile.cardIssuedAt
            ? new Date(profile.cardIssuedAt).getTime()
            : undefined,
          cardExpiresAt: profile.cardExpiresAt
            ? new Date(profile.cardExpiresAt).getTime()
            : undefined,
        },
        contacts: {
          email: profile.email || undefined,
          phone: profile.phoneNumber || undefined,
          address: profileAddress
            ? {
                street: profileAddress.firstLine || '',
                complement: profileAddress.secondLine || undefined,
                city: profileAddress.city || '',
                postalCode: profileAddress.zipCode || '',
                state: undefined,
                country:
                  (profileAddress.country as CountryCode) ||
                  (countryCode as CountryCode) ||
                  'FR',
                coordinates: profileAddress.coordinates || undefined,
              }
            : undefined,
        },
        personal: {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          birthDate: profile.birthDate
            ? new Date(profile.birthDate).getTime()
            : undefined,
          birthPlace: profile.birthPlace || undefined,
          birthCountry: (profile.birthCountry as CountryCode) || undefined,
          gender: profile.gender ? genderMapping[profile.gender] : undefined,
          nationality: (profile.nationality as CountryCode) || ('GA' as CountryCode),
          acquisitionMode: profile.acquisitionMode
            ? nationalityAcquisitionMapping[profile.acquisitionMode]
            : NationalityAcquisition.Birth,
          passportInfos: {
            number: profile.passportNumber || undefined,
            issueDate: profile.passportIssueDate
              ? new Date(profile.passportIssueDate).getTime()
              : undefined,
            expiryDate: profile.passportExpiryDate
              ? new Date(profile.passportExpiryDate).getTime()
              : undefined,
            issueAuthority: profile.passportIssueAuthority || undefined,
          },
          nipCode: profile.cardPin || undefined,
        },
        family: {
          maritalStatus: profile.maritalStatus
            ? maritalStatusMapping[profile.maritalStatus]
            : MaritalStatus.Single,
          father:
            profile.fatherFullName && typeof profile.fatherFullName === 'string'
              ? {
                  firstName: profile.fatherFullName.split(' ')[0] || undefined,
                  lastName:
                    profile.fatherFullName.split(' ').slice(1).join(' ') || undefined,
                }
              : undefined,
          mother:
            profile.motherFullName && typeof profile.motherFullName === 'string'
              ? {
                  firstName: profile.motherFullName.split(' ')[0] || undefined,
                  lastName:
                    profile.motherFullName.split(' ').slice(1).join(' ') || undefined,
                }
              : undefined,
          spouse:
            profile.spouseFullName && typeof profile.spouseFullName === 'string'
              ? {
                  firstName: profile.spouseFullName.split(' ')[0] || undefined,
                  lastName:
                    profile.spouseFullName.split(' ').slice(1).join(' ') || undefined,
                }
              : undefined,
        },
        emergencyContacts: emergencyContacts.map((c) => ({
          type: c.type,
          firstName: c.firstName || '',
          lastName: c.lastName || '',
          relationship: (familyLinkMapping[c.relationship as PrismaFamilyLink] ||
            FamilyLink.Other) as
            | FamilyLink.Father
            | FamilyLink.Mother
            | FamilyLink.Spouse
            | FamilyLink.LegalGuardian
            | FamilyLink.Child
            | FamilyLink.Other,
          phoneNumber: c.phoneNumber || '',
          email: c.email || '',
          address: c.address
            ? {
                street: c.address.firstLine || '',
                complement: c.address.secondLine || undefined,
                city: c.address.city || '',
                postalCode: c.address.zipCode || '',
                state: undefined,
                country: (c.address.country as CountryCode) || ('FR' as CountryCode),
                coordinates: undefined,
              }
            : undefined,
          profileId: undefined,
        })),
        professionSituation: {
          workStatus: profile.workStatus
            ? workStatusMapping[profile.workStatus]
            : WorkStatus.Unemployed,
          profession: profile.profession || undefined,
          employer: profile.employer || undefined,
          employerAddress: profile.employerAddress || undefined,
          activityInGabon: profile.activityInGabon || undefined,
          cv: undefined,
        },
        documents: {},
      });

      recordCount++;

      // Mettre à jour l'utilisateur avec le profileId
      await ctx.db.patch(userId, { profileId });

      // @ts-expect-error - identityPicture is not typed
      if (profile?.identityPicture) {
        // @ts-expect-error - identityPicture is not typed
        const identityPicture = profile.identityPicture as UserDocument;
        const documentId = await ctx.db.insert('documents', {
          type: DocumentType.IdentityPhoto,
          status: documentStatusMapping[identityPicture.status] || DocumentStatus.Pending,
          ownerId: profileId || userId,
          ownerType: profileId ? OwnerType.Profile : OwnerType.User,
          fileUrl: identityPicture.fileUrl,
          fileName: identityPicture.fileUrl?.split('/').pop() || 'document',
          fileType: identityPicture.fileType || 'image/png',
          fileSize: undefined,
          version: 1,
          validations: [],
          metadata: identityPicture.metadata
            ? (identityPicture.metadata as Record<string, any>)
            : {},
        });

        await ctx.db.patch(profileId, {
          documents: {
            identityPicture: {
              id: documentId,
              fileUrl: identityPicture.fileUrl,
            },
          },
        });
        recordCount++;
      }

      // @ts-expect-error - identityPicture is not typed
      if (profile?.passport) {
        // @ts-expect-error - identityPicture is not typed
        const passport = profile.passport as UserDocument;
        const documentId = await ctx.db.insert('documents', {
          type: DocumentType.Passport,
          status: documentStatusMapping[passport.status] || DocumentStatus.Pending,
          ownerId: profileId || userId,
          ownerType: profileId ? OwnerType.Profile : OwnerType.User,
          fileUrl: passport.fileUrl,
          fileName: passport.fileUrl?.split('/').pop() || 'document',
          fileType: passport.fileType || 'application/pdf',
          fileSize: undefined,
          issuedAt: passport.issuedAt ? new Date(passport.issuedAt).getTime() : undefined,
          expiresAt: passport.expiresAt
            ? new Date(passport.expiresAt).getTime()
            : undefined,
          version: 1,
          validations: [],
          metadata: passport.metadata ? (passport.metadata as Record<string, any>) : {},
        });

        await ctx.db.patch(profileId, {
          documents: {
            passport: {
              id: documentId,
              fileUrl: passport.fileUrl,
            },
          },
        });
        recordCount++;
      }

      // @ts-expect-error - identityPicture is not typed
      if (profile?.birthCertificate) {
        // @ts-expect-error - identityPicture is not typed
        const birthCertificate = profile.birthCertificate as UserDocument;
        const documentId = await ctx.db.insert('documents', {
          type: DocumentType.BirthCertificate,
          status:
            documentStatusMapping[birthCertificate.status] || DocumentStatus.Pending,
          ownerId: profileId,
          ownerType: OwnerType.Profile,
          fileUrl: birthCertificate.fileUrl,
          fileName: birthCertificate.fileUrl?.split('/').pop() || 'document',
          fileType: birthCertificate.fileType || 'application/pdf',
          fileSize: undefined,
          version: 1,
          validations: [],
          metadata: birthCertificate.metadata
            ? (birthCertificate.metadata as Record<string, any>)
            : {},
        });

        await ctx.db.patch(profileId, {
          documents: {
            birthCertificate: {
              id: documentId,
              fileUrl: birthCertificate.fileUrl,
            },
          },
        });
        recordCount++;
      }

      // @ts-expect-error - identityPicture is not typed
      if (profile?.residencePermit) {
        // @ts-expect-error - identityPicture is not typed
        const residencePermit = profile.residencePermit as UserDocument;
        const documentId = await ctx.db.insert('documents', {
          type: DocumentType.ResidencePermit,
          status: documentStatusMapping[residencePermit.status] || DocumentStatus.Pending,
          ownerId: profileId,
          ownerType: OwnerType.Profile,
          fileUrl: residencePermit.fileUrl,
          fileName: residencePermit.fileUrl?.split('/').pop() || 'document',
          fileType: residencePermit.fileType || 'application/pdf',
          fileSize: undefined,
          version: 1,
          validations: [],
          metadata: residencePermit.metadata
            ? (residencePermit.metadata as Record<string, any>)
            : {},
        });

        await ctx.db.patch(profileId, {
          documents: {
            residencePermit: {
              id: documentId,
              fileUrl: residencePermit.fileUrl,
            },
          },
        });
        recordCount++;
      }

      // @ts-expect-error - identityPicture is not typed
      if (profile?.addressProof) {
        // @ts-expect-error - identityPicture is not typed
        const addressProof = profile.addressProof as UserDocument;
        const documentId = await ctx.db.insert('documents', {
          type: DocumentType.ProofOfAddress,
          status: documentStatusMapping[addressProof.status] || DocumentStatus.Pending,
          ownerId: profileId,
          ownerType: OwnerType.Profile,
          fileUrl: addressProof.fileUrl,
          fileName: addressProof.fileUrl?.split('/').pop() || 'document',
          fileType: addressProof.fileType || 'application/pdf',
          fileSize: undefined,
          version: 1,
          validations: [],
          metadata: addressProof.metadata
            ? (addressProof.metadata as Record<string, any>)
            : {},
        });

        await ctx.db.patch(profileId, {
          documents: {
            addressProof: {
              id: documentId,
              fileUrl: addressProof.fileUrl,
            },
          },
        });
        recordCount++;
      }
    }

    // @ts-expect-error - submittedRequests is not typed
    const requests: Array<ServiceRequest & { actions: RequestAction[]; notes: Note[] }> =
      [...submittedRequests];

    // 4. Importer les demandes (requests)
    if (requests && requests.length > 0 && profile) {
      const filteredRequests = requests.filter((r) => r.requestedForId === profile.id);

      for (const req of filteredRequests) {
        try {
          const serviceId = await findConvexServiceByLegacyId(ctx, req.serviceId);
          const assignedAgentId = await findConvexMembershipByLegacyId(
            ctx,
            req.assignedToId ?? '',
          );
          const organizationId = await findConvexOrganizationByLegacyId(
            ctx,
            req.organizationId,
          );
          const activities = await Promise.all(
            req.actions
              .map(async (a: RequestAction) => {
                const actorId = await findConvexMembershipByLegacyId(ctx, a.userId);
                if (!actorId) {
                  console.warn(`Utilisateur ${a.userId} introuvable`);
                  return undefined;
                }
                return {
                  actorId: actorId ?? 'system',
                  data: a.data,
                  type: mapRequestActionType[a.type] || ActivityType.StatusChanged,
                  timestamp: new Date(a.createdAt).getTime(),
                };
              })
              .filter((a) => a !== undefined),
          );

          const [service, profileData, organization, assigee] = await Promise.all([
            ctx.db.get(serviceId!),
            ctx.db.get(profileId!),
            ctx.db.get(organizationId!),
            assignedAgentId ? ctx.db.get(assignedAgentId) : Promise.resolve(undefined),
          ]);

          if (serviceId && profileData) {
            const requestId = await ctx.db.insert('requests', {
              number: `REQ-${req.id.substring(0, 8).toUpperCase()}`,
              status:
                requestStatusMapping[req.status as PrismaRequestStatus] ||
                RequestStatus.Pending,
              priority:
                req.priority === 'URGENT'
                  ? RequestPriority.Urgent
                  : RequestPriority.Normal,
              serviceId: service!._id,
              requesterId: profileData._id,
              profileId: profileData._id,
              formData: req.formData || {},
              documentIds: [],
              notes: req.notes.map((n: Note) => ({
                type:
                  {
                    INTERNAL: NoteType.Internal,
                    FEEDBACK: NoteType.Feedback,
                  }[n.type as PrismaNoteType] || NoteType.Internal,
                authorId: undefined,
                content: n.content || '',
                serviceRequestId: undefined,
              })),
              assignedAgentId: assignedAgentId ?? undefined,
              submittedAt: req.submittedAt
                ? new Date(req.submittedAt).getTime()
                : undefined,
              completedAt: req.completedAt
                ? new Date(req.completedAt).getTime()
                : undefined,
              assignedAt: req.assignedAt ? new Date(req.assignedAt).getTime() : undefined,
              organizationId: organizationId!,
              countryCode: req.countryCode,
              metadata: {
                activities: activities.filter((a) => a !== undefined),
                organization: organization
                  ? {
                      name: organization.name,
                      type: organization.type,
                      logo: organization.logo,
                    }
                  : undefined,
                requester: profile
                  ? {
                      firstName: profileData.personal?.firstName,
                      lastName: profileData.personal?.lastName,
                      email: profileData.contacts?.email,
                      phoneNumber: profileData.contacts?.phone,
                    }
                  : undefined,
                profile: profile
                  ? {
                      firstName: profileData.personal?.firstName,
                      lastName: profileData.personal?.lastName,
                      email: profileData.contacts?.email,
                      phoneNumber: profileData.contacts?.phone,
                    }
                  : undefined,
                service: service
                  ? {
                      name: service!.name,
                      category: service!.category,
                    }
                  : undefined,
                assignee: assigee
                  ? {
                      firstName: assigee.firstName ?? '',
                      lastName: assigee.lastName ?? '',
                    }
                  : undefined,
              },
              config: {
                processingMode:
                  processingModeMapping[
                    req.chosenProcessingMode as PrismaProcessingMode
                  ] || ProcessingMode.OnlineOnly,
                deliveryMode:
                  deliveryModeMapping[req.chosenDeliveryMode as PrismaDeliveryMode] ||
                  DeliveryMode.InPerson,
                deliveryAddress: undefined,
                proxy: undefined,
              },
              generatedDocuments: [],
            });

            if (profile?.validationRequestId === req.id && profileData?._id) {
              await ctx.db.patch(profileData._id, {
                registrationRequest: requestId,
              });
            }

            recordCount++;
          }
        } catch (error) {
          console.error(`Erreur import request ${req.id}:`, error);
        }
      }
    }

    const appointments: Array<Appointment> = [...appointmentsToAttend];

    // 5. Importer les rendez-vous (appointments)
    if (appointments && appointments.length > 0) {
      for (const apt of appointments) {
        try {
          const organizationId = await findConvexOrganizationByLegacyId(
            ctx,
            apt.organizationId,
          );
          const serviceId = apt.serviceId
            ? await findConvexServiceByLegacyId(ctx, apt.serviceId)
            : undefined;
          const requestId = apt.requestId
            ? await findConvexRequestByLegacyId(ctx, apt.requestId)
            : undefined;
          const agentId = apt.agentId
            ? await findConvexMembershipByLegacyId(ctx, apt.agentId)
            : undefined;

          const participants: Array<{
            id: Id<'profiles'> | Id<'memberships'>;
            userId: Id<'users'>;
            role: ParticipantRole;
            status: ParticipantStatus;
          }> = [
            {
              id: profileId!,
              userId: userId,
              role: ParticipantRole.Attendee,
              status: ParticipantStatus.Confirmed,
            },
          ];

          if (agentId) {
            participants.push({
              id: agentId!,
              userId: userId,
              role: ParticipantRole.Agent,
              status: ParticipantStatus.Confirmed,
            });
          }

          const actions: Array<{
            authorId: Id<'users'> | Id<'profiles'>;
            type: 'cancel' | 'reschedule';
            date: number;
            reason: string | undefined;
          }> = [];

          if (apt.cancelledAt) {
            actions.push({
              authorId: userId,
              type: 'cancel',
              date: new Date(apt.cancelledAt).getTime(),
              reason: apt.cancelReason || undefined,
            });
          }

          if (apt.rescheduledFrom) {
            actions.push({
              authorId: userId,
              type: 'reschedule',
              date: new Date(apt.rescheduledFrom).getTime(),
              reason: undefined,
            });
          }

          if (organizationId) {
            await ctx.db.insert('appointments', {
              startAt: new Date(apt.startTime || apt.date).getTime(),
              endAt: new Date(apt.endTime || apt.date).getTime(),
              timezone: 'Europe/Paris',
              type: appointmentTypeMapping[apt.type] || AppointmentType.Other,
              status: (appointmentStatusMapping[apt.status] ||
                AppointmentStatus.Pending) as
                | AppointmentStatus.Pending
                | AppointmentStatus.Scheduled
                | AppointmentStatus.Confirmed
                | AppointmentStatus.Completed
                | AppointmentStatus.Cancelled,
              organizationId: organizationId,
              serviceId: serviceId,
              requestId: requestId,
              participants: participants,
              actions: actions,
            });
            recordCount++;
          }
        } catch (error) {
          console.error(`Erreur import appointment ${apt.id}:`, error);
        }
      }
    }

    // 6. Importer les notifications
    if (notifications && notifications.length > 0) {
      for (const notif of notifications) {
        try {
          await ctx.db.insert('notifications', {
            userId: userId,
            type: notificationTypeMapping[notif.type] || NotificationType.Updated,
            title: notif.title,
            content: notif.message,
            channels: [
              NotificationChannel.App,
              NotificationChannel.Email,
              NotificationChannel.Sms,
            ],
            deliveryStatus: {
              appAt: notif.read ? new Date(notif.createdAt).getTime() : undefined,
              emailAt: notif.read ? new Date(notif.createdAt).getTime() : undefined,
              smsAt: notif.read ? new Date(notif.createdAt).getTime() : undefined,
            },
            readAt: notif.read ? new Date(notif.createdAt).getTime() : undefined,
          });
          recordCount++;
        } catch (error) {
          console.error(`Erreur import notification ${notif.id}:`, error);
        }
      }
    }

    // 7. Importer les feedbacks
    if (feedbacks && feedbacks.length > 0) {
      for (const feedback of feedbacks) {
        try {
          // Trouver les IDs Convex correspondants
          const serviceId = feedback.serviceId
            ? await findConvexServiceByLegacyId(ctx, feedback.serviceId)
            : undefined;
          const requestId = feedback.requestId
            ? await findConvexRequestByLegacyId(ctx, feedback.requestId)
            : undefined;
          const organizationId = feedback.organizationId
            ? await findConvexOrganizationByLegacyId(ctx, feedback.organizationId)
            : undefined;

          await ctx.db.insert('tickets', {
            subject: feedback.subject,
            message: feedback.message,
            category:
              (feedback.category.toLowerCase() as FeedbackCategory) ||
              FeedbackCategory.Other,
            rating: undefined,
            status:
              (feedback.status.toLowerCase() as FeedbackStatus) || FeedbackStatus.Pending,
            userId: userId,
            email: feedback.email ?? undefined,
            phoneNumber: feedback.phoneNumber ?? undefined,
            response: feedback.response ?? undefined,
            respondedById: feedback.respondedById
              ? await findConvexUserByLegacyId(ctx, feedback.respondedById)
              : userId,
            respondedAt: feedback.respondedAt
              ? new Date(feedback.respondedAt).getTime()
              : undefined,
            serviceId: serviceId ?? undefined,
            requestId: requestId ?? undefined,
            organizationId: organizationId ?? undefined,
            metadata: feedback.metadata || {},
          });
          recordCount++;
        } catch (error) {
          console.error(`Erreur import feedback ${feedback.id}:`, error);
        }
      }
    }

    return {
      userId,
      recordsImported: recordCount,
    };
  },
});

export const importParentalAuthority = mutation({
  args: {
    parentalAuthority: v.object({
      id: v.string(),
      profile: v.any(),
      isActive: v.optional(v.boolean()),
      createdAt: v.optional(v.any()),
      updatedAt: v.optional(v.any()),
      parents: v.array(
        v.object({
          userId: v.string(),
          role: v.string(),
        }),
      ),
    }),
    request: v.optional(v.any()),
  },
  returns: v.object({
    importedCount: v.number(),
  }),
  handler: async (ctx: MutationCtx, args) => {
    let importedCount = 0;
    let authorUserId: Id<'users'> | undefined;

    const parentUsers = await Promise.all(
      args.parentalAuthority.parents.map(async (parent, index) => {
        const result = await getProfileByLegacyUserId(ctx, parent.userId);

        if (!result) {
          console.warn(`Utilisateur ${parent.userId} introuvable`);
          return undefined;
        }

        const { profile, user } = result;

        if (index === 0) {
          authorUserId = user?._id;
        }

        return {
          profileId: profile?._id,
          role:
            parentalRoleMapping[parent.role as PrismaParentalRole] ||
            ParentalRole.LegalGuardian,
          firstName: profile?.personal.firstName || '',
          lastName: profile?.personal.lastName || '',
          email: profile?.contacts.email || '',
          phoneNumber: profile?.contacts.phone || '',
          address: profile?.contacts.address || undefined,
        };
      }),
    );

    if (!parentUsers.some((parent) => parent?.profileId)) {
      console.warn(
        `❌ Utilisateur ${args.parentalAuthority.parents.map((parent) => parent.userId).join(', ')} introuvable`,
      );
      return {
        importedCount: 0,
      };
    }

    const childProfileId = await ctx.db.insert('childProfiles', {
      authorUserId: authorUserId as Id<'users'>,
      parents: parentUsers.filter((parent) => parent !== undefined),
      status:
        profileStatusMapping[
          args.parentalAuthority.profile.status as PrismaRequestStatus
        ] || ProfileStatus.Pending,
      consularCard: {
        cardNumber: args.parentalAuthority.profile.cardNumber || undefined,
        cardIssuedAt: args.parentalAuthority.profile.cardIssuedAt
          ? new Date(args.parentalAuthority.profile.cardIssuedAt).getTime()
          : undefined,
        cardExpiresAt: args.parentalAuthority.profile.cardExpiresAt
          ? new Date(args.parentalAuthority.profile.cardExpiresAt).getTime()
          : undefined,
      },
      personal: {
        firstName: args.parentalAuthority.profile.firstName || '',
        lastName: args.parentalAuthority.profile.lastName || '',
        birthDate: args.parentalAuthority.profile.birthDate
          ? new Date(args.parentalAuthority.profile.birthDate).getTime()
          : undefined,
        birthPlace: args.parentalAuthority.profile.birthPlace || undefined,
        birthCountry: args.parentalAuthority.profile.birthCountry || undefined,
        gender: genderMapping[args.parentalAuthority.profile.gender] || Gender.Male,
        nationality: args.parentalAuthority.profile.nationality || undefined,
        acquisitionMode:
          nationalityAcquisitionMapping[args.parentalAuthority.profile.acquisitionMode] ||
          NationalityAcquisition.Birth,
        nipCode: args.parentalAuthority.profile.nipCode || undefined,
        passportInfos: {
          number: args.parentalAuthority.profile.passportNumber || undefined,
          issueDate: args.parentalAuthority.profile.passportIssueDate
            ? new Date(args.parentalAuthority.profile.passportIssueDate).getTime()
            : undefined,
          expiryDate: args.parentalAuthority.profile.passportExpiryDate
            ? new Date(args.parentalAuthority.profile.passportExpiryDate).getTime()
            : undefined,
          issueAuthority:
            args.parentalAuthority.profile.passportIssueAuthority || undefined,
        },
      },
      documents: {},
    });

    if (args.parentalAuthority.profile.identityPicture) {
      const identityPicture = args.parentalAuthority.profile
        .identityPicture as UserDocument;
      const documentId = await ctx.db.insert('documents', {
        type: DocumentType.IdentityPhoto,
        status: documentStatusMapping[identityPicture.status] || DocumentStatus.Pending,
        ownerId: childProfileId,
        ownerType: OwnerType.ChildProfile,
        fileUrl: identityPicture.fileUrl,
        fileName: identityPicture.fileUrl?.split('/').pop() || 'document',
        fileType: identityPicture.fileType || 'image/png',
        fileSize: undefined,
        version: 1,
        validations: [],
        metadata: identityPicture.metadata
          ? (identityPicture.metadata as Record<string, any>)
          : {},
      });

      await ctx.db.patch(childProfileId, {
        documents: {
          identityPicture: {
            id: documentId,
            fileUrl: identityPicture.fileUrl,
          },
        },
      });
    }

    if (args.parentalAuthority.profile.passport) {
      const passport = args.parentalAuthority.profile.passport as UserDocument;
      const documentId = await ctx.db.insert('documents', {
        type: DocumentType.Passport,
        status: documentStatusMapping[passport.status] || DocumentStatus.Pending,
        ownerId: childProfileId,
        ownerType: OwnerType.ChildProfile,
        fileUrl: passport.fileUrl,
        fileName: passport.fileUrl?.split('/').pop() || 'document',
        fileType: passport.fileType || 'application/pdf',
        fileSize: undefined,
        issuedAt: passport.issuedAt ? new Date(passport.issuedAt).getTime() : undefined,
        expiresAt: passport.expiresAt
          ? new Date(passport.expiresAt).getTime()
          : undefined,
        version: 1,
        validations: [],
        metadata: passport.metadata ? (passport.metadata as Record<string, any>) : {},
      });

      await ctx.db.patch(childProfileId, {
        documents: {
          passport: {
            id: documentId,
            fileUrl: passport.fileUrl,
          },
        },
      });
    }

    if (args.parentalAuthority.profile.birthCertificate) {
      const birthCertificate = args.parentalAuthority.profile
        .birthCertificate as UserDocument;
      const documentId = await ctx.db.insert('documents', {
        type: DocumentType.BirthCertificate,
        status: documentStatusMapping[birthCertificate.status] || DocumentStatus.Pending,
        ownerId: childProfileId,
        ownerType: OwnerType.ChildProfile,
        fileUrl: birthCertificate.fileUrl,
        fileName: birthCertificate.fileUrl?.split('/').pop() || 'document',
        fileType: birthCertificate.fileType || 'application/pdf',
        fileSize: undefined,
        version: 1,
        validations: [],
        metadata: birthCertificate.metadata
          ? (birthCertificate.metadata as Record<string, any>)
          : {},
      });

      await ctx.db.patch(childProfileId, {
        documents: {
          birthCertificate: {
            id: documentId,
            fileUrl: birthCertificate.fileUrl,
          },
        },
      });
    }

    if (args.parentalAuthority.profile.residencePermit) {
      const residencePermit = args.parentalAuthority.profile
        .residencePermit as UserDocument;
      const documentId = await ctx.db.insert('documents', {
        type: DocumentType.ResidencePermit,
        status: documentStatusMapping[residencePermit.status] || DocumentStatus.Pending,
        ownerId: childProfileId,
        ownerType: OwnerType.ChildProfile,
        fileUrl: residencePermit.fileUrl,
        fileName: residencePermit.fileUrl?.split('/').pop() || 'document',
        fileType: residencePermit.fileType || 'application/pdf',
        fileSize: undefined,
        version: 1,
        validations: [],
        metadata: residencePermit.metadata
          ? (residencePermit.metadata as Record<string, any>)
          : {},
      });

      await ctx.db.patch(childProfileId, {
        documents: {
          residencePermit: {
            id: documentId,
            fileUrl: residencePermit.fileUrl,
          },
        },
      });
    }

    if (args.parentalAuthority.profile.addressProof) {
      const addressProof = args.parentalAuthority.profile.addressProof as UserDocument;
      const documentId = await ctx.db.insert('documents', {
        type: DocumentType.ProofOfAddress,
        status: documentStatusMapping[addressProof.status] || DocumentStatus.Pending,
        ownerId: childProfileId,
        ownerType: OwnerType.ChildProfile,
        fileUrl: addressProof.fileUrl,
        fileName: addressProof.fileUrl?.split('/').pop() || 'document',
        fileType: addressProof.fileType || 'application/pdf',
        fileSize: undefined,
        version: 1,
        validations: [],
        metadata: addressProof.metadata
          ? (addressProof.metadata as Record<string, any>)
          : {},
      });

      await ctx.db.patch(childProfileId, {
        documents: {
          addressProof: {
            id: documentId,
            fileUrl: addressProof.fileUrl,
          },
        },
      });
    }

    // 4. Importer les demandes (requests)
    if (
      childProfileId &&
      args.parentalAuthority.profile.validationRequestId &&
      args.request
    ) {
      const serviceId = await findConvexServiceByLegacyId(ctx, args.request.serviceId);
      const requesterId = await findConvexUserByLegacyId(ctx, args.request.submittedById);
      const requesterUser = requesterId ? await ctx.db.get(requesterId) : undefined;
      const assignedAgentId = await findConvexMembershipByLegacyId(
        ctx,
        args.request.assignedToId,
      );
      const organizationId = await findConvexOrganizationByLegacyId(
        ctx,
        args.request.organizationId,
      );

      if (
        args.request &&
        serviceId &&
        requesterUser &&
        requesterUser.profileId &&
        organizationId
      ) {
        const [service, requester, profile, organization, assigee] = await Promise.all([
          ctx.db.get(serviceId),
          ctx.db.get(requesterUser.profileId),
          ctx.db.get(childProfileId),
          ctx.db.get(organizationId),
          assignedAgentId ? ctx.db.get(assignedAgentId) : Promise.resolve(undefined),
        ]);

        const activities = await Promise.all(
          (args.request?.actions ?? []).map(async (a: RequestAction) => {
            const actorId = await findConvexUserByLegacyId(ctx, a.userId);
            if (!actorId) {
              console.warn(`Utilisateur ${a.userId} introuvable`);
              return undefined;
            }
            return {
              actorId: actorId ?? ('' as Id<'users'>),
              data: a.data,
              type: mapRequestActionType[a.type] || ActivityType.StatusChanged,
              timestamp: new Date(a.createdAt).getTime(),
            };
          }),
        );

        const requestId = await ctx.db.insert('requests', {
          number: `REQ-${args.request.id.substring(0, 8).toUpperCase()}`,
          status:
            requestStatusMapping[args.request.status as PrismaRequestStatus] ||
            RequestStatus.Pending,
          priority:
            args.request.priority === 'URGENT'
              ? RequestPriority.Urgent
              : RequestPriority.Normal,
          serviceId: serviceId,
          requesterId: requester!._id,
          profileId: profile!._id,
          formData: args.request.formData || {},
          documentIds: [],
          notes: (args.request.notes ?? []).map((n: Note) => ({
            type: (n.type || 'feedback').toString().toLowerCase(),
            authorId: undefined,
            content: n.content || '',
            serviceRequestId: undefined,
          })),
          assignedAgentId: assignedAgentId ?? undefined,
          submittedAt: args.request.submittedAt
            ? new Date(args.request.submittedAt).getTime()
            : undefined,
          completedAt: args.request.completedAt
            ? new Date(args.request.completedAt).getTime()
            : undefined,
          assignedAt: args.request.assignedAt
            ? new Date(args.request.assignedAt).getTime()
            : undefined,
          organizationId: organization!._id,
          countryCode: args.request.countryCode,
          metadata: {
            activities: activities.filter((a) => a !== undefined),
            organization: organization
              ? {
                  name: organization.name,
                  type: organization.type,
                  logo: organization.logo,
                }
              : undefined,
            requester: requester
              ? {
                  firstName: requester.personal?.firstName,
                  lastName: requester.personal?.lastName,
                  email: requester.contacts?.email,
                  phoneNumber: requester.contacts?.phone,
                }
              : undefined,
            profile: profile
              ? {
                  firstName: profile.personal?.firstName,
                  lastName: profile.personal?.lastName,
                  email: requester?.contacts?.email,
                  phoneNumber: requester?.contacts?.phone,
                }
              : undefined,
            service: service
              ? {
                  name: service.name,
                  category: service.category,
                }
              : undefined,
            assignee: assigee
              ? {
                  firstName: assigee.firstName ?? '',
                  lastName: assigee.lastName ?? '',
                }
              : undefined,
          },
          config: {
            processingMode:
              processingModeMapping[
                args.request.processingMode as PrismaProcessingMode
              ] || ProcessingMode.OnlineOnly,
            deliveryMode:
              deliveryModeMapping[args.request.deliveryMode as PrismaDeliveryMode] ||
              DeliveryMode.InPerson,
            deliveryAddress: args.request.deliveryAddress
              ? {
                  street: args.request.deliveryAddress.firstLine || '',
                  complement: args.request.deliveryAddress.secondLine || undefined,
                  city: args.request.deliveryAddress.city || '',
                  postalCode: args.request.deliveryAddress.zipCode || '',
                  state: args.request.deliveryAddress.state || undefined,
                  country: args.request.deliveryAddress.country || 'FR',
                  coordinates: args.request.deliveryAddress.coordinates || undefined,
                }
              : undefined,
            proxy: args.request.proxy
              ? {
                  firstName: args.request.proxy.firstName || '',
                  lastName: args.request.proxy.lastName || '',
                  identityDoc: args.request.proxy.identityDoc || undefined,
                  powerOfAttorneyDoc: args.request.proxy.powerOfAttorneyDoc || undefined,
                }
              : undefined,
          },
          generatedDocuments: [],
        });

        await ctx.db.patch(childProfileId, {
          registrationRequest: requestId,
        });
      }
    }

    importedCount++;

    return {
      importedCount,
    };
  },
});

export const importNonUsersAccounts = mutation({
  args: {
    accounts: v.array(
      v.object({
        id: v.string(),
        clerkId: v.optional(v.union(v.string(), v.null())),
        name: v.optional(v.union(v.string(), v.null())),
        email: v.optional(v.union(v.string(), v.null())),
        phoneNumber: v.optional(v.union(v.string(), v.null())),
        roles: v.array(v.string()),
        organizationId: v.optional(v.union(v.string(), v.null())),
        assignedOrganizationId: v.optional(v.union(v.string(), v.null())),
        assignedCountries: v.optional(v.array(countryCodeValidator)),
        notifications: v.optional(
          v.array(
            v.object({
              id: v.optional(v.string()),
              type: v.string(),
              title: v.string(),
              message: v.string(),
              status: v.string(),
              read: v.optional(v.boolean()),
              createdAt: v.any(),
            }),
          ),
        ),
        managedByUserId: v.optional(v.union(v.string(), v.null())),
        managedAgentIds: v.optional(v.array(v.string())),
      }),
    ),
  },
  returns: v.object({
    importedCount: v.number(),
    userIds: v.array(v.id('users')),
    membershipsCreated: v.number(),
    notificationsCreated: v.number(),
  }),
  handler: async (ctx: MutationCtx, args) => {
    const importedUserIds: Array<Id<'users'>> = [];
    let membershipsCreated = 0;
    let notificationsCreated = 0;

    for (const account of args.accounts) {
      try {
        const prismaRoles: Array<string> = account.roles || [];
        const mappedRoles: Array<UserRole> = prismaRoles
          .map((r) => roleMapping[r as PrismaUserRole])
          .filter((r): r is UserRole => Boolean(r) && r !== UserRole.User);

        const userId = await ctx.db.insert('users', {
          userId: account.clerkId || `temp_${account.id}`,
          legacyId: account.id,
          firstName: account.name ? account.name.split(' ')[0] : '',
          lastName: account.name ? account.name.split(' ').slice(1).join(' ') || '' : '',
          email: account.email || '',
          phoneNumber: account.phoneNumber || '',
          roles: mappedRoles.length > 0 ? mappedRoles : [UserRole.Admin],
          status: UserStatus.Active,
        });

        importedUserIds.push(userId);

        // Notifications
        if (account.notifications && account.notifications.length > 0) {
          for (const notif of account.notifications) {
            try {
              await ctx.db.insert('notifications', {
                userId,
                type: notificationTypeMapping[notif.type] || NotificationType.Updated,
                title: notif.title,
                content: notif.message,
                channels: [NotificationChannel.App],
                deliveryStatus: {
                  appAt: notif.read ? new Date(notif.createdAt).getTime() : undefined,
                },
                readAt: notif.read
                  ? new Date(notif.createdAt).getTime() + 1000
                  : undefined,
              });
              notificationsCreated++;
            } catch (error) {
              console.error(`Erreur import notification ${notif.id || ''}:`, error);
            }
          }
        }

        const legacyOrgId =
          account.organizationId || account.assignedOrganizationId || null;
        if (legacyOrgId) {
          const orgId = await findConvexOrganizationByLegacyOrCode(ctx, legacyOrgId);
          if (orgId) {
            await ctx.db.insert('memberships', {
              userId,
              organizationId: orgId,
              role: (mappedRoles[0] as UserRole) || UserRole.Agent,
              permissions: [] as Array<
                | UserPermission.ProfileRead
                | UserPermission.ProfileWrite
                | UserPermission.ProfileDelete
                | UserPermission.RequestRead
                | UserPermission.RequestWrite
                | UserPermission.RequestDelete
              >,
              status: MembershipStatus.Active,
              assignedCountries: (account.assignedCountries &&
              account.assignedCountries.length > 0
                ? account.assignedCountries
                : []) as CountryCode[],
              managerId: account.managedByUserId
                ? ((await findConvexUserByLegacyId(
                    ctx,
                    account.managedByUserId,
                  )) as Id<'users'>)
                : undefined,
              assignedServices: [] as Id<'services'>[],
              joinedAt: Date.now(),
              leftAt: undefined,
              lastActiveAt: undefined,
            });
            membershipsCreated++;

            // Mettre à jour l'organisation (memberIds)
            const org = await ctx.db.get(orgId);
            if (org) {
              const memberIds = Array.isArray(org.memberIds) ? org.memberIds : [];
              if (!memberIds.find((m) => m === userId)) {
                await ctx.db.patch(orgId, { memberIds: [...memberIds, userId] });
              }
            }
          } else {
            console.warn(
              `⚠️ Organisation ${legacyOrgId} introuvable pour le compte ${account.id}`,
            );
          }
        }
      } catch (error) {
        console.error(`❌ Erreur import compte non utilisateur ${account.id}:`, error);
      }
    }

    return {
      importedCount: importedUserIds.length,
      userIds: importedUserIds,
      membershipsCreated,
      notificationsCreated,
    };
  },
});

// Fonctions helper pour trouver les IDs Convex
async function findConvexServiceByLegacyId(
  ctx: MutationCtx,
  legacyId: string,
): Promise<Id<'services'> | undefined> {
  const service = await ctx.db
    .query('services')
    .filter((q) => q.eq(q.field('legacyId'), legacyId))
    .first();
  return service?._id;
}

async function findConvexOrganizationByLegacyId(
  ctx: MutationCtx,
  legacyId: string,
): Promise<Id<'organizations'> | undefined> {
  const org = await ctx.db
    .query('organizations')
    .filter((q) => q.eq(q.field('legacyId'), legacyId))
    .first();
  return org?._id;
}

async function findConvexOrganizationByLegacyOrCode(
  ctx: MutationCtx,
  legacyId: string,
): Promise<Id<'organizations'> | undefined> {
  const byLegacy = await ctx.db
    .query('organizations')
    .filter((q) => q.eq(q.field('legacyId'), legacyId))
    .first();
  if (byLegacy) return byLegacy._id as Id<'organizations'>;

  const code = legacyId.substring(0, 8).toUpperCase();
  const byCode = await ctx.db
    .query('organizations')
    .filter((q) => q.eq(q.field('code'), code))
    .first();
  return byCode?._id as Id<'organizations'> | undefined;
}

async function findConvexUserByLegacyId(
  ctx: MutationCtx,
  legacyId: string,
): Promise<Id<'users'> | undefined> {
  const user = await ctx.db
    .query('users')
    .filter((q) => q.eq(q.field('legacyId'), legacyId))
    .first();
  return user?._id;
}

async function findConvexMembershipByLegacyId(
  ctx: MutationCtx,
  legacyId: string,
): Promise<Id<'memberships'> | undefined> {
  const userId = await findConvexUserByLegacyId(ctx, legacyId);
  if (!userId) {
    return undefined;
  }

  const membership = await ctx.db
    .query('memberships')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first();

  return membership?._id;
}

async function getUserByLegacyId(ctx: MutationCtx, legacyId: string) {
  const user = await ctx.db
    .query('users')
    .filter((q) => q.eq(q.field('legacyId'), legacyId))
    .first();
  return user;
}

async function findConvexRequestByLegacyId(
  ctx: MutationCtx,
  legacyId: string,
): Promise<Id<'requests'> | undefined> {
  // La table `requests` n'a pas de champ `legacyId`; on mappe via `number`
  const number = legacyId.substring(0, 12).toUpperCase();
  const request = await ctx.db
    .query('requests')
    .filter((q) => q.eq(q.field('number'), number))
    .first();
  return request?._id;
}

async function getProfileByLegacyUserId(ctx: MutationCtx, userId: string) {
  const user = await getUserByLegacyId(ctx, userId);
  if (!user) {
    return undefined;
  }

  const profile = await ctx.db
    .query('profiles')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .first();

  return { profile, user };
}
