# Checklist de Migration du Composant Button

## État de la Migration
- **Total**: 39/120+ fichiers migrés
- **Progression**: ~33%
- **Composants UI**: 15/21 migrés
- **Data Table**: 6/10 migrés  
- **Services**: 2/3 migrés
- **Organization**: 6/15 migrés
- **Appointments**: 3/6 migrés
- **Profile**: 1/5 migrés
- **Registration**: 4/10 migrés

## Nouveau Composant Button - Changements Principaux

### Changements dans l'API:
- **Icons**: Utilisation de `leftIcon` et `rightIcon` au lieu d'inclure les icônes dans le children
- **Loading**: Propriété `loading` qui affiche automatiquement un spinner et désactive le bouton
- **Nouvelles variantes**: `success`, `warning`, `error`, `destructiveOutline`
- **Nouvelles tailles**: `xl`, `icon-sm`, `icon-lg`, `mobile`, `mobile-full`
- **Nouvelles propriétés**: `weight`, `responsive`, `fullWidthOnMobile`

## Fichiers à Migrer

### Composants UI (Priority: High)
- [x] `src/components/ui/darkmode-toggle.tsx` ✅ Migré - Icônes déplacées vers leftIcon
- [x] `src/components/ui/page.tsx` ✅ Migré - Suppression des classes gap-2 redondantes (buttonVariants utilise déjà gap-2)
- [x] `src/components/ui/cta-contact.tsx` ✅ Déjà conforme - Utilise buttonVariants avec Link (pas Button)
- [x] `src/components/ui/mode-toggle.tsx` ✅ Migré - Icônes déplacées vers leftIcon
- [x] `src/components/ui/feedback-form.tsx` ✅ Migré - Pattern loading remplacé par prop loading
- [x] `src/components/ui/multi-select.tsx` ✅ Migré - Icône déplacée vers rightIcon
- [ ] `src/components/ui/sidebar.tsx`
- [x] `src/components/ui/tags-input.tsx` ✅ Déjà conforme - Utilise un bouton simple sans icône
- [x] `src/components/ui/document-upload.tsx` ✅ Migré - Icône déplacée vers leftIcon, size="icon-sm"
- [x] `src/components/ui/confirmation-dialog.tsx` ✅ Migré - Pattern loading remplacé par prop loading
- [x] `src/components/ui/country-select.tsx` ✅ Migré - Icône déplacée vers rightIcon
- [x] `src/components/ui/document-preview.tsx` ✅ Migré - Icônes déplacées vers leftIcon, size="icon-sm"
- [x] `src/components/ui/image-cropper.tsx` ✅ Déjà conforme - Boutons simples sans icônes
- [x] `src/components/ui/logout-button.tsx` ✅ Déjà migré - Utilise déjà leftIcon
- [ ] `src/components/ui/listing-skeleton.tsx`
- [ ] `src/components/ui/dynamic-fields.tsx`
- [x] `src/components/ui/feedback-button.tsx` ✅ Migré - Icône déplacée vers leftIcon
- [ ] `src/components/ui/multi-select-countries.tsx`
- [ ] `src/components/ui/nav-main.tsx`
- [x] `src/components/ui/date-picker.tsx` ✅ Migré - Icône déplacée vers leftIcon
- [ ] `src/components/ui/file-input.tsx`

### Data Table Components (Priority: High)
- [ ] `src/components/data-table/data-table-density.tsx`
- [ ] `src/components/data-table/data-table-view-options.tsx`
- [x] `src/components/data-table/data-table-pagination.tsx` ✅ Migré - Icônes déplacées vers leftIcon
- [ ] `src/components/data-table/data-table-bulk-actions.tsx`
- [ ] `src/components/data-table/data-table-export.tsx`
- [x] `src/components/data-table/data-table-column-header.tsx` ✅ Migré - Icône déplacée vers rightIcon
- [ ] `src/components/data-table/data-table-toolbar.tsx`
- [x] `src/components/data-table/data-table-row-actions.tsx` ✅ Migré - Icône déplacée vers leftIcon
- [x] `src/components/data-table/data-table-faceted-filter.tsx` ✅ Migré - Icône déplacée vers children
- [x] `src/components/data-table.tsx` ✅ Déjà conforme - Utilise des sous-composants déjà migrés

### Authentication Components (Priority: High)
- [x] `src/components/auth/login-form.tsx` ✅ Déjà migré - Utilise déjà les nouvelles props

### Services Components (Priority: Medium)
- [ ] `src/components/services/service-error-card.tsx`
- [x] `src/components/services/dynamic-form.tsx` ✅ Migré - Icônes déplacées vers leftIcon/rightIcon, loading prop
- [x] `src/components/services/service-document-section.tsx` ✅ Migré - Icônes déplacées vers leftIcon/rightIcon, loading prop

### Document Components (Priority: Medium)
- [ ] `src/components/documents/document-card.tsx`
- [ ] `src/components/documents/metadata-form.tsx`
- [ ] `src/components/documents/user-document.tsx`

### Document Generation Components (Priority: Medium)
- [x] `src/components/document-generation/forms.tsx` ✅ Migré - Pattern loading remplacé par prop loading
- [ ] `src/components/document-generation/document-template-card.tsx`
- [ ] `src/components/document-generation/element-edit-form.tsx`
- [ ] `src/components/document-generation/style-editor.tsx`
- [ ] `src/components/document-generation/generate-document-settings-form.tsx`

### Notification Components (Priority: Medium)
- [ ] `src/components/notifications/notifications-menu.tsx`
- [ ] `src/components/notifications/notification-item.tsx`
- [ ] `src/components/notifications/notifications-listing.tsx`

### Dashboard Components (Priority: Medium)
- [ ] `src/components/dashboards/admin-dashboard.tsx`
- [ ] `src/components/dashboards/manager-dashboard.tsx`
- [ ] `src/components/dashboards/agent-dashboard.tsx`

### Profile Components (Priority: Medium)
- [x] `src/components/profile/documents.tsx` ✅ Migré - Icône déplacée vers leftIcon
- [ ] `src/components/profile/document-validation-dialog.tsx`
- [ ] `src/components/profile/profile-review.tsx`
- [ ] `src/components/profile/profile-card.tsx`
- [ ] `src/components/profile/child-profile-review.tsx`

### Layout Components (Priority: Medium)
- [ ] `src/components/layouts/user-space-navigation.tsx`
- [ ] `src/components/layouts/theme-toggle-single.tsx`
- [ ] `src/components/layouts/language-switcher-single.tsx`

### Request Components (Priority: Medium)
- [ ] `src/components/requests/request-validation-dialog.tsx`
- [ ] `src/components/requests/review-notes.tsx`

### User Components (Priority: Medium)
- [ ] `src/components/user/profile-status-card.tsx`
- [ ] `src/components/user/requests-timeline.tsx`

### Organization Components (Priority: Medium)
- [ ] `src/components/organization/transcript-service-form.tsx`
- [ ] `src/components/organization/organization-actions.tsx`
- [ ] `src/components/organization/day-schedule.tsx`
- [ ] `src/components/organization/agents-table-with-filters.tsx`
- [x] `src/components/organization/edit-agent-dialog.tsx` ✅ Migré - Pattern loading remplacé par prop loading
- [x] `src/components/organization/organization-form.tsx` ✅ Migré - Pattern loading remplacé par prop loading
- [x] `src/components/organization/create-service-button.tsx` ✅ Migré - Icône déplacée vers leftIcon
- [ ] `src/components/organization/service-actions.tsx`
- [x] `src/components/organization/agent-form.tsx` ✅ Migré - Pattern loading remplacé par prop loading
- [ ] `src/components/organization/service-edit-form.tsx`
- [ ] `src/components/organization/create-organization-button.tsx`
- [x] `src/components/organization/create-agent-button.tsx` ✅ Migré - Icône déplacée vers leftIcon
- [ ] `src/components/organization/new-service-form.tsx`
- [ ] `src/components/organization/dynamic-fields-editor.tsx`
- [ ] `src/components/organization/organization-settings.tsx`

### Registration Components (Priority: Medium)
- [ ] `src/components/registration/child-registration-form.tsx`
- [x] `src/components/registration/navigation.tsx` ✅ Migré - Icône déplacée vers leftIcon
- [ ] `src/components/registration/child-review-form.tsx`
- [x] `src/components/registration/document-upload-section.tsx` ✅ Migré - Pattern loading remplacé par prop loading, icône déplacée vers leftIcon
- [x] `src/components/registration/review.tsx` ✅ Déjà conforme - Utilise leftIcon et size="mobile"
- [x] `src/components/registration/child-family-info-form.tsx` ✅ Déjà conforme - Utilise size="mobile" et weight="medium"
- [ ] `src/components/registration/new-profile-form.tsx`
- [x] `src/components/registration/registration-form.tsx` ✅ Migré - Icônes déplacées vers leftIcon/rightIcon, loading prop

### Appointment Components (Priority: Medium)
- [ ] `src/components/appointments/appointments-header.tsx`
- [x] `src/components/appointments/agent-appointment-card.tsx` ✅ Déjà conforme - Utilise leftIcon et loading
- [ ] `src/components/appointments/reschedule-appointment-form.tsx`
- [ ] `src/components/appointments/appointment-actions.tsx`
- [x] `src/components/appointments/appointment-card.tsx` ✅ Déjà conforme - Utilise size="mobile"
- [x] `src/components/appointments/new-appointment-form.tsx` ✅ Migré - Icônes déplacées vers leftIcon/rightIcon

### Chat Components (Priority: Low)
- [ ] `src/components/chat/modern-chat-window.tsx`

### Public Components (Priority: Low)
- [ ] `src/components/public/header-links.tsx`

### Pages (Priority: Medium)
- [ ] `src/app/(public)/page.tsx`
- [ ] `src/app/(public)/feedback/page.tsx`
- [ ] `src/app/(public)/listing/profiles/_components/profile-contact-form.tsx`

### Hooks (Priority: Low)
- [ ] `src/hooks/use-service-review.tsx`

### Email Components (Priority: Low)
- [ ] `src/lib/services/notifications/providers/emails/components/NotificationEmail.tsx`
- [ ] `src/lib/services/notifications/providers/emails/components/AgentWelcomeEmail.tsx`
- [ ] `src/lib/services/notifications/providers/emails/components/AdminWelcomeEmail.tsx`

## Patterns de Migration Communs

### 1. Boutons avec icônes
**Avant:**
```tsx
<Button>
  <Icon />
  Text
</Button>
```

**Après:**
```tsx
<Button leftIcon={<Icon />}>
  Text
</Button>
```

### 2. Boutons de chargement
**Avant:**
```tsx
<Button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Text'}
</Button>
```

**Après:**
```tsx
<Button loading={isLoading}>
  Text
</Button>
```

### 3. Boutons avec variantes spéciales
**Avant:**
```tsx
<Button variant="outline" className="text-red-500">
  Delete
</Button>
```

**Après:**
```tsx
<Button variant="destructiveOutline">
  Delete
</Button>
```

## Statut de Migration

**Total**: 12/120+ fichiers migrés
**Progression**: ~10%

### Fichiers Migrés Récemment:
- ✅ `darkmode-toggle.tsx` - Icônes vers leftIcon
- ✅ `mode-toggle.tsx` - Icônes vers leftIcon  
- ✅ `feedback-button.tsx` - Icône vers leftIcon
- ✅ `date-picker.tsx` - Icône vers leftIcon
- ✅ `data-table-pagination.tsx` - Icônes vers leftIcon
- ✅ `data-table-column-header.tsx` - Icône vers rightIcon
- ✅ `data-table-row-actions.tsx` - Icône vers leftIcon
- ✅ `create-agent-button.tsx` - Icône vers leftIcon
- ✅ `create-service-button.tsx` - Icône vers leftIcon
- ✅ `agent-form.tsx` - Pattern loading → prop loading
- ✅ `edit-agent-dialog.tsx` - Pattern loading → prop loading
- ✅ `login-form.tsx` - Déjà conforme 