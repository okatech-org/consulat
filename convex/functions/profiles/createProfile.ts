import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { ProfileStatus } from '../../lib/constants'
import type { ProfileCategory } from '../../lib/constants'

export const createProfile = mutation({
  args: {
    userId: v.id('users'),
    category: v.string(),
    status: v.optional(v.string()),
    personal: v.optional(v.any()),
    family: v.optional(v.any()),
    emergencyContacts: v.optional(v.array(v.any())),
    professionSituation: v.optional(v.any()),
    residenceCountry: v.optional(v.string()),
    consularCard: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'utilisateur a déjà un profil
    const existingProfile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (existingProfile) {
      throw new Error('User already has a profile')
    }

    const profileId = await ctx.db.insert('profiles', {
      userId: args.userId,
      consularCard: args.consularCard || {
        cardPin: undefined,
        cardNumber: undefined,
        cardIssuedAt: undefined,
        cardExpiresAt: undefined,
      },
      personal: args.personal || {
        firstName: undefined,
        lastName: undefined,
        birthDate: undefined,
        birthPlace: undefined,
        birthCountry: undefined,
        gender: undefined,
        nationality: undefined,
        maritalStatus: undefined,
        workStatus: undefined,
        acquisitionMode: undefined,
        address: undefined,
      },
      family: args.family || {
        father: undefined,
        mother: undefined,
        spouse: undefined,
      },
      emergencyContacts: args.emergencyContacts || [],
      professionSituation: args.professionSituation || {
        profession: undefined,
        employer: undefined,
        employerAddress: undefined,
      },
      documentIds: [],
      category: args.category as ProfileCategory,
      status: args.status ?? ProfileStatus.Pending,
      residenceCountry: args.residenceCountry,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Lier le profil à l'utilisateur
    await ctx.db.patch(args.userId, {
      profileId: profileId,
      updatedAt: Date.now(),
    })

    return profileId
  },
})
