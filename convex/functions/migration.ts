import { v } from "convex/values";
import { mutation } from "../_generated/server";
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
  UserRole,
  UserStatus,
  WorkStatus,
} from "../lib/constants";
import type { Id } from "../_generated/dataModel";

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

const nationalityAcquisitionMapping: { [key: string]: NationalityAcquisition } =
  {
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

export const importUsers = mutation({
  args: {
    users: v.array(v.any()),
    batchSize: v.optional(v.number()),
  },
  returns: v.object({
    importedCount: v.number(),
    userIds: v.array(v.id("users")),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 50;
    console.log(
      `🚀 Import de ${args.users.length} utilisateurs par lots de ${batchSize}...`
    );

    const importedUsers: Array<Id<"users">> = [];

    // Traiter par lots
    for (let i = 0; i < args.users.length; i += batchSize) {
      const batch = args.users.slice(i, i + batchSize);
      console.log(
        `📦 Traitement du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(args.users.length / batchSize)} (${batch.length} utilisateurs)`
      );

      for (const postgresUser of batch) {
        try {
          // Créer l'utilisateur avec les données de base
          const userId = await ctx.db.insert("users", {
            // ID temporaire (sera remplacé par l'ID Clerk plus tard)
            userId: `temp_${postgresUser.id}`,
            // ID legacy pour référence
            legacyId: postgresUser.id,
            // Données de base
            firstName: postgresUser.name?.split(" ")[0] || undefined,
            lastName:
              postgresUser.name?.split(" ").slice(1).join(" ") || undefined,
            email: postgresUser.email || undefined,
            phoneNumber: postgresUser.phoneNumber || undefined,
            // Rôles et statut
            roles: postgresUser.roles?.map(
              (role: string) => roleMapping[role]
            ) || [UserRole.User],
            status: UserStatus.Active,
            // Autres champs
            countryCode: postgresUser.countryCode || undefined,
            createdAt: new Date(postgresUser.createdAt).getTime(),
            updatedAt: new Date(postgresUser.updatedAt).getTime(),
          });

          importedUsers.push(userId);
          console.log(
            `✅ Utilisateur importé: ${postgresUser.name} (legacy: ${postgresUser.id})`
          );
        } catch (error) {
          console.error(
            `❌ Erreur import utilisateur ${postgresUser.id}:`,
            error
          );
        }
      }
    }

    console.log(`✅ ${importedUsers.length} utilisateurs importés`);
    return {
      importedCount: importedUsers.length,
      userIds: importedUsers,
      message:
        "Utilisateurs importés avec IDs temporaires. Synchronisation Clerk requise.",
    };
  },
});

export const importOrganizations = mutation({
  args: {
    organizations: v.array(v.any()),
  },
  returns: v.object({
    importedCount: v.number(),
    orgIds: v.array(v.id("organizations")),
    configsImported: v.number(),
  }),
  handler: async (ctx, args) => {
    console.log(`🚀 Import de ${args.organizations.length} organisations...`);

    const importedOrgs: Array<Id<"organizations">> = [];
    const orgCountryConfigs: Array<{
      orgId: Id<"organizations">;
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
              typeof postgresOrg.metadata === "string" ?
                JSON.parse(postgresOrg.metadata)
              : postgresOrg.metadata;

            if (parsedMetadata && typeof parsedMetadata === "object") {
              // Si metadata contient des clés de codes pays (FR, PM, WF, etc.)
              countryIds = Object.keys(parsedMetadata).filter(
                (key) => key.length === 2 && key.match(/^[A-Z]{2}$/)
              );
            }
          } catch (error) {
            console.error(
              `❌ Erreur parsing metadata pour org ${postgresOrg.id}:`,
              error
            );
          }
        }

        const orgId = await ctx.db.insert("organizations", {
          code:
            postgresOrg.code ||
            `ORG_${String(postgresOrg.id.toUpperCase().slice(0, 4))}`,
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
        if (parsedMetadata && typeof parsedMetadata === "object") {
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
          `✅ Organisation importée: ${postgresOrg.name} (${countryIds.length} pays)`
        );
      } catch (error) {
        console.error(
          `❌ Erreur import organisation ${postgresOrg.id}:`,
          error
        );
        console.error(
          "Détails de l'erreur:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Importer les configurations par pays
    console.log(
      `🔧 Import de ${orgCountryConfigs.length} configurations par pays...`
    );
    let importedConfigs = 0;
    for (const { orgId, countryCode, config } of orgCountryConfigs) {
      try {
        await ctx.db.insert("organizationCountryConfigs", {
          organizationId: orgId,
          countryCode,
          contact: {
            address: {
              street: config.contact?.address?.firstLine || "",
              city: config.contact?.address?.city || "",
              postalCode: config.contact?.address?.zipCode || "",
              country: config.contact?.address?.country || "",
            },
            phone: config.contact?.phone || "",
            email: config.contact?.email || "",
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
        console.error(
          `❌ Erreur import config ${countryCode} pour org ${orgId}:`,
          error
        );
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

export const getUsersToSync = mutation({
  args: {},
  returns: v.object({
    users: v.array(
      v.object({
        _id: v.id("users"),
        userId: v.string(),
        legacyId: v.optional(v.string()),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        email: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
      })
    ),
  }),
  handler: async (ctx) => {
    // Récupérer tous les utilisateurs et filtrer ceux avec des IDs temporaires
    const allUsers = await ctx.db.query("users").collect();

    // Filtrer les utilisateurs avec des IDs temporaires
    const usersToSync = allUsers.filter(
      (user) => user.userId && user.userId.startsWith("temp_")
    );

    return {
      users: usersToSync.map((user) => ({
        _id: user._id,
        userId: user.userId,
        legacyId: user.legacyId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      })),
    };
  },
});

export const updateUserClerkId = mutation({
  args: {
    convexUserId: v.id("users"),
    clerkUserId: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Mettre à jour l'utilisateur avec le vrai ID Clerk
    await ctx.db.patch(args.convexUserId, {
      userId: args.clerkUserId,
    });

    console.log(`✅ ID Clerk mis à jour: ${args.clerkUserId}`);
    return { success: true };
  },
});

export const syncUsersWithClerk = mutation({
  args: {
    userIds: v.array(v.id("users")),
  },
  returns: v.object({
    syncedCount: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    console.log(
      `🔄 Synchronisation de ${args.userIds.length} utilisateurs avec Clerk...`
    );

    // Cette fonction est maintenant utilisée par le script externe
    // qui gère la synchronisation avec l'API Clerk
    console.log(
      "⚠️ Utilisez le script sync-with-clerk.js pour la synchronisation"
    );
    return {
      syncedCount: 0,
      message: "Utilisez le script sync-with-clerk.js pour la synchronisation",
    };
  },
});

export const getExistingOrganizations = mutation({
  args: {},
  returns: v.object({
    organizations: v.array(
      v.object({
        id: v.id("organizations"),
        name: v.string(),
        code: v.string(),
      })
    ),
  }),
  handler: async (ctx) => {
    const orgs = await ctx.db.query("organizations").collect();
    return {
      organizations: orgs.map((org) => ({
        id: org._id,
        name: org.name,
        code: org.code,
      })),
    };
  },
});

export const importCountries = mutation({
  args: {
    countries: v.array(v.any()),
  },
  returns: v.object({
    importedCount: v.number(),
    countryIds: v.array(v.id("countries")),
  }),
  handler: async (ctx, args) => {
    console.log(`🚀 Import de ${args.countries.length} pays...`);

    const importedCountries: Array<Id<"countries">> = [];

    for (const postgresCountry of args.countries) {
      try {
        const countryId = await ctx.db.insert("countries", {
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
          error instanceof Error ? error.message : String(error)
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
