import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const profiles = await prisma.profile.findMany({
      where: {
        requestsFor: {
          some: {
            serviceCategory: 'REGISTRATION',
          },
        },
      },
      include: {
        requestsFor: {
          where: {
            serviceCategory: 'REGISTRATION',
          },
        },
      },
    });

    const filteredProfiles = profiles.filter((profile) => {
      return profile.requestsFor.length > 1;
    });

    filteredProfiles.forEach((profile) => {
      console.log({
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        requestsFor: profile.requestsFor.map((request) => {
          return {
            id: request.id,
            serviceCategory: request.serviceCategory,
            status: request.status,
          };
        }),
        validationRequestId: profile.validationRequestId,
      });
    });

    console.log(filteredProfiles.length);

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
