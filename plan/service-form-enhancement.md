# Plan d'implémentation: Amélioration du formulaire de création de services

## Contexte

Actuellement, le formulaire de création de services (`NewServiceForm`) permet aux utilisateurs de remplir les informations de base d'un service consulaire. Notre objectif est d'améliorer cette expérience en:

1. Permettant à l'utilisateur de choisir d'abord une catégorie de service
2. Chargeant ensuite un formulaire spécifique à cette catégorie
3. Gardant le `NewServiceForm` actuel comme formulaire de base

## 1. Structure des composants

- [x] Créer un composant wrapper `ServiceCreationFlow` qui gèrera le flux complet
- [x] Créer un composant `ServiceCategorySelector` pour la sélection de catégorie
- [x] Modifier `NewServiceForm` pour accepter une catégorie pré-sélectionnée
- [x] Préparer la structure pour les futurs formulaires spécifiques aux catégories

## 2. Interface de sélection de catégorie

- [x] Concevoir une interface utilisateur attrayante pour le `ServiceCategorySelector`
- [x] Implémenter des cartes ou boutons pour chaque catégorie de service avec icônes
- [x] Ajouter des descriptions concises pour chaque catégorie
- [x] Optimiser l'affichage pour les appareils mobiles (grille responsive)
- [x] Ajouter des animations subtiles pour améliorer l'expérience utilisateur

## 3. Flux de navigation et état

- [x] Implémenter une machine à états pour gérer le flux de création
- [x] Créer des fonctions de transition entre les étapes (sélection → formulaire)
- [x] Mettre en place une barre de progression pour indiquer l'étape actuelle
- [x] Implémenter la navigation entre les étapes (retour, suivant, annuler)
- [x] Sauvegarder l'état entre les étapes en cas de retour en arrière

## 4. Formulaire de base amélioré

- [x] Adapter `NewServiceForm` pour recevoir une catégorie pré-sélectionnée
- [x] Masquer le sélecteur de catégorie quand c'est pré-sélectionné
- [x] Ajouter une validation conditionnelle selon la catégorie
- [x] Optimiser l'affichage du formulaire sur mobile
- [x] Améliorer les messages d'erreur et de validation

## 5. Structure pour formulaires spécifiques aux catégories

- [x] Créer une structure de base pour les formulaires spécifiques par catégorie
- [x] Implémenter un système de routage des catégories vers les bons formulaires
- [x] Définir une interface commune pour tous les formulaires de service
- [x] Préparer le mécanisme de partage des données entre les formulaires

## 6. Intégration UI/UX et optimisations mobiles

- [x] Concevoir une expérience fluide et cohérente sur mobile
- [x] Implémenter des contrôles tactiles optimisés pour la sélection
- [x] Optimiser les formulaires pour l'affichage sur petit écran
- [x] Ajouter des fonctionnalités de swipe pour naviguer entre les étapes (si pertinent)
- [x] S'assurer que tous les éléments sont suffisamment grands pour une interaction tactile

## 7. Tests et finalisation

- [x] Tester le flux complet sur différents appareils et résolutions
- [x] Vérifier l'accessibilité de l'interface
- [x] Optimiser les performances, notamment les animations sur mobile
- [x] Documenter l'implémentation pour les futurs formulaires spécifiques
- [x] Préparer des instructions pour la création de nouveaux formulaires par catégorie
