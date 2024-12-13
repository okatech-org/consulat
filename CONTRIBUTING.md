# Guide de Contribution - Consulat.ga

## 1. Structure du Code

### Chemins des Fichiers
- Indiquer le chemin du fichier avant le bloc de code, pas à l'intérieur
- Format : `src/components/example/my-component.tsx`

### Blocs de Code
- Un bloc de code par composant/fonction
- Chaque bloc doit être autonome et facilement copiable
- Inclure les imports nécessaires dans chaque bloc

## 2. Dépendances et Complétude

### Composants
- Fournir toutes les dépendances nécessaires
- Inclure les composants utilitaires requis
- Vérifier que le composant est prêt à l'emploi sans erreurs

### Types
- Définir clairement tous les types et interfaces
- Utiliser TypeScript de manière stricte
- Documenter les types complexes

## 3. Internationalisation

### Traductions
- Utiliser des clés de traduction pour tout texte visible
- Format : `namespace.section.key`
- Maintenir une structure cohérente dans les fichiers de traduction
- Fournir les traductions en français par défaut

## 4. Processus d'Ajout de Fonctionnalités

### Ordre d'Implémentation
1. Modèles Prisma
    - Vérifier/adapter le schéma
    - Générer les migrations
    - Mettre à jour les types générés

2. Types TypeScript
    - Définir les interfaces
    - Créer les types utilitaires
    - Mettre à jour les types existants

3. Fonctions Utilitaires
    - Créer/adapter les helpers
    - Implémenter la logique métier
    - Ajouter les tests unitaires

4. Composants Utilitaires
    - Créer les composants réutilisables
    - Documenter l'usage
    - Assurer la réutilisabilité

5. Composants Principaux
    - Implémenter la logique UI
    - Gérer les états et effets
    - Assurer la responsivité

6. Pages
    - Intégrer les composants
    - Gérer la navigation
    - Optimiser les performances

## 5. Expérience Utilisateur

### Interface Mobile
- Design "Mobile First"
- Composants adaptables
- Gestes tactiles intuitifs
- Performance optimisée

### Interface Desktop
- Utilisation efficace de l'espace
- Raccourcis clavier
- Interactions riches
- Navigation fluide

### Optimisations
- Chargement progressif
- État de chargement élégant
- Gestion des erreurs utilisateur
- Feedback visuel immédiat

## 6. Bonnes Pratiques

### Performance
- Lazy loading des composants
- Optimisation des images
- Minimisation des re-renders
- Code splitting approprié

### Accessibilité
- Support ARIA
- Navigation au clavier
- Contraste suffisant
- Messages d'erreur clairs

### Sécurité
- Validation des entrées
- Protection CSRF
- Sanitization des données
- Gestion sécurisée des tokens

## 7. Documentation

### Code
- Commentaires JSDoc pour les fonctions complexes
- Types bien documentés
- Exemples d'utilisation

### Composants
- Props documentées
- Exemples d'utilisation
- Limitations connues
- Cas d'utilisation

Suivez ces directives pour maintenir un code cohérent, maintenable et de haute qualité.