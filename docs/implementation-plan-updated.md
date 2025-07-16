# Plan d'implémentation FINAL - Interface Services Consulaires Optimisée

## 📋 Vue d'ensemble des modifications

Ce plan intègre toutes les optimisations finales :
- ✅ Fusion `/my-space` et `/my-space/services` 
- ✅ Header non-centré (style SaaS professionnel)
- ✅ Progression verticale mobile optimisée
- ✅ Section profil épurée (v15)
- ✅ Design responsive et fonctionnel

## 🏗️ Architecture finale

### 1. Routes à modifier

```typescript
// src/schemas/routes.ts (modifications)
user: {
  base: '/my-space' as Route<string>,
  dashboard: '/my-space' as Route<string>, // Page unifiée
  // Redirection de l'ancien /my-space/services vers /my-space
  services: '/my-space' as Route<string>, // Redirection
  contact_support: '/my-space/contact' as Route<string>,
  services_history: '/my-space/history' as Route<string>,
  // ... autres routes conservées
}
```

### 2. Structure des fichiers mise à jour

```
src/app/(authenticated)/my-space/
├── page.tsx                    # Page principale unifiée (MODIFIER)
├── contact/
│   └── page.tsx               # Page contact (CRÉER)
├── history/
│   └── page.tsx               # Page historique (CRÉER)
├── services/                   # OBSOLÈTE - redirection
│   └── page.tsx               # Redirection vers /my-space
├── request/
│   └── [id]/
│       └── page.tsx           # Page détails (MODIFIER)
└── components/
    ├── unified-dashboard.tsx   # Composant principal (CRÉER)
    ├── current-request-card.tsx # Demande en cours (CRÉER)
    ├── quick-stats.tsx         # Stats rapides (CRÉER)
    ├── quick-actions.tsx       # Actions rapides (CRÉER)
    ├── contact-methods.tsx     # Méthodes contact (CRÉER)
    ├── requests-history.tsx    # Historique (CRÉER)
    └── request-progress-enhanced.tsx # Progression (CRÉER)
```

## 🔧 Phase 1: Page principale unifiée

### 1.1 Modification de `/my-space/page.tsx`

```typescript
// src/app/(authenticated)/my-space/page.tsx
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { UnifiedDashboard } from './components/unified-dashboard';
import { PageContainer } from '@/components/layouts/page-container';

export const metadata = {
  title: 'Mon Espace Consulaire',
  description: 'Gérez vos demandes et accédez à tous vos services consulaires',
};

export default async function MySpacePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <PageContainer>
      <UnifiedDashboard userId={user.id} />
    </PageContainer>
  );
}
```

### 1.2 Composant UnifiedDashboard

```typescript
// src/app/(authenticated)/my-space/components/unified-dashboard.tsx
'use client';

import { useUserServiceRequests, useUserServiceStats } from '@/hooks/use-services';
import { CurrentRequestCard } from './current-request-card';
import { QuickStats } from './quick-stats';
import { QuickActions } from './quick-actions';
import { RecentHistory } from './recent-history';
import { EmptyState } from './empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

interface UnifiedDashboardProps {
  userId: string;
}

export function UnifiedDashboard({ userId }: UnifiedDashboardProps) {
  const { requests, isLoading, error, refetch } = useUserServiceRequests();
  const { stats } = useUserServiceStats();

  if (isLoading) {
    return <UnifiedDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Erreur lors du chargement</p>
        <Button variant="outline" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  // Filtrer les demandes par statut
  const currentRequests = requests.filter(req => 
    ['SUBMITTED', 'VALIDATED', 'PROCESSING'].includes(req.status)
  );
  const currentRequest = currentRequests.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  return (
    <div className="space-y-6">
      {/* Header style SaaS */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-left">Mon Espace Consulaire</h1>
          <p className="text-muted-foreground text-left">
            Gérez vos demandes et accédez à tous vos services
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.user.contact_support}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Aide
            </Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.user.service_available}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Link>
          </Button>
        </div>
      </div>

      {/* Section profil utilisateur v15 */}
      <UserOverview stats={stats} />

      {/* Demande en cours ou état vide */}
      {currentRequest ? (
        <CurrentRequestCard request={currentRequest} />
      ) : (
        <EmptyState />
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
        </div>
        <div className="space-y-6">
          <RecentHistory requests={requests.slice(0, 3)} />
        </div>
      </div>
    </div>
  );
}

function UnifiedDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <LoadingSkeleton className="h-8 w-64 mb-2" />
          <LoadingSkeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <LoadingSkeleton className="h-9 w-24" />
          <LoadingSkeleton className="h-9 w-24" />
          <LoadingSkeleton className="h-9 w-32" />
        </div>
      </div>
      <LoadingSkeleton className="h-32 w-full" />
      <LoadingSkeleton className="h-64 w-full" />
    </div>
  );
}
```

### 1.3 Composant UserOverview (v15)

```typescript
// src/app/(authenticated)/my-space/components/user-overview.tsx
'use client';

import { Card } from '@/components/ui/card';

interface UserOverviewProps {
  stats: {
    inProgress: number;
    completed: number;
    pending: number;
    appointments: number;
  };
}

export function UserOverview({ stats }: UserOverviewProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-lg">
            JD
          </div>
          <div>
            <h3 className="font-semibold text-lg">Jean Dupont</h3>
            <p className="text-sm text-muted-foreground">Carte consulaire : #GAB123456</p>
            <p className="text-sm text-muted-foreground">Passeport expire le 15/03/2026</p>
            <p className="text-sm text-muted-foreground">Inscrit depuis mars 2024</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground font-medium">EN COURS</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground font-medium">TERMINÉES</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground font-medium">EN ATTENTE</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">{stats.appointments}</div>
            <div className="text-xs text-muted-foreground font-medium">RDV PRÉVUS</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

## 🔧 Phase 2: Composant CurrentRequestCard

### 2.1 Progression optimisée mobile/desktop

```typescript
// src/app/(authenticated)/my-space/components/current-request-card.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, MessageSquare, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

interface CurrentRequestCardProps {
  request: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    service: { name: string };
    assignedTo?: { name: string };
  };
}

export function CurrentRequestCard({ request }: CurrentRequestCardProps) {
  const getProgress = (status: string) => {
    const progressMap = {
      DRAFT: 0,
      SUBMITTED: 20,
      VALIDATED: 40,
      PROCESSING: 60,
      COMPLETED: 100,
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      PROCESSING: 'bg-amber-500/20 text-amber-700 border-amber-300',
      VALIDATED: 'bg-blue-500/20 text-blue-700 border-blue-300',
      COMPLETED: 'bg-green-500/20 text-green-700 border-green-300',
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-500/20 text-gray-700 border-gray-300';
  };

  const getSteps = () => [
    { label: 'Demande soumise', completed: true, date: '06/07/2025 - 14h30' },
    { label: 'Documents vérifiés', completed: getProgress(request.status) >= 40, date: '07/07/2025 - 10h15' },
    { label: 'En cours de traitement', current: request.status === 'PROCESSING', agent: request.assignedTo?.name },
    { label: 'Validation finale', completed: false, status: 'En attente' },
    { label: 'Demande terminée', completed: request.status === 'COMPLETED', status: 'Prête pour retrait' },
  ];

  return (
    <Card className="overflow-hidden">
      {/* Version desktop */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 hidden md:block">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">{request.service.name}</h2>
            <p className="text-blue-100 text-sm">
              Demande soumise {formatDistanceToNow(new Date(request.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
              {request.assignedTo && ` • Assignée à ${request.assignedTo.name}`}
            </p>
          </div>
          <Badge className={`${getStatusColor(request.status)} text-xs`}>
            {request.status === 'PROCESSING' ? 'En traitement' : request.status}
          </Badge>
        </div>

        <div className="mb-6">
          <Progress value={getProgress(request.status)} className="h-2 mb-3" />
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-center">✓ Soumise</div>
            <div className="text-center">✓ Vérifiée</div>
            <div className="text-center font-semibold">• En traitement</div>
            <div className="text-center opacity-70">Validation</div>
            <div className="text-center opacity-70">Terminée</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="secondary" className="bg-white text-blue-900">
            <Link href={ROUTES.user.service_request_details(request.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir les détails
            </Link>
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contacter l'agent
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <FileText className="mr-2 h-4 w-4" />
            Ajouter un document
          </Button>
        </div>
      </div>

      {/* Version mobile */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 md:hidden">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold mb-1">{request.service.name}</h2>
          <p className="text-blue-100 text-xs mb-2">
            Demande soumise {formatDistanceToNow(new Date(request.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
          <Badge className={`${getStatusColor(request.status)} text-xs`}>
            {request.status === 'PROCESSING' ? 'En traitement' : request.status}
          </Badge>
        </div>

        {/* Progression verticale mobile */}
        <div className="space-y-2 mb-4">
          {getSteps().map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                step.completed
                  ? 'bg-green-500/20 border-green-400'
                  : step.current
                  ? 'bg-white/20 border-white'
                  : 'bg-white/5 border-white/30'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                    ? 'bg-white text-blue-900'
                    : 'bg-white/30 text-white'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-xs opacity-80">
                  {step.date || step.agent ? `Par ${step.agent}` : step.status || 'En attente'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full bg-white text-blue-900">
            <Link href={ROUTES.user.service_request_details(request.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir les détails
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="border-white/30 text-white">
              <MessageSquare className="mr-1 h-4 w-4" />
              Contacter
            </Button>
            <Button variant="outline" className="border-white/30 text-white">
              <FileText className="mr-1 h-4 w-4" />
              Document
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

## 🔧 Phase 3: Pages secondaires

### 3.1 Page contact

```typescript
// src/app/(authenticated)/my-space/contact/page.tsx
import { PageContainer } from '@/components/layouts/page-container';
import { ContactMethods } from '../components/contact-methods';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export const metadata = {
  title: 'Nous contacter - Mon Espace Consulaire',
  description: 'Contactez notre équipe pour toute assistance consulaire',
};

export default function ContactPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.user.dashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nous contacter</h1>
            <p className="text-muted-foreground">
              Choisissez le moyen de contact qui vous convient le mieux
            </p>
          </div>
        </div>

        <ContactMethods />
      </div>
    </PageContainer>
  );
}
```

### 3.2 Page historique

```typescript
// src/app/(authenticated)/my-space/history/page.tsx
import { PageContainer } from '@/components/layouts/page-container';
import { RequestsHistory } from '../components/requests-history';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export const metadata = {
  title: 'Historique des demandes - Mon Espace Consulaire',
  description: 'Consultez l\'historique complet de vos demandes consulaires',
};

export default function HistoryPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.user.dashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Historique des demandes</h1>
            <p className="text-muted-foreground">
              Retrouvez toutes vos demandes passées et en cours
            </p>
          </div>
        </div>

        <RequestsHistory />
      </div>
    </PageContainer>
  );
}
```

### 3.3 Redirection services

```typescript
// src/app/(authenticated)/my-space/services/page.tsx
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

export default function ServicesRedirectPage() {
  redirect(ROUTES.user.dashboard);
}
```

## 🔧 Phase 4: Hooks étendus

### 4.1 Extension useServices

```typescript
// src/hooks/use-services.ts (ajouts)

/**
 * Hook pour obtenir les statistiques des demandes utilisateur
 */
export function useUserServiceStats() {
  const { data: requests, isLoading, error } = api.services.getUserRequests.useQuery();
  
  const stats = useMemo(() => {
    if (!requests) return { inProgress: 0, completed: 0, pending: 0, appointments: 2 };
    
    return {
      inProgress: requests.filter(req => 
        ['SUBMITTED', 'VALIDATED', 'PROCESSING'].includes(req.status)
      ).length,
      completed: requests.filter(req => req.status === 'COMPLETED').length,
      pending: requests.filter(req => req.status === 'DRAFT').length,
      appointments: 2, // À remplacer par un vrai hook pour les RDV
    };
  }, [requests]);

  return {
    stats,
    isLoading,
    error,
  };
}

/**
 * Hook pour obtenir la demande en cours la plus récente
 */
export function useCurrentRequest() {
  const { data: requests, isLoading, error } = api.services.getUserRequests.useQuery();
  
  const currentRequest = useMemo(() => {
    if (!requests) return null;
    
    const activeRequests = requests.filter(req => 
      ['SUBMITTED', 'VALIDATED', 'PROCESSING'].includes(req.status)
    );
    
    return activeRequests.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0] || null;
  }, [requests]);

  return {
    currentRequest,
    isLoading,
    error,
  };
}
```

## 🔧 Phase 5: Traductions

### 5.1 Messages français étendus

```typescript
// src/i18n/messages/fr/services.ts (ajouts)
export default {
  // ... existant ...
  unified_dashboard: {
    title: 'Mon Espace Consulaire',
    subtitle: 'Gérez vos demandes et accédez à tous vos services',
    current_request: 'Demande en cours',
    no_current_request: 'Aucune demande en cours',
    empty_state: {
      title: 'Aucune demande en cours',
      description: 'Vous n\'avez actuellement aucune demande de service en cours de traitement.',
      action: 'Créer ma première demande',
    },
    quick_actions: {
      title: 'Services et Actions',
      certificate_life: 'Certificat de vie',
      certificate_life_desc: 'Obtenez votre certificat de vie pour vos démarches de pension',
      appointment: 'Prendre un rendez-vous',
      appointment_desc: 'Planifiez votre visite au consulat',
      legalization: 'Légalisation de document',
      legalization_desc: 'Faites légaliser vos documents officiels',
      profile_update: 'Mise à jour du profil',
      profile_update_desc: 'Complétez ou modifiez vos informations personnelles',
      attestations: 'Attestations diverses',
      attestations_desc: 'Demandez vos attestations de résidence, revenus, etc.',
      support: 'Support consulaire',
      support_desc: 'Contactez notre équipe pour toute assistance',
    },
    recent_history: {
      title: 'Historique récent',
      view_all: 'Voir tout',
    },
    user_overview: {
      passport_expires: 'Passeport expire le',
      member_since: 'Inscrit depuis',
      consular_card: 'Carte consulaire',
    },
  },
  contact: {
    title: 'Nous contacter',
    subtitle: 'Choisissez le moyen de contact qui vous convient le mieux',
    methods: {
      emergency: 'Assistance d\'urgence',
      emergency_desc: 'Pour les situations d\'urgence uniquement',
      chat: 'Chat en direct',
      chat_desc: 'Assistance immédiate par chat',
      email: 'Email',
      email_desc: 'Réponse sous 24-48h',
      visit: 'Se rendre au consulat',
      visit_desc: 'Rendez-vous sur place',
    },
    actions: {
      call_now: 'Appeler maintenant',
      start_chat: 'Démarrer le chat',
      send_email: 'Envoyer un email',
      book_appointment: 'Prendre RDV',
    },
    info: {
      title: 'Informations de contact',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      hours: 'Horaires',
    },
  },
  history: {
    title: 'Historique des demandes',
    subtitle: 'Retrouvez toutes vos demandes passées et en cours',
    filters: {
      search_placeholder: 'Rechercher par nom ou ID...',
      all_statuses: 'Tous les statuts',
      all_services: 'Tous les services',
      in_progress: 'En cours',
      completed: 'Terminées',
      pending: 'En attente',
    },
    empty: {
      no_results: 'Aucune demande trouvée avec ces filtres',
      reset_filters: 'Réinitialiser les filtres',
    },
    actions: {
      view_details: 'Voir les détails',
      download: 'Télécharger',
      contact_agent: 'Contacter l\'agent',
    },
  },
  progress: {
    steps: {
      submitted: 'Demande soumise',
      verified: 'Documents vérifiés',
      processing: 'En cours de traitement',
      validation: 'Validation finale',
      completed: 'Demande terminée',
    },
    status: {
      waiting: 'En attente',
      ready_for_pickup: 'Prête pour retrait',
      by_agent: 'Par {agent}',
    },
  },
} as const;
```

## 🚀 Plan de déploiement optimisé

### Étape 1: Préparation (Jour 1)
1. ✅ Créer la branche `feature/unified-dashboard`
2. ✅ Sauvegarder les routes actuelles
3. ✅ Créer les nouveaux composants UI

### Étape 2: Core Implementation (Jour 2-3)
1. ✅ Modifier `/my-space/page.tsx`
2. ✅ Créer `UnifiedDashboard` avec header SaaS
3. ✅ Implémenter `CurrentRequestCard` avec progression mobile/desktop
4. ✅ Intégrer `UserOverview` v15

### Étape 3: Pages secondaires (Jour 4)
1. ✅ Créer pages contact et historique
2. ✅ Implémenter redirections services
3. ✅ Tester navigation complète

### Étape 4: Hooks et optimisations (Jour 5)
1. ✅ Étendre hooks existants
2. ✅ Optimiser performance (memo, cache)
3. ✅ Ajouter traductions complètes

### Étape 5: Tests et validation (Jour 6)
1. ✅ Tests unitaires des composants
2. ✅ Tests responsive (mobile/desktop)
3. ✅ Validation accessibilité
4. ✅ Tests navigation et fonctionnalités

### Étape 6: Déploiement (Jour 7)
1. ✅ Review de code
2. ✅ Tests staging
3. ✅ Déploiement production
4. ✅ Monitoring et feedback

## ✅ Checklist de validation finale

### Interface
- [ ] Header aligné à gauche (style SaaS)
- [ ] Section profil v15 épurée
- [ ] Progression mobile verticale
- [ ] Progression desktop horizontale
- [ ] Responsive 100% fonctionnel

### Fonctionnalités
- [ ] Page unifiée `/my-space` fonctionnelle
- [ ] Redirections services correctes
- [ ] Navigation contact/historique
- [ ] Stats temps réel
- [ ] Hooks tRPC optimisés

### Performance
- [ ] Temps de chargement < 2s
- [ ] Pas de régressions
- [ ] Cache TanStack Query optimisé
- [ ] Memoization appropriée

### Qualité
- [ ] Tests unitaires passants
- [ ] Accessibilité WCAG 2.1 AA
- [ ] Types TypeScript stricts
- [ ] Traductions complètes

Ce plan final intègre toutes vos optimisations et corrections pour une implémentation réussie de l'interface unifiée !
