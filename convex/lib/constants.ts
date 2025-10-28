// Enums pour les services
export enum ServiceCategory {
  Identity = 'identity',
  CivilStatus = 'civil_status',
  Visa = 'visa',
  Certification = 'certification',
  Transcript = 'transcript',
  Registration = 'registration',
  Assistance = 'assistance',
  TravelDocument = 'travel_document',
  Other = 'other',
}

export enum EmergencyContactType {
  Resident = 'resident',
  HomeLand = 'home_land',
}

export enum ServiceStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

export enum RequestStatus {
  Pending = 'pending',
  PendingCompletion = 'pending_completion',
  Edited = 'edited',
  Draft = 'draft',
  Submitted = 'submitted',
  UnderReview = 'under_review',
  InProduction = 'in_production',
  Validated = 'validated',
  Rejected = 'rejected',
  ReadyForPickup = 'ready_for_pickup',
  AppointmentScheduled = 'appointment_scheduled',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum RequestPriority {
  Normal = 'normal',
  Urgent = 'urgent',
  Critical = 'critical',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

export enum UserRole {
  User = 'user',
  Agent = 'agent',
  Admin = 'admin',
  SuperAdmin = 'super_admin',
  Manager = 'manager',
  IntelAgent = 'intel_agent',
  EducationAgent = 'education_agent',
}

export enum OrganizationType {
  Embassy = 'embassy',
  Consulate = 'consulate',
  GeneralConsulate = 'general_consulate',
  HonoraryConsulate = 'honorary_consulate',
  ThirdParty = 'third_party',
}

export enum DocumentStatus {
  Pending = 'pending',
  Validated = 'validated',
  Rejected = 'rejected',
  Expired = 'expired',
  Expiring = 'expiring',
}

export enum AppointmentStatus {
  Draft = 'draft',
  Pending = 'pending',
  Scheduled = 'scheduled',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Missed = 'missed',
  Rescheduled = 'rescheduled',
}

export enum NotificationStatus {
  Pending = 'pending',
  Sent = 'sent',
  Delivered = 'delivered',
  Failed = 'failed',
  Read = 'read',
}

export enum NotificationType {
  Updated = 'updated',
  Reminder = 'reminder',
  Confirmation = 'confirmation',
  Cancellation = 'cancellation',
  Communication = 'communication',
  ImportantCommunication = 'important_communication',
  AppointmentConfirmation = 'appointment_confirmation',
  AppointmentReminder = 'appointment_reminder',
  AppointmentCancellation = 'appointment_cancellation',
  ConsularRegistrationSubmitted = 'consular_registration_submitted',
  ConsularRegistrationValidated = 'consular_registration_validated',
  ConsularRegistrationRejected = 'consular_registration_rejected',
  ConsularCardReady = 'consular_card_ready',
  ConsularRegistrationCompleted = 'consular_registration_completed',
  Feedback = 'feedback',
}

// Enums pour les profils
export enum ProfileCategory {
  Adult = 'adult',
  Minor = 'minor',
}

export enum ProfileStatus {
  Draft = 'draft',
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
  Suspended = 'suspended',
}

export enum OwnerType {
  User = 'user',
  Profile = 'profile',
  Organization = 'organization',
  Request = 'request',
  ChildProfile = 'child_profile',
}

// Enums pour les documents
export enum DocumentType {
  Passport = 'passport',
  BirthCertificate = 'birth_certificate',
  IdentityCard = 'identity_card',
  DriverLicense = 'driver_license',
  Photo = 'photo',
  ProofOfAddress = 'proof_of_address',
  FamilyBook = 'family_book',
  Other = 'other',
  MarriageCertificate = 'marriage_certificate',
  DivorceDecree = 'divorce_decree',
  NationalityCertificate = 'nationality_certificate',
  VisaPages = 'visa_pages',
  EmploymentProof = 'employment_proof',
  NaturalizationDecree = 'naturalization_decree',
  IdentityPhoto = 'identity_photo',
  ConsularCard = 'consular_card',
  DeathCertificate = 'death_certificate',
  ResidencePermit = 'residence_permit',
}

// Enums pour les rendez-vous
export enum AppointmentType {
  DocumentSubmission = 'document_submission',
  DocumentCollection = 'document_collection',
  Interview = 'interview',
  MarriageCeremony = 'marriage_ceremony',
  Emergency = 'emergency',
  Other = 'other',
  Consultation = 'consultation',
}

export enum ParticipantRole {
  Attendee = 'attendee',
  Agent = 'agent',
  Organizer = 'organizer',
}

export enum ParticipantStatus {
  Confirmed = 'confirmed',
  Tentative = 'tentative',
  Declined = 'declined',
}

// Enums pour les notifications
export enum NotificationChannel {
  App = 'app',
  Email = 'email',
  Sms = 'sms',
}

// Enums pour les organisations
export enum OrganizationStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

// Enums pour les activités de demande
export enum ActivityType {
  RequestCreated = 'request_created',
  RequestSubmitted = 'request_submitted',
  RequestAssigned = 'request_assigned',
  DocumentUploaded = 'document_uploaded',
  DocumentValidated = 'document_validated',
  DocumentDeleted = 'document_deleted',
  DocumentRejected = 'document_rejected',
  PaymentReceived = 'payment_received',
  RequestCompleted = 'request_completed',
  RequestCancelled = 'request_cancelled',
  CommentAdded = 'comment_added',
  StatusChanged = 'status_changed',
  ProfileUpdate = 'profile_update',
  AppointmentScheduled = 'appointment_scheduled',
  DocumentUpdated = 'document_updated',
}

// Enums pour les validations
export enum ValidationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  RequiresReview = 'requires_review',
}

// Enums manquants du schéma Prisma
export enum RequestType {
  FirstRequest = 'first_request',
  Renewal = 'renewal',
  Modification = 'modification',
  ConsularRegistration = 'consular_registration',
  PassportRequest = 'passport_request',
  IdCardRequest = 'id_card_request',
}

export enum ProcessingMode {
  OnlineOnly = 'online_only',
  PresenceRequired = 'presence_required',
  Hybrid = 'hybrid',
  ByProxy = 'by_proxy',
}

export enum DeliveryMode {
  InPerson = 'in_person',
  Postal = 'postal',
  Electronic = 'electronic',
  ByProxy = 'by_proxy',
}

export enum DeliveryStatus {
  Requested = 'requested',
  Ready = 'ready',
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum MaritalStatus {
  Single = 'single',
  Married = 'married',
  Divorced = 'divorced',
  Widowed = 'widowed',
  CivilUnion = 'civil_union',
  Cohabiting = 'cohabiting',
}

export enum FamilyLink {
  Father = 'father',
  Mother = 'mother',
  Spouse = 'spouse',
  LegalGuardian = 'legal_guardian',
  Child = 'child',
  Other = 'other',
  BrotherSister = 'brother_sister',
}

export enum WorkStatus {
  SelfEmployed = 'self_employed',
  Employee = 'employee',
  Entrepreneur = 'entrepreneur',
  Unemployed = 'unemployed',
  Retired = 'retired',
  Student = 'student',
  Other = 'other',
}

export enum NationalityAcquisition {
  Birth = 'birth',
  Naturalization = 'naturalization',
  Marriage = 'marriage',
  Other = 'other',
}

export enum NoteType {
  Internal = 'internal',
  Feedback = 'feedback',
}

export enum ParentalRole {
  Father = 'father',
  Mother = 'mother',
  LegalGuardian = 'legal_guardian',
}

export enum IntelligenceNoteType {
  PoliticalOpinion = 'political_opinion',
  Orientation = 'orientation',
  Associations = 'associations',
  TravelPatterns = 'travel_patterns',
  Contacts = 'contacts',
  Activities = 'activities',
  Other = 'other',
}

export enum IntelligenceNotePriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export enum ConsularServiceType {
  PassportRequest = 'passport_request',
  ConsularCard = 'consular_card',
  BirthRegistration = 'birth_registration',
  MarriageRegistration = 'marriage_registration',
  DeathRegistration = 'death_registration',
  ConsularRegistration = 'consular_registration',
  NationalityCertificate = 'nationality_certificate',
}

export enum ServicePriority {
  Standard = 'standard',
  Urgent = 'urgent',
}

export enum ServiceStepType {
  Form = 'form',
  Documents = 'documents',
  Appointment = 'appointment',
  Payment = 'payment',
  Review = 'review',
  Delivery = 'delivery',
}

export enum RequestActionType {
  Assignment = 'assignment',
  StatusChange = 'status_change',
  NoteAdded = 'note_added',
  DocumentAdded = 'document_added',
  DocumentValidated = 'document_validated',
  AppointmentScheduled = 'appointment_scheduled',
  PaymentReceived = 'payment_received',
  Completed = 'completed',
  ProfileUpdate = 'profile_update',
  DocumentUpdated = 'document_updated',
  DocumentDeleted = 'document_deleted',
}

export enum FeedbackCategory {
  Bug = 'bug',
  Feature = 'feature',
  Improvement = 'improvement',
  Other = 'other',
}

export enum FeedbackStatus {
  Pending = 'pending',
  InReview = 'in_review',
  Resolved = 'resolved',
  Closed = 'closed',
}

export enum CountryStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum EmailStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Unsubscribed = 'unsubscribed',
}

export enum UserPermission {
  ProfileRead = 'profile_read',
  ProfileWrite = 'profile_write',
  ProfileDelete = 'profile_delete',
  RequestRead = 'request_read',
  RequestWrite = 'request_write',
  RequestDelete = 'request_delete',
  DocumentRead = 'document_read',
  DocumentWrite = 'document_write',
  DocumentDelete = 'document_delete',
  AppointmentRead = 'appointment_read',
  AppointmentWrite = 'appointment_write',
  AppointmentDelete = 'appointment_delete',
  NotificationRead = 'notification_read',
  NotificationWrite = 'notification_write',
  NotificationDelete = 'notification_delete',
  AddressRead = 'address_read',
  AddressWrite = 'address_write',
  AddressDelete = 'address_delete',
  CountryRead = 'country_read',
  CountryWrite = 'country_write',
  CountryDelete = 'country_delete',
  EmergencyContactRead = 'emergency_contact_read',
  EmergencyContactWrite = 'emergency_contact_write',
  EmergencyContactDelete = 'emergency_contact_delete',
  FeedbackRead = 'feedback_read',
  FeedbackWrite = 'feedback_write',
  FeedbackDelete = 'feedback_delete',
  OrganizationRead = 'organization_read',
  OrganizationWrite = 'organization_write',
  OrganizationDelete = 'organization_delete',
  ServiceRead = 'service_read',
  ServiceWrite = 'service_write',
  ServiceDelete = 'service_delete',
  UserRead = 'user_read',
  UserWrite = 'user_write',
  UserDelete = 'user_delete',
}

// Enums pour les migrations
export enum MigrationStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export enum MigrationType {
  Users = 'users',
  Organizations = 'organizations',
  Services = 'services',
  Requests = 'requests',
  Documents = 'documents',
  Appointments = 'appointments',
  Notifications = 'notifications',
  Addresses = 'addresses',
  Countries = 'countries',
  All = 'all',
}

export enum MembershipStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

// Field type enum and validator
export enum ServiceFieldType {
  Text = 'text',
  Email = 'email',
  Phone = 'phone',
  Date = 'date',
  Select = 'select',
  Address = 'address',
  File = 'file',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Textarea = 'textarea',
  Number = 'number',
  Document = 'document',
  Photo = 'photo',
}

export enum SelectType {
  Single = 'single',
  Multiple = 'multiple',
}

export enum CountryCode {
  AD = 'AD',
  AE = 'AE',
  AF = 'AF',
  AG = 'AG',
  AI = 'AI',
  AL = 'AL',
  AM = 'AM',
  AO = 'AO',
  AQ = 'AQ',
  AR = 'AR',
  AS = 'AS',
  AT = 'AT',
  AU = 'AU',
  AW = 'AW',
  AX = 'AX',
  AZ = 'AZ',
  BA = 'BA',
  BB = 'BB',
  BD = 'BD',
  BE = 'BE',
  BF = 'BF',
  BG = 'BG',
  BH = 'BH',
  BI = 'BI',
  BJ = 'BJ',
  BL = 'BL',
  BM = 'BM',
  BN = 'BN',
  BO = 'BO',
  BR = 'BR',
  BS = 'BS',
  BT = 'BT',
  BW = 'BW',
  BY = 'BY',
  BZ = 'BZ',
  CA = 'CA',
  CC = 'CC',
  CD = 'CD',
  CF = 'CF',
  CG = 'CG',
  CH = 'CH',
  CI = 'CI',
  CK = 'CK',
  CL = 'CL',
  CM = 'CM',
  CN = 'CN',
  CO = 'CO',
  CR = 'CR',
  CU = 'CU',
  CV = 'CV',
  CX = 'CX',
  CY = 'CY',
  CZ = 'CZ',
  DE = 'DE',
  DJ = 'DJ',
  DK = 'DK',
  DM = 'DM',
  DO = 'DO',
  DZ = 'DZ',
  EC = 'EC',
  EE = 'EE',
  EG = 'EG',
  ER = 'ER',
  ES = 'ES',
  ET = 'ET',
  FI = 'FI',
  FJ = 'FJ',
  FK = 'FK',
  FM = 'FM',
  FO = 'FO',
  FR = 'FR',
  GA = 'GA',
  GB = 'GB',
  GD = 'GD',
  GE = 'GE',
  GF = 'GF',
  GG = 'GG',
  GH = 'GH',
  GI = 'GI',
  GL = 'GL',
  GM = 'GM',
  GN = 'GN',
  GP = 'GP',
  GQ = 'GQ',
  GR = 'GR',
  GS = 'GS',
  GT = 'GT',
  GU = 'GU',
  GW = 'GW',
  GY = 'GY',
  HK = 'HK',
  HN = 'HN',
  HR = 'HR',
  HT = 'HT',
  HU = 'HU',
  ID = 'ID',
  IE = 'IE',
  IL = 'IL',
  IM = 'IM',
  IN = 'IN',
  IO = 'IO',
  IQ = 'IQ',
  IR = 'IR',
  IS = 'IS',
  IT = 'IT',
  JE = 'JE',
  JM = 'JM',
  JO = 'JO',
  JP = 'JP',
  KE = 'KE',
  KG = 'KG',
  KH = 'KH',
  KI = 'KI',
  KM = 'KM',
  KN = 'KN',
  KP = 'KP',
  KR = 'KR',
  KW = 'KW',
  KY = 'KY',
  KZ = 'KZ',
  LA = 'LA',
  LB = 'LB',
  LC = 'LC',
  LI = 'LI',
  LK = 'LK',
  LR = 'LR',
  LS = 'LS',
  LT = 'LT',
  LU = 'LU',
  LV = 'LV',
  LY = 'LY',
  MA = 'MA',
  MC = 'MC',
  MD = 'MD',
  ME = 'ME',
  MF = 'MF',
  MG = 'MG',
  MH = 'MH',
  MK = 'MK',
  ML = 'ML',
  MM = 'MM',
  MN = 'MN',
  MO = 'MO',
  MP = 'MP',
  MQ = 'MQ',
  MR = 'MR',
  MS = 'MS',
  MT = 'MT',
  MU = 'MU',
  MV = 'MV',
  MW = 'MW',
  MX = 'MX',
  MY = 'MY',
  MZ = 'MZ',
  NA = 'NA',
  NC = 'NC',
  NE = 'NE',
  NF = 'NF',
  NG = 'NG',
  NI = 'NI',
  NL = 'NL',
  NO = 'NO',
  NP = 'NP',
  NR = 'NR',
  NU = 'NU',
  NZ = 'NZ',
  OM = 'OM',
  PA = 'PA',
  PE = 'PE',
  PF = 'PF',
  PG = 'PG',
  PH = 'PH',
  PK = 'PK',
  PL = 'PL',
  PM = 'PM',
  PN = 'PN',
  PR = 'PR',
  PS = 'PS',
  PT = 'PT',
  PW = 'PW',
  PY = 'PY',
  QA = 'QA',
  RE = 'RE',
  RO = 'RO',
  RS = 'RS',
  RU = 'RU',
  RW = 'RW',
  SA = 'SA',
  SB = 'SB',
  SC = 'SC',
  SD = 'SD',
  SE = 'SE',
  SG = 'SG',
  SH = 'SH',
  SI = 'SI',
  SJ = 'SJ',
  SK = 'SK',
  SL = 'SL',
  SM = 'SM',
  SN = 'SN',
  SO = 'SO',
  SR = 'SR',
  SS = 'SS',
  ST = 'ST',
  SV = 'SV',
  SY = 'SY',
  SZ = 'SZ',
  TC = 'TC',
  TD = 'TD',
  TG = 'TG',
  TH = 'TH',
  TJ = 'TJ',
  TK = 'TK',
  TL = 'TL',
  TM = 'TM',
  TN = 'TN',
  TO = 'TO',
  TR = 'TR',
  TT = 'TT',
  TV = 'TV',
  TW = 'TW',
  TZ = 'TZ',
  UA = 'UA',
  UG = 'UG',
  US = 'US',
  UY = 'UY',
  UZ = 'UZ',
  VA = 'VA',
  VC = 'VC',
  VE = 'VE',
  VG = 'VG',
  VI = 'VI',
  VN = 'VN',
  VU = 'VU',
  WF = 'WF',
  WS = 'WS',
  YE = 'YE',
  YT = 'YT',
  ZA = 'ZA',
  ZM = 'ZM',
  ZW = 'ZW',
}
