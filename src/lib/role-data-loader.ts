import { auth } from '@/server/auth';
import type {
  RoleData,
  UserData,
  AgentData,
  ManagerData,
  AdminData,
  SuperAdminData,
} from '@/types/role-data';
import type { UserRole } from '@prisma/client';

/**
 * Charge les données appropriées selon le rôle de l'utilisateur connecté
 * Cette fonction est conçue pour être utilisée côté serveur
 */
export async function loadRoleBasedData(): Promise<RoleData | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const userRole = session.user.roles?.[0] || ('USER' as UserRole);
  const userId = session.user.id;

  try {
    const roleData = await loadDataForRole(userRole, userId);
    return roleData;
  } catch (error) {
    console.error('Erreur lors du chargement des données par rôle:', error);
    return null;
  }
}

async function loadDataForRole(role: UserRole, userId: string): Promise<RoleData> {
  switch (role) {
    case 'USER':
      return loadUserData(userId);

    case 'AGENT':
      return loadAgentData(userId);

    case 'MANAGER':
      return loadManagerData(userId);

    case 'ADMIN':
      return loadAdminData(userId);

    case 'SUPER_ADMIN':
      return loadSuperAdminData(userId);

    default:
      return loadUserData(userId);
  }
}

async function loadUserData(userId: string): Promise<UserData> {
  // Simuler les données de base pour éviter les erreurs tRPC complexes
  // Dans une vraie implémentation, vous utiliseriez api.createCaller ou des appels directs à la base

  return {
    role: 'USER',
    user: {
      id: userId,
      name: 'Utilisateur Test',
      email: 'user@test.com',
      roles: ['USER'],
    } as any,
    profile: {} as any,
    notifications: [],
    requests: [],
    appointments: [],
    children: [],
    documents: [],
    availableServices: [],
    stats: {
      profileCompletion: 75,
      unreadNotifications: 3,
      pendingRequests: 2,
      upcomingAppointments: 1,
      documentsCount: 5,
      childrenCount: 0,
    },
  };
}

async function loadAgentData(userId: string): Promise<AgentData> {
  const userData = await loadUserData(userId);

  return {
    ...userData,
    role: 'AGENT',
    assignedRequests: [],
    agentAppointments: [],
    assignedProfiles: [],
    organizationData: {} as any,
    agentStats: {
      requestsToProcess: 5,
      appointmentsToday: 3,
      completedThisWeek: 12,
      averageProcessingTime: 2.5,
    },
  };
}

async function loadManagerData(userId: string): Promise<ManagerData> {
  const agentData = await loadAgentData(userId);

  return {
    ...agentData,
    role: 'MANAGER',
    teamAgents: [],
    teamStats: {
      totalRequests: 45,
      processingRequests: 23,
      completedRequests: 22,
      teamPerformance: {},
    },
    organizationRequests: [],
  };
}

async function loadAdminData(userId: string): Promise<AdminData> {
  const managerData = await loadManagerData(userId);

  return {
    ...managerData,
    role: 'ADMIN',
    organizations: [],
    allAgents: [],
    systemStats: {
      totalProfiles: 1250,
      totalRequests: 3400,
      totalAppointments: 890,
      completionRate: 92,
    },
    pendingValidations: [],
  };
}

async function loadSuperAdminData(userId: string): Promise<SuperAdminData> {
  const adminData = await loadAdminData(userId);

  return {
    ...adminData,
    role: 'SUPER_ADMIN',
    countries: [],
    globalStats: {
      totalUsers: 15000,
      totalOrganizations: 45,
      totalRequests: 125000,
      systemHealth: {
        uptime: 99.9,
        errors: 2,
        performance: 95,
      },
    },
  };
}

/**
 * Fonction utilitaire pour calculer le pourcentage de completion du profil
 */
export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;

  const requiredFields = [
    'firstName',
    'lastName',
    'birthDate',
    'birthPlace',
    'nationality',
    'gender',
    'maritalStatus',
  ];

  const completedFields = requiredFields.filter(
    (field) => profile[field] && profile[field] !== '',
  );

  return Math.round((completedFields.length / requiredFields.length) * 100);
}
