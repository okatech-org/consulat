import { DocumentField } from '@/lib/utils';

export const documentFieldsToAnalyze: DocumentField[] = [
  // Informations de base
  {
    name: 'firstName',
    description: 'First name of the person as written on the document',
    required: true,
    type: 'string',
  },
  {
    name: 'passportNumber',
    description: 'Passport number',
    required: true,
    type: 'string',
  },
  {
    name: 'passportIssueDate',
    description: 'Date of issue of the passport in YYYY-MM-DD format',
    required: true,
    type: 'date',
  },
  {
    name: 'passportExpiryDate',
    description: 'Date of expiry of the passport in YYYY-MM-DD format',
    required: true,
    type: 'date',
  },
  {
    name: 'passportIssueAuthority',
    description: 'Authority that issued the passport',
    required: true,
    type: 'string',
  },
  {
    name: 'lastName',
    description: 'Last name of the person as written on the document',
    required: true,
    type: 'string',
  },
  {
    name: 'gender',
    description: 'Gender of the person. Must be exactly "MALE" or "FEMALE"',
    required: true,
    type: 'string',
  },
  {
    name: 'birthDate',
    description: 'Date of birth in YYYY-MM-DD format',
    required: true,
    type: 'date',
  },
  {
    name: 'birthPlace',
    description: 'Place of birth (city name)',
    required: true,
    type: 'string',
  },
  {
    name: 'birthCountry',
    description: 'Country of birth (e.g. "france")',
    required: true,
    type: 'string',
  },
  {
    name: 'nationality',
    description: 'Nationality as written on the document (e.g. "france")',
    required: true,
    type: 'string',
  },
  // Address
  {
    name: 'address',
    description:
      'Complete address with the following structure: firstLine (address line 1), secondLine (address line 2), city, zipCode, country, e.g. { "firstLine": "123 Main St", "secondLine": "Apt 1", "city": "Springfield", "zipCode": "12345", "country": "united_states" }',
    type: 'address',
    required: true,
  },
  {
    name: 'fatherFullName',
    description: 'Full name of the father',
    type: 'string',
  },
  {
    name: 'motherFullName',
    description: 'Full name of the mother',
    type: 'string',
  },
  // Informations professionnelles
  {
    name: 'workStatus',
    description:
      'Work status, must be one of: "EMPLOYEE", "ENTREPRENEUR", "UNEMPLOYED", "RETIRED", "STUDENT", "OTHER"',
    type: 'string',
  },
  {
    name: 'profession',
    description: 'Current profession or occupation (job title)',
    type: 'string',
  },
];

// Configuration spécifique par type de document
export const documentSpecificFields = {
  passportFile: [
    'firstName',
    'lastName',
    'gender',
    'birthDate',
    'birthPlace',
    'birthCountry',
    'nationality',
    'passportNumber',
    'passportIssueDate',
    'passportExpiryDate',
    'passportIssueAuthority',
  ],
  birthCertificateFile: ['fatherFullName', 'motherFullName'],
  residencePermitFile: ['profession', 'workStatus'],
  addressProofFile: ['address'],
};

/**
 * Helper function to get relevant fields for a specific document type
 */
export function getFieldsForDocument(
  documentType: keyof typeof documentSpecificFields,
): DocumentField[] {
  const fieldNames = documentSpecificFields[documentType];
  return documentFieldsToAnalyze.filter((field) => fieldNames.includes(field.name));
}
