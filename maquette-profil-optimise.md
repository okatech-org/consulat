# Maquette Détaillée - Page de Profil Utilisateur Optimisée

## 🎨 Vue d'Ensemble de l'Interface

### Layout Principal (Desktop)
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Header Application (Breadcrumb, Notifications, User Menu)                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ HEADER PROFIL OPTIMISÉ                                      Actions Rapides │   │
│  │ ┌─────────┐  Jean Dupont                                   [Edit] [Share]   │   │
│  │ │ Avatar  │  Statut: Validé ✓                              [Settings]      │   │
│  │ │ 80x80px │  Complétude: ████████░░ 80%                                    │   │
│  │ └─────────┘  Dernière mise à jour: il y a 2 jours                          │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ NAVIGATION SECTIONS                                                         │   │
│  │ [Essentiel] [Contact] [Famille] [Professionnel] [Documents] [Confidentialité]│   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌────────────────────────────────────────────┐ ┌─────────────────────────────────┐ │
│  │ CONTENU PRINCIPAL                          │ │ PANNEAU LATERAL                 │ │
│  │                                            │ │                                 │ │
│  │ ┌─────────────────────────────────────────┐│ │ ┌─────────────────────────────┐ │ │
│  │ │ Informations de Base                    ││ │ │ Actions Rapides             │ │ │
│  │ │ ┌─────────────────────────────────────┐ ││ │ │ • Télécharger profil       │ │ │
│  │ │ │ Nom: Jean Dupont          [Edit]   │ ││ │ │ • Imprimer                 │ │ │
│  │ │ │ Email: jean@example.com   [Edit]   │ ││ │ │ • Exporter PDF             │ │ │
│  │ │ │ Téléphone: +33 6 12 34 56 [Edit]   │ ││ │ │ • Créer QR Code           │ │ │
│  │ │ │ Date de naissance: 01/01/1990      │ ││ │ └─────────────────────────────┘ │ │
│  │ │ └─────────────────────────────────────┘ ││ │                                 │ │
│  │ └─────────────────────────────────────────┘│ │ ┌─────────────────────────────┐ │ │
│  │                                            │ │ │ Aide et Support            │ │ │
│  │ ┌─────────────────────────────────────────┐│ │ │ • Guide d'utilisation      │ │ │
│  │ │ Documents                               ││ │ │ • FAQ                      │ │ │
│  │ │ ✓ Passeport (valide)                   ││ │ │ • Contacter le support     │ │ │
│  │ │ ✓ Acte de naissance                    ││ │ │ • Signaler un problème     │ │ │
│  │ │ ⚠ Permis de séjour (expire bientôt)   ││ │ └─────────────────────────────┘ │ │
│  │ │ ✗ Justificatif de domicile (manquant) ││ │                                 │ │
│  │ └─────────────────────────────────────────┘│ │ ┌─────────────────────────────┐ │ │
│  │                                            │ │ │ Activité Récente           │ │ │
│  │ [Ajouter une section]                     │ │ │ • Profil modifié (2j)      │ │ │
│  │                                            │ │ │ • Document validé (1sem)   │ │ │
│  └────────────────────────────────────────────┘ │ │ • Rendez-vous pris (2sem)  │ │ │
│                                                  │ └─────────────────────────────┘ │ │
│                                                  └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Footer (Liens utiles, Mentions légales, Support)                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Layout Mobile Optimisé
```
┌─────────────────────────────────────────┐
│ ← Profil          [Edit] [•••]         │ Header Sticky
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ ┌─────────┐  Jean Dupont           │ │
│  │ │ Avatar  │  ✓ Validé              │ │
│  │ │ 60x60px │  ████████░░ 80%        │ │
│  │ └─────────┘  Mis à jour il y a 2j  │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ ← Essentiel → Contact → Famille     │ │ Navigation par Swipe
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Informations de Base                │ │
│  │                                     │ │
│  │ Nom: Jean Dupont          [Edit]   │ │
│  │ Email: jean@example.com   [Edit]   │ │
│  │ Téléphone: +33 6 12 34 56 [Edit]   │ │
│  │ Date de naissance: 01/01/1990      │ │
│  │                                     │ │
│  │ [Ajouter une information]          │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Actions Rapides                     │ │
│  │ [📄 Télécharger] [🔗 Partager]    │ │
│  │ [📋 Exporter] [⚙️ Paramètres]      │ │
│  └─────────────────────────────────────┘ │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ [🏠] [👤] [📋] [📅] [💬] [•••]        │ Bottom Navigation
└─────────────────────────────────────────┘
```

## 🎯 Justifications UX/UI

### 1. Header Profil Optimisé

#### Problème Résolu
- Information dispersée et actions difficiles à trouver
- Statut de complétion peu visible
- Pas de feedback visuel sur l'état du profil

#### Solution Proposée
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER PROFIL OPTIMISÉ                                      Actions Rapides      │
│ ┌─────────┐  Jean Dupont                                   [Edit] [Share]        │
│ │ Avatar  │  Statut: Validé ✓                              [Settings]           │
│ │ 80x80px │  Complétude: ████████░░ 80%                                         │
│ │ Cliquable│  Dernière mise à jour: il y a 2 jours                             │
│ └─────────┘  📍 Paris, France                                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### Justifications
- **Avatar cliquable** : Permet de changer la photo facilement
- **Statut visuel** : Badge coloré pour identifier rapidement l'état
- **Barre de progression** : Gamification pour encourager la complétion
- **Actions groupées** : Boutons d'action principaux toujours visibles
- **Informations contextuelles** : Dernière mise à jour pour la confiance

### 2. Édition In-Place

#### Problème Résolu
- Processus d'édition long et fastidieux
- Pas de feedback immédiat sur les modifications
- Risque de perte de données

#### Solution Proposée
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Nom: [Jean Dupont________________] ✓ Sauvegardé automatiquement                     │
│ Email: jean@example.com [Edit] ⚠ Format invalide                                  │
│ Téléphone: +33 6 12 34 56 78 [Edit] ⚠ Numéro déjà utilisé                       │
│ Date de naissance: 01/01/1990 [Edit] ✓ Valide                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### Justifications
- **Édition contextuelle** : Modification directe sans quitter la page
- **Validation temps réel** : Feedback immédiat sur la validité
- **Sauvegarde automatique** : Évite la perte de données
- **États visuels clairs** : Icônes et couleurs pour indiquer le statut

### 3. Navigation Mobile Optimisée

#### Problème Résolu
- Navigation par tabs peu intuitive sur mobile
- Sections trop nombreuses pour l'écran
- Pas de gestes tactiles naturels

#### Solution Proposée
```
┌─────────────────────────────────────────┐
│ ← Essentiel → Contact → Famille         │ ← Swipe horizontal
│ ●●●○○○○ (Indicateurs de progression)    │
└─────────────────────────────────────────┘
```

#### Justifications
- **Navigation par swipe** : Geste naturel sur mobile
- **Indicateurs visuels** : Montre la progression dans les sections
- **Sections prioritaires** : Ordre logique par importance
- **Feedback tactile** : Vibration légère lors du changement

### 4. Système de Feedback Amélioré

#### Problème Résolu
- Manque de retour sur les actions utilisateur
- Messages d'erreur génériques
- Pas d'indication de progression

#### Solution Proposée
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 🎉 Profil mis à jour avec succès                                         [Fermer] │
│ ⚠️ Attention: Votre passeport expire dans 30 jours                      [Renouveler]│
│ ❌ Erreur: Le numéro de téléphone est déjà utilisé                        [Corriger]│
│ ⏳ Sauvegarde en cours...                                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### Justifications
- **Notifications contextuelles** : Messages pertinents et actionables
- **Codes couleur universels** : Vert (succès), Orange (attention), Rouge (erreur)
- **Actions suggérées** : Boutons pour résoudre les problèmes
- **Feedback temps réel** : Indication de progression pour les actions

### 5. Accessibilité Renforcée

#### Problème Résolu
- Contraste insuffisant pour certains utilisateurs
- Navigation clavier limitée
- Pas de support pour les lecteurs d'écran

#### Solution Proposée
```
/* Contraste optimisé */
:root {
  --text-primary: #1a1a1a;     /* Contraste 15:1 */
  --text-secondary: #4a4a4a;   /* Contraste 9:1 */
  --background: #ffffff;
  --border: #e5e5e5;
  --focus: #2563eb;           /* Couleur de focus visible */
}

/* Zones de touch optimisées */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 8px;
}

/* Navigation clavier */
.focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
```

#### Justifications
- **Contraste WCAG AA** : Minimum 4.5:1 pour le texte normal
- **Zones de touch 44px** : Recommandation Apple/Google
- **Focus visible** : Indication claire pour navigation clavier
- **Sémantique HTML** : Utilisation correcte des balises

### 6. Personnalisation et Confidentialité

#### Problème Résolu
- Pas de contrôle sur la visibilité des informations
- Interface unique pour tous les utilisateurs
- Manque de paramètres de confidentialité

#### Solution Proposée
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Paramètres de Confidentialité                                                     │
│                                                                                    │
│ Visibilité du profil:                                                             │
│ ○ Public (visible par tous)                                                       │
│ ● Restreint (visible par les agents consulaires)                                  │
│ ○ Privé (visible par moi uniquement)                                              │
│                                                                                    │
│ Informations visibles:                                                            │
│ ✓ Nom et prénom                                                                   │
│ ✓ Email de contact                                                                │
│ ✓ Téléphone                                                                       │
│ ✗ Adresse complète                                                                │
│ ✗ Date de naissance                                                               │
│                                                                                    │
│ Notifications:                                                                     │
│ ✓ Modifications du profil                                                         │
│ ✓ Expiration des documents                                                         │
│ ✗ Promotions et actualités                                                        │
│                                                                                    │
│ [Sauvegarder] [Annuler]                                                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### Justifications
- **Contrôle granulaire** : Choix précis de ce qui est visible
- **Niveaux de confidentialité** : Différents niveaux selon le contexte
- **Transparence** : Utilisateur informé de qui voit quoi
- **Conformité RGPD** : Respect des réglementations sur la vie privée

## 🎨 Spécifications Techniques

### Couleurs et Contrastes
```css
/* Palette principale */
:root {
  /* Couleurs de base */
  --primary: hsl(222, 84%, 5%);
  --primary-foreground: hsl(210, 40%, 98%);
  
  /* États de validation */
  --success: hsl(142, 76%, 36%);    /* Vert pour succès */
  --warning: hsl(32, 95%, 44%);     /* Orange pour attention */
  --error: hsl(0, 84%, 60%);        /* Rouge pour erreur */
  --info: hsl(207, 89%, 54%);       /* Bleu pour information */
  
  /* Surfaces */
  --background: hsl(0, 0%, 100%);
  --surface: hsl(0, 0%, 98%);
  --surface-variant: hsl(0, 0%, 96%);
  
  /* Texte avec contraste optimisé */
  --text-primary: hsl(0, 0%, 10%);    /* Contraste 15:1 */
  --text-secondary: hsl(0, 0%, 30%);  /* Contraste 9:1 */
  --text-disabled: hsl(0, 0%, 50%);   /* Contraste 4.5:1 */
  
  /* Bordures */
  --border: hsl(0, 0%, 90%);
  --border-focus: hsl(222, 84%, 5%);
}
```

### Typographie
```css
/* Échelle typographique */
:root {
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'Fira Code', 'Consolas', monospace;
  
  /* Tailles de police */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  
  /* Poids */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Hauteurs de ligne */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Espacements
```css
/* Système d'espacement cohérent */
:root {
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
}
```

### Animations et Transitions
```css
/* Transitions fluides */
:root {
  --transition-fast: 150ms ease-out;
  --transition-normal: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
  
  /* Courbes d'animation */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Animations de micro-interactions */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slide-in {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## 📱 Adaptations Mobile Spécifiques

### Breakpoints Responsifs
```css
/* Breakpoints cohérents */
:root {
  --screen-sm: 640px;
  --screen-md: 768px;
  --screen-lg: 1024px;
  --screen-xl: 1280px;
  --screen-2xl: 1536px;
}

/* Queries courantes */
@media (max-width: 768px) {
  /* Styles mobile */
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* Styles tablette */
}

@media (min-width: 1025px) {
  /* Styles desktop */
}
```

### Optimisations Tactiles
```css
/* Zones de touch optimisées */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 8px;
  margin: 4px;
  border-radius: 8px;
  transition: all var(--transition-fast);
}

.touch-target:hover {
  background-color: var(--surface-variant);
}

.touch-target:active {
  transform: scale(0.98);
  background-color: var(--surface);
}

/* Amélioration de la sélection */
.touch-target::selection {
  background-color: var(--primary);
  color: var(--primary-foreground);
}
```

## 🔧 Composants Techniques

### Hook useInlineEdit
```typescript
interface UseInlineEditProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  validation?: (value: string) => string | null;
  autoSave?: boolean;
  debounceMs?: number;
}

export function useInlineEdit({
  initialValue,
  onSave,
  validation,
  autoSave = true,
  debounceMs = 1000
}: UseInlineEditProps) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Logique d'édition, validation et sauvegarde
  // ...
}
```

### Composant EditableField
```typescript
interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  validation?: (value: string) => string | null;
  type?: 'text' | 'email' | 'tel' | 'date';
  multiline?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export function EditableField({
  label,
  value,
  onSave,
  validation,
  type = 'text',
  multiline = false,
  required = false,
  disabled = false
}: EditableFieldProps) {
  const {
    currentValue,
    isEditing,
    isSaving,
    error,
    startEditing,
    stopEditing,
    handleChange,
    handleSave
  } = useInlineEdit({ initialValue: value, onSave, validation });
  
  // Rendu du composant avec états visuels
  // ...
}
```

Cette maquette détaillée présente une approche complète d'optimisation UX/UI pour la page de profil utilisateur, avec des justifications claires pour chaque choix de design et des spécifications techniques précises pour l'implémentation. 