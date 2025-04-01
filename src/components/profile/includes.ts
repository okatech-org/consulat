// Base includes pour un profil
export const BaseProfileInclude = {
  include: {
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    },
    identityPicture: true,
  },
} as const;
