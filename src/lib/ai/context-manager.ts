import { User, UserRole } from '@prisma/client';
import { FullProfile } from '@/types';
import { db } from '@/lib/prisma';
import { ConsularServiceItem } from '@/types/consular-service';

export interface UserContext {
  user: User | null;
  profile: FullProfile | null;
  messageCount: number;
  availableServices?: ConsularServiceItem[]; // Type à définir selon votre structure de services
}

export class ContextManager {
  private static async getUserServices(userId: string) {
    ContextManager._userId = userId;
    // Récupérer les services disponibles pour l'utilisateur
    return await db.consularService.findMany({
      where: {
        isActive: true,
        // Ajouter d'autres conditions selon vos besoins
      },
    });
  }

  static async buildUserContext(user: User | null): Promise<string> {
    if (!user) {
      return `
Contexte utilisateur : Non connecté
Instructions spéciales :
- Limiter à 2 réponses maximum
- Après 2 réponses, inviter à se connecter ou s'inscrire
- Fournir les liens d'inscription et de connexion
`;
    }

    let context = `
Contexte utilisateur :
- Role: ${user.role}
- Nom: ${user.name || 'Non renseigné'}
- Email: ${user.email || 'Non renseigné'}
`;

    // Ajouter le profil si disponible
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      include: {
        address: true,
        addressInGabon: true,
        phone: true,
        passport: true,
        birthCertificate: true,
        residencePermit: true,
        addressProof: true,
        emergencyContact: {
          include: {
            phone: true,
          },
        },
      },
    });

    if (profile) {
      context += `
Données du Profil utilisateur :
${JSON.stringify(profile, null, 2)}
`;
    }

    // Ajouter les services disponibles
    const services = await this.getUserServices(user.id);
    if (services.length > 0) {
      context += `
Services disponibles :
${services.map((service) => `- ${service.name}: ${service.description}`).join('\n')}
`;
    }

    // Ajouter les instructions spécifiques selon le rôle
    context += this.getRoleSpecificInstructions(user.role);

    return context;
  }

  private static getRoleSpecificInstructions(role: UserRole): string {
    const instructions: Record<UserRole, string> = {
      SUPER_ADMIN: `
Instructions pour Super Admin:
- Accès à toutes les statistiques et analyses
- Peut demander des rapports sur les questions fréquentes
- Peut gérer la base de connaissances
- Accès aux informations de tous les utilisateurs
`,
      ADMIN: `
Instructions pour Admin:
- Peut gérer les profils utilisateurs
- Accès aux statistiques de base
- Peut voir les questions fréquentes
`,
      MANAGER: `
Instructions pour Manager:
- Peut gérer les demandes des utilisateurs
- Accès limité aux statistiques
`,
      USER: `
Instructions pour Utilisateur:
- Accès à son profil et ses documents
- Peut faire des demandes de services
- Peut poser des questions sur ses démarches
`,
    };

    return instructions[role] || '';
  }
}
