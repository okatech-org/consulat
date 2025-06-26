# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `yarn dev` - Start development server with HTTPS
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn preview` - Build and start locally

### Code Quality
- `yarn check` - Run linting and TypeScript checks (run this before committing)
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn typecheck` - Check TypeScript types
- `yarn format:write` - Format code with Prettier
- `yarn test` - Run tests with Vitest

### Database
- `yarn db:push` - Push schema changes to database
- `yarn db:generate` - Generate Prisma client
- `yarn db:migrate` - Deploy migrations
- `yarn db:studio` - Open Prisma Studio
- `yarn db:server` - Start PostgreSQL via Docker

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode - NO any types allowed)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **UI**: Shadcn UI components with Radix UI
- **State**: Zustand for client state
- **Validation**: Zod schemas everywhere

### Key Architectural Patterns

1. **Server Actions Only**: This project uses Next.js Server Actions exclusively for all server operations. Never create API routes - always use server actions in `src/actions/`.

2. **Directory Structure**:
   - `src/actions/` - All server actions (backend logic)
   - `src/app/(authenticated)/` - Protected routes requiring login
   - `src/app/(public)/` - Public accessible routes
   - `src/components/` - React components organized by feature
   - `src/schemas/` - Zod validation schemas
   - `src/lib/` - Utilities and service integrations

3. **Authentication Flow**:
   - Better Auth handles authentication
   - Middleware protects routes based on roles
   - Roles: USER, AGENT, MANAGER, ADMIN, SUPERADMIN
   - Session validation in all server actions

4. **Data Flow Pattern**:
   ```
   Client Component → Server Action → Prisma → PostgreSQL
   ```
   - Always validate with Zod schemas
   - Use `useTransition` for optimistic updates
   - Handle errors with proper user feedback

5. **Type Safety Requirements**:
   - NEVER use `any` type
   - All functions must have explicit return types
   - All components must have typed props
   - Use Zod schemas for runtime validation

### Critical Development Rules

1. **TypeScript Strictness**:
   ```typescript
   // ❌ NEVER do this
   const data: any = await fetch();
   
   // ✅ Always specify types
   const data: UserData = await fetch();
   ```

2. **Server Actions Pattern**:
   ```typescript
   // Always in src/actions/
   'use server';
   
   export async function createUser(data: CreateUserInput) {
     const validated = createUserSchema.parse(data);
     // Direct Prisma access
     return await prisma.user.create({ data: validated });
   }
   ```

3. **Component Imports**:
   ```typescript
   // Always use absolute imports
   import { Button } from '@/components/ui/button';
   // Never relative imports for components
   ```

4. **Internationalization**:
   - All user-facing text must use next-intl
   - Keys in `src/i18n/messages/`
   - Use `useTranslations` hook in components

5. **Security**:
   - Validate all inputs with Zod
   - Check user permissions in server actions
   - Never expose sensitive data in client components
   - Use environment variables for secrets

### Common Workflows

1. **Adding a New Feature**:
   - Create Zod schema in `src/schemas/`
   - Create server action in `src/actions/`
   - Create UI components in `src/components/`
   - Add translations in `src/i18n/messages/`

2. **Database Changes**:
   - Modify `prisma/schema.prisma`
   - Run `yarn db:push` for development
   - Run `yarn db:generate` to update client

3. **Before Committing**:
   - Run `yarn check` to ensure no errors
   - Fix any TypeScript or lint issues
   - Test the feature manually

### Service Integrations

- **File Uploads**: UploadThing (configured in `src/lib/uploadthing.ts`)
- **Email**: Resend with React Email templates
- **SMS**: Twilio/Vonage providers
- **AI**: Google Gemini and Anthropic Claude
- **Translations**: DeepL API

### Important Context

This is a government application for Gabonese consular services. It handles sensitive user data including:
- Personal identification documents
- Passport applications
- Civil status documents
- Appointment scheduling

Always prioritize security, data privacy, and proper validation when working with user data.