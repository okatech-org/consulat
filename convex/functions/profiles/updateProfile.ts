import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import type { ProfileStatus } from '../../lib/constants'

export const updateProfile = mutation({
  args: {
    profileId: v.id('profiles'),
    personal: v.optional(v.any()),
    family: v.optional(v.any()),
    emergencyContacts: v.optional(v.array(v.any())),
    professionSituation: v.optional(v.any()),
    residenceCountry: v.optional(v.string()),
    consularCard: v.optional(v.any()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db.get(args.profileId)
    if (!existingProfile) {
      throw new Error('Profile not found')
    }

    const updateData = {
      ...(args.personal && {
        personal: { ...existingProfile.personal, ...args.personal },
      }),
      ...(args.family && {
        family: { ...existingProfile.family, ...args.family },
      }),
      ...(args.emergencyContacts && {
        emergencyContacts: args.emergencyContacts,
      }),
      ...(args.professionSituation && {
        professionSituation: {
          ...existingProfile.professionSituation,
          ...args.professionSituation,
        },
      }),
      ...(args.residenceCountry !== undefined && {
        residenceCountry: args.residenceCountry,
      }),
      ...(args.consularCard && {
        consularCard: { ...existingProfile.consularCard, ...args.consularCard },
      }),
      ...(args.status && { status: args.status as ProfileStatus }),
      updatedAt: Date.now(),
    }

    await ctx.db.patch(args.profileId, updateData)
    return args.profileId
  },
})

export const updatePersonalInfo = mutation({
  args: {
    profileId: v.id('profiles'),
    personal: v.any(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    await ctx.db.patch(args.profileId, {
      personal: { ...profile.personal, ...args.personal },
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

export const updateFamilyInfo = mutation({
  args: {
    profileId: v.id('profiles'),
    family: v.any(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    await ctx.db.patch(args.profileId, {
      family: { ...profile.family, ...args.family },
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

export const addEmergencyContact = mutation({
  args: {
    profileId: v.id('profiles'),
    emergencyContact: v.any(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    await ctx.db.patch(args.profileId, {
      emergencyContacts: [...profile.emergencyContacts, args.emergencyContact],
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

export const updateEmergencyContact = mutation({
  args: {
    profileId: v.id('profiles'),
    contactIndex: v.number(),
    emergencyContact: v.any(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    if (
      args.contactIndex < 0 ||
      args.contactIndex >= profile.emergencyContacts.length
    ) {
      throw new Error('Invalid contact index')
    }

    const updatedContacts = [...profile.emergencyContacts]
    updatedContacts[args.contactIndex] = args.emergencyContact

    await ctx.db.patch(args.profileId, {
      emergencyContacts: updatedContacts,
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

export const removeEmergencyContact = mutation({
  args: {
    profileId: v.id('profiles'),
    contactIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    if (
      args.contactIndex < 0 ||
      args.contactIndex >= profile.emergencyContacts.length
    ) {
      throw new Error('Invalid contact index')
    }

    const updatedContacts = profile.emergencyContacts.filter(
      (_, index) => index !== args.contactIndex,
    )

    await ctx.db.patch(args.profileId, {
      emergencyContacts: updatedContacts,
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

export const updateConsularCard = mutation({
  args: {
    profileId: v.id('profiles'),
    consularCard: v.any(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    await ctx.db.patch(args.profileId, {
      consularCard: { ...profile.consularCard, ...args.consularCard },
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

export const addDocumentToProfile = mutation({
  args: {
    profileId: v.id('profiles'),
    documentId: v.id('documents'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    if (profile.documentIds.includes(args.documentId)) {
      throw new Error('Document already exists in profile')
    }

    await ctx.db.patch(args.profileId, {
      documentIds: [...profile.documentIds, args.documentId],
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

export const removeDocumentFromProfile = mutation({
  args: {
    profileId: v.id('profiles'),
    documentId: v.id('documents'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    await ctx.db.patch(args.profileId, {
      documentIds: profile.documentIds.filter((id) => id !== args.documentId),
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})

export const updateProfileStatus = mutation({
  args: {
    profileId: v.id('profiles'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      status: args.status as ProfileStatus,
      updatedAt: Date.now(),
    })

    return args.profileId
  },
})
