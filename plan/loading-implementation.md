# Plan d'implémentation des Loading Skeletons

## Introduction

Ce plan détaille l'implémentation des composants de chargement (loading skeletons) pour toutes les routes dans les sections `@dashboard` et `@my-space` de l'application Consulat.ga, conformément à la documentation Next.js sur les interfaces de chargement et le streaming.

## Structure du projet

- `@dashboard`: Interface administrateur
- `@my-space`: Espace personnel de l'utilisateur

## 1. Préparation et configuration

- [x] Analyser les composants UI existants pour maintenir la cohérence visuelle
- [x] Créer des composants de skeleton réutilisables dans `/src/components/ui/skeleton`
- [x] Définir des patterns de skeleton pour les éléments communs (cartes, listes, tableaux)

## 2. Implémentation pour @dashboard

### 2.1 Routes principales

- [x] Route principale (`/dashboard`)

  - [x] Créer `loading.tsx` avec skeleton adapté au tableau de bord principal
  - [x] Adapter pour priorité mobile

- [ ] Layout principal (`/dashboard/layout.tsx`)
  - [ ] Vérifier si un skeleton est nécessaire pour les éléments de layout

### 2.2 Routes utilisateurs

- [x] Profiles (`/dashboard/profiles`)

  - [x] Créer `loading.tsx` avec skeleton pour la liste des profils
  - [x] Ajouter skeletons pour les cartes de profil

- [ ] Account (`/dashboard/account`)
  - [ ] Créer `loading.tsx` avec skeleton pour les informations du compte
  - [ ] Adapter les champs de formulaire en mode skeleton

### 2.3 Routes de gestion

- [x] Requests (`/dashboard/requests`)

  - [x] Créer `loading.tsx` avec skeleton pour la liste des demandes
  - [x] Skeleton pour les états et détails des demandes

- [x] Services (`/dashboard/services`)

  - [x] Créer `loading.tsx` avec skeleton adapté aux services
  - [x] Skeletons pour les cartes de service

- [ ] Appointments (`/dashboard/appointments`)
  - [ ] Créer `loading.tsx` avec skeleton pour le calendrier/liste des rendez-vous
  - [ ] Skeleton adapté à l'affichage mobile des rendez-vous

### 2.4 Routes de communication

- [ ] Notifications (`/dashboard/notifications`)

  - [ ] Créer `loading.tsx` avec skeleton pour la liste des notifications
  - [ ] Skeleton adapté aux différents types de notifications

- [ ] Feedback (`/dashboard/feedback`)
  - [ ] Créer `loading.tsx` avec skeleton pour les formulaires de feedback
  - [ ] Skeleton pour la visualisation des feedbacks reçus

### 2.5 Routes d'administration

- [ ] Settings (`/dashboard/settings`)

  - [ ] Créer `loading.tsx` avec skeleton pour les options de configuration
  - [ ] Adapter pour les différentes sections de paramètres

- [ ] Superadmin (`/dashboard/(superadmin)`)

  - [ ] Créer `loading.tsx` avec skeleton pour l'interface superadmin
  - [ ] Skeleton pour les tableaux et graphiques d'analyse

- [ ] Admin (`/dashboard/(admin)`)
  - [ ] Créer `loading.tsx` avec skeleton pour l'interface admin
  - [ ] Skeleton pour les outils d'administration

## 3. Implémentation pour @my-space

### 3.1 Routes principales

- [x] Route principale (`/my-space`)

  - [x] Créer `loading.tsx` avec skeleton adapté à la page d'accueil de l'espace utilisateur
  - [x] Optimiser pour l'expérience mobile

- [ ] Layout principal (`/my-space/layout.tsx`)
  - [ ] Vérifier si un skeleton est nécessaire pour les éléments de layout

### 3.2 Routes personnelles

- [x] Profile (`/my-space/profile`)

  - [x] Créer `loading.tsx` avec skeleton pour le profil utilisateur
  - [x] Skeleton pour les différentes sections du profil

- [ ] Account (`/my-space/account`)

  - [ ] Créer `loading.tsx` avec skeleton pour les paramètres du compte
  - [ ] Skeleton pour les formulaires de modification

- [ ] Children (`/my-space/children`)
  - [ ] Créer `loading.tsx` avec skeleton pour la liste des enfants
  - [ ] Skeleton pour les cartes d'information des enfants

### 3.3 Routes de services

- [x] Services (`/my-space/services`)

  - [x] Créer `loading.tsx` avec skeleton pour la liste des services disponibles
  - [x] Skeleton pour les détails de service

- [ ] Appointments (`/my-space/appointments`)

  - [ ] Créer `loading.tsx` avec skeleton pour les rendez-vous de l'utilisateur
  - [ ] Skeleton adapté au format mobile pour le calendrier/liste

- [ ] Documents (`/my-space/documents`)
  - [ ] Créer `loading.tsx` avec skeleton pour la bibliothèque de documents
  - [ ] Skeleton pour les vignettes et listes de documents

### 3.4 Routes de communication

- [ ] Notifications (`/my-space/notifications`)

  - [ ] Créer `loading.tsx` avec skeleton pour le centre de notifications
  - [ ] Adapter pour différents types de notifications

- [ ] Feedback (`/my-space/feedback`)
  - [ ] Créer `loading.tsx` avec skeleton pour les formulaires de feedback
  - [ ] Skeleton pour l'historique des feedbacks envoyés

## 4. Optimisations et tests

- [ ] Tester les skeletons sur différentes tailles d'écran
- [ ] Vérifier la fluidité des transitions skeleton → contenu
- [ ] Optimiser les performances des skeletons (éviter les animations lourdes)
- [ ] Assurer la cohérence visuelle entre les différents skeletons

## 5. Documentation

- [ ] Documenter les composants skeleton créés
- [ ] Mettre à jour la documentation des routes avec les informations sur le loading
- [ ] Créer des exemples d'utilisation pour les futurs développeurs

## Approche de développement

- Prioriser les routes les plus fréquemment utilisées
- Adapter les skeletons à la structure spécifique de chaque page
- Utiliser des composants de skeleton réutilisables
- S'assurer que chaque skeleton reflète fidèlement la structure de la page chargée
- Optimiser l'expérience mobile en premier lieu
