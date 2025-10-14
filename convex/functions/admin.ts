import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

const TABLES = [
  'appointments',
  'tickets',
  'notifications',
  'documents',
  'memberships',
  'parentalAuthorities',
  'requests',
  'services',
  'organizations',
  'profiles',
  'users',
  'countries',
] as const;
type TableName = (typeof TABLES)[number];

export const resetAllData = mutation({
  args: {
    confirm: v.literal('RESET_ALL'),
    adminKey: v.optional(v.string()),
  },
  // Simple return signature to avoid verbose type declarations
  returns: v.object({ clearedTotal: v.number() }),
  handler: async (ctx, args) => {
    // Optional admin guard via env var
    const envKey = (process.env.CONVEX_ADMIN_KEY || '').trim();
    if (envKey && args.adminKey && args.adminKey.trim() !== envKey) {
      throw new Error('Unauthorized');
    }

    let clearedTotal = 0;

    // Delete children first, then parents
    for (const table of TABLES) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docs = (await (ctx.db.query(table as any) as any).collect()) as Array<{
        _id: Id<any>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }>;

      for (const d of docs) {
        if (table === 'documents' && typeof d.storageId === 'string' && d.storageId) {
          try {
            await ctx.storage.delete(d.storageId as unknown as Id<'_storage'>);
          } catch {
            // ignore storage deletion errors
          }
        }
        await ctx.db.delete(d._id);
        clearedTotal += 1;
      }
    }

    return { clearedTotal };
  },
});
