# Rôle Agent des Services de Renseignements (DGSE)

## Vue d'ensemble

Ce document définit les spécifications pour l'implémentation d'un nouveau rôle utilisateur dédié aux agents des services de renseignements (DGSE) dans la plateforme consulaire. Ce rôle permet aux agents d'accéder aux profils des citoyens gabonais et d'ajouter des informations de renseignement confidentielles.

## 1. Définition du rôle

### 1.1 Nom du rôle

- **Code**: `INTEL_AGENT`
- **Libellé**: Agent des Services de Renseignements
- **Description**: Agent autorisé à consulter les profils citoyens et ajouter des notes de renseignement confidentielles

### 1.2 Permissions spécifiques

#### Accès aux profils

- **Lecture seule** de tous les profils de citoyens gabonais
- **Consultation** des détails complets des profils (informations personnelles, documents, historique)
- **Aucune modification** des données existantes du profil
- **Aucun accès** aux fonctionnalités de gestion des demandes de services

#### Section Renseignements

- **Ajout** de notes de renseignement sur les profils
- **Consultation** des notes de renseignement existantes
- **Modification** de ses propres notes
- **Suppression** de ses propres notes (avec historique)

## 2. Modèle de données

### 2.1 Extension du schéma Prisma

```prisma
enum UserRole {
    SUPER_ADMIN
    ADMIN
    MANAGER
    AGENT
    USER
    INTEL_AGENT  // Nouveau rôle
}

enum IntelligenceNoteType {
    POLITICAL_OPINION    // Opinion politique
    ORIENTATION          // Orientation
    ASSOCIATIONS         // Associations
    TRAVEL_PATTERNS      // Habitudes de voyage
    CONTACTS             // Contacts
    ACTIVITIES           // Activités
    OTHER                // Autre
}

enum IntelligenceNotePriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
}

model IntelligenceNote {
    id          String                @id @default(cuid())
    profileId   String
    profile     Profile               @relation(fields: [profileId], references: [id], onDelete: Cascade)

    type        IntelligenceNoteType
    priority    IntelligenceNotePriority @default(MEDIUM)
    title       String
    content     String                @db.Text
    tags        String[]              // Tags pour catégoriser

    author      User                  @relation(fields: [authorId], references: [id])
    authorId    String

    // Métadonnées
    createdAt   DateTime              @default(now())
    updatedAt   DateTime              @updatedAt
    expiresAt   DateTime?             // Date d'expiration optionnelle

    // Historique des modifications
    history     IntelligenceNoteHistory[]

    @@index([profileId])
    @@index([authorId])
    @@index([type])
    @@index([priority])
    @@index([createdAt])
}

model IntelligenceNoteHistory {
    id                String           @id @default(cuid())
    intelligenceNote  IntelligenceNote @relation(fields: [intelligenceNoteId], references: [id], onDelete: Cascade)
    intelligenceNoteId String

    action            String           // 'created', 'updated', 'deleted'
    previousContent   String?          @db.Text
    newContent        String?          @db.Text
    changedBy         User             @relation(fields: [changedById], references: [id])
    changedById       String
    changedAt         DateTime         @default(now())

    @@index([intelligenceNoteId])
    @@index([changedAt])
}
```

### 2.2 Relations ajoutées au modèle Profile

```prisma
model Profile {
    // ... champs existants ...

    intelligenceNotes IntelligenceNote[]
}
```

### 2.3 Relations ajoutées au modèle User

```prisma
model User {
    // ... champs existants ...

    authoredIntelligenceNotes IntelligenceNote[]
    intelligenceNoteHistory   IntelligenceNoteHistory[]
}
```

## 3. Interface utilisateur

### 3.1 Dashboard spécifique

**Route**: `/dashboard` (adaptation selon le rôle)

**Fonctionnalités pour INTEL_AGENT**:

- **Statistiques des profils** :
  - Nombre total de profils gabonais
  - Nombre de profils avec notes de renseignement
  - Nombre de notes créées ce mois
  - Répartition par type de notes
- **Carte des profils** :
  - Visualisation géographique des profils
  - Filtres par région/pays
  - Indicateurs de densité
  - Pastilles colorées selon les priorités des notes
- **Activité récente** :
  - Dernières notes ajoutées
  - Profils consultés récemment
  - Alertes de sécurité

### 3.2 Page principale - Liste des profils

**Route**: `/profiles` (adaptation selon le rôle)

**Fonctionnalités pour INTEL_AGENT**:

- Tableau de tous les profils gabonais avec pagination
- Filtres par :
  - Nom/Prénom
  - Date de naissance
  - Lieu de naissance
  - Nationalité
  - Statut marital
  - Présence de notes de renseignement
- Tri par colonnes
- Recherche globale
- Indicateur visuel des profils avec notes de renseignement

### 3.3 Page de détail du profil

**Route**: `/profiles/[profileId]` (adaptation selon le rôle)

**Sections**:

1. **Informations personnelles** (lecture seule)
2. **Documents** (lecture seule)
3. **Historique des demandes** (lecture seule)
4. **Section Renseignements** (nouvelle section)

#### Section Renseignements

**Composants**:

- **Liste des notes existantes** avec filtres par type et priorité
- **Formulaire d'ajout** de nouvelle note
- **Historique des modifications** pour chaque note
- **Indicateurs visuels** de priorité (pastilles colorées)

**Types de notes disponibles**:

- 🏛️ Opinion politique
- 🧭 Orientation
- 👥 Associations
- ✈️ Habitudes de voyage
- 📞 Contacts
- 🎯 Activités
- 📝 Autre

**Priorités**:

- 🟢 Faible (LOW)
- 🟡 Moyenne (MEDIUM)
- 🟠 Élevée (HIGH)
- 🔴 Critique (CRITICAL)

### 3.4 Composants UI spécifiques

#### DashboardIntelligenceStats

```typescript
interface DashboardIntelligenceStatsProps {
  stats: {
    totalProfiles: number;
    profilesWithNotes: number;
    notesThisMonth: number;
    notesByType: Record<IntelligenceNoteType, number>;
  };
}
```

#### IntelligenceMap

```typescript
interface IntelligenceMapProps {
  profiles: ProfileWithIntelligence[];
  onProfileClick?: (profileId: string) => void;
  filters?: {
    region?: string;
    hasNotes?: boolean;
    priority?: IntelligenceNotePriority;
  };
}
```

#### IntelligenceNoteCard

```typescript
interface IntelligenceNoteCardProps {
  note: IntelligenceNote;
  onEdit?: (note: IntelligenceNote) => void;
  onDelete?: (note: IntelligenceNote) => void;
  showHistory?: boolean;
}
```

#### IntelligenceNoteForm

```typescript
interface IntelligenceNoteFormProps {
  profileId: string;
  onSuccess?: () => void;
  initialData?: Partial<IntelligenceNote>;
}
```

#### IntelligenceNoteHistory

```typescript
interface IntelligenceNoteHistoryProps {
  noteId: string;
}
```

## 4. Permissions et sécurité

### 4.1 Configuration des permissions

```typescript
// src/lib/permissions/roles.ts
INTEL_AGENT: {
  profiles: {
    view: true, // Lecture seule de tous les profils
    create: false,
    update: false,
    delete: false,
    validate: false,
    viewChild: true,
    createChild: false,
    updateChild: false,
    deleteChild: false,
  },
  intelligenceNotes: {
    view: true,
    create: true,
    update: (user, note) => note.authorId === user.id,
    delete: (user, note) => note.authorId === user.id,
    viewHistory: true,
  },
  // Autres permissions à false
  appointments: { /* toutes à false */ },
  serviceRequests: { /* toutes à false */ },
  organizations: { /* toutes à false */ },
  consularServices: { /* toutes à false */ },
  documents: { /* toutes à false */ },
  users: { /* toutes à false */ },
  parentalAuthorities: { /* toutes à false */ },
}
```

### 4.2 Sécurité des données

- **Chiffrement** des notes de renseignement sensibles
- **Audit trail** complet de toutes les actions
- **Accès restreint** aux seuls agents autorisés
- **Séparation** des données de renseignement des données consulaires
- **Logs de sécurité** pour tous les accès

## 5. API et Server Actions

### 5.1 Server Actions

```typescript
// src/actions/intelligence.ts

export async function createIntelligenceNote(data: CreateIntelligenceNoteInput) {
  'use server';
  // Implémentation avec tryCatch
}

export async function updateIntelligenceNote(
  id: string,
  data: UpdateIntelligenceNoteInput,
) {
  'use server';
  // Implémentation avec tryCatch
}

export async function deleteIntelligenceNote(id: string) {
  'use server';
  // Implémentation avec tryCatch
}

export async function getIntelligenceNotes(profileId: string) {
  'use server';
  // Implémentation avec tryCatch
}

export async function getIntelligenceNoteHistory(noteId: string) {
  'use server';
  // Implémentation avec tryCatch
}
```

### 5.2 tRPC Routers

```typescript
// src/server/api/routers/intelligence.ts

export const intelligenceRouter = createTRPCRouter({
  // Dashboard stats pour INTEL_AGENT
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    // Implémentation - stats spécifiques au rôle INTEL_AGENT
  }),

  // Carte des profils avec données de renseignement
  getProfilesMap: protectedProcedure
    .input(
      z.object({
        filters: z
          .object({
            region: z.string().optional(),
            hasNotes: z.boolean().optional(),
            priority: z.nativeEnum(IntelligenceNotePriority).optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Implémentation
    }),

  getProfiles: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        filters: z
          .object({
            search: z.string().optional(),
            hasNotes: z.boolean().optional(),
            // autres filtres
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Implémentation - adaptation selon le rôle
    }),

  getProfileDetails: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Implémentation - adaptation selon le rôle
    }),

  getIntelligenceNotes: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Implémentation
    }),

  createNote: protectedProcedure
    .input(createIntelligenceNoteSchema)
    .mutation(async ({ ctx, input }) => {
      // Implémentation
    }),

  updateNote: protectedProcedure
    .input(updateIntelligenceNoteSchema)
    .mutation(async ({ ctx, input }) => {
      // Implémentation
    }),

  deleteNote: protectedProcedure
    .input(z.object({ noteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Implémentation
    }),
});
```

## 6. Schémas de validation

### 6.1 Schémas Zod

```typescript
// src/schemas/intelligence.ts

export const createIntelligenceNoteSchema = z.object({
  profileId: z.string(),
  type: z.nativeEnum(IntelligenceNoteType),
  priority: z
    .nativeEnum(IntelligenceNotePriority)
    .default(IntelligenceNotePriority.MEDIUM),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  tags: z.array(z.string()).optional(),
  expiresAt: z.date().optional(),
});

export const updateIntelligenceNoteSchema = createIntelligenceNoteSchema
  .partial()
  .extend({
    id: z.string(),
  });

export type CreateIntelligenceNoteInput = z.infer<typeof createIntelligenceNoteSchema>;
export type UpdateIntelligenceNoteInput = z.infer<typeof updateIntelligenceNoteSchema>;
```

## 7. Traductions

### 7.1 Clés de traduction

```typescript
// src/i18n/messages/fr/index.ts

export const intelligence = {
  title: 'Services de Renseignements',
  dashboard: {
    title: 'Dashboard Renseignements',
    stats: {
      totalProfiles: 'Total des profils',
      profilesWithNotes: 'Profils avec notes',
      notesThisMonth: 'Notes ce mois',
      notesByType: 'Notes par type',
    },
    map: {
      title: 'Carte des profils',
      filters: 'Filtres',
      density: 'Densité',
    },
    recentActivity: {
      title: 'Activité récente',
      lastNotes: 'Dernières notes',
      recentProfiles: 'Profils consultés',
      securityAlerts: 'Alertes de sécurité',
    },
  },
  profiles: {
    title: 'Profils des Citoyens',
    search: 'Rechercher un profil...',
    hasNotes: 'Avec notes de renseignement',
    noNotes: 'Sans notes',
  },
  notes: {
    title: 'Renseignements',
    add: 'Ajouter une note',
    edit: 'Modifier la note',
    delete: 'Supprimer la note',
    types: {
      political_opinion: 'Opinion politique',
      orientation: 'Orientation',
      associations: 'Associations',
      travel_patterns: 'Habitudes de voyage',
      contacts: 'Contacts',
      activities: 'Activités',
      other: 'Autre',
    },
    priorities: {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      critical: 'Critique',
    },
    history: 'Historique des modifications',
    created: 'Créée le',
    updated: 'Modifiée le',
    by: 'par',
  },
  // ... autres traductions
};
```

## 8. Plan d'implémentation

### Phase 1: Base de données et modèles

1. ✅ Extension du schéma Prisma avec les nouveaux modèles
2. ✅ Migration de la base de données
3. ✅ Mise à jour des types TypeScript

### Phase 2: Permissions et sécurité

1. ✅ Ajout du rôle `INTEL_AGENT` dans l'enum
2. ✅ Configuration des permissions dans `roles.ts`
3. ✅ Mise à jour des middlewares de sécurité

### Phase 3: API et Server Actions

1. ✅ Création des schémas de validation
2. ✅ Implémentation des Server Actions
3. ✅ Création du router tRPC

### Phase 4: Interface utilisateur

1. ✅ Création des composants UI de base
2. ✅ Dashboard spécifique INTEL_AGENT avec statistiques et carte
3. ✅ Adaptation des pages existantes (/dashboard, /profiles, /profiles/[id])
4. ✅ Section renseignements dans les pages de profils
5. ✅ Formulaires de gestion des notes

### Phase 5: Fonctionnalités avancées

1. ✅ Système d'historique des modifications
2. ✅ Filtres et recherche avancée
3. ✅ Indicateurs visuels de priorité
4. ✅ Audit trail et logs de sécurité

### Phase 6: Tests et validation

1. ✅ Tests unitaires des composants
2. ✅ Tests d'intégration des API
3. ✅ Tests de sécurité et permissions
4. ✅ Validation avec les utilisateurs finaux

## 9. Considérations techniques

### 9.1 Performance

- **Pagination** obligatoire pour la liste des profils
- **Indexation** des champs de recherche fréquents
- **Cache** des données de profils fréquemment consultés
- **Lazy loading** des notes de renseignement

### 9.2 Sécurité

- **Chiffrement** des notes sensibles au niveau base de données
- **Audit trail** complet avec horodatage et utilisateur
- **Sessions** avec timeout automatique
- **Logs de sécurité** pour tous les accès

### 9.3 Maintenance

- **Archivage** automatique des notes expirées
- **Nettoyage** périodique des données temporaires
- **Monitoring** des performances et erreurs
- **Backup** sécurisé des données de renseignement

## 10. Métriques et monitoring

### 10.1 KPIs à suivre

- Nombre de profils consultés par jour
- Nombre de notes créées/modifiées
- Temps de réponse des requêtes
- Taux d'erreur des opérations

### 10.2 Alertes de sécurité

- Tentatives d'accès non autorisées
- Modifications suspectes de notes
- Accès en dehors des heures normales
- Volumes d'activité anormaux

---

**Note**: Ce document est un plan d'implémentation détaillé qui respecte l'architecture existante de la plateforme et les bonnes pratiques de sécurité pour les données de renseignement.
