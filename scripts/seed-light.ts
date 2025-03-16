import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting seed...');

    // Clean the database in the correct order
    await prisma.$transaction([
      prisma.notificationLog.deleteMany(),
      prisma.scheduledNotification.deleteMany(),
      prisma.notificationPreference.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.appointment.deleteMany(),
      prisma.note.deleteMany(),
      prisma.message.deleteMany(),
      prisma.userDocument.deleteMany(),
      prisma.requestAction.deleteMany(),
      prisma.serviceRequest.deleteMany(),
      prisma.consularService.deleteMany(),
      prisma.emergencyContact.deleteMany(),
      prisma.phone.deleteMany(),
      prisma.address.deleteMany(),
      prisma.parentalAuthority.deleteMany(),
      prisma.profile.deleteMany(),
      prisma.user.deleteMany(),
      prisma.organization.deleteMany(),
      prisma.country.deleteMany(),
    ]);

    // Create super admin user
    console.log('Creating super admin user...');
    await prisma.user.create({
      data: {
        firstName: 'Okatech',
        lastName: 'SA',
        id: 'user-super-admin',
        email: 'okatech@icloud.com',
        roles: [UserRole.SUPER_ADMIN],
        phone: {
          create: {
            number: '612250393',
            countryCode: '+33',
          },
        },
      },
    });

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
