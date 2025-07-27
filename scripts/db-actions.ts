import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const organization = await prisma.organization.findFirst({
      where: { id: 'cm8hw04070000l403rdas9v2j' },
      include: {
        countries: true,
      },
    });

    const metadata = JSON.parse(organization?.metadata as string);

    const frMetadata = metadata['FR'];

    const finalMetadata = {
      ...metadata,
      FR: frMetadata,
    };

    organization?.countries.forEach((country) => {
      finalMetadata[country.code] = frMetadata;
    });

    await prisma.organization.update({
      where: { id: 'cm8hw04070000l403rdas9v2j' },
      data: {
        metadata: JSON.stringify(finalMetadata),
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
