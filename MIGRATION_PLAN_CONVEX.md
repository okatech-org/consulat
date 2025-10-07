# Plan de Migration vers Convex - Scope Utilisateur

## 📋 Vue d'ensemble

Ce document détaille la stratégie de migration de l'architecture actuelle (Prisma + tRPC + Server Actions) vers une architecture optimisée Convex + Next.js pour le scope utilisateur (authentification et /my-space).

### Objectifs de la migration

- ✅ Éliminer complètement tRPC et ses dépendances
- ✅ Remplacer les Server Actions par des Convex actions
- ✅ Migrer de Prisma vers Convex Database
- ✅ Optimiser pour Convex + Next.js sans compromis
- ✅ Maintenir toutes les fonctionnalités existantes
- ✅ Améliorer les performances temps réel

### Architecture actuelle vs Architecture cible

| Composant           | Actuel              | Convex                               |
| ------------------- | ------------------- | ------------------------------------ |
| **Base de données** | Prisma + PostgreSQL | Convex Database                      |
| **API Layer**       | tRPC Routers        | Convex Functions (queries/mutations) |
| **Server Logic**    | Server Actions      | Convex Actions                       |
| **Auth**            | Clerk + Prisma      | Clerk + Convex Auth                  |
| **État Client**     | React Query + tRPC  | Convex React Hooks                   |
| **Subscriptions**   | Polling             | Reactive subscriptions               |
| **File Storage**    | UploadThing         | Convex File Storage                  |

---

## 🎯 Scope de la Phase 1 : Authentification et Espace Utilisateur

### 1. Authentification (Sign-in / Sign-up)

#### 📂 Fichiers concernés

```
src/app/(public)/
├── sign-in/[[...sign-in]]/page.tsx
├── sign-up/[[...sign-up]]/page.tsx
src/server/api/routers/auth/auth.ts
src/actions/auth.ts
```

#### 🔄 Fonctionnalités à migrer

**A. Inscription utilisateur**

- **Actuel**: `authRouter.createUser` (tRPC) + `authRouter.handleNewUser`
- **Migration vers**: `convex/functions/users/createUser.ts`
  ```typescript
  // Nouvelle implémentation Convex optimisée
  export const createUser = mutation({
    args: {
      clerkUserId: v.string(),
      email: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      firstName: v.string(),
      lastName: v.string(),
      countryCode: v.string(),
    },
    handler: async (ctx, args) => {
      // Logique optimisée Convex
      // Vérification unicité (email/phone)
      // Création user + profile en une transaction
      // Sync métadonnées Clerk
    },
  });
  ```

**B. Récupération des pays actifs**

- **Actuel**: `authRouter.getActiveCountries`
- **Migration vers**: `convex/functions/countries/getActiveCountries.ts`
  ```typescript
  export const getActiveCountries = query({
    args: {},
    returns: v.array(
      v.object({
        _id: v.id('countries'),
        name: v.string(),
        code: v.string(),
        flag: v.optional(v.string()),
      }),
    ),
    handler: async (ctx) => {
      return await ctx.db
        .query('countries')
        .withIndex('by_status', (q) => q.eq('status', 'active'))
        .order('asc')
        .collect();
    },
  });
  ```

**C. Vérification utilisateur existant**

- **Actuel**: `checkUserExists` (Server Action)
- **Migration vers**: `convex/functions/users/checkUserExists.ts`
  ```typescript
  export const checkUserExists = query({
    args: {
      email: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const user = await ctx.db
        .query('users')
        .filter((q) =>
          q.or(
            args.email ? q.eq(q.field('email'), args.email) : false,
            args.phoneNumber ? q.eq(q.field('phoneNumber'), args.phoneNumber) : false,
          ),
        )
        .first();

      return { exists: !!user };
    },
  });
  ```

#### 🎨 Composants UI à adapter

```typescript
// Avant (tRPC)
const { data: countries } = api.auth.getActiveCountries.useQuery();

// Après (Convex)
const countries = useQuery(api.countries.getActiveCountries);
```

---

### 2. Dashboard Utilisateur (/my-space)

#### 📂 Fichiers concernés

```
src/app/(authenticated)/my-space/
├── page.tsx
├── _components/
│   ├── user-overview.tsx
│   ├── current-request-card.tsx
│   ├── quick-actions.tsx
│   ├── recent-history.tsx
│   └── contact-methods.tsx
```

#### 🔄 Fonctionnalités à migrer

**A. Vue d'ensemble utilisateur (UserOverview)**

**Actuel** :

```typescript
const { data: profile } = api.profile.getCurrent.useQuery();
const { data: requests } = api.requests.getList.useQuery({});
const { data: documents } = api.documents.getUserDocuments.useQuery();
```

**Migration Convex optimisée** :

1. **Créer une query agrégée pour le dashboard**

   ```typescript
   // convex/functions/users/getDashboardData.ts
   export const getDashboardData = query({
     args: {},
     handler: async (ctx) => {
       const identity = await ctx.auth.getUserIdentity();
       if (!identity) throw new Error('Not authenticated');

       const user = await ctx.db
         .query('users')
         .withIndex('by_user_id', (q) => q.eq('userId', identity.subject))
         .first();

       if (!user) throw new Error('User not found');

       // Profile avec données essentielles
       const profile = await ctx.db
         .query('profiles')
         .withIndex('by_user', (q) => q.eq('userId', user._id))
         .first();

       // Requests (limitées pour performance)
       const requests = await ctx.db
         .query('requests')
         .withIndex('by_requester', (q) => q.eq('requesterId', user._id))
         .order('desc')
         .take(10);

       // Documents count
       const documentsCount = await ctx.db
         .query('documents')
         .withIndex('by_owner', (q) =>
           q.eq('ownerId', profile?._id).eq('ownerType', 'profile'),
         )
         .collect()
         .then((docs) => docs.length);

       // Stats calculées
       const stats = {
         inProgress: requests.filter((r) =>
           ['draft', 'submitted', 'pending'].includes(r.status),
         ).length,
         completed: requests.filter((r) => r.status === 'completed').length,
         pending: requests.filter((r) => r.status === 'draft').length,
       };

       return {
         user,
         profile,
         requests,
         documentsCount,
         stats,
       };
     },
   });
   ```

2. **Utilisation optimisée dans le composant**
   ```typescript
   // src/app/(authenticated)/my-space/_components/user-overview.tsx
   export function UserOverview() {
     const dashboardData = useQuery(api.users.getDashboardData);

     if (dashboardData === undefined) {
       return <LoadingSkeleton variant="card" />;
     }

     if (dashboardData === null) {
       return <ErrorState />;
     }

     const { profile, stats } = dashboardData;

     return (
       <Card className="p-6">
         {/* UI avec données réactives */}
       </Card>
     );
   }
   ```

**B. Demandes en cours (CurrentRequestCard)**

**Migration vers** :

```typescript
// convex/functions/requests/getCurrentRequest.ts
export const getCurrentRequest = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Requête optimisée avec index
    const currentRequest = await ctx.db
      .query('requests')
      .withIndex('by_requester_status', (q) =>
        q.eq('requesterId', user._id).eq('status', 'submitted'),
      )
      .order('desc')
      .first();

    if (!currentRequest) return null;

    // Relations optimisées
    const [service, organization] = await Promise.all([
      ctx.db.get(currentRequest.serviceId),
      currentRequest.organizationId ? ctx.db.get(currentRequest.organizationId) : null,
    ]);

    return {
      ...currentRequest,
      service,
      organization,
    };
  },
});
```

**C. Historique récent (RecentHistory)**

**Migration vers** :

```typescript
// convex/functions/requests/getRecentRequests.ts
export const getRecentRequests = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const limit = args.limit ?? 5;

    const requests = await ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', user._id))
      .order('desc')
      .take(limit);

    // Enrichir avec les relations
    return await Promise.all(
      requests.map(async (request) => ({
        ...request,
        service: await ctx.db.get(request.serviceId),
      })),
    );
  },
});
```

---

### 3. Profil Utilisateur

#### 📂 Fichiers concernés

```
src/app/(authenticated)/my-space/profile/
├── page.tsx
├── form/page.tsx
├── _utils/
│   ├── components/
│   │   ├── profile-header.tsx
│   │   ├── profile-tabs.tsx
│   │   ├── sections/
│   │   │   ├── basic-info-section.tsx
│   │   │   ├── contact-info-section.tsx
│   │   │   ├── family-info-section.tsx
│   │   │   ├── professional-info-section.tsx
│   │   │   └── documents-section.tsx
```

#### 🔄 Fonctionnalités à migrer

**A. Récupération du profil complet**

**Actuel** : `api.profile.getCurrent.useQuery()`
**Migration vers** :

```typescript
// convex/functions/profiles/getCurrentProfile.ts
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (!profile) throw new Error('Profile not found');

    // Relations chargées en parallèle pour performance
    const [documents, emergencyContacts, parentalAuthorities, registrationRequest] =
      await Promise.all([
        // Documents
        ctx.db
          .query('documents')
          .withIndex('by_owner', (q) =>
            q.eq('ownerId', profile._id).eq('ownerType', 'profile'),
          )
          .collect(),

        // Contacts d'urgence
        ctx.db
          .query('emergencyContacts')
          .filter((q) =>
            q.or(
              q.eq(q.field('residentProfileId'), profile._id),
              q.eq(q.field('homeLandProfileId'), profile._id),
            ),
          )
          .collect(),

        // Autorités parentales (si mineur)
        profile.category === 'minor'
          ? ctx.db
              .query('parentalAuthorities')
              .withIndex('by_profile', (q) => q.eq('profileId', profile._id))
              .filter((q) => q.eq(q.field('isActive'), true))
              .collect()
          : [],

        // Demande d'enregistrement
        profile.validationRequestId ? ctx.db.get(profile.validationRequestId) : null,
      ]);

    // Mapper les documents par type pour accès facile
    const documentsByType = {
      passport: documents.find((d) => d.type === 'passport'),
      birthCertificate: documents.find((d) => d.type === 'birth_certificate'),
      identityPhoto: documents.find((d) => d.type === 'identity_photo'),
      residencePermit: documents.find((d) => d.type === 'residence_permit'),
      addressProof: documents.find((d) => d.type === 'proof_of_address'),
    };

    return {
      ...profile,
      documents: documentsByType,
      emergencyContacts,
      parentalAuthorities,
      registrationRequest,
    };
  },
});
```

**B. Mise à jour du profil**

**Actuel** : `api.profile.update.useMutation()`
**Migration vers** :

```typescript
// convex/functions/profiles/updateProfile.ts
export const updateProfile = mutation({
  args: {
    profileId: v.id('profiles'),
    data: v.object({
      // Informations de base
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      birthDate: v.optional(v.number()),
      birthPlace: v.optional(v.string()),
      gender: v.optional(v.string()),

      // Contact
      email: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),

      // Adresse
      addressStreet: v.optional(v.string()),
      addressCity: v.optional(v.string()),
      addressPostalCode: v.optional(v.string()),

      // Famille
      maritalStatus: v.optional(v.string()),
      childrenCount: v.optional(v.number()),

      // Professionnel
      occupation: v.optional(v.string()),
      employer: v.optional(v.string()),
      workStatus: v.optional(v.string()),
    }),
    requestId: v.optional(v.id('requests')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Vérifier les permissions
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Profile not found');

    if (profile.userId !== user._id) {
      // Vérifier autorité parentale pour mineurs
      const hasAuthority = await ctx.db
        .query('parentalAuthorities')
        .withIndex('by_profile_parent', (q) =>
          q.eq('profileId', args.profileId).eq('parentUserId', user._id),
        )
        .filter((q) => q.eq(q.field('isActive'), true))
        .first();

      if (!hasAuthority) {
        throw new Error('Unauthorized');
      }
    }

    // Mise à jour avec données validées
    await ctx.db.patch(args.profileId, {
      ...args.data,
      updatedAt: Date.now(),
    });

    // Logger l'action si associée à une demande
    if (args.requestId) {
      await ctx.db.insert('requestActions', {
        requestId: args.requestId,
        type: 'profile_update',
        performedBy: user._id,
        timestamp: Date.now(),
        data: { section: 'profile_update', fields: Object.keys(args.data) },
      });
    }

    return await ctx.db.get(args.profileId);
  },
});
```

**C. Soumission du profil pour validation**

**Migration vers** :

```typescript
// convex/functions/profiles/submitForValidation.ts
export const submitForValidation = mutation({
  args: {
    profileId: v.id('profiles'),
    isChild: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const profile = await ctx.db.get(args.profileId);

    if (!profile) throw new Error('Profile not found');

    // Vérifications de complétude
    const requiredFields = [
      'firstName',
      'lastName',
      'birthDate',
      'birthPlace',
      'nationality',
      'gender',
    ];

    const missingFields = requiredFields.filter(
      (field) => !profile[field as keyof typeof profile],
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Vérifier documents requis
    const birthCert = await ctx.db
      .query('documents')
      .withIndex('by_owner_type', (q) =>
        q
          .eq('ownerId', profile._id)
          .eq('ownerType', 'profile')
          .eq('type', 'birth_certificate'),
      )
      .first();

    if (!birthCert) {
      throw new Error('Birth certificate required');
    }

    // Vérifier si une demande existe déjà
    const existingRequest = await ctx.db
      .query('requests')
      .withIndex('by_profile', (q) => q.eq('requestedForId', args.profileId))
      .filter((q) =>
        q.and(
          q.eq(q.field('serviceCategory'), 'registration'),
          q.neq(q.field('status'), 'cancelled'),
        ),
      )
      .first();

    if (existingRequest) {
      throw new Error('A registration request already exists for this profile');
    }

    // Récupérer le service d'enregistrement
    const registrationService = await ctx.db
      .query('services')
      .withIndex('by_category', (q) => q.eq('category', 'registration'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!registrationService) {
      throw new Error('Registration service not found');
    }

    // Créer la demande
    const requestId = await ctx.db.insert('requests', {
      serviceId: registrationService._id,
      serviceCategory: 'registration',
      organizationId: registrationService.organizationId,
      countryCode: user.countryCode,
      requesterId: user._id,
      requestedForId: args.profileId,
      status: 'submitted',
      submittedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      activities: [
        {
          type: 'request_submitted',
          timestamp: Date.now(),
          actorId: user._id,
          data: { isChild: args.isChild || false },
        },
      ],
    });

    // Mettre à jour le profil
    await ctx.db.patch(args.profileId, {
      status: 'submitted',
      submittedAt: Date.now(),
      validationRequestId: requestId,
      updatedAt: Date.now(),
    });

    // Créer notification
    await ctx.db.insert('notifications', {
      userId: user._id,
      type: 'request_submitted',
      title: 'Profil soumis pour validation',
      content: `Votre profil ${profile.firstName} ${profile.lastName} a été soumis pour validation.`,
      status: 'pending',
      channels: ['app', 'email'],
      deliveryStatus: {
        app: false,
        email: false,
        sms: false,
      },
      createdAt: Date.now(),
    });

    return {
      profileId: args.profileId,
      requestId,
      message: 'Profile submitted successfully',
    };
  },
});
```

---

### 4. Documents

#### 📂 Fichiers concernés

```
src/app/(authenticated)/my-space/documents/page.tsx
src/components/documents/
```

#### 🔄 Fonctionnalités à migrer

**A. Liste des documents utilisateur**

**Migration vers** :

```typescript
// convex/functions/documents/getUserDocuments.ts
export const getUserDocuments = query({
  args: {
    profileId: v.optional(v.id('profiles')),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Déterminer le profileId
    const profileId =
      args.profileId ||
      (
        await ctx.db
          .query('profiles')
          .withIndex('by_user', (q) => q.eq('userId', user._id))
          .first()
      )?._id;

    if (!profileId) return [];

    let documentsQuery = ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', profileId).eq('ownerType', 'profile'),
      );

    if (args.type) {
      documentsQuery = documentsQuery.filter((q) => q.eq(q.field('type'), args.type));
    }

    const documents = await documentsQuery.collect();

    // Générer les URLs signées pour les fichiers
    return await Promise.all(
      documents.map(async (doc) => {
        let fileUrl = null;
        if (doc.storageId) {
          fileUrl = await ctx.storage.getUrl(doc.storageId);
        }

        return {
          ...doc,
          fileUrl,
        };
      }),
    );
  },
});
```

**B. Upload de document**

**Migration vers** :

```typescript
// convex/functions/documents/uploadDocument.ts
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveDocument = mutation({
  args: {
    profileId: v.id('profiles'),
    type: v.string(),
    storageId: v.id('_storage'),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Vérifier permissions
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Profile not found');

    if (profile.userId !== user._id) {
      const hasAuthority = await checkParentalAuthority(ctx, args.profileId, user._id);
      if (!hasAuthority) throw new Error('Unauthorized');
    }

    // Créer le document
    const documentId = await ctx.db.insert('documents', {
      type: args.type as DocumentType,
      status: 'pending',
      ownerId: args.profileId,
      ownerType: 'profile',
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      metadata: args.metadata,
      version: 1,
      validations: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return documentId;
  },
});
```

---

### 5. Profils Enfants

#### 📂 Fichiers concernés

```
src/app/(authenticated)/my-space/children/
├── page.tsx
├── [id]/page.tsx
├── new/page.tsx
├── _components/
```

#### 🔄 Fonctionnalités à migrer

**A. Liste des enfants**

**Migration vers** :

```typescript
// convex/functions/profiles/getChildrenProfiles.ts
export const getChildrenProfiles = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const parentalAuthorities = await ctx.db
      .query('parentalAuthorities')
      .withIndex('by_parent', (q) => q.eq('parentUserId', user._id))
      .filter((q) => (args.includeInactive ? true : q.eq(q.field('isActive'), true)))
      .collect();

    // Charger les profils enfants avec détails
    return await Promise.all(
      parentalAuthorities.map(async (authority) => {
        const profile = await ctx.db.get(authority.profileId);

        if (!profile) return null;

        // Charger la demande d'enregistrement si existe
        const registrationRequest = profile.validationRequestId
          ? await ctx.db.get(profile.validationRequestId)
          : null;

        return {
          authority,
          profile,
          registrationRequest,
        };
      }),
    ).then((results) => results.filter(Boolean));
  },
});
```

**B. Création d'un profil enfant**

**Migration vers** :

```typescript
// convex/functions/profiles/createChildProfile.ts
export const createChildProfile = mutation({
  args: {
    parentRole: v.string(),
    hasOtherParent: v.boolean(),
    otherParentEmail: v.optional(v.string()),
    otherParentPhone: v.optional(v.string()),
    otherParentRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Créer le profil enfant
    const profileId = await ctx.db.insert('profiles', {
      category: 'minor',
      status: 'draft',
      residenceCountyCode: user.countryCode || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Créer l'autorité parentale pour l'utilisateur actuel
    await ctx.db.insert('parentalAuthorities', {
      profileId,
      parentUserId: user._id,
      role: args.parentRole as ParentalRole,
      isActive: true,
      createdAt: Date.now(),
    });

    // Gérer l'autre parent si spécifié
    if (args.hasOtherParent && args.otherParentEmail) {
      const otherParent = await ctx.db
        .query('users')
        .filter((q) =>
          q.or(
            args.otherParentEmail ? q.eq(q.field('email'), args.otherParentEmail) : false,
            args.otherParentPhone
              ? q.eq(q.field('phoneNumber'), args.otherParentPhone)
              : false,
          ),
        )
        .first();

      if (otherParent && args.otherParentRole) {
        await ctx.db.insert('parentalAuthorities', {
          profileId,
          parentUserId: otherParent._id,
          role: args.otherParentRole as ParentalRole,
          isActive: true,
          createdAt: Date.now(),
        });
      }
    }

    return { profileId };
  },
});
```

**C. Suppression d'un profil enfant**

**Migration vers** :

```typescript
// convex/functions/profiles/deleteChildProfile.ts
export const deleteChildProfile = mutation({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Vérifier autorité parentale
    const hasAuthority = await checkParentalAuthority(ctx, args.profileId, user._id);

    if (!hasAuthority) {
      throw new Error('Unauthorized');
    }

    // Vérifier que le profil est en draft
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Profile not found');

    if (profile.status !== 'draft') {
      throw new Error('Only draft profiles can be deleted');
    }

    // Supprimer en cascade
    // 1. Autorités parentales
    const authorities = await ctx.db
      .query('parentalAuthorities')
      .withIndex('by_profile', (q) => q.eq('profileId', args.profileId))
      .collect();

    for (const authority of authorities) {
      await ctx.db.delete(authority._id);
    }

    // 2. Documents
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_owner', (q) =>
        q.eq('ownerId', args.profileId).eq('ownerType', 'profile'),
      )
      .collect();

    for (const doc of documents) {
      if (doc.storageId) {
        await ctx.storage.delete(doc.storageId);
      }
      await ctx.db.delete(doc._id);
    }

    // 3. Contacts d'urgence
    const contacts = await ctx.db
      .query('emergencyContacts')
      .filter((q) =>
        q.or(
          q.eq(q.field('residentProfileId'), args.profileId),
          q.eq(q.field('homeLandProfileId'), args.profileId),
        ),
      )
      .collect();

    for (const contact of contacts) {
      await ctx.db.delete(contact._id);
    }

    // 4. Demandes de service
    const requests = await ctx.db
      .query('requests')
      .withIndex('by_profile', (q) => q.eq('requestedForId', args.profileId))
      .collect();

    for (const request of requests) {
      await ctx.db.delete(request._id);
    }

    // 5. Profil lui-même
    await ctx.db.delete(args.profileId);

    return { success: true };
  },
});
```

---

### 6. Rendez-vous (Appointments)

#### 📂 Fichiers concernés

```
src/app/(authenticated)/my-space/appointments/
├── page.tsx
├── new/page.tsx
├── reschedule/[id]/page.tsx
```

#### 🔄 Fonctionnalités à migrer

**A. Liste des rendez-vous**

**Migration vers** :

```typescript
// convex/functions/appointments/getUserAppointments.ts
export const getUserAppointments = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    let query = ctx.db
      .query('appointments')
      .withIndex('by_attendee', (q) => q.eq('attendeeId', user._id));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field('status'), args.status));
    }

    const appointments = await query.order('asc').collect();

    // Enrichir avec service et organisation
    return await Promise.all(
      appointments.map(async (apt) => ({
        ...apt,
        service: apt.serviceId ? await ctx.db.get(apt.serviceId) : null,
        organization: apt.organizationId ? await ctx.db.get(apt.organizationId) : null,
        agent: apt.agentId ? await ctx.db.get(apt.agentId) : null,
      })),
    );
  },
});

export const getUpcomingAppointments = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const now = Date.now();

    const appointments = await ctx.db
      .query('appointments')
      .withIndex('by_attendee', (q) => q.eq('attendeeId', user._id))
      .filter((q) =>
        q.and(q.gt(q.field('startAt'), now), q.neq(q.field('status'), 'cancelled')),
      )
      .order('asc')
      .take(args.limit ?? 10);

    return appointments;
  },
});
```

**B. Créer un rendez-vous**

**Migration vers** :

```typescript
// convex/functions/appointments/createAppointment.ts
export const createAppointment = mutation({
  args: {
    serviceId: v.id('services'),
    serviceRequestId: v.optional(v.id('requests')),
    startAt: v.number(),
    endAt: v.number(),
    type: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Validation des dates
    if (args.startAt >= args.endAt) {
      throw new Error('Start time must be before end time');
    }

    if (args.startAt <= Date.now()) {
      throw new Error('Cannot schedule in the past');
    }

    // Récupérer le service
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error('Service not found');

    // Vérifier disponibilité du créneau
    const conflicts = await ctx.db
      .query('appointments')
      .withIndex('by_organization', (q) => q.eq('organizationId', service.organizationId))
      .filter((q) =>
        q.and(
          q.neq(q.field('status'), 'cancelled'),
          q.or(
            // Chevauchement début
            q.and(
              q.gte(q.field('startAt'), args.startAt),
              q.lt(q.field('startAt'), args.endAt),
            ),
            // Chevauchement fin
            q.and(
              q.gt(q.field('endAt'), args.startAt),
              q.lte(q.field('endAt'), args.endAt),
            ),
            // Englobe complètement
            q.and(
              q.lte(q.field('startAt'), args.startAt),
              q.gte(q.field('endAt'), args.endAt),
            ),
          ),
        ),
      )
      .collect();

    if (conflicts.length > 0) {
      throw new Error('Time slot not available');
    }

    // Créer le rendez-vous
    const appointmentId = await ctx.db.insert('appointments', {
      attendeeId: user._id,
      serviceId: args.serviceId,
      serviceRequestId: args.serviceRequestId,
      organizationId: service.organizationId,
      type: args.type as AppointmentType,
      status: 'pending',
      startAt: args.startAt,
      endAt: args.endAt,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Créer notification
    await ctx.db.insert('notifications', {
      userId: user._id,
      type: 'appointment_confirmation',
      title: 'Rendez-vous créé',
      content: `Votre rendez-vous pour ${service.name} a été créé avec succès.`,
      status: 'pending',
      channels: ['app', 'email'],
      deliveryStatus: { app: false, email: false, sms: false },
      relatedId: appointmentId,
      relatedType: 'appointment',
      createdAt: Date.now(),
    });

    return appointmentId;
  },
});
```

**C. Annuler un rendez-vous**

**Migration vers** :

```typescript
// convex/functions/appointments/cancelAppointment.ts
export const cancelAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    // Vérifier que c'est bien le rendez-vous de l'utilisateur
    if (appointment.attendeeId !== user._id) {
      throw new Error('Unauthorized');
    }

    if (appointment.status === 'cancelled') {
      throw new Error('Appointment already cancelled');
    }

    // Mettre à jour le statut
    await ctx.db.patch(args.appointmentId, {
      status: 'cancelled',
      cancelledAt: Date.now(),
      cancellationReason: args.reason,
      updatedAt: Date.now(),
    });

    // Notifier
    await ctx.db.insert('notifications', {
      userId: user._id,
      type: 'appointment_cancellation',
      title: 'Rendez-vous annulé',
      content: 'Votre rendez-vous a été annulé avec succès.',
      status: 'pending',
      channels: ['app', 'email'],
      deliveryStatus: { app: false, email: false, sms: false },
      relatedId: args.appointmentId,
      relatedType: 'appointment',
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
```

---

### 7. Demandes de Service (Service Requests)

#### 📂 Fichiers concernés

```
src/app/(authenticated)/my-space/requests/
├── page.tsx
├── [id]/page.tsx
src/app/(authenticated)/my-space/services/
├── page.tsx
├── submit/page.tsx
```

#### 🔄 Fonctionnalités à migrer

**A. Liste des demandes**

**Migration vers** :

```typescript
// convex/functions/requests/getUserRequests.ts
export const getUserRequests = query({
  args: {
    status: v.optional(v.union(v.string(), v.array(v.string()))),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    let query = ctx.db
      .query('requests')
      .withIndex('by_requester', (q) => q.eq('requesterId', user._id));

    if (args.status) {
      const statuses = Array.isArray(args.status) ? args.status : [args.status];

      query = query.filter((q) =>
        q.or(...statuses.map((status) => q.eq(q.field('status'), status))),
      );
    }

    if (args.category) {
      query = query.filter((q) => q.eq(q.field('serviceCategory'), args.category));
    }

    const requests = await query.order('desc').take(args.limit ?? 50);

    // Enrichir avec relations
    return await Promise.all(
      requests.map(async (request) => {
        const [service, profile, organization] = await Promise.all([
          ctx.db.get(request.serviceId),
          request.requestedForId ? ctx.db.get(request.requestedForId) : null,
          request.organizationId ? ctx.db.get(request.organizationId) : null,
        ]);

        return {
          ...request,
          service,
          profile,
          organization,
        };
      }),
    );
  },
});
```

**B. Détails d'une demande**

**Migration vers** :

```typescript
// convex/functions/requests/getRequestDetails.ts
export const getRequestDetails = query({
  args: {
    requestId: v.id('requests'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error('Request not found');

    // Vérifier les permissions
    if (request.requesterId !== user._id) {
      // TODO: Vérifier si agent assigné
      throw new Error('Unauthorized');
    }

    // Charger toutes les relations en parallèle
    const [service, profile, organization, notes, documents, appointments] =
      await Promise.all([
        ctx.db.get(request.serviceId),
        request.requestedForId ? ctx.db.get(request.requestedForId) : null,
        request.organizationId ? ctx.db.get(request.organizationId) : null,
        ctx.db
          .query('requestNotes')
          .withIndex('by_request', (q) => q.eq('requestId', args.requestId))
          .order('desc')
          .collect(),
        ctx.db
          .query('documents')
          .withIndex('by_owner', (q) =>
            q.eq('ownerId', args.requestId).eq('ownerType', 'request'),
          )
          .collect(),
        ctx.db
          .query('appointments')
          .withIndex('by_request', (q) => q.eq('serviceRequestId', args.requestId))
          .collect(),
      ]);

    // Actions avec acteurs
    const activitiesWithActors = await Promise.all(
      (request.activities || []).map(async (activity) => ({
        ...activity,
        actor: activity.actorId ? await ctx.db.get(activity.actorId) : null,
      })),
    );

    return {
      ...request,
      service,
      profile,
      organization,
      notes,
      documents,
      appointments,
      activities: activitiesWithActors,
    };
  },
});
```

**C. Soumettre une demande**

**Migration vers** :

```typescript
// convex/functions/requests/submitServiceRequest.ts
export const submitServiceRequest = mutation({
  args: {
    serviceId: v.id('services'),
    profileId: v.id('profiles'),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Vérifier le service
    const service = await ctx.db.get(args.serviceId);
    if (!service || !service.isActive) {
      throw new Error('Service not available');
    }

    // Vérifier le profil
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error('Profile not found');

    // Vérifier permissions
    if (profile.userId !== user._id) {
      const hasAuthority = await checkParentalAuthority(ctx, args.profileId, user._id);
      if (!hasAuthority) throw new Error('Unauthorized');
    }

    // Créer la demande
    const requestId = await ctx.db.insert('requests', {
      serviceId: args.serviceId,
      serviceCategory: service.category,
      organizationId: service.organizationId,
      countryCode: user.countryCode || profile.residenceCountyCode,
      requesterId: user._id,
      requestedForId: args.profileId,
      status: 'draft',
      formData: args.data,
      activities: [
        {
          type: 'request_created',
          timestamp: Date.now(),
          actorId: user._id,
          data: { serviceId: args.serviceId },
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { requestId };
  },
});

export const updateRequestStatus = mutation({
  args: {
    requestId: v.id('requests'),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error('Request not found');

    // Vérifier permissions
    if (request.requesterId !== user._id) {
      throw new Error('Unauthorized');
    }

    // Mettre à jour
    const activities = request.activities || [];
    activities.push({
      type: 'status_changed',
      timestamp: Date.now(),
      actorId: user._id,
      data: {
        oldStatus: request.status,
        newStatus: args.status,
        notes: args.notes,
      },
    });

    await ctx.db.patch(args.requestId, {
      status: args.status as RequestStatus,
      activities,
      updatedAt: Date.now(),
      ...(args.status === 'submitted' && { submittedAt: Date.now() }),
      ...(args.status === 'completed' && { completedAt: Date.now() }),
    });

    // Notification
    await ctx.db.insert('notifications', {
      userId: user._id,
      type: 'request_status_updated',
      title: 'Statut de demande mis à jour',
      content: `Le statut de votre demande est maintenant: ${args.status}`,
      status: 'pending',
      channels: ['app'],
      deliveryStatus: { app: false, email: false, sms: false },
      relatedId: args.requestId,
      relatedType: 'request',
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
```

---

### 8. Services disponibles

#### 🔄 Fonctionnalités à migrer

**A. Liste des services**

**Migration vers** :

```typescript
// convex/functions/services/getAvailableServices.ts
export const getAvailableServices = query({
  args: {
    category: v.optional(v.string()),
    organizationId: v.optional(v.id('organizations')),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('services')
      .withIndex('by_status', (q) => q.eq('isActive', true));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field('category'), args.category));
    }

    if (args.organizationId) {
      query = query.filter((q) => q.eq(q.field('organizationId'), args.organizationId));
    }

    let services = await query.collect();

    // Recherche textuelle côté client (Convex n'a pas de full-text search natif)
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      services = services.filter(
        (service) =>
          service.name.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower),
      );
    }

    // Enrichir avec organisation
    return await Promise.all(
      services.map(async (service) => ({
        ...service,
        organization: service.organizationId
          ? await ctx.db.get(service.organizationId)
          : null,
      })),
    );
  },
});

// Avec pagination pour de meilleures performances
export const getAvailableServicesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    category: v.optional(v.string()),
    organizationId: v.optional(v.id('organizations')),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('services')
      .withIndex('by_status', (q) => q.eq('isActive', true));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field('category'), args.category));
    }

    if (args.organizationId) {
      query = query.filter((q) => q.eq(q.field('organizationId'), args.organizationId));
    }

    return await paginate(ctx.db, query, args.paginationOpts);
  },
});
```

---

### 9. Notifications

#### 📂 Fichiers concernés

```
src/app/(authenticated)/my-space/notifications/page.tsx
src/components/notifications/
```

#### 🔄 Fonctionnalités à migrer

**A. Liste des notifications**

**Migration vers** :

```typescript
// convex/functions/notifications/getUserNotifications.ts
export const getUserNotifications = query({
  args: {
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    let query = ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', user._id));

    if (args.unreadOnly) {
      query = query.filter((q) => q.eq(q.field('readAt'), undefined));
    }

    const notifications = await query.order('desc').take(args.limit ?? 50);

    return notifications;
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('readAt'), undefined))
      .collect();

    return unread.length;
  },
});
```

**B. Marquer comme lu**

**Migration vers** :

```typescript
// convex/functions/notifications/markAsRead.ts
export const markAsRead = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error('Notification not found');

    if (notification.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    await ctx.db.patch(args.notificationId, {
      readAt: Date.now(),
      status: 'read',
    });

    return { success: true };
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('readAt'), undefined))
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, {
          readAt: Date.now(),
          status: 'read',
        }),
      ),
    );

    return { count: unreadNotifications.length };
  },
});
```

---

### 10. Paramètres Utilisateur

#### 📂 Fichiers concernés

```
src/app/(authenticated)/my-space/settings/page.tsx
src/app/(authenticated)/my-space/settings/_utils/user-settings-form.tsx
```

#### 🔄 Fonctionnalités à migrer

**A. Récupération des paramètres**

**Migration vers** :

```typescript
// convex/functions/users/getUserSettings.ts
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Récupérer aussi le profil pour certains paramètres
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    return {
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        countryCode: user.countryCode,
        roles: user.roles,
        emailVerified: user.emailVerified,
        phoneNumberVerified: user.phoneNumberVerified,
      },
      profile: profile
        ? {
            id: profile._id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
          }
        : null,
    };
  },
});
```

**B. Mise à jour des paramètres**

**Migration vers** :

```typescript
// convex/functions/users/updateUserSettings.ts
export const updateUserSettings = mutation({
  args: {
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    countryCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Vérifier unicité email
    if (args.email && args.email !== user.email) {
      const existing = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', args.email!))
        .first();

      if (existing) {
        throw new Error('Email already in use');
      }
    }

    // Vérifier unicité téléphone
    if (args.phoneNumber && args.phoneNumber !== user.phoneNumber) {
      const existing = await ctx.db
        .query('users')
        .withIndex('by_phone', (q) => q.eq('phoneNumber', args.phoneNumber!))
        .first();

      if (existing) {
        throw new Error('Phone number already in use');
      }
    }

    // Mettre à jour l'utilisateur
    await ctx.db.patch(user._id, {
      ...(args.email && {
        email: args.email,
        emailVerified: null, // Nécessite re-vérification
      }),
      ...(args.phoneNumber && {
        phoneNumber: args.phoneNumber,
        phoneNumberVerified: false,
      }),
      ...(args.countryCode && { countryCode: args.countryCode }),
      updatedAt: Date.now(),
    });

    // Mettre à jour le profil aussi
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        ...(args.email && { email: args.email }),
        ...(args.phoneNumber && { phoneNumber: args.phoneNumber }),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
```

---

## 🗂️ Structure des fichiers Convex

### Organisation recommandée

```
convex/
├── _generated/          # Auto-généré par Convex
├── schema.ts            # Schéma déjà existant
├── auth.config.ts       # Configuration Clerk
├── convex.config.ts     # Configuration Convex
│
├── functions/
│   ├── users/
│   │   ├── createUser.ts
│   │   ├── getCurrentUser.ts          # Helper
│   │   ├── getUserSettings.ts
│   │   ├── updateUserSettings.ts
│   │   ├── getDashboardData.ts        # Agrégation optimisée
│   │   └── checkUserExists.ts
│   │
│   ├── profiles/
│   │   ├── getCurrentProfile.ts
│   │   ├── updateProfile.ts
│   │   ├── submitForValidation.ts
│   │   ├── getChildrenProfiles.ts
│   │   ├── createChildProfile.ts
│   │   ├── deleteChildProfile.ts
│   │   └── updateChildProfile.ts
│   │
│   ├── documents/
│   │   ├── getUserDocuments.ts
│   │   ├── generateUploadUrl.ts
│   │   ├── saveDocument.ts
│   │   ├── deleteDocument.ts
│   │   └── validateDocument.ts
│   │
│   ├── appointments/
│   │   ├── getUserAppointments.ts
│   │   ├── getUpcomingAppointments.ts
│   │   ├── createAppointment.ts
│   │   ├── cancelAppointment.ts
│   │   ├── rescheduleAppointment.ts
│   │   └── getAvailableSlots.ts
│   │
│   ├── requests/
│   │   ├── getUserRequests.ts
│   │   ├── getRequestDetails.ts
│   │   ├── getCurrentRequest.ts
│   │   ├── getRecentRequests.ts
│   │   ├── submitServiceRequest.ts
│   │   └── updateRequestStatus.ts
│   │
│   ├── services/
│   │   ├── getAvailableServices.ts
│   │   ├── getAvailableServicesPaginated.ts
│   │   └── getServiceDetails.ts
│   │
│   ├── notifications/
│   │   ├── getUserNotifications.ts
│   │   ├── getUnreadCount.ts
│   │   ├── markAsRead.ts
│   │   └── markAllAsRead.ts
│   │
│   └── countries/
│       ├── getActiveCountries.ts
│       └── getCountryByCode.ts
│
├── helpers/
│   ├── auth.ts              # getCurrentUser, checkAuth, etc.
│   ├── permissions.ts       # checkParentalAuthority, etc.
│   ├── pagination.ts        # Helper pagination Convex
│   └── validation.ts        # Validation helpers
│
└── lib/
    ├── constants.ts         # Enums, constantes (réutiliser existant)
    └── validators.ts        # Validators Convex (réutiliser existant)
```

---

## 🔌 Adaptation des composants React

### Pattern de migration

**Avant (tRPC)** :

```typescript
'use client';
import { api } from '@/trpc/react';

export function MyComponent() {
  const { data, isLoading } = api.profile.getCurrent.useQuery();
  const updateMutation = api.profile.update.useMutation();

  if (isLoading) return <Loading />;
  if (!data) return <Error />;

  const handleUpdate = async (newData) => {
    await updateMutation.mutateAsync({ data: newData });
  };

  return <div>{data.firstName}</div>;
}
```

**Après (Convex)** :

```typescript
'use client';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function MyComponent() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);

  // Convex: undefined = loading, null = no data
  if (profile === undefined) return <Loading />;
  if (profile === null) return <Error />;

  const handleUpdate = async (newData) => {
    await updateProfile({
      profileId: profile._id,
      data: newData
    });
  };

  return <div>{profile.firstName}</div>;
}
```

### Hooks personnalisés à créer

```typescript
// src/hooks/convex/useCurrentProfile.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useCurrentProfile() {
  const profile = useQuery(api.profiles.getCurrentProfile);

  return {
    profile,
    isLoading: profile === undefined,
    isError: profile === null,
  };
}

// src/hooks/convex/useUpdateProfile.ts
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

export function useUpdateProfile() {
  const updateProfile = useMutation(api.profiles.updateProfile);
  const { toast } = useToast();

  return async (profileId: Id<'profiles'>, data: any) => {
    try {
      await updateProfile({ profileId, data });
      toast({
        title: 'Succès',
        description: 'Profil mis à jour',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };
}
```

---

## 🔐 Gestion de l'authentification

### Configuration Clerk + Convex

**1. Configuration Convex Auth**

```typescript
// convex/auth.config.ts (déjà existant, à vérifier)
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
};
```

**2. Helper d'authentification**

```typescript
// convex/helpers/auth.ts
import { v } from 'convex/values';
import type { QueryCtx, MutationCtx } from '../_generated/server';

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_user_id', (q) => q.eq('userId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found in database');
  }

  return user;
}

export async function getOptionalUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) return null;

  return await ctx.db
    .query('users')
    .withIndex('by_user_id', (q) => q.eq('userId', identity.subject))
    .first();
}
```

**3. Middleware Next.js** (garder l'existant Clerk)

```typescript
// src/middleware.ts (adaptation minimale)
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)', // Peut être retiré après migration
    '/convex',
  ],
};
```

**4. Provider Convex**

```typescript
// src/app/convex-provider.tsx
'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  return (
    <ConvexProvider
      client={convex}
      auth={{
        getToken: async () => {
          return await getToken({ template: 'convex' });
        },
      }}
    >
      {children}
    </ConvexProvider>
  );
}
```

**5. Layout racine** (modifier pour utiliser ConvexProvider au lieu de TRPCProvider)

```typescript
// src/app/layout.tsx
import { ConvexClientProvider } from './convex-provider';
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

---

## 📊 Optimisations Convex

### 1. Indexes optimisés

Ajouter dans `convex/schema.ts` :

```typescript
// Optimisations pour queries fréquentes
users: defineTable({
  // ... champs
})
  .index("by_user_id", ["userId"])
  .index("by_email", ["email"])
  .index("by_phone", ["phoneNumber"]),

profiles: defineTable({
  // ... champs
})
  .index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_category", ["category"]),

requests: defineTable({
  // ... champs
})
  .index("by_requester", ["requesterId"])
  .index("by_requester_status", ["requesterId", "status"])
  .index("by_profile", ["requestedForId"]),

documents: defineTable({
  // ... champs
})
  .index("by_owner", ["ownerId", "ownerType"])
  .index("by_owner_type", ["ownerId", "ownerType", "type"]),

appointments: defineTable({
  // ... champs
})
  .index("by_attendee", ["attendeeId"])
  .index("by_organization", ["organizationId"])
  .index("by_request", ["serviceRequestId"]),

notifications: defineTable({
  // ... champs
})
  .index("by_user", ["userId"])
  .index("by_user_status", ["userId", "status"]),
```

### 2. Pagination performante

```typescript
// convex/helpers/pagination.ts
import { v } from 'convex/values';
import type { QueryInitializer } from './_generated/server';

export const paginationOptsValidator = v.object({
  numItems: v.number(),
  cursor: v.union(v.string(), v.null()),
});

export async function paginate<T>(
  db: any,
  query: QueryInitializer<T>,
  opts: { numItems: number; cursor: string | null },
) {
  const results = await query.paginate(opts).collect();

  return {
    page: results.page,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
}
```

### 3. Queries réactives optimisées

Pour le dashboard, utiliser une seule query agrégée au lieu de multiples :

```typescript
// Au lieu de:
const profile = useQuery(api.profiles.getCurrent);
const requests = useQuery(api.requests.getList);
const documents = useQuery(api.documents.getUserDocuments);

// Utiliser:
const dashboard = useQuery(api.users.getDashboardData);
// Retourne { profile, requests, documents, stats }
```

---

## 🧪 Plan de tests

### Tests à créer/adapter

1. **Tests unitaires Convex** (convex/\*.test.ts)
   - Tester chaque function isolément
   - Utiliser `convexTest` helper

2. **Tests d'intégration React**
   - Adapter les tests existants
   - Mocker les hooks Convex

3. **Tests E2E**
   - Garder les tests Playwright
   - Adapter pour pointer vers Convex

---

## 📝 Checklist de migration

### Phase 1 : Préparation

- [ ] Installer dépendances Convex
- [ ] Configurer auth Clerk + Convex
- [ ] Créer structure de dossiers
- [ ] Créer helpers (getCurrentUser, etc.)
- [ ] Mettre à jour indexes schema

### Phase 2 : Authentification

- [ ] Migrer `createUser`
- [ ] Migrer `handleNewUser`
- [ ] Migrer `getActiveCountries`
- [ ] Migrer `checkUserExists`
- [ ] Adapter composants sign-in/sign-up
- [ ] Tester flux complet auth

### Phase 3 : Dashboard (/my-space)

- [ ] Créer `getDashboardData` agrégée
- [ ] Migrer UserOverview
- [ ] Migrer CurrentRequestCard
- [ ] Migrer QuickActions
- [ ] Migrer RecentHistory
- [ ] Tester page dashboard

### Phase 4 : Profil

- [ ] Migrer `getCurrentProfile`
- [ ] Migrer `updateProfile`
- [ ] Migrer `submitForValidation`
- [ ] Adapter tous les composants sections
- [ ] Adapter ProfileTabs
- [ ] Tester flux complet profil

### Phase 5 : Profils enfants

- [ ] Migrer `getChildrenProfiles`
- [ ] Migrer `createChildProfile`
- [ ] Migrer `updateChildProfile`
- [ ] Migrer `deleteChildProfile`
- [ ] Adapter composants children
- [ ] Tester flux complet enfants

### Phase 6 : Documents

- [ ] Migrer `getUserDocuments`
- [ ] Migrer upload functions
- [ ] Adapter composants documents
- [ ] Tester uploads

### Phase 7 : Rendez-vous

- [ ] Migrer `getUserAppointments`
- [ ] Migrer `createAppointment`
- [ ] Migrer `cancelAppointment`
- [ ] Migrer `rescheduleAppointment`
- [ ] Adapter composants appointments
- [ ] Tester flux complet RDV

### Phase 8 : Demandes de service

- [ ] Migrer `getUserRequests`
- [ ] Migrer `getRequestDetails`
- [ ] Migrer `submitServiceRequest`
- [ ] Migrer `updateRequestStatus`
- [ ] Migrer liste services
- [ ] Adapter tous composants
- [ ] Tester flux complet demandes

### Phase 9 : Notifications

- [ ] Migrer `getUserNotifications`
- [ ] Migrer `markAsRead`
- [ ] Migrer `markAllAsRead`
- [ ] Adapter composants notifications
- [ ] Tester notifications

### Phase 10 : Paramètres

- [ ] Migrer `getUserSettings`
- [ ] Migrer `updateUserSettings`
- [ ] Adapter formulaire settings
- [ ] Tester paramètres

### Phase 11 : Nettoyage

- [ ] Supprimer tout le code tRPC
- [ ] Supprimer dépendances tRPC
- [ ] Supprimer Server Actions
- [ ] Supprimer Prisma (si plus utilisé ailleurs)
- [ ] Nettoyer imports
- [ ] Mettre à jour documentation

### Phase 12 : Optimisation

- [ ] Profiler queries Convex
- [ ] Optimiser indexes
- [ ] Implémenter caching stratégique
- [ ] Tests de charge
- [ ] Monitoring erreurs

---

## ⚠️ Points d'attention

### Différences clés tRPC vs Convex

1. **État de chargement**
   - tRPC: `isLoading` boolean
   - Convex: `undefined` = loading, `null` = no data

2. **Gestion erreurs**
   - tRPC: `error` object
   - Convex: throw errors dans functions, catch en React

3. **Optimistic updates**
   - tRPC: manuels via queryClient
   - Convex: built-in optimistic updates

4. **Subscriptions**
   - tRPC: pas natif (polling)
   - Convex: réactif par défaut

5. **Fichiers**
   - tRPC: UploadThing ou autre
   - Convex: Convex Storage intégré

---

## 🚀 Avantages de la migration

### Performances

- ✅ Subscriptions réactives temps réel
- ✅ Optimistic UI natif
- ✅ Pas de serveur API à maintenir
- ✅ Mise en cache automatique

### Développement

- ✅ Moins de boilerplate
- ✅ Type-safety end-to-end
- ✅ Pas de tRPC context/provider complexity
- ✅ Dashboard Convex intégré

### Maintenance

- ✅ Une seule stack de données (Convex)
- ✅ Moins de dépendances
- ✅ Migrations de schéma simplifiées
- ✅ Debugging facilité

---

## 📚 Ressources

- [Convex Documentation](https://docs.convex.dev)
- [Convex + Clerk Auth](https://docs.convex.dev/auth/clerk)
- [Convex File Storage](https://docs.convex.dev/file-storage)
- [Convex React Hooks](https://docs.convex.dev/client/react)

---

**Date de création**: {{DATE}}
**Scope**: Authentification + /my-space
**Status**: 📋 Plan de migration
**Prochaine étape**: Validation du plan et début Phase 1
