import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  DocumentStatus,
  DocumentType,
  OwnerType,
  ValidationStatus,
} from '../lib/constants'

export const documents = defineTable({
  type: v.union(
    v.literal(DocumentType.Passport),
    v.literal(DocumentType.BirthCertificate),
    v.literal(DocumentType.IdentityCard),
    v.literal(DocumentType.DriverLicense),
    v.literal(DocumentType.Photo),
    v.literal(DocumentType.ProofOfAddress),
    v.literal(DocumentType.FamilyBook),
    v.literal(DocumentType.Other),
    v.literal(DocumentType.MarriageCertificate),
    v.literal(DocumentType.DivorceDecree),
    v.literal(DocumentType.NationalityCertificate),
    v.literal(DocumentType.VisaPages),
    v.literal(DocumentType.EmploymentProof),
    v.literal(DocumentType.NaturalizationDecree),
    v.literal(DocumentType.IdentityPhoto),
    v.literal(DocumentType.ConsularCard),
    v.literal(DocumentType.DeathCertificate),
    v.literal(DocumentType.ResidencePermit),
  ),
  status: v.union(
    v.literal(DocumentStatus.Pending),
    v.literal(DocumentStatus.Validated),
    v.literal(DocumentStatus.Rejected),
    v.literal(DocumentStatus.Expired),
    v.literal(DocumentStatus.Expiring),
  ),

  // Stockage (flexible pour Convex storage ou URL)
  storageId: v.optional(v.string()), // Convex storage ID
  fileUrl: v.optional(v.string()), // URL externe
  fileName: v.string(),
  fileType: v.string(),
  fileSize: v.optional(v.number()),
  checksum: v.optional(v.string()),

  // Versioning
  version: v.number(),
  previousVersionId: v.optional(v.id('documents')),

  // Propriétaire (polymorphique)
  ownerId: v.string(), // ID de l'entité propriétaire
  ownerType: v.union(
    v.literal(OwnerType.User),
    v.literal(OwnerType.Profile),
    v.literal(OwnerType.Organization),
    v.literal(OwnerType.Request),
  ),

  // Validité
  issuedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),

  // Validation
  validations: v.array(
    v.object({
      validatorId: v.id("users"),
      status: v.union(
        v.literal(ValidationStatus.Pending),
        v.literal(ValidationStatus.Approved),
        v.literal(ValidationStatus.Rejected),
        v.literal(ValidationStatus.RequiresReview),
      ),
      comments: v.optional(v.string()),
      timestamp: v.number(),
    })
  ),

  metadata: v.optional(v.any()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_owner', ['ownerId', 'ownerType'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_storage', ['storageId'])
