# Plan d'implémentation : Ajout d'un éditeur de style dynamique pour les éléments PDF

## 1. Analyse et préparation

- [ ] Lister les propriétés de style supportées par react-pdf (voir doc officielle)
- [ ] Définir la structure des propriétés (label, type d'input, valeurs possibles, etc.)
- [ ] Préparer les clés de traduction pour chaque propriété (inputs.pdfEditor.style.\*)

## 2. Création du composant StyleEditor

- [ ] Créer `/src/components/document-generation/style-editor.tsx`
- [ ] Multi-select des propriétés de style (inspiré de MultiSelectCountries)
- [ ] Affichage dynamique des champs d'édition selon le type de propriété
- [ ] Gestion de l'ajout/retrait de propriété (badges closables ou bouton)
- [ ] Callback `onChange` pour synchroniser le style avec le parent
- [ ] Responsive : interface compacte et fluide sur mobile (inputs empilés, multi-select accessible)

## 3. Intégration dans ElementEditForm

- [ ] Ajouter le composant StyleEditor sous chaque bloc de style (Text, View, Image, etc.)
- [ ] Pré-sélectionner les propriétés déjà présentes dans `props.style`
- [ ] Synchroniser les modifications avec `updateProp(['props', 'style'], ...)`
- [ ] Tester l'ajout, la modification et la suppression de propriétés

## 4. UX/UI & accessibilité

- [ ] Labels clairs et traduits pour chaque propriété
- [ ] Inputs adaptés (number, color, select, etc.)
- [ ] Affichage des badges de propriétés sélectionnées (retirables)
- [ ] Mobile : navigation et édition facile (touch, focus, etc.)

## 5. Documentation & tests

- [ ] Ajouter une documentation d'usage dans le composant
- [ ] Vérifier la cohérence avec les autres UI (shadcn/radix)
- [ ] (Optionnel) Ajouter des tests unitaires pour StyleEditor

---

**Priorité mobile :**

- Inputs empilés, multi-select accessible, badges cliquables facilement
- Largeur 100% sur mobile, responsive sur desktop

**Composants à créer/modifier :**

- `/src/components/document-generation/style-editor.tsx` (Nouveau)
- `/src/components/document-generation/element-edit-form.tsx` (À modifier)
- `/src/i18n/messages/fr/inputs.ts` (À compléter pour les labels)

---

_Après validation du plan, débuter par la création du composant StyleEditor._
