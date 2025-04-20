import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting seed...');
    const profiles = await prisma.profile.findMany();

    for (const profile of profiles) {
      if (profile.birthCountry === 'gabon') {
        console.log(`Updating profile ${profile.id} from gabon to GA`);
        await prisma.profile.update({
          where: { id: profile.id },
          data: {
            birthCountry: 'GA',
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
