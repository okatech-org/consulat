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
import { TRPCError } from '@trpc/server';

// Schéma pour les filtres de recherche avec pagination
const skillsDirectoryFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.nativeEnum(SkillCategory).optional(),
  level: z.nativeEnum(ExpertiseLevel).optional(),
  workStatus: z.nativeEnum(WorkStatus).optional(),
  hasCompleteProfile: z.boolean().optional(),
  marketDemand: z.enum(['high', 'medium', 'low']).optional(),
  page: z.number().default(1),
  limit: z.number().default(12),
  sortBy: z.enum(['name', 'profession', 'updatedAt', 'marketDemand']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schéma pour la recherche de profils par compétence
const searchBySkillSchema = z.object({
  skillName: z.string(),
  minLevel: z.nativeEnum(ExpertiseLevel).optional(),
});

export const skillsDirectoryRouter = createTRPCRouter({
  // Récupérer l'annuaire complet des compétences avec pagination
  getDirectory: protectedProcedure
    .input(skillsDirectoryFiltersSchema)
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions pour INTEL_AGENT
      if (ctx.session.user.role !== 'INTEL_AGENT' && 
          !hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Permissions insuffisantes',
        });
      }

      const { page, limit, sortBy, sortOrder, ...filters } = input;
      const skip = (page - 1) * limit;

      // Construire les conditions de recherche
      const where = {
        // Filtrer uniquement les profils gabonais avec informations
        nationality: 'Gabonaise',
        OR: [
          { profession: { not: null } },
          { workStatus: { not: null } },
        ],
        ...(filters.workStatus && { workStatus: filters.workStatus }),
        ...(filters.search && {
          OR: [
            { profession: { contains: filters.search, mode: 'insensitive' as const } },
            { employer: { contains: filters.search, mode: 'insensitive' as const } },
            { firstName: { contains: filters.search, mode: 'insensitive' as const } },
            { lastName: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        }),
      };

      // Compter le total pour la pagination
      const total = await ctx.db.profile.count({ where });

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
        skip,
        take: limit,
        orderBy: sortBy === 'name' 
          ? [{ lastName: sortOrder }, { firstName: sortOrder }]
          : sortBy === 'profession'
          ? { profession: sortOrder }
          : { updatedAt: sortOrder },
      });

      // Analyser les compétences de chaque profil
      const profilesWithSkills = profiles.map(profile => {
        const skills = extractSkillsFromProfile({
          workStatus: profile.workStatus,
          profession: profile.profession,
          employer: profile.employer,
          employerAddress: profile.employerAddress,
          activityInGabon: profile.activityInGabon,
          birthDate: profile.birthDate,
        });

        // Appliquer les filtres sur les compétences analysées
        if (filters.category && skills.category !== filters.category) {
          return null;
        }
        if (filters.level && skills.experienceLevel !== filters.level) {
          return null;
        }
        if (filters.marketDemand && skills.marketDemand !== filters.marketDemand) {
          return null;
        }
        if (filters.hasCompleteProfile) {
          const completeness = calculateProfileCompleteness(profile);
          if (completeness < 80) return null;
        }

        return {
          ...profile,
          skills,
        };
      }).filter(Boolean);

      // Calculer les statistiques globales
      const allProfiles = await ctx.db.profile.findMany({
        where: {
          nationality: 'Gabonaise',
          OR: [
            { profession: { not: null } },
            { workStatus: { not: null } },
          ],
        },
        select: {
          workStatus: true,
          profession: true,
          employer: true,
          employerAddress: true,
          activityInGabon: true,
          birthDate: true,
        },
      });

      // Analyser toutes les compétences pour les statistiques
      const allSkillsAnalyses = allProfiles.map(p => extractSkillsFromProfile(p));
      
      // Collecter toutes les compétences uniques
      const allSkills = new Map<string, { count: number; category: SkillCategory }>();
      allSkillsAnalyses.forEach(analysis => {
        [...analysis.primarySkills, ...analysis.secondarySkills].forEach(skill => {
          const existing = allSkills.get(skill.name);
          if (existing) {
            existing.count++;
          } else {
            allSkills.set(skill.name, { count: 1, category: analysis.category });
          }
        });
      });

      // Top 10 compétences
      const topSkills = Array.from(allSkills.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([name, data]) => ({
          name,
          count: data.count,
          category: data.category,
        }));

      // Distribution par catégorie
      const categoryDistribution = allSkillsAnalyses.reduce((acc, analysis) => {
        acc[analysis.category] = (acc[analysis.category] || 0) + 1;
        return acc;
      }, {} as Record<SkillCategory, number>);

      // Distribution par niveau
      const levelDistribution = allSkillsAnalyses.reduce((acc, analysis) => {
        acc[analysis.experienceLevel] = (acc[analysis.experienceLevel] || 0) + 1;
        return acc;
      }, {} as Record<ExpertiseLevel, number>);

      // Distribution par demande du marché
      const marketDemandDistribution = allSkillsAnalyses.reduce((acc, analysis) => {
        acc[analysis.marketDemand] = (acc[analysis.marketDemand] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Distribution par statut professionnel
      const workStatusDistribution = allProfiles.reduce((acc, profile) => {
        if (profile.workStatus) {
          acc[profile.workStatus] = (acc[profile.workStatus] || 0) + 1;
        }
        return acc;
      }, {} as Record<WorkStatus, number>);

      // Calculer le taux de complétude moyen
      const completionRates = allProfiles.map(p => calculateProfileCompleteness(p));
      const avgCompletionRate = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;

      // Identifier les ressortissants à la recherche d'emploi
      const jobSeekers = allProfiles.filter(p => 
        p.workStatus === 'UNEMPLOYED' || 
        (p.profession?.toLowerCase().includes('recherche') && 
         p.profession?.toLowerCase().includes('emploi'))
      ).length;

      return {
        profiles: profilesWithSkills,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        statistics: {
          totalProfiles: allProfiles.length,
          totalUniqueSkills: allSkills.size,
          completionRate: avgCompletionRate,
          jobSeekers,
          topSkills,
          categoryDistribution,
          levelDistribution,
          marketDemandDistribution,
          workStatusDistribution,
        },
      };
    }),

  // Recherche de profils par compétence spécifique
  searchBySkill: protectedProcedure
    .input(searchBySkillSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (ctx.session.user.role !== 'INTEL_AGENT' && 
          !hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Permissions insuffisantes',
        });
      }

      // Récupérer tous les profils gabonais
      const profiles = await ctx.db.profile.findMany({
        where: {
          nationality: 'Gabonaise',
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
          employerAddress: true,
          activityInGabon: true,
          birthDate: true,
          address: {
            select: {
              city: true,
              country: true,
            },
          },
        },
      });

      // Filtrer les profils qui ont la compétence recherchée
      const matchingProfiles = profiles
        .map(profile => {
          const skills = extractSkillsFromProfile({
            workStatus: profile.workStatus,
            profession: profile.profession,
            employer: profile.employer,
            employerAddress: profile.employerAddress,
            activityInGabon: profile.activityInGabon,
            birthDate: profile.birthDate,
          });

          // Chercher la compétence dans les compétences primaires et secondaires
          const allSkills = [...skills.primarySkills, ...skills.secondarySkills];
          const matchingSkill = allSkills.find(skill => 
            skill.name.toLowerCase().includes(input.skillName.toLowerCase())
          );

          if (!matchingSkill) return null;

          // Vérifier le niveau minimum si spécifié
          if (input.minLevel) {
            const levelOrder = ['junior', 'intermediaire', 'senior', 'expert'];
            const skillLevelIndex = levelOrder.indexOf(skills.experienceLevel);
            const minLevelIndex = levelOrder.indexOf(input.minLevel);
            if (skillLevelIndex < minLevelIndex) return null;
          }

          return {
            ...profile,
            skills,
            matchingSkill,
          };
        })
        .filter(Boolean);

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
      if (ctx.session.user.role !== 'INTEL_AGENT' && 
          !hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Permissions insuffisantes',
        });
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
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profil non trouvé',
        });
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
          age,
          email: profile.email,
          phone: profile.phoneNumber,
          location: profile.address?.city 
            ? `${profile.address.city}, ${profile.address.country || 'France'}`
            : null,
          nationality: profile.nationality,
          image: profile.user?.image,
        },

        // Résumé professionnel
        summary: skillsAnalysis.cvSummary || 
          `Professionnel ${profile.workStatus === 'UNEMPLOYED' ? 'à la recherche d\'opportunités' : 'expérimenté'} dans le domaine ${skillsAnalysis.category}`,

        // Situation professionnelle
        professional: {
          status: profile.workStatus,
          statusLabel: profile.workStatus === 'UNEMPLOYED' 
            ? 'Ressortissant gabonais à la recherche d\'emploi'
            : profile.workStatus,
          title: profile.profession,
          employer: profile.employer,
          location: profile.employerAddress,
          experienceLevel: skillsAnalysis.experienceLevel,
          category: skillsAnalysis.category,
          activityInGabon: profile.activityInGabon,
        },

        // Compétences
        skills: {
          primary: skillsAnalysis.primarySkills,
          secondary: skillsAnalysis.secondarySkills,
          suggested: skillsAnalysis.suggestedSkills,
          category: skillsAnalysis.category,
        },

        // Indicateurs
        indicators: {
          marketDemand: skillsAnalysis.marketDemand,
          profileCompleteness: calculateProfileCompleteness(profile),
          isJobSeeker: profile.workStatus === 'UNEMPLOYED',
          hasInternationalExperience: profile.employerAddress?.includes('International') || false,
        },

        // Métadonnées
        metadata: {
          profileId: profile.id,
          lastUpdated: new Date(),
          extractedAt: new Date(),
        },
      };

      return cv;
    }),

  // Obtenir des recommandations de profils similaires
  getSimilarProfiles: protectedProcedure
    .input(z.object({
      profileId: z.string(),
      limit: z.number().default(5),
    }))
    .query(async ({ ctx, input }) => {
      // Vérifier les permissions
      if (ctx.session.user.role !== 'INTEL_AGENT' && 
          !hasPermission(ctx.session.user, 'profiles', 'view')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Permissions insuffisantes',
        });
      }

      // Récupérer le profil de référence
      const referenceProfile = await ctx.db.profile.findUnique({
        where: { id: input.profileId },
        select: {
          workStatus: true,
          profession: true,
          employer: true,
          employerAddress: true,
          activityInGabon: true,
          birthDate: true,
        },
      });

      if (!referenceProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profil de référence non trouvé',
        });
      }

      // Analyser les compétences du profil de référence
      const referenceSkills = extractSkillsFromProfile(referenceProfile);
      const allReferenceSkills = [...referenceSkills.primarySkills, ...referenceSkills.secondarySkills];

      // Récupérer les profils candidats
      const candidateProfiles = await ctx.db.profile.findMany({
        where: {
          id: { not: input.profileId },
          nationality: 'Gabonaise',
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
          employerAddress: true,
          activityInGabon: true,
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

  // Obtenir les statistiques des compétences pour le Gabon
  getSkillsStatisticsForGabon: protectedProcedure
    .query(async ({ ctx }) => {
      // Vérifier les permissions
      if (ctx.session.user.role !== 'INTEL_AGENT' && 
          ctx.session.user.role !== 'SUPER_ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Permissions insuffisantes',
        });
      }

      // Récupérer tous les profils gabonais
      const profiles = await ctx.db.profile.findMany({
        where: {
          nationality: 'Gabonaise',
        },
        select: {
          workStatus: true,
          profession: true,
          employer: true,
          employerAddress: true,
          activityInGabon: true,
          birthDate: true,
          address: {
            select: {
              country: true,
            },
          },
        },
      });

      // Analyser les compétences
      const skillsAnalyses = profiles.map(p => extractSkillsFromProfile(p));

      // Statistiques par pays de résidence
      const byCountry = profiles.reduce((acc, p) => {
        const country = p.address?.country || 'Non spécifié';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Compétences les plus demandées
      const highDemandSkills = skillsAnalyses
        .filter(s => s.marketDemand === 'high')
        .flatMap(s => [...s.primarySkills, ...s.secondarySkills])
        .reduce((acc, skill) => {
          acc[skill.name] = (acc[skill.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      // Profils par secteur d'activité
      const bySector = skillsAnalyses.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {} as Record<SkillCategory, number>);

      // Ressortissants à la recherche d'emploi
      const jobSeekers = profiles.filter(p => p.workStatus === 'UNEMPLOYED');
      const jobSeekersByCategory = jobSeekers
        .map(p => extractSkillsFromProfile(p))
        .reduce((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        }, {} as Record<SkillCategory, number>);

      return {
        totalProfiles: profiles.length,
        totalJobSeekers: jobSeekers.length,
        byCountry,
        bySector,
        highDemandSkills: Object.entries(highDemandSkills)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([skill, count]) => ({ skill, count })),
        jobSeekersByCategory,
        potentialForRecruitment: {
          high: skillsAnalyses.filter(s => s.marketDemand === 'high').length,
          medium: skillsAnalyses.filter(s => s.marketDemand === 'medium').length,
          low: skillsAnalyses.filter(s => s.marketDemand === 'low').length,
        },
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
    profile.workStatus,
    profile.profession,
    profile.employer,
    profile.address?.city,
    profile.birthDate,
  ];
  
  const filledFields = fields.filter(f => f !== null && f !== undefined && f !== '').length;
  return Math.round((filledFields / fields.length) * 100);
}