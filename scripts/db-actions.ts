import * as fs from 'fs';
import * as path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  console.error('Error: NEXT_PUBLIC_CONVEX_URL is not set');
  process.exit(1);
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const BATCH_SIZE = 100;

async function fixMistagedDocuments(dryRun: boolean = true) {
  console.log(
    `Running fixMistagedDocumentOwnerType (dryRun: ${dryRun}) with batch size ${BATCH_SIZE}...`,
  );

  let isDone = false;
  let cursor: string | null = null;

  let totalFixed = 0;
  let totalOrphaned = 0;
  let totalToFix = 0;
  let totalProcessed = 0;

  try {
    while (!isDone) {
      const result: any = await convex.mutation(
        api.functions.dbActions.fixMistagedDocumentOwnerType,
        {
          dryRun,
          limit: BATCH_SIZE,
          cursor: cursor ?? undefined,
        },
      );

      console.log(`Batch processed: ${result.totalProcessed} docs`);
      console.log(`  - To Fix: ${result.toFixCount}`);
      console.log(`  - Fixed: ${result.fixedCount}`);
      console.log(`  - Orphaned: ${result.orphaned}`);

      // Log orphans details for debugging
      const orphans = result.details.filter(
        (d: any) => d.action === 'orphaned' || d.action === 'unknown_type',
      );
      if (orphans.length > 0) {
        console.log(
          '  ⚠️ Orphans found in this batch:',
          JSON.stringify(orphans, null, 2),
        );
      }

      totalProcessed += result.totalProcessed;
      totalToFix += result.toFixCount;
      totalFixed += result.fixedCount;
      totalOrphaned += result.orphaned;

      isDone = result.isDone;
      cursor = result.continueCursor;

      if (!isDone) {
        console.log('... fetching next batch ...');
      }
    }

    console.log('\n--- Final Summary ---');
    console.log(`Total Processed: ${totalProcessed}`);
    console.log(`Total To Fix: ${totalToFix}`);
    console.log(`Total Fixed: ${totalFixed}`);
    console.log(`Total Orphaned: ${totalOrphaned}`);
  } catch (error) {
    console.error('Error running mutation:', error);
  }
}

// generateChildProfileMap();
// To run the fix, uncomment the line below:
void fixMistagedDocuments(false);
