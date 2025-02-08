export async function getRegistrations(
  options?: GetRegistrationsOptions,
): Promise<RegistrationsResult> {
  const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);
  if (authResult.error) {
    throw new Error(authResult.error);
  }

    const where: Prisma.ServiceRequestWhereInput = {
    // type: 'REGISTRATION', // A decommenter si vous avez differents types de requetes.
    ...(options?.status && options.status !== 'ALL' && { status: options.status }),
        ...(options?.search && {
            OR: [
                { submittedBy: { firstName: { contains: options.search, mode: 'insensitive' } } },
                { submittedBy: { lastName: { contains: options.search, mode: 'insensitive' } } },
                { submittedBy: { email: { contains: options.search, mode: 'insensitive' } } },
                { submittedBy: { nationality: { contains: options.search, mode: 'insensitive' } } }, // Ajout recherche nationalité
                // Ajoutez d'autres champs si nécessaire
            ],
        }),
    ...(options?.profileStatus && options.profileStatus !== 'ALL' && {
      submittedBy: { profile: { status: options.profileStatus } },
    }),
  };

  const orderBy: Prisma.ServiceRequestOrderByWithRelationInput = options?.orderBy
    ? { [options.orderBy.field]: options.orderBy.direction }
    : { submittedAt: 'desc' }; // Tri par défaut par date de soumission

  try {
    const [registrations, total] = await Promise.all([
      db.serviceRequest.findMany({
        where,
        orderBy,
        include: {
          submittedBy: {
            include: {
              profile: true,
              phone:true
            },
          },
        },
      }),
      db.serviceRequest.count({ where }),
    ]);

    return {
      registrations,
      total,
      filters: {
        search: options?.search,
        status: options?.status,
        profileStatus: options?.profileStatus,
      },
    };
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw new Error('Failed to fetch registrations');
  }
} 