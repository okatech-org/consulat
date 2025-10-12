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
  WorkStatus,
} from '../lib/constants';
import type { Id } from '../_generated/dataModel';

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

export const importOrganizations = mutation({
  args: {
    organizations: v.array(v.any()),
  },
  returns: v.object({
    importedCount: v.number(),
    orgIds: v.array(v.id('organizations')),
    configsImported: v.number(),
  }),
  handler: async (ctx, args) => {
    console.log(`🚀 Import de ${args.organizations.length} organisations...`);

    const importedOrgs: Array<Id<'organizations'>> = [];
    const orgCountryConfigs: Array<{
      orgId: Id<'organizations'>;
      countryCode: string;
      config: any;
    }> = [];

    for (const postgresOrg of args.organizations) {
      try {
        // Extraire les codes pays du metadata si disponible
        let countryIds: Array<string> = [];
        let parsedMetadata: any = null;

        if (postgresOrg.metadata) {
          try {
            // Parser le metadata s'il est une chaîne JSON
            parsedMetadata =
              typeof postgresOrg.metadata === 'string'
                ? JSON.parse(postgresOrg.metadata)
                : postgresOrg.metadata;

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
          settings: {
            appointmentSettings: postgresOrg.appointmentSettings || {},
            workflowSettings: {},
            notificationSettings: {},
          },
          metadata: postgresOrg.metadata || {},
          createdAt: new Date(postgresOrg.createdAt).getTime(),
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
                config: countryConfig.settings,
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

    // Importer les configurations par pays
    console.log(`🔧 Import de ${orgCountryConfigs.length} configurations par pays...`);
    let importedConfigs = 0;
    for (const { orgId, countryCode, config } of orgCountryConfigs) {
      try {
        await ctx.db.insert('organizationCountryConfigs', {
          organizationId: orgId,
          countryCode,
          contact: {
            address: {
              street: config.contact?.address?.firstLine || '',
              city: config.contact?.address?.city || '',
              postalCode: config.contact?.address?.zipCode || '',
              country: config.contact?.address?.country || '',
            },
            phone: config.contact?.phone || '',
            email: config.contact?.email || '',
            website: config.contact?.website || undefined,
          },
          schedule: {
            monday: {
              isOpen: config.schedule?.monday?.isOpen || false,
              slots: config.schedule?.monday?.slots || [],
            },
            tuesday: {
              isOpen: config.schedule?.tuesday?.isOpen || false,
              slots: config.schedule?.tuesday?.slots || [],
            },
            wednesday: {
              isOpen: config.schedule?.wednesday?.isOpen || false,
              slots: config.schedule?.wednesday?.slots || [],
            },
            thursday: {
              isOpen: config.schedule?.thursday?.isOpen || false,
              slots: config.schedule?.thursday?.slots || [],
            },
            friday: {
              isOpen: config.schedule?.friday?.isOpen || false,
              slots: config.schedule?.friday?.slots || [],
            },
            saturday: {
              isOpen: config.schedule?.saturday?.isOpen || false,
              slots: config.schedule?.saturday?.slots || [],
            },
            sunday: {
              isOpen: config.schedule?.sunday?.isOpen || false,
              slots: config.schedule?.sunday?.slots || [],
            },
          },
          holidays: config.holidays || [],
          closures: config.closures || [],
          consularCard: {
            rectoModelUrl: config.consularCard?.rectoModelUrl || undefined,
            versoModelUrl: config.consularCard?.versoModelUrl || undefined,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        importedConfigs++;
      } catch (error) {
        console.error(`❌ Erreur import config ${countryCode} pour org ${orgId}:`, error);
      }
    }

    console.log(`✅ ${importedOrgs.length} organisations importées`);
    console.log(`✅ ${importedConfigs} configurations par pays importées`);
    return {
      importedCount: importedOrgs.length,
      orgIds: importedOrgs,
      configsImported: importedConfigs,
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
        createdAt: v.any(),
        updatedAt: v.any(),
      }),
    ),
  },
  returns: v.object({
    importedCount: v.number(),
    countryIds: v.array(v.id('countries')),
  }),
  handler: async (ctx, args) => {
    console.log(`🚀 Import de ${args.countries.length} pays...`);

    const importedCountries: Array<Id<'countries'>> = [];

    for (const postgresCountry of args.countries) {
      try {
        const countryId = await ctx.db.insert('countries', {
          name: postgresCountry.name,
          code: postgresCountry.code,
          status: countryStatusMapping[postgresCountry.status],
          flag: postgresCountry.flag || undefined,
          createdAt: new Date(postgresCountry.createdAt).getTime(),
          updatedAt: new Date(postgresCountry.updatedAt).getTime(),
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
  }),
  handler: async (ctx, args) => {
    console.log(`🚀 Import de ${args.services.length} services...`);

    const importedServices: Array<Id<'services'>> = [];

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
          deliveryModes: service.deliveryMode || ['in_person'],
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
    childAuthorities: v.optional(v.array(v.any())),
  },
  returns: v.object({
    userId: v.id('users'),
    recordsImported: v.number(),
  }),
  handler: async (ctx, args) => {
    let recordCount = 0;

    // 1. Créer l'utilisateur
    const userId = await ctx.db.insert('users', {
      userId: args.user.clerkId || `temp_${args.user.id}`,
      legacyId: args.user.id,
      firstName: args.user.name?.split(' ')[0] || undefined,
      lastName: args.user.name?.split(' ').slice(1).join(' ') || undefined,
      email: args.user.email || undefined,
      phoneNumber: args.user.phoneNumber || undefined,
      roles: args.user.roles?.map((role: string) => roleMapping[role]) || [UserRole.User],
      status: UserStatus.Active,
      countryCode: args.user.countryCode || undefined,
      createdAt: new Date(args.user.createdAt).getTime(),
      updatedAt: new Date(args.user.updatedAt).getTime(),
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
        createdAt: new Date(args.profile.createdAt).getTime(),
        updatedAt: new Date(args.profile.updatedAt).getTime(),
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
            createdAt: new Date(doc.createdAt).getTime(),
            updatedAt: new Date(doc.updatedAt).getTime(),
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
              createdAt: new Date(req.createdAt).getTime(),
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

    return {
      userId,
      recordsImported: recordCount,
    };
  },
});

// Fonctions helper pour trouver les IDs Convex
async function findConvexServiceByLegacyId(
  ctx: any,
  legacyId: string,
): Promise<Id<'services'> | undefined> {
  const service = await ctx.db
    .query('services')
    .filter((q: any) => q.eq(q.field('legacyId'), legacyId))
    .first();
  return service?._id;
}

async function findConvexOrganizationByLegacyId(
  ctx: any,
  legacyId: string,
): Promise<Id<'organizations'> | undefined> {
  const org = await ctx.db
    .query('organizations')
    .filter((q: any) => q.eq(q.field('legacyId'), legacyId))
    .first();
  return org?._id;
}

async function findConvexUserByLegacyId(
  ctx: any,
  legacyId: string,
): Promise<Id<'users'> | undefined> {
  const user = await ctx.db
    .query('users')
    .filter((q: any) => q.eq(q.field('legacyId'), legacyId))
    .first();
  return user?._id;
}

async function findConvexRequestByLegacyId(
  ctx: any,
  legacyId: string,
): Promise<Id<'requests'> | undefined> {
  const request = await ctx.db
    .query('requests')
    .filter((q: any) => q.eq(q.field('legacyId'), legacyId))
    .first();
  return request?._id;
}
