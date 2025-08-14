import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Trouver tous les profils avec plusieurs demandes d'inscription
    const profilesWithMultipleRequests = await prisma.profile.findMany({
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const duplicates = profilesWithMultipleRequests.filter(
      (profile) => profile.requestsFor.length > 1,
    );

    if (duplicates.length > 0) {
      console.log(
        `🚨 PROBLÈME : ${duplicates.length} profils avec des demandes dupliquées trouvés !`,
      );
      console.log('\n📋 Profils avec doublons :');

      duplicates.forEach((profile, index) => {
        console.log(
          `\n${index + 1}. ${profile.firstName} ${profile.lastName} (${profile.id})`,
        );
        console.log(`   Demandes : ${profile.requestsFor.length}`);
        profile.requestsFor.forEach((req, reqIndex) => {
          console.log(
            `   ${reqIndex + 1}. ${req.id} - ${req.status} (${req.createdAt.toISOString().split('T')[0]})`,
          );
        });
      });
    } else {
      console.log('✅ Aucun doublon trouvé !');
    }

    // Vérifier les noms similaires
    console.log('\n🔍 Vérification des noms similaires...');
    const allProfiles = await prisma.profile.findMany({
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

    // Grouper par nom + date de naissance + genre pour détecter les vrais doublons
    const profilesByUniqueKey = new Map<string, typeof allProfiles>();
    allProfiles.forEach((profile) => {
      // Créer une clé unique basée sur nom + date de naissance + genre
      const birthDateStr = profile.birthDate
        ? profile.birthDate.toISOString().split('T')[0]
        : 'unknown';
      const genderStr = profile.gender || 'unknown';
      const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase().trim();
      const uniqueKey = `${fullName}|${birthDateStr}|${genderStr}`;

      if (!profilesByUniqueKey.has(uniqueKey)) {
        profilesByUniqueKey.set(uniqueKey, []);
      }
      profilesByUniqueKey.get(uniqueKey)!.push(profile);
    });

    // Trouver les vrais doublons (même nom + même date de naissance + même genre)
    const trueDuplicates = Array.from(profilesByUniqueKey.entries())
      .filter(([, profiles]) => profiles.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    // Grouper aussi par nom seulement pour les noms similaires
    const profilesByName = new Map<string, typeof allProfiles>();
    allProfiles.forEach((profile) => {
      const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase().trim();
      if (!profilesByName.has(fullName)) {
        profilesByName.set(fullName, []);
      }
      profilesByName.get(fullName)!.push(profile);
    });

    const similarNames = Array.from(profilesByName.entries())
      .filter(([, profiles]) => profiles.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    if (trueDuplicates.length > 0) {
      console.log(`\n🚨 VRAIS DOUBLONS trouvés : ${trueDuplicates.length}`);
      trueDuplicates.forEach(([uniqueKey, profiles]) => {
        const [name, birthDate, gender] = uniqueKey.split('|');
        console.log(
          `\n🔴 DOUBLON : "${name}" (${birthDate}, ${gender}) - ${profiles.length} profils :`,
        );
        profiles.forEach((profile, index) => {
          console.log(
            `   ${index + 1}. ${profile.firstName} ${profile.lastName} (${profile.id}) - ${profile.requestsFor.length} demande(s) - ${profile.status}`,
          );
        });
      });
    } else {
      console.log('\n✅ Aucun vrai doublon trouvé !');
    }

    if (similarNames.length > 0) {
      console.log(`\n⚠️  Noms similaires trouvés : ${similarNames.length}`);
      similarNames.forEach(([fullName, profiles]) => {
        console.log(`\n📝 "${fullName}" (${profiles.length} profils) :`);
        profiles.forEach((profile, index) => {
          const birthDateStr = profile.birthDate
            ? profile.birthDate.toISOString().split('T')[0]
            : 'N/A';
          const genderStr = profile.gender || 'N/A';
          console.log(
            `   ${index + 1}. ${profile.firstName} ${profile.lastName} (${profile.id}) - ${profile.requestsFor.length} demande(s) - ${birthDateStr} - ${genderStr}`,
          );
        });
      });
    } else {
      console.log('\n✅ Aucun nom similaire trouvé !');
    }

    // Afficher aussi le total des demandes
    const totalRequests = await prisma.serviceRequest.count({
      where: { serviceCategory: 'REGISTRATION' },
    });

    console.log(`\n📊 Total des demandes d'inscription : ${totalRequests}`);

    console.log('✅ Vérification terminée !');
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
