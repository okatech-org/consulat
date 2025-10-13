import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { parentalRoleValidator } from '../lib/validators';

export const parentalAuthorities = defineTable({
  profileId: v.id('profiles'),
  parentUserId: v.id('users'),
  role: parentalRoleValidator,
  isActive: v.boolean(),
  sharedRequests: v.array(v.id('requests')),
})
  .index('by_profile', ['profileId'])
  .index('by_parent', ['parentUserId'])
  .index('by_profile_role', ['profileId', 'role']);
