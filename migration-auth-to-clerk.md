# Rapport de Migration : Auth.js vers Clerk

## Vue d'ensemble

Ce rapport détaille tous les endroits qui devront être retravaillés lors de la migration de l'authentification d'Auth.js vers Clerk dans l'application Consulat.ga.

## 1. Dépendances et Configuration

### 1.1 Dépendances à remplacer

**Fichier : `package.json`**

**À supprimer :**

```json
{
  "dependencies": {
    "@auth/prisma-adapter": "^2.7.2",
    "next-auth": "5.0.0-beta.25"
  }
}
```

**À ajouter :**

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.0.0"
  }
}
```

### 1.2 Variables d'environnement

**Fichier : `.env.local`**

**À supprimer :**

```env
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

**À ajouter :**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
```

## 2. Configuration d'Authentification

### 2.1 Configuration Auth.js (À supprimer)

**Fichiers à supprimer complètement :**

- `src/server/auth/config.ts`
- `src/server/auth/index.ts`
- `src/server/auth/auth-providers.ts`
- `src/app/api/auth/[...nextauth]/route.ts`

### 2.2 Configuration Clerk (À créer)

**Nouveau fichier : `src/lib/clerk.ts`**

```typescript
import { clerkClient } from '@clerk/nextjs/server';

export { clerkClient };
```

**Nouveau fichier : `src/middleware.ts` (remplacer l'existant)**

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/my-space(.*)',
  '/intel(.*)',
  '/profile(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

## 3. Layout et Providers

### 3.1 Root Layout

**Fichier : `src/app/layout.tsx`**

**Modifications nécessaires :**

```typescript
// Remplacer
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/server/auth';

// Par
import { ClerkProvider } from '@clerk/nextjs';

// Dans le composant
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Supprimer
  const session = await auth();
  const roleData = session ? await loadRoleBasedData() : null;

  return (
    <html lang={locale} className={geist.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <TRPCReactProvider>
            <ClerkProvider>
              <RoleBasedDataProvider initialData={null}>
                <Providers>{children}</Providers>
              </RoleBasedDataProvider>
            </ClerkProvider>
          </TRPCReactProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

## 4. Hooks et Utilitaires d'Authentification

### 4.1 Hooks personnalisés

**Fichier : `src/hooks/use-auth.ts` (À remplacer complètement)**

```typescript
'use client';

import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();

  return {
    user: user
      ? {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName,
          image: user.imageUrl,
          role: user.publicMetadata?.role || 'USER',
          roles: user.publicMetadata?.roles || ['USER'],
        }
      : null,
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn,
  };
}
```

### 4.2 Utilitaires serveur

**Fichier : `src/lib/auth/utils.ts` (À remplacer complètement)**

```typescript
import { auth } from '@clerk/nextjs/server';

export async function getCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) return null;

    // Récupérer les données utilisateur depuis Clerk
    const user = await clerkClient.users.getUser(userId);

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: user.fullName,
      image: user.imageUrl,
      role: user.publicMetadata?.role || 'USER',
      roles: user.publicMetadata?.roles || ['USER'],
    };
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}
```

**Fichier : `src/lib/auth/action.ts` (À remplacer complètement)**

```typescript
import { auth } from '@clerk/nextjs/server';
import { UserRole } from '@prisma/client';
import { hasAnyRole } from '../permissions/utils';
import type { SessionUser } from '@/types';

export async function checkAuth(roles?: UserRole[]) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('unauthorized');
  }

  const user = await clerkClient.users.getUser(userId);
  const userRoles = user.publicMetadata?.roles || ['USER'];

  if (roles && !hasAnyRole({ roles: userRoles } as SessionUser, roles)) {
    throw new Error('forbidden');
  }

  return {
    user: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: user.fullName,
      image: user.imageUrl,
      role: user.publicMetadata?.role || 'USER',
      roles: userRoles,
    },
  };
}
```

## 5. Composants d'Authentification

### 5.1 Formulaire de connexion

**Fichier : `src/components/auth/login-form.tsx` (À remplacer complètement)**

```typescript
'use client';

import { SignIn } from '@clerk/nextjs';

export function LoginForm() {
  return (
    <div className="flex justify-center">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            card: 'shadow-lg',
          }
        }}
        redirectUrl="/my-space"
      />
    </div>
  );
}
```

### 5.2 Formulaire d'inscription

**Fichier : `src/components/auth/signup-form.tsx` (À remplacer complètement)**

```typescript
'use client';

import { SignUp } from '@clerk/nextjs';

export function SignupForm() {
  return (
    <div className="flex justify-center">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            card: 'shadow-lg',
          }
        }}
        redirectUrl="/profile/complete"
      />
    </div>
  );
}
```

### 5.3 Bouton de déconnexion

**Fichier : `src/components/ui/logout-button.tsx` (À modifier)**

```typescript
'use client';

import { useClerk } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogOutIcon } from 'lucide-react';

export function LogoutButton({ customClass, redirectUrl }: LogoutButtonProps) {
  const t = useTranslations('auth.actions');
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut({ redirectUrl: redirectUrl || '/' });
  };

  return (
    <Button
      onClick={handleLogout}
      type="button"
      variant="ghost"
      className={`w-max ${customClass || ''}`}
      leftIcon={<LogOutIcon className={'size-icon'} />}
    >
      {t('logout')}
    </Button>
  );
}
```

### 5.4 Navigation utilisateur

**Fichier : `src/components/ui/nav-user.tsx` (À modifier)**

```typescript
'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

export function NavUser() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
          }
        }}
      />
    </div>
  );
}
```

## 6. Server Actions

### 6.1 Actions d'authentification

**Fichier : `src/actions/auth.ts` (À modifier)**

```typescript
'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/server/db';

export async function isUserExists(id?: string, email?: string, phoneNumber?: string) {
  // Logique inchangée pour la vérification en base
  const user = await db.user.findFirst({
    where: {
      OR: [
        ...(id ? [{ id }] : []),
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
    },
  });
  return Boolean(user);
}

export const checkUserExists = async (identifier: string, type: 'email' | 'phone') => {
  'use server';

  try {
    if (type === 'email') {
      const user = await db.user.findUnique({
        where: { email: identifier },
      });
      return { exists: !!user };
    } else {
      const user = await db.user.findUnique({
        where: { phoneNumber: identifier },
      });
      return { exists: !!user };
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    return { exists: false, error: 'Database error' };
  }
};
```

### 6.2 Actions utilisateur

**Fichier : `src/actions/user.ts` (À modifier)**

```typescript
'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/server/db';
import type { User } from '@prisma/client';
import type { SessionUser } from '@/types';

export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const { userId } = await auth();

  if (!userId) return null;

  const clerkUser = await clerkClient.users.getUser(userId);

  return {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    name: clerkUser.fullName,
    image: clerkUser.imageUrl,
    role: clerkUser.publicMetadata?.role || 'USER',
    roles: clerkUser.publicMetadata?.roles || ['USER'],
  } as SessionUser;
};

export const checkUserExist = async (userId?: string) => {
  // Logique inchangée
};
```

## 7. Base de Données

### 7.1 Modèles à adapter

**Fichier : `prisma/schema.prisma`**

**Modèles à supprimer :**

- `Session` (lignes 90-98)
- `Account` (lignes 100-118)
- `VerificationToken` (lignes 120-127)
- `OTPCode` (lignes 130-143)

**Modèle User à modifier :**

```prisma
model User {
  id                  String     @id @default(cuid())
  name                String?
  roles               UserRole[] @default([USER])
  role                UserRole   @default(USER)
  email               String?    @unique
  phoneNumber         String?    @unique
  phoneNumberVerified Boolean    @default(false)
  emailVerified       DateTime?
  image               String?
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  // Supprimer ces relations
  // sessions            Session[]
  // accounts            Account[]

  // Ajouter le champ Clerk ID
  clerkId             String     @unique

  // ... reste des relations inchangées
}
```

### 7.2 Migration de données

**Script de migration nécessaire :**

```typescript
// scripts/migrate-to-clerk.ts
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/server/db';

async function migrateUsersToClerk() {
  const users = await db.user.findMany();

  for (const user of users) {
    try {
      // Créer l'utilisateur dans Clerk
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [user.email!],
        phoneNumber: user.phoneNumber,
        firstName: user.name?.split(' ')[0],
        lastName: user.name?.split(' ').slice(1).join(' '),
        publicMetadata: {
          role: user.role,
          roles: user.roles,
        },
      });

      // Mettre à jour l'utilisateur en base avec l'ID Clerk
      await db.user.update({
        where: { id: user.id },
        data: { clerkId: clerkUser.id },
      });

      console.log(`Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`Failed to migrate user ${user.email}:`, error);
    }
  }
}
```

## 8. Middleware et Protection des Routes

### 8.1 Middleware existant

**Fichier : `src/middleware.ts` (À remplacer complètement)**

Le middleware actuel ne gère que le thème. Il faut le remplacer par le middleware Clerk :

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/my-space(.*)',
  '/intel(.*)',
  '/profile(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 8.2 Protection des routes

**Fichier : `src/components/layouts/route-auth-guard.tsx` (À modifier)**

```typescript
'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export interface BaseLayoutProps {
  children: React.ReactNode;
  roles?: UserRole[];
  fallbackUrl?: string;
  fallbackComponent?: React.ReactNode;
}

export function RouteAuthGuard({
  children,
  roles,
  fallbackUrl,
  fallbackComponent,
}: BaseLayoutProps) {
  const { isSignedIn, isLoaded, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(fallbackUrl || '/auth/login');
    }
  }, [isLoaded, isSignedIn, router, fallbackUrl]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return fallbackComponent || null;
  }

  // Vérification des rôles si nécessaire
  if (roles && user) {
    const userRoles = user.publicMetadata?.roles || ['USER'];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      router.push('/unauthorized');
      return null;
    }
  }

  return <>{children}</>;
}
```

## 9. Hooks et Contextes

### 9.1 Hook de dashboard

**Fichier : `src/hooks/use-dashboard.ts` (À modifier)**

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { api } from '@/trpc/react';
import { useMemo } from 'react';

export function useDashboard(options?: {
  agentId?: string;
  managerId?: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}) {
  const { user, isLoaded } = useUser();
  const userRoles = user?.publicMetadata?.roles || [];
  const organizationId = getOrganizationIdFromUser(user);

  // ... reste de la logique inchangée
}
```

### 9.2 Contextes de données

**Fichier : `src/contexts/role-data-context.tsx` (À modifier)**

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { createContext, useContext, ReactNode } from 'react';

// Adapter le contexte pour utiliser les données Clerk
export function RoleBasedDataProvider({
  children,
  initialData
}: {
  children: ReactNode;
  initialData: any;
}) {
  const { user, isLoaded } = useUser();

  const roleData = useMemo(() => {
    if (!user) return null;

    return {
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
        image: user.imageUrl,
        role: user.publicMetadata?.role || 'USER',
        roles: user.publicMetadata?.roles || ['USER'],
      },
      // ... autres données
    };
  }, [user]);

  return (
    <RoleDataContext.Provider value={roleData}>
      {children}
    </RoleDataContext.Provider>
  );
}
```

## 10. Pages d'Authentification

### 10.1 Pages de connexion/inscription

**Fichier : `src/app/auth/login/page.tsx` (À créer)**

```typescript
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            card: 'shadow-lg',
          }
        }}
        redirectUrl="/my-space"
      />
    </div>
  );
}
```

**Fichier : `src/app/auth/signup/page.tsx` (À créer)**

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            card: 'shadow-lg',
          }
        }}
        redirectUrl="/profile/complete"
      />
    </div>
  );
}
```

## 11. Configuration des Webhooks

### 11.1 Webhook Clerk

**Fichier : `src/app/api/webhooks/clerk/route.ts` (À créer)**

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/server/db';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await db.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name} ${last_name}`.trim(),
        image: image_url,
        role: 'USER',
        roles: ['USER'],
      },
    });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await db.user.update({
      where: { clerkId: id },
      data: {
        email: email_addresses[0]?.email_address,
        name: `${first_name} ${last_name}`.trim(),
        image: image_url,
      },
    });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    await db.user.delete({
      where: { clerkId: id },
    });
  }

  return new Response('', { status: 200 });
}
```

## 12. Tests et Validation

### 12.1 Tests à adapter

Tous les tests utilisant `useSession`, `signIn`, `signOut` devront être adaptés pour utiliser les hooks Clerk correspondants.

### 12.2 Validation de la migration

1. **Vérifier la connexion/déconnexion**
2. **Tester la protection des routes**
3. **Valider la synchronisation des données utilisateur**
4. **Contrôler les webhooks**
5. **Tester les rôles et permissions**

## 13. Plan de Migration

### Phase 1 : Préparation

1. Installer Clerk et configurer les variables d'environnement
2. Créer les composants Clerk de base
3. Configurer les webhooks

### Phase 2 : Migration des composants

1. Remplacer les composants d'authentification
2. Adapter les hooks et utilitaires
3. Modifier le middleware

### Phase 3 : Migration des données

1. Créer le script de migration des utilisateurs
2. Exécuter la migration
3. Mettre à jour le schéma de base de données

### Phase 4 : Tests et validation

1. Tests fonctionnels complets
2. Validation des performances
3. Tests de sécurité

### Phase 5 : Déploiement

1. Déploiement en staging
2. Tests en production
3. Déploiement final

## 14. Risques et Considérations

### 14.1 Risques identifiés

- **Perte de données utilisateur** lors de la migration
- **Interruption de service** pendant la migration
- **Incompatibilité** avec certains composants existants
- **Problèmes de performance** avec les webhooks

### 14.2 Mitigation

- **Sauvegarde complète** avant migration
- **Migration par étapes** avec rollback possible
- **Tests approfondis** en environnement de staging
- **Monitoring** des performances après migration

## 15. Estimation du Temps

- **Phase 1** : 2-3 jours
- **Phase 2** : 5-7 jours
- **Phase 3** : 2-3 jours
- **Phase 4** : 3-4 jours
- **Phase 5** : 1-2 jours

**Total estimé : 13-19 jours de développement**

## Conclusion

Cette migration représente un changement majeur dans l'architecture d'authentification de l'application. Bien que Clerk offre de nombreux avantages (composants préconstruits, gestion des sessions, sécurité renforcée), la migration nécessite une planification minutieuse et des tests approfondis pour garantir une transition en douceur.

Il est recommandé de procéder par étapes et de maintenir une branche de rollback pendant toute la durée de la migration.

