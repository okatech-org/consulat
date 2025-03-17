-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT', 'USER');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('IDENTITY', 'CIVIL_STATUS', 'VISA', 'CERTIFICATION', 'REGISTRATION', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('FIRST_REQUEST', 'RENEWAL', 'MODIFICATION', 'CONSULAR_REGISTRATION', 'PASSPORT_REQUEST', 'ID_CARD_REQUEST');

-- CreateEnum
CREATE TYPE "ProcessingMode" AS ENUM ('ONLINE_ONLY', 'PRESENCE_REQUIRED', 'HYBRID', 'BY_PROXY');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('IN_PERSON', 'POSTAL', 'ELECTRONIC', 'BY_PROXY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'CIVIL_UNION', 'COHABITING');

-- CreateEnum
CREATE TYPE "FamilyLink" AS ENUM ('FATHER', 'MOTHER', 'SPOUSE', 'LEGAL_GUARDIAN', 'CHILD', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('EMPLOYEE', 'ENTREPRENEUR', 'UNEMPLOYED', 'RETIRED', 'STUDENT', 'OTHER');

-- CreateEnum
CREATE TYPE "NationalityAcquisition" AS ENUM ('BIRTH', 'NATURALIZATION', 'MARRIAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED', 'EXPIRED', 'EXPIRING');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('EDITED', 'DRAFT', 'SUBMITTED', 'PENDING', 'PENDING_COMPLETION', 'VALIDATED', 'REJECTED', 'CARD_IN_PRODUCTION', 'READY_FOR_PICKUP', 'APPOINTMENT_SCHEDULED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PASSPORT', 'IDENTITY_CARD', 'BIRTH_CERTIFICATE', 'RESIDENCE_PERMIT', 'PROOF_OF_ADDRESS', 'MARRIAGE_CERTIFICATE', 'DEATH_CERTIFICATE', 'DIVORCE_DECREE', 'NATIONALITY_CERTIFICATE', 'OTHER', 'VISA_PAGES', 'EMPLOYMENT_PROOF', 'NATURALIZATION_DECREE', 'IDENTITY_PHOTO', 'CONSULAR_CARD');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('INTERNAL', 'FEEDBACK');

-- CreateEnum
CREATE TYPE "ProfileCategory" AS ENUM ('ADULT', 'MINOR');

-- CreateEnum
CREATE TYPE "ParentalRole" AS ENUM ('FATHER', 'MOTHER', 'LEGAL_GUARDIAN');

-- CreateEnum
CREATE TYPE "ConsularServiceType" AS ENUM ('PASSPORT_REQUEST', 'CONSULAR_CARD', 'BIRTH_REGISTRATION', 'MARRIAGE_REGISTRATION', 'DEATH_REGISTRATION', 'CONSULAR_REGISTRATION', 'NATIONALITY_CERTIFICATE');

-- CreateEnum
CREATE TYPE "ServicePriority" AS ENUM ('STANDARD', 'URGENT');

-- CreateEnum
CREATE TYPE "ServiceStepType" AS ENUM ('FORM', 'DOCUMENTS', 'APPOINTMENT', 'PAYMENT', 'REVIEW');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('DOCUMENT_SUBMISSION', 'DOCUMENT_COLLECTION', 'INTERVIEW', 'MARRIAGE_CEREMONY', 'EMERGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'MISSED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_REMINDER_3_DAYS', 'APPOINTMENT_REMINDER_1_DAY', 'APPOINTMENT_CONFIRMATION', 'APPOINTMENT_MODIFICATION', 'APPOINTMENT_CANCELLATION', 'FEEDBACK', 'VALIDATED', 'REJECTED', 'DOCUMENT_VALIDATED', 'DOCUMENT_REJECTED', 'REQUEST_SUBMITTED', 'REQUEST_ASSIGNED', 'REQUEST_COMPLETED', 'REQUEST_CANCELLED', 'REQUEST_EXPIRED', 'REQUEST_REJECTED', 'REQUEST_APPROVED', 'REQUEST_ADDITIONAL_INFO_NEEDED', 'REQUEST_PENDING_APPOINTMENT', 'REQUEST_PENDING_PAYMENT', 'REQUEST_NEW', 'CONSULAR_REGISTRATION_SUBMITTED', 'CONSULAR_REGISTRATION_VALIDATED', 'CONSULAR_REGISTRATION_REJECTED', 'CONSULAR_CARD_IN_PRODUCTION', 'CONSULAR_CARD_READY', 'CONSULAR_REGISTRATION_COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "CountryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('EMBASSY', 'CONSULATE', 'GENERAL_CONSULATE', 'HONORARY_CONSULATE', 'OTHER');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RequestActionType" AS ENUM ('ASSIGNMENT', 'STATUS_CHANGE', 'NOTE_ADDED', 'DOCUMENT_ADDED', 'DOCUMENT_VALIDATED', 'APPOINTMENT_SCHEDULED', 'PAYMENT_RECEIVED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phoneId" TEXT,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "roles" "UserRole"[] DEFAULT ARRAY['USER']::"UserRole"[],
    "image" TEXT NOT NULL DEFAULT 'https://utfs.io/f/yMD4lMLsSKvz63VKXPrFYcTlqQfXhaODoCd39tubxyKnImiE',
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "profileId" TEXT,
    "countryCode" TEXT,
    "organizationId" TEXT,
    "assignedOrganizationId" TEXT,
    "maxActiveRequests" INTEGER,
    "specializations" "ServiceCategory"[],
    "availability" JSONB,
    "completedRequests" INTEGER NOT NULL DEFAULT 0,
    "averageProcessingTime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" "ProfileCategory" NOT NULL DEFAULT 'ADULT',
    "requestedForId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" "Gender",
    "birthDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "birthCountry" TEXT,
    "nationality" TEXT DEFAULT 'gabon',
    "maritalStatus" "MaritalStatus" DEFAULT 'SINGLE',
    "workStatus" "WorkStatus" DEFAULT 'UNEMPLOYED',
    "acquisitionMode" "NationalityAcquisition" DEFAULT 'BIRTH',
    "passportNumber" TEXT,
    "passportIssueDate" TIMESTAMP(3),
    "passportExpiryDate" TIMESTAMP(3),
    "passportIssueAuthority" TEXT,
    "identityPictureId" TEXT,
    "passportId" TEXT,
    "birthCertificateId" TEXT,
    "residencePermitId" TEXT,
    "addressProofId" TEXT,
    "addressId" TEXT,
    "phoneId" TEXT,
    "email" TEXT,
    "residentContactId" TEXT,
    "homeLandContactId" TEXT,
    "activityInGabon" TEXT,
    "fatherFullName" TEXT,
    "motherFullName" TEXT,
    "spouseFullName" TEXT,
    "profession" TEXT,
    "employer" TEXT,
    "employerAddress" TEXT,
    "cardNumber" TEXT,
    "cardIssuedAt" TIMESTAMP(3),
    "cardExpiresAt" TIMESTAMP(3),
    "cardPin" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "validationNotes" TEXT,
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "assignedOrganizationId" TEXT,
    "residenceCountyCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "relationship" "FamilyLink" NOT NULL,
    "phoneId" TEXT,
    "addressId" TEXT,
    "residentProfileId" TEXT,
    "homeLandProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "firstLine" TEXT NOT NULL,
    "secondLine" TEXT,
    "city" TEXT NOT NULL,
    "zipCode" TEXT,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDocument" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "userId" TEXT,
    "serviceRequestId" TEXT,
    "validatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NoteType" NOT NULL,
    "authorId" TEXT,
    "serviceRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsularService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ServiceCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiredDocuments" "DocumentType"[],
    "optionalDocuments" "DocumentType"[],
    "requiresAppointment" BOOLEAN NOT NULL DEFAULT false,
    "appointmentDuration" INTEGER,
    "appointmentInstructions" TEXT,
    "deliveryAppointment" BOOLEAN NOT NULL DEFAULT false,
    "deliveryAppointmentDuration" INTEGER,
    "deliveryAppointmentDesc" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "price" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'EUR',
    "organizationId" TEXT,
    "processingMode" "ProcessingMode" NOT NULL DEFAULT 'PRESENCE_REQUIRED',
    "deliveryMode" "DeliveryMode"[],
    "proxyRequirements" TEXT,
    "postalRequirements" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "countryCode" TEXT,

    CONSTRAINT "ConsularService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceStep" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "type" "ServiceStepType" NOT NULL DEFAULT 'FORM',
    "fields" JSONB,
    "validations" JSONB,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "priority" "ServicePriority" NOT NULL DEFAULT 'STANDARD',
    "serviceId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "serviceCategory" "ServiceCategory" NOT NULL,
    "requestedForId" TEXT,
    "organizationId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "chosenProcessingMode" "ProcessingMode" NOT NULL DEFAULT 'ONLINE_ONLY',
    "chosenDeliveryMode" "DeliveryMode" NOT NULL DEFAULT 'IN_PERSON',
    "formData" JSONB,
    "proxyName" TEXT,
    "proxyIdentityDoc" TEXT,
    "proxyPowerOfAttorney" TEXT,
    "deliveryAddress" TEXT,
    "trackingNumber" TEXT,
    "deliveryStatus" TEXT,
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "estimatedCompletionDate" TIMESTAMP(3),
    "lastActionAt" TIMESTAMP(3),
    "lastActionBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstPassValidation" BOOLEAN,
    "processingTime" INTEGER,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "instructions" TEXT,
    "duration" INTEGER NOT NULL,
    "type" "AppointmentType" NOT NULL DEFAULT 'DOCUMENT_SUBMISSION',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "organizationId" TEXT NOT NULL,
    "locationId" TEXT,
    "countryCode" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "agentId" TEXT,
    "requestId" TEXT,
    "serviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "rescheduledFrom" TIMESTAMP(3),

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "profileId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "appointmentId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "actions" TEXT,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "notificationId" TEXT,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailList" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailListId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT NOT NULL,
    "userRole" "UserRole" NOT NULL,
    "isRelevant" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "CountryStatus" NOT NULL DEFAULT 'ACTIVE',
    "flag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "type" "OrganizationType" NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appointmentSettings" JSONB,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestAction" (
    "id" TEXT NOT NULL,
    "type" "RequestActionType" NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentalAuthority" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "role" "ParentalRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentalAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_managedCountries" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_managedCountries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CountryToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CountryToOrganization_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SharedWithParents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SharedWithParents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneId_key" ON "User"("phoneId");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileId_key" ON "User"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "User_organizationId_key" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_roles_idx" ON "User"("roles");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_number_key" ON "Phone"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_requestedForId_key" ON "Profile"("requestedForId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_identityPictureId_key" ON "Profile"("identityPictureId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_passportId_key" ON "Profile"("passportId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_birthCertificateId_key" ON "Profile"("birthCertificateId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_residencePermitId_key" ON "Profile"("residencePermitId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_addressProofId_key" ON "Profile"("addressProofId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_residentContactId_key" ON "Profile"("residentContactId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_homeLandContactId_key" ON "Profile"("homeLandContactId");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyContact_residentProfileId_key" ON "EmergencyContact"("residentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyContact_homeLandProfileId_key" ON "EmergencyContact"("homeLandProfileId");

-- CreateIndex
CREATE INDEX "EmergencyContact_phoneId_idx" ON "EmergencyContact"("phoneId");

-- CreateIndex
CREATE INDEX "EmergencyContact_addressId_idx" ON "EmergencyContact"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDocument_validatedById_key" ON "UserDocument"("validatedById");

-- CreateIndex
CREATE INDEX "UserDocument_userId_idx" ON "UserDocument"("userId");

-- CreateIndex
CREATE INDEX "UserDocument_serviceRequestId_idx" ON "UserDocument"("serviceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_requestedForId_key" ON "ServiceRequest"("requestedForId");

-- CreateIndex
CREATE INDEX "ServiceRequest_submittedById_idx" ON "ServiceRequest"("submittedById");

-- CreateIndex
CREATE INDEX "ServiceRequest_serviceId_idx" ON "ServiceRequest"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceRequest_assignedToId_idx" ON "ServiceRequest"("assignedToId");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");

-- CreateIndex
CREATE INDEX "ServiceRequest_lastActionAt_idx" ON "ServiceRequest"("lastActionAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_deadline_idx" ON "ServiceRequest"("deadline");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_requestId_key" ON "Appointment"("requestId");

-- CreateIndex
CREATE INDEX "Appointment_attendeeId_idx" ON "Appointment"("attendeeId");

-- CreateIndex
CREATE INDEX "Appointment_agentId_idx" ON "Appointment"("agentId");

-- CreateIndex
CREATE INDEX "Appointment_organizationId_idx" ON "Appointment"("organizationId");

-- CreateIndex
CREATE INDEX "Appointment_date_idx" ON "Appointment"("date");

-- CreateIndex
CREATE INDEX "Appointment_serviceId_idx" ON "Appointment"("serviceId");

-- CreateIndex
CREATE INDEX "Appointment_requestId_idx" ON "Appointment"("requestId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_profileId_idx" ON "Notification"("profileId");

-- CreateIndex
CREATE INDEX "Notification_priority_idx" ON "Notification"("priority");

-- CreateIndex
CREATE INDEX "Notification_expiresAt_idx" ON "Notification"("expiresAt");

-- CreateIndex
CREATE INDEX "ScheduledNotification_userId_idx" ON "ScheduledNotification"("userId");

-- CreateIndex
CREATE INDEX "ScheduledNotification_scheduledFor_idx" ON "ScheduledNotification"("scheduledFor");

-- CreateIndex
CREATE INDEX "ScheduledNotification_processed_idx" ON "ScheduledNotification"("processed");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_requestId_idx" ON "NotificationLog"("requestId");

-- CreateIndex
CREATE INDEX "NotificationLog_channel_idx" ON "NotificationLog"("channel");

-- CreateIndex
CREATE INDEX "NotificationLog_notificationId_idx" ON "NotificationLog"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_type_idx" ON "NotificationPreference"("type");

-- CreateIndex
CREATE INDEX "NotificationPreference_channel_idx" ON "NotificationPreference"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_type_channel_key" ON "NotificationPreference"("userId", "type", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_email_key" ON "Subscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE INDEX "RequestAction_requestId_idx" ON "RequestAction"("requestId");

-- CreateIndex
CREATE INDEX "RequestAction_userId_idx" ON "RequestAction"("userId");

-- CreateIndex
CREATE INDEX "RequestAction_createdAt_idx" ON "RequestAction"("createdAt");

-- CreateIndex
CREATE INDEX "ParentalAuthority_profileId_idx" ON "ParentalAuthority"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentalAuthority_profileId_role_key" ON "ParentalAuthority"("profileId", "role");

-- CreateIndex
CREATE INDEX "_managedCountries_B_index" ON "_managedCountries"("B");

-- CreateIndex
CREATE INDEX "_CountryToOrganization_B_index" ON "_CountryToOrganization"("B");

-- CreateIndex
CREATE INDEX "_SharedWithParents_B_index" ON "_SharedWithParents"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "Phone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedOrganizationId_fkey" FOREIGN KEY ("assignedOrganizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_identityPictureId_fkey" FOREIGN KEY ("identityPictureId") REFERENCES "UserDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "UserDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_birthCertificateId_fkey" FOREIGN KEY ("birthCertificateId") REFERENCES "UserDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_residencePermitId_fkey" FOREIGN KEY ("residencePermitId") REFERENCES "UserDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_addressProofId_fkey" FOREIGN KEY ("addressProofId") REFERENCES "UserDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "Phone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_assignedOrganizationId_fkey" FOREIGN KEY ("assignedOrganizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "Phone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_residentProfileId_fkey" FOREIGN KEY ("residentProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_homeLandProfileId_fkey" FOREIGN KEY ("homeLandProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsularService" ADD CONSTRAINT "ConsularService_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsularService" ADD CONSTRAINT "ConsularService_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStep" ADD CONSTRAINT "ServiceStep_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ConsularService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ConsularService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_requestedForId_fkey" FOREIGN KEY ("requestedForId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledNotification" ADD CONSTRAINT "ScheduledNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_emailListId_fkey" FOREIGN KEY ("emailListId") REFERENCES "EmailList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestAction" ADD CONSTRAINT "RequestAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestAction" ADD CONSTRAINT "RequestAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentalAuthority" ADD CONSTRAINT "ParentalAuthority_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentalAuthority" ADD CONSTRAINT "ParentalAuthority_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_managedCountries" ADD CONSTRAINT "_managedCountries_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_managedCountries" ADD CONSTRAINT "_managedCountries_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToOrganization" ADD CONSTRAINT "_CountryToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToOrganization" ADD CONSTRAINT "_CountryToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWithParents" ADD CONSTRAINT "_SharedWithParents_A_fkey" FOREIGN KEY ("A") REFERENCES "ParentalAuthority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedWithParents" ADD CONSTRAINT "_SharedWithParents_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
