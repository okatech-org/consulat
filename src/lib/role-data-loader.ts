import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import type {
  RoleData,
  UserData,
  AgentData,
  ManagerData,
  AdminData,
  SuperAdminData,
} from '@/types/role-data';
import type {
  AdminSession,
  AgentSession,
  ManagerSession,
  SessionUser,
  SuperAdminSession,
  UserSession,
} from '@/types/user';
import { UserRole } from '@prisma/client';
import { calculateProfileCompletion } from './utils';

/**
 * Charge les données appropriées selon le rôle de l'utilisateur connecté
 * Cette fonction est conçue pour être utilisée côté serveur
 */
export async function loadRoleBasedData(): Promise<RoleData | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  try {
    const roleData = await loadDataForRole(session.user);
    return roleData;
  } catch (error) {
    console.error('Erreur lors du chargement des données par rôle:', error);
    return null;
  }
}

async function loadDataForRole(user: SessionUser): Promise<RoleData | null> {
  switch (user.role) {
    case 'USER':
      return loadUserData(user);

    case 'AGENT':
      return loadAgentData(user);

    case 'MANAGER':
      return loadManagerData(user);

    case 'ADMIN':
      return loadAdminData(user);

    case 'SUPER_ADMIN':
      return loadSuperAdminData(user);

    default:
      return null;
  }
}

async function loadUserData(user: SessionUser): Promise<UserData> {
  const [
    profile,
    requests,
    appointments,
    documents,
    availableServices,
    currentRequest,
    unreadNotifications,
  ] = await Promise.all([
    api.profile.getCurrent(),
    api.requests.getList({}),
    api.appointments.getList({ userId: user.id }),
    api.documents.getUserDocuments(),
    api.services.getAvailable(),
    api.requests.getCurrent(),
    api.notifications.getUnreadCount(),
  ]);

  return {
    role: UserRole.USER,
    user: user as UserSession,
    profile: profile,
    notifications: [],
    requests: requests.items,
    currentRequest: currentRequest || null,
    appointments: appointments,
    children: profile.parentAuthorities,
    documents: documents,
    availableServices: availableServices,
    stats: {
      profileCompletion: calculateProfileCompletion(profile),
      unreadNotifications: unreadNotifications,
      pendingRequests: requests.items.length,
      upcomingAppointments: appointments?.upcoming.length || 0,
      documentsCount: documents.length,
      childrenCount: profile.parentAuthorities.length,
    },
  };
}

async function loadAgentData(user: SessionUser): Promise<AgentData> {
  try {
    const [profile, agentStatsData, unreadNotifications] = await Promise.all([
      api.profile.getCurrent(),
      api.dashboard.getAgentStats({ agentId: user.id }),
      api.notifications.getUnreadCount(),
    ]);

    return {
      role: 'AGENT',
      user: user as AgentSession,
      profile,
      notifications: [],
      assignedRequests: (agentStatsData.recentRequests ||
        []) as AgentData['assignedRequests'],
      agentAppointments: (agentStatsData.appointments ||
        null) as AgentData['agentAppointments'],
      agentStats: agentStatsData.stats,
      stats: {
        unreadNotifications,
      },
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données agent:', error);
    // Retourner des données vides en cas d'erreur plutôt que de throw
    return {
      role: 'AGENT',
      user: user as AgentSession,
      profile: null,
      notifications: [],
      assignedRequests: [],
      agentAppointments: null,
      agentStats: {
        pendingRequests: 0,
        processingRequests: 0,
        completedRequests: 0,
        totalRequests: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
      },
      stats: {
        unreadNotifications: 0,
      },
    };
  }
}

async function loadManagerData(user: SessionUser): Promise<ManagerData> {
  try {
    const [profile, managerStatsData, managedAgents, unreadNotifications] =
      await Promise.all([
        api.profile.getCurrent(),
        api.dashboard.getManagerStats({ managerId: user.id }),
        api.agents.getList({ managedByUserId: [user.id] }),
        api.notifications.getUnreadCount(),
      ]);

    // Utiliser les vraies données du router manager
    const statsData = managerStatsData?.stats || {
      pendingRequests: 0,
      processingRequests: 0,
      completedRequests: 0,
      avgProcessingTime: 0,
      trend: { value: 0, isPositive: true },
    };

    return {
      role: 'MANAGER',
      user: user as ManagerSession,
      profile,
      notifications: [],
      managedAgents: managedAgents.items || [],
      managerStats: {
        totalAgents: managedAgents.total || 0,
        pendingRequests: statsData.pendingRequests || 0,
        processingRequests: statsData.processingRequests || 0,
        completedRequests: statsData.completedRequests || 0,
        avgProcessingTime: statsData.avgProcessingTime || 0,
        trend: statsData.trend || { value: 0, isPositive: true },
      },
      recentRequests: (managerStatsData?.recentRequests ||
        []) as ManagerData['recentRequests'],
      requestsByStatus: managerStatsData?.requestsByStatus || {},
      stats: {
        unreadNotifications,
      },
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données manager:', error);
    return {
      role: 'MANAGER',
      user: user as ManagerSession,
      profile: null,
      notifications: [],
      managedAgents: [],
      managerStats: {
        totalAgents: 0,
        pendingRequests: 0,
        processingRequests: 0,
        completedRequests: 0,
        avgProcessingTime: 0,
        trend: { value: 0, isPositive: true },
      },
      recentRequests: [],
      requestsByStatus: {},
      stats: {
        unreadNotifications: 0,
      },
    };
  }
}

async function loadAdminData(user: SessionUser): Promise<AdminData> {
  try {
    const [profile, adminStatsData, organizationData, unreadNotifications] =
      await Promise.all([
        api.profile.getCurrent(),
        api.dashboard.getAdminStats({
          organizationId: user.assignedOrganizationId || undefined,
        }),
        user.assignedOrganizationId
          ? api.organizations.getByIdWithSelect({
              id: user.assignedOrganizationId,
              select: ['id', 'name', 'type', 'status', 'countries', '_count'],
            })
          : Promise.resolve(null),
        api.notifications.getUnreadCount(),
      ]);

    return {
      role: 'ADMIN',
      user: user as AdminSession,
      profile,
      notifications: [],
      organizationData: organizationData as AdminData['organizationData'],
      adminStats: adminStatsData.stats,
      recentData: adminStatsData.recentData as any, // Utiliser les vraies données même avec des types différents
      stats: {
        unreadNotifications,
      },
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données admin:', error);
    return {
      role: 'ADMIN',
      user: user as AdminSession,
      profile: null,
      notifications: [],
      organizationData: null,
      adminStats: {
        completedRequests: 0,
        processingRequests: 0,
        validatedProfiles: 0,
        pendingProfiles: 0,
        totalUsers: 0,
        totalAppointments: 0,
      },
      recentData: {
        recentRegistrations: [],
        upcomingAppointments: [],
      },
      stats: {
        unreadNotifications: 0,
      },
    };
  }
}

async function loadSuperAdminData(user: SessionUser): Promise<SuperAdminData> {
  try {
    const [profile, superAdminStatsData, organizations, countries, unreadNotifications] =
      await Promise.all([
        api.profile.getCurrent(),
        api.dashboard.getSuperAdminStats(),
        api.organizations.getList({}),
        api.countries.getList({}),
        api.notifications.getUnreadCount(),
      ]);

    return {
      role: 'SUPER_ADMIN',
      user: user as SuperAdminSession,
      profile,
      notifications: [],
      organizations: organizations.items || [],
      countries: countries.items || [],
      superAdminStats: superAdminStatsData.stats,
      stats: {
        unreadNotifications,
      },
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données super admin:', error);
    throw error;
  }
}
