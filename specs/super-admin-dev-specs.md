# Spécifications de Développement - Profil Super Admin

## Table des Matières
1. Vue d'ensemble
2. Architecture
3. Structure des données
4. Fonctionnalités
5. Interfaces utilisateur
6. Sécurité
7. Instructions de développement
8. Tests et validation

## 1. Vue d'ensemble

### 1.1 Objectif
Le profil Super Admin est le niveau d'administration le plus élevé de la plateforme consulaire. Il permet la gestion complète du système, la configuration des autorités et la supervision de toutes les opérations.

### 1.2 Portée
- Gestion globale des autorités consulaires
- Configuration des services par pays
- Attribution des droits et permissions
- Supervision des opérations
- Monitoring et rapports

### 1.3 Prérequis techniques
- Next.js 14+
- PostgreSQL avec Prisma
- TypeScript
- TailwindCSS
- React Query
- JWT pour l'authentification

## 2. Architecture

### 2.1 Structure des modules
```typescript
// Structure modulaire
src/
  ├── modules/
  │   ├── superAdmin/
  │   │   ├── authorities/      // Gestion des autorités
  │   │   ├── services/         // Configuration des services
  │   │   ├── users/           // Gestion des utilisateurs
  │   │   ├── geography/       // Gestion géographique
  │   │   ├── monitoring/      // Surveillance et rapports
  │   │   └── settings/        // Paramètres globaux
  │   └── shared/              // Composants partagés
```

### 2.2 Architecture des données
```prisma
// Schema Prisma essentiel
model Authority {
  id            String      @id @default(cuid())
  type          AuthorityType
  name          String
  countryCode   String
  parentId      String?     // Pour les consulats/vice-consulats
  parent        Authority?  @relation("Hierarchy")
  children      Authority[] @relation("Hierarchy")
  services      Service[]
  users         User[]
  zone          Zone[]
}

model Service {
  id            String      @id @default(cuid())
  type          ServiceType
  enabled       Boolean     @default(false)
  authorityId   String
  authority     Authority   @relation(fields: [authorityId], references: [id])
  workflow      Json        // Configuration du workflow
  requirements  Json        // Documents requis
}

model Zone {
  id            String      @id @default(cuid())
  countryCode   String
  region        String?
  city          String
  authorityId   String
  authority     Authority   @relation(fields: [authorityId], references: [id])
  users         User[]
}
```

## 3. Structure des Données

### 3.1 Modèles de données principaux
```typescript
// Types principaux
interface Authority {
  id: string;
  type: AuthorityType;
  name: string;
  countryCode: string;
  parentId?: string;
  services: Service[];
  users: User[];
  zones: Zone[];
}

interface ServiceConfiguration {
  type: ServiceType;
  enabled: boolean;
  workflow: WorkflowConfig;
  requirements: DocumentRequirement[];
  validations: ValidationRule[];
}

interface GeographicalAssignment {
  countryCode: string;
  region?: string;
  city: string;
  authorityId: string;
}
```

### 3.2 Relations hiérarchiques
- Consulat Général (autonome)
- Ambassade
  - Consulat (rattaché)
  - Vice-Consulat (rattaché)
- DGDI (services spécialisés)

## 4. Fonctionnalités

### 4.1 Gestion des autorités
```typescript
// Service de gestion des autorités
class AuthorityManagementService {
  async createAuthority(data: CreateAuthorityDTO): Promise<Authority>;
  async updateAuthority(id: string, data: UpdateAuthorityDTO): Promise<Authority>;
  async assignServices(id: string, services: ServiceConfig[]): Promise<void>;
  async manageHierarchy(parentId: string, childId: string): Promise<void>;
}
```

### 4.2 Configuration des services
```typescript
// Service de configuration
class ServiceConfigurationService {
  async configureService(params: {
    authorityId: string;
    serviceType: ServiceType;
    config: ServiceConfig;
  }): Promise<void>;
  
  async transferService(params: {
    serviceType: ServiceType;
    fromAuthority: string;
    toAuthority: string;
  }): Promise<void>;
}
```

### 4.3 Gestion géographique
```typescript
interface GeographicalManagement {
  assignUserToAuthority(userId: string, authorityId: string): Promise<void>;
  updateUserAssignment(userId: string, newAuthorityId: string): Promise<void>;
  validateUserZone(userId: string, zoneId: string): Promise<boolean>;
}
```

## 5. Interfaces Utilisateur

### 5.1 Dashboard principal
```typescript
// Composant Dashboard
const SuperAdminDashboard: React.FC = () => {
  return (
    <Layout>
      <Header />
      <Sidebar />
      <main>
        <GlobalStats />
        <WorldMap />
        <QuickActions />
        <RecentActivity />
      </main>
    </Layout>
  );
};
```

### 5.2 Interfaces de gestion
- Interface de configuration des autorités
- Gestionnaire de services
- Carte mondiale interactive
- Tableaux de bord analytiques

### 5.3 Composants essentiels
```typescript
// Composants requis
interface RequiredComponents {
  AuthorityManager: React.FC<AuthorityManagerProps>;
  ServiceConfigurator: React.FC<ServiceConfigProps>;
  WorldMapVisualizer: React.FC<MapProps>;
  ReportGenerator: React.FC<ReportProps>;
}
```

## 6. Sécurité

### 6.1 Authentification
```typescript
// Middleware d'authentification
const superAdminAuthMiddleware = async (req: NextApiRequest) => {
  const token = extractToken(req);
  const user = await validateToken(token);
  
  if (user.role !== 'SUPER_ADMIN') {
    throw new UnauthorizedError();
  }
  
  return user;
};
```

### 6.2 Autorisation
- Validation des permissions
- Vérification des accès
- Journalisation des actions

## 7. Instructions de Développement

### 7.1 Configuration initiale
1. Cloner le repository
2. Installer les dépendances
3. Configurer les variables d'environnement
4. Initialiser la base de données

### 7.2 Structure des composants
```bash
# Structure recommandée
src/components/superAdmin/
  ├── dashboard/
  │   ├── GlobalStats.tsx
  │   ├── WorldMap.tsx
  │   └── QuickActions.tsx
  ├── authorities/
  │   ├── AuthorityList.tsx
  │   ├── AuthorityForm.tsx
  │   └── ServiceConfig.tsx
  └── settings/
      ├── GeneralSettings.tsx
      └── SecuritySettings.tsx
```

### 7.3 Tests
```typescript
// Exemple de test
describe('SuperAdmin Authority Management', () => {
  it('should create new authority', async () => {
    const authority = await createAuthority(mockAuthorityData);
    expect(authority).toBeDefined();
  });
  
  it('should configure services', async () => {
    const result = await configureServices(mockServiceConfig);
    expect(result.success).toBe(true);
  });
});
```

## 8. Tests et Validation

### 8.1 Scénarios de test
1. Création et configuration d'autorités
2. Attribution de services
3. Gestion des utilisateurs
4. Validation des workflows

### 8.2 Critères de validation
- Performance
- Sécurité
- Fiabilité
- Facilité d'utilisation

### 8.3 Environnements
- Développement
- Staging
- Production

## 9. Documentation API

### 9.1 Endpoints
```typescript
// Routes API principales
const apiRoutes = {
  authorities: {
    create: 'POST /api/actions/authorities',
    update: 'PUT /api/actions/authorities/:id',
    delete: 'DELETE /api/actions/authorities/:id',
    services: 'PUT /api/actions/authorities/:id/services'
  },
  services: {
    configure: 'POST /api/actions/services/configure',
    transfer: 'POST /api/actions/services/transfer',
    disable: 'POST /api/actions/services/disable'
  },
  users: {
    assign: 'POST /api/actions/users/assign',
    update: 'PUT /api/actions/users/assignment'
  }
};
```

### 9.2 Formats de données
```typescript
// Exemples de DTO
interface CreateAuthorityDTO {
  name: string;
  type: AuthorityType;
  countryCode: string;
  parentId?: string;
  services: ServiceConfig[];
}

interface ServiceConfigDTO {
  type: ServiceType;
  enabled: boolean;
  workflow: WorkflowConfig;
  requirements: string[];
}
```

## 10. Déploiement

### 10.1 Prérequis
- Node.js 18+
- PostgreSQL 14+
- Redis (pour le caching)
- Environnement sécurisé

### 10.2 Variables d'environnement
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
API_KEY=...
```

### 10.3 Procédure de déploiement
1. Build de l'application
2. Migration de la base de données
3. Configuration des services
4. Tests de validation
5. Déploiement en production

## 11. Maintenance

### 11.1 Tâches régulières
- Backup des données
- Vérification des logs
- Monitoring des performances
- Mises à jour de sécurité

### 11.2 Support
- Documentation utilisateur
- Guide de dépannage
- Procédures d'escalade

## 12. Évolutions futures

### 12.1 Améliorations prévues
- Analytics avancés
- Intégrations supplémentaires
- Fonctionnalités étendues
- Optimisations de performance

### 12.2 Roadmap
Phase 1: Configuration de base
Phase 2: Fonctionnalités avancées
Phase 3: Optimisations et améliorations
Phase 4: Nouvelles fonctionnalités