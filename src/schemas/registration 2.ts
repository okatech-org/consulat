// src/components/consular/schema.tsx
import * as z from 'zod'
import { DocumentType, Gender, MaritalStatus, WorkStatus, NationalityAcquisition } from '@prisma/client'

// Schéma pour le type de demande
export const RequestTypeSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  nationalityAcquisition: z.nativeEnum(NationalityAcquisition),
})

// Schéma pour les informations de base
export const BasicInfoSchema = z.object({
  gender: z.nativeEnum(Gender),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  birthDate: z.string(),
  birthPlace: z.string(),
  birthCountry: z.string(),
  nationality: z.string(),
  identityPictureFile: z.any(),
  passportNumber: z.string(),
  passportIssueDate: z.date(),
  passportExpiryDate: z.date(),
  passportIssuingAuthority: z.string()
})

// Schéma pour les informations de contact
export const ContactInfoSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  address: z.object({
    firstLine: z.string().min(1),
    secondLine: z.string().optional(),
    city: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
})

// Schéma pour les informations familiales
export const FamilyInfoSchema = z.object({
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
  fatherFullName: z.string().min(1),
  motherFullName: z.string().min(1),
  spouseFullName: z.string().optional(),
})

// Schéma pour les informations professionnelles
export const ProfessionalInfoSchema = z.object({
  workStatus: z.nativeEnum(WorkStatus).optional(),
  profession: z.string().optional(),
  employer: z.string().optional(),
  employerAddress: z.string().optional(),
})

// Types dérivés des schémas
export type RequestTypeFormData = z.infer<typeof RequestTypeSchema>
export type BasicInfoFormData = z.infer<typeof BasicInfoSchema>
export type ContactInfoFormData = z.infer<typeof ContactInfoSchema>
export type FamilyInfoFormData = z.infer<typeof FamilyInfoSchema>
export type ProfessionalInfoFormData = z.infer<typeof ProfessionalInfoSchema>