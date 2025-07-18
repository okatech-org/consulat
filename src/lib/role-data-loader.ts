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
  return {
    role: 'AGENT',
    user: user as AgentSession,
    notifications: [],
    stats: {
      unreadNotifications: 0,
    },
  };
}

async function loadManagerData(user: SessionUser): Promise<ManagerData> {
  return {
    role: 'MANAGER',
    user: user as ManagerSession,
    notifications: [],
    stats: {
      unreadNotifications: 0,
    },
  };
}

async function loadAdminData(user: SessionUser): Promise<AdminData> {
  return {
    role: 'ADMIN',
    user: user as AdminSession,
    notifications: [],
    stats: {
      unreadNotifications: 0,
    },
  };
}

async function loadSuperAdminData(user: SessionUser): Promise<SuperAdminData> {
  return {
    role: 'SUPER_ADMIN',
    user: user as SuperAdminSession,
    notifications: [],
    stats: {
      unreadNotifications: 0,
    },
  };
}
