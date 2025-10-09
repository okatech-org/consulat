import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { addressValidator, emergencyContactValidator } from '../lib/validators';
import {
  Gender,
  MaritalStatus,
  NationalityAcquisition,
  ProfileCategory,
  ProfileStatus,
  WorkStatus,
} from '../lib/constants';

// Table Profiles - Données personnelles
export const profiles = defineTable({
  userId: v.id('users'),
  // Carte consulaire
  consularCard: v.object({
    cardPin: v.optional(v.string()), // NIP de 6 chiffres
    cardNumber: v.optional(v.string()),
    cardIssuedAt: v.optional(v.number()),
    cardExpiresAt: v.optional(v.number()),
  }),

  personal: v.object({
    // Informations personnelles
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    birthPlace: v.optional(v.string()),
    birthCountry: v.optional(v.string()),
    gender: v.optional(v.union(v.literal(Gender.Male), v.literal(Gender.Female))),
    nationality: v.optional(v.string()),
    maritalStatus: v.optional(
      v.union(
        v.literal(MaritalStatus.Single),
        v.literal(MaritalStatus.Married),
        v.literal(MaritalStatus.Divorced),
        v.literal(MaritalStatus.Widowed),
        v.literal(MaritalStatus.CivilUnion),
        v.literal(MaritalStatus.Cohabiting),
      ),
    ),
    workStatus: v.optional(
      v.union(
        v.literal(WorkStatus.SelfEmployed),
        v.literal(WorkStatus.Employee),
        v.literal(WorkStatus.Entrepreneur),
        v.literal(WorkStatus.Unemployed),
        v.literal(WorkStatus.Retired),
        v.literal(WorkStatus.Student),
        v.literal(WorkStatus.Other),
      ),
    ),
    acquisitionMode: v.optional(
      v.union(
        v.literal(NationalityAcquisition.Birth),
        v.literal(NationalityAcquisition.Naturalization),
        v.literal(NationalityAcquisition.Marriage),
        v.literal(NationalityAcquisition.Other),
      ),
    ),
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

  // Documents liés (références)
  documentIds: v.array(v.id('documents')),

  // Statut du profil
  category: v.union(v.literal(ProfileCategory.Adult), v.literal(ProfileCategory.Minor)),
  status: v.union(
    v.literal(ProfileStatus.Active),
    v.literal(ProfileStatus.Inactive),
    v.literal(ProfileStatus.Pending),
    v.literal(ProfileStatus.Suspended),
  ),

  residenceCountry: v.optional(v.string()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_status', ['status'])
  .index('by_card', ['consularCard.cardNumber']);
