# Plan d'implémentation du nouveau sidebar utilisateur

## 📋 Vue d'ensemble

Ce plan détaille l'implémentation complète d'un nouveau sidebar pour les utilisateurs avec le rôle `USER`, utilisant les composants shadcn/ui sidebar. Le sidebar inclura toutes les fonctionnalités demandées avec badges, compteurs, et pourcentage de completion du profil.

## 🎯 Objectifs

- [x] Utiliser les composants shadcn/ui sidebar
- [x] Implémenter la structure de navigation demandée
- [x] Ajouter les badges de completion et compteurs
- [x] Assurer la responsivité et l'accessibilité
- [x] Maintenir les performances
- [x] Éviter toute régression

## 📊 Structure de navigation demandée

```
Mon espace
├── Mon profil (75% completion badge)
├── Mes demandes (3 active requests)
├── Mes rendez-vous
├── Mes documents (12 documents)
├── Nouvelle démarche (badge "Nouveau")
├── Mes enfants (2 enfants)
├── Notifications (3 non lues)
├── Paramètres
└── Déconnexion
```

## 🗂️ Plan d'implémentation détaillé

### ✅ **Étape 1 : Analyse de la structure actuelle**

**Statut** : Terminé

**Analyse effectuée** :

- Structure actuelle dans `src/components/layouts/user-space-navigation.tsx`
- Hooks existants (useNotifications, useChildProfiles, useProfile, etc.)
- Routes définies dans `src/schemas/routes.ts`
- Composants shadcn/ui disponibles

---

### ⏳ **Étape 2 : Créer le composant UserSidebar principal**

**Fichier** : `src/components/layouts/user-sidebar.tsx`

**Objectif** : Créer le composant principal du sidebar avec la structure shadcn/ui

**Code à implémenter** :

```typescript
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { UserSidebarNav } from './user-sidebar-nav';
import { UserSidebarFooter } from './user-sidebar-footer';
import { UserSidebarHeader } from './user-sidebar-header';

export function UserSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <UserSidebarHeader />
      <SidebarContent>
        <UserSidebarNav />
      </SidebarContent>
      <UserSidebarFooter />
    </Sidebar>
  );
}
```

**Dépendances** : Étape 1

---

### ⏳ **Étape 3 : Créer les éléments de navigation**

**Fichier** : `src/components/layouts/user-sidebar-nav.tsx`

**Objectif** : Implémenter tous les éléments de navigation avec leurs icônes et badges

**Fonctionnalités** :

- Navigation avec icônes Lucide React
- Gestion des états actifs
- Intégration des badges
- Support responsive

**Code à implémenter** :

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  User,
  FileText,
  Calendar,
  FolderOpen,
  Plus,
  Users,
  Bell,
  Settings,
} from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge
} from '@/components/ui/sidebar';
import { useUserSidebarData } from '@/hooks/use-user-sidebar-data';
import { ProfileCompletionBadge } from './profile-completion-badge';
import { CountBadge } from './count-badge';
import { NewBadge } from './new-badge';

export function UserSidebarNav() {
  const pathname = usePathname();
  const {
    profileCompletion,
    requestsCount,
    documentsCount,
    childrenCount,
    notificationsCount
  } = useUserSidebarData();

  const navigationItems = [
    {
      title: 'Mon espace',
      url: ROUTES.user.dashboard,
      icon: Home,
    },
    {
      title: 'Mon profil',
      url: ROUTES.user.profile,
      icon: User,
      badge: <ProfileCompletionBadge percentage={profileCompletion} />,
    },
    {
      title: 'Mes demandes',
      url: ROUTES.user.services,
      icon: FileText,
      badge: <CountBadge count={requestsCount} />,
    },
    {
      title: 'Mes rendez-vous',
      url: ROUTES.user.appointments,
      icon: Calendar,
    },
    {
      title: 'Mes documents',
      url: ROUTES.user.documents,
      icon: FolderOpen,
      badge: <CountBadge count={documentsCount} />,
    },
    {
      title: 'Nouvelle démarche',
      url: ROUTES.user.service_available,
      icon: Plus,
      badge: <NewBadge />,
    },
    {
      title: 'Mes enfants',
      url: ROUTES.user.children,
      icon: Users,
      badge: <CountBadge count={childrenCount} />,
    },
    {
      title: 'Notifications',
      url: ROUTES.user.notifications,
      icon: Bell,
      badge: <CountBadge count={notificationsCount} variant="destructive" />,
    },
    {
      title: 'Paramètres',
      url: ROUTES.user.account,
      icon: Settings,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url || pathname.startsWith(item.url)}
              >
                <Link href={item.url}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                  {item.badge}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
```

**Dépendances** : Étape 2

---

### ⏳ **Étape 4 : Implémenter les hooks pour les données**

**Fichier** : `src/hooks/use-user-sidebar-data.ts`

**Objectif** : Créer un hook centralisé pour obtenir toutes les données nécessaires aux badges

**Fonctionnalités** :

- Récupération du pourcentage de completion du profil
- Comptage des demandes actives
- Comptage des documents
- Comptage des enfants
- Comptage des notifications non lues
- Optimisation des performances avec mise en cache

**Code à implémenter** :

```typescript
'use client';

import { useCurrentProfile } from '@/hooks/use-profile';
import { useUserRequests } from '@/hooks/use-requests';
import { useChildProfiles } from '@/hooks/use-child-profiles';
import { useUnreadCount } from '@/hooks/use-notifications';
import { calculateProfileCompletion } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useMemo } from 'react';

export function useUserSidebarData() {
  const { data: profile } = useCurrentProfile();
  const { requests } = useUserRequests();
  const { totalChildren } = useChildProfiles();
  const { count: notificationsCount } = useUnreadCount();

  // Récupération du nombre de documents
  const { data: documents } = api.documents.getUserDocuments.useQuery();

  // Calculs memoized pour les performances
  const profileCompletion = useMemo(() => {
    return profile ? calculateProfileCompletion(profile) : 0;
  }, [profile]);

  const requestsCount = useMemo(() => {
    return (
      requests?.filter((r) => ['PENDING', 'SUBMITTED', 'PROCESSING'].includes(r.status))
        .length || 0
    );
  }, [requests]);

  const documentsCount = useMemo(() => {
    return documents?.length || 0;
  }, [documents]);

  return {
    profileCompletion,
    requestsCount,
    documentsCount,
    childrenCount: totalChildren,
    notificationsCount,
  };
}
```

**Dépendances** : Étape 3

---

### ⏳ **Étape 5 : Créer le badge de completion du profil**

**Fichier** : `src/components/layouts/profile-completion-badge.tsx`

**Objectif** : Créer un badge affichant le pourcentage de completion du profil

**Fonctionnalités** :

- Affichage du pourcentage
- Couleurs conditionnelles selon le pourcentage
- Animation de progression
- Tooltip avec détails

**Code à implémenter** :

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ProfileCompletionBadgeProps {
  percentage: number;
  className?: string;
}

export function ProfileCompletionBadge({ percentage, className }: ProfileCompletionBadgeProps) {
  const getVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 50) return 'secondary';
    return 'destructive';
  };

  const getColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getVariant(percentage)}
            className={cn('ml-auto', getColor(percentage), className)}
          >
            {percentage}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Profil complété à {percentage}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

**Dépendances** : Étape 4

---

### ⏳ **Étape 6 : Créer les badges de comptage**

**Fichier** : `src/components/layouts/count-badge.tsx`

**Objectif** : Créer des badges pour afficher les compteurs

**Fonctionnalités** :

- Affichage conditionnel (masqué si count = 0)
- Variants différents selon le type
- Animation des changements
- Formatage des nombres élevés

**Code à implémenter** :

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CountBadgeProps {
  count: number;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export function CountBadge({ count, variant = 'secondary', className }: CountBadgeProps) {
  if (count === 0) return null;

  const formatCount = (count: number) => {
    if (count > 99) return '99+';
    return count.toString();
  };

  return (
    <Badge
      variant={variant}
      className={cn('ml-auto', className)}
    >
      {formatCount(count)}
    </Badge>
  );
}
```

**Dépendances** : Étape 4

---

### ⏳ **Étape 7 : Créer le badge "Nouveau"**

**Fichier** : `src/components/layouts/new-badge.tsx`

**Objectif** : Créer un badge "Nouveau" pour la nouvelle démarche

**Code à implémenter** :

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NewBadgeProps {
  className?: string;
}

export function NewBadge({ className }: NewBadgeProps) {
  return (
    <Badge
      variant="default"
      className={cn('ml-auto bg-green-500 hover:bg-green-600', className)}
    >
      Nouveau
    </Badge>
  );
}
```

**Dépendances** : Étape 6

---

### ⏳ **Étape 8 : Intégrer le sidebar dans le layout**

**Fichier** : `src/app/(authenticated)/my-space/layout.tsx`

**Objectif** : Remplacer la navigation existante par le nouveau sidebar

**Modifications** :

- Importer et utiliser UserSidebar
- Ajuster la structure du layout
- Maintenir le SidebarProvider
- Gérer les states mobile/desktop

**Code à modifier** :

```typescript
import { UserSidebar } from '@/components/layouts/user-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function MySpaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

**Dépendances** : Étape 7

---

### ⏳ **Étape 9 : Ajouter les traductions**

**Fichier** : `src/i18n/messages/fr/navigation.ts`

**Objectif** : Ajouter toutes les traductions nécessaires

**Traductions à ajouter** :

```typescript
export const navigation = {
  user: {
    dashboard: 'Mon espace',
    profile: 'Mon profil',
    requests: 'Mes demandes',
    appointments: 'Mes rendez-vous',
    documents: 'Mes documents',
    new_request: 'Nouvelle démarche',
    children: 'Mes enfants',
    notifications: 'Notifications',
    settings: 'Paramètres',
    logout: 'Déconnexion',
  },
  badges: {
    new: 'Nouveau',
    profile_completion: 'Profil complété à {percentage}%',
  },
} as const;
```

**Dépendances** : Étape 8

---

### ⏳ **Étape 10 : Implémenter le comportement responsive**

**Fichiers** : Composants sidebar existants

**Objectif** : Gérer la responsivité et le collapse/expand

**Fonctionnalités** :

- Collapse automatique sur mobile
- Gestion des states avec cookies
- Animations fluides
- Raccourcis clavier

**Dépendances** : Étape 9

---

### ⏳ **Étape 11 : Ajouter la fonctionnalité de déconnexion**

**Fichier** : `src/components/layouts/user-sidebar-footer.tsx`

**Objectif** : Créer le footer avec bouton de déconnexion

**Code à implémenter** :

```typescript
'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

export function UserSidebarFooter() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleLogout}>
            <LogOut className="size-4" />
            <span>Déconnexion</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
```

**Dépendances** : Étape 10

---

### ⏳ **Étape 12 : Nettoyer la navigation existante**

**Fichiers** :

- `src/components/layouts/user-space-navigation.tsx`
- `src/app/(authenticated)/my-space/page.tsx`

**Objectif** : Supprimer ou adapter l'ancienne navigation

**Actions** :

- Supprimer UserSpaceNavigation si plus utilisée
- Nettoyer les imports
- Vérifier les références

**Dépendances** : Étape 11

---

### ⏳ **Étape 13 : Tests de fonctionnalité**

**Objectif** : Tester toutes les fonctionnalités et vérifier l'absence de régressions

**Tests à effectuer** :

- Navigation entre toutes les pages
- Affichage correct des badges
- Mise à jour en temps réel des compteurs
- Responsivité mobile/desktop
- Fonctionnalité de déconnexion
- États actifs/inactifs
- Performance des hooks

**Dépendances** : Étape 12

---

### ⏳ **Étape 14 : Optimisation des performances**

**Objectif** : Optimiser les performances des hooks et du rendu

**Optimisations** :

- Memoization des calculs
- Optimisation des requêtes tRPC
- Réduction des re-renders
- Lazy loading si nécessaire

**Dépendances** : Étape 13

---

### ⏳ **Étape 15 : Test final complet**

**Objectif** : Test complet du nouveau sidebar avec toutes les fonctionnalités

**Validation finale** :

- Toutes les fonctionnalités marchent
- Aucune régression détectée
- Performance acceptable
- UI/UX conforme aux attentes
- Accessibilité respectée

**Dépendances** : Étape 14

---

## 🔧 Détails techniques

### Hooks utilisés

- `useCurrentProfile()` - Profil utilisateur actuel
- `useUserRequests()` - Demandes de l'utilisateur
- `useChildProfiles()` - Profils enfants
- `useUnreadCount()` - Notifications non lues
- `api.documents.getUserDocuments.useQuery()` - Documents utilisateur

### Composants shadcn/ui utilisés

- `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarHeader`
- `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuBadge`
- `SidebarGroup`, `SidebarGroupContent`
- `Badge`, `Tooltip`, `Button`

### Icônes Lucide React

- `Home`, `User`, `FileText`, `Calendar`, `FolderOpen`
- `Plus`, `Users`, `Bell`, `Settings`, `LogOut`

### Structure des fichiers

```
src/
├── components/
│   └── layouts/
│       ├── user-sidebar.tsx
│       ├── user-sidebar-nav.tsx
│       ├── user-sidebar-header.tsx
│       ├── user-sidebar-footer.tsx
│       ├── profile-completion-badge.tsx
│       ├── count-badge.tsx
│       └── new-badge.tsx
├── hooks/
│   └── use-user-sidebar-data.ts
├── i18n/
│   └── messages/
│       └── fr/
│           └── navigation.ts
└── app/
    └── (authenticated)/
        └── my-space/
            └── layout.tsx
```

## 🎯 Critères de succès

- ✅ Sidebar utilise les composants shadcn/ui
- ✅ Toutes les fonctionnalités de navigation sont présentes
- ✅ Badges et compteurs fonctionnent correctement
- ✅ Aucune régression sur les fonctionnalités existantes
- ✅ Performance acceptable
- ✅ Responsive design
- ✅ Accessibilité respectée
- ✅ Code maintenable et réutilisable

## 🚀 Notes pour l'implémentation

1. **Respecter les patterns existants** : Utiliser les mêmes conventions de nommage et structure
2. **Optimiser les performances** : Utiliser useMemo et useCallback quand nécessaire
3. **Gérer les états de chargement** : Afficher des skeletons pendant le chargement
4. **Gérer les erreurs** : Fallback gracieux en cas d'erreur
5. **Tests unitaires** : Ajouter des tests pour les nouveaux composants
6. **Documentation** : Documenter les nouvelles API et composants

## 📱 Comportement responsive

- **Desktop** : Sidebar expandable/collapsible
- **Tablet** : Sidebar en overlay
- **Mobile** : Sidebar en drawer/sheet

## 🔒 Sécurité

- Vérifier les permissions avant d'afficher les éléments
- Gérer les erreurs d'authentification
- Protéger les routes sensibles

---

_Ce plan sera mis à jour au fur et à mesure de l'avancement du développement._
