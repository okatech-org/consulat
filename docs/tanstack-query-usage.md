# Guide d'utilisation de TanStack Query avec tRPC

## Vue d'ensemble

Votre projet utilise **TanStack Query** (anciennement React Query) via **tRPC** pour gérer l'état serveur. Cette combinaison offre :

- 🚀 **Cache automatique** des données
- 🔄 **Synchronisation** en temps réel
- 🎯 **Mutations optimistes** pour une UX fluide
- 🛡️ **Type-safety** de bout en bout
- ⚡ **Performance** optimisée

## Concepts clés

### 1. Queries (Requêtes)

Les queries sont utilisées pour **récupérer** des données :

```typescript
// Utilisation basique
const { data, isLoading, error } = api.user.getCurrentUser.useQuery();

// Avec options
const { data } = api.user.getCurrentUser.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // Données fraîches pendant 5 min
  gcTime: 10 * 60 * 1000, // Cache pendant 10 min
  refetchInterval: 30 * 1000, // Refetch toutes les 30s
  retry: 3, // Réessayer 3 fois si erreur
});
```

### 2. Mutations

Les mutations sont utilisées pour **modifier** des données :

```typescript
const updateProfile = api.user.updateProfile.useMutation({
  onMutate: async (newData) => {
    // Code exécuté avant la mutation (optimistic update)
  },
  onSuccess: (data) => {
    // Code exécuté si succès
  },
  onError: (error) => {
    // Code exécuté si erreur
  },
  onSettled: () => {
    // Code exécuté dans tous les cas
  },
});

// Utilisation
updateProfile.mutate({ name: "Nouveau nom" });
```

### 3. Invalidation et refetch

```typescript
const utils = api.useUtils();

// Invalider une query spécifique
await utils.user.getCurrentUser.invalidate();

// Invalider toutes les queries d'un routeur
await utils.user.invalidate();

// Refetch une query
await utils.user.getCurrentUser.refetch();
```

## Patterns avancés

### 1. Mutations optimistes

```typescript
const updateProfile = api.user.updateProfile.useMutation({
  onMutate: async (newData) => {
    // 1. Annuler les refetch en cours
    await utils.user.getCurrentUser.cancel();

    // 2. Sauvegarder l'état actuel
    const previousData = utils.user.getCurrentUser.getData();

    // 3. Mettre à jour optimistiquement
    utils.user.getCurrentUser.setData(undefined, (old) => ({
      ...old,
      ...newData,
    }));

    // 4. Retourner le contexte pour rollback
    return { previousData };
  },
  onError: (err, newData, context) => {
    // Rollback en cas d'erreur
    if (context?.previousData) {
      utils.user.getCurrentUser.setData(undefined, context.previousData);
    }
  },
  onSettled: () => {
    // Toujours refetch pour synchroniser
    void utils.user.getCurrentUser.invalidate();
  },
});
```

### 2. Prefetching (SSR)

Dans les Server Components :

```typescript
// src/app/page.tsx
export default async function Page() {
  const session = await auth();

  if (session?.user) {
    // Prefetch les données côté serveur
    void api.user.getCurrentUser.prefetch();
    void api.post.getLatest.prefetch();
  }

  return <HydrateClient>...</HydrateClient>;
}
```

### 3. Hook personnalisé

```typescript
// src/hooks/use-user.ts
export function useUser() {
  const query = api.user.getCurrentUser.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    refetch: query.refetch,
  };
}

// Utilisation
function MyComponent() {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }

  return <div>Bonjour {user.name}!</div>;
}
```

## Options importantes

### staleTime vs gcTime

- **staleTime** : Durée pendant laquelle les données sont considérées "fraîches"
- **gcTime** : Durée de conservation en cache après que les données soient "stale"

```typescript
{
  staleTime: 5 * 60 * 1000,  // 5 minutes
  gcTime: 10 * 60 * 1000,    // 10 minutes
}
```

### Refetch automatique

```typescript
{
  refetchOnWindowFocus: true,    // Refetch au focus
  refetchOnReconnect: true,      // Refetch à la reconnexion
  refetchInterval: 30 * 1000,    // Refetch périodique
}
```

### Gestion d'erreur

```typescript
{
  retry: 3,                      // Nombre de tentatives
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
}
```

## Bonnes pratiques

1. **Utilisez les hooks personnalisés** pour partager la logique
2. **Prefetch côté serveur** pour améliorer les performances
3. **Configurez staleTime** selon vos besoins de fraîcheur
4. **Utilisez les mutations optimistes** pour une meilleure UX
5. **Invalidez intelligemment** plutôt que de refetch partout

## Debugging

Dans les DevTools React, installez l'extension TanStack Query DevTools :

```bash
bun add @tanstack/react-query-devtools
```

Puis ajoutez dans votre layout :

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Dans votre composant
{process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

## Ressources

- [Documentation TanStack Query](https://tanstack.com/query/latest)
- [Documentation tRPC](https://trpc.io/docs)
- [Guide sur les mutations optimistes](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
