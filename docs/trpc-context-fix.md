# Correction de la duplication des données utilisateur dans le contexte tRPC

## Problème identifié

Le contexte tRPC dupliquait les données utilisateur dans `ctx.auth` et `ctx.user`, créant de la confusion et des patterns d'accès incohérents dans le codebase.

### Structure problématique (avant)

```typescript
// Dans createTRPCContext
return {
  db,
  auth: {
    ...user, // ❌ Duplication des données utilisateur
    sessionId,
    getToken,
  },
  user, // ❌ Même données dans user
  ...opts,
};
```

### Structure corrigée (après)

```typescript
// Dans createTRPCContext
return {
  db,
  auth: {
    userId, // ✅ Seulement l'ID utilisateur
    sessionId,
    getToken,
  },
  user, // ✅ Données utilisateur complètes
  ...opts,
};
```

## Changements effectués

### 1. Restructuration du contexte (`src/server/api/trpc.ts`)

- **Avant**: `ctx.auth` contenait toutes les données utilisateur + `sessionId` et `getToken`
- **Après**: `ctx.auth` contient seulement `userId`, `sessionId` et `getToken`
- **Résultat**: Élimination de la duplication, structure plus claire

### 2. Mise à jour de la procédure protégée

- **Avant**: Vérification de `ctx.auth?.id` (propriété dupliquée)
- **Après**: Vérification de `ctx.auth?.userId` (propriété unique)
- **Résultat**: Cohérence dans les vérifications d'authentification

### 3. Validation des routers existants

- Vérification que tous les routers utilisent la bonne structure
- Correction des accès incohérents aux données utilisateur
- Maintien de la compatibilité avec le code existant

## Bonnes pratiques établies

### Accès aux données utilisateur

```typescript
// ✅ CORRECT - Utiliser ctx.user pour les données utilisateur
const userRoles = ctx.user.roles;
const userEmail = ctx.user.email;
const userCountryCode = ctx.user.countryCode;

// ✅ CORRECT - Utiliser ctx.auth.userId pour l'ID utilisateur
const userId = ctx.auth.userId;

// ❌ INCORRECT - Ne plus utiliser ctx.auth.id
const userId = ctx.auth.id; // Propriété supprimée

// ❌ INCORRECT - Ne plus accéder aux données utilisateur via ctx.auth
const userRoles = ctx.auth.roles; // Données supprimées de ctx.auth
```

### Structure du contexte

```typescript
// Structure finale du contexte tRPC
interface TRPCContext {
  db: PrismaClient;
  auth: {
    userId: string; // ID utilisateur Clerk
    sessionId: string; // ID de session Clerk
    getToken: () => Promise<string | null>; // Fonction pour obtenir le token
  };
  user: SessionUser | null; // Données utilisateur complètes de la DB
  headers: Headers;
}
```

## Avantages de la correction

1. **Élimination de la duplication**: Plus de données utilisateur dupliquées
2. **Cohérence**: Un seul pattern d'accès aux données utilisateur
3. **Clarté**: Séparation claire entre authentification et données utilisateur
4. **Maintenabilité**: Code plus facile à maintenir et déboguer
5. **Performance**: Réduction de la mémoire utilisée (moins de duplication)

## Tests et validation

Un script de test a été créé (`src/server/api/test-context.ts`) pour valider la structure du contexte. Ce fichier peut être supprimé après validation.

## Migration

Aucune migration n'est nécessaire car :

- Les routers existants utilisent déjà la bonne structure
- La procédure protégée maintient la compatibilité
- Les types TypeScript garantissent la cohérence

## Conclusion

Cette correction élimine la confusion causée par la duplication des données utilisateur et établit des patterns d'accès cohérents et maintenables dans tout le codebase tRPC.
