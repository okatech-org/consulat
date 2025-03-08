import { DocumentType, UserDocument } from '@prisma/client';
import { ErrorMessageKey } from './utils';

export interface ValidationRule {
  check: (doc: UserDocument) => boolean;
  message: ErrorMessageKey;
}

export interface DocumentValidation {
  rules: ValidationRule[];
  required: boolean;
}

export const documentValidations: Partial<Record<DocumentType, DocumentValidation>> = {
  PASSPORT: {
    required: true,
    rules: [
      {
        check: (doc) => {
          if (!doc.expiresAt) return false;
          const expiryDate = new Date(doc.expiresAt);
          const now = new Date();
          return expiryDate > now;
        },
        message: 'doc_expired',
      },
      {
        check: (doc) => {
          if (!doc.expiresAt) return false;
          const expiryDate = new Date(doc.expiresAt);
          const sixMonths = new Date();
          sixMonths.setMonth(sixMonths.getMonth() + 6);
          return expiryDate > sixMonths;
        },
        message: 'doc_expires_soon',
      },
    ],
  },
  BIRTH_CERTIFICATE: {
    required: true,
    rules: [
      {
        check: (doc) => {
          if (!doc.issuedAt) return false;
          const issueDate = new Date(doc.issuedAt);
          const now = new Date();
          return now > issueDate;
        },
        message: 'doc_issued_in_future',
      },
    ],
  },
  PROOF_OF_ADDRESS: {
    required: true,
    rules: [
      {
        check: (doc) => {
          if (!doc.issuedAt) return false;
          const issueDate = new Date(doc.issuedAt);
          const threeMonths = new Date();
          threeMonths.setMonth(threeMonths.getMonth() - 3);
          return issueDate > threeMonths;
        },
        message: 'doc_expired',
      },
    ],
  },
  RESIDENCE_PERMIT: {
    required: false,
    rules: [
      {
        check: (doc) => {
          if (!doc.expiresAt) return false;
          const expiryDate = new Date(doc.expiresAt);
          const now = new Date();
          return expiryDate > now;
        },
        message: 'doc_expired',
      },
    ],
  },
};

export function validateDocument(
  doc: UserDocument | null,
  required: boolean = true,
): {
  isValid: boolean;
  errors: ErrorMessageKey[];
} {
  if (!doc && required) {
    return {
      isValid: false,
      errors: ['required_document'],
    };
  }

  const validation = documentValidations[doc?.type as DocumentType];
  const errors: ErrorMessageKey[] = [];

  validation?.rules.forEach((rule) => {
    // @ts-expect-error - rule.check is a function that returns a boolean
    if (!rule.check(doc)) {
      errors.push(rule.message);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
