import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  genderValidator,
  nationalityAcquisitionValidator,
  parentalAuthorityValidator,
  profileStatusValidator,
} from '../lib/validators';

export const childProfiles = defineTable({
  authorUserId: v.id('users'),
  status: profileStatusValidator,
  residenceCountry: v.optional(v.string()),

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
    birthCountry: v.optional(v.string()),
    gender: v.optional(genderValidator),
    nationality: v.optional(v.string()),
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
});
