import { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/nextjs/server';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface CreateUserError {
  timestamp: string;
  operation: string;
  userId: string;
  userData: {
    email?: string | null;
    phoneNumber?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  error: string;
  errorCode?: string;
  details?: any;
}

interface CreateUserResult {
  success: number;
  failed: number;
  skipped: number;
  errors: CreateUserError[];
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  batchSize: 5, // Clerk has strict rate limits for user creation
  retryAttempts: 2,
  retryDelay: 2000, // ms - longer delay for user creation
  logDir: './logs',
  errorLogFile: `create-clerk-users-errors-${new Date().toISOString().split('T')[0]}.json`,
  summaryLogFile: `create-clerk-users-summary-${new Date().toISOString().split('T')[0]}.json`,
  dryRun: process.env.DRY_RUN === 'true', // Set DRY_RUN=true to test without creating users
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
 * Validate and normalize phone number for Clerk
 */
function normalizePhoneForClerk(phoneNumber: string | null): string | undefined {
  if (!phoneNumber) return undefined;

  // Remove all spaces, dashes, and dots
  let cleaned = phoneNumber.replace(/[\s\-\.()]/g, '');

  // Handle French numbers without country code
  if (cleaned.match(/^0[1-9]\d{8}$/)) {
    cleaned = '+33' + cleaned.substring(1);
  }

  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    console.warn(`⚠️  Phone number doesn't start with +: ${phoneNumber}`);
    return undefined;
  }

  // Validate E.164 format (+[country code][number])
  if (!cleaned.match(/^\+[1-9]\d{1,14}$/)) {
    console.warn(`⚠️  Invalid phone format for Clerk: ${phoneNumber}`);
    return undefined;
  }

  return cleaned;
}

/**
 * Normalize email for Clerk
 */
function normalizeEmailForClerk(email: string | null): string | undefined {
  if (!email) return undefined;

  const normalized = email.toLowerCase().trim();

  // Basic email validation
  if (!normalized.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    console.warn(`⚠️  Invalid email format: ${email}`);
    return undefined;
  }

  return normalized;
}

/**
 * Get user's name from Profile or User, with fallback
 */
function getUserNames(user: any): { firstName: string; lastName: string } {
  // First try to get from Profile if it exists
  if (user.profile) {
    if (user.profile.firstName && user.profile.lastName) {
      return {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      };
    }
    // If profile exists but names are partial
    if (user.profile.firstName) {
      return {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName || '.',
      };
    }
  }

  // Fallback to user.name or empty defaults
  if (user.name && user.name.trim()) {
    return {
      firstName: user.name.trim(),
      lastName: '.',
    };
  }

  // Final fallback
  return {
    firstName: 'User',
    lastName: '.',
  };
}

/**
 * Log error to file
 */
function logError(error: CreateUserError, errors: CreateUserError[]) {
  errors.push(error);

  const errorLogPath = path.join(CONFIG.logDir, CONFIG.errorLogFile);
  fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2));
}

/**
 * Write summary report
 */
function writeSummaryReport(result: CreateUserResult) {
  const summaryPath = path.join(CONFIG.logDir, CONFIG.summaryLogFile);

  const summary = {
    timestamp: new Date().toISOString(),
    dryRun: CONFIG.dryRun,
    results: {
      success: result.success,
      failed: result.failed,
      skipped: result.skipped,
      totalErrors: result.errors.length,
    },
    errorSummary: result.errors.map((e) => ({
      userId: e.userId,
      error: e.error,
      errorCode: e.errorCode,
    })),
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n📄 Summary report written to:', summaryPath);
  if (result.errors.length > 0) {
    console.log(
      '📄 Error details written to:',
      path.join(CONFIG.logDir, CONFIG.errorLogFile),
    );
  }
}

/**
 * Check if user already exists in Clerk
 */
async function checkClerkUserExists(
  email?: string,
  phoneNumber?: string,
): Promise<string | null> {
  try {
    // Check by email first
    if (email) {
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
        limit: 1,
      });
      if (users.data.length > 0) {
        return users.data[0]?.id || null;
      }
    }

    // Check by phone number
    if (phoneNumber) {
      const users = await clerkClient.users.getUserList({
        phoneNumber: [phoneNumber],
        limit: 1,
      });
      if (users.data.length > 0) {
        return users.data[0]?.id || null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking Clerk user existence:', error);
    return null;
  }
}

/**
 * Create a Clerk user from database user
 */
async function createClerkUser(user: any): Promise<string | null> {
  const normalizedEmail = normalizeEmailForClerk(user.email);
  const normalizedPhone = normalizePhoneForClerk(user.phoneNumber);

  // Must have at least email or phone
  if (!normalizedEmail && !normalizedPhone) {
    throw new Error('User must have either a valid email or phone number');
  }

  // Get names with profile priority
  const { firstName, lastName } = getUserNames(user);

  // Build Clerk user data
  const clerkUserData: any = {
    firstName: firstName,
    lastName: lastName,
  };

  // Add email if available
  if (normalizedEmail) {
    clerkUserData.emailAddress = [normalizedEmail];
    // Skip email verification since these are existing users
    clerkUserData.skipEmailVerification = true;
  }

  // Add phone if available
  if (normalizedPhone) {
    clerkUserData.phoneNumber = [normalizedPhone];
    // Skip phone verification since these are existing users
    clerkUserData.skipPhoneVerification = true;
  }

  // Add public metadata
  clerkUserData.publicMetadata = {
    profileId: user.profileId,
    roles: user.roles,
    countryCode: user.countryCode,
    assignedOrganizationId: user.assignedOrganizationId,
    organizationId: user.organizationId,
    migratedFromDb: true,
    migrationDate: new Date().toISOString(),
  };

  // Add private metadata
  clerkUserData.privateMetadata = {
    dbUserId: user.id,
    migrationSource: 'database-sync-script',
  };

  if (CONFIG.dryRun) {
    console.log('🔵 [DRY RUN] Would create Clerk user:', {
      email: normalizedEmail,
      phone: normalizedPhone,
      firstName,
      lastName,
    });
    return 'dry-run-clerk-id';
  }

  try {
    const clerkUser = await clerkClient.users.createUser(clerkUserData);
    return clerkUser.id;
  } catch (error: any) {
    // Handle specific Clerk errors
    if (error?.errors) {
      const clerkError = error.errors[0];
      if (clerkError?.code === 'form_identifier_exists') {
        // User already exists, try to find them
        const existingId = await checkClerkUserExists(normalizedEmail, normalizedPhone);
        if (existingId) {
          console.log(`ℹ️  User already exists in Clerk with ID: ${existingId}`);
          return existingId;
        }
      }
    }
    throw error;
  }
}

// ============================================================================
// Main Operation
// ============================================================================

/**
 * Create Clerk users for database users without clerkId
 */
async function createClerkUsersFromDatabase(): Promise<CreateUserResult> {
  console.log('\n🚀 Starting Clerk user creation from database...');
  if (CONFIG.dryRun) {
    console.log('🔵 Running in DRY RUN mode - no users will be created');
  }

  const result: CreateUserResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Fetch users without Clerk ID
    const users = await prisma.user.findMany({
      where: {
        OR: [{ clerkId: null }, { clerkId: '' }, { clerkId: 'undefined' }],
      },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Process oldest users first
      },
    });

    console.log(`📊 Found ${users.length} users without Clerk ID`);

    if (users.length === 0) {
      console.log('✅ All users already have Clerk IDs');
      return result;
    }

    // Process users in batches
    for (let i = 0; i < users.length; i += CONFIG.batchSize) {
      const batch = users.slice(i, Math.min(i + CONFIG.batchSize, users.length));
      console.log(
        `\n📦 Processing batch ${Math.floor(i / CONFIG.batchSize) + 1} (${batch.length} users)`,
      );

      for (const user of batch) {
        const progress = users.indexOf(user) + 1;
        console.log(`\n[${progress}/${users.length}] Processing user ${user.id}`);

        // Skip users without email AND phone
        if (!user.email && !user.phoneNumber) {
          console.log(`⏭️  Skipping user ${user.id} - no email or phone number`);
          result.skipped++;

          logError(
            {
              timestamp: new Date().toISOString(),
              operation: 'createClerkUser',
              userId: user.id,
              userData: {
                email: user.email,
                phoneNumber: user.phoneNumber,
                firstName: user.profile?.firstName || user.name || null,
                lastName: user.profile?.lastName || null,
              },
              error: 'No email or phone number available',
            },
            result.errors,
          );

          continue;
        }

        try {
          // Check if user already exists in Clerk
          const existingClerkId = await checkClerkUserExists(
            user.email || undefined,
            user.phoneNumber || undefined,
          );

          let clerkId: string | null = null;

          if (existingClerkId) {
            console.log(`✓ User already exists in Clerk: ${existingClerkId}`);
            clerkId = existingClerkId;
          } else {
            // Create new Clerk user
            console.log(`📝 Creating Clerk user for ${user.email || user.phoneNumber}`);
            clerkId = await createClerkUser(user);

            if (!clerkId) {
              throw new Error('Failed to create Clerk user - no ID returned');
            }

            console.log(`✅ Created Clerk user: ${clerkId}`);
          }

          // Update database with Clerk ID
          if (!CONFIG.dryRun && clerkId && clerkId !== 'dry-run-clerk-id') {
            await prisma.user.update({
              where: { id: user.id },
              data: { clerkId },
            });
            console.log(`💾 Updated database user ${user.id} with Clerk ID: ${clerkId}`);
          }

          result.success++;
        } catch (error: any) {
          console.error(`❌ Failed to process user ${user.id}:`, error?.message || error);

          const errorCode = error?.errors?.[0]?.code || 'unknown';

          logError(
            {
              timestamp: new Date().toISOString(),
              operation: 'createClerkUser',
              userId: user.id,
              userData: {
                email: user.email,
                phoneNumber: user.phoneNumber,
                firstName: user.name,
                lastName: null,
              },
              error: error?.message || String(error),
              errorCode,
              details: error,
            },
            result.errors,
          );

          result.failed++;
        }
      }

      // Add delay between batches to respect rate limits
      if (i + CONFIG.batchSize < users.length) {
        console.log(`\n⏸️  Waiting ${CONFIG.retryDelay}ms before next batch...`);
        await sleep(CONFIG.retryDelay);
      }
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    throw error;
  }

  return result;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🚀 Starting Clerk user creation script...');
  console.log(`📁 Logs will be saved to: ${path.resolve(CONFIG.logDir)}`);

  const startTime = Date.now();

  try {
    // Check Clerk API key
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY environment variable is not set');
    }

    // Run the creation process
    const result = await createClerkUsersFromDatabase();

    // Write summary report
    writeSummaryReport(result);

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Print final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Success: ${result.success} users`);
    console.log(`❌ Failed: ${result.failed} users`);
    console.log(`⏭️  Skipped: ${result.skipped} users`);
    console.log(`⏱️  Duration: ${duration} seconds`);

    if (CONFIG.dryRun) {
      console.log('\n🔵 This was a DRY RUN - no actual changes were made');
    }

    if (result.errors.length > 0) {
      console.log(
        `\n⚠️  ${result.errors.length} errors occurred. Check the error log for details.`,
      );
      console.log('\nMost common errors:');

      // Group errors by type
      const errorCounts: Record<string, number> = {};
      result.errors.forEach((e) => {
        const key = e.errorCode || e.error;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });

      Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([error, count]) => {
          console.log(`  - ${error}: ${count} occurrences`);
        });
    }
  } catch (error) {
    console.error('\n💥 Fatal error:', error);

    // Log fatal error
    const fatalErrorPath = path.join(CONFIG.logDir, 'create-users-fatal-error.json');
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
  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--dry-run')) {
    CONFIG.dryRun = true;
  }

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

export { main, createClerkUsersFromDatabase };
