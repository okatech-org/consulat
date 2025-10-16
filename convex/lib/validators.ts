import { v } from 'convex/values';
import * as constants from './constants';

// Validateurs pour les services
export const serviceCategoryValidator = v.union(
  v.literal(constants.ServiceCategory.Identity),
  v.literal(constants.ServiceCategory.CivilStatus),
  v.literal(constants.ServiceCategory.Visa),
  v.literal(constants.ServiceCategory.Certification),
  v.literal(constants.ServiceCategory.Transcript),
  v.literal(constants.ServiceCategory.Registration),
  v.literal(constants.ServiceCategory.Assistance),
  v.literal(constants.ServiceCategory.TravelDocument),
  v.literal(constants.ServiceCategory.Other),
);
export const serviceStatusValidator = v.union(
  v.literal(constants.ServiceStatus.Active),
  v.literal(constants.ServiceStatus.Inactive),
  v.literal(constants.ServiceStatus.Suspended),
);
export const requestStatusValidator = v.union(
  v.literal(constants.RequestStatus.Pending),
  v.literal(constants.RequestStatus.PendingCompletion),
  v.literal(constants.RequestStatus.Edited),
  v.literal(constants.RequestStatus.Draft),
  v.literal(constants.RequestStatus.Submitted),
  v.literal(constants.RequestStatus.UnderReview),
  v.literal(constants.RequestStatus.InProduction),
  v.literal(constants.RequestStatus.Validated),
  v.literal(constants.RequestStatus.Rejected),
  v.literal(constants.RequestStatus.ReadyForPickup),
  v.literal(constants.RequestStatus.AppointmentScheduled),
  v.literal(constants.RequestStatus.Completed),
  v.literal(constants.RequestStatus.Cancelled),
);
export const requestPriorityValidator = v.union(
  v.literal(constants.RequestPriority.Normal),
  v.literal(constants.RequestPriority.Urgent),
  v.literal(constants.RequestPriority.Critical),
);

// Validateurs pour les utilisateurs
export const userStatusValidator = v.union(
  v.literal(constants.UserStatus.Active),
  v.literal(constants.UserStatus.Inactive),
  v.literal(constants.UserStatus.Suspended),
);
export const userRoleValidator = v.union(
  v.literal(constants.UserRole.SuperAdmin),
  v.literal(constants.UserRole.Admin),
  v.literal(constants.UserRole.Manager),
  v.literal(constants.UserRole.Agent),
  v.literal(constants.UserRole.User),
  v.literal(constants.UserRole.IntelAgent),
  v.literal(constants.UserRole.EducationAgent),
);

// Validateurs pour les organisations
export const organizationTypeValidator = v.union(
  v.literal(constants.OrganizationType.Embassy),
  v.literal(constants.OrganizationType.Consulate),
  v.literal(constants.OrganizationType.GeneralConsulate),
  v.literal(constants.OrganizationType.HonoraryConsulate),
  v.literal(constants.OrganizationType.ThirdParty),
);

// Validateurs pour les documents
export const documentStatusValidator = v.union(
  v.literal(constants.DocumentStatus.Pending),
  v.literal(constants.DocumentStatus.Validated),
  v.literal(constants.DocumentStatus.Rejected),
  v.literal(constants.DocumentStatus.Expired),
  v.literal(constants.DocumentStatus.Expiring),
);

// Validateurs pour les rendez-vous
export const appointmentStatusValidator = v.union(
  v.literal(constants.AppointmentStatus.Draft),
  v.literal(constants.AppointmentStatus.Rescheduled),
  v.literal(constants.AppointmentStatus.Missed),
  v.literal(constants.AppointmentStatus.Pending),
  v.literal(constants.AppointmentStatus.Scheduled),
  v.literal(constants.AppointmentStatus.Confirmed),
  v.literal(constants.AppointmentStatus.Completed),
  v.literal(constants.AppointmentStatus.Cancelled),
);

// Validateurs pour les notifications
export const notificationStatusValidator = v.union(
  v.literal(constants.NotificationStatus.Pending),
  v.literal(constants.NotificationStatus.Sent),
  v.literal(constants.NotificationStatus.Delivered),
  v.literal(constants.NotificationStatus.Failed),
  v.literal(constants.NotificationStatus.Read),
);

export const notificationTypeValidator = v.union(
  v.literal(constants.NotificationType.Updated),
  v.literal(constants.NotificationType.Reminder),
  v.literal(constants.NotificationType.Confirmation),
  v.literal(constants.NotificationType.Cancellation),
  v.literal(constants.NotificationType.Communication),
  v.literal(constants.NotificationType.ImportantCommunication),
);

export const deliveryStatusValidator = v.union(
  v.literal(constants.DeliveryStatus.Requested),
  v.literal(constants.DeliveryStatus.Ready),
  v.literal(constants.DeliveryStatus.Pending),
  v.literal(constants.DeliveryStatus.Completed),
  v.literal(constants.DeliveryStatus.Cancelled),
);

export const emergencyContactTypeValidator = v.union(
  v.literal(constants.EmergencyContactType.Resident),
  v.literal(constants.EmergencyContactType.HomeLand),
);

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
  countryCode: v.string(),
  appointmentSettings: v.optional(v.any()),
  workflowSettings: v.optional(v.any()),
  notificationSettings: v.optional(v.any()),
});

export const profileStatusValidator = v.union(
  v.literal(constants.ProfileStatus.Draft),
  v.literal(constants.ProfileStatus.Active),
  v.literal(constants.ProfileStatus.Inactive),
  v.literal(constants.ProfileStatus.Pending),
  v.literal(constants.ProfileStatus.Suspended),
);
export const ownerTypeValidator = v.union(
  v.literal(constants.OwnerType.User),
  v.literal(constants.OwnerType.Profile),
  v.literal(constants.OwnerType.Organization),
  v.literal(constants.OwnerType.Request),
  v.literal(constants.OwnerType.ChildProfile),
);

export const ownerIdValidator = v.union(
  v.id('users'),
  v.id('profiles'),
  v.id('organizations'),
  v.id('requests'),
  v.id('childProfiles'),
);

export const documentTypeValidator = v.union(
  v.literal(constants.DocumentType.Passport),
  v.literal(constants.DocumentType.IdentityCard),
  v.literal(constants.DocumentType.BirthCertificate),
  v.literal(constants.DocumentType.ResidencePermit),
  v.literal(constants.DocumentType.ProofOfAddress),
  v.literal(constants.DocumentType.MarriageCertificate),
  v.literal(constants.DocumentType.DivorceDecree),
  v.literal(constants.DocumentType.NationalityCertificate),
  v.literal(constants.DocumentType.Other),
  v.literal(constants.DocumentType.VisaPages),
  v.literal(constants.DocumentType.EmploymentProof),
  v.literal(constants.DocumentType.NaturalizationDecree),
  v.literal(constants.DocumentType.IdentityPhoto),
  v.literal(constants.DocumentType.ConsularCard),
  v.literal(constants.DocumentType.DeathCertificate),
);
export const appointmentTypeValidator = v.union(
  v.literal(constants.AppointmentType.DocumentSubmission),
  v.literal(constants.AppointmentType.DocumentCollection),
  v.literal(constants.AppointmentType.Interview),
  v.literal(constants.AppointmentType.MarriageCeremony),
  v.literal(constants.AppointmentType.Emergency),
  v.literal(constants.AppointmentType.Other),
  v.literal(constants.AppointmentType.Consultation),
);
export const participantRoleValidator = v.union(
  v.literal(constants.ParticipantRole.Attendee),
  v.literal(constants.ParticipantRole.Agent),
  v.literal(constants.ParticipantRole.Organizer),
);
export const participantStatusValidator = v.union(
  v.literal(constants.ParticipantStatus.Confirmed),
  v.literal(constants.ParticipantStatus.Tentative),
  v.literal(constants.ParticipantStatus.Declined),
);
export const notificationChannelValidator = v.union(
  v.literal(constants.NotificationChannel.App),
  v.literal(constants.NotificationChannel.Email),
  v.literal(constants.NotificationChannel.Sms),
);
export const organizationStatusValidator = v.union(
  v.literal(constants.OrganizationStatus.Active),
  v.literal(constants.OrganizationStatus.Inactive),
  v.literal(constants.OrganizationStatus.Suspended),
);
export const activityTypeValidator = v.union(
  v.literal(constants.ActivityType.RequestCreated),
  v.literal(constants.ActivityType.RequestSubmitted),
  v.literal(constants.ActivityType.RequestAssigned),
  v.literal(constants.ActivityType.DocumentUploaded),
  v.literal(constants.ActivityType.DocumentValidated),
  v.literal(constants.ActivityType.DocumentDeleted),
  v.literal(constants.ActivityType.DocumentRejected),
  v.literal(constants.ActivityType.PaymentReceived),
  v.literal(constants.ActivityType.RequestCompleted),
  v.literal(constants.ActivityType.RequestCancelled),
  v.literal(constants.ActivityType.CommentAdded),
  v.literal(constants.ActivityType.StatusChanged),
  v.literal(constants.ActivityType.ProfileUpdate),
  v.literal(constants.ActivityType.AppointmentScheduled),
  v.literal(constants.ActivityType.DocumentUpdated),
);
export const validationStatusValidator = v.union(
  v.literal(constants.ValidationStatus.Pending),
  v.literal(constants.ValidationStatus.Approved),
  v.literal(constants.ValidationStatus.Rejected),
  v.literal(constants.ValidationStatus.RequiresReview),
);

// Nouveaux validateurs pour les enums manquants
export const requestTypeValidator = v.union(
  v.literal(constants.RequestType.FirstRequest),
  v.literal(constants.RequestType.Renewal),
  v.literal(constants.RequestType.Modification),
  v.literal(constants.RequestType.ConsularRegistration),
  v.literal(constants.RequestType.PassportRequest),
  v.literal(constants.RequestType.IdCardRequest),
);
export const processingModeValidator = v.union(
  v.literal(constants.ProcessingMode.OnlineOnly),
  v.literal(constants.ProcessingMode.PresenceRequired),
  v.literal(constants.ProcessingMode.Hybrid),
  v.literal(constants.ProcessingMode.ByProxy),
);
export const deliveryModeValidator = v.union(
  v.literal(constants.DeliveryMode.InPerson),
  v.literal(constants.DeliveryMode.Postal),
  v.literal(constants.DeliveryMode.Electronic),
  v.literal(constants.DeliveryMode.ByProxy),
);
export const genderValidator = v.union(
  v.literal(constants.Gender.Male),
  v.literal(constants.Gender.Female),
);
export const maritalStatusValidator = v.union(
  v.literal(constants.MaritalStatus.Single),
  v.literal(constants.MaritalStatus.Married),
  v.literal(constants.MaritalStatus.Divorced),
  v.literal(constants.MaritalStatus.Widowed),
  v.literal(constants.MaritalStatus.CivilUnion),
  v.literal(constants.MaritalStatus.Cohabiting),
);
export const familyLinkValidator = v.union(
  v.literal(constants.FamilyLink.Father),
  v.literal(constants.FamilyLink.Mother),
  v.literal(constants.FamilyLink.Spouse),
  v.literal(constants.FamilyLink.LegalGuardian),
  v.literal(constants.FamilyLink.Child),
  v.literal(constants.FamilyLink.Other),
);
export const workStatusValidator = v.union(
  v.literal(constants.WorkStatus.SelfEmployed),
  v.literal(constants.WorkStatus.Employee),
  v.literal(constants.WorkStatus.Entrepreneur),
  v.literal(constants.WorkStatus.Unemployed),
  v.literal(constants.WorkStatus.Retired),
  v.literal(constants.WorkStatus.Student),
  v.literal(constants.WorkStatus.Other),
);
export const nationalityAcquisitionValidator = v.union(
  v.literal(constants.NationalityAcquisition.Birth),
  v.literal(constants.NationalityAcquisition.Naturalization),
  v.literal(constants.NationalityAcquisition.Marriage),
  v.literal(constants.NationalityAcquisition.Other),
);

export const noteTypeValidator = v.union(
  v.literal(constants.NoteType.Internal),
  v.literal(constants.NoteType.Feedback),
);
export const parentalRoleValidator = v.union(
  v.literal(constants.ParentalRole.Father),
  v.literal(constants.ParentalRole.Mother),
  v.literal(constants.ParentalRole.LegalGuardian),
);

export const parentalAuthorityValidator = v.object({
  userId: v.optional(v.id('users')),
  role: parentalRoleValidator,
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
});

export const intelligenceNoteTypeValidator = v.union(
  v.literal(constants.IntelligenceNoteType.PoliticalOpinion),
  v.literal(constants.IntelligenceNoteType.Orientation),
  v.literal(constants.IntelligenceNoteType.Associations),
  v.literal(constants.IntelligenceNoteType.TravelPatterns),
  v.literal(constants.IntelligenceNoteType.Contacts),
  v.literal(constants.IntelligenceNoteType.Activities),
  v.literal(constants.IntelligenceNoteType.Other),
);
export const intelligenceNotePriorityValidator = v.union(
  v.literal(constants.IntelligenceNotePriority.Low),
  v.literal(constants.IntelligenceNotePriority.Medium),
  v.literal(constants.IntelligenceNotePriority.High),
  v.literal(constants.IntelligenceNotePriority.Critical),
);
export const consularServiceTypeValidator = v.union(
  v.literal(constants.ConsularServiceType.PassportRequest),
  v.literal(constants.ConsularServiceType.ConsularCard),
  v.literal(constants.ConsularServiceType.BirthRegistration),
  v.literal(constants.ConsularServiceType.MarriageRegistration),
  v.literal(constants.ConsularServiceType.DeathRegistration),
  v.literal(constants.ConsularServiceType.ConsularRegistration),
  v.literal(constants.ConsularServiceType.NationalityCertificate),
);

export const servicePriorityValidator = v.union(
  v.literal(constants.ServicePriority.Standard),
  v.literal(constants.ServicePriority.Urgent),
);
export const serviceStepTypeValidator = v.union(
  v.literal(constants.ServiceStepType.Form),
  v.literal(constants.ServiceStepType.Documents),
  v.literal(constants.ServiceStepType.Appointment),
  v.literal(constants.ServiceStepType.Payment),
  v.literal(constants.ServiceStepType.Review),
  v.literal(constants.ServiceStepType.Delivery),
);
export const requestActionTypeValidator = v.union(
  v.literal(constants.RequestActionType.Assignment),
  v.literal(constants.RequestActionType.StatusChange),
  v.literal(constants.RequestActionType.NoteAdded),
  v.literal(constants.RequestActionType.DocumentAdded),
  v.literal(constants.RequestActionType.DocumentValidated),
  v.literal(constants.RequestActionType.AppointmentScheduled),
  v.literal(constants.RequestActionType.PaymentReceived),
  v.literal(constants.RequestActionType.Completed),
  v.literal(constants.RequestActionType.ProfileUpdate),
  v.literal(constants.RequestActionType.DocumentUpdated),
  v.literal(constants.RequestActionType.DocumentDeleted),
);
export const feedbackCategoryValidator = v.union(
  v.literal(constants.FeedbackCategory.Bug),
  v.literal(constants.FeedbackCategory.Feature),
  v.literal(constants.FeedbackCategory.Improvement),
  v.literal(constants.FeedbackCategory.Other),
);
export const feedbackStatusValidator = v.union(
  v.literal(constants.FeedbackStatus.Pending),
  v.literal(constants.FeedbackStatus.InReview),
  v.literal(constants.FeedbackStatus.Resolved),
  v.literal(constants.FeedbackStatus.Closed),
);
export const countryStatusValidator = v.union(
  v.literal(constants.CountryStatus.Active),
  v.literal(constants.CountryStatus.Inactive),
);
export const emailStatusValidator = v.union(
  v.literal(constants.EmailStatus.Pending),
  v.literal(constants.EmailStatus.Confirmed),
  v.literal(constants.EmailStatus.Unsubscribed),
);
export const userPermissionValidator = v.union(
  v.literal(constants.UserPermission.ProfileRead),
  v.literal(constants.UserPermission.ProfileWrite),
  v.literal(constants.UserPermission.ProfileDelete),
  v.literal(constants.UserPermission.RequestRead),
  v.literal(constants.UserPermission.RequestWrite),
  v.literal(constants.UserPermission.RequestDelete),
);
export const membershipStatusValidator = v.union(
  v.literal(constants.MembershipStatus.Active),
  v.literal(constants.MembershipStatus.Inactive),
  v.literal(constants.MembershipStatus.Suspended),
);

// Validateurs composites mis à jour
export const participantValidator = v.object({
  userId: v.id('users'),
  role: participantRoleValidator,
  status: participantStatusValidator,
});

export const activityValidator = v.object({
  type: activityTypeValidator,
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
  status: validationStatusValidator,
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
  type: emergencyContactTypeValidator,
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  relationship: familyLinkValidator,
  phoneNumber: v.optional(v.string()),
  address: v.optional(addressValidator),
  profileId: v.optional(v.id('profiles')),
});

// Validateur pour les horaires d'un jour
export const dayScheduleValidator = v.object({
  isOpen: v.boolean(),
  slots: v.array(
    v.object({
      start: v.string(),
      end: v.string(),
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
