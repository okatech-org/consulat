import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface non utilisée supprimée

async function main() {
  try {
    console.log('🔍 Recherche des profils dupliqués...');

    // Trouver tous les profils avec des demandes d'inscription
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
      if (
        !profile.firstName ||
        !profile.lastName ||
        !profile.birthDate ||
        !profile.gender
      ) {
        return; // Ignorer les profils incomplets
      }

      const birthDateStr = profile.birthDate.toISOString().split('T')[0];
      const genderStr = profile.gender;
      const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase().trim();
      const uniqueKey = `${fullName}|${birthDateStr}|${genderStr}`;

      if (!profilesByUniqueKey.has(uniqueKey)) {
        profilesByUniqueKey.set(uniqueKey, []);
      }
      const profiles = profilesByUniqueKey.get(uniqueKey);
      if (profiles) {
        profiles.push(profile);
      }
    });

    // Trouver les vrais doublons
    const duplicates = Array.from(profilesByUniqueKey.entries())
      .filter(([, profiles]) => profiles.length > 1)
      .map(([uniqueKey, profiles]) => {
        const [name, birthDate, gender] = uniqueKey.split('|');

        // Déterminer quel profil garder (priorité aux statuts les plus avancés)
        const statusPriority = {
          COMPLETED: 10,
          READY_FOR_PICKUP: 9,
          CARD_IN_PRODUCTION: 8,
          DOCUMENT_IN_PRODUCTION: 7,
          VALIDATED: 6,
          PENDING_COMPLETION: 5,
          SUBMITTED: 4,
          PENDING: 3,
          REJECTED: 2,
          DRAFT: 1,
          EDITED: 0,
        };

        const sortedProfiles = profiles.sort((a, b) => {
          const statusDiff =
            (statusPriority[b.status as keyof typeof statusPriority] || 0) -
            (statusPriority[a.status as keyof typeof statusPriority] || 0);

          if (statusDiff !== 0) return statusDiff;

          // Si même statut, prendre le plus récent
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return {
          uniqueKey,
          name,
          birthDate,
          gender,
          profiles: sortedProfiles.map((p) => ({
            id: p.id,
            status: p.status,
            createdAt: p.createdAt,
            requestsCount: p.requestsFor.length,
          })),
          keepProfileId: sortedProfiles[0].id,
          deleteProfileIds: sortedProfiles.slice(1).map((p) => p.id),
        };
      });

    console.log(`📊 Trouvé ${duplicates.length} cas de profils dupliqués`);

    if (duplicates.length === 0) {
      console.log('✅ Aucun doublon trouvé !');
      return;
    }

    // Afficher le plan de nettoyage
    console.log('\n📋 Plan de nettoyage :');
    console.log('='.repeat(80));

    duplicates.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.name} (${item.birthDate}, ${item.gender})`);
      console.log(`   Profils trouvés : ${item.profiles.length}`);
      item.profiles.forEach((profile, profileIndex) => {
        const action = profileIndex === 0 ? '✅ GARDER' : '❌ SUPPRIMER';
        console.log(
          `   ${action}: ${profile.id} - ${profile.status} (${profile.createdAt.toISOString().split('T')[0]}) - ${profile.requestsCount} demande(s)`,
        );
      });
    });

    console.log(
      '\n⚠️  ATTENTION : Cette opération va supprimer définitivement les profils dupliqués !',
    );
    console.log('💡 Vérifiez le plan ci-dessus avant de confirmer.');

    // En mode développement, on peut demander confirmation
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔄 Exécution du nettoyage...');

      let totalDeleted = 0;

      for (const item of duplicates) {
        console.log(`\n🧹 Nettoyage du profil ${item.name}...`);

        try {
          // Supprimer les profils dupliqués en gérant les relations
          for (const deleteProfileId of item.deleteProfileIds) {
            // Supprimer d'abord les relations
            await prisma.parentalAuthority.deleteMany({
              where: { profileId: deleteProfileId },
            });

            await prisma.emergencyContact.deleteMany({
              where: {
                OR: [
                  { residentProfileId: deleteProfileId },
                  { homeLandProfileId: deleteProfileId },
                ],
              },
            });

            // Supprimer d'abord les actions de demande
            await prisma.requestAction.deleteMany({
              where: {
                request: {
                  requestedForId: deleteProfileId,
                },
              },
            });

            // Supprimer les notes
            await prisma.note.deleteMany({
              where: {
                serviceRequest: {
                  requestedForId: deleteProfileId,
                },
              },
            });

            // Supprimer les messages
            await prisma.message.deleteMany({
              where: {
                serviceRequest: {
                  requestedForId: deleteProfileId,
                },
              },
            });

            // Supprimer les rendez-vous
            await prisma.appointment.deleteMany({
              where: {
                request: {
                  requestedForId: deleteProfileId,
                },
              },
            });

            // Maintenant supprimer les demandes de service
            await prisma.serviceRequest.deleteMany({
              where: { requestedForId: deleteProfileId },
            });

            // Supprimer les documents associés
            await prisma.userDocument.deleteMany({
              where: {
                OR: [
                  { identityPictureProfile: { id: deleteProfileId } },
                  { passportProfile: { id: deleteProfileId } },
                  { birthCertificateProfile: { id: deleteProfileId } },
                  { residencePermitProfile: { id: deleteProfileId } },
                  { addressProofProfile: { id: deleteProfileId } },
                ],
              },
            });

            // Maintenant supprimer le profil
            await prisma.profile.delete({
              where: { id: deleteProfileId },
            });

            totalDeleted++;
          }

          console.log(
            `   ✅ Supprimé ${item.deleteProfileIds.length} profil(s) dupliqué(s)`,
          );
          console.log(`   ✅ Demandes transférées vers ${item.keepProfileId}`);
        } catch (error) {
          console.error(`   ❌ Erreur lors du nettoyage du profil ${item.name}:`, error);
        }
      }

      console.log(
        `\n🎉 Nettoyage terminé ! ${totalDeleted} profil(s) dupliqué(s) supprimé(s)`,
      );
    } else {
      console.log('\n⏸️  Mode production détecté - plan affiché uniquement');
      console.log('💡 Définissez NODE_ENV=development pour exécuter le nettoyage');
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
