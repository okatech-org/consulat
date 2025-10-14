import { v } from 'convex/values';
import * as constants from './constants';

// Helper pour convertir les enums en validateurs
export function enumToValidator(enumObject: Record<string, string>) {
  const values = Object.values(enumObject);
  return v.union(...values.map((value) => v.literal(value)));
}

// Validateurs pour les services
export const serviceCategoryValidator = enumToValidator(constants.ServiceCategory);
export const serviceStatusValidator = enumToValidator(constants.ServiceStatus);
export const requestStatusValidator = enumToValidator(constants.RequestStatus);
export const requestPriorityValidator = v.union(
  v.literal(constants.RequestPriority.Normal),
  v.literal(constants.RequestPriority.Urgent),
  v.literal(constants.RequestPriority.Critical),
);

// Validateurs pour les utilisateurs
export const userStatusValidator = enumToValidator(constants.UserStatus);
export const userRoleValidator = enumToValidator(constants.UserRole);

// Validateurs pour les organisations
export const organizationTypeValidator = enumToValidator(constants.OrganizationType);

// Validateurs pour les documents
export const documentStatusValidator = enumToValidator(constants.DocumentStatus);

// Validateurs pour les rendez-vous
export const appointmentStatusValidator = enumToValidator(constants.AppointmentStatus);

// Validateurs pour les notifications
export const notificationStatusValidator = enumToValidator(constants.NotificationStatus);

export const notificationTypeValidator = enumToValidator(constants.NotificationType);

// Validateurs composites

// Validateurs composites de base (seront redéfinis plus tard avec les enums)

export const deliveryStatusValidator = v.object({
  app: v.optional(v.boolean()),
  email: v.optional(v.boolean()),
  sms: v.optional(v.boolean()),
});

export const pricingValidator = v.object({
  amount: v.number(),
  currency: v.string(),
});

export const stepValidator = v.object({
  order: v.number(),
  name: v.string(),
  type: v.string(),
  required: v.boolean(),
  fields: v.optional(v.any()),
});

export const serviceConfigValidator = v.object({
  requiredDocuments: v.array(v.string()),
  optionalDocuments: v.array(v.string()),
  steps: v.array(stepValidator),
  pricing: v.optional(pricingValidator),
});

export const organizationSettingsValidator = v.object({
  appointmentSettings: v.optional(v.any()),
  workflowSettings: v.optional(v.any()),
  notificationSettings: v.optional(v.any()),
});

// Nouveaux validateurs pour les enums
export const profileCategoryValidator = enumToValidator(constants.ProfileCategory);
export const profileStatusValidator = enumToValidator(constants.ProfileStatus);
export const ownerTypeValidator = enumToValidator(constants.OwnerType);
export const documentTypeValidator = enumToValidator(constants.DocumentType);
export const appointmentTypeValidator = enumToValidator(constants.AppointmentType);
export const participantRoleValidator = enumToValidator(constants.ParticipantRole);
export const participantStatusValidator = enumToValidator(constants.ParticipantStatus);
export const notificationChannelValidator = enumToValidator(
  constants.NotificationChannel,
);
export const organizationStatusValidator = enumToValidator(constants.OrganizationStatus);
export const activityTypeValidator = enumToValidator(constants.ActivityType);
export const validationStatusValidator = enumToValidator(constants.ValidationStatus);

// Nouveaux validateurs pour les enums manquants
export const requestTypeValidator = enumToValidator(constants.RequestType);
export const processingModeValidator = enumToValidator(constants.ProcessingMode);
export const deliveryModeValidator = enumToValidator(constants.DeliveryMode);
export const genderValidator = enumToValidator(constants.Gender);
export const maritalStatusValidator = enumToValidator(constants.MaritalStatus);
export const familyLinkValidator = enumToValidator(constants.FamilyLink);
export const workStatusValidator = enumToValidator(constants.WorkStatus);
export const nationalityAcquisitionValidator = enumToValidator(
  constants.NationalityAcquisition,
);
export const noteTypeValidator = enumToValidator(constants.NoteType);
export const parentalRoleValidator = enumToValidator(constants.ParentalRole);
export const intelligenceNoteTypeValidator = enumToValidator(
  constants.IntelligenceNoteType,
);
export const intelligenceNotePriorityValidator = enumToValidator(
  constants.IntelligenceNotePriority,
);
export const consularServiceTypeValidator = enumToValidator(
  constants.ConsularServiceType,
);
export const servicePriorityValidator = enumToValidator(constants.ServicePriority);
export const serviceStepTypeValidator = enumToValidator(constants.ServiceStepType);
export const requestActionTypeValidator = enumToValidator(constants.RequestActionType);
export const feedbackCategoryValidator = enumToValidator(constants.FeedbackCategory);
export const feedbackStatusValidator = enumToValidator(constants.FeedbackStatus);
export const countryStatusValidator = enumToValidator(constants.CountryStatus);
export const emailStatusValidator = enumToValidator(constants.EmailStatus);
export const userPermissionValidator = enumToValidator(constants.UserPermission);
export const membershipStatusValidator = enumToValidator(constants.MembershipStatus);

// Validateurs pour les migrations
export const migrationStatusValidator = enumToValidator(constants.MigrationStatus);
export const migrationTypeValidator = enumToValidator(constants.MigrationType);

// Validateurs composites mis à jour
export const participantValidator = v.object({
  userId: v.id('users'),
  role: participantRoleValidator, // Type-safe avec enum
  status: participantStatusValidator, // Type-safe avec enum
});

export const activityValidator = v.object({
  type: activityTypeValidator, // Type-safe avec enum
  actorId: v.optional(v.id('users')),
  data: v.optional(v.any()),
  timestamp: v.number(),
});

// Validateur pour une note (aligné sur Prisma: id, type, authorId, content, serviceRequestId, createdAt)
export const noteValidator = v.object({
  type: noteTypeValidator,
  authorId: v.optional(v.id('users')),
  content: v.string(),
});

export const validationValidator = v.object({
  validatorId: v.id('users'),
  status: validationStatusValidator, // Type-safe avec enum
  comments: v.optional(v.string()),
  timestamp: v.number(),
});

// Validateur d'adresse classique
export const addressValidator = v.object({
  street: v.string(),
  city: v.string(),
  state: v.optional(v.string()),
  postalCode: v.string(),
  country: v.string(),
  complement: v.optional(v.string()),
  coordinates: v.optional(
    v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
  ),
});

// Validateur pour les contacts d'urgence
export const emergencyContactValidator = v.object({
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  relationship: v.union(
    v.literal('father'),
    v.literal('mother'),
    v.literal('spouse'),
    v.literal('legal_guardian'),
    v.literal('child'),
    v.literal('other'),
  ),
  phoneNumber: v.optional(v.string()),
  address: v.optional(addressValidator),
  userId: v.optional(v.id('users')),
});

// Validateur pour les horaires d'un jour
export const dayScheduleValidator = v.object({
  isOpen: v.boolean(),
  slots: v.array(
    v.object({
      start: v.string(), // Format "HH:MM"
      end: v.string(), // Format "HH:MM"
    }),
  ),
});

// Validateur pour les horaires de la semaine
export const weeklyScheduleValidator = v.object({
  monday: dayScheduleValidator,
  tuesday: dayScheduleValidator,
  wednesday: dayScheduleValidator,
  thursday: dayScheduleValidator,
  friday: dayScheduleValidator,
  saturday: dayScheduleValidator,
  sunday: dayScheduleValidator,
});

// Validateur pour les informations de contact
export const contactValidator = v.object({
  address: v.optional(addressValidator),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  website: v.optional(v.string()),
});

// Validateur pour les cartes consulaires
export const consularCardValidator = v.object({
  rectoModelUrl: v.optional(v.string()),
  versoModelUrl: v.optional(v.string()),
});
