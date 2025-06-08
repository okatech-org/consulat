# NextAuth to Better Auth Migration Guide

## Overview

This guide provides a comprehensive roadmap for migrating from NextAuth v5 to Better Auth, maintaining the existing OTP-based authentication system while leveraging Better Auth's modern architecture.

## Why Migrate to Better Auth?

### Better Auth Advantages

1. **Framework Agnostic** - More flexible than NextAuth's Next.js coupling
2. **TypeScript First** - Better type safety and developer experience
3. **Plugin Ecosystem** - Extensible architecture (including official 2FA plugin)
4. **Built-in Features** - Rate limiting, automatic migrations, multi-session support
5. **Modern Architecture** - Cleaner API and better performance
6. **Better 2FA Support** - Official two-factor authentication plugin with OTP support

### Current Implementation Comparison

| Feature | NextAuth v5 (Current) | Better Auth (Target) |
|---------|---------------------|-------------------|
| Session Strategy | JWT | JWT + Database Sessions |
| OTP Support | Custom Implementation | Official 2FA Plugin |
| Rate Limiting | Custom Middleware | Built-in + Configurable |
| Database | Prisma Adapter | Native Prisma Support |
| Type Safety | Partial | Full TypeScript |
| Multi-Session | No | Yes |
| 2FA Methods | OTP only | OTP, TOTP, SMS, Email |

## Migration Strategy

### Phase 1: Preparation (1-2 days)

1. **Audit Current Implementation**
   - Document all auth-dependent features
   - List all protected routes
   - Identify custom auth logic

2. **Setup Development Environment**
   - Create feature branch
   - Install Better Auth dependencies
   - Setup parallel auth system

3. **Database Planning**
   - Review Better Auth schema requirements
   - Plan migration scripts
   - Backup existing data

### Phase 2: Core Implementation (3-5 days)

#### 1. Install Better Auth

```bash
npm install better-auth @better-auth/prisma @better-auth/react
```

#### 2. Create Better Auth Configuration

```typescript
// src/lib/auth/better-auth.config.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma";
import { twoFactor } from "better-auth/plugins";
import { db } from "@/lib/prisma";
import { sendOTPEmail, sendOTPSMS } from "@/lib/services/notifications";

export const auth = betterAuth({
  database: prismaAdapter(db),
  session: {
    type: "jwt",
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  emailAndPassword: {
    enabled: false, // We use OTP-based 2FA only
  },
  plugins: [
    twoFactor({
      // Use OTP as the primary authentication method
      totpIssuer: "Consulat App",
      // Configure to send OTP codes instead of using authenticator apps
      sendOTP: async (user, otp) => {
        // Send OTP based on user's preferred method
        if (user.email) {
          await sendOTPEmail(user.email, otp);
        } else if (user.phoneNumber) {
          await sendOTPSMS(user.phoneNumber, otp);
        }
      },
      // OTP configuration
      otpOptions: {
        // 6-digit codes like the current system
        digits: 6,
        // 5-minute expiration
        period: 300,
        // Custom rate limiting can be added here
      },
    }),
  ],
  // Custom rate limiting configuration
  rateLimit: {
    // Match existing rate limits
    window: 15 * 60, // 15 minutes
    max: 3, // 3 attempts
    // Custom rate limit for OTP validation
    custom: {
      "twoFactor.sendOtp": {
        window: 15 * 60,
        max: 3,
      },
      "twoFactor.verifyOtp": {
        window: 5 * 60,
        max: 5,
      },
    },
  },
});
```

#### 3. Implement Authentication Flow with 2FA Plugin

```typescript
// src/lib/auth/auth-flow.ts
import { auth } from "./better-auth.config";

export async function initiateLogin(identifier: string, type: 'EMAIL' | 'PHONE') {
  try {
    // First, find or create the user
    let user = await findUserByIdentifier(identifier, type);
    
    if (!user) {
      // Create user if doesn't exist (for registration flow)
      user = await createUser({
        email: type === 'EMAIL' ? identifier : undefined,
        phoneNumber: type === 'PHONE' ? identifier : undefined,
      });
    }
    
    // Enable 2FA for the user if not already enabled
    if (!user.twoFactorEnabled) {
      await auth.twoFactor.enable({
        userId: user.id,
        type: "totp", // Using TOTP for OTP codes
      });
    }
    
    // Send OTP code
    const result = await auth.twoFactor.sendOTP({
      userId: user.id,
    });
    
    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Login initiation error:', error);
    return { success: false, error: error.message };
  }
}

export async function verifyLoginOTP(userId: string, otp: string) {
  try {
    // Verify the OTP using the 2FA plugin
    const result = await auth.twoFactor.verifyOTP({
      userId,
      code: otp,
    });
    
    if (result.valid) {
      // Create session after successful OTP verification
      const session = await auth.createSession({
        userId,
      });
      
      return { success: true, session };
    }
    
    return { success: false, error: "Invalid OTP" };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, error: error.message };
  }
}
```

#### 4. Create Migration Middleware

```typescript
// src/lib/auth/migration-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import { auth as betterAuth } from "@/lib/auth/better-auth.config";

export async function authMigrationMiddleware(request: NextRequest) {
  // Check for NextAuth session
  const nextAuthSession = await nextAuth();
  
  if (nextAuthSession) {
    // Migrate session to Better Auth if needed
    const betterAuthSession = await betterAuth.getSession(request);
    
    if (!betterAuthSession) {
      // Create Better Auth session from NextAuth session
      await betterAuth.createSession(nextAuthSession.user.id);
    }
  }
  
  return NextResponse.next();
}
```

### Phase 3: Gradual Migration (5-7 days)

#### 1. Update Authentication Hooks

```typescript
// src/hooks/use-better-auth.ts
import { useBetterAuth } from "@better-auth/react";

export function useAuth() {
  const { user, session, loading } = useBetterAuth();
  
  return {
    user,
    isLoading: loading,
    isAuthenticated: !!session,
  };
}
```

#### 2. Migrate Routes Progressively

Start with less critical routes:

```typescript
// Example: Migrate profile route first
// src/app/(authenticated)/my-space/profile/page.tsx
import { useAuth } from "@/hooks/use-better-auth"; // New hook

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  // Rest of the component
}
```

#### 3. Update API Routes

```typescript
// src/app/api/protected/route.ts
import { auth } from "@/lib/auth/better-auth.config";

export async function GET(request: Request) {
  const session = await auth.getSession(request);
  
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Handle request
}
```

### Phase 4: Database Migration (1-2 days)

#### 1. Update Prisma Schema

```prisma
// Add Better Auth required fields
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  phoneNumber   String?   @unique
  emailVerified Boolean   @default(false) // Better Auth uses Boolean
  name          String?
  roles         UserRole[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Better Auth relations
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  expiresAt    DateTime
  token        String   @unique
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 2. Run Migration Script

```typescript
// scripts/migrate-auth-data.ts
async function migrateAuthData() {
  // Migrate user sessions
  const nextAuthSessions = await getNextAuthSessions();
  
  for (const session of nextAuthSessions) {
    await createBetterAuthSession(session);
  }
  
  // Update emailVerified field type
  await db.$executeRaw`
    ALTER TABLE "User" 
    ALTER COLUMN "emailVerified" 
    TYPE BOOLEAN 
    USING CASE 
      WHEN "emailVerified" IS NOT NULL THEN TRUE 
      ELSE FALSE 
    END
  `;
}
```

### Phase 5: Cleanup (2-3 days)

#### 1. Remove NextAuth Dependencies

```bash
npm uninstall next-auth @auth/prisma-adapter
```

#### 2. Update Environment Variables

```env
# Remove
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Add
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
```

#### 3. Clean Up Old Files

- Remove `/src/auth.ts`
- Remove `/src/app/api/auth/[...nextauth]/route.ts`
- Update imports throughout the codebase

## Testing Strategy

### 1. Unit Tests

```typescript
// tests/auth/otp.test.ts
describe('OTP Authentication', () => {
  it('should generate and validate OTP', async () => {
    const result = await auth.sendOTP({
      identifier: 'test@example.com',
      type: 'EMAIL',
    });
    
    expect(result.success).toBe(true);
  });
});
```

### 2. Integration Tests

- Test login flow end-to-end
- Verify session creation
- Test protected route access
- Validate rate limiting

### 3. Migration Tests

- Verify existing sessions work
- Test gradual migration
- Ensure no data loss

## Rollback Plan

### 1. Feature Flags

```typescript
const USE_BETTER_AUTH = process.env.NEXT_PUBLIC_USE_BETTER_AUTH === 'true';

export const auth = USE_BETTER_AUTH ? betterAuth : nextAuth;
```

### 2. Database Backup

```bash
# Before migration
pg_dump -U user -d database > backup_before_migration.sql
```

### 3. Gradual Rollout

- Deploy to staging first
- Monitor error rates
- A/B test with small user percentage
- Full rollout after validation

## Common Challenges and Solutions

### 1. Session Compatibility

**Challenge**: Different session formats between NextAuth and Better Auth
**Solution**: Use migration middleware to transform sessions

### 2. OTP Implementation Differences

**Challenge**: Moving from custom OTP to Better Auth's 2FA plugin
**Solution**: The 2FA plugin provides all needed functionality:
- Built-in OTP generation and validation
- Configurable expiration and digit length
- Rate limiting support
- Secure token storage

### 3. Type Definitions

**Challenge**: Different type structures
**Solution**: Create adapter types during migration period

```typescript
type UnifiedUser = NextAuthUser | BetterAuthUser;
```

### 4. Client-Side Hooks

**Challenge**: Different hook APIs
**Solution**: Update hooks to use Better Auth's 2FA methods:

```typescript
// Updated OTP hook
import { useTwoFactor } from "@better-auth/react";

export function useAuthOTP() {
  const { sendOTP, verifyOTP, isLoading } = useTwoFactor();
  
  return {
    sendOTP: async (identifier: string, type: 'EMAIL' | 'PHONE') => {
      // Find user and send OTP
      const user = await findUserByIdentifier(identifier, type);
      return sendOTP({ userId: user.id });
    },
    verifyOTP,
    isLoading,
  };
}
```

## Performance Considerations

### 1. Session Caching

Better Auth provides better session caching out of the box:

```typescript
auth.configure({
  session: {
    cache: {
      type: "memory",
      ttl: 60, // 1 minute
    },
  },
});
```

### 2. Database Queries

Better Auth optimizes database queries:
- Fewer round trips
- Better indexing
- Efficient session lookups

## Security Improvements

### 1. Enhanced CSRF Protection

Better Auth provides stronger CSRF protection by default

### 2. Multi-Session Management

Users can manage multiple active sessions

### 3. Better Token Rotation

Automatic token rotation for enhanced security

## Advantages of Using Better Auth's 2FA Plugin

### 1. **Less Code to Maintain**
- No need for custom OTP generation logic
- Built-in rate limiting for 2FA operations
- Automatic token management and expiration

### 2. **Enhanced Security**
- Battle-tested implementation
- Secure token storage with automatic cleanup
- Protection against timing attacks

### 3. **Better User Experience**
- Support for backup codes
- Option to use authenticator apps (Google Authenticator, etc.)
- Flexible delivery methods (SMS, Email, App)

### 4. **Easier Testing**
- Built-in test utilities for 2FA flows
- Mock providers for development
- Consistent API across different 2FA methods

## Post-Migration Checklist

- [ ] All routes migrated
- [ ] Tests passing
- [ ] Performance metrics acceptable
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team trained on Better Auth
- [ ] Monitoring configured
- [ ] Rollback plan tested
- [ ] 2FA plugin properly configured
- [ ] OTP delivery methods tested

## Resources

- [Better Auth Documentation](https://better-auth.com/docs)
- [Migration Examples](https://better-auth.com/docs/migrations)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)

## Timeline Summary

- **Week 1**: Preparation and core implementation
- **Week 2**: Gradual migration and testing
- **Week 3**: Cleanup and optimization
- **Total**: 3 weeks for complete migration

This migration maintains all existing functionality while providing a more modern, flexible authentication system with better performance and developer experience.