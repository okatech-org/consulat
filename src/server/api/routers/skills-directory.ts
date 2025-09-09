import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { hasPermission } from '@/lib/permissions/utils';
import { 
  extractSkillsFromProfile, 
  calculateSkillCompatibility,
  type ProfileSkillsAnalysis,
  type ExtractedSkill,
  SkillCategory,
  ExpertiseLevel 
} from '@/lib/skills-extractor';
import { WorkStatus } from '@prisma/client';

// Schéma pour les filtres de recherche
const skillsDirectoryFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.nativeEnum(SkillCategory).optional(),
  level: z.nativeEnum(ExpertiseLevel).optional(),
  workStatus: z.nativeEnum(WorkStatus).optional(),
  hasCompleteProfile: z.boolean().optional(),
  marketDemand: z.enum(['high', 'medium', 'low']).optional(),
});

// Schéma pour la recherche de profils par compétence
const searchBySkillSchema = z.object({
  skillName: z.string(),
  category: z.nativeEnum(SkillCategory).optional(),
  minLevel: z.nativeEnum(ExpertiseLevel).optional(),
});

export const skillsDirectoryRouter = createTRPCRouter({
  // Récupérer l'annuaire complet des compétences
  getDirectory: protectedProcedure
    .input(skillsDirectoryFiltersSchema.optional())
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new Error('Permissions insuffisantes');
      }

      // Construire les conditions de recherche
      const where = {
        // Filtrer uniquement les profils avec informations professionnelles
        OR: [
          { profession: { not: null } },
          { workStatus: { not: null } },
        ],
        ...(input?.workStatus && { workStatus: input.workStatus }),
        ...(input?.search && {
          OR: [
            { profession: { contains: input.search, mode: 'insensitive' as const } },
            { employer: { contains: input.search, mode: 'insensitive' as const } },
            { firstName: { contains: input.search, mode: 'insensitive' as const } },
            { lastName: { contains: input.search, mode: 'insensitive' as const } },
          ],
        }),
      };

      // Récupérer les profils avec informations professionnelles
      const profiles = await ctx.db.profile.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          workStatus: true,
          profession: true,
          employer: true,
          employerAddress: true,
          activityInGabon: true,
          birthDate: true,
          address: {
            select: {
              city: true,
              country: true,
            },
          },
          user: {
            select: {
              image: true,
            },
          },
        },
        orderBy: [
          { profession: 'asc' },
          { updatedAt: 'desc' },
        ],
      });

      // Analyser les compétences de chaque profil
      const profilesWithSkills = profiles.map(profile => {
        const skillsAnalysis = extractSkillsFromProfile({
          workStatus: profile.workStatus,
          profession: profile.profession,
          employer: profile.employer,
          employerAddress: profile.employerAddress,
          activityInGabon: profile.activityInGabon,
          birthDate: profile.birthDate,
        });

        return {
          ...profile,
          skills: skillsAnalysis,
        };
      });

      // Filtrer par catégorie si demandé
      let filteredProfiles = profilesWithSkills;
      if (input?.category) {
        filteredProfiles = filteredProfiles.filter(p => p.skills.category === input.category);
      }

      // Filtrer par niveau si demandé
      if (input?.level) {
        filteredProfiles = filteredProfiles.filter(p => p.skills.experienceLevel === input.level);
      }

      // Filtrer par demande du marché si demandé
      if (input?.marketDemand) {
        filteredProfiles = filteredProfiles.filter(p => p.skills.marketDemand === input.marketDemand);
      }

      // Filtrer par profil complet si demandé
      if (input?.hasCompleteProfile) {
        filteredProfiles = filteredProfiles.filter(p => 
          p.profession && p.employer && p.workStatus && p.email && p.phoneNumber
        );
      }

      // Calculer les statistiques globales
      const allSkills = new Map<string, { count: number; category: SkillCategory; levels: Set<ExpertiseLevel> }>();
      const categoryStats = new Map<SkillCategory, number>();
      const levelStats = new Map<ExpertiseLevel, number>();
      const demandStats = { high: 0, medium: 0, low: 0 };

      filteredProfiles.forEach(profile => {
        // Compter les compétences
        [...profile.skills.primarySkills, ...profile.skills.secondarySkills].forEach(skill => {
          const existing = allSkills.get(skill.name) || { 
            count: 0, 
            category: skill.category, 
            levels: new Set<ExpertiseLevel>() 
          };
          existing.count++;
          existing.levels.add(skill.level);
          allSkills.set(skill.name, existing);
        });

        // Statistiques par catégorie
        categoryStats.set(
          profile.skills.category, 
          (categoryStats.get(profile.skills.category) || 0) + 1
        );

        // Statistiques par niveau
        levelStats.set(
          profile.skills.experienceLevel,
          (levelStats.get(profile.skills.experienceLevel) || 0) + 1
        );

        // Statistiques de demande
        demandStats[profile.skills.marketDemand]++;
      });

      // Top 10 des compétences
      const topSkills = Array.from(allSkills.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([name, data]) => ({
          name,
          count: data.count,
          category: data.category,
          levels: Array.from(data.levels),
        }));

      return {
        profiles: filteredProfiles,
        total: filteredProfiles.length,
        statistics: {
          totalProfiles: filteredProfiles.length,
          totalUniqueSkills: allSkills.size,
          topSkills,
          categoryDistribution: Object.fromEntries(categoryStats),
          levelDistribution: Object.fromEntries(levelStats),
          marketDemandDistribution: demandStats,
          completionRate: (filteredProfiles.filter(p => 
            p.profession && p.employer && p.workStatus
          ).length / filteredProfiles.length) * 100,
        },
      };
    }),

  // Rechercher des profils par compétence spécifique
  searchBySkill: protectedProcedure
    .input(searchBySkillSchema)
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new Error('Permissions insuffisantes');
      }

      // Récupérer tous les profils avec informations professionnelles
      const profiles = await ctx.db.profile.findMany({
        where: {
          OR: [
            { profession: { not: null } },
            { workStatus: { not: null } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          workStatus: true,
          profession: true,
          employer: true,
          birthDate: true,
          address: {
            select: {
              city: true,
              country: true,
            },
          },
        },
      });

      // Analyser et filtrer par compétence
      const matchingProfiles = profiles
        .map(profile => {
          const skillsAnalysis = extractSkillsFromProfile({
            workStatus: profile.workStatus,
            profession: profile.profession,
            employer: profile.employer,
            birthDate: profile.birthDate,
          });

          // Vérifier si le profil a la compétence recherchée
          const allSkills = [...skillsAnalysis.primarySkills, ...skillsAnalysis.secondarySkills];
          const matchingSkill = allSkills.find(skill => 
            skill.name.toLowerCase().includes(input.skillName.toLowerCase()) ||
            input.skillName.toLowerCase().includes(skill.name.toLowerCase())
          );

          if (!matchingSkill) return null;

          // Vérifier la catégorie si spécifiée
          if (input.category && matchingSkill.category !== input.category) return null;

          // Vérifier le niveau minimum si spécifié
          if (input.minLevel) {
            const levels = Object.values(ExpertiseLevel);
            const skillLevelIndex = levels.indexOf(matchingSkill.level);
            const minLevelIndex = levels.indexOf(input.minLevel);
            if (skillLevelIndex < minLevelIndex) return null;
          }

          return {
            ...profile,
            skills: skillsAnalysis,
            matchingSkill,
            relevanceScore: matchingSkill.relevanceScore,
          };
        })
        .filter(Boolean)
        .sort((a, b) => (b?.relevanceScore || 0) - (a?.relevanceScore || 0));

      return {
        profiles: matchingProfiles,
        total: matchingProfiles.length,
      };
    }),

  // Obtenir un CV synthétisé pour un profil
  getProfileCV: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new Error('Permissions insuffisantes');
      }

      const profile = await ctx.db.profile.findUnique({
        where: { id: input.profileId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          birthDate: true,
          nationality: true,
          workStatus: true,
          profession: true,
          employer: true,
          employerAddress: true,
          activityInGabon: true,
          address: {
            select: {
              street: true,
              city: true,
              postalCode: true,
              country: true,
            },
          },
          user: {
            select: {
              image: true,
            },
          },
        },
      });

      if (!profile) {
        throw new Error('Profil non trouvé');
      }

      // Analyser les compétences
      const skillsAnalysis = extractSkillsFromProfile({
        workStatus: profile.workStatus,
        profession: profile.profession,
        employer: profile.employer,
        employerAddress: profile.employerAddress,
        activityInGabon: profile.activityInGabon,
        birthDate: profile.birthDate,
      });

      // Calculer l'âge et l'expérience
      const age = profile.birthDate 
        ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear()
        : null;

      // Générer le CV structuré
      const cv = {
        // Informations personnelles
        personal: {
          fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
          email: profile.email,
          phone: profile.phoneNumber,
          age,
          nationality: profile.nationality,
          location: profile.address?.city || profile.address?.country,
          image: profile.user?.image,
        },
        
        // Informations professionnelles
        professional: {
          currentStatus: profile.workStatus,
          title: profile.profession,
          employer: profile.employer,
          employerLocation: profile.employerAddress,
          experienceLevel: skillsAnalysis.experienceLevel,
          category: skillsAnalysis.category,
        },
        
        // Compétences
        skills: {
          primary: skillsAnalysis.primarySkills.map(s => ({
            name: s.name,
            level: s.level,
            category: s.category,
          })),
          secondary: skillsAnalysis.secondarySkills.map(s => ({
            name: s.name,
            level: s.level,
            category: s.category,
          })),
          suggested: skillsAnalysis.suggestedSkills.map(s => s.name),
        },
        
        // Résumé
        summary: skillsAnalysis.cvSummary,
        
        // Indicateurs
        indicators: {
          marketDemand: skillsAnalysis.marketDemand,
          profileCompleteness: calculateProfileCompleteness(profile),
          skillsCount: skillsAnalysis.primarySkills.length + skillsAnalysis.secondarySkills.length,
        },
        
        // Activités au Gabon (si disponible)
        additionalInfo: {
          activityInGabon: profile.activityInGabon,
        },
      };

      return cv;
    }),

  // Obtenir des recommandations de profils similaires
  getSimilarProfiles: protectedProcedure
    .input(z.object({ 
      profileId: z.string(),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (!hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new Error('Permissions insuffisantes');
      }

      // Récupérer le profil de référence
      const referenceProfile = await ctx.db.profile.findUnique({
        where: { id: input.profileId },
        select: {
          id: true,
          workStatus: true,
          profession: true,
          employer: true,
          birthDate: true,
        },
      });

      if (!referenceProfile) {
        throw new Error('Profil non trouvé');
      }

      // Analyser les compétences du profil de référence
      const referenceSkills = extractSkillsFromProfile(referenceProfile);
      const allReferenceSkills = [...referenceSkills.primarySkills, ...referenceSkills.secondarySkills];

      // Récupérer d'autres profils de la même catégorie
      const candidateProfiles = await ctx.db.profile.findMany({
        where: {
          id: { not: input.profileId },
          OR: [
            { profession: { not: null } },
            { workStatus: { not: null } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profession: true,
          workStatus: true,
          employer: true,
          birthDate: true,
        },
        take: 50, // Limiter pour performance
      });

      // Calculer la compatibilité avec chaque profil
      const profilesWithCompatibility = candidateProfiles
        .map(profile => {
          const skills = extractSkillsFromProfile(profile);
          const allSkills = [...skills.primarySkills, ...skills.secondarySkills];
          
          const compatibility = calculateSkillCompatibility(allReferenceSkills, allSkills);
          
          return {
            ...profile,
            skills,
            compatibilityScore: compatibility,
          };
        })
        .filter(p => p.compatibilityScore > 30) // Seuil minimum de compatibilité
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, input.limit);

      return {
        profiles: profilesWithCompatibility,
        referenceCategory: referenceSkills.category,
      };
    }),
});

// Fonction utilitaire pour calculer la complétude d'un profil
function calculateProfileCompleteness(profile: any): number {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.phoneNumber,
    profile.birthDate,
    profile.nationality,
    profile.workStatus,
    profile.profession,
    profile.employer,
    profile.address,
  ];
  
  const filledFields = fields.filter(f => f !== null && f !== undefined && f !== '').length;
  return Math.round((filledFields / fields.length) * 100);
}
