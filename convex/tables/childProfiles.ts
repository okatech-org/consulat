import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  countryCodeValidator,
  genderValidator,
  nationalityAcquisitionValidator,
  parentalAuthorityValidator,
  profileStatusValidator,
} from '../lib/validators';

export const childProfiles = defineTable({
  authorUserId: v.id('users'),
  status: profileStatusValidator,
  residenceCountry: v.optional(countryCodeValidator),

  consularCard: v.object({
    cardNumber: v.optional(v.string()),
    cardIssuedAt: v.optional(v.number()),
    cardExpiresAt: v.optional(v.number()),
  }),

  personal: v.object({
    firstName: v.string(),
    lastName: v.string(),
    birthDate: v.optional(v.number()),
    birthPlace: v.optional(v.string()),
    birthCountry: v.optional(countryCodeValidator),
    gender: v.optional(genderValidator),
    nationality: v.optional(countryCodeValidator),
    acquisitionMode: v.optional(nationalityAcquisitionValidator),
    passportInfos: v.optional(
      v.object({
        number: v.optional(v.string()),
        issueDate: v.optional(v.number()),
        expiryDate: v.optional(v.number()),
        issueAuthority: v.optional(v.string()),
      }),
    ),
    nipCode: v.optional(v.string()),
  }),

  registrationRequest: v.optional(v.id('requests')),

  parents: v.array(parentalAuthorityValidator),

  documents: v.object({
    passport: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
    ),
    birthCertificate: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
    ),
    residencePermit: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
    ),
    addressProof: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
    ),
    identityPicture: v.optional(
      v.object({
        id: v.id('documents'),
        fileUrl: v.string(),
      }),
    ),
  }),
})
  .index('by_user', ['authorUserId'])
  .index('by_status', ['status'])
  .index('by_card', ['consularCard.cardNumber'])
  .index('by_country_code', ['residenceCountry']);
