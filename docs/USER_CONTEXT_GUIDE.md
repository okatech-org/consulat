# Guide d'utilisation du Contexte Utilisateur Global

Ce guide explique comment utiliser le nouveau système de contexte utilisateur global qui évite les appels API répétés et centralise la gestion des données utilisateur.

## Vue d'ensemble

Le système comprend :

- **UserProvider** : Contexte React global pour les données utilisateur
- **Hooks spécialisés** : Pour différents cas d'usage
- **Protection des routes** : Avec hooks de garde automatique
- **Synchronisation** : Avec NextAuth et mise en cache intelligente

## Architecture

```
UserProvider (Context)
├── Synchronisation avec NextAuth Session
├── Cache local des données utilisateur
├── Méthodes de mise à jour
└── Hooks spécialisés
    ├── useUser() - Accès complet
    ├── useAuth() - État d'authentification
    ├── useUserInfo() - Informations dérivées
    └── useRequireAuth() - Protection des routes
```

## Installation

Le provider est déjà configuré dans `app/layout.tsx` :

```tsx
<TRPCReactProvider>
  <SessionProvider>
    <UserProvider>{children}</UserProvider>
  </SessionProvider>
</TRPCReactProvider>
```

## Utilisation des Hooks

### 1. `useAuth()` - État d'authentification

Pour vérifier l'authentification sans données complètes :

```tsx
import { useAuth } from "@/contexts/user-context";

export function LoginButton() {
  const { isAuthenticated, isLoading, isGuest } = useAuth();

  if (isLoading) return <Loader />;

  return isAuthenticated ? <LogoutButton /> : <LoginButton />;
}
```

### 2. `useUserInfo()` - Informations utilisateur enrichies

Pour accéder aux données utilisateur avec informations dérivées :

```tsx
import { useUserInfo } from "@/contexts/user-context";

export function UserProfile() {
  const userInfo = useUserInfo();

  return (
    <div>
      <h1>{userInfo.displayName}</h1>
      <p>{userInfo.email}</p>
      <div className="avatar">{userInfo.initials}</div>
      {userInfo.hasPhone && <p>{userInfo.phoneNumber}</p>}
    </div>
  );
}
```

**Propriétés disponibles :**

- `name`, `email`, `phoneNumber`, `role`, `image`, `id`
- `displayName` : Nom ou email en fallback
- `initials` : Initiales générées automatiquement
- `hasPhone`, `hasImage` : Booléens de présence

### 3. `useUser()` - Accès complet avec contrôle

Pour un contrôle total des données et actions :

```tsx
import { useUser } from "@/contexts/user-context";

export function UserSettings() {
  const { user, updateUser, refreshUser, isLoading } = useUser();

  const handleUpdateProfile = (newData) => {
    // Mise à jour locale immédiate
    updateUser(newData);

    // Appel API en arrière-plan
    api.updateProfile(newData);
  };

  return (
    <form onSubmit={handleUpdateProfile}>
      <input defaultValue={user?.name} />
      <button type="submit">Sauvegarder</button>
    </form>
  );
}
```

## Protection des Routes

### 1. Hook générique `useRequireAuth()`

```tsx
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function ProtectedPage() {
  const { shouldRender, isLoading, user } = useRequireAuth({
    redirectTo: "/auth/login", // Par défaut
    redirectIfAuthenticated: false, // Pour pages login/signup
  });

  if (isLoading || !shouldRender) {
    return <Loader />;
  }

  return <div>Contenu protégé pour {user?.name}</div>;
}
```

### 2. Hooks spécialisés

```tsx
// Pour pages nécessitant authentification
import { useRequireAuthenticatedUser } from "@/hooks/use-require-auth";

export default function DashboardPage() {
  const { shouldRender, isLoading } = useRequireAuthenticatedUser();

  if (isLoading || !shouldRender) return <Loader />;
  return <Dashboard />;
}

// Pour pages login/signup (redirection si déjà connecté)
import { useRedirectIfAuthenticated } from "@/hooks/use-require-auth";

export default function LoginPage() {
  const { shouldRender } = useRedirectIfAuthenticated();

  if (!shouldRender) return <Loader />;
  return <LoginForm />;
}
```

## Exemples de Composants

### Composant Avatar avec Menu

```tsx
import { UserAvatar } from '@/components/user/user-avatar';

// Avatar avec dropdown
<UserAvatar size="md" showDropdown={true} />

// Avatar simple
<UserAvatar size="lg" showDropdown={false} />

// Avatar avec nom
<UserAvatarWithName />
```

### Affichage conditionnel selon l'authentification

```tsx
import { useAuth } from "@/contexts/user-context";

export function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav>
      <Logo />
      {isAuthenticated ? (
        <UserMenu />
      ) : (
        <div>
          <Link href="/auth/login">Connexion</Link>
          <Link href="/auth/signup">Inscription</Link>
        </div>
      )}
    </nav>
  );
}
```

## Mise à jour des Données

### 1. Mise à jour locale (immédiate)

```tsx
const { updateUser } = useUser();

// Mise à jour immédiate de l'interface
updateUser({ name: "Nouveau nom" });
```

### 2. Rafraîchissement depuis le serveur

```tsx
const { refreshUser } = useUser();

// Force le rechargement depuis NextAuth
await refreshUser();
```

### 3. Pattern optimiste avec API

```tsx
const { user, updateUser } = useUser();
const updateProfileMutation = api.user.updateProfile.useMutation();

const handleUpdate = async (newData) => {
  // 1. Mise à jour optimiste
  updateUser(newData);

  try {
    // 2. Appel API
    await updateProfileMutation.mutateAsync(newData);
  } catch (error) {
    // 3. Rollback en cas d'erreur
    updateUser(user); // Restaurer l'état précédent
    showError("Erreur lors de la sauvegarde");
  }
};
```

## Avantages du Système

### ✅ **Performance**

- **Pas d'appels API répétés** : Les données sont mises en cache
- **Rendu optimisé** : Évite les re-renders inutiles
- **Hydratation fluide** : Synchronisation avec NextAuth

### ✅ **Developer Experience**

- **Hooks spécialisés** : Pour chaque cas d'usage
- **TypeScript complet** : Autocomplétion et vérification de types
- **Protection automatique** : Des routes avec hooks de garde

### ✅ **Fonctionnalités**

- **Informations dérivées** : Initiales, display name, etc.
- **État global synchronisé** : Entre tous les composants
- **Mise à jour optimiste** : Interface réactive

## Migration depuis l'ancien système

### Avant (avec useSession)

```tsx
// ❌ Ancien système
import { useSession } from "next-auth/react";

export function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loader />;
  if (!session) return <LoginPrompt />;

  return <div>Hello {session.user?.name}</div>;
}
```

### Après (avec UserContext)

```tsx
// ✅ Nouveau système
import { useRequireAuthenticatedUser } from "@/hooks/use-require-auth";
import { useUserInfo } from "@/contexts/user-context";

export function Component() {
  const { shouldRender, isLoading } = useRequireAuthenticatedUser();
  const userInfo = useUserInfo();

  if (isLoading || !shouldRender) return <Loader />;

  return <div>Hello {userInfo.displayName}</div>;
}
```

## Bonnes Pratiques

1. **Utilisez le hook approprié** selon votre besoin
2. **Vérifiez `shouldRender`** pour les pages protégées
3. **Privilégiez `updateUser()`** pour les mises à jour immédiates
4. **Implémentez des rollbacks** pour les mises à jour optimistes
5. **Utilisez les composants fournis** (UserAvatar, etc.)

Ce système centralise la gestion des utilisateurs et améliore significativement les performances en évitant les appels API redondants ! 🚀
