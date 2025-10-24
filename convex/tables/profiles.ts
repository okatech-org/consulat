import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  addressValidator,
  countryCodeValidator,
  emergencyContactValidator,
  genderValidator,
  maritalStatusValidator,
  nationalityAcquisitionValidator,
  profileStatusValidator,
  workStatusValidator,
} from '../lib/validators';

// Table Profiles - Données personnelles
export const profiles = defineTable({
  userId: v.id('users'),
  status: profileStatusValidator,
  residenceCountry: v.optional(countryCodeValidator),

  consularCard: v.object({
    cardNumber: v.optional(v.string()),
    cardIssuedAt: v.optional(v.number()),
    cardExpiresAt: v.optional(v.number()),
  }),

  contacts: v.object({
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(addressValidator),
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

  family: v.object({
    maritalStatus: v.optional(maritalStatusValidator),
    father: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
      }),
    ),
    mother: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
      }),
    ),
    spouse: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
      }),
    ),
  }),

  // Contacts d'urgence
  emergencyContacts: v.array(emergencyContactValidator),

  professionSituation: v.object({
    workStatus: v.optional(workStatusValidator),
    profession: v.optional(v.string()),
    employer: v.optional(v.string()),
    employerAddress: v.optional(v.string()),
    activityInGabon: v.optional(v.string()),
    cv: v.optional(v.id('documents')),
  }),

  registrationRequest: v.optional(v.id('requests')),

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
  .index('by_user', ['userId'])
  .index('by_status', ['status'])
  .index('by_card', ['consularCard.cardNumber'])
  .index('by_country_code', ['residenceCountry']);
