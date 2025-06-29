# Plan de correction des problèmes de connexion

## Vue d'ensemble

La page de connexion présente plusieurs problèmes critiques :

1. Absence de messages d'erreur lors de la saisie d'un code OTP incorrect
2. La redirection automatique vers l'espace utilisateur ne fonctionne pas
3. Potentiels autres problèmes à identifier et corriger

## Analyse des problèmes identifiés

### 1. Messages d'erreur OTP manquants

- [x] Vérifier la gestion des erreurs dans `validateOTP`
- [x] S'assurer que les erreurs sont correctement propagées et affichées
- [x] Vérifier que les traductions d'erreur sont utilisées

### 2. Redirection automatique défaillante

- [x] Analyser le flux de redirection après validation OTP réussie
- [x] Vérifier la logique de `handleManualRedirect`
- [x] S'assurer que l'état utilisateur est correctement mis à jour après connexion
- [x] Vérifier les permissions et rôles pour la redirection

### 3. Autres problèmes potentiels

- [ ] Vérifier la gestion du cooldown pour le renvoi d'OTP
- [ ] S'assurer que les états de chargement sont correctement gérés
- [ ] Vérifier la persistance de session après connexion

## Plan d'implémentation

### Phase 1 : Correction des messages d'erreur OTP

- [x] Améliorer la gestion des erreurs dans `validateOTP`
- [x] Ajouter des messages d'erreur spécifiques selon le type d'erreur
- [x] S'assurer que les erreurs sont affichées dans le formulaire
- [x] Ajouter les traductions manquantes pour les erreurs

### Phase 2 : Correction de la redirection automatique

- [x] Revoir la logique de redirection après succès OTP
- [x] Implémenter une redirection automatique après validation réussie
- [x] Gérer les différents cas de redirection selon les rôles
- [x] Ajouter un délai approprié pour éviter les conditions de course

### Phase 3 : Améliorations générales

- [x] Améliorer les retours visuels (états de chargement, succès, erreur)
- [ ] Optimiser la gestion du state pour éviter les re-rendus inutiles
- [x] Ajouter des logs pour faciliter le débogage
- [ ] Vérifier la compatibilité mobile

### Phase 4 : Tests et validation

- [ ] Tester tous les scénarios de connexion (email/téléphone)
- [ ] Vérifier les redirections pour chaque rôle utilisateur
- [ ] Valider l'affichage des messages d'erreur
- [ ] S'assurer que le cooldown de renvoi fonctionne correctement

## Changements effectués

### 1. Gestion des erreurs améliorée

- Ajout de messages d'erreur spécifiques pour les codes OTP invalides/expirés
- Utilisation des traductions pour tous les messages d'erreur
- Affichage d'un toast ET d'une ErrorCard pour une meilleure visibilité

### 2. Redirection automatique corrigée

- Utilisation de `useCurrentSession` avec `refetch` pour s'assurer que la session est à jour
- Implémentation d'une redirection automatique après 1.5 secondes
- Utilisation de `router.push` au lieu de `window.location` pour une navigation plus fiable
- Gestion du cas où l'utilisateur n'est pas encore dans le state

### 3. Améliorations de l'UX

- Ajout d'un état de succès avec animation visuelle
- Bouton de redirection manuelle en cas de problème avec l'auto-redirection
- Messages clairs indiquant la redirection en cours

## Notes techniques

- Utiliser le composant `ErrorCard` existant pour afficher les erreurs
- S'assurer que toutes les chaînes sont traduites via `useTranslations`
- Respecter les patterns existants pour la gestion des états
- Utiliser `tryCatch` pour une gestion cohérente des erreurs
