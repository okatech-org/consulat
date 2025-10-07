import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { addressValidator } from '../lib/validators'

// Validateur pour les horaires d'un jour
const dayScheduleValidator = v.object({
  isOpen: v.boolean(),
  slots: v.array(
    v.object({
      start: v.string(), // Format "HH:MM"
      end: v.string(), // Format "HH:MM"
    }),
  ),
})

// Validateur pour les horaires de la semaine
const weeklyScheduleValidator = v.object({
  monday: dayScheduleValidator,
  tuesday: dayScheduleValidator,
  wednesday: dayScheduleValidator,
  thursday: dayScheduleValidator,
  friday: dayScheduleValidator,
  saturday: dayScheduleValidator,
  sunday: dayScheduleValidator,
})

// Validateur pour les informations de contact
const contactValidator = v.object({
  address: addressValidator,
  phone: v.string(),
  email: v.string(),
  website: v.optional(v.string()),
})

// Validateur pour les cartes consulaires
const consularCardValidator = v.object({
  rectoModelUrl: v.optional(v.string()),
  versoModelUrl: v.optional(v.string()),
})

export const organizationCountryConfigs = defineTable({
  organizationId: v.id('organizations'),
  countryCode: v.string(), // FR, PM, WF, etc.

  // Informations de contact
  contact: contactValidator,

  // Horaires d'ouverture
  schedule: weeklyScheduleValidator,

  // Jours fériés et fermetures (dates ISO)
  holidays: v.array(v.string()),
  closures: v.array(v.string()),

  // Modèles de cartes consulaires
  consularCard: consularCardValidator,

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_country', ['countryCode'])
  .index('by_organization_country', ['organizationId', 'countryCode'])
