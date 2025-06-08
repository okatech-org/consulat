# NextAuth to Better Auth Migration Guide

## Overview

This guide provides a comprehensive roadmap for migrating from NextAuth v5 to Better Auth, maintaining the existing OTP-based authentication system while leveraging Better Auth's modern architecture.

## Why Migrate to Better Auth?

### Better Auth Advantages

1. **Framework Agnostic** - More flexible than NextAuth's Next.js coupling
2. **TypeScript First** - Better type safety and developer experience
3. **Plugin Ecosystem** - Extensible architecture
4. **Built-in Features** - Rate limiting, automatic migrations, multi-session support
5. **Modern Architecture** - Cleaner API and better performance

### Current Implementation Comparison

| Feature | NextAuth v5 (Current) | Better Auth (Target) |
|---------|---------------------|-------------------|
| Session Strategy | JWT | JWT + Database Sessions |
| OTP Support | Custom Implementation | Plugin or Custom |
| Rate Limiting | Custom Middleware | Built-in |
| Database | Prisma Adapter | Native Prisma Support |
| Type Safety | Partial | Full TypeScript |
| Multi-Session | No | Yes |

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
npm install better-auth @better-auth/prisma
```

#### 2. Create Better Auth Configuration

```typescript
// src/lib/auth/better-auth.config.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma";
import { db } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(db),
  session: {
    type: "jwt",
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  emailAndPassword: {
    enabled: false, // We use OTP
  },
  plugins: [
    // Custom OTP plugin (see below)
  ],
});
```

#### 3. Implement OTP Plugin

```typescript
// src/lib/auth/plugins/otp-plugin.ts
import { BetterAuthPlugin } from "better-auth";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";

export const otpPlugin: BetterAuthPlugin = {
  id: "otp",
  endpoints: {
    sendOTP: {
      method: "POST",
      path: "/otp/send",
      handler: async ({ body, context }) => {
        const { identifier, type } = body;
        
        // Generate OTP
        const nanoid = customAlphabet('0123456789', 6);
        const otp = nanoid();
        
        // Hash and store OTP
        const hashedOTP = await bcrypt.hash(otp, 12);
        
        await context.database.verificationToken.create({
          data: {
            identifier,
            token: hashedOTP,
            type,
            expires: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
        
        // Send OTP via notification service
        await sendNotification(identifier, otp, type);
        
        return { success: true };
      },
    },
    validateOTP: {
      method: "POST",
      path: "/otp/validate",
      handler: async ({ body, context }) => {
        const { identifier, otp, type } = body;
        
        // Find token
        const token = await context.database.verificationToken.findFirst({
          where: {
            identifier,
            type,
            expires: { gt: new Date() },
          },
        });
        
        if (!token) {
          throw new Error("Invalid or expired OTP");
        }
        
        // Validate OTP
        const isValid = await bcrypt.compare(otp, token.token);
        
        if (!isValid) {
          throw new Error("Invalid OTP");
        }
        
        // Delete token
        await context.database.verificationToken.delete({
          where: { id: token.id },
        });
        
        // Create or get user
        const user = await context.database.user.findUnique({
          where: type === "EMAIL" 
            ? { email: identifier }
            : { phoneNumber: identifier },
        });
        
        if (!user) {
          throw new Error("User not found");
        }
        
        // Create session
        const session = await context.auth.createSession(user.id);
        
        return { user, session };
      },
    },
  },
};
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

### 2. OTP Rate Limiting

**Challenge**: Better Auth's built-in rate limiting differs from custom implementation
**Solution**: Configure Better Auth rate limiting to match existing limits

### 3. Type Definitions

**Challenge**: Different type structures
**Solution**: Create adapter types during migration period

```typescript
type UnifiedUser = NextAuthUser | BetterAuthUser;
```

### 4. Client-Side Hooks

**Challenge**: Different hook APIs
**Solution**: Create wrapper hooks that work with both

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

## Post-Migration Checklist

- [ ] All routes migrated
- [ ] Tests passing
- [ ] Performance metrics acceptable
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team trained on Better Auth
- [ ] Monitoring configured
- [ ] Rollback plan tested

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