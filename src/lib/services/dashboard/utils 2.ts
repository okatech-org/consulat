import { Profile, Document, Request, Appointment } from '@prisma/client'
import { addMonths, isAfter, isBefore } from 'date-fns'

export function calculateProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0

  const requiredFields = [
    'firstName',
    'lastName',
    'birthDate',
    'birthPlace',
    'nationality',
    'gender',
    'phone',
    'address',
    'identityPicture',
    'passport'
  ]

  const optionalFields = [
    'profession',
    'employer',
    'spouseFullName',
    'addressInGabon'
  ]

  const completedRequired = requiredFields.filter(field =>
    profile[field as keyof Profile] !== null &&
    profile[field as keyof Profile] !== ''
  ).length

  const completedOptional = optionalFields.filter(field =>
    profile[field as keyof Profile] !== null &&
    profile[field as keyof Profile] !== ''
  ).length

  const totalWeight = requiredFields.length * 2 + optionalFields.length
  const completedWeight = completedRequired * 2 + completedOptional

  return Math.round((completedWeight / totalWeight) * 100)
}

export function getMissingFields(profile: Profile | null): string[] {
  if (!profile) return ['all']

  const requiredFields = [
    { key: 'identityPicture', name: 'identity_photo' },
    { key: 'passport', name: 'passport' },
    { key: 'birthCertificate', name: 'birth_certificate' },
    { key: 'phone', name: 'contact_details' },
    { key: 'address', name: 'proof_of_residence' },
    { key: 'emergencyContact', name: 'emergency_contact' }
  ]

  return requiredFields
    .filter(field => !profile[field.key as keyof Profile])
    .map(field => field.name)
}

export function getProfileStatus(profile: Profile | null): 'ACTIVE' | 'PENDING' | 'EXPIRED' {
  if (!profile) return 'PENDING'
  if (!profile.passport) return 'PENDING'

  const passportExpiryDate = new Date(profile.passportExpiryDate)
  const now = new Date()

  if (isBefore(passportExpiryDate, now)) {
    return 'EXPIRED'
  }

  return profile.status === 'VALIDATED' ? 'ACTIVE' : 'PENDING'
}

export function calculateDocumentsStats(documents: Document[]) {
  const now = new Date()
  const threeMonthsFromNow = addMonths(now, 3)

  return {
    total: documents.length,
    valid: documents.filter(doc =>
      doc.status === 'VALIDATED' &&
      isAfter(new Date(doc.expiresAt), now)
    ).length,
    expiringSoon: documents.filter(doc => {
      const expiryDate = new Date(doc.expiresAt)
      return doc.status === 'VALIDATED' &&
        isAfter(expiryDate, now) &&
        isBefore(expiryDate, threeMonthsFromNow)
    }).length,
    expired: documents.filter(doc =>
      isBefore(new Date(doc.expiresAt), now)
    ).length,
    latestDocument: documents[0] ? {
      id: documents[0].id,
      type: documents[0].type,
      expiryDate: documents[0].expiresAt
    } : undefined
  }
}

export function calculateProceduresStats(requests: Request[]) {
  const activeRequests = requests.filter(req =>
    ['PENDING', 'IN_PROGRESS'].includes(req.status)
  )

  return {
    active: activeRequests.length,
    completed: requests.filter(req => req.status === 'COMPLETED').length,
    nextStep: activeRequests[0] ? {
      id: activeRequests[0].id,
      description: getNextStepDescription(activeRequests[0]),
      deadline: getRequestDeadline(activeRequests[0])
    } : undefined
  }
}

export function calculateAppointmentsStats(appointments: Appointment[]) {
  const now = new Date()

  return {
    upcoming: appointments[0] ? {
      id: appointments[0].id,
      date: appointments[0].date,
      type: appointments[0].type,
      status: appointments[0].status
    } : undefined,
    past: appointments.filter(apt =>
      isBefore(new Date(apt.date), now)
    ).length,
    cancelled: appointments.filter(apt =>
      apt.status === 'CANCELLED'
    ).length
  }
}

function getNextStepDescription(request: Request): string {
  // Logique pour déterminer la prochaine étape basée sur le type et le statut
  const steps = {
    PASSPORT_RENEWAL: {
      PENDING: 'documents_submission',
      IN_PROGRESS: 'verification',
      DOCUMENTS_SUBMITTED: 'payment',
      PAYMENT_COMPLETED: 'processing',
      READY_FOR_COLLECTION: 'collection'
    }
  }

  return steps[request.type as keyof typeof steps]?.[request.status] || 'unknown'
}

function getRequestDeadline(request: Request): Date {
  // Logique pour calculer la date limite basée sur le type et le statut
  const now = new Date()
  const deadlines = {
    PASSPORT_RENEWAL: {
      PENDING: addMonths(now, 1),
      IN_PROGRESS: addMonths(now, 2),
      DOCUMENTS_SUBMITTED: addMonths(now, 3)
    }
  }

  return deadlines[request.type as keyof typeof deadlines]?.[request.status] || addMonths(now, 1)
}