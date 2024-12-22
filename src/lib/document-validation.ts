import { DocumentType, UserDocument } from '@prisma/client'

export interface ValidationRule {
  check: (doc: UserDocument) => boolean
  message: string
}

export interface DocumentValidation {
  rules: ValidationRule[]
  required: boolean
}

export const documentValidations: (Partial<Record<DocumentType, DocumentValidation>>) = {
  PASSPORT: {
    required: true,
    rules: [
      {
        check: (doc) => {
          if (!doc.expiresAt) return false
          const expiryDate = new Date(doc.expiresAt)
          const now = new Date()
          return expiryDate > now
        },
        message: 'Le passeport est expiré'
      },
      {
        check: (doc) => {
          if (!doc.expiresAt) return false
          const expiryDate = new Date(doc.expiresAt)
          const sixMonths = new Date()
          sixMonths.setMonth(sixMonths.getMonth() + 6)
          return expiryDate > sixMonths
        },
        message: 'Le passeport expire dans moins de 6 mois'
      }
    ]
  },
  BIRTH_CERTIFICATE: {
    required: true,
    rules: [
      {
        check: (doc) => {
          if (!doc.issuedAt) return false
          const issueDate = new Date(doc.issuedAt)
          const now = new Date()
          return now > issueDate
        },
        message: "L'acte de naissance est postérieur à la date d'aujourd'hui"
      }
    ]
  },
  PROOF_OF_ADDRESS: {
    required: true,
    rules: [
      {
        check: (doc) => {
          if (!doc.issuedAt) return false
          const issueDate = new Date(doc.issuedAt)
          const threeMonths = new Date()
          threeMonths.setMonth(threeMonths.getMonth() - 3)
          return issueDate > threeMonths
        },
        message: 'Le justificatif de domicile date de plus de 3 mois'
      }
    ]
  },
  RESIDENCE_PERMIT: {
    required: false,
    rules: [
      {
        check: (doc) => {
          if (!doc.expiresAt) return false
          const expiryDate = new Date(doc.expiresAt)
          const now = new Date()
          return expiryDate > now
        },
        message: 'Le titre de séjour est expiré'
      }
    ]
  }
}

export function validateDocument(doc: UserDocument | null): {
  isValid: boolean
  errors: string[]
} {
  if (!doc) {
    return {
      isValid: false,
      errors: ['Document requis']
    }
  }

  const validation = documentValidations[doc.type]
  const errors: string[] = []


  validation?.rules.forEach(rule => {
    if (!rule.check(doc)) {
      errors.push(rule.message)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}