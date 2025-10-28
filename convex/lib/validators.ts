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
  v.literal(constants.NotificationType.AppointmentConfirmation),
  v.literal(constants.NotificationType.AppointmentReminder),
  v.literal(constants.NotificationType.AppointmentCancellation),
  v.literal(constants.NotificationType.ConsularRegistrationSubmitted),
  v.literal(constants.NotificationType.ConsularRegistrationValidated),
  v.literal(constants.NotificationType.ConsularRegistrationRejected),
  v.literal(constants.NotificationType.ConsularCardReady),
  v.literal(constants.NotificationType.ConsularRegistrationCompleted),
  v.literal(constants.NotificationType.Feedback),
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
  v.literal(constants.DocumentType.DriverLicense),
  v.literal(constants.DocumentType.Photo),
  v.literal(constants.DocumentType.FamilyBook),
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

export const countryCodeValidator = v.union(
  v.literal(constants.CountryCode.AD),
  v.literal(constants.CountryCode.AE),
  v.literal(constants.CountryCode.AF),
  v.literal(constants.CountryCode.AG),
  v.literal(constants.CountryCode.AI),
  v.literal(constants.CountryCode.AL),
  v.literal(constants.CountryCode.AM),
  v.literal(constants.CountryCode.AO),
  v.literal(constants.CountryCode.AQ),
  v.literal(constants.CountryCode.AR),
  v.literal(constants.CountryCode.AS),
  v.literal(constants.CountryCode.AT),
  v.literal(constants.CountryCode.AU),
  v.literal(constants.CountryCode.AW),
  v.literal(constants.CountryCode.AX),
  v.literal(constants.CountryCode.AZ),
  v.literal(constants.CountryCode.BA),
  v.literal(constants.CountryCode.BB),
  v.literal(constants.CountryCode.BD),
  v.literal(constants.CountryCode.BE),
  v.literal(constants.CountryCode.BF),
  v.literal(constants.CountryCode.BG),
  v.literal(constants.CountryCode.BH),
  v.literal(constants.CountryCode.BI),
  v.literal(constants.CountryCode.BJ),
  v.literal(constants.CountryCode.BL),
  v.literal(constants.CountryCode.BM),
  v.literal(constants.CountryCode.BN),
  v.literal(constants.CountryCode.BO),
  v.literal(constants.CountryCode.BR),
  v.literal(constants.CountryCode.BS),
  v.literal(constants.CountryCode.BT),
  v.literal(constants.CountryCode.BW),
  v.literal(constants.CountryCode.BY),
  v.literal(constants.CountryCode.BZ),
  v.literal(constants.CountryCode.CA),
  v.literal(constants.CountryCode.CC),
  v.literal(constants.CountryCode.CD),
  v.literal(constants.CountryCode.CF),
  v.literal(constants.CountryCode.CG),
  v.literal(constants.CountryCode.CH),
  v.literal(constants.CountryCode.CI),
  v.literal(constants.CountryCode.CK),
  v.literal(constants.CountryCode.CL),
  v.literal(constants.CountryCode.CM),
  v.literal(constants.CountryCode.CN),
  v.literal(constants.CountryCode.CO),
  v.literal(constants.CountryCode.CR),
  v.literal(constants.CountryCode.CU),
  v.literal(constants.CountryCode.CV),
  v.literal(constants.CountryCode.CX),
  v.literal(constants.CountryCode.CY),
  v.literal(constants.CountryCode.CZ),
  v.literal(constants.CountryCode.DE),
  v.literal(constants.CountryCode.DJ),
  v.literal(constants.CountryCode.DK),
  v.literal(constants.CountryCode.DM),
  v.literal(constants.CountryCode.DO),
  v.literal(constants.CountryCode.DZ),
  v.literal(constants.CountryCode.EC),
  v.literal(constants.CountryCode.EE),
  v.literal(constants.CountryCode.EG),
  v.literal(constants.CountryCode.ER),
  v.literal(constants.CountryCode.ES),
  v.literal(constants.CountryCode.ET),
  v.literal(constants.CountryCode.FI),
  v.literal(constants.CountryCode.FJ),
  v.literal(constants.CountryCode.FK),
  v.literal(constants.CountryCode.FM),
  v.literal(constants.CountryCode.FO),
  v.literal(constants.CountryCode.FR),
  v.literal(constants.CountryCode.GA),
  v.literal(constants.CountryCode.GB),
  v.literal(constants.CountryCode.GD),
  v.literal(constants.CountryCode.GE),
  v.literal(constants.CountryCode.GF),
  v.literal(constants.CountryCode.GG),
  v.literal(constants.CountryCode.GH),
  v.literal(constants.CountryCode.GI),
  v.literal(constants.CountryCode.GL),
  v.literal(constants.CountryCode.GM),
  v.literal(constants.CountryCode.GN),
  v.literal(constants.CountryCode.GP),
  v.literal(constants.CountryCode.GQ),
  v.literal(constants.CountryCode.GR),
  v.literal(constants.CountryCode.GS),
  v.literal(constants.CountryCode.GT),
  v.literal(constants.CountryCode.GU),
  v.literal(constants.CountryCode.GW),
  v.literal(constants.CountryCode.GY),
  v.literal(constants.CountryCode.HK),
  v.literal(constants.CountryCode.HN),
  v.literal(constants.CountryCode.HR),
  v.literal(constants.CountryCode.HT),
  v.literal(constants.CountryCode.HU),
  v.literal(constants.CountryCode.ID),
  v.literal(constants.CountryCode.IE),
  v.literal(constants.CountryCode.IL),
  v.literal(constants.CountryCode.IM),
  v.literal(constants.CountryCode.IN),
  v.literal(constants.CountryCode.IO),
  v.literal(constants.CountryCode.IQ),
  v.literal(constants.CountryCode.IR),
  v.literal(constants.CountryCode.IS),
  v.literal(constants.CountryCode.IT),
  v.literal(constants.CountryCode.JE),
  v.literal(constants.CountryCode.JM),
  v.literal(constants.CountryCode.JO),
  v.literal(constants.CountryCode.JP),
  v.literal(constants.CountryCode.KE),
  v.literal(constants.CountryCode.KG),
  v.literal(constants.CountryCode.KH),
  v.literal(constants.CountryCode.KI),
  v.literal(constants.CountryCode.KM),
  v.literal(constants.CountryCode.KN),
  v.literal(constants.CountryCode.KP),
  v.literal(constants.CountryCode.KR),
  v.literal(constants.CountryCode.KW),
  v.literal(constants.CountryCode.KY),
  v.literal(constants.CountryCode.KZ),
  v.literal(constants.CountryCode.LA),
  v.literal(constants.CountryCode.LB),
  v.literal(constants.CountryCode.LC),
  v.literal(constants.CountryCode.LI),
  v.literal(constants.CountryCode.LK),
  v.literal(constants.CountryCode.LR),
  v.literal(constants.CountryCode.LS),
  v.literal(constants.CountryCode.LT),
  v.literal(constants.CountryCode.LU),
  v.literal(constants.CountryCode.LV),
  v.literal(constants.CountryCode.LY),
  v.literal(constants.CountryCode.MA),
  v.literal(constants.CountryCode.MC),
  v.literal(constants.CountryCode.MD),
  v.literal(constants.CountryCode.ME),
  v.literal(constants.CountryCode.MF),
  v.literal(constants.CountryCode.MG),
  v.literal(constants.CountryCode.MH),
  v.literal(constants.CountryCode.MK),
  v.literal(constants.CountryCode.ML),
  v.literal(constants.CountryCode.MM),
  v.literal(constants.CountryCode.MN),
  v.literal(constants.CountryCode.MO),
  v.literal(constants.CountryCode.MP),
  v.literal(constants.CountryCode.MQ),
  v.literal(constants.CountryCode.MR),
  v.literal(constants.CountryCode.MS),
  v.literal(constants.CountryCode.MT),
  v.literal(constants.CountryCode.MU),
  v.literal(constants.CountryCode.MV),
  v.literal(constants.CountryCode.MW),
  v.literal(constants.CountryCode.MX),
  v.literal(constants.CountryCode.MY),
  v.literal(constants.CountryCode.MZ),
  v.literal(constants.CountryCode.NA),
  v.literal(constants.CountryCode.NC),
  v.literal(constants.CountryCode.NE),
  v.literal(constants.CountryCode.NF),
  v.literal(constants.CountryCode.NG),
  v.literal(constants.CountryCode.NI),
  v.literal(constants.CountryCode.NL),
  v.literal(constants.CountryCode.NO),
  v.literal(constants.CountryCode.NP),
  v.literal(constants.CountryCode.NR),
  v.literal(constants.CountryCode.NU),
  v.literal(constants.CountryCode.NZ),
  v.literal(constants.CountryCode.OM),
  v.literal(constants.CountryCode.PA),
  v.literal(constants.CountryCode.PE),
  v.literal(constants.CountryCode.PF),
  v.literal(constants.CountryCode.PG),
  v.literal(constants.CountryCode.PH),
  v.literal(constants.CountryCode.PK),
  v.literal(constants.CountryCode.PL),
  v.literal(constants.CountryCode.PM),
  v.literal(constants.CountryCode.PN),
  v.literal(constants.CountryCode.PR),
  v.literal(constants.CountryCode.PS),
  v.literal(constants.CountryCode.PT),
  v.literal(constants.CountryCode.PW),
  v.literal(constants.CountryCode.PY),
  v.literal(constants.CountryCode.QA),
  v.literal(constants.CountryCode.RE),
  v.literal(constants.CountryCode.RO),
  v.literal(constants.CountryCode.RS),
  v.literal(constants.CountryCode.RU),
  v.literal(constants.CountryCode.RW),
  v.literal(constants.CountryCode.SA),
  v.literal(constants.CountryCode.SB),
  v.literal(constants.CountryCode.SC),
  v.literal(constants.CountryCode.SD),
  v.literal(constants.CountryCode.SE),
  v.literal(constants.CountryCode.SG),
  v.literal(constants.CountryCode.SH),
  v.literal(constants.CountryCode.SI),
  v.literal(constants.CountryCode.SJ),
  v.literal(constants.CountryCode.SK),
  v.literal(constants.CountryCode.SL),
  v.literal(constants.CountryCode.SM),
  v.literal(constants.CountryCode.SN),
  v.literal(constants.CountryCode.SO),
  v.literal(constants.CountryCode.SR),
  v.literal(constants.CountryCode.SS),
  v.literal(constants.CountryCode.ST),
  v.literal(constants.CountryCode.SV),
  v.literal(constants.CountryCode.SY),
  v.literal(constants.CountryCode.SZ),
  v.literal(constants.CountryCode.TC),
  v.literal(constants.CountryCode.TD),
  v.literal(constants.CountryCode.TG),
  v.literal(constants.CountryCode.TH),
  v.literal(constants.CountryCode.TJ),
  v.literal(constants.CountryCode.TK),
  v.literal(constants.CountryCode.TL),
  v.literal(constants.CountryCode.TM),
  v.literal(constants.CountryCode.TN),
  v.literal(constants.CountryCode.TO),
  v.literal(constants.CountryCode.TR),
  v.literal(constants.CountryCode.TT),
  v.literal(constants.CountryCode.TV),
  v.literal(constants.CountryCode.TW),
  v.literal(constants.CountryCode.TZ),
  v.literal(constants.CountryCode.UA),
  v.literal(constants.CountryCode.UG),
  v.literal(constants.CountryCode.US),
  v.literal(constants.CountryCode.UY),
  v.literal(constants.CountryCode.UZ),
  v.literal(constants.CountryCode.VA),
  v.literal(constants.CountryCode.VC),
  v.literal(constants.CountryCode.VE),
  v.literal(constants.CountryCode.VG),
  v.literal(constants.CountryCode.VI),
  v.literal(constants.CountryCode.VN),
  v.literal(constants.CountryCode.VU),
  v.literal(constants.CountryCode.WF),
  v.literal(constants.CountryCode.WS),
  v.literal(constants.CountryCode.YE),
  v.literal(constants.CountryCode.YT),
  v.literal(constants.CountryCode.ZA),
  v.literal(constants.CountryCode.ZM),
  v.literal(constants.CountryCode.ZW),
);

// Validateur d'adresse classique
export const addressValidator = v.object({
  street: v.string(),
  city: v.string(),
  state: v.optional(v.string()),
  postalCode: v.string(),
  country: countryCodeValidator,
  complement: v.optional(v.string()),
  coordinates: v.optional(
    v.object({
      latitude: v.string(),
      longitude: v.string(),
    }),
  ),
});

export const parentalAuthorityValidator = v.object({
  profileId: v.optional(v.id('profiles')),
  role: parentalRoleValidator,
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  address: v.optional(addressValidator),
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
  actorId: v.optional(v.union(v.literal('system'), v.id('memberships'))),
  data: v.optional(v.any()),
  timestamp: v.number(),
});

// Validateur pour une note (aligné sur Prisma: id, type, authorId, content, serviceRequestId, createdAt)
export const noteValidator = v.object({
  type: noteTypeValidator,
  authorId: v.optional(v.id('memberships')),
  content: v.string(),
});

export const validationValidator = v.object({
  validatorId: v.id('memberships'),
  status: validationStatusValidator,
  comments: v.optional(v.string()),
  timestamp: v.number(),
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

// ============================================================================
// Service Field Type Validators
// ============================================================================

export const serviceFieldTypeValidator = v.union(
  v.literal(constants.ServiceFieldType.Text),
  v.literal(constants.ServiceFieldType.Email),
  v.literal(constants.ServiceFieldType.Phone),
  v.literal(constants.ServiceFieldType.Date),
  v.literal(constants.ServiceFieldType.Select),
  v.literal(constants.ServiceFieldType.Address),
  v.literal(constants.ServiceFieldType.File),
  v.literal(constants.ServiceFieldType.Checkbox),
  v.literal(constants.ServiceFieldType.Radio),
  v.literal(constants.ServiceFieldType.Textarea),
  v.literal(constants.ServiceFieldType.Number),
  v.literal(constants.ServiceFieldType.Document),
  v.literal(constants.ServiceFieldType.Photo),
);

// Select type validator
export const selectTypeValidator = v.union(
  v.literal(constants.SelectType.Single),
  v.literal(constants.SelectType.Multiple),
);

// Option validator (for select, radio, checkbox fields)
export const fieldOptionValidator = v.object({
  label: v.string(),
  value: v.string(),
});

// Base field validator (common properties)
const baseFieldValidator = v.object({
  name: v.string(),
  label: v.string(),
  required: v.boolean(),
  description: v.optional(v.string()),
  autoComplete: v.optional(v.string()),
  profilePath: v.optional(v.string()), // Path to profile field for default value (e.g., "personal.firstName", "contacts.email")
});

// Text field validator
export const textFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('text'),
  minLength: v.optional(v.number()),
  maxLength: v.optional(v.number()),
  pattern: v.optional(v.string()),
});

// Number field validator
export const numberFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('number'),
  min: v.optional(v.number()),
  max: v.optional(v.number()),
});

// Email field validator
export const emailFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('email'),
});

// Phone field validator
export const phoneFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('phone'),
});

// Date field validator
export const dateFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('date'),
  minDate: v.optional(v.string()),
  maxDate: v.optional(v.string()),
});

// Select field validator
export const selectFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('select'),
  selectType: selectTypeValidator,
  options: v.array(fieldOptionValidator),
});

// Address field validator
export const addressFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('address'),
  countries: v.array(v.string()),
});

// File field validator
export const fileFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('file'),
  accept: v.optional(v.string()),
  maxSize: v.optional(v.number()),
  multiple: v.optional(v.boolean()),
});

// Checkbox field validator
export const checkboxFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('checkbox'),
  options: v.optional(v.array(fieldOptionValidator)),
});

// Radio field validator
export const radioFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('radio'),
  options: v.array(fieldOptionValidator),
});

// Textarea field validator
export const textareaFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('textarea'),
  minLength: v.optional(v.number()),
  maxLength: v.optional(v.number()),
});

// Document field validator
export const documentFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('document'),
  documentType: v.string(), // Document type from enum
  accept: v.optional(
    v.union(
      v.literal('image/*'),
      v.literal('application/pdf'),
      v.literal('image/*,application/pdf'),
    ),
  ),
});

// Photo field validator
export const photoFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('photo'),
  maxSize: v.optional(v.number()),
  accept: v.optional(v.literal('image/*')),
});

export const profileDocumentFieldValidator = v.object({
  ...baseFieldValidator.fields,
  type: v.literal('profileDocument'),
  documentType: documentTypeValidator,
  required: v.boolean(),
});

// Union of all field types (polymorphic field validator)
export const serviceFieldValidator = v.union(
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
  profileDocumentFieldValidator,
);

// ============================================================================
// Service Step Validators
// ============================================================================

// Service step validator (with typed fields array)
export const serviceStepValidator = v.object({
  order: v.number(),
  title: v.string(),
  description: v.optional(v.string()),
  isRequired: v.boolean(),
  type: serviceStepTypeValidator,
  fields: v.array(serviceFieldValidator),
  validations: v.optional(v.record(v.string(), v.any())),
});
