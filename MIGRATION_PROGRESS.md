# Progression de la Migration: Prisma + tRPC → Convex

**Date**: 2025-10-19
**Statut**: En cours - Phase 2 complétée

## ✅ Pages complètement migrées (5/16)

### Phase 1: Pages Simples (3/3)
1. ✅ **Feedback** (`dashboard/feedback/`)
   - Utilise la table `tickets` existante dans Convex
   - Fonctions CRUD dans `convex/functions/feedback.ts`
   - Hook `use-feedback.ts` migré et utilise `tickets` table
   - Page fonctionnelle

2. ✅ **Notifications** (`dashboard/notifications/`)
   - Déjà migré (pas de changements nécessaires)

3. ✅ **Account** (`dashboard/account/`)
   - Utilise `useCurrentUser` (Convex)
   - Mutation `updateUser` de Convex
   - Corrections TypeScript pour rôles/propriétés

### Phase 2: CRUD Basique (2/2)
4. ✅ **Countries** (`dashboard/(superadmin)/countries/`)
   - Query enrichie `getEnrichedCountries` avec compteurs
   - Hook `use-countries.ts` complètement migré
   - Type helper `EnrichedCountry` créé
   - Composants migrés :
     - `countries-list.tsx` 
     - `create-country-button.tsx`
     - `edit-country-dialog.tsx`
   - Toutes mutations fonctionnelles

5. ✅ **Services** (`dashboard/services/`)
   - Page convertie en client component
   - Hook `use-services.ts` créé
   - Fetch organizations depuis Convex
   - **À FAIRE**: Refactorer `services-table.tsx` (515 lignes)

---

## 📋 Tâches restantes (11/16)

### Phase 3: Listes avec Filtres
- [ ] **Agents** (`dashboard/agents/`)
- [ ] **Organizations** (`dashboard/(superadmin)/organizations/`)
- [ ] **Users** (`dashboard/(superadmin)/users/`)

### Phase 4: Domaines Complexes
- [ ] **Appointments** (`dashboard/appointments/`)
- [ ] **Profiles** (`dashboard/profiles/`)
- [ ] **Requests** (`dashboard/requests/`)

### Phase 5: Pages Spécialisées
- [ ] **Tickets** (`dashboard/(superadmin)/tickets/`)
- [ ] **Competences** (`dashboard/competences/`)
- [ ] **Document Templates** (`dashboard/document-templates/`)
- [ ] **Settings** (`dashboard/settings/`)
- [ ] **Maps** (`dashboard/maps/`)

---

## 🎯 Patterns Établis

### Pattern 1: Hook de Gestion des Ressources

```typescript
// Créer dans src/hooks/use-[ressource].ts
export function use[Ressource](options?: FilterOptions) {
  // 1. Fetch les données avec useQuery(api.functions.[ressource].getAll...)
  // 2. Filtrer côté client avec useMemo
  // 3. Paginer côté client avec useMemo
  // 4. Créer wrappers pour mutations avec toast
  // 5. Retourner { data, isLoading, mutations, ... }
}
```

### Pattern 2: Page Client Component

```typescript
// Utiliser 'use client' en haut
// Importer useQuery, useMutation de convex/react
// Importer api de @/convex/_generated/api
// Utiliser le hook créé
// Passer data au composant de table/liste
```

### Pattern 3: Type Enrichi (si nécessaire)

```typescript
// Créer dans src/types/convex-helpers.ts
export type Enriched[Ressource] = Doc<'[ressource]'> & {
  _count?: { related: number }
  // relations enrichies
}
```

### Pattern 4: Query Enrichie (si nécessaire)

```typescript
// Dans convex/functions/[ressource].ts
export const getEnriched[Ressource] = query({
  args: { /* params */ },
  handler: async (ctx, args) => {
    // Fetch principale
    // Fetch relations
    // Retourner enrichi
  }
})
```

---

## 🚀 Recommandations pour Continuer

### Ordre de migration optimal

1. **Agents** (listes simples, bonne taille)
2. **Organizations** (CRUD simple)
3. **Users** (liste avec filtres)
4. **Appointments** (gestion de créneaux)
5. **Profiles** (export Excel, images)
6. **Requests** (workflow, bulk actions)
7. **Tickets** (ticketing simple)
8. **Competences** (annuaire avec stats)
9. **Document Templates** (templates)
10. **Settings** (configuration org)
11. **Maps** (vues géographiques)

### Astuces pour Accélérer

1. **Réutiliser les patterns** : Les 5 pages migrées ont établi les patterns clés
2. **Utiliser find & replace** :
   - `@/actions/[ressource]` → `@/hooks/use-[ressource]`
   - `import { api } from '@/trpc/react'` → `import { useQuery, useMutation } from 'convex/react'`
3. **Copier les hooks** : `use-countries.ts` et `use-services.ts` sont des templates
4. **Tests rapides** : Focus sur l'une page à la fois

---

## 📊 Statistiques de Migration

- **Fichiers migrés**: 15+ (hooks, pages, composants)
- **Imports tRPC supprimés**: 20+
- **Types Convex adoptés**: 5+
- **Queries enrichies créées**: 1 (countries)
- **Progress**: 31% (5/16 pages)

---

## 🔍 Checklist de Vérification

Pour chaque page migrée, vérifier :

- [ ] Pas d'imports `@/trpc/react` ou `@/trpc/server`
- [ ] Pas d'imports `@/actions/[ressource]`
- [ ] Utilise `useQuery` et `useMutation` de `convex/react`
- [ ] Types utilisent `Doc<'[ressource]'>` de Convex
- [ ] Pas d'appels à `refetch()` (Convex réactif)
- [ ] Gestion d'erreurs avec try/catch
- [ ] Toast notifications avec `sonner`
- [ ] Tests manuels passés

---

## 📝 Notes Importantes

### Services Table Component
Le fichier `services-table.tsx` (515 lignes) necessite une refactorisation importante:
- Supprimer les imports `@/actions/services`
- Utiliser le hook `use-services` créé
- Adapter les types Convex
- **Temps estimé**: 2-3 heures

### Considérations Générales
- Convex est **réactif par défaut** : pas besoin de `refetch()` manuel
- Convex remet à jour les queries **automatiquement** lors de mutations
- Les erreurs Convex se propagent : utiliser try/catch
- Limites de requêtes: Faire attention aux N+1 queries
- **Solution**: Créer des queries enrichies quand nécessaire

---

## 🎓 Références Utiles

- Document original: `MIGRATION_DASHBOARD_CONVEX.md`
- Patterns Convex: Voir fichiers `use-countries.ts` et `use-services.ts`
- Convex Docs: https://docs.convex.dev

