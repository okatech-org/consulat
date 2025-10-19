# Plan de Migration Dashboard: Prisma + tRPC → Convex

**Projet**: Consulat
**Date**: 2025-10-19
**Objectif**: Migrer toutes les pages du dashboard (`src/app/(authenticated)/dashboard/`) de Prisma + tRPC vers Convex

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture actuelle vs. cible](#architecture-actuelle-vs-cible)
3. [Schémas Convex disponibles](#schémas-convex-disponibles)
4. [Plan de migration par domaine](#plan-de-migration-par-domaine)
5. [Patterns de migration](#patterns-de-migration)
6. [Ordre de migration recommandé](#ordre-de-migration-recommandé)
7. [Checklist de migration par page](#checklist-de-migration-par-page)
8. [Tests et validation](#tests-et-validation)

---

## 📊 Vue d'ensemble

### Contexte

Le projet est en cours de migration de Prisma + tRPC vers Convex. La section **my-space** a déjà été migrée avec succès et sert de référence pour les patterns à suivre.

### Objectifs de la migration

- ✅ Remplacer **tous** les appels tRPC par des queries/mutations Convex
- ✅ Supprimer toutes les dépendances Prisma
- ✅ Utiliser les schémas et fonctions Convex existants
- ✅ Conserver les patterns UI (DataTable, PageContainer, etc.)
- ✅ Maintenir les features existantes (filtres, pagination, bulk actions)
- ❌ **PAS de compatibilité arrière** avec Prisma/tRPC

---

## 🏗️ Architecture actuelle vs. cible

### Architecture actuelle (à remplacer)

```typescript
// ❌ Pattern tRPC à supprimer
import { api } from '@/trpc/react';

function Component() {
  const { data, isLoading } = api.requests.getList.useQuery({
    page: 1,
    status: 'pending'
  });

  const updateMutation = api.requests.update.useMutation({
    onSuccess: () => refetch()
  });
}
```

### Architecture cible (Convex)

```typescript
// ✅ Pattern Convex à utiliser
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function Component() {
  const data = useQuery(api.functions.request.getAllRequests, {
    status: 'pending',
    limit: 10
  });

  const updateRequest = useMutation(api.functions.request.updateRequest);

  // data === undefined = loading
  // data === null = not found
  // data === array/object = success
}
```

---

## 🗄️ Schémas Convex disponibles

Voici les tables et fonctions Convex déjà implémentées :

### Tables principales

| Table | Fichier | Fonctions disponibles |
|-------|---------|----------------------|
| `users` | `convex/tables/users.ts` | `convex/functions/user.ts` |
| `profiles` | `convex/tables/profiles.ts` | `convex/functions/profile.ts` |
| `organizations` | `convex/tables/organizations.ts` | `convex/functions/organization.ts` |
| `memberships` | `convex/tables/memberships.ts` | `convex/functions/membership.ts` |
| `services` | `convex/tables/services.ts` | `convex/functions/service.ts` |
| `requests` | `convex/tables/requests.ts` | `convex/functions/request.ts` |
| `documents` | `convex/tables/documents.ts` | `convex/functions/document.ts` |
| `appointments` | `convex/tables/appointments.ts` | `convex/functions/appointment.ts` |
| `notifications` | `convex/tables/notifications.ts` | `convex/functions/notification.ts` |
| `countries` | `convex/tables/countries.ts` | `convex/functions/country.ts` |
| `tickets` | `convex/tables/tickets.ts` | `convex/functions/ticket.ts` |
| `childProfiles` | `convex/tables/childProfiles.ts` | `convex/functions/childProfile.ts` |

### Fonctions Convex par domaine

#### Requests (`convex/functions/request.ts`)

**Queries:**
- `getCurrentRequest(userId)` - Obtenir la demande actuelle d'un utilisateur
- `getRecentRequests(userId, limit?)` - Demandes récentes
- `getRequest(requestId)` - Une demande par ID
- `getRequestByNumber(number)` - Demande par numéro
- `getAllRequests(status?, requesterId?, assignedAgentId?, serviceId?, priority?, limit?)` - Liste avec filtres
- `getUserRequests(userId)` - Toutes les demandes d'un utilisateur
- `searchRequests(searchTerm, requesterId?, status?)` - Recherche textuelle

**Mutations:**
- `createRequest(serviceId, requesterId, profileId?, priority?, formData?, documentIds?)`
- `updateRequest(requestId, status?, priority?, formData?, documentIds?, assignedAgentId?)`
- `submitRequest(requestId)`
- `assignRequest(requestId, assignedAgentId, assignedById)`
- `autoAssignRequestToAgent(requestId, serviceId, organizationId, countryCode)`
- `completeRequest(requestId, completedById)`
- `addRequestDocument(requestId, documentId, addedById)`
- `addRequestNote(requestId, note, addedById)`

#### Profiles (`convex/functions/profile.ts`)

**Queries:**
- `getProfile(profileId)`
- `getProfileByUser(userId)`
- `getAllProfiles(status?, residenceCountry?, limit?)`
- `getProfilesByStatus(status)`
- `getProfilesByResidenceCountry(residenceCountry)`
- `getProfileWithDocuments(profileId)`
- `searchProfiles(searchTerm, status?)`
- `getCurrentProfile(profileId?)` - Profile complet avec documents et registration request
- `getOverviewProfile(userId, profileId)` - Stats et overview

**Mutations:**
- `createProfile(userId, firstName, lastName, email, phone, residenceCountry?)`
- `updateProfile(profileId, ...fields)` - Mise à jour partielle
- `updatePersonalInfo(profileId, personal)`
- `updateFamilyInfo(profileId, family)`
- `updateProfessionalInfo(profileId, professionSituation)`
- `updateContacts(profileId, contacts)`
- `submitProfileForValidation(profileId)` - Soumettre pour validation avec auto-assignment

#### Users (`convex/functions/user.ts`)

**Queries:**
- `getUser(userId)`
- `getUserByClerkId(clerkUserId)`
- `getUserByEmail(email)`
- `getAllUsers(status?, limit?)`
- `getUserProfile(userId)`
- `getUserAppointments(userId, status?, limit?)`
- `getUserDocuments(userId, type?, status?)`
- `getUserNotifications(userId, status?, limit?)`
- `searchUsersByEmailOrPhone(searchTerm, limit?)`

**Mutations:**
- `createUser(userId, firstName?, lastName?, email?, phoneNumber?, roles?)`
- `updateUser(userId, ...fields)`
- `updateUserLastActive(userId)`
- `softDeleteUser(userId)`
- `deleteUser(clerkUserId)`

**Actions:**
- `handleNewUser(clerkId)` - Gestion complète de la création d'un nouvel utilisateur

#### Appointments (`convex/functions/appointment.ts`)

**Queries:**
- `getAppointment(appointmentId)`
- `getAllAppointments(organizationId?, serviceId?, requestId?, status?, startDate?, endDate?, limit?)`
- `getAppointmentsByOrganization(organizationId, startDate?, endDate?)`
- `getAppointmentsByUser(userId)`
- `getAppointmentsByStatus(status)`
- `getUpcomingAppointments(userId?, organizationId?, limit?)`
- `getAppointmentAvailability(organizationId, date, duration)` - Créneaux disponibles

**Mutations:**
- `createAppointment(startAt, endAt, timezone, type, organizationId, ...)`
- `updateAppointment(appointmentId, ...fields)`
- `confirmAppointment(appointmentId)`
- `cancelAppointment(appointmentId, reason?)`
- `completeAppointment(appointmentId)`
- `rescheduleAppointment(appointmentId, newStartAt, newEndAt, timezone?)`
- `addParticipantToAppointment(appointmentId, userId, role?)`
- `updateParticipantStatus(appointmentId, userId, status)`
- `removeParticipantFromAppointment(appointmentId, userId)`

#### Organizations (`convex/functions/organization.ts`)
- Queries et mutations pour gérer les organisations
- Gestion des settings par pays
- Relations avec services et agents

#### Countries (`convex/functions/country.ts`)
- CRUD complet pour les pays
- Gestion des statuts actifs/inactifs

#### Services (`convex/functions/service.ts`)
- CRUD pour les services consulaires
- Filtrage par catégorie, organisation
- Gestion des prix et durées

#### Memberships (`convex/functions/membership.ts`)
- Gestion des agents et leur affectation
- Relations agent-organization-services-countries

---

## 🎯 Plan de migration par domaine

### 1. Dashboard SuperAdmin

#### 1.1 Countries (`dashboard/(superadmin)/countries/`)

**Fichiers concernés:**
- `page.tsx` - Liste des pays
- `[id]/edit/page.tsx` - Édition d'un pays
- `_utils/components/countries-list.tsx`
- `_utils/components/country-form.tsx`
- `_utils/components/create-country-button.tsx`
- `_utils/components/edit-country-dialog.tsx`

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.country.getAllCountries()
api.functions.country.getCountry(countryId)
api.functions.country.searchCountries(searchTerm)

// Mutations
api.functions.country.createCountry(name, code, flag, dialCode, status)
api.functions.country.updateCountry(countryId, ...fields)
api.functions.country.deleteCountry(countryId)
api.functions.country.updateCountryStatus(countryId, status)
```

**Migration steps:**
1. Remplacer `api.countries.getList.useQuery()` par `useQuery(api.functions.country.getAllCountries)`
2. Remplacer mutations tRPC par `useMutation(api.functions.country.updateCountry)`
3. Adapter les types: `Doc<'countries'>` depuis `@/convex/_generated/dataModel`
4. Supprimer les hooks personnalisés tRPC (`useCountries`)
5. Mettre à jour les optimistic updates si nécessaire

**État actuel:**
- ❌ Utilise tRPC
- ❌ Custom hook `useCountries` avec optimistic updates

**État cible:**
- ✅ Convex queries/mutations directes
- ✅ Gestion du loading avec `data === undefined`
- ✅ Types générés automatiquement

---

#### 1.2 Organizations (`dashboard/(superadmin)/organizations/`)

**Fichiers concernés:**
- `page.tsx` - Liste des organisations
- `[id]/page.tsx` - Détails d'une organisation

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.organization.getAllOrganizations(status?, limit?)
api.functions.organization.getOrganization(organizationId)
api.functions.organization.getOrganizationsByCountry(countryCode)
api.functions.organization.searchOrganizations(searchTerm, countryCode?)

// Mutations
api.functions.organization.createOrganization(name, type, countryIds, settings?)
api.functions.organization.updateOrganization(organizationId, ...fields)
api.functions.organization.updateOrganizationStatus(organizationId, status)
api.functions.organization.addCountryToOrganization(organizationId, countryId)
api.functions.organization.removeCountryFromOrganization(organizationId, countryId)
```

---

#### 1.3 Users (`dashboard/(superadmin)/users/`)

**Fichiers concernés:**
- `page.tsx` - Liste des utilisateurs
- `[id]/page.tsx` - Détails utilisateur
- `[id]/_components/send-message-dialog.tsx`

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.user.getAllUsers(status?, limit?)
api.functions.user.getUser(userId)
api.functions.user.getUserProfile(userId)
api.functions.user.searchUsersByEmailOrPhone(searchTerm, limit?)
api.functions.user.getUserAppointments(userId, status?, limit?)
api.functions.user.getUserDocuments(userId, type?, status?)
api.functions.user.getUserNotifications(userId, status?, limit?)

// Mutations
api.functions.user.updateUser(userId, ...fields)
api.functions.user.softDeleteUser(userId)
```

**Pattern de filtrage:**
```typescript
// Avant (tRPC)
const { data } = api.user.getList.useQuery({
  roles: ['AGENT', 'ADMIN'],
  countryCode: 'GA',
  organizationId: orgId
});

// Après (Convex)
const allUsers = useQuery(api.functions.user.getAllUsers);
const filteredUsers = useMemo(() => {
  if (!allUsers) return undefined;

  return allUsers.filter(user => {
    if (roles && !user.roles.some(r => roles.includes(r))) return false;
    if (countryCode && user.countryCode !== countryCode) return false;
    // ... autres filtres côté client
    return true;
  });
}, [allUsers, roles, countryCode]);
```

**Note:** Pour les filtres complexes, envisager de créer des queries Convex dédiées si la performance devient un problème.

---

#### 1.4 Tickets (`dashboard/(superadmin)/tickets/`)

**Fichiers concernés:**
- `page.tsx` - Liste des tickets
- `_components/ticket-action-sheet.tsx`

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.ticket.getAllTickets(status?, category?, priority?, limit?)
api.functions.ticket.getTicket(ticketId)
api.functions.ticket.getTicketsByUser(userId)
api.functions.ticket.getTicketsByStatus(status)
api.functions.ticket.searchTickets(searchTerm, status?)

// Mutations
api.functions.ticket.createTicket(...)
api.functions.ticket.updateTicket(ticketId, ...fields)
api.functions.ticket.updateTicketStatus(ticketId, status)
api.functions.ticket.assignTicket(ticketId, assignedToId)
api.functions.ticket.addTicketComment(ticketId, comment, authorId)
```

---

### 2. Dashboard General

#### 2.1 Agents (`dashboard/agents/`)

**Fichiers concernés:**
- `page.tsx` - Liste des agents
- `[id]/page.tsx` - Détails agent
- `_components/agents-table.tsx`

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.membership.getAllMemberships(role?, organizationId?, status?, limit?)
api.functions.membership.getMembership(membershipId)
api.functions.membership.getMembershipsByOrganization(organizationId)
api.functions.membership.getMembershipsByRole(role)
api.functions.membership.getMembershipsByUser(userId)

// Enrichissement des données
// Pour chaque membership, récupérer:
const user = useQuery(api.functions.user.getUser, { userId: membership.userId })
const organization = useQuery(api.functions.organization.getOrganization, {
  organizationId: membership.organizationId
})

// Mutations
api.functions.membership.createMembership(userId, organizationId, role, ...)
api.functions.membership.updateMembership(membershipId, ...fields)
api.functions.membership.addServiceToMembership(membershipId, serviceId)
api.functions.membership.removeServiceFromMembership(membershipId, serviceId)
api.functions.membership.addCountryToMembership(membershipId, countryCode)
```

**Pattern d'enrichissement:**
```typescript
function AgentsPage() {
  const memberships = useQuery(api.functions.membership.getAllMemberships, {
    role: 'agent'
  });

  // Enrichir avec les données utilisateur
  const enrichedAgents = useMemo(() => {
    if (!memberships) return undefined;

    return memberships.map(membership => ({
      ...membership,
      // Note: Vous devrez fetcher les users séparément
      // ou créer une query Convex qui retourne les données enrichies
    }));
  }, [memberships]);

  return <DataTable data={enrichedAgents} columns={columns} />;
}
```

**Recommandation:** Créer une nouvelle query Convex `getEnrichedAgents` qui retourne directement les agents avec leurs données utilisateur, organisation, services et pays pour éviter les N+1 queries.

---

#### 2.2 Requests (`dashboard/requests/`)

**Fichiers concernés:**
- `page.tsx` - Liste des demandes
- `[id]/page.tsx` - Détails demande
- `_components/request-quick-edit-form-dialog.tsx`
- `_components/request-review.tsx`
- `_components/service-request-review.tsx`
- `_components/request-overview.tsx`

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.request.getAllRequests(status?, requesterId?, assignedAgentId?, serviceId?, priority?, limit?)
api.functions.request.getRequest(requestId)
api.functions.request.getUserRequests(userId)
api.functions.request.searchRequests(searchTerm, requesterId?, status?)

// Mutations
api.functions.request.updateRequest(requestId, status?, priority?, formData?, documentIds?, assignedAgentId?)
api.functions.request.assignRequest(requestId, assignedAgentId, assignedById)
api.functions.request.completeRequest(requestId, completedById)
api.functions.request.addRequestNote(requestId, note, addedById)
api.functions.request.addRequestDocument(requestId, documentId, addedById)
```

**Exemple de migration du filtrage:**
```typescript
// Avant (tRPC avec filtres serveur)
const { data } = api.requests.getList.useQuery({
  page: 1,
  limit: 10,
  search: 'John',
  status: ['PENDING', 'IN_PROGRESS'],
  priority: 'URGENT',
  serviceCategory: 'passport'
});

// Après (Convex)
const allRequests = useQuery(api.functions.request.getAllRequests, {
  status: filters.status?.[0], // Convex accepte un seul status
  priority: filters.priority,
  limit: 100 // Fetch plus pour filtrer côté client
});

// Filtrage côté client pour les multi-status et search
const filteredRequests = useMemo(() => {
  if (!allRequests) return undefined;

  let result = allRequests;

  if (filters.status && filters.status.length > 0) {
    result = result.filter(r => filters.status.includes(r.status));
  }

  if (filters.search) {
    result = result.filter(r =>
      r.number.toLowerCase().includes(filters.search.toLowerCase()) ||
      // Note: Vous devrez enrichir avec les données de profil
    );
  }

  return result;
}, [allRequests, filters]);

// Pagination côté client
const paginatedRequests = useMemo(() => {
  if (!filteredRequests) return undefined;
  const start = (page - 1) * limit;
  return filteredRequests.slice(start, start + limit);
}, [filteredRequests, page, limit]);
```

**Recommandation importante:** Créer des queries Convex enrichies pour éviter les fetches multiples:

```typescript
// Nouvelle query à créer dans convex/functions/request.ts
export const getEnrichedRequests = query({
  args: {
    status: v.optional(requestStatusValidator),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const requests = await getAllRequests(ctx, args);

    return await Promise.all(
      requests.map(async (request) => {
        const [service, requester, profile, assignedAgent] = await Promise.all([
          ctx.db.get(request.serviceId),
          ctx.db.get(request.requesterId),
          request.profileId ? ctx.db.get(request.profileId) : null,
          request.assignedAgentId ? ctx.db.get(request.assignedAgentId) : null
        ]);

        return {
          ...request,
          service,
          requester,
          profile,
          assignedAgent
        };
      })
    );
  }
});
```

---

#### 2.3 Profiles (`dashboard/profiles/`)

**Fichiers concernés:**
- `page.tsx` - Liste des profils
- `[id]/page.tsx` - Détails profil
- `[id]/_components/profile-intelligence-details-page.tsx`

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.profile.getAllProfiles(status?, residenceCountry?, limit?)
api.functions.profile.getProfile(profileId)
api.functions.profile.getProfileWithDocuments(profileId)
api.functions.profile.searchProfiles(searchTerm, status?)
api.functions.profile.getCurrentProfile(profileId?)

// Mutations
api.functions.profile.updateProfile(profileId, ...fields)
api.functions.profile.updateProfileStatus(profileId, status)
```

**Pattern pour l'export Excel:**
```typescript
// Le code actuel utilise File System Access API et génère un Excel
// Cela reste inchangé, seule la source de données change

const profiles = useQuery(api.functions.profile.getAllProfiles, {
  status: filters.status
});

const handleExport = async () => {
  if (!profiles) return;

  // Récupérer les images pour chaque profil
  const enrichedProfiles = await Promise.all(
    profiles.map(async (profile) => {
      const documents = await client.query(
        api.functions.profile.getProfileWithDocuments,
        { profileId: profile._id }
      );

      return {
        ...profile,
        identityPhoto: documents?.documents.find(d => d.type === 'identity_photo')
      };
    })
  );

  // Générer Excel comme avant
  await generateExcel(enrichedProfiles, directoryHandle);
};
```

---

#### 2.4 Services (`dashboard/services/`)

**Fichiers concernés:**
- `page.tsx` - Liste des services
- `[id]/edit/page.tsx` - Édition service
- `new/page.tsx` - Nouveau service

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.service.getAllServices(category?, organizationId?, status?, limit?)
api.functions.service.getService(serviceId)
api.functions.service.getServicesByCategory(category)
api.functions.service.getServicesByOrganization(organizationId)
api.functions.service.searchServices(searchTerm, category?)

// Mutations
api.functions.service.createService(name, category, organizationId, ...)
api.functions.service.updateService(serviceId, ...fields)
api.functions.service.deleteService(serviceId)
api.functions.service.updateServiceStatus(serviceId, status)
```

---

#### 2.5 Appointments (`dashboard/appointments/`)

**Fichiers concernés:**
- `page.tsx` - Liste des rendez-vous
- `[id]/page.tsx` - Détails rendez-vous

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.appointment.getAllAppointments(organizationId?, serviceId?, requestId?, status?, startDate?, endDate?, limit?)
api.functions.appointment.getAppointment(appointmentId)
api.functions.appointment.getUpcomingAppointments(userId?, organizationId?, limit?)
api.functions.appointment.getAppointmentsByUser(userId)
api.functions.appointment.getAppointmentAvailability(organizationId, date, duration)

// Mutations
api.functions.appointment.createAppointment(...)
api.functions.appointment.updateAppointment(appointmentId, ...fields)
api.functions.appointment.confirmAppointment(appointmentId)
api.functions.appointment.cancelAppointment(appointmentId, reason?)
api.functions.appointment.rescheduleAppointment(appointmentId, newStartAt, newEndAt, timezone?)
```

---

#### 2.6 Document Templates (`dashboard/document-templates/`)

**Fichiers concernés:**
- `page.tsx` - Liste des templates
- `[id]/page.tsx` - Détails template

**Note:** Il n'y a pas de table `documentTemplates` dans le schéma Convex actuel.

**Options:**
1. **Créer une nouvelle table** `documentTemplates` avec les fonctions associées
2. **Stocker dans les settings** de l'organisation si c'est spécifique à chaque org
3. **Utiliser les documents** avec un type spécial `template`

**Recommandation:** Créer une nouvelle table si les templates sont gérés séparément:

```typescript
// À créer: convex/tables/documentTemplates.ts
export const documentTemplates = defineTable({
  name: v.string(),
  type: v.string(),
  organizationId: v.id('organizations'),
  content: v.string(), // Template content (HTML, Markdown, etc.)
  variables: v.array(v.string()), // Variables disponibles
  status: v.string(),
  category: v.string(),
  metadata: v.optional(v.record(v.string(), v.any()))
})
.index('by_organization', ['organizationId'])
.index('by_type', ['type'])
.index('by_status', ['status']);

// Créer ensuite convex/functions/documentTemplate.ts avec CRUD
```

---

#### 2.7 Settings (`dashboard/settings/`)

**Fichiers concernés:**
- `page.tsx` - Paramètres organisation

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.organization.getOrganization(organizationId)
api.functions.country.getAllCountries()
api.functions.service.getServicesByOrganization(organizationId)
api.functions.membership.getMembershipsByOrganization(organizationId)

// Mutations
api.functions.organization.updateOrganization(organizationId, ...fields)
api.functions.organization.addCountryToOrganization(organizationId, countryId)
api.functions.organization.removeCountryFromOrganization(organizationId, countryId)
```

---

#### 2.8 Competences/Skills Directory (`dashboard/competences/`)

**Fichiers concernés:**
- `page.tsx` - Annuaire des compétences

**Note:** Cette page semble utiliser `api.skillsDirectory.getDirectory.useQuery()`.

**Action requise:**
1. Vérifier si une table `skillsDirectory` existe ou doit être créée
2. Ou vérifier si c'est dérivé des profils avec `professionSituation`

**Recommandation:** Utiliser les profils existants avec enrichissement:

```typescript
// Query basée sur les profils
const profiles = useQuery(api.functions.profile.getAllProfiles);

const skillsDirectory = useMemo(() => {
  if (!profiles) return undefined;

  return profiles
    .filter(profile => profile.professionSituation?.profession)
    .map(profile => ({
      profileId: profile._id,
      name: `${profile.personal.firstName} ${profile.personal.lastName}`,
      profession: profile.professionSituation.profession,
      employer: profile.professionSituation.employer,
      workStatus: profile.professionSituation.workStatus,
      // ... autres champs
    }));
}, [profiles]);
```

Ou créer une query dédiée `getSkillsDirectory` dans `convex/functions/profile.ts`.

---

#### 2.9 Feedback (`dashboard/feedback/`)

**Fichiers concernés:**
- `page.tsx` - Formulaire de feedback

**Note:** Cette page est probablement juste un formulaire client-side avec soumission via mutation.

**Fonctions Convex potentielles:**
```typescript
// Si la table feedback existe
api.functions.feedback.createFeedback(userId, content, category, rating?)

// Ou utiliser les tickets
api.functions.ticket.createTicket({
  category: 'feedback',
  // ...
})
```

---

#### 2.10 Notifications (`dashboard/notifications/`)

**Fichiers concernés:**
- `page.tsx` - Liste des notifications

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.notification.getUserNotifications(userId, status?, limit?)
api.functions.notification.getNotification(notificationId)
api.functions.notification.getUnreadNotifications(userId)

// Mutations
api.functions.notification.markAsRead(notificationId)
api.functions.notification.markAllAsRead(userId)
api.functions.notification.deleteNotification(notificationId)
```

---

#### 2.11 Account (`dashboard/account/`)

**Fichiers concernés:**
- `page.tsx` - Gestion du compte

**Fonctions Convex à utiliser:**
```typescript
// Queries
api.functions.user.getUserByClerkId(clerkUserId)
api.functions.user.getUserProfile(userId)

// Mutations
api.functions.user.updateUser(userId, ...fields)
```

---

#### 2.12 Maps (`dashboard/maps/`)

**Fichiers concernés:**
- `associations/page.tsx`
- `enterprises/page.tsx`
- `movements/page.tsx`

**Note:** Ces pages semblent être des vues géographiques. Il faudra vérifier si elles utilisent des données spécifiques ou si elles sont dérivées d'autres tables.

**Recommandation:** Vérifier les dépendances et créer des queries adaptées si nécessaire.

---

## 🔄 Patterns de migration

### Pattern 1: Remplacement tRPC Query basique

**Avant:**
```typescript
import { api } from '@/trpc/react';

const { data, isLoading } = api.countries.getList.useQuery();
```

**Après:**
```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const data = useQuery(api.functions.country.getAllCountries);
const isLoading = data === undefined;
```

---

### Pattern 2: Remplacement tRPC Mutation

**Avant:**
```typescript
const updateMutation = api.countries.update.useMutation({
  onSuccess: () => {
    toast.success('Mise à jour réussie');
    refetch();
  },
  onError: (error) => {
    toast.error(error.message);
  }
});

updateMutation.mutate({ id, data });
```

**Après:**
```typescript
const updateCountry = useMutation(api.functions.country.updateCountry);

const handleUpdate = async () => {
  try {
    await updateCountry({
      countryId: id,
      ...data
    });
    toast.success('Mise à jour réussie');
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

### Pattern 3: Optimistic Updates

**Avant (tRPC):**
```typescript
const mutation = api.resource.update.useMutation({
  onMutate: async (variables) => {
    await utils.resource.list.cancel();
    const previousData = utils.resource.list.getData();

    utils.resource.list.setData((old) => ({
      ...old,
      items: old.items.map(item =>
        item.id === variables.id ? {...item, ...variables.data} : item
      )
    }));

    return { previousData };
  },
  onError: (error, variables, context) => {
    if (context?.previousData) {
      utils.resource.list.setData(context.previousData);
    }
  }
});
```

**Après (Convex):**
```typescript
import { useConvexMutation } from '@/lib/convex-hooks'; // À créer

const { mutate, isLoading } = useConvexMutation(
  api.functions.resource.update,
  {
    onSuccess: () => {
      // Convex réactive les queries automatiquement
      toast.success('Updated');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  }
);

// Note: Convex gère automatiquement la réactivité,
// donc les optimistic updates ne sont généralement pas nécessaires.
// Si vous avez vraiment besoin d'optimistic updates:

const [optimisticData, setOptimisticData] = useState(null);
const actualData = useQuery(api.functions.resource.getAll);
const displayData = optimisticData || actualData;

const handleUpdate = async (data) => {
  // Mise à jour optimiste
  setOptimisticData(prev => ({
    ...prev,
    // ... mise à jour
  }));

  try {
    await mutate(data);
    setOptimisticData(null); // Clear optimistic data
  } catch (error) {
    setOptimisticData(null); // Rollback
    toast.error(error.message);
  }
};
```

**Recommandation:** Dans la plupart des cas, Convex met à jour automatiquement et suffisamment rapidement pour ne pas avoir besoin d'optimistic updates.

---

### Pattern 4: Filtrage et pagination côté client

**Convex favorise le filtrage côté client pour les petites à moyennes listes.**

```typescript
function ResourcesPage() {
  // Fetch all data (ou avec limit large)
  const allData = useQuery(api.functions.resource.getAll, { limit: 500 });

  // État des filtres (depuis URL params)
  const { filters, setFilters } = useTableSearchParams();

  // Filtrage côté client
  const filteredData = useMemo(() => {
    if (!allData) return undefined;

    let result = allData;

    if (filters.search) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(item => filters.status.includes(item.status));
    }

    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }

    return result;
  }, [allData, filters]);

  // Pagination côté client
  const paginatedData = useMemo(() => {
    if (!filteredData) return undefined;
    const start = (filters.page - 1) * filters.limit;
    return filteredData.slice(start, start + filters.limit);
  }, [filteredData, filters.page, filters.limit]);

  const totalPages = Math.ceil((filteredData?.length || 0) / filters.limit);

  return (
    <DataTable
      data={paginatedData}
      columns={columns}
      pagination={{
        page: filters.page,
        limit: filters.limit,
        total: filteredData?.length || 0,
        totalPages
      }}
      onPaginationChange={(page, limit) =>
        setFilters({ page, limit })
      }
    />
  );
}
```

**Important:** Si vous avez **des milliers d'éléments**, créez des queries Convex avec filtrage serveur pour éviter de tout charger côté client.

---

### Pattern 5: Enrichissement de données (Relations)

**Problème:** Convex n'a pas de joins automatiques comme Prisma.

**Solution 1: Fetches parallèles dans le composant**

```typescript
function RequestPage({ requestId }) {
  const request = useQuery(api.functions.request.getRequest, { requestId });
  const service = useQuery(
    api.functions.service.getService,
    request ? { serviceId: request.serviceId } : 'skip'
  );
  const requester = useQuery(
    api.functions.user.getUser,
    request ? { userId: request.requesterId } : 'skip'
  );

  if (!request || !service || !requester) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      <h1>Request {request.number}</h1>
      <p>Service: {service.name}</p>
      <p>Requester: {requester.firstName} {requester.lastName}</p>
    </div>
  );
}
```

**Problème:** Cela crée plusieurs queries (mais Convex les optimise).

**Solution 2: Créer une query enrichie (RECOMMANDÉ)**

```typescript
// Dans convex/functions/request.ts
export const getEnrichedRequest = query({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    const [service, requester, profile, assignedAgent] = await Promise.all([
      ctx.db.get(request.serviceId),
      ctx.db.get(request.requesterId),
      request.profileId ? ctx.db.get(request.profileId) : null,
      request.assignedAgentId ? ctx.db.get(request.assignedAgentId) : null
    ]);

    return {
      ...request,
      service,
      requester,
      profile,
      assignedAgent
    };
  }
});

// Dans le composant
const data = useQuery(api.functions.request.getEnrichedRequest, { requestId });
```

**Recommandation:** Créez des queries enrichies pour toutes les vues de détails et listes qui nécessitent des relations.

---

### Pattern 6: Gestion du loading et des erreurs

**Pattern Convex:**
```typescript
function Component() {
  const data = useQuery(api.functions.resource.get, { id });

  // data === undefined → loading
  // data === null → not found (selon votre implémentation)
  // data === object → success

  if (data === undefined) {
    return <LoadingSkeleton />;
  }

  if (data === null) {
    return <NotFound />;
  }

  return <div>{data.name}</div>;
}
```

**Pattern avec error boundary:**
```typescript
// Convex throw des erreurs qui peuvent être catchées
function Component() {
  try {
    const data = useQuery(api.functions.resource.get, { id });

    if (data === undefined) return <LoadingSkeleton />;

    return <div>{data.name}</div>;
  } catch (error) {
    return <ErrorDisplay error={error} />;
  }
}
```

---

### Pattern 7: Bulk Actions

**Avant (tRPC):**
```typescript
const bulkUpdate = async (ids: string[], data: UpdateData) => {
  await Promise.all(
    ids.map(id => updateMutation.mutateAsync({ id, data }))
  );
  toast.success(`${ids.length} items updated`);
  refetch();
};
```

**Après (Convex):**
```typescript
const updateItem = useMutation(api.functions.resource.update);

const handleBulkUpdate = async (ids: Id<'resources'>[], data: UpdateData) => {
  try {
    await Promise.all(
      ids.map(id => updateItem({ resourceId: id, ...data }))
    );
    toast.success(`${ids.length} items updated`);
    // Pas besoin de refetch, Convex met à jour automatiquement
  } catch (error) {
    toast.error('Bulk update failed');
  }
};
```

**Option: Créer une mutation bulk dans Convex (MEILLEUR)**

```typescript
// Dans convex/functions/resource.ts
export const bulkUpdateResources = mutation({
  args: {
    resourceIds: v.array(v.id('resources')),
    data: v.object({
      status: v.optional(statusValidator),
      // ... autres champs
    })
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.resourceIds.map(id =>
        ctx.db.patch(id, args.data)
      )
    );

    return { updated: args.resourceIds.length };
  }
});

// Dans le composant
const bulkUpdate = useMutation(api.functions.resource.bulkUpdateResources);

const handleBulkUpdate = async () => {
  try {
    const result = await bulkUpdate({
      resourceIds: selectedIds,
      data: updateData
    });
    toast.success(`${result.updated} items updated`);
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

### Pattern 8: Server Actions → Convex

**Avant (Server Actions):**
```typescript
// app/actions/countries.ts
'use server';

export async function getCountries() {
  const countries = await prisma.country.findMany();
  return countries;
}

// page.tsx
import { getCountries } from '@/actions/countries';

export default async function Page() {
  const countries = await getCountries();
  return <CountriesList countries={countries} />;
}
```

**Après (Convex):**
```typescript
// page.tsx (client component)
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function Page() {
  const countries = useQuery(api.functions.country.getAllCountries);

  if (countries === undefined) {
    return <LoadingSkeleton />;
  }

  return <CountriesList countries={countries} />;
}
```

**Note:** Convex fonctionne principalement côté client. Si vous avez vraiment besoin de Server Components, vous pouvez utiliser `fetchQuery` de Convex:

```typescript
// page.tsx (server component)
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export default async function Page() {
  const countries = await fetchQuery(api.functions.country.getAllCountries);

  return <CountriesList countries={countries} />;
}
```

**Mais** la recommandation Convex est d'utiliser les client components avec `useQuery` pour bénéficier de la réactivité.

---

### Pattern 9: File Upload

**Pattern Convex pour l'upload de fichiers:**

```typescript
'use client';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function UploadForm() {
  const generateUploadUrl = useMutation(api.functions.file.generateUploadUrl);
  const createDocument = useMutation(api.functions.document.createDocument);

  const handleUpload = async (file: File) => {
    // 1. Générer une URL de upload
    const uploadUrl = await generateUploadUrl();

    // 2. Upload le fichier
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file
    });

    const { storageId } = await result.json();

    // 3. Créer le document dans la DB
    await createDocument({
      storageId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      type: 'passport',
      ownerId: profileId,
      ownerType: 'profile'
    });

    toast.success('File uploaded');
  };

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
    />
  );
}
```

**Fonctions Convex nécessaires:**
```typescript
// convex/functions/file.ts
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  }
});

export const getFileUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  }
});
```

---

### Pattern 10: Real-time Updates

**Avantage de Convex:** Les queries sont automatiquement réactives.

```typescript
function RequestsList() {
  // Cette query se met à jour automatiquement quand les données changent
  const requests = useQuery(api.functions.request.getAllRequests);

  // Pas besoin de polling, websockets, ou refetch manuel
  // Si un autre utilisateur met à jour une request,
  // cette liste se met à jour automatiquement

  return <DataTable data={requests} columns={columns} />;
}
```

**Cas d'usage:**
- Liste de demandes qui se met à jour quand un agent accepte une demande
- Notifications en temps réel
- Status de requête qui change
- Compteurs qui s'incrémentent

---

## 📅 Ordre de migration recommandé

Migrer dans cet ordre pour minimiser les risques et maximiser l'apprentissage :

### Phase 1: Pages simples (1-2 jours)
1. ✅ **Feedback** - Page formulaire simple
2. ✅ **Notifications** - Lecture simple avec mutations basiques
3. ✅ **Account** - Gestion du compte utilisateur

**Objectif:** Se familiariser avec les patterns de base Convex.

---

### Phase 2: CRUD basique (2-3 jours)
4. ✅ **Countries** - CRUD complet, bon exemple pour apprendre les mutations
5. ✅ **Services** - CRUD avec relations (organizations)

**Objectif:** Maîtriser les mutations, updates, et relations basiques.

---

### Phase 3: Listes avec filtres (3-4 jours)
6. ✅ **Agents** - Liste avec filtres complexes et enrichissement
7. ✅ **Organizations** - Liste avec relations multiples
8. ✅ **Users** - Liste avec filtres multiples et recherche

**Objectif:** Maîtriser le filtrage côté client et l'enrichissement de données.

---

### Phase 4: Domaines complexes (4-5 jours)
9. ✅ **Appointments** - Gestion de créneaux, disponibilités, conflits
10. ✅ **Profiles** - Export Excel, images, documents, validation
11. ✅ **Requests** - Bulk actions, workflow, assignation

**Objectif:** Gérer les cas complexes avec workflows et relations multiples.

---

### Phase 5: Pages spécialisées (2-3 jours)
12. ✅ **Tickets** - Système de ticketing
13. ✅ **Competences** - Annuaire des compétences
14. ✅ **Document Templates** - Gestion de templates (à créer)
15. ✅ **Settings** - Configuration organisation
16. ✅ **Maps** - Vues géographiques

**Objectif:** Finaliser la migration complète.

---

### Phase 6: Nettoyage (1-2 jours)
17. ✅ Supprimer les imports tRPC
18. ✅ Supprimer les hooks tRPC personnalisés
19. ✅ Supprimer les server actions Prisma
20. ✅ Supprimer les types Prisma
21. ✅ Mettre à jour les tests

---

## ✅ Checklist de migration par page

Pour chaque page à migrer, suivre cette checklist :

### Préparation
- [ ] Identifier toutes les queries tRPC utilisées
- [ ] Identifier toutes les mutations tRPC utilisées
- [ ] Identifier les server actions Prisma
- [ ] Lister les relations/enrichissements nécessaires
- [ ] Vérifier si les fonctions Convex existent

### Création des fonctions Convex (si nécessaire)
- [ ] Créer les queries manquantes dans `convex/functions/`
- [ ] Créer les mutations manquantes
- [ ] Créer les queries enrichies pour les relations
- [ ] Tester les fonctions avec le Convex Dashboard

### Migration du code
- [ ] Remplacer les imports tRPC par Convex
  ```diff
  - import { api } from '@/trpc/react';
  + import { useQuery, useMutation } from 'convex/react';
  + import { api } from '@/convex/_generated/api';
  ```
- [ ] Remplacer `useQuery` tRPC par `useQuery` Convex
  ```diff
  - const { data, isLoading } = api.resource.get.useQuery({ id });
  + const data = useQuery(api.functions.resource.get, { id });
  + const isLoading = data === undefined;
  ```
- [ ] Remplacer les mutations tRPC par `useMutation` Convex
  ```diff
  - const mutation = api.resource.update.useMutation();
  - mutation.mutate({ id, data });
  + const update = useMutation(api.functions.resource.update);
  + await update({ resourceId: id, ...data });
  ```
- [ ] Adapter les types
  ```diff
  - import type { Country } from '@prisma/client';
  + import type { Doc } from '@/convex/_generated/dataModel';
  + type Country = Doc<'countries'>;
  ```
- [ ] Supprimer les `refetch()` manuels (Convex réactif)
- [ ] Adapter la gestion du loading
  ```typescript
  if (data === undefined) return <LoadingSkeleton />;
  if (data === null) return <NotFound />;
  ```
- [ ] Adapter les optimistic updates (généralement pas nécessaire avec Convex)

### Tests
- [ ] Tester le chargement initial
- [ ] Tester les filtres
- [ ] Tester la pagination
- [ ] Tester les mutations (create, update, delete)
- [ ] Tester les bulk actions
- [ ] Tester les cas d'erreur
- [ ] Tester le loading state
- [ ] Vérifier la réactivité en temps réel

### Nettoyage
- [ ] Supprimer les hooks tRPC personnalisés
- [ ] Supprimer les server actions Prisma
- [ ] Supprimer les imports inutilisés
- [ ] Vérifier qu'il n'y a plus de références à tRPC/Prisma
- [ ] Mettre à jour la documentation si nécessaire

---

## 🧪 Tests et validation

### Tests unitaires

Pour chaque fonction Convex, tester :
1. **Query avec données valides** → retourne les bonnes données
2. **Query sans données** → retourne `null` ou `[]`
3. **Query avec ID invalide** → retourne `null` ou throw error
4. **Mutation avec données valides** → succès
5. **Mutation avec données invalides** → throw error avec message clair
6. **Filtrage** → retourne seulement les données filtrées
7. **Pagination** → retourne le bon nombre d'éléments

### Tests d'intégration

Pour chaque page migrée :
1. **Chargement initial** → affiche les données correctement
2. **Loading state** → affiche un skeleton pendant le chargement
3. **Empty state** → affiche un message quand il n'y a pas de données
4. **Filtrage** → applique les filtres correctement
5. **Recherche** → trouve les bonnes données
6. **Pagination** → navigue entre les pages
7. **Création** → crée une nouvelle entrée
8. **Édition** → met à jour une entrée existante
9. **Suppression** → supprime une entrée
10. **Bulk actions** → opère sur plusieurs entrées
11. **Réactivité** → se met à jour automatiquement quand les données changent
12. **Erreurs** → affiche les erreurs correctement

### Tests de performance

1. **Temps de chargement initial** < 2s
2. **Temps de filtrage/recherche** < 500ms
3. **Temps de mutation** < 1s
4. **Utilisation mémoire** raisonnable
5. **Nombre de re-renders** optimisé avec `useMemo`

### Validation manuelle

Avant de considérer une page comme "migrée" :
- [ ] Toutes les features fonctionnent comme avant
- [ ] Aucun appel tRPC ou Prisma restant
- [ ] Performance égale ou meilleure qu'avant
- [ ] UI/UX identique ou améliorée
- [ ] Pas d'erreurs dans la console
- [ ] Fonctionne sur mobile et desktop

---

## 🚀 Recommandations finales

### 1. Créer des queries enrichies

Pour éviter les N+1 queries et simplifier le code, créez des queries Convex qui retournent les données déjà enrichies :

```typescript
// ✅ BON: Query enrichie
export const getEnrichedRequests = query({
  args: { status: v.optional(requestStatusValidator) },
  handler: async (ctx, args) => {
    const requests = await getAllRequests(ctx, args);

    return await Promise.all(
      requests.map(async (request) => ({
        ...request,
        service: await ctx.db.get(request.serviceId),
        requester: await ctx.db.get(request.requesterId),
        profile: request.profileId ? await ctx.db.get(request.profileId) : null,
      }))
    );
  }
});

// ❌ ÉVITER: Multiple queries côté client
const requests = useQuery(api.functions.request.getAll);
const services = useQuery(api.functions.service.getAll);
// ... puis faire le join manuellement
```

### 2. Utiliser useMemo pour le filtrage

Pour éviter les re-calculs inutiles :

```typescript
const filteredData = useMemo(() => {
  if (!data) return undefined;
  return data.filter(/* ... */);
}, [data, filters]);
```

### 3. Créer des hooks personnalisés réutilisables

```typescript
// hooks/use-enriched-requests.ts
export function useEnrichedRequests(filters?: RequestFilters) {
  const data = useQuery(api.functions.request.getEnrichedRequests, filters);

  const filteredData = useMemo(() => {
    if (!data) return undefined;
    // Apply client-side filters
    return applyFilters(data, filters);
  }, [data, filters]);

  return {
    requests: filteredData,
    isLoading: filteredData === undefined,
    isEmpty: filteredData?.length === 0
  };
}
```

### 4. Gérer les erreurs de manière cohérente

```typescript
// lib/error-handler.ts
export function handleConvexError(error: unknown) {
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
  console.error('Convex error:', error);
}

// Dans les composants
try {
  await mutation({ ... });
} catch (error) {
  handleConvexError(error);
}
```

### 5. Créer des types helpers

```typescript
// lib/convex-types.ts
import type { Doc } from '@/convex/_generated/dataModel';

export type Country = Doc<'countries'>;
export type Request = Doc<'requests'>;
export type Profile = Doc<'profiles'>;
export type User = Doc<'users'>;

export type EnrichedRequest = Request & {
  service: Doc<'services'> | null;
  requester: Doc<'users'>;
  profile: Doc<'profiles'> | null;
};
```

### 6. Documenter les queries manquantes

Si une fonctionnalité nécessite une query Convex qui n'existe pas encore, créer un TODO clair :

```typescript
// TODO: Créer convex/functions/request.ts → getEnrichedRequests
// Pour éviter les N+1 queries et simplifier le code
// Args: status?, assignedAgentId?, limit?
// Returns: Request[] avec service, requester, profile enrichis
```

---

## 📝 Exemple complet de migration

Voici un exemple complet de migration d'une page :

### Avant (tRPC + Prisma)

```typescript
// dashboard/requests/page.tsx
'use client';

import { api } from '@/trpc/react';
import { DataTable } from '@/components/data-table';
import { useTableSearchParams } from '@/hooks/use-table-search-params';

export default function RequestsPage() {
  const { filters } = useTableSearchParams();

  const { data, isLoading, refetch } = api.requests.getList.useQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status,
    priority: filters.priority
  });

  const updateMutation = api.requests.update.useMutation({
    onSuccess: () => {
      toast.success('Updated');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const columns = [
    // ... columns
  ];

  if (isLoading) return <LoadingSkeleton />;

  return (
    <PageContainer title="Requests">
      <DataTable
        data={data?.items || []}
        columns={columns}
        pagination={data?.pagination}
      />
    </PageContainer>
  );
}
```

### Après (Convex)

```typescript
// dashboard/requests/page.tsx
'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DataTable } from '@/components/data-table';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { useMemo } from 'react';
import type { Doc } from '@/convex/_generated/dataModel';

export default function RequestsPage() {
  const { filters, setFilters } = useTableSearchParams();

  // Fetch all requests (ou avec un limit élevé)
  const allRequests = useQuery(api.functions.request.getAllRequests, {
    status: filters.status?.[0], // Convex prend un seul status
    limit: 500
  });

  // Filtrage côté client
  const filteredRequests = useMemo(() => {
    if (!allRequests) return undefined;

    let result = allRequests;

    // Filtre multi-status
    if (filters.status && filters.status.length > 0) {
      result = result.filter(r => filters.status.includes(r.status));
    }

    // Recherche textuelle
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(r =>
        r.number.toLowerCase().includes(search)
        // Note: Enrichir avec profile.firstName/lastName si nécessaire
      );
    }

    // Filtre priorité
    if (filters.priority) {
      result = result.filter(r => r.priority === filters.priority);
    }

    return result;
  }, [allRequests, filters]);

  // Pagination côté client
  const paginatedRequests = useMemo(() => {
    if (!filteredRequests) return undefined;
    const start = (filters.page - 1) * filters.limit;
    return filteredRequests.slice(start, start + filters.limit);
  }, [filteredRequests, filters.page, filters.limit]);

  const totalPages = Math.ceil((filteredRequests?.length || 0) / filters.limit);

  // Mutation
  const updateRequest = useMutation(api.functions.request.updateRequest);

  const handleUpdate = async (requestId: Id<'requests'>, data: UpdateData) => {
    try {
      await updateRequest({ requestId, ...data });
      toast.success('Updated');
      // Pas besoin de refetch, Convex met à jour automatiquement
    } catch (error) {
      toast.error(error.message);
    }
  };

  const columns = [
    // ... columns adaptés pour utiliser Doc<'requests'>
  ];

  // Loading state
  if (paginatedRequests === undefined) {
    return (
      <PageContainer title="Requests">
        <LoadingSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Requests">
      <DataTable
        data={paginatedRequests}
        columns={columns}
        pagination={{
          page: filters.page,
          limit: filters.limit,
          total: filteredRequests.length,
          totalPages
        }}
        onPaginationChange={(page, limit) => setFilters({ page, limit })}
      />
    </PageContainer>
  );
}
```

**Améliorations possibles:**

1. Créer une query enrichie pour éviter de fetcher les relations séparément
2. Créer un hook `useFilteredRequests` pour réutiliser la logique de filtrage
3. Ajouter un debounce sur la recherche textuelle

---

## 🎓 Ressources

- [Convex Documentation](https://docs.convex.dev/)
- [Convex React Guide](https://docs.convex.dev/client/react)
- [Convex Best Practices](https://docs.convex.dev/production/best-practices)
- Pages my-space déjà migrées comme référence

---

## 📞 Support

Si vous rencontrez des problèmes pendant la migration :
1. Consulter les pages my-space comme référence
2. Vérifier la documentation Convex
3. Tester les fonctions dans le Convex Dashboard
4. Créer des issues dans le repo avec des détails précis

---

**Bonne migration ! 🚀**
