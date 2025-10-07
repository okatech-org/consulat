import { v } from 'convex/values'
import { query } from '../../_generated/server'

export const getProfile = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId)
  },
})

export const getProfileByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()
  },
})

export const getAllProfiles = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    residenceCountry: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let profiles: Array<any> = []

    if (args.status) {
      profiles = await ctx.db
        .query('profiles')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect()
    } else {
      profiles = await ctx.db.query('profiles').order('desc').collect()
    }

    // Filtres additionnels
    if (args.category) {
      profiles = profiles.filter(
        (profile) => profile.category === args.category,
      )
    }

    if (args.residenceCountry) {
      profiles = profiles.filter(
        (profile) => profile.residenceCountry === args.residenceCountry,
      )
    }

    if (args.limit) {
      profiles = profiles.slice(0, args.limit)
    }

    return profiles
  },
})

export const getProfilesByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .collect()
  },
})

export const getProfilesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .filter((q) => q.eq(q.field('category'), args.category))
      .order('desc')
      .collect()
  },
})

export const getProfilesByResidenceCountry = query({
  args: { residenceCountry: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('profiles')
      .filter((q) => q.eq(q.field('residenceCountry'), args.residenceCountry))
      .order('desc')
      .collect()
  },
})

export const getProfileWithDocuments = query({
  args: { profileId: v.id('profiles') },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId)
    if (!profile) return null

    const documents = await Promise.all(
      profile.documentIds.map((id) => ctx.db.get(id)),
    )

    return {
      ...profile,
      documents: documents.filter(Boolean),
    }
  },
})

export const searchProfiles = query({
  args: {
    searchTerm: v.string(),
    status: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let profiles: Array<any> = []

    if (args.status) {
      profiles = await ctx.db
        .query('profiles')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect()
    } else {
      profiles = await ctx.db.query('profiles').collect()
    }

    // Filtres additionnels
    if (args.category) {
      profiles = profiles.filter(
        (profile) => profile.category === args.category,
      )
    }

    return profiles.filter((profile) => {
      const searchLower = args.searchTerm.toLowerCase()
      return (
        (profile.personal?.firstName &&
          profile.personal.firstName.toLowerCase().includes(searchLower)) ||
        (profile.personal?.lastName &&
          profile.personal.lastName.toLowerCase().includes(searchLower)) ||
        (profile.consularCard?.cardNumber &&
          profile.consularCard.cardNumber.toLowerCase().includes(searchLower))
      )
    })
  },
})
