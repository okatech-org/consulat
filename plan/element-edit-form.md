# Plan: ElementEditForm

Ce plan détaille l'implémentation d'un composant `ElementEditForm` permettant d'éditer les propriétés d'un élément de la configuration PDF (structure Children/ElementType) avec gestion d'état local et bouton de sauvegarde.

## 1. Analyse et préparation

- [ ] Vérifier les types d'éléments (`Children`, `ElementType`, etc.) dans `pdf-builder.tsx`.
- [ ] Lister les propriétés éditables pour chaque type d'élément (Text, Image, Page, etc.).
- [ ] Identifier les composants UI à réutiliser (`Input`, `Textarea`, `Select`, etc.).
- [ ] Préparer les clés de traduction nécessaires dans `/src/i18n/messages/fr/index.ts`.

## 2. Création du composant `ElementEditForm`

- [ ] Créer le fichier `src/components/document-generation/element-edit-form.tsx`.
- [ ] Props :
  - `element: Children` (l'élément à éditer)
  - `onSave: (updated: Children) => void` (callback pour appliquer les changements)
  - `onCancel?: () => void` (optionnel)
- [ ] Initialiser un état local pour l'élément édité (deep clone de `element`).
- [ ] Afficher dynamiquement les champs selon le type d'élément :
  - Text: content, props.wrap, props.style.fontSize, props.style.fontFamily, etc.
  - Image: props.source, props.style.width, props.style.height
  - Page: props.size, props.orientation, props.style.paddingTop, etc.
  - View, Link, Note, Document: champs spécifiques
- [ ] Utiliser les composants UI existants pour chaque champ.
- [ ] Gérer la validation de base (ex: champs obligatoires).
- [ ] Ajouter un bouton "Sauvegarder" (et "Annuler" si besoin).
- [ ] Au clic sur "Sauvegarder", appeler `onSave` avec la nouvelle valeur locale.

## 3. Intégration et UX

- [ ] Prévoir l'intégration dans le `ConfigEditor` (ou autre parent) : ouverture du formulaire sur sélection d'un élément.
- [ ] S'assurer que le formulaire est accessible (labels, aria, etc.).
- [ ] Utiliser les hooks de traduction pour tous les labels/messages.
- [ ] Ajouter des tests manuels pour chaque type d'élément.

## 4. Améliorations futures (hors MVP)

- [ ] Éditeur de style avancé (color picker, dropdowns, etc.)
- [ ] Validation Zod pour les propriétés complexes
- [ ] Gestion des erreurs et feedback utilisateur
- [ ] Animation d'ouverture/fermeture du formulaire

---

**Prêt pour validation.**
Après validation, chaque étape sera cochée et expliquée lors de l'implémentation.
