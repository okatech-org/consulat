import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DuplicateInfo {
  profileId: string;
  profileName: string;
  requests: {
    id: string;
    status: string;
    createdAt: Date;
    submittedAt: Date | null;
  }[];
  keepRequestId: string;
  deleteRequestIds: string[];
}

async function main() {
  try {
    console.log("🔍 Recherche des profils avec plusieurs demandes d'inscription...");

    // Trouver tous les profils avec plusieurs demandes d'inscription
    const profilesWithDuplicates = await prisma.profile.findMany({
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
          orderBy: [
            { createdAt: 'desc' }, // Plus récent en premier
          ],
        },
      },
    });

    const duplicates = profilesWithDuplicates.filter(
      (profile) => profile.requestsFor.length > 1,
    );

    console.log(`📊 Trouvé ${duplicates.length} profils avec des demandes dupliquées`);

    if (duplicates.length === 0) {
      console.log('✅ Aucun doublon trouvé !');
      return;
    }

    const cleanupPlan: DuplicateInfo[] = [];

    // Analyser chaque profil et déterminer quelle demande garder
    for (const profile of duplicates) {
      const requests = profile.requestsFor.map((req) => ({
        id: req.id,
        status: req.status,
        createdAt: req.createdAt,
        submittedAt: req.submittedAt,
      }));

      // Logique pour déterminer quelle demande garder :
      // 1. Priorité aux statuts les plus avancés
      // 2. Si même statut, prendre la plus récente
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

      const sortedRequests = requests.sort((a, b) => {
        const statusDiff =
          (statusPriority[b.status as keyof typeof statusPriority] || 0) -
          (statusPriority[a.status as keyof typeof statusPriority] || 0);

        if (statusDiff !== 0) return statusDiff;

        // Si même statut, prendre la plus récente
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const keepRequest = sortedRequests[0];
      const deleteRequests = sortedRequests.slice(1);

      cleanupPlan.push({
        profileId: profile.id,
        profileName: `${profile.firstName} ${profile.lastName}`,
        requests: sortedRequests,
        keepRequestId: keepRequest.id,
        deleteRequestIds: deleteRequests.map((req) => req.id),
      });
    }

    // Afficher le plan de nettoyage
    console.log('\n📋 Plan de nettoyage :');
    console.log('='.repeat(80));

    cleanupPlan.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.profileName} (${item.profileId})`);
      console.log(`   Demandes trouvées : ${item.requests.length}`);
      item.requests.forEach((req, reqIndex) => {
        const action = reqIndex === 0 ? '✅ GARDER' : '❌ SUPPRIMER';
        console.log(
          `   ${action}: ${req.id} - ${req.status} (${req.createdAt.toISOString().split('T')[0]})`,
        );
      });
    });

    console.log(
      '\n⚠️  ATTENTION : Cette opération va supprimer définitivement les demandes dupliquées !',
    );
    console.log('💡 Vérifiez le plan ci-dessus avant de confirmer.');

    // En mode développement, on peut demander confirmation
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔄 Exécution du nettoyage...');

      let totalDeleted = 0;

      for (const item of cleanupPlan) {
        console.log(`\n🧹 Nettoyage du profil ${item.profileName}...`);

        try {
          // Mettre à jour le validationRequestId du profil pour pointer vers la bonne demande
          await prisma.profile.update({
            where: { id: item.profileId },
            data: { validationRequestId: item.keepRequestId },
          });

          // Supprimer les demandes dupliquées en cascade
          let deleteResult = { count: 0 };

          for (const requestId of item.deleteRequestIds) {
            try {
              // Supprimer d'abord les relations
              await prisma.requestAction.deleteMany({
                where: { requestId },
              });

              await prisma.note.deleteMany({
                where: { serviceRequestId: requestId },
              });

              await prisma.message.deleteMany({
                where: { serviceRequestId: requestId },
              });

              await prisma.appointment.deleteMany({
                where: { requestId },
              });

              await prisma.userDocument.deleteMany({
                where: { serviceRequestId: requestId },
              });

              await prisma.generatedDocument.deleteMany({
                where: { serviceRequestId: requestId },
              });

              // Enfin supprimer la demande
              await prisma.serviceRequest.delete({
                where: { id: requestId },
              });

              deleteResult.count++;
            } catch (error) {
              console.error(
                `   ⚠️  Erreur lors de la suppression de ${requestId}:`,
                error,
              );
            }
          }

          totalDeleted += deleteResult.count;
          console.log(`   ✅ Supprimé ${deleteResult.count} demande(s) dupliquée(s)`);
          console.log(`   ✅ validationRequestId mis à jour vers ${item.keepRequestId}`);
        } catch (error) {
          console.error(
            `   ❌ Erreur lors du nettoyage du profil ${item.profileId}:`,
            error,
          );
        }
      }

      console.log(
        `\n🎉 Nettoyage terminé ! ${totalDeleted} demande(s) dupliquée(s) supprimée(s)`,
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
