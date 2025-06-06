# Plan de correction pour AgentDetailPage et AgentForm

## Problèmes identifiés

### AgentDetailPage

- [ ] Types incorrects pour `managedAgents` - manque `linkedCountries` et `assignedRequests`
- [ ] Gestion des filtres de table non conforme au pattern des autres pages
- [ ] Composants de table trop complexes dans le même fichier
- [ ] Types de sorting incompatibles avec DataTable

### AgentForm

- [x] Formulaire incomplet pour le rôle MANAGER
- [x] Manque d'affichage du manager assigné pour les agents
- [x] Interface utilisateur peu claire pour les différents rôles

## Solutions à implémenter

### 1. Correction des types AgentDetails

- [ ] Mettre à jour `AgentDetailsSelect` dans `/src/actions/agents.ts`
- [ ] Ajouter les champs manquants pour `managedAgents`
- [ ] Assurer la cohérence des types

### 2. Refactorisation AgentDetailPage

- [ ] Créer des composants séparés pour les tables
- [ ] Simplifier la gestion des filtres
- [ ] Corriger les types de sorting
- [ ] Suivre le pattern des autres pages (requests, agents-table)

### 3. Amélioration AgentForm

- [x] Interface en sections avec Cards
- [x] Gestion conditionnelle des champs selon le rôle
- [x] Affichage du manager actuel en mode édition
- [x] Sélection d'agents pour les managers

### 4. Tests et validation

- [ ] Vérifier que les types sont corrects
- [ ] Tester la création/édition d'agents
- [ ] Tester la gestion des managers et agents
- [ ] Valider l'affichage des tables

## Priorités

1. **Haute** : Correction des types dans actions/agents.ts
2. **Haute** : Simplification AgentDetailPage
3. **Moyenne** : Optimisation des composants de table
4. **Basse** : Améliorations UX supplémentaires
