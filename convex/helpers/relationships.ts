import type { Doc, Id } from '../_generated/dataModel';

// Helper pour récupérer les services d'une organisation
export async function getOrganizationServicesHelper(
  ctx: { db: any },
  organizationId: Id<'organizations'>,
): Promise<Array<Doc<'services'>>> {
  const org = await ctx.db.get(organizationId);
  if (!org) return [];

  const services = await Promise.all(
    org.serviceIds.map((id: Id<'services'>) => ctx.db.get(id)),
  );
  return services.filter(Boolean);
}

// Helper pour récupérer les membres d'une organisation (via memberships)
export async function getOrganizationMembers(
  ctx: { db: any },
  organizationId: Id<'organizations'>,
): Promise<Array<Doc<'memberships'>>> {
  return await ctx.db
    .query('memberships')
    .filter((q: any) => q.eq(q.field('organizationId'), organizationId))
    .filter((q: any) => q.eq(q.field('status'), 'active'))
    .collect();
}

// Helper pour récupérer les utilisateurs d'une organisation
export async function getOrganizationUsers(
  ctx: { db: any },
  organizationId: Id<'organizations'>,
): Promise<Array<Doc<'users'>>> {
  const members = await getOrganizationMembers(ctx, organizationId);
  const users = await Promise.all(members.map((member) => ctx.db.get(member.userId)));
  return users.filter(Boolean);
}

// Helper pour récupérer les demandes d'un utilisateur
export async function getUserRequestsHelper(
  ctx: { db: any },
  userId: Id<'users'>,
): Promise<Array<Doc<'requests'>>> {
  return await ctx.db
    .query('requests')
    .withIndex('by_requester', (q: any) => q.eq('requesterId', userId))
    .order('desc')
    .collect();
}

// Helper pour récupérer les documents d'une entité
export async function getEntityDocuments(
  ctx: { db: any },
  ownerId: string,
  ownerType: string,
): Promise<Array<Doc<'documents'>>> {
  return await ctx.db
    .query('documents')
    .withIndex('by_owner', (q: any) =>
      q.eq('ownerId', ownerId).eq('ownerType', ownerType),
    )
    .collect();
}

// Helper pour récupérer le profil d'un utilisateur
export async function getUserProfileHelper(
  ctx: { db: any },
  userId: Id<'users'>,
): Promise<Doc<'profiles'> | null> {
  const user = await ctx.db.get(userId);
  if (!user || !user.profileId) return null;

  return await ctx.db.get(user.profileId);
}

// Helper pour récupérer les notifications non lues d'un utilisateur
export async function getUnreadNotifications(
  ctx: { db: any },
  userId: Id<'users'>,
): Promise<Array<Doc<'notifications'>>> {
  return await ctx.db
    .query('notifications')
    .withIndex('by_user_unread', (q: any) =>
      q.eq('userId', userId).eq('readAt', undefined),
    )
    .order('desc')
    .collect();
}

// Helper pour récupérer les rendez-vous d'un utilisateur
export async function getUserAppointments(
  ctx: { db: any },
  userId: Id<'users'>,
): Promise<Array<Doc<'appointments'>>> {
  // Pour les arrays d'objets, nous devons filtrer manuellement
  const appointments = await ctx.db.query('appointments').order('desc').collect();

  return appointments.filter((appointment: Doc<'appointments'>) =>
    appointment.participants.some((participant: any) => participant.userId === userId),
  );
}

// Helper pour récupérer les organisations d'un utilisateur
export async function getUserOrganizations(
  ctx: { db: any },
  userId: Id<'users'>,
): Promise<Array<Doc<'organizations'>>> {
  const user = await ctx.db.get(userId);
  if (!user) return [];

  const organizations = await Promise.all(
    user.organizationIds.map((id: Id<'organizations'>) => ctx.db.get(id)),
  );
  return organizations.filter(Boolean);
}

// Helper pour ajouter un membre à une organisation
export async function addMemberToOrganization(
  ctx: { db: any },
  userId: Id<'users'>,
  organizationId: Id<'organizations'>,
  role: string,
  permissions: Array<string> = [],
): Promise<Id<'memberships'>> {
  // Vérifier si l'utilisateur est déjà membre
  const existingMembership = await ctx.db
    .query('memberships')
    .filter((q: any) => q.eq(q.field('userId'), userId))
    .filter((q: any) => q.eq(q.field('organizationId'), organizationId))
    .filter((q: any) => q.eq(q.field('status'), 'active'))
    .first();

  if (existingMembership) {
    throw new Error('User is already a member of this organization');
  }

  // Créer l'appartenance
  const membershipId = await ctx.db.insert('memberships', {
    userId,
    organizationId,
    role,
    permissions,
    status: 'active',
    joinedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return membershipId;
}

// Helper pour retirer un membre d'une organisation
export async function removeMemberFromOrganization(
  ctx: { db: any },
  userId: Id<'users'>,
  organizationId: Id<'organizations'>,
): Promise<void> {
  // Trouver l'appartenance active
  const membership = await ctx.db
    .query('memberships')
    .filter((q: any) => q.eq(q.field('userId'), userId))
    .filter((q: any) => q.eq(q.field('organizationId'), organizationId))
    .filter((q: any) => q.eq(q.field('status'), 'active'))
    .first();

  if (membership) {
    // Marquer comme inactif
    await ctx.db.patch(membership._id, {
      status: 'inactive',
      leftAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}
