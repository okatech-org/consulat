import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import type {
  RoleData,
  UserData,
  AgentData,
  ManagerData,
  AdminData,
  SuperAdminData,
  IntelAgentData,
} from '@/types/role-data';
import type {
  AdminSession,
  AgentSession,
  ManagerSession,
  SessionUser,
  SuperAdminSession,
  UserSession,
  IntelAgentSession,
} from '@/types/user';
import { UserRole } from '@prisma/client';

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

    case 'INTEL_AGENT':
      return loadIntelAgentData(user);

    default:
      return null;
  }
}

async function loadUserData(user: SessionUser): Promise<UserData> {
  return {
    role: UserRole.USER,
    user: user as UserSession,
    notifications: [],
    stats: {
      unreadNotifications: 0,
    },
    activeCountries: [],
  };
}

async function loadAgentData(user: SessionUser): Promise<AgentData> {
  try {
    const [
      agentStatsData,
      unreadNotifications,
      notifications,
      appointments,
      activeCountries,
    ] = await Promise.all([
      api.dashboard.getAgentStats({ agentId: user.id }),
      api.notifications.getUnreadCount(),
      api.notifications.getList({}),
      api.appointments.getList({ userId: user.id }),
      api.countries.getActive(),
    ]);

    return {
      role: 'AGENT',
      user: user as AgentSession,
      notifications: notifications.items || [],
      agentAppointments: appointments,
      agentStats: agentStatsData.stats,
      stats: {
        unreadNotifications,
      },
      activeCountries: activeCountries,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données agent:', error);
    // Retourner des données vides en cas d'erreur plutôt que de throw
    return {
      role: 'AGENT',
      user: user as AgentSession,
      notifications: [],
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
    const [managerStatsData, managedAgents, unreadNotifications, activeCountries] =
      await Promise.all([
        api.dashboard.getManagerStats({ managerId: user.id }),
        api.agents.getList({ managedByUserId: [user.id] }),
        api.notifications.getUnreadCount(),
        api.countries.getActive(),
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
      activeCountries: activeCountries,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données manager:', error);
    return {
      role: 'MANAGER',
      user: user as ManagerSession,
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
    const [
      adminStatsData,
      organizationData,
      unreadNotifications,
      profilesGeographicData,
      activeCountries,
    ] = await Promise.all([
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
      api.dashboard.getProfilesGeographicData({
        organizationId: user.assignedOrganizationId || undefined,
      }),
      api.countries.getActive(),
    ]);

    return {
      role: 'ADMIN',
      user: user as AdminSession,
      notifications: [],
      organizationData: organizationData as AdminData['organizationData'],
      adminStats: adminStatsData.stats,
      recentData: adminStatsData.recentData as unknown as AdminData['recentData'], // Utiliser les vraies données avec un cast plus sûr
      stats: {
        unreadNotifications,
      },
      profilesGeographicData: profilesGeographicData,
      activeCountries: activeCountries,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données admin:', error);
    return {
      role: 'ADMIN',
      user: user as AdminSession,
      notifications: [],
      organizationData: null,
      adminStats: {
        completedRequests: 0,
        processingRequests: 0,
        pendingRequests: 0,
        pendingProfiles: 0,
        completedProfiles: 0,
        totalProfiles: 0,
        totalAppointments: 0,
      },
      recentData: {
        recentRegistrations: [],
        upcomingAppointments: [],
      },
      stats: {
        unreadNotifications: 0,
      },
      profilesGeographicData: [],
    };
  }
}

async function loadSuperAdminData(user: SessionUser): Promise<SuperAdminData> {
  try {
    const [
      superAdminStatsData,
      organizations,
      countries,
      unreadNotifications,
      notifications,
      activeCountries,
    ] = await Promise.all([
      api.dashboard.getSuperAdminStats(),
      api.organizations.getList({}),
      api.countries.getList({}),
      api.notifications.getUnreadCount(),
      api.notifications.getList({}),
      api.countries.getActive(),
    ]);

    return {
      role: 'SUPER_ADMIN',
      user: user as SuperAdminSession,
      notifications: notifications.items || [],
      organizations: organizations.items || [],
      countries: countries.items || [],
      superAdminStats: superAdminStatsData.stats,
      stats: {
        unreadNotifications,
      },
      activeCountries: activeCountries,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données super admin:', error);
    return {
      role: 'SUPER_ADMIN',
      user: user as SuperAdminSession,
      notifications: [],
      organizations: [],
      countries: [],
      superAdminStats: {
        totalCountries: 0,
        totalOrganizations: 0,
        totalServices: 0,
        totalUsers: 0,
        activeCountries: 0,
        activeOrganizations: 0,
      },
      stats: {
        unreadNotifications: 0,
      },
      activeCountries: [],
    };
  }
}

async function loadIntelAgentData(user: SessionUser): Promise<IntelAgentData> {
  try {
    const [intelligenceStatsData, unreadNotifications, activeCountries] =
      await Promise.all([
        api.intelligence.getDashboardStats({ period: 'month' }),
        api.notifications.getUnreadCount(),
        api.countries.getActive(),
      ]);

    return {
      role: 'INTEL_AGENT',
      user: user as IntelAgentSession,
      notifications: [],
      intelligenceStats: {
        totalProfiles: intelligenceStatsData.totalProfiles,
        profilesWithNotes: intelligenceStatsData.profilesWithNotes,
        notesThisMonth: intelligenceStatsData.notesThisPeriod,
        notesByType: intelligenceStatsData.notesByType,
      },
      recentNotes: intelligenceStatsData.recentNotes.map((note) => ({
        id: note.id,
        title: note.title,
        type: note.type,
        createdAt: note.createdAt.toISOString(),
        profile: {
          firstName: note.profile.firstName || '',
          lastName: note.profile.lastName || '',
        },
        author: {
          name: note.author.name || '',
        },
      })),
      stats: {
        unreadNotifications,
      },
      activeCountries: activeCountries,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données agent de renseignement:', error);
    return {
      role: 'INTEL_AGENT',
      user: user as IntelAgentSession,
      notifications: [],
      intelligenceStats: {
        totalProfiles: 0,
        profilesWithNotes: 0,
        notesThisMonth: 0,
        notesByType: {},
      },
      recentNotes: [],
      stats: {
        unreadNotifications: 0,
      },
      activeCountries: [],
    };
  }
}
