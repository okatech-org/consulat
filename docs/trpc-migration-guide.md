# Guide de Migration tRPC pour Consulat.ga

## Vue d'ensemble

Ce document décrit la migration progressive du projet Consulat.ga des server actions traditionnelles vers tRPC + TanStack Query pour améliorer la performance, la type safety et l'expérience développeur.

## Architecture

### Avant (Server Actions)
```
Page Component (Server) 
  ↓ Appel direct
Server Action 
  ↓ Prisma
Database
```

### Après (tRPC)
```
Page Component (Client) 
  ↓ Hook tRPC
TanStack Query Cache 
  ↓ tRPC Router
Server Procedure 
  ↓ Prisma
Database
```

## État de la Migration

### ✅ Modules Complètement Migrés

#### 1. **Dashboard** (`src/server/api/routers/dashboard.ts`)
- **Endpoints:** `getStats`, `getRecentActivity`, `getQuickActions`
- **Hooks:** `useDashboardStats`, `useDashboardActivity`
- **Pages:** `/dashboard/page.tsx`
- **Bénéfices:** Cache intelligent, loading states automatiques

#### 2. **Requests** (`src/server/api/routers/requests.ts`)
- **Endpoints:** `getList`, `getById`, `create`, `update`, `updateStatus`, `assign`
- **Hooks:** `useRequests`, `useRequest`, `useRequestActions`
- **Pages:** `/dashboard/requests/page.tsx`
- **Bénéfices:** Optimistic updates, filtres avancés, pagination

#### 3. **Agents** (`src/server/api/routers/agents.ts`)
- **Endpoints:** `getList`, `getById`, `create`, `update`, `assignRequest`, `reassignRequest`, `getAvailable`, `getPerformanceMetrics`, `getStats`
- **Hooks:** `useAgents`, `useAgent`, `useAvailableAgents`, `useAgentPerformance`, `useAgentsStats`, `useAgentAssignment`
- **Pages:** `/dashboard/agents/page.tsx`
- **Bénéfices:** Permissions hiérarchiques, métriques de performance, assignation optimiste

#### 4. **Countries** (`src/server/api/routers/countries.ts`) 🆕
- **Endpoints:** `getList`, `getById`, `create`, `update`, `delete`, `getActive`, `getStats`
- **Hooks:** `useCountries`, `useCountry`, `useActiveCountries`, `useCountriesStats`, `useCountryCreation`, `useCountryUpdate`
- **Pages:** `/dashboard/(superadmin)/countries/page.tsx`
- **Bénéfices:** Gestion complète des pays, statistiques en temps réel, permissions SuperAdmin

#### 5. **Organizations** (`src/server/api/routers/organizations.ts`) 🆕
- **Endpoints:** `getList`, `getById`, `create`, `update`, `updateStatus`, `updateSettings`, `delete`, `getStats`, `getByCountry`
- **Hooks:** `useOrganizations`, `useOrganization`, `useOrganizationsStats`, `useOrganizationSettings`, `useOrganizationCreation`, `useOrganizationByCountry`
- **Pages:** `/dashboard/(superadmin)/organizations/page.tsx`
- **Bénéfices:** Gestion multi-pays, paramètres avancés, hiérarchie organisationnelle

### ✅ Modules Complètement Migrés

#### 6. **Child Profiles** (`src/server/api/routers/child-profiles.ts`) 🆕
- **Endpoints:** `getByParent`, `getById`, `create`, `updateBasicInfo`, `updateParentalAuthority`, `delete`, `submitForValidation`, `getStats`
- **Hooks:** `useChildProfiles`, `useChildProfile`, `useChildProfilesStats`, `useParentalAuthority`, `useChildProfileCreation`, `useChildProfileUpdate`
- **Pages:** `/my-space/children/page.tsx`, `/my-space/children/[id]/page.tsx`
- **Composants:** `ChildProfileCard`, `ChildBasicInfoSection`
- **Bénéfices:** Gestion autorité parentale, permissions granulaires, relations familiales complexes

#### 7. **Notifications** (`src/server/api/routers/notifications.ts`) 🆕
- **Endpoints:** `getList`, `getUnreadCount`, `markAsRead`, `markAllAsRead`, `delete`, `deleteAllRead`, `getPreferences`, `updatePreferences`, `create`, `getStats`
- **Hooks:** `useNotifications`, `useUnreadCount`, `useNotificationPreferences`, `useNotificationStats`, `useCreateNotification`, `useRealtimeNotifications`
- **Composants:** `NotificationsListing`, `NotificationItem`, `NotificationBell`
- **Bénéfices:** Pagination infinie, optimistic updates, polling temps réel, gestion des préférences, statistiques

### 🔄 Modules en Cours de Migration

### ⏳ Modules Non Migrés

#### 8. **Auth** 
- **Statut:** Partiellement migré
- **Raison:** Intégration NextAuth complexe

#### 9. **Public Profiles**
- **Statut:** En attente
- **Priorité:** Faible

## Patterns de Migration Établis

### 1. Structure des Routers

```typescript
// src/server/api/routers/[module].ts
export const [module]Router = createTRPCRouter({
  // Queries (lecture)
  getList: protectedProcedure
    .input(z.object({ /* filtres */ }))
    .query(async ({ ctx, input }) => { /* logique */ }),
    
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => { /* logique */ }),
    
  // Mutations (écriture)
  create: protectedProcedure
    .input([module]Schema)
    .mutation(async ({ ctx, input }) => { /* logique */ }),
    
  update: protectedProcedure
    .input(update[Module]Schema)
    .mutation(async ({ ctx, input }) => { /* logique */ }),
});
```

### 2. Hooks Personnalisés

```typescript
// src/hooks/use-[module].ts
export function use[Module]s(options?: FilterOptions) {
  const utils = api.useUtils();
  
  const query = api.[module].getList.useQuery(options, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  const createMutation = api.[module].create.useMutation({
    onMutate: async (newItem) => {
      // Optimistic update
      await utils.[module].getList.cancel();
      const previousData = utils.[module].getList.getData(options);
      // ... logique optimiste
      return { previousData };
    },
    onError: (error, newItem, context) => {
      // Rollback
      if (context?.previousData) {
        utils.[module].getList.setData(options, context.previousData);
      }
      // Toast d'erreur
    },
    onSuccess: () => {
      // Invalidation cache
      utils.[module].getList.invalidate();
    },
  });
  
  return {
    items: query.data?.items ?? [],
    isLoading: query.isLoading,
    createItem: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
```

### 3. Migration des Pages

```typescript
// Avant: src/app/[...]/page.tsx (Server Component)
export default async function Page() {
  const { data, error } = await tryCatch(getItems());
  return (
    <PageContainer>
      {error ? <ErrorDisplay /> : <ItemsList items={data} />}
    </PageContainer>
  );
}

// Après: src/app/[...]/page.tsx (Server Component minimal)
export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.auth.login);
  return <PageClient />;
}

// src/app/[...]/page.client.tsx (Client Component)
'use client';
export default function PageClient() {
  const { items, isLoading, error } = useItems();
  
  if (error) return <ErrorDisplay error={error} />;
  if (isLoading) return <LoadingSkeleton />;
  
  return <ItemsList items={items} />;
}
```

## Patterns Spécialisés

### 1. Permissions Hiérarchiques (Agents)

```typescript
// Dans le router
if (user.roles.includes('MANAGER') && !user.roles.includes('ADMIN')) {
  where.managedByUserId = user.id;
}

// Dans les hooks
const { agents } = useAgents({
  managerId: user.roles.includes('MANAGER') ? user.id : undefined
});
```

### 2. Gestion Multi-Pays (Organizations)

```typescript
// Router avec filtrage par pays
.input(z.object({
  countryId: z.string().optional(),
  // ...
}))
.query(async ({ ctx, input }) => {
  const where: Prisma.OrganizationWhereInput = {};
  
  if (input.countryId) {
    where.countries = {
      some: { id: input.countryId }
    };
  }
  
  return db.organization.findMany({ where });
})
```

### 3. Optimistic Updates avec Rollback

```typescript
onMutate: async ({ id, data }) => {
  // 1. Annuler les requêtes en cours
  await utils.items.getList.cancel();
  await utils.items.getById.cancel({ id });
  
  // 2. Sauvegarder l'état précédent
  const previousListData = utils.items.getList.getData();
  const previousItemData = utils.items.getById.getData({ id });
  
  // 3. Mise à jour optimiste
  if (previousListData) {
    utils.items.getList.setData(undefined, {
      ...previousListData,
      items: previousListData.items.map(item =>
        item.id === id ? { ...item, ...data } : item
      )
    });
  }
  
  return { previousListData, previousItemData };
},
onError: (error, variables, context) => {
  // 4. Rollback en cas d'erreur
  if (context?.previousListData) {
    utils.items.getList.setData(undefined, context.previousListData);
  }
}
```

## Configuration du Cache

### Stratégies par Type de Données

```typescript
// Données fréquemment modifiées (30s)
staleTime: 30 * 1000,

// Données modérément stables (5 min)
staleTime: 5 * 60 * 1000,

// Données très stables (10 min)
staleTime: 10 * 60 * 1000,

// Désactiver refetch sur focus
refetchOnWindowFocus: false,
```

## Métriques de Performance

### Réductions de Code Observées

| Module | Avant (lignes) | Après (lignes) | Réduction |
|--------|----------------|----------------|-----------|
| Dashboard | 85 | 23 | 73% |
| Requests | 156 | 31 | 80% |
| Agents | 198 | 42 | 79% |
| Countries | 125 | 18 | 86% |
| Organizations | 142 | 16 | 89% |
| Child Profiles | 134 | 33 | 75% |
| Notifications | 142 | 0 | 100% |

### Bénéfices Mesurés

1. **Type Safety:** 100% end-to-end automatique
2. **Performance:** Cache intelligent avec invalidation sélective
3. **UX:** Optimistic updates pour les actions critiques
4. **DX:** Réduction de 80% du boilerplate
5. **Maintenabilité:** Logique centralisée dans les routers

## Prochaines Étapes

### Phase 3: Modules Utilisateur (2-3 semaines)

1. **Child Profiles** - Gestion des profils enfants
   - Relations familiales complexes
   - Autorisations parentales
   - Documents spécialisés

2. **Notifications** - Système de notifications
   - Temps réel avec WebSockets
   - Préférences utilisateur
   - Templates d'emails

3. **Feedback** - Système de retours
   - Évaluations de services
   - Commentaires agents
   - Analytics

### Phase 4: Optimisations (1 semaine)

1. **Cache Avancé** - Stratégies de cache sophistiquées
2. **Offline Support** - Fonctionnement hors ligne
3. **Real-time Updates** - Mises à jour temps réel
4. **Analytics** - Métriques détaillées

## Recommandations

### Pour les Nouveaux Modules

1. **Commencer par le Router** - Définir l'API d'abord
2. **Hooks Simples** - Commencer par les queries basiques
3. **Optimistic Updates** - Ajouter pour les mutations critiques
4. **Tests** - Valider avec la page de test

### Patterns à Éviter

1. **Fetch dans useEffect** - Utiliser les queries tRPC
2. **State Management Manuel** - Laisser TanStack Query gérer
3. **Invalidation Globale** - Être sélectif dans les invalidations
4. **Mutations Sans Optimisme** - Implémenter pour les actions importantes

## Support et Ressources

- **Documentation tRPC:** [trpc.io](https://trpc.io)
- **TanStack Query:** [tanstack.com/query](https://tanstack.com/query)
- **Tests Migration:** `/dashboard/(superadmin)/test-migration`
- **Exemples:** Voir les routers existants dans `src/server/api/routers/`

---

*Dernière mise à jour: Décembre 2024*
*Modules migrés: 7/9 (78%)*
*Couverture tRPC: Dashboard, Requests, Agents, Countries, Organizations, Child Profiles, Notifications* 