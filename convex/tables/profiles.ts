import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  addressValidator,
  emergencyContactValidator,
  genderValidator,
  maritalStatusValidator,
  nationalityAcquisitionValidator,
  profileCategoryValidator,
  profileStatusValidator,
  workStatusValidator,
} from '../lib/validators';

// Table Profiles - Données personnelles
export const profiles = defineTable({
  userId: v.id('users'),
  documentIds: v.array(v.id('documents')),
  category: profileCategoryValidator,
  status: profileStatusValidator,
  residenceCountry: v.optional(v.string()),

  consularCard: v.object({
    cardPin: v.optional(v.string()),
    cardNumber: v.optional(v.string()),
    cardIssuedAt: v.optional(v.number()),
    cardExpiresAt: v.optional(v.number()),
  }),

  contacts: v.object({
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  }),

  personal: v.object({
    firstName: v.string(),
    lastName: v.string(),
    birthDate: v.optional(v.number()),
    birthPlace: v.optional(v.string()),
    birthCountry: v.optional(v.string()),
    gender: v.optional(genderValidator),
    nationality: v.optional(v.string()),
    maritalStatus: v.optional(maritalStatusValidator),
    workStatus: v.optional(workStatusValidator),
    acquisitionMode: v.optional(nationalityAcquisitionValidator),
    address: v.optional(addressValidator),
  }),

  family: v.object({
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
    profession: v.optional(v.string()),
    employer: v.optional(v.string()),
    employerAddress: v.optional(v.string()),
  }),

  registrationRequest: v.optional(v.id('requests')),
})
  .index('by_user', ['userId'])
  .index('by_status', ['status'])
  .index('by_card', ['consularCard.cardNumber']);
