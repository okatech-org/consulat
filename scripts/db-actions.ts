import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const profiles = await prisma.profile.findMany({
      where: {
        status: 'SUBMITTED',
      },
      select: {
        validationRequestId: true,
        id: true,
      },
    });

    for (const profile of profiles) {
      const serviceRequest = await prisma.serviceRequest.findUnique({
        where: { id: profile.validationRequestId ?? '' },
        select: {
          id: true,
          organizationId: true,
        },
      });

      if (serviceRequest?.organizationId) {
        console.log(
          `Updating profile ${profile.id} with organization ${serviceRequest.organizationId}`,
        );
        await prisma.profile.update({
          where: { id: profile.id },
          data: {
            assignedOrganizationId: serviceRequest.organizationId,
          },
        });
      }
    }

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
