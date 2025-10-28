import { v } from 'convex/values';
import { query } from '../_generated/server';

// Enums pour les compétences (mêmes que dans lib/skills-extractor.ts)
export const SkillCategory = {
  TECHNIQUE: 'technique',
  MANAGEMENT: 'management',
  COMMERCIAL: 'commercial',
  ADMINISTRATIF: 'administratif',
  ARTISANAL: 'artisanal',
  MEDICAL: 'medical',
  JURIDIQUE: 'juridique',
  EDUCATION: 'education',
  TRANSPORT: 'transport',
  SECURITE: 'securite',
  AGRICULTURE: 'agriculture',
  RESTAURATION: 'restauration',
  FINANCE: 'finance',
} as const;

export const ExpertiseLevel = {
  JUNIOR: 'junior',
  INTERMEDIAIRE: 'intermediaire',
  SENIOR: 'senior',
  EXPERT: 'expert',
} as const;

// Mapping catégories vers mots-clés
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  [SkillCategory.TECHNIQUE]: [
    'développeur',
    'ingénieur',
    'informatique',
    'data',
    'tech',
    'it',
  ],
  [SkillCategory.MANAGEMENT]: [
    'manager',
    'directeur',
    'chef',
    'responsable',
    'coordinateur',
  ],
  [SkillCategory.COMMERCIAL]: ['commercial', 'vente', 'marketing', 'business', 'export'],
  [SkillCategory.ADMINISTRATIF]: ['administratif', 'assistant', 'secrétaire', 'bureau'],
  [SkillCategory.ARTISANAL]: [
    'artisan',
    'menuisier',
    'plombier',
    'électricien',
    'maçon',
    'coiffeur',
  ],
  [SkillCategory.MEDICAL]: [
    'médecin',
    'infirmier',
    'santé',
    'pharmacien',
    'aide-soignant',
  ],
  [SkillCategory.JURIDIQUE]: ['avocat', 'juriste', 'notaire', 'juridique', 'droit'],
  [SkillCategory.EDUCATION]: [
    'enseignant',
    'professeur',
    'formateur',
    'éducation',
    'école',
  ],
  [SkillCategory.TRANSPORT]: [
    'chauffeur',
    'logistique',
    'transport',
    'livreur',
    'routier',
  ],
  [SkillCategory.SECURITE]: ['sécurité', 'agent', 'militaire', 'police', 'gardien'],
  [SkillCategory.AGRICULTURE]: ['agriculteur', 'agronome', 'éleveur', 'fermier'],
  [SkillCategory.RESTAURATION]: [
    'cuisinier',
    'serveur',
    'hôtel',
    'restauration',
    'barman',
  ],
  [SkillCategory.FINANCE]: ['comptable', 'finance', 'banque', 'audit', 'trésorier'],
};

// Compétences de forte demande au Gabon
const HIGH_DEMAND_SKILLS = [
  'développeur',
  'ingénieur',
  'comptable',
  'médecin',
  'enseignant',
  'commercial',
  'manager',
  'électricien',
  'plombier',
  'mécanicien',
];

/**
 * Extrait la catégorie de compétence depuis la profession
 */
function extractCategoryFromProfession(profession?: string | null): string {
  if (!profession) return SkillCategory.ADMINISTRATIF;

  const professionLower = profession.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => professionLower.includes(kw))) {
      return category;
    }
  }

  return SkillCategory.ADMINISTRATIF;
}

/**
 * Détermine le niveau d'expertise basé sur l'âge
 */
function determineExpertiseLevel(birthDate?: number | null): string {
  if (!birthDate) return ExpertiseLevel.INTERMEDIAIRE;

  const age = Math.floor((Date.now() - birthDate) / (1000 * 60 * 60 * 24 * 365));

  if (age < 25) return ExpertiseLevel.JUNIOR;
  if (age < 35) return ExpertiseLevel.INTERMEDIAIRE;
  if (age < 50) return ExpertiseLevel.SENIOR;
  return ExpertiseLevel.EXPERT;
}

/**
 * Détermine la demande du marché pour une compétence
 */
function determineMarketDemand(profession?: string | null): 'high' | 'medium' | 'low' {
  if (!profession) return 'low';

  const professionLower = profession.toLowerCase();
  const isHighDemand = HIGH_DEMAND_SKILLS.some((skill) =>
    professionLower.includes(skill),
  );

  if (isHighDemand) return 'high';

  // Demande moyenne pour les catégories recherchées
  const category = extractCategoryFromProfession(profession);

  if (
    category === SkillCategory.TECHNIQUE ||
    category === SkillCategory.MEDICAL ||
    category === SkillCategory.EDUCATION
  ) {
    return 'medium';
  }

  return 'low';
}

/**
 * Get skills directory with pagination and filters
 */
export const getDirectory = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    level: v.optional(v.string()),
    marketDemand: v.optional(
      v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
    ),
    workStatus: v.optional(v.string()),
    hasCompleteProfile: v.optional(v.boolean()),
    page: v.number(),
    limit: v.number(),
    sortBy: v.optional(
      v.union(
        v.literal('name'),
        v.literal('profession'),
        v.literal('updatedAt'),
        v.literal('marketDemand'),
      ),
    ),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
  },
  handler: async (ctx, args) => {
    // Get all profiles
    let profiles = await ctx.db.query('profiles').collect();

    // Apply filters
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      profiles = profiles.filter(
        (profile) =>
          profile.personal.firstName?.toLowerCase().includes(searchLower) ||
          profile.personal.lastName?.toLowerCase().includes(searchLower) ||
          profile.professionSituation.profession?.toLowerCase().includes(searchLower) ||
          profile.professionSituation.employer?.toLowerCase().includes(searchLower),
      );
    }

    if (args.workStatus) {
      profiles = profiles.filter(
        (profile) => profile.professionSituation.workStatus === args.workStatus,
      );
    }

    if (args.hasCompleteProfile) {
      profiles = profiles.filter(
        (profile) =>
          profile.personal.firstName &&
          profile.personal.lastName &&
          profile.professionSituation.profession &&
          profile.contacts.email,
      );
    }

    // Extract skills and apply skill-based filters
    const profilesWithSkills = profiles.map((profile) => {
      const category = extractCategoryFromProfession(
        profile.professionSituation.profession,
      );
      const level = determineExpertiseLevel(profile.personal.birthDate);
      const marketDemand = determineMarketDemand(profile.professionSituation.profession);

      return {
        id: profile._id,
        firstName: profile.personal.firstName || '',
        lastName: profile.personal.lastName || '',
        profession: profile.professionSituation.profession || 'Non spécifié',
        employer: profile.professionSituation.employer,
        workStatus: profile.professionSituation.workStatus,
        email: profile.contacts.email,
        phoneNumber: profile.contacts.phone,
        address: profile.contacts.address,
        birthDate: profile.personal.birthDate,
        createdAt: profile._creationTime,
        updatedAt: profile._creationTime, // Convex doesn't have updatedAt by default
        // Extracted skills metadata
        skillCategory: category,
        expertiseLevel: level,
        marketDemand: marketDemand,
        hasCompleteProfile: !!(
          profile.personal.firstName &&
          profile.personal.lastName &&
          profile.professionSituation.profession &&
          profile.contacts.email
        ),
      };
    });

    // Apply skill-based filters
    let filtered = profilesWithSkills;

    if (args.category) {
      filtered = filtered.filter((p) => p.skillCategory === args.category);
    }

    if (args.level) {
      filtered = filtered.filter((p) => p.expertiseLevel === args.level);
    }

    if (args.marketDemand) {
      filtered = filtered.filter((p) => p.marketDemand === args.marketDemand);
    }

    // Sort
    const sortBy = args.sortBy || 'updatedAt';
    const sortOrder = args.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`,
          );
          break;
        case 'profession':
          comparison = a.profession.localeCompare(b.profession);
          break;
        case 'marketDemand': {
          const demandOrder: Record<'high' | 'medium' | 'low', number> = {
            high: 3,
            medium: 2,
            low: 1,
          };
          comparison = demandOrder[a.marketDemand] - demandOrder[b.marketDemand];
          break;
        }
        case 'updatedAt':
        default:
          comparison = a.updatedAt - b.updatedAt;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / args.limit);
    const start = (args.page - 1) * args.limit;
    const end = start + args.limit;
    const items = filtered.slice(start, end);

    return {
      items,
      pagination: {
        page: args.page,
        limit: args.limit,
        total,
        totalPages,
      },
      stats: {
        totalProfiles: total,
        byCategory: Object.keys(SkillCategory).reduce(
          (acc, cat) => {
            acc[cat] = filtered.filter(
              (p) => p.skillCategory === SkillCategory[cat as keyof typeof SkillCategory],
            ).length;
            return acc;
          },
          {} as Record<string, number>,
        ),
        byLevel: Object.keys(ExpertiseLevel).reduce(
          (acc, lvl) => {
            acc[lvl] = filtered.filter(
              (p) =>
                p.expertiseLevel === ExpertiseLevel[lvl as keyof typeof ExpertiseLevel],
            ).length;
            return acc;
          },
          {} as Record<string, number>,
        ),
        byMarketDemand: {
          high: filtered.filter((p) => p.marketDemand === 'high').length,
          medium: filtered.filter((p) => p.marketDemand === 'medium').length,
          low: filtered.filter((p) => p.marketDemand === 'low').length,
        },
      },
    };
  },
});

/**
 * Get profile CV with synthesized information
 */
export const getProfileCV = query({
  args: {
    profileId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const category = extractCategoryFromProfession(
      profile.professionSituation.profession,
    );
    const level = determineExpertiseLevel(profile.personal.birthDate);
    const marketDemand = determineMarketDemand(profile.professionSituation.profession);

    // Get user data
    const user = await ctx.db.get(profile.userId);

    return {
      id: profile._id,
      personal: {
        firstName: profile.personal.firstName,
        lastName: profile.personal.lastName,
        birthDate: profile.personal.birthDate,
        nationality: profile.personal.nationality,
        gender: profile.personal.gender,
      },
      professional: {
        profession: profile.professionSituation.profession || 'Non spécifié',
        employer: profile.professionSituation.employer,
        workStatus: profile.professionSituation.workStatus,
      },
      contacts: {
        email:
          profile.contacts.email ||
          (user && 'email' in user && 'firstName' in user
            ? (user as any).email
            : undefined),
        phoneNumber: profile.contacts.phone,
        address: profile.contacts.address,
      },
      skills: {
        category,
        level,
        marketDemand,
      },
      cv: {
        summary: `${profile.personal.firstName} ${profile.personal.lastName} est ${profile.professionSituation.profession || 'professionnel'} avec un niveau d'expertise ${level}. Catégorie: ${category}. Demande du marché: ${marketDemand}.`,
        category,
        level,
        marketDemand,
      },
    };
  },
});

/**
 * Get skills statistics for Gabon
 */
export const getSkillsStatistics = query({
  args: {
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all profiles (optionally filter by region if needed)
    const profiles = await ctx.db.query('profiles').collect();

    const profilesWithSkills = profiles.map((profile) => ({
      category: extractCategoryFromProfession(profile.professionSituation.profession),
      level: determineExpertiseLevel(profile.personal.birthDate),
      marketDemand: determineMarketDemand(profile.professionSituation.profession),
      workStatus: profile.professionSituation.workStatus,
    }));

    // Calculate statistics
    const byCategory = Object.keys(SkillCategory).reduce(
      (acc, cat) => {
        const categoryKey = SkillCategory[cat as keyof typeof SkillCategory];
        acc[categoryKey] = profilesWithSkills.filter(
          (p) => p.category === categoryKey,
        ).length;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byLevel = Object.keys(ExpertiseLevel).reduce(
      (acc, lvl) => {
        const levelKey = ExpertiseLevel[lvl as keyof typeof ExpertiseLevel];
        acc[levelKey] = profilesWithSkills.filter((p) => p.level === levelKey).length;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byMarketDemand = {
      high: profilesWithSkills.filter((p) => p.marketDemand === 'high').length,
      medium: profilesWithSkills.filter((p) => p.marketDemand === 'medium').length,
      low: profilesWithSkills.filter((p) => p.marketDemand === 'low').length,
    };

    const byWorkStatus = {
      EMPLOYEE: profilesWithSkills.filter((p) => p.workStatus === ('EMPLOYEE' as any))
        .length,
      SELF_EMPLOYED: profilesWithSkills.filter(
        (p) => p.workStatus === ('SELF_EMPLOYED' as any),
      ).length,
      UNEMPLOYED: profilesWithSkills.filter((p) => p.workStatus === ('UNEMPLOYED' as any))
        .length,
      ENTREPRENEUR: profilesWithSkills.filter(
        (p) => p.workStatus === ('ENTREPRENEUR' as any),
      ).length,
      STUDENT: profilesWithSkills.filter((p) => p.workStatus === ('STUDENT' as any))
        .length,
      RETIRED: profilesWithSkills.filter((p) => p.workStatus === ('RETIRED' as any))
        .length,
      OTHER: profilesWithSkills.filter((p) => p.workStatus === ('OTHER' as any)).length,
    };

    return {
      total: profiles.length,
      byCategory,
      byLevel,
      byMarketDemand,
      byWorkStatus,
      topSkillCategories: Object.entries(byCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count })),
      highDemandCount: byMarketDemand.high,
      unemployedCount: byWorkStatus.UNEMPLOYED,
    };
  },
});
