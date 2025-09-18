import { PrismaClient, type User } from '@prisma/client';
import { createClerkClient } from '@clerk/nextjs/server';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface ErrorLog {
  timestamp: string;
  operation: string;
  userId: string;
  userData: {
    email?: string | null;
    phoneNumber?: string | null;
    clerkId?: string | null;
  };
  error: string;
  details?: any;
}

interface SyncResult {
  success: number;
  failed: number;
  skipped: number;
  errors: ErrorLog[];
}

interface OperationProgress {
  current: number;
  total: number;
  operation: string;
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  batchSize: 10, // Process users in batches to avoid rate limits
  retryAttempts: 3,
  retryDelay: 1000, // ms
  logDir: './logs',
  errorLogFile: `sync-errors-${new Date().toISOString().split('T')[0]}.json`,
  summaryLogFile: `sync-summary-${new Date().toISOString().split('T')[0]}.json`,
};

// ============================================================================
// Initialize
// ============================================================================

const prisma = new PrismaClient();
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Ensure log directory exists
if (!fs.existsSync(CONFIG.logDir)) {
  fs.mkdirSync(CONFIG.logDir, { recursive: true });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry an async operation with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxAttempts: number = CONFIG.retryAttempts,
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
        console.log(
          `⚠️  Retry ${attempt}/${maxAttempts} for ${operationName} after ${delay}ms`,
        );
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Process array in batches
 */
async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);

    // Add delay between batches to avoid rate limits
    if (i + batchSize < items.length) {
      await sleep(500);
    }
  }

  return results;
}

/**
 * Log progress
 */
function logProgress({ current, total, operation }: OperationProgress) {
  const percentage = Math.round((current / total) * 100);
  console.log(`📊 ${operation}: ${current}/${total} (${percentage}%)`);
}

/**
 * Normalize phone number
 */
function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return phoneNumber;

  // Remove all spaces, dashes, and dots
  let cleaned = phoneNumber.replace(/[\s\-.]/g, '');

  // Handle French numbers without country code
  if (cleaned.match(/^0[1-9]\d{8}$/)) {
    cleaned = '+33' + cleaned.substring(1);
  }

  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    console.warn(`⚠️  Invalid phone number (doesn't start with +): ${phoneNumber}`);
    return phoneNumber;
  }

  // Validate format
  if (!cleaned.match(/^\+[1-9]\d{1,14}$/)) {
    console.warn(`⚠️  Invalid phone format: ${phoneNumber}`);
    return phoneNumber;
  }

  return cleaned;
}

/**
 * Normalize email
 */
function normalizeEmail(email: string): string {
  if (!email) return '';

  // Convert to lowercase, trim spaces
  const normalized = email.toLowerCase().trim();

  // Basic email validation
  if (!normalized.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    console.warn(`⚠️  Invalid email format: ${email}`);
    return email;
  }

  return normalized;
}

/**
 * Log error to file
 */
function logError(error: ErrorLog, errors: ErrorLog[]) {
  errors.push(error);

  // Write to file immediately
  const errorLogPath = path.join(CONFIG.logDir, CONFIG.errorLogFile);
  fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2));
}

/**
 * Write summary report
 */
function writeSummaryReport(results: Record<string, SyncResult>) {
  const summaryPath = path.join(CONFIG.logDir, CONFIG.summaryLogFile);

  const summary = {
    timestamp: new Date().toISOString(),
    operations: Object.entries(results).map(([operation, result]) => ({
      operation,
      ...result,
      errors: result.errors.length, // Only count, full errors are in error log
    })),
    totals: {
      success: Object.values(results).reduce((sum, r) => sum + r.success, 0),
      failed: Object.values(results).reduce((sum, r) => sum + r.failed, 0),
      skipped: Object.values(results).reduce((sum, r) => sum + r.skipped, 0),
      errors: Object.values(results).reduce((sum, r) => sum + r.errors.length, 0),
    },
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n📄 Summary report written to:', summaryPath);
  console.log(
    '📄 Error details written to:',
    path.join(CONFIG.logDir, CONFIG.errorLogFile),
  );
}

// ============================================================================
// Main Operations
// ============================================================================

/**
 * Normalize user data in database
 */
async function normalizeUserData(users: User[]): Promise<SyncResult> {
  console.log('\n🔄 Starting user data normalization...');

  const result: SyncResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    logProgress({ current: i + 1, total: users.length, operation: 'Normalizing' });

    try {
      const normalizedPhone = user?.phoneNumber
        ? normalizePhoneNumber(user.phoneNumber)
        : null;
      const normalizedEmail = user?.email ? normalizeEmail(user.email) : null;

      // Skip if no changes needed
      if (normalizedPhone === user?.phoneNumber && normalizedEmail === user?.email) {
        result.skipped++;
        continue;
      }

      await withRetry(
        () =>
          prisma.user.update({
            where: { id: user?.id },
            data: {
              ...(normalizedPhone !== user?.phoneNumber && {
                phoneNumber: normalizedPhone,
              }),
              ...(normalizedEmail !== user?.email && { email: normalizedEmail }),
            },
          }),
        `normalize user ${user?.id}`,
        2,
      );

      console.log(`✅ User ${user?.id} normalized`);
      result.success++;
    } catch (error) {
      console.error(`❌ Failed to normalize user ${user?.id}`);

      logError(
        {
          timestamp: new Date().toISOString(),
          operation: 'normalizeUserData',
          userId: user?.id || 'N/A',
          userData: {
            email: user?.email,
            phoneNumber: user?.phoneNumber,
            clerkId: user?.clerkId,
          },
          error: error instanceof Error ? error.message : String(error),
          details: error,
        },
        result.errors,
      );

      result.failed++;
    }
  }

  return result;
}

/**
 * Update users with Clerk IDs
 */
async function updateUsersWithClerkId(users: User[]): Promise<SyncResult> {
  console.log('\n🔄 Starting Clerk ID synchronization...');

  const result: SyncResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // Process in batches to avoid rate limits
  const processUserBatch = async (batch: User[]): Promise<void[]> => {
    return Promise.all(
      batch.map(async (user) => {
        const index = users.indexOf(user) + 1;
        logProgress({ current: index, total: users.length, operation: 'Clerk ID sync' });

        // Skip users without email
        if (!user.email) {
          console.log(`⏭️  User ${user.id} has no email - skipping`);
          result.skipped++;
          return;
        }

        // Skip users with existing valid Clerk ID
        if (user.clerkId && user.clerkId !== '' && user.clerkId !== 'undefined') {
          console.log(`✓ User ${user.id} already has Clerk ID: ${user.clerkId}`);
          result.skipped++;
          return;
        }

        try {
          const clerkUsers = await withRetry(
            () =>
              clerkClient.users.getUserList({
                emailAddress: [user.email as string],
              }),
            `fetch Clerk user for ${user.email}`,
            2,
          );

          if (clerkUsers.data.length === 0) {
            console.log(`⚠️  No Clerk user found for ${user.email}`);

            logError(
              {
                timestamp: new Date().toISOString(),
                operation: 'updateUsersWithClerkId',
                userId: user.id,
                userData: {
                  email: user.email,
                  phoneNumber: user.phoneNumber,
                },
                error: 'No Clerk user found for email',
              },
              result.errors,
            );

            result.failed++;
            return;
          }

          const clerkUser = clerkUsers.data[0];

          await withRetry(
            () =>
              prisma.user.update({
                where: { id: user.id },
                data: { clerkId: clerkUser?.id },
              }),
            `update user ${user.id} with Clerk ID`,
            2,
          );

          console.log(`✅ User ${user.id} updated with Clerk ID: ${clerkUser?.id}`);
          result.success++;
        } catch (error) {
          console.error(`❌ Failed to process user ${user.id}`);

          logError(
            {
              timestamp: new Date().toISOString(),
              operation: 'updateUsersWithClerkId',
              userId: user.id,
              userData: {
                email: user.email,
                phoneNumber: user.phoneNumber,
                clerkId: user.clerkId,
              },
              error: error instanceof Error ? error.message : String(error),
              details: error,
            },
            result.errors,
          );

          result.failed++;
        }
      }),
    );
  };

  await processBatch(users, CONFIG.batchSize, processUserBatch);

  return result;
}

/**
 * Update Clerk users with database metadata
 */
async function updateClerkUsersWithDatabaseUsers(users: User[]): Promise<SyncResult> {
  console.log('\n🔄 Starting Clerk metadata synchronization...');

  const result: SyncResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  const usersWithClerkId = users.filter((u) => u.clerkId);

  if (usersWithClerkId.length === 0) {
    console.log('⚠️  No users with Clerk ID to update');
    return result;
  }

  const processMetadataBatch = async (batch: User[]): Promise<void[]> => {
    return Promise.all(
      batch.map(async (user) => {
        const index = usersWithClerkId.indexOf(user) + 1;
        logProgress({
          current: index,
          total: usersWithClerkId.length,
          operation: 'Metadata sync',
        });

        try {
          await withRetry(
            () =>
              clerkClient.users.updateUser(user.clerkId!, {
                publicMetadata: {
                  profileId: user.profileId,
                  roles: user.roles,
                  countryCode: user.countryCode,
                  assignedOrganizationId: user.assignedOrganizationId,
                  organizationId: user.organizationId,
                },
              }),
            `update Clerk metadata for ${user.clerkId}`,
            2,
          );

          console.log(`✅ Metadata updated for user ${user.id} (Clerk: ${user.clerkId})`);
          result.success++;
        } catch (error) {
          console.error(`❌ Failed to update metadata for user ${user.id}`);

          logError(
            {
              timestamp: new Date().toISOString(),
              operation: 'updateClerkUsersWithDatabaseUsers',
              userId: user.id,
              userData: {
                email: user.email,
                phoneNumber: user.phoneNumber,
                clerkId: user.clerkId,
              },
              error: error instanceof Error ? error.message : String(error),
              details: {
                error,
                metadata: {
                  profileId: user.profileId,
                  roles: user.roles,
                  countryCode: user.countryCode,
                  assignedOrganizationId: user.assignedOrganizationId,
                  organizationId: user.organizationId,
                },
              },
            },
            result.errors,
          );

          result.failed++;
        }
      }),
    );
  };

  await processBatch(usersWithClerkId, CONFIG.batchSize, processMetadataBatch);

  return result;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🚀 Starting database synchronization...');
  console.log(`📁 Logs will be saved to: ${path.resolve(CONFIG.logDir)}`);

  const startTime = Date.now();
  const results: Record<string, SyncResult> = {};

  try {
    // Fetch all users
    console.log('\n📊 Fetching users from database...');
    const users = await prisma.user.findMany();
    console.log(`📊 Found ${users.length} users`);

    if (users.length === 0) {
      console.log('⚠️  No users found in database');
      return;
    }

    // Step 1: Normalize user data
    results.normalize = await normalizeUserData(users);
    console.log(`\n📊 Normalization complete:`, {
      success: results.normalize.success,
      failed: results.normalize.failed,
      skipped: results.normalize.skipped,
    });

    // Refetch users after normalization
    const normalizedUsers = await prisma.user.findMany();

    // Step 2: Update users with Clerk IDs
    results.clerkIdSync = await updateUsersWithClerkId(normalizedUsers);
    console.log(`\n📊 Clerk ID sync complete:`, {
      success: results.clerkIdSync.success,
      failed: results.clerkIdSync.failed,
      skipped: results.clerkIdSync.skipped,
    });

    // Refetch users after Clerk ID update
    const updatedUsers = await prisma.user.findMany();

    // Step 3: Update Clerk metadata
    results.metadataSync = await updateClerkUsersWithDatabaseUsers(updatedUsers);
    console.log(`\n📊 Metadata sync complete:`, {
      success: results.metadataSync.success,
      failed: results.metadataSync.failed,
      skipped: results.metadataSync.skipped,
    });

    // Write summary report
    writeSummaryReport(results);

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✨ Database synchronization completed in ${duration}s`);

    // Print final summary
    const totalErrors = Object.values(results).reduce(
      (sum, r) => sum + r.errors.length,
      0,
    );

    if (totalErrors > 0) {
      console.log(
        `\n⚠️  ${totalErrors} errors occurred. Check the error log for details.`,
      );
    }
  } catch (error) {
    console.error('\n❌ Fatal error during synchronization:', error);

    // Log fatal error
    const fatalErrorPath = path.join(CONFIG.logDir, 'fatal-error.json');
    fs.writeFileSync(
      fatalErrorPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          details: error,
        },
        null,
        2,
      ),
    );

    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// Execute Script
// ============================================================================

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n👋 Script execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export {
  main,
  normalizeUserData,
  updateUsersWithClerkId,
  updateClerkUsersWithDatabaseUsers,
};
