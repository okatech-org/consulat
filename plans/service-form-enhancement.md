# Plan d'implémentation: Amélioration du formulaire de création de services

## Contexte

Actuellement, le formulaire de création de services (`NewServiceForm`) permet aux utilisateurs de remplir les informations de base d'un service consulaire. Notre objectif est d'améliorer cette expérience en:

1. Permettant à l'utilisateur de choisir d'abord une catégorie de service
2. Chargeant ensuite un formulaire spécifique à cette catégorie
3. Gardant le `NewServiceForm` actuel comme formulaire de base

## 1. Structure des composants

- [ ] Créer un composant wrapper `ServiceCreationFlow` qui gèrera le flux complet
- [ ] Créer un composant `ServiceCategorySelector` pour la sélection de catégorie
- [ ] Modifier `NewServiceForm` pour accepter une catégorie pré-sélectionnée
- [ ] Préparer la structure pour les futurs formulaires spécifiques aux catégories

## 2. Interface de sélection de catégorie

- [ ] Concevoir une interface utilisateur attrayante pour le `ServiceCategorySelector`
- [ ] Implémenter des cartes ou boutons pour chaque catégorie de service avec icônes
- [ ] Ajouter des descriptions concises pour chaque catégorie
- [ ] Optimiser l'affichage pour les appareils mobiles (grille responsive)
- [ ] Ajouter des animations subtiles pour améliorer l'expérience utilisateur

## 3. Flux de navigation et état

- [ ] Implémenter une machine à états pour gérer le flux de création
- [ ] Créer des fonctions de transition entre les étapes (sélection → formulaire)
- [ ] Mettre en place une barre de progression pour indiquer l'étape actuelle
- [ ] Implémenter la navigation entre les étapes (retour, suivant, annuler)
- [ ] Sauvegarder l'état entre les étapes en cas de retour en arrière

## 4. Formulaire de base amélioré

- [ ] Adapter `NewServiceForm` pour recevoir une catégorie pré-sélectionnée
- [ ] Masquer le sélecteur de catégorie quand c'est pré-sélectionné
- [ ] Ajouter une validation conditionnelle selon la catégorie
- [ ] Optimiser l'affichage du formulaire sur mobile
- [ ] Améliorer les messages d'erreur et de validation

## 5. Structure pour formulaires spécifiques aux catégories

- [ ] Créer une structure de base pour les formulaires spécifiques par catégorie
- [ ] Implémenter un système de routage des catégories vers les bons formulaires
- [ ] Définir une interface commune pour tous les formulaires de service
- [ ] Préparer le mécanisme de partage des données entre les formulaires

## 6. Intégration UI/UX et optimisations mobiles

- [ ] Concevoir une expérience fluide et cohérente sur mobile
- [ ] Implémenter des contrôles tactiles optimisés pour la sélection
- [ ] Optimiser les formulaires pour l'affichage sur petit écran
- [ ] Ajouter des fonctionnalités de swipe pour naviguer entre les étapes (si pertinent)
- [ ] S'assurer que tous les éléments sont suffisamment grands pour une interaction tactile

## 7. Tests et finalisation

- [ ] Tester le flux complet sur différents appareils et résolutions
- [ ] Vérifier l'accessibilité de l'interface
- [ ] Optimiser les performances, notamment les animations sur mobile
- [ ] Documenter l'implémentation pour les futurs formulaires spécifiques
- [ ] Préparer des instructions pour la création de nouveaux formulaires par catégorie
