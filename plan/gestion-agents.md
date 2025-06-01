# Plan d'implémentation : Gestion des agents

## 1. Structure et accès

- [x] Créer le dossier `src/app/(authenticated)/dashboard/agents/`
- [x] Créer la page principale `page.tsx` pour le listing des agents
- [x] Créer la page de détail `[id]/page.tsx` pour les informations détaillées d'un agent
- [x] Restreindre l'accès à ces pages aux rôles `ADMIN` et `MANAGER` via un guard
- [x] Ajouter la route dans la navigation si besoin

## 2. Listing des agents

- [x] Utiliser le composant DataTable existant (`/src/components/data-table/data-table.tsx`)
- [x] Afficher : nom, email, téléphone, pays liés, nombre de demandes traitées, temps moyen de traitement, statut
- [x] Ajouter une recherche et des filtres (pays, spécialisation, statut)
- [x] Prévoir un état vide (EmptyState) et loading
- [x] Prévoir pagination et responsive mobile

## 3. Détail d'un agent

- [x] Créer la page `[id]/page.tsx` pour afficher :
  - Infos agent (nom, email, téléphone, pays, spécialisation)
  - Statistiques : nombre de demandes traitées, temps moyen, demandes en cours, etc.
  - Liste des demandes assignées (table ou liste)
  - Liste des rendez-vous à venir
  - Actions (désactiver, réinitialiser mot de passe, etc. selon droits)
- [x] Utiliser les composants UI existants (stats-card, table, etc.)
- [x] Prévoir un état vide et loading

## 4. Backend & Server Actions

- [x] Créer les server actions dans `/src/actions/agents.ts` si besoin (listing, détail, update, etc.)
- [x] Utiliser Prisma avec les types `BaseAgent`, `FullAgent` (`/src/types/organization.ts`)
- [x] Gérer la validation et les droits d'accès côté serveur

## 5. Internationalisation

- [x] Ajouter les clés de traduction dans `/src/i18n/messages/fr/agent.ts` et `/src/i18n/messages/fr/index.ts`
- [ ] Utiliser le hook `useTranslations` dans les composants UI

## 6. UI/UX Mobile-first

- [x] S'assurer que le listing et la fiche agent sont optimisés pour mobile (table responsive, navigation claire)
- [x] Utiliser les composants Radix/Shadcn et respecter la charte graphique
- [ ] Prévoir des tests d'accessibilité (a11y)

## 7. Documentation & Tests

- [ ] Documenter les props et variations des nouveaux composants si besoin
- [ ] Ajouter des tests unitaires/fonctionnels pour les server actions et guards
- [ ] Mettre à jour `.tree.md` et vérifier l'ajout au git

---

**Priorité mobile :**

- Listing et fiche agent doivent être utilisables et lisibles sur mobile (scroll horizontal, actions accessibles)
- Les stats et actions principales doivent être visibles sans scroll excessif

**Composants à créer/modifier :**

- [x] `src/app/(authenticated)/dashboard/agents/page.tsx` (listing)
- [x] `src/app/(authenticated)/dashboard/agents/[id]/page.tsx` (détail)
- [x] Server actions dans `src/actions/agents.ts` si besoin
- [x] Ajout de traductions dans `src/i18n/messages/fr/agent.ts`
- [x] Ajout de la route pour les détails dans `src/schemas/routes.ts`
