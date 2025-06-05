# Plan de synchronisation des agents avec les services

## Objectif

Synchroniser le tableau `users-table.tsx` et le formulaire `CreateAgentButton.tsx` pour utiliser les services réels au lieu des spécialisations (catégories de services) dans la gestion des agents.

## Étapes réalisées

### [x] 1. Mise à jour du type BaseAgent

- ✅ Ajout de `assignedServices` dans `BaseAgentInclude` (`src/types/organization.ts`)
- ✅ Inclusion des champs `id`, `name`, et `category` pour les services assignés

### [x] 2. Modification du schéma Zod

- ✅ Remplacement de `serviceCategories` par `serviceIds` dans `AgentSchema` (`src/schemas/user.ts`)
- ✅ Validation pour s'assurer qu'au moins un service est sélectionné

### [x] 3. Mise à jour du tableau des agents

- ✅ Modification de `users-table.tsx` pour afficher `assignedServices` au lieu de `specializations`
- ✅ Utilisation du nom du service au lieu de la catégorie traduite
- ✅ Suppression temporaire des filtres pour éviter les erreurs de type

### [x] 4. Mise à jour du formulaire AgentForm

- ✅ Remplacement du champ `serviceCategories` par `serviceIds`
- ✅ Utilisation d'un `MultiSelect<string>` pour les IDs de services
- ✅ Ajout des services en tant que props du composant

### [x] 5. Mise à jour de l'action createNewAgent

- ✅ Modification pour connecter les services assignés au lieu des spécialisations
- ✅ Utilisation de `assignedServices.connect` dans la création Prisma

### [x] 6. Mise à jour du CreateAgentButton

- ✅ Ajout de la récupération des services via `getServicesForOrganization`
- ✅ Passage des services au composant `AgentForm`
- ✅ Gestion du chargement asynchrone des services

## Étapes restantes

### [ ] 7. Correction de l'erreur de type dans settings-tabs

- [ ] Résoudre l'erreur de type `linkedCountries` manquant dans les données des agents
- [ ] S'assurer que les données passées correspondent au type `BaseAgent`

### [ ] 8. Ajout des traductions manquantes

- [ ] Ajouter la traduction pour "Services" dans les fichiers de traduction
- [ ] Mettre à jour les clés de traduction pour le tableau des agents

### [ ] 9. Restauration des filtres

- [ ] Réimplémenter les filtres pour le tableau des agents
- [ ] Ajouter un filtre par services assignés
- [ ] Maintenir le filtre par pays

### [ ] 10. Tests et validation

- [ ] Tester la création d'un nouvel agent avec des services
- [ ] Vérifier l'affichage correct dans le tableau
- [ ] S'assurer que les données sont cohérentes entre `/agents` et les paramètres d'organisation

## Notes techniques

### Différences identifiées

1. **Page `/agents`** : utilise `AgentListItem` avec `assignedServices` (services réels)
2. **Tableau des organisations** : utilise `BaseAgent` avec `assignedServices` (après modification)
3. **Formulaire** : utilise maintenant `serviceIds` (IDs de services)

### Avantages de cette approche

- ✅ Cohérence entre les différentes vues des agents
- ✅ Utilisation des services réels au lieu des catégories génériques
- ✅ Meilleure granularité dans l'assignation des agents
- ✅ Alignement avec la logique métier existante

### Points d'attention

- ⚠️ S'assurer que tous les agents existants ont des services assignés
- ⚠️ Maintenir la compatibilité avec les permissions basées sur les spécialisations
- ⚠️ Vérifier l'impact sur l'assignation automatique des demandes

## Prochaines étapes

1. Corriger l'erreur de type dans `settings-tabs.tsx`
2. Ajouter les traductions manquantes
3. Restaurer et améliorer les filtres du tableau
4. Effectuer des tests complets de bout en bout
