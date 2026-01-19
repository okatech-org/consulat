import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import { OwnerType } from '../lib/constants';
import { Id } from '../_generated/dataModel';

/**
 * Fix documents that were incorrectly tagged with ownerType: child_profile
 * when they should be ownerType: profile.
 *
 * This mutation:
 * 1. Gets all documents with ownerType = "child_profile"
 * 2. For each, checks if ownerId exists in childProfiles table
 * 3. If not found in childProfiles but found in profiles, updates ownerType to "profile"
 */
export const fixMistagedDocumentOwnerType = mutation({
  args: {
    dryRun: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    totalProcessed: v.number(),
    toFixCount: v.number(),
    fixedCount: v.number(),
    alreadyCorrect: v.number(),
    orphaned: v.number(),
    continueCursor: v.string(),
    isDone: v.boolean(),
    details: v.array(
      v.object({
        documentId: v.string(),
        ownerId: v.string(),
        documentType: v.string(),
        action: v.string(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false;
    const limit = args.limit ?? 50;
    const cursor = args.cursor ?? null;

    console.log(
      `🔍 ${dryRun ? '[DRY RUN] ' : ''}Searching for documents with ownerType: child_profile (limit: ${limit}, cursor: ${cursor ? 'yes' : 'no'})...`,
    );

    // Get batch of documents using pagination cursor
    const {
      page: childProfileDocs,
      isDone,
      continueCursor,
    } = await ctx.db
      .query('documents')
      .withIndex('by_owner_type', (q) => q.eq('ownerType', OwnerType.ChildProfile))
      .paginate({ cursor, numItems: limit });

    console.log(`📋 Retrieved ${childProfileDocs.length} documents to check`);

    let fixedCount = 0;
    let toFixCount = 0;
    let alreadyCorrect = 0;
    let orphaned = 0;
    const details: Array<{
      documentId: string;
      ownerId: string;
      documentType: string;
      action: string;
    }> = [];

    for (const doc of childProfileDocs) {
      // Fetch the owner document regardless of table type
      const owner = await ctx.db.get(doc.ownerId as any);

      if (!owner) {
        // Owner not found in any table - truly orphaned document
        orphaned++;
        details.push({
          documentId: doc._id,
          ownerId: doc.ownerId,
          documentType: doc.type,
          action: 'orphaned',
        });
        console.warn(
          `⚠️ Orphaned document ${doc._id} - owner ${doc.ownerId} not found in DB`,
        );
        continue;
      }

      // Property Check Logic
      const isChildProfile = 'authorUserId' in owner;
      const isProfile = 'userId' in owner && 'personal' in owner;
      const isUser = 'userId' in owner && !('personal' in owner);

      // Fallback or specific checks if schema evolves
      // users table has userId (string) and NO personal object
      // profiles table has userId (id) AND personal object
      // childProfiles table has authorUserId AND personal object

      if (isChildProfile) {
        // It is a ChildProfile -> ownerType is correct
        alreadyCorrect++;
        details.push({
          documentId: doc._id,
          ownerId: doc.ownerId,
          documentType: doc.type,
          action: 'already_correct',
        });
      } else if (isProfile) {
        // It is a Profile -> ownerType should be Profile
        toFixCount++;
        if (!dryRun) {
          await ctx.db.patch(doc._id, {
            ownerType: OwnerType.Profile,
          });
          fixedCount++;
        }
        details.push({
          documentId: doc._id,
          ownerId: doc.ownerId,
          documentType: doc.type,
          action: dryRun ? 'would_fix_to_profile' : 'fixed_to_profile',
        });
        console.log(
          `✅ ${dryRun ? '[DRY RUN] Would fix' : 'Fixed'} document ${doc._id} (${doc.type}) - changed to profile`,
        );
      } else if (isUser) {
        // It is a User -> ownerType should be User
        toFixCount++;
        if (!dryRun) {
          await ctx.db.patch(doc._id, {
            ownerType: OwnerType.User,
          });
          fixedCount++;
        }
        details.push({
          documentId: doc._id,
          ownerId: doc.ownerId,
          documentType: doc.type,
          action: dryRun ? 'would_fix_to_user' : 'fixed_to_user',
        });
        console.log(
          `✅ ${dryRun ? '[DRY RUN] Would fix' : 'Fixed'} document ${doc._id} (${doc.type}) - changed to user`,
        );
      } else {
        // Unknown type
        console.warn(`⚠️ Unknown owner type for doc ${doc._id} (owner ${doc.ownerId})`);
        orphaned++;
        details.push({
          documentId: doc._id,
          ownerId: doc.ownerId,
          documentType: doc.type,
          action: 'unknown_type',
        });
      }
    }

    console.log(`
📊 Batch Summary:
   - Processed: ${childProfileDocs.length}
   - Already correct: ${alreadyCorrect}
   - To Fix: ${toFixCount}
   - Fixed: ${fixedCount}
   - Orphaned: ${orphaned}
    `);

    return {
      totalProcessed: childProfileDocs.length,
      isDone,
      continueCursor,
      toFixCount,
      fixedCount,
      alreadyCorrect,
      orphaned,
      details,
    };
  },
});
