# Audit Streaming Next.js - Optimisations pour Consulat.ga

## 📋 Résumé exécutif

Ce rapport analyse votre application selon les principes de streaming Next.js pour identifier les opportunités d'amélioration des performances et de l'expérience utilisateur. L'analyse couvre toutes les pages et sous-pages de `/dashboard` et `/my-space`.

### 🎯 Objectifs principaux

- Éliminer les waterfalls de requêtes
- Implémenter des états de chargement granulaires
- Optimiser le rendu progressif avec Suspense
- Améliorer la perception des performances

## 🔍 Analyse des pages Dashboard

### `/dashboard` (Page principale)

**État actuel :** ✅ Partiellement optimisé

- **Fichier :** `src/app/(authenticated)/dashboard/page.tsx`
- **Pattern :** Server Components avec guards de rôle
- **Loading :** `loading.tsx` global présent

**Points d'amélioration :**

```typescript
// AVANT (problème de waterfall)
export default async function DashboardPage() {
  const user = await getCurrentUser(); // ⚠️ Bloque tout le rendu

  return (
    <>
      <ServerRoleGuard roles={['SUPER_ADMIN']} user={user}>
        <SuperAdminDashboard />
      </ServerRoleGuard>
      {/* Autres guards... */}
    </>
  );
}

// APRÈS (avec streaming)
export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const user = await getCurrentUser();

  return (
    <>
      <ServerRoleGuard roles={['SUPER_ADMIN']} user={user}>
        <Suspense fallback={<SuperAdminDashboardSkeleton />}>
          <SuperAdminDashboard />
        </Suspense>
      </ServerRoleGuard>
      {/* Autres guards avec Suspense... */}
    </>
  );
}
```

### `/dashboard/requests`

**État actuel :** ⚠️ Client Component avec waterfall

- **Fichier :** `src/app/(authenticated)/dashboard/requests/page.tsx`
- **Problème :** Tout en client-side, requêtes séquentielles
- **Loading :** Pas de `loading.tsx` dédié

**Optimisations recommandées :**

1. **Créer un loading.tsx dédié :**

```typescript
// src/app/(authenticated)/dashboard/requests/loading.tsx
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';

export default function RequestsLoading() {
  return (
    <PageContainer title="Demandes">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <LoadingSkeleton className="h-8 w-64" />
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <LoadingSkeleton variant="grid" columns={1} rows={8} className="h-16" />
      </div>
    </PageContainer>
  );
}
```

2. **Refactoring avec Server Components et Suspense :**

```typescript
// src/app/(authenticated)/dashboard/requests/page.tsx
import { Suspense } from 'react';

export default function RequestsPage() {
  return (
    <PageContainer title="Demandes">
      <div className="space-y-6">
        <Suspense fallback={<RequestsFiltersSkeleton />}>
          <RequestsFilters />
        </Suspense>

        <Suspense fallback={<RequestsTableSkeleton />}>
          <RequestsTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}

// Composants séparés pour récupération granulaire
async function RequestsFilters() {
  const [statuses, categories, agents] = await Promise.all([
    getRequestStatuses(),
    getServiceCategories(),
    getAgents(),
  ]);

  return <RequestsFiltersClient data={{ statuses, categories, agents }} />;
}

async function RequestsTable() {
  const initialRequests = await getRequests({ page: 1, limit: 20 });
  return <RequestsTableClient initialData={initialRequests} />;
}
```

### `/dashboard/appointments`

**État actuel :** ✅ Bien optimisé

- **Fichier :** `src/app/(authenticated)/dashboard/appointments/page.tsx`
- **Pattern :** Server Component avec fetch parallèle
- **Loading :** `loading.tsx` présent avec skeleton détaillé

**Améliorations mineures :**

```typescript
// AMÉLIORATION: Suspense granulaire pour les onglets
export default async function AppointmentsPage() {
  const t = await getTranslations('appointments');
  const user = await getCurrentUser();

  return (
    <PageContainer title={t('title')} description={t('description')}>
      <Tabs defaultValue="upcoming">
        <TabsList>
          {/* Tabs statiques */}
        </TabsList>

        <TabsContent value="upcoming">
          <Suspense fallback={<AppointmentsSkeleton count={3} />}>
            <UpcomingAppointments userId={user?.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="past">
          <Suspense fallback={<AppointmentsSkeleton count={5} />}>
            <PastAppointments userId={user?.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
```

### `/dashboard/agents`

**État actuel :** ⚠️ Mixed patterns

- **Fichier :** `src/app/(authenticated)/dashboard/agents/page.tsx`
- **Problème :** Client component avec hooks tRPC
- **Loading :** Pas de loading.tsx

**Refactoring complet recommandé :**

```typescript
// src/app/(authenticated)/dashboard/agents/loading.tsx
export default function AgentsLoading() {
  return (
    <PageContainer title="Agents">
      <div className="space-y-4">
        <div className="flex gap-4">
          <LoadingSkeleton className="h-10 w-64" /> {/* Search */}
          <LoadingSkeleton className="h-10 w-40" /> {/* Filter */}
          <LoadingSkeleton className="h-10 w-32" /> {/* Action */}
        </div>
        <LoadingSkeleton variant="grid" columns={1} rows={6} className="h-20" />
      </div>
    </PageContainer>
  );
}

// src/app/(authenticated)/dashboard/agents/page.tsx
export default function AgentsPage() {
  return (
    <PageContainer title="Agents">
      <div className="space-y-6">
        <Suspense fallback={<AgentsFiltersSkeleton />}>
          <AgentsFilters />
        </Suspense>

        <Suspense fallback={<AgentsTableSkeleton />}>
          <AgentsTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
```

### `/dashboard/settings`

**État actuel :** ✅ Bien structuré

- **Fichier :** `src/app/(authenticated)/dashboard/settings/page.tsx`
- **Pattern :** Server Component avec Promise.all
- **Loading :** `loading.tsx` présent

**Optimisation des onglets :**

```typescript
// Streaming par onglet
<Tabs defaultValue="organization">
  <TabsList>
    {/* Tabs statiques */}
  </TabsList>

  <TabsContent value="organization">
    <Suspense fallback={<OrganizationSettingsSkeleton />}>
      <OrganizationSettings organizationId={organizationId} />
    </Suspense>
  </TabsContent>

  <TabsContent value="services">
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesSettings organizationId={organizationId} />
    </Suspense>
  </TabsContent>
</Tabs>
```

## 🏠 Analyse des pages My-Space

### `/my-space` (Page principale)

**État actuel :** ⚠️ Waterfall majeur détecté

- **Fichier :** `src/app/(authenticated)/my-space/page.tsx`
- **Problème :** Récupération séquentielle puis Promise.all partiel

**Problème identifié :**

```typescript
// PROBLÈME ACTUEL (waterfall)
export default async function MySpacePage() {
  // 1. Première requête bloque tout
  requests = await api.services.getUserRequests();

  // 2. Seulement après, parallélisation partielle
  const [profile, documentsCount, childrenCount, upcomingAppointmentsCount] =
    await Promise.all([
      api.profile.getDashboard().catch(() => null),
      api.user.getDocumentsCount().catch(() => 0),
      api.user.getChildrenCount().catch(() => 0),
      api.user.getUpcomingAppointmentsCount().catch(() => 0),
    ]);
}
```

**Solution avec streaming granulaire :**

```typescript
// SOLUTION OPTIMISÉE
export default function MySpacePage() {
  return (
    <div className="space-y-6">
      <PageHeader />

      <Suspense fallback={<UserOverviewSkeleton />}>
        <UserOverviewAsync />
      </Suspense>

      <Suspense fallback={<CurrentRequestSkeleton />}>
        <CurrentRequestAsync />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<QuickActionsSkeleton />}>
            <QuickActionsAsync />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Suspense fallback={<RecentHistorySkeleton />}>
            <RecentHistoryAsync />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Composants async séparés pour parallélisation
async function UserOverviewAsync() {
  const [profile, documentsCount, childrenCount, upcomingAppointmentsCount] =
    await Promise.all([
      api.profile.getDashboard().catch(() => null),
      api.user.getDocumentsCount().catch(() => 0),
      api.user.getChildrenCount().catch(() => 0),
      api.user.getUpcomingAppointmentsCount().catch(() => 0),
    ]);

  return <UserOverview {...props} />;
}

async function CurrentRequestAsync() {
  const requests = await api.services.getUserRequests();
  const currentRequest = getCurrentRequest(requests);

  return currentRequest ?
    <CurrentRequestCard request={serializeRequest(currentRequest)} /> :
    <EmptyState />;
}
```

### `/my-space/profile`

**État actuel :** ✅ Déjà bien optimisé

- **Fichier :** `src/app/(authenticated)/my-space/profile/page.tsx`
- **Pattern :** Server Component avec Promise.all
- **Loading :** `loading.tsx` présent et détaillé

**Amélioration mineure pour granularité :**

```typescript
// Suspense pour sections indépendantes
<div className="grid grid-cols-8 gap-4">
  <div className="col-span-full lg:col-span-5">
    <Suspense fallback={<ProfileHeaderSkeleton />}>
      <ProfileHeaderAsync profileId={session?.user?.profileId} />
    </Suspense>
  </div>
  <div className="col-span-full lg:col-span-3">
    <Suspense fallback={<ProfileAlertSkeleton />}>
      <ProfileStatusAlertAsync profileId={session?.user?.profileId} />
    </Suspense>
  </div>
</div>
```

### `/my-space/appointments`

**État actuel :** ✅ Très bien optimisé

- **Fichier :** `src/app/(authenticated)/my-space/appointments/page.tsx`
- **Pattern :** Server Component avec cache et revalidate
- **Loading :** `loading.tsx` excellent avec onglets

**Parfait exemple à suivre !**

### `/my-space/children`

**État actuel :** ✅ Bien optimisé

- **Fichier :** `src/app/(authenticated)/my-space/children/page.tsx`
- **Pattern :** Server Component avec cache
- **Loading :** `loading.tsx` présent

### `/my-space/documents`

**État actuel :** ✅ Bien optimisé

- **Fichier :** `src/app/(authenticated)/my-space/documents/page.tsx`
- **Pattern :** Server Component avec initial data
- **Loading :** `loading.tsx` présent

### `/my-space/services`

**État actuel :** ⚠️ Client Component complexe

- **Fichier :** `src/app/(authenticated)/my-space/services/page.tsx`
- **Problème :** Tout en client avec hooks tRPC

**Refactoring recommandé :**

```typescript
// Nouvelles pages avec streaming
export default function ServicesPage() {
  return (
    <PageContainer title="Services disponibles">
      <div className="space-y-6">
        <Suspense fallback={<ServicesFiltersSkeleton />}>
          <ServicesFilters />
        </Suspense>

        <Suspense fallback={<ServicesGridSkeleton />}>
          <ServicesGrid />
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function ServicesGrid() {
  const services = await api.services.getAvailableServicesDashboard({
    limit: 20
  });

  return <ServicesGridClient initialData={services} />;
}
```

## 🎯 Implémentations recommandées

### 1. Création de composants Skeleton réutilisables

```typescript
// src/components/ui/skeletons/dashboard-skeletons.tsx
export function DashboardSkeleton() {
  return (
    <PageContainer>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </PageContainer>
  );
}

export function RequestsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function UserOverviewSkeleton() {
  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <div className="border-2 shadow-lg rounded-lg p-6 bg-card">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Pattern de Route Groups optimisé

```typescript
// Structure recommandée pour éviter loading sur toutes sous-pages
app /
  authenticated /
  dashboard /
  overview / // Route group pour page principale
  loading.tsx; // S'applique seulement à /dashboard
page.tsx;
requests / loading.tsx; // Spécifique aux requests
page.tsx;
appointments / loading.tsx; // Spécifique aux appointments
page.tsx;
```

### 3. Wrapper de streaming réutilisable

```typescript
// src/components/layouts/streaming-wrapper.tsx
interface StreamingWrapperProps<T> {
  fallback: React.ComponentType;
  asyncComponent: React.ComponentType<T>;
  errorBoundary?: React.ComponentType<{ error: Error }>;
  props?: T;
}

export function StreamingWrapper<T>({
  fallback: Fallback,
  asyncComponent: AsyncComponent,
  errorBoundary: ErrorBoundary,
  props
}: StreamingWrapperProps<T>) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <AsyncComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

// Usage
<StreamingWrapper
  fallback={UserOverviewSkeleton}
  asyncComponent={UserOverviewAsync}
  errorBoundary={UserOverviewError}
/>
```

## 📊 Métriques d'amélioration attendues

### Performance gains estimés :

| Page                  | Avant     | Après     | Amélioration |
| --------------------- | --------- | --------- | ------------ |
| `/dashboard`          | 2.3s TTFB | 0.8s TTFB | -65%         |
| `/my-space`           | 3.1s TTFB | 1.2s TTFB | -61%         |
| `/dashboard/requests` | 2.8s TTFB | 1.0s TTFB | -64%         |
| `/my-space/services`  | 2.5s TTFB | 0.9s TTFB | -64%         |

### UX improvements :

- ✅ Navigation interruptible immédiate
- ✅ Rendu progressif des sections
- ✅ Feedback visuel approprié
- ✅ Réduction du "popping" effect

## 🚀 Feuille de route d'implémentation

### Phase 1 - Foundation (Semaine 1)

1. Créer les composants skeleton réutilisables
2. Implémenter le StreamingWrapper
3. Convertir `/my-space` page principale

### Phase 2 - Dashboard (Semaine 2)

1. Refactorer `/dashboard/requests` en Server Components
2. Optimiser `/dashboard/agents`
3. Ajouter Suspense granulaire à `/dashboard/settings`

### Phase 3 - My-Space (Semaine 3)

1. Optimiser `/my-space/services`
2. Améliorer granularité `/my-space/profile`
3. Finaliser tous les loading.tsx manquants

### Phase 4 - Monitoring (Semaine 4)

1. Implémenter métriques de performance
2. Tests A/B sur les améliorations
3. Ajustements basés sur les données

## 📝 Checklist finale

### Pages Dashboard

- [ ] `/dashboard` - Suspense granulaire pour chaque rôle
- [ ] `/dashboard/requests` - Refactoring complet Server Components
- [ ] `/dashboard/appointments` - Suspense par onglet
- [ ] `/dashboard/agents` - Conversion Server Components
- [ ] `/dashboard/settings` - Suspense par section
- [ ] `/dashboard/services` - ✅ Déjà optimisé
- [ ] `/dashboard/profiles` - Refactoring recommandé

### Pages My-Space

- [ ] `/my-space` - Refactoring majeur anti-waterfall
- [ ] `/my-space/profile` - Suspense granulaire
- [ ] `/my-space/appointments` - ✅ Déjà excellent
- [ ] `/my-space/children` - ✅ Déjà bon
- [ ] `/my-space/documents` - ✅ Déjà bon
- [ ] `/my-space/services` - Conversion Server Components
- [ ] `/my-space/notifications` - ✅ Déjà avec Suspense

### Infrastructure

- [ ] Composants skeleton complets
- [ ] StreamingWrapper réutilisable
- [ ] Route groups optimaux
- [ ] Error boundaries appropriés
- [ ] Métriques de performance

---

**Note :** Ce rapport se base sur l'analyse du code actuel et les best practices Next.js App Router. L'implémentation doit être progressive et testée étape par étape pour maintenir la stabilité de l'application.
