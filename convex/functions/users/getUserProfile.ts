import { v } from 'convex/values'
import { query } from '../../_generated/server'
import { getUserProfileHelper } from '../../helpers/relationships'

export const getUserProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await getUserProfileHelper(ctx, args.userId)
  },
})
