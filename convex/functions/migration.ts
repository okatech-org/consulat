import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import {
  AppointmentStatus,
  AppointmentType,
  CountryStatus,
  DocumentStatus,
  DocumentType,
  Gender,
  MaritalStatus,
  NationalityAcquisition,
  NotificationStatus,
  NotificationType,
  OrganizationStatus,
  OrganizationType,
  ProfileCategory,
  ProfileStatus,
  RequestStatus,
  ServiceCategory,
  ServiceStatus,
  UserRole,
  UserStatus,
  MembershipStatus,
  WorkStatus,
} from '../lib/constants';
import type { Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';

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
const roleMapping: { [key: string]: UserRole } = {
  USER: UserRole.User,
  AGENT: UserRole.Agent,
  ADMIN: UserRole.Admin,
  SUPER_ADMIN: UserRole.SuperAdmin,
  MANAGER: UserRole.Manager,
  INTEL_AGENT: UserRole.IntelAgent,
  EDUCATION_AGENT: UserRole.EducationAgent,
};

const profileCategoryMapping: { [key: string]: ProfileCategory } = {
  ADULT: ProfileCategory.Adult,
  MINOR: ProfileCategory.Minor,
};

const profileStatusMapping: { [key: string]: ProfileStatus } = {
  ACTIVE: ProfileStatus.Active,
  INACTIVE: ProfileStatus.Inactive,
  PENDING: ProfileStatus.Pending,
  SUSPENDED: ProfileStatus.Suspended,
  DRAFT: ProfileStatus.Pending,
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

const requestStatusMapping: { [key: string]: RequestStatus } = {
  EDITED: RequestStatus.Edited,
  DRAFT: RequestStatus.Draft,
  SUBMITTED: RequestStatus.Submitted,
  PENDING: RequestStatus.Pending,
  PENDING_COMPLETION: RequestStatus.PendingCompletion,
  VALIDATED: RequestStatus.Validated,
  REJECTED: RequestStatus.Rejected,
  CARD_IN_PRODUCTION: RequestStatus.InProduction,
  DOCUMENT_IN_PRODUCTION: RequestStatus.InProduction,
  READY_FOR_PICKUP: RequestStatus.ReadyForPickup,
  APPOINTMENT_SCHEDULED: RequestStatus.AppointmentScheduled,
  COMPLETED: RequestStatus.Completed,
};

const documentTypeMapping: { [key: string]: DocumentType } = {
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

const appointmentStatusMapping: { [key: string]: AppointmentStatus } = {
  PENDING: AppointmentStatus.Pending,
  CONFIRMED: AppointmentStatus.Confirmed,
  CANCELLED: AppointmentStatus.Cancelled,
  COMPLETED: AppointmentStatus.Completed,
  MISSED: AppointmentStatus.Missed,
  RESCHEDULED: AppointmentStatus.Rescheduled,
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

const notificationStatusMapping: { [key: string]: NotificationStatus } = {
  PENDING: NotificationStatus.Pending,
  SENT: NotificationStatus.Sent,
  READ: NotificationStatus.Read,
  FAILED: NotificationStatus.Failed,
};

const countryStatusMapping: { [key: string]: CountryStatus } = {
  ACTIVE: CountryStatus.Active,
  INACTIVE: CountryStatus.Inactive,
};

const organizationTypeMapping: { [key: string]: OrganizationType } = {
  EMBASSY: OrganizationType.Embassy,
  CONSULATE: OrganizationType.Consulate,
  GENERAL_CONSULATE: OrganizationType.GeneralConsulate,
  HONORARY_CONSULATE: OrganizationType.HonoraryConsulate,
  THIRD_PARTY: OrganizationType.ThirdParty,
};

const organizationStatusMapping: { [key: string]: OrganizationStatus } = {
  ACTIVE: OrganizationStatus.Active,
  INACTIVE: OrganizationStatus.Inactive,
  SUSPENDED: OrganizationStatus.Suspended,
};

const serviceStatusMapping: { [key: string]: ServiceStatus } = {
  ACTIVE: ServiceStatus.Active,
  INACTIVE: ServiceStatus.Inactive,
  SUSPENDED: ServiceStatus.Suspended,
};

// Mapping des modes de livraison (Prisma enums -> Convex strings)
const deliveryModeMapping: {
  [key: string]: 'in_person' | 'postal' | 'electronic' | 'by_proxy';
} = {
  IN_PERSON: 'in_person',
  POSTAL: 'postal',
  ELECTRONIC: 'electronic',
  BY_PROXY: 'by_proxy',
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
      countryCode: string;
      config: CountrySettings;
    }> = [];

    for (const postgresOrg of args.organizations) {
      try {
        // Extraire les codes pays du metadata si disponible
        let countryIds: Array<string> = [];
        let parsedMetadata: Record<string, { settings?: CountrySettings }> | null = null;

        if (postgresOrg.metadata) {
          try {
            // Parser le metadata s'il est une chaîne JSON
            parsedMetadata =
              typeof postgresOrg.metadata === 'string'
                ? (JSON.parse(postgresOrg.metadata) as Record<
                    string,
                    { settings?: CountrySettings }
                  >)
                : (postgresOrg.metadata as Record<
                    string,
                    { settings?: CountrySettings }
                  >);

            if (parsedMetadata && typeof parsedMetadata === 'object') {
              // Si metadata contient des clés de codes pays (FR, PM, WF, etc.)
              countryIds = Object.keys(parsedMetadata).filter(
                (key) => key.length === 2 && key.match(/^[A-Z]{2}$/),
              );
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
          type: organizationTypeMapping[postgresOrg.type],
          status: organizationStatusMapping[postgresOrg.status],
          countryIds: countryIds,
          memberIds: [],
          serviceIds: [],
          childIds: [],
          settings: orgCountryConfigs.map((config) => ({
            appointmentSettings: postgresOrg.appointmentSettings || {},
            workflowSettings: postgresOrg.workflowSettings || {},
            notificationSettings: postgresOrg.notificationSettings || {},
            countryCode: config.countryCode,
            consularCard: config.config.consularCard,
            contact: config.config.contact
              ? {
                  address: config.config.contact.address
                    ? {
                        street: config.config.contact.address.firstLine || '',
                        city: config.config.contact.address.city || '',
                        postalCode: config.config.contact.address.zipCode || '',
                        country: config.config.contact.address.country || '',
                      }
                    : undefined,
                  phone: config.config.contact.phone,
                  email: config.config.contact.email,
                  website: config.config.contact.website,
                }
              : undefined,
            schedule: config.config.schedule
              ? {
                  monday: {
                    isOpen: Boolean(config.config.schedule.monday?.isOpen),
                    slots: (config.config.schedule.monday?.slots || []).map((s) => ({
                      start: s.start ?? '',
                      end: s.end ?? '',
                    })),
                  },
                  tuesday: {
                    isOpen: Boolean(config.config.schedule.tuesday?.isOpen),
                    slots: (config.config.schedule.tuesday?.slots || []).map((s) => ({
                      start: s.start ?? '',
                      end: s.end ?? '',
                    })),
                  },
                  wednesday: {
                    isOpen: Boolean(config.config.schedule.wednesday?.isOpen),
                    slots: (config.config.schedule.wednesday?.slots || []).map((s) => ({
                      start: s.start ?? '',
                      end: s.end ?? '',
                    })),
                  },
                  thursday: {
                    isOpen: Boolean(config.config.schedule.thursday?.isOpen),
                    slots: (config.config.schedule.thursday?.slots || []).map((s) => ({
                      start: s.start ?? '',
                      end: s.end ?? '',
                    })),
                  },
                  friday: {
                    isOpen: Boolean(config.config.schedule.friday?.isOpen),
                    slots: (config.config.schedule.friday?.slots || []).map((s) => ({
                      start: s.start ?? '',
                      end: s.end ?? '',
                    })),
                  },
                  saturday: {
                    isOpen: Boolean(config.config.schedule.saturday?.isOpen),
                    slots: (config.config.schedule.saturday?.slots || []).map((s) => ({
                      start: s.start ?? '',
                      end: s.end ?? '',
                    })),
                  },
                  sunday: {
                    isOpen: Boolean(config.config.schedule.sunday?.isOpen),
                    slots: (config.config.schedule.sunday?.slots || []).map((s) => ({
                      start: s.start ?? '',
                      end: s.end ?? '',
                    })),
                  },
                }
              : undefined,
            holidays: (config.config.holidays || []).map((h) => new Date(h).getTime()),
            closures: (config.config.closures || []).map((c) => new Date(c).getTime()),
          })),
          legacyId: postgresOrg.id,
          metadata: postgresOrg.metadata || {},
          updatedAt: new Date(postgresOrg.updatedAt).getTime(),
        });

        importedOrgs.push(orgId);

        // Préparer les configurations par pays
        if (parsedMetadata && typeof parsedMetadata === 'object') {
          for (const countryCode of countryIds) {
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
          `✅ Organisation importée: ${postgresOrg.name} (${countryIds.length} pays)`,
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
        code: v.string(),
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
          status: countryStatusMapping[postgresCountry.status],
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

    const importedServices: Array<Id<'services'>> = [];
    const importedLegacyIds: Array<string> = [];

    for (const service of args.services) {
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

        const serviceId = await ctx.db.insert('services', {
          code: service.code || `SVC_${service.id.substring(0, 8).toUpperCase()}`,
          name: service.name,
          description: service.description || undefined,
          category: serviceCategoryMapping[service.category] || ServiceCategory.Other,
          status: serviceStatusMapping[service.status] || ServiceStatus.Active,
          organizationId: organization._id,
          config: {
            requiredDocuments: service.requiredDocuments || [],
            optionalDocuments: service.optionalDocuments || [],
            steps: [],
            pricing:
              service.price && !service.isFree
                ? {
                    amount: service.price,
                    currency: service.currency || 'EUR',
                  }
                : undefined,
          },
          steps: [],
          processingMode: 'online_only',
          deliveryModes: (service.deliveryMode || []).map(
            (m: string) => deliveryModeMapping[m] || 'in_person',
          ) || ['in_person'],
          requiresAppointment: service.requiresAppointment || false,
          appointmentDuration: service.appointmentDuration || undefined,
          appointmentInstructions: service.appointmentInstructions || undefined,
          deliveryAppointment: false,
          deliveryAppointmentDuration: undefined,
          deliveryAppointmentDesc: undefined,
          isFree: service.isFree !== undefined ? service.isFree : true,
          price: service.price || undefined,
          currency: service.currency || 'EUR',
          workflowId: undefined,
          createdAt: new Date(service.createdAt).getTime(),
          updatedAt: new Date(service.updatedAt).getTime(),
          legacyId: service.id,
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
    user: v.any(),
    profile: v.optional(v.any()),
    documents: v.optional(v.array(v.any())),
    requests: v.optional(v.array(v.any())),
    appointments: v.optional(v.array(v.any())),
    notifications: v.optional(v.array(v.any())),
    feedbacks: v.optional(v.array(v.any())),
    childAuthorities: v.optional(
      v.array(
        v.object({
          id: v.string(),
          profileId: v.string(),
          parentUserId: v.string(),
          role: v.string(),
          isActive: v.optional(v.boolean()),
          createdAt: v.optional(v.any()),
          updatedAt: v.optional(v.any()),
        }),
      ),
    ),
  },
  returns: v.object({
    userId: v.id('users'),
    recordsImported: v.number(),
  }),
  handler: async (ctx: MutationCtx, args) => {
    let recordCount = 0;

    // 1. Créer l'utilisateur
    const userId = await ctx.db.insert('users', {
      userId: args.user.clerkId || `temp_${args.user.id}`,
      legacyId: args.user.id,
      firstName: args.user.name?.split(' ')[0] || '',
      lastName: args.user.name?.split(' ').slice(1).join(' ') || '',
      email: args.user.email || '',
      phoneNumber: args.user.phoneNumber || '',
      roles: args.user.roles?.map((role: string) => roleMapping[role]) || [UserRole.User],
      status: UserStatus.Active,
      countryCode: args.user.countryCode || '',
    });
    recordCount++;

    // 2. Créer le profil si présent
    let profileId: Id<'profiles'> | undefined = undefined;
    if (args.profile) {
      profileId = await ctx.db.insert('profiles', {
        userId: userId,
        documentIds: [],
        category: profileCategoryMapping[args.profile.category] || ProfileCategory.Adult,
        status: profileStatusMapping[args.profile.status] || ProfileStatus.Pending,
        residenceCountry: args.profile.residenceCountyCode || undefined,
        consularCard: {
          cardNumber: args.profile.cardNumber || undefined,
          cardPin: args.profile.cardPin || undefined,
          cardIssuedAt: args.profile.cardIssuedAt
            ? new Date(args.profile.cardIssuedAt).getTime()
            : undefined,
          cardExpiresAt: args.profile.cardExpiresAt
            ? new Date(args.profile.cardExpiresAt).getTime()
            : undefined,
        },
        contacts: {
          email: args.profile.email || undefined,
          phone: args.profile.phoneNumber || undefined,
        },
        personal: {
          firstName: args.profile.firstName || '',
          lastName: args.profile.lastName || '',
          birthDate: args.profile.birthDate
            ? new Date(args.profile.birthDate).getTime()
            : undefined,
          birthPlace: args.profile.birthPlace || undefined,
          birthCountry: args.profile.birthCountry || undefined,
          gender: args.profile.gender ? genderMapping[args.profile.gender] : undefined,
          nationality: args.profile.nationality || 'GA',
          maritalStatus: args.profile.maritalStatus
            ? maritalStatusMapping[args.profile.maritalStatus]
            : MaritalStatus.Single,
          workStatus: args.profile.workStatus
            ? workStatusMapping[args.profile.workStatus]
            : WorkStatus.Unemployed,
          acquisitionMode: args.profile.acquisitionMode
            ? nationalityAcquisitionMapping[args.profile.acquisitionMode]
            : NationalityAcquisition.Birth,
          address: args.profile.address
            ? {
                street: args.profile.address.firstLine || '',
                complement: args.profile.address.secondLine || undefined,
                city: args.profile.address.city || '',
                postalCode: args.profile.address.zipCode || '',
                state: undefined,
                country: args.profile.address.country || 'FR',
                coordinates: undefined,
              }
            : undefined,
        },
        family: {
          father: args.profile.fatherFullName
            ? {
                firstName: args.profile.fatherFullName.split(' ')[0] || undefined,
                lastName:
                  args.profile.fatherFullName.split(' ').slice(1).join(' ') || undefined,
              }
            : undefined,
          mother: args.profile.motherFullName
            ? {
                firstName: args.profile.motherFullName.split(' ')[0] || undefined,
                lastName:
                  args.profile.motherFullName.split(' ').slice(1).join(' ') || undefined,
              }
            : undefined,
          spouse: args.profile.spouseFullName
            ? {
                firstName: args.profile.spouseFullName.split(' ')[0] || undefined,
                lastName:
                  args.profile.spouseFullName.split(' ').slice(1).join(' ') || undefined,
              }
            : undefined,
        },
        emergencyContacts: [],
        professionSituation: {
          profession: args.profile.profession || undefined,
          employer: args.profile.employer || undefined,
          employerAddress: args.profile.employerAddress || undefined,
        },
      });
      recordCount++;

      // Mettre à jour l'utilisateur avec le profileId
      await ctx.db.patch(userId, { profileId });
    }

    // 3. Importer les documents
    if (args.documents && args.documents.length > 0) {
      for (const doc of args.documents) {
        try {
          await ctx.db.insert('documents', {
            type: documentTypeMapping[doc.type] || 'other',
            status: documentStatusMapping[doc.status] || DocumentStatus.Pending,
            ownerId: profileId || userId,
            ownerType: profileId ? 'profile' : 'user',
            fileUrl: doc.fileUrl,
            fileName: doc.fileUrl?.split('/').pop() || 'document',
            fileType: doc.fileType || 'application/pdf',
            fileSize: undefined,
            version: 1,
            validations: [],
            issuedAt: doc.issuedAt ? new Date(doc.issuedAt).getTime() : undefined,
            expiresAt: doc.expiresAt ? new Date(doc.expiresAt).getTime() : undefined,
            metadata: doc.metadata || {},
          });
          recordCount++;
        } catch (error) {
          console.error(`Erreur import document ${doc.id}:`, error);
        }
      }
    }

    // 4. Importer les demandes (requests)
    if (args.requests && args.requests.length > 0) {
      for (const req of args.requests) {
        try {
          const serviceId = await findConvexServiceByLegacyId(ctx, req.serviceId);

          if (serviceId) {
            await ctx.db.insert('requests', {
              number: req.id.substring(0, 12).toUpperCase(),
              status: requestStatusMapping[req.status] || RequestStatus.Pending,
              priority: req.priority === 'URGENT' ? 1 : 0,
              serviceId: serviceId,
              requesterId: userId,
              profileId: profileId,
              formData: req.formData || {},
              documentIds: [],
              activities: [],
              actions: [],
              assignedToId: req.assignedToId
                ? await findConvexUserByLegacyId(ctx, req.assignedToId)
                : undefined,
              assignedAt: req.assignedAt ? new Date(req.assignedAt).getTime() : undefined,
              submittedAt: req.submittedAt
                ? new Date(req.submittedAt).getTime()
                : undefined,
              completedAt: req.completedAt
                ? new Date(req.completedAt).getTime()
                : undefined,
              updatedAt: new Date(req.updatedAt).getTime(),
            });
            recordCount++;
          }
        } catch (error) {
          console.error(`Erreur import request ${req.id}:`, error);
        }
      }
    }

    // 5. Importer les rendez-vous (appointments)
    if (args.appointments && args.appointments.length > 0) {
      for (const apt of args.appointments) {
        try {
          const organizationId = await findConvexOrganizationByLegacyId(
            ctx,
            apt.organizationId,
          );

          if (organizationId) {
            await ctx.db.insert('appointments', {
              startAt: new Date(apt.startTime || apt.date).getTime(),
              endAt: new Date(apt.endTime || apt.date).getTime() + 60 * 60 * 1000,
              timezone: 'Europe/Paris',
              type: appointmentTypeMapping[apt.type] || AppointmentType.Other,
              status: appointmentStatusMapping[apt.status] || AppointmentStatus.Pending,
              organizationId: organizationId,
              serviceId: apt.serviceId
                ? await findConvexServiceByLegacyId(ctx, apt.serviceId)
                : undefined,
              requestId: apt.requestId
                ? await findConvexRequestByLegacyId(ctx, apt.requestId)
                : undefined,
              participants: [
                {
                  userId: userId,
                  role: 'attendee',
                  status: 'confirmed',
                },
              ],
              createdAt: new Date(apt.createdAt).getTime(),
              updatedAt: new Date(apt.updatedAt).getTime(),
              cancelledAt: apt.cancelledAt
                ? new Date(apt.cancelledAt).getTime()
                : undefined,
            });
            recordCount++;
          }
        } catch (error) {
          console.error(`Erreur import appointment ${apt.id}:`, error);
        }
      }
    }

    // 6. Importer les notifications
    if (args.notifications && args.notifications.length > 0) {
      for (const notif of args.notifications) {
        try {
          await ctx.db.insert('notifications', {
            userId: userId,
            type: notificationTypeMapping[notif.type] || NotificationType.Updated,
            title: notif.title,
            content: notif.message,
            status: notificationStatusMapping[notif.status] || NotificationStatus.Pending,
            channels: ['app', 'email'],
            deliveryStatus: {
              app: notif.read || false,
              email: false,
              sms: false,
            },
            readAt: notif.read ? new Date(notif.createdAt).getTime() + 1000 : undefined,
            createdAt: new Date(notif.createdAt).getTime(),
          });
          recordCount++;
        } catch (error) {
          console.error(`Erreur import notification ${notif.id}:`, error);
        }
      }
    }

    // 7. Importer les autorités parentales (parentalAuthorities)
    if (args.childAuthorities && args.childAuthorities.length > 0) {
      for (const pa of args.childAuthorities) {
        try {
          // Trouver le user parent Convex par legacyId
          const parentConvexUserId = await findConvexUserByLegacyId(ctx, pa.parentUserId);
          if (!parentConvexUserId || !profileId) continue;

          await ctx.db.insert('parentalAuthorities', {
            profileId: profileId,
            parentUserId: parentConvexUserId,
            role:
              pa.role === 'FATHER'
                ? 'father'
                : pa.role === 'MOTHER'
                  ? 'mother'
                  : 'legal_guardian',
            isActive: pa.isActive ?? true,
            sharedRequests: [],
          });
          recordCount++;
        } catch (error) {
          console.error(`Erreur import parentalAuthority ${pa.id}:`, error);
        }
      }
    }

    return {
      userId,
      recordsImported: recordCount,
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
        assignedCountries: v.optional(v.array(v.string())),
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
          .map((r) => roleMapping[r])
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
          countryCode: undefined,
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
                status:
                  notificationStatusMapping[notif.status] || NotificationStatus.Pending,
                channels: ['app'],
                deliveryStatus: { app: notif.read || false },
                readAt: notif.read
                  ? new Date(notif.createdAt).getTime() + 1000
                  : undefined,
                createdAt: new Date(notif.createdAt).getTime(),
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
            const managerIds = account.managedByUserId
              ? [
                  (await findConvexUserByLegacyId(
                    ctx,
                    account.managedByUserId,
                  )) as Id<'users'>,
                ]
              : [];
            const agentIds = account.managedAgentIds
              ? ((await Promise.all(
                  account.managedAgentIds.map((id) => findConvexUserByLegacyId(ctx, id)),
                )) as Id<'users'>[])
              : [];
            await ctx.db.insert('memberships', {
              userId,
              organizationId: orgId,
              role: (mappedRoles[0] as UserRole) || UserRole.Agent,
              permissions: [] as string[],
              status: MembershipStatus.Active,
              assignedCountries: (account.assignedCountries &&
              account.assignedCountries.length > 0
                ? account.assignedCountries
                : []) as string[],
              managerIds: managerIds,
              agentIds: agentIds,
              assignedServices: [] as Id<'services'>[],
              joinedAt: Date.now(),
              leftAt: undefined,
              lastActiveAt: undefined,
              createdAt: Date.now(),
              updatedAt: Date.now(),
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
