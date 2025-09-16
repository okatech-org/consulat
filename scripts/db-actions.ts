import { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
  try {
    const users = await prisma.user.findMany();

    for (const user of users) {
      if (!user.email) {
        console.log(`❌ User ${user.id} has no email`);
        continue;
      }

      const clerkUser = await clerkClient.users.getUserList({
        emailAddress: [user.email as string],
      });

      if (user.userId && user.userId !== '' && user.userId !== 'undefined') {
        console.log(`✅ User ${user.id} already has a Clerk user: ${user.userId}`);
        continue;
      }

      if (clerkUser.data.length > 0) {
        const userData = clerkUser.data[0];

        if (!userData) {
          console.log(`❌ Clerk user not found for user ${user.id}`);
          continue;
        }

        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { userId: userData.id },
          });
        } catch (error) {
          console.error(`❌ Error updating user ${user.id}:`, error);
        }

        console.log(`✅ Clerk user ${userData.id} found for user ${user.id}`);
      }
    }
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
