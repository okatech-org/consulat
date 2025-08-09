# Migration useUserData() vers appels tRPC côté client

## Vue d'ensemble

Cette migration vise à remplacer l'utilisation du hook `useUserData()` qui charge TOUTES les données côté serveur via `loadUserData()` par des appels tRPC spécifiques côté client dans chaque composant.

**Problème actuel :** Le `loadUserData()` fait 8 appels tRPC en parallèle et charge tout d'un coup :

- `api.profile.getCurrent()`
- `api.requests.getList({})`
- `api.appointments.getList({ userId: user.id })`
- `api.documents.getUserDocuments()`
- `api.services.getAvailable()`
- `api.requests.getCurrent()`
- `api.notifications.getUnreadCount()`
- `api.countries.getActive()`

**Solution :** Chaque composant fait ses propres appels tRPC avec loading states appropriés.

## Fichiers concernés

### 1. `/src/app/(authenticated)/my-space/_components/requests-history.tsx`

**Données utilisées :** `requests` (tableau complet des demandes)

**Migration :**

```tsx
// AVANT
const { requests } = useUserData();

// APRÈS
const { data: requests, isLoading } = api.requests.getList.useQuery({});
```

**tRPC endpoint :** `api.requests.getList` ✅ (existe déjà)

---

### 2. `/src/app/(authenticated)/my-space/_components/current-request-card.tsx` ✅ **TERMINÉ**

**Données utilisées :** `currentRequest` (demande en cours)

**Migration :**

```tsx
// AVANT
const { currentRequest } = useUserData();

// APRÈS
const { data: currentRequest, isLoading } = api.requests.getCurrent.useQuery();
```

**tRPC endpoint :** `api.requests.getCurrent` ✅ (existe déjà)

**Changements appliqués :**

- ✅ Remplacement `useUserData()` par `api.requests.getCurrent.useQuery()`
- ✅ Ajout du loading state avec `LoadingSkeleton`
- ✅ Import des dépendances nécessaires

---

### 3. `/src/app/(authenticated)/my-space/_components/user-overview.tsx`

**Données utilisées :** `profile`, `requests`, `stats`

**Migration :**

```tsx
// AVANT
const { profile, requests, stats } = useUserData();

// APRÈS
const { data: profile, isLoading: profileLoading } = api.profile.getCurrent.useQuery();
const { data: requests, isLoading: requestsLoading } = api.requests.getList.useQuery({});
const { data: documents, isLoading: docsLoading } =
  api.documents.getUserDocuments.useQuery();
// Calculer les stats côté client
```

**tRPC endpoints :**

- `api.profile.getCurrent` ✅
- `api.requests.getList` ✅
- `api.documents.getUserDocuments` ✅

---

### 4. `/src/app/(authenticated)/my-space/_components/recent-history.tsx`

**Données utilisées :** `requests` (pour afficher l'historique récent)

**Migration :**

```tsx
// AVANT
const { requests } = useUserData();

// APRÈS
const { data: requests, isLoading } = api.requests.getList.useQuery({ limit: 5 });
```

**tRPC endpoint :** `api.requests.getList` ✅ (existe déjà)

---

### 5. `/src/app/(authenticated)/my-space/profile/page.tsx` ✅ **TERMINÉ**

**Données utilisées :** `profile` avec `profile.requestsFor`

**Migration :**

```tsx
// AVANT
const { profile } = useUserData();

// APRÈS
const { data: profile, isLoading } = api.profile.getCurrent.useQuery();
```

**tRPC endpoint :** `api.profile.getCurrent` ✅ (existe déjà)

**Changements appliqués :**

- ✅ Remplacement `useUserData()` par `api.profile.getCurrent.useQuery()`
- ✅ Ajout du loading state avec `LoadingSkeleton variant="form"`
- ✅ Suppression de l'import inutile `use-role-data`

---

### 6. `/src/app/(authenticated)/my-space/settings/page.tsx`

**Données utilisées :** `user` (informations utilisateur de base)

**Migration :**

```tsx
// AVANT
const { user } = useUserData();

// APRÈS
// GARDER VIA SESSION - pas de changement nécessaire
```

**Endpoint :** Session - aucun changement ✅

---

### 7. `/src/app/(authenticated)/my-space/profile/form/page.tsx` ✅ **TERMINÉ**

**Données utilisées :** `profile` (profil pour pré-remplir le formulaire)

**Migration :**

```tsx
// AVANT
const { profile } = useUserData();

// APRÈS
const { data: profile, isLoading: profileLoading } = api.profile.getCurrent.useQuery();
```

**tRPC endpoint :** `api.profile.getCurrent` ✅ (existe déjà)

**Changements appliqués :**

- ✅ Remplacement `useUserData()` par `api.profile.getCurrent.useQuery()`
- ✅ Ajout du loading state avec `LoadingSkeleton variant="form"`
- ✅ Suppression de l'import inutile `use-role-data`

---

### 8. `/src/app/(authenticated)/my-space/children/page.tsx` ✅ **TERMINÉ**

**Données utilisées :** `children` (depuis profile.parentAuthorities)

**Migration :**

```tsx
// AVANT
const { children } = useUserData();

// APRÈS
const { data: profile, isLoading } = api.profile.getCurrent.useQuery();
const children = profile?.parentAuthorities || [];
```

**tRPC endpoint :** `api.profile.getCurrent` ✅ (existe déjà)

**Changements appliqués :**

- ✅ Remplacement `useUserData()` par `api.profile.getCurrent.useQuery()`
- ✅ Extraction `children` depuis `profile.parentAuthorities`
- ✅ Ajout du loading state avec `LoadingSkeleton`
- ✅ Suppression de `async` et conversion en composant client

---

### 9. `/src/app/(authenticated)/my-space/appointments/page.tsx`

**Données utilisées :** `appointments` (appointments groupés)

**Migration :**

```tsx
// AVANT
const { appointments } = useUserData();

// APRÈS
const { data: appointments, isLoading } = api.appointments.getList.useQuery({
  userId: user.id,
});
```

**tRPC endpoint :** `api.appointments.getList` ✅ (existe déjà)

---

### 10. `/src/components/ui/user-bottom-navigation.tsx`

**Données utilisées :** `user` (utilisateur de base pour vérification auth)

**Migration :** **AUCUN CHANGEMENT** - garder via session

---

### 11. `/src/components/documents/documents-list-client.tsx`

**Données utilisées :** `documents` (documents initiaux)

**Migration :**

```tsx
// AVANT
const { documents: initialData } = useUserData();

// APRÈS
const { data: documents, isLoading } = api.documents.getUserDocuments.useQuery();
```

**tRPC endpoint :** `api.documents.getUserDocuments` ✅ (existe déjà)

---

### 12. `/src/hooks/use-navigation.tsx`

**Données utilisées :** `stats` (pour badges de navigation)

**Migration :**

```tsx
// AVANT
const { stats } = useUserData();

// APRÈS
const { data: profile } = api.profile.getCurrent.useQuery();
const { data: requests } = api.requests.getList.useQuery({});
const { data: appointments } = api.appointments.getList.useQuery({ userId: user.id });
const { data: notifications } = api.notifications.getUnreadCount.useQuery();
// Calculer les stats côté client
```

**tRPC endpoints :** Plusieurs endpoints existants ✅

---

### 13. `/src/components/dashboards/dashboard-client.tsx`

**Données utilisées :** Données complètes selon le rôle USER

**Migration :**

```tsx
// AVANT
const userData = useUserData();

// APRÈS
const { data: profile } = api.profile.getCurrent.useQuery();
const { data: requests } = api.requests.getList.useQuery({});
const { data: documents } = api.documents.getUserDocuments.useQuery();
// Calculer les stats côté client
```

**tRPC endpoints :** Plusieurs endpoints existants ✅

## Stratégie de migration

### Phase 1 : Modifier loadUserData()

1. **Supprimer tous les appels** dans `loadUserData()` sauf `user`
2. **Garder seulement les données session** dans le context

### Phase 2 : Migration par composant

1. **Commencer par les simples** : `current-request-card`, `profile/form/page`
2. **Continuer avec les moyens** : pages individuelles
3. **Finir par les complexes** : `user-overview`, `dashboard-client`, `use-navigation`

### Phase 3 : Loading states et UX

1. **Ajouter LoadingSkeleton** appropriés
2. **Gérer les états d'erreur**
3. **Optimiser avec Suspense** si nécessaire

## Endpoints tRPC existants à utiliser

**TOUS LES ENDPOINTS EXISTENT DÉJÀ !** ✅

1. `api.profile.getCurrent()` ✅
2. `api.requests.getList({})` ✅
3. `api.requests.getCurrent()` ✅
4. `api.appointments.getList({ userId })` ✅
5. `api.documents.getUserDocuments()` ✅
6. `api.services.getAvailable()` ✅
7. `api.notifications.getUnreadCount()` ✅
8. `api.countries.getActive()` ✅

## Modifications nécessaires

### 1. `src/lib/role-data-loader.ts`

```tsx
// AVANT - loadUserData() charge tout
async function loadUserData(user: SessionUser): Promise<UserData> {
  const [profile, requests, appointments, ...] = await Promise.all([...]);

// APRÈS - loadUserData() ne charge que user
async function loadUserData(user: SessionUser): Promise<UserData> {
  return {
    role: UserRole.USER,
    user: user as UserSession,
    // Supprimer tout le reste
  };
}
```

### 2. `src/types/role-data.ts`

```tsx
// Simplifier UserData pour ne garder que user
export interface UserData {
  role: 'USER';
  user: UserSession;
  // Supprimer profile, requests, appointments, etc.
}
```

### 3. `src/hooks/use-role-data.ts`

```tsx
// Adapter useUserData() pour ne retourner que user
export function useUserData(): { user: SessionUser } {
  const data = useRoleData();
  if (data?.role !== 'USER') {
    throw new Error("Vous n'avez pas les permissions pour accéder à cette page.");
  }
  return { user: data.user };
}
```

## Bénéfices attendus

1. **Performance** : Chargement uniquement des données nécessaires par page
2. **Temps de chargement initial** : Plus rapide car moins de données à charger
3. **Cache tRPC** : Gestion automatique du cache par endpoint
4. **Loading states** : UX plus fine avec loaders spécifiques
5. **Maintenance** : Code plus modulaire et testé individuellement

## Points d'attention

- **User session** : Garder `user` accessible pour l'auth ✅
- **Loading states** : Ajouter des LoadingSkeleton appropriés
- **Error handling** : Gérer les erreurs avec ErrorBoundary
- **Performance** : Les appels parallèles quand plusieurs endpoints nécessaires
- **Types** : Adapter les types TypeScript suite à la suppression de données
