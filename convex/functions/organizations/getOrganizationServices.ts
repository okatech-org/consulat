import { v } from 'convex/values'
import { query } from '../../_generated/server'
import { getOrganizationServicesHelper } from '../../helpers/relationships'

export const getOrganizationServices = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await getOrganizationServicesHelper(ctx, args.organizationId)
  },
})
