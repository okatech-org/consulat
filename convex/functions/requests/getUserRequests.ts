import { v } from 'convex/values'
import { query } from '../../_generated/server'
import { getUserRequestsHelper } from '../../helpers/relationships'

export const getUserRequests = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await getUserRequestsHelper(ctx, args.userId)
  },
})
