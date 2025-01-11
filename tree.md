.
├──  .eslintrc.js
├── CONTRIBUTING.md
├── README.md
├── components.json
├── config
│   ├── env.ts
│   └── security.mjs
├── next-i18next.config.js
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── prisma
│   ├── migrations
│   │   ├── 20241130222616_add_profil_procedures
│   │   │   └── migration.sql
│   │   ├── 20241130225529_add_profil_procedures_more
│   │   │   └── migration.sql
│   │   ├── 20241201202440_add_procedures
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── public
│   ├── images
│   │   ├── cover-image-contact.ga.jpg
│   │   ├── icon512_maskable.jpeg
│   │   ├── icon512_maskable.png
│   │   ├── icon512_rounded.png
│   │   ├── logo.jpeg
│   │   └── logo_consulat_ga_512.jpeg
│   └── manifest.json
├── routes-watcher.js
├── scripts
│   ├── minifyMarkdown.js
│   ├── seed-services.ts
│   ├── seed.ts
│   └── trad.js
├── specs
│   ├── chatbot-specs.md
│   ├── demarches-logique.md
│   ├── learning-schema.txt
│   ├── rdv-system.md
│   ├── services-consulaires.md
│   └── super-admin-dev-specs.md
├── src
│   ├── actions
│   │   ├── appointments.ts
│   │   ├── auth.ts
│   │   ├── convert.ts
│   │   ├── documents.ts
│   │   ├── email-list.ts
│   │   ├── email.ts
│   │   ├── notifications.ts
│   │   ├── profile-suggestions.ts
│   │   ├── uploads.ts
│   │   ├── user-documents.ts
│   │   ├── user.ts
│   │   └── utils.ts
│   ├── app
│   │   ├── (authenticated)
│   │   │   ├── admin
│   │   │   │   ├── _utils
│   │   │   │   │   ├── actions
│   │   │   │   │   │   ├── dashboard.ts
│   │   │   │   │   │   ├── documents.ts
│   │   │   │   │   │   ├── profile-notes.ts
│   │   │   │   │   │   └── profiles.ts
│   │   │   │   │   ├── dashboard
│   │   │   │   │   │   ├── dashboard-stats.tsx
│   │   │   │   │   │   ├── pending-tasks.tsx
│   │   │   │   │   │   ├── recent-activity.tsx
│   │   │   │   │   │   └── stats-card.tsx
│   │   │   │   │   └── profiles
│   │   │   │   │       ├── profile-card.tsx
│   │   │   │   │       ├── profile-notes.tsx
│   │   │   │   │       ├── profile-review.tsx
│   │   │   │   │       ├── profiles-filters.tsx
│   │   │   │   │       ├── profiles-list.tsx
│   │   │   │   │       ├── profiles-table.tsx
│   │   │   │   │       └── review
│   │   │   │   │           ├── basic-info.tsx
│   │   │   │   │           ├── contact.tsx
│   │   │   │   │           ├── document-validation-dialog.tsx
│   │   │   │   │           ├── documents.tsx
│   │   │   │   │           ├── family.tsx
│   │   │   │   │           ├── notes.tsx
│   │   │   │   │           └── professional.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── profiles
│   │   │   │       ├── [id]
│   │   │   │       │   └── review
│   │   │   │       │       └── page.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── manager
│   │   │   │   ├── _utils
│   │   │   │   │   ├── actions
│   │   │   │   │   │   ├── dashboard.ts
│   │   │   │   │   │   └── requests.ts
│   │   │   │   │   └── components
│   │   │   │   │       ├── dashboard
│   │   │   │   │       │   ├── dashboard-stats.tsx
│   │   │   │   │       │   ├── pending-requests.tsx
│   │   │   │   │       │   └── recent-activity.tsx
│   │   │   │   │       └── requests
│   │   │   │   │           ├── request-validation-dialog.tsx
│   │   │   │   │           ├── requests-filters.tsx
│   │   │   │   │           └── requests-table.tsx
│   │   │   │   ├── documents
│   │   │   │   │   ├── _utils
│   │   │   │   │   │   └── components
│   │   │   │   │   │       ├── document-card.tsx
│   │   │   │   │   │       ├── documents-list.tsx
│   │   │   │   │   │       ├── metadata-form.tsx
│   │   │   │   │   │       └── user-document.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── requests
│   │   │   │       └── page.tsx
│   │   │   ├── profile
│   │   │   │   ├── _utils
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── consular-card-preview.tsx
│   │   │   │   │   │   ├── dashboard
│   │   │   │   │   │   │   └── sections
│   │   │   │   │   │   │       ├── appointments-section.tsx
│   │   │   │   │   │   │       ├── documents-section.tsx
│   │   │   │   │   │   │       ├── procedures-section.tsx
│   │   │   │   │   │   │       ├── profile-section.tsx
│   │   │   │   │   │   │       └── requests-section.tsx
│   │   │   │   │   │   ├── editable-section.tsx
│   │   │   │   │   │   ├── profile-completion-assistant.tsx
│   │   │   │   │   │   ├── profile-completion.tsx
│   │   │   │   │   │   ├── profile-header-client.tsx
│   │   │   │   │   │   ├── profile-header.tsx
│   │   │   │   │   │   ├── profile-notes.tsx
│   │   │   │   │   │   ├── profile-status-badge.tsx
│   │   │   │   │   │   ├── sections
│   │   │   │   │   │   │   ├── basic-info-section.tsx
│   │   │   │   │   │   │   ├── contact-info-section.tsx
│   │   │   │   │   │   │   ├── documents-section.tsx
│   │   │   │   │   │   │   ├── family-info-section.tsx
│   │   │   │   │   │   │   └── professional-info-section.tsx
│   │   │   │   │   │   └── submit-profile-button.tsx
│   │   │   │   │   └── profile.ts
│   │   │   │   └── page.tsx
│   │   │   └── services
│   │   │       ├── [id]
│   │   │       │   ├── page.tsx
│   │   │       │   ├── start
│   │   │       │   │   └── page.tsx
│   │   │       │   └── start 2
│   │   │       ├── _utils
│   │   │       │   ├── actions
│   │   │       │   │   ├── create.ts
│   │   │       │   │   ├── delete.ts
│   │   │       │   │   ├── get-requests.ts
│   │   │       │   │   ├── get.ts
│   │   │       │   │   ├── submit.ts
│   │   │       │   │   └── update.ts
│   │   │       │   └── consular-services
│   │   │       │       ├── requests
│   │   │       │       │   ├── request-card.tsx
│   │   │       │       │   └── requests-list.tsx
│   │   │       │       ├── service-card.tsx
│   │   │       │       ├── service-details.tsx
│   │   │       │       ├── service-form
│   │   │       │       │   ├── appointment-step.tsx
│   │   │       │       │   ├── documents-step.tsx
│   │   │       │       │   ├── dynamic-step.tsx
│   │   │       │       │   ├── form-navigation.tsx
│   │   │       │       │   ├── index.tsx
│   │   │       │       │   ├── review-step.tsx
│   │   │       │       │   └── step-indicator.tsx
│   │   │       │       ├── services-header.tsx
│   │   │       │       └── services-list.tsx
│   │   │       ├── page.tsx
│   │   │       └── requests
│   │   │           └── page.tsx
│   │   ├── (public)
│   │   │   ├── _page.tsx
│   │   │   ├── cta-section.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── registration
│   │   │   │   ├── _utils
│   │   │   │   │   └── components
│   │   │   │   │       ├── basic-info.tsx
│   │   │   │   │       ├── contact-form.tsx
│   │   │   │   │       ├── document-upload-section.tsx
│   │   │   │   │       ├── family-info.tsx
│   │   │   │   │       ├── form.tsx
│   │   │   │   │       ├── mobile-progress.tsx
│   │   │   │   │       ├── navigation.tsx
│   │   │   │   │       ├── professional-info.tsx
│   │   │   │   │       ├── review-fields.tsx
│   │   │   │   │       ├── review.tsx
│   │   │   │   │       ├── step-guide.tsx
│   │   │   │   │       └── step-indicator.tsx
│   │   │   │   └── page.tsx
│   │   │   └── unauthorized
│   │   │       └── page.tsx
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   └── [...nextauth]
│   │   │   │       └── route.ts
│   │   │   ├── manifest
│   │   │   │   └── route.ts
│   │   │   └── uploadthing
│   │   │       └── route.ts
│   │   ├── auth
│   │   │   ├── _utils
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── logout-button.tsx
│   │   │   ├── error
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── login
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── assets
│   │   ├── business-card-cover.jpeg
│   │   ├── card-back1.jpg
│   │   ├── card-back2.jpg
│   │   ├── contact-ga-image.png
│   │   ├── default-profil-cover.jpg
│   │   ├── default-profil-pic.jpg
│   │   ├── drapeau-gabon.png
│   │   ├── favicon.ico
│   │   ├── home-contact-bubble1.jpeg
│   │   ├── home-contact-bubble2.jpeg
│   │   ├── home-contact-bubble3.jpeg
│   │   └── logo-icon.png
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── components
│   │   ├── appointments
│   │   │   ├── appointment-details.tsx
│   │   │   ├── schedule-display.tsx
│   │   │   └── time-slot-picker.tsx
│   │   ├── chat
│   │   │   ├── chat-toggle.tsx
│   │   │   └── chat-window.tsx
│   │   ├── layouts
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── protected-route.tsx
│   │   │   ├── public-layout.tsx
│   │   │   ├── role-guard.tsx
│   │   │   ├── server-auth-guard.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── notifications
│   │   │   ├── notification-badge.tsx
│   │   │   └── notifications-menu.tsx
│   │   ├── public
│   │   │   ├── footer.tsx
│   │   │   └── header.tsx
│   │   └── ui
│   │       ├── FilePreview.tsx
│   │       ├── LangSwitcher.tsx
│   │       ├── LanguageSwitcher.tsx
│   │       ├── add-to-browser.tsx
│   │       ├── add-to-homescreen.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── cta-contact.tsx
│   │       ├── custom-loader.tsx
│   │       ├── darkmode-toggle.tsx
│   │       ├── dialog.tsx
│   │       ├── document-badge.tsx
│   │       ├── document-preview.tsx
│   │       ├── document-upload.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── dynamic-field.tsx
│   │       ├── dynamic-fields.tsx
│   │       ├── dynamic-tags.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-card.tsx
│   │       ├── file-preview.tsx
│   │       ├── form-error.tsx
│   │       ├── form-skeleton.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── icons.tsx
│   │       ├── info-field.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── loading-state.tsx
│   │       ├── loading-suspense.tsx
│   │       ├── logout-button.tsx
│   │       ├── lottie-animation.tsx
│   │       ├── markdown-editor.tsx
│   │       ├── menu-bar-mobile.tsx
│   │       ├── menubar.tsx
│   │       ├── missing-badge.tsx
│   │       ├── mode-toggle.tsx
│   │       ├── nav-main.tsx
│   │       ├── nav-secondary.tsx
│   │       ├── nav-user.tsx
│   │       ├── notification-badge.tsx
│   │       ├── phone-input.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── qr-code.tsx
│   │       ├── radio-group.tsx
│   │       ├── role-guard.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── status-badge.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── tags-input.tsx
│   │       ├── textarea.tsx
│   │       ├── time-select.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── tooltip.tsx
│   │       └── use-toast.ts
│   ├── hooks
│   │   ├── use-current-user.ts
│   │   ├── use-file-preview.ts
│   │   ├── use-mobile.tsx
│   │   ├── use-notifications.ts
│   │   ├── use-profile-suggestions.ts
│   │   ├── use-protected-action.ts
│   │   ├── use-registration-form.ts
│   │   ├── use-toast.ts
│   │   └── use-user-agent.ts
│   ├── i18n
│   │   ├── config.ts
│   │   └── request.ts
│   ├── lib
│   │   ├── ai
│   │   │   ├── actions.ts
│   │   │   ├── assistant-factory.ts
│   │   │   ├── assistants
│   │   │   │   ├── base-assistant.ts
│   │   │   │   └── consular-assistant.ts
│   │   │   ├── context-builder.ts
│   │   │   ├── prompts
│   │   │   │   ├── index.ts
│   │   │   │   └── profile-suggestions.ts
│   │   │   ├── session-manager.ts
│   │   │   └── types.ts
│   │   ├── animations.ts
│   │   ├── appointments
│   │   │   └── holidays.ts
│   │   ├── auth
│   │   │   ├── action.ts
│   │   │   └── credentials-provider.ts
│   │   ├── autocomplete-datas.ts
│   │   ├── document-fields.ts
│   │   ├── document-validation.ts
│   │   ├── env.ts
│   │   ├── form
│   │   │   ├── errors.ts
│   │   │   ├── schema-generator.ts
│   │   │   ├── update-helpers.ts
│   │   │   └── validation.ts
│   │   ├── form-storage.ts
│   │   ├── form.ts
│   │   ├── prisma.ts
│   │   ├── services
│   │   │   └── phone.ts
│   │   ├── twilio.ts
│   │   ├── uploadthing.ts
│   │   ├── user
│   │   │   ├── getters.ts
│   │   │   ├── otp.ts
│   │   │   └── user-context.ts
│   │   └── utils.ts
│   ├── middleware.ts
│   ├── routes.ts
│   ├── schemas
│   │   ├── documents.ts
│   │   ├── inputs.ts
│   │   ├── procedures.ts
│   │   ├── registration.ts
│   │   ├── routes.ts
│   │   └── user.ts
│   ├── services
│   │   └── locale.ts
│   ├── styles
│   │   └── notifications.css
│   └── types
│       ├── consular-service.ts
│       ├── consulate.ts
│       ├── dashboard.ts
│       ├── index.ts
│       ├── navigation.ts
│       └── profile.ts
├── tailwind.config.ts
├── translations
│   ├── en.json
│   ├── es.json
│   └── fr.json
├── tree.md
├── tsconfig.json
└── tsconfig.seed.json

88 directories, 330 files
