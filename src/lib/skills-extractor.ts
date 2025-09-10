/**
 * Service d'extraction intelligente de compétences depuis les profils
 * Analyse le statut professionnel pour extraire et catégoriser les compétences
 */

import { WorkStatus } from '@prisma/client';

// Mapping des statuts professionnels vers les compétences
const WORK_STATUS_SKILLS_MAP: Record<WorkStatus, string[]> = {
  EMPLOYEE: ['Travail en équipe', 'Respect des processus', 'Gestion du temps', 'Communication professionnelle'],
  SELF_EMPLOYED: ['Entrepreneuriat', 'Gestion d\'entreprise', 'Autonomie', 'Développement commercial'],
  STUDENT: ['Apprentissage continu', 'Recherche', 'Analyse', 'Méthodologie académique'],
  RETIRED: ['Expérience sectorielle', 'Mentorat', 'Transmission de savoir', 'Expertise métier'],
  UNEMPLOYED: ['Adaptabilité', 'Recherche d\'emploi', 'Flexibilité', 'Disponibilité'],
  OTHER: ['Polyvalence', 'Adaptabilité', 'Compétences transversales'],
};

// Dictionnaire de compétences par mots-clés dans la profession
const PROFESSION_KEYWORDS_SKILLS: Record<string, string[]> = {
  // Technologie
  'développeur': ['Programmation', 'Développement web', 'Bases de données', 'Git', 'Agile'],
  'ingénieur': ['Conception technique', 'Résolution de problèmes', 'Gestion de projet', 'Innovation'],
  'informatique': ['Support IT', 'Réseaux', 'Sécurité informatique', 'Administration système'],
  'data': ['Analyse de données', 'Machine Learning', 'Python', 'SQL', 'Visualisation'],
  
  // Commerce
  'commercial': ['Négociation', 'Prospection', 'Relation client', 'Closing', 'CRM'],
  'vente': ['Techniques de vente', 'Conseil client', 'Gestion de portefeuille', 'Objectifs commerciaux'],
  'marketing': ['Marketing digital', 'SEO/SEA', 'Réseaux sociaux', 'Stratégie marketing', 'Analytics'],
  'business': ['Business development', 'Stratégie commerciale', 'Partenariats', 'KPIs'],
  
  // Management
  'manager': ['Leadership', 'Gestion d\'équipe', 'Planification', 'Délégation', 'Coaching'],
  'directeur': ['Vision stratégique', 'Prise de décision', 'Gestion P&L', 'Transformation'],
  'chef': ['Coordination', 'Organisation', 'Supervision', 'Reporting', 'Amélioration continue'],
  'responsable': ['Responsabilité', 'Gestion opérationnelle', 'Process', 'KPIs', 'Budget'],
  
  // Santé
  'médecin': ['Diagnostic médical', 'Soins patients', 'Éthique médicale', 'Urgences', 'Prescription'],
  'infirmier': ['Soins infirmiers', 'Relation patient', 'Protocoles sanitaires', 'Premiers secours'],
  'santé': ['Hygiène', 'Prévention', 'Accompagnement', 'Dossier médical', 'Confidentialité'],
  'pharmacien': ['Pharmacologie', 'Conseil pharmaceutique', 'Gestion stocks', 'Ordonnances'],
  
  // Éducation
  'enseignant': ['Pédagogie', 'Transmission de savoir', 'Évaluation', 'Programme scolaire'],
  'professeur': ['Expertise disciplinaire', 'Recherche', 'Publications', 'Encadrement'],
  'formateur': ['Formation adultes', 'Ingénierie pédagogique', 'Animation', 'E-learning'],
  'éducation': ['Accompagnement éducatif', 'Orientation', 'Suivi personnalisé', 'Projet pédagogique'],
  
  // Finance
  'comptable': ['Comptabilité', 'Bilan', 'TVA', 'Clôture', 'Normes comptables'],
  'finance': ['Analyse financière', 'Gestion trésorerie', 'Budget', 'Reporting financier'],
  'banque': ['Produits bancaires', 'Crédit', 'Conformité', 'Gestion risques', 'Conseil financier'],
  'audit': ['Audit interne', 'Contrôle', 'Procédures', 'Recommandations', 'Normes'],
  
  // Juridique
  'avocat': ['Droit', 'Plaidoirie', 'Rédaction juridique', 'Conseil juridique', 'Contentieux'],
  'juriste': ['Veille juridique', 'Contrats', 'Conformité', 'Propriété intellectuelle'],
  'notaire': ['Actes notariés', 'Successions', 'Immobilier', 'Conseil patrimonial'],
  'juridique': ['Documentation juridique', 'Procédures légales', 'Réglementation'],
  
  // BTP
  'architecte': ['Conception architecturale', 'Plans', 'AutoCAD', 'Urbanisme', 'Réglementation BTP'],
  'ingénieur btp': ['Génie civil', 'Structures', 'Chantier', 'Sécurité BTP', 'Devis'],
  'maçon': ['Maçonnerie', 'Gros œuvre', 'Lecture plans', 'Béton', 'Finitions'],
  'électricien': ['Installation électrique', 'Dépannage', 'Normes électriques', 'Tableau électrique'],
  'plombier': ['Plomberie', 'Chauffage', 'Sanitaire', 'Dépannage', 'Installation'],
  
  // Transport/Logistique
  'chauffeur': ['Conduite', 'Sécurité routière', 'Livraison', 'Itinéraires', 'Maintenance véhicule'],
  'logistique': ['Supply chain', 'Gestion stocks', 'Transport', 'Optimisation flux', 'WMS'],
  'transport': ['Organisation transport', 'Douane', 'Réglementation transport', 'Tracking'],
  
  // Restauration/Hôtellerie
  'cuisinier': ['Cuisine', 'HACCP', 'Créativité culinaire', 'Gestion stocks', 'Menu'],
  'serveur': ['Service client', 'Accueil', 'Prise commande', 'Conseil', 'Caisse'],
  'hôtel': ['Réception', 'Réservations', 'Conciergerie', 'Housekeeping', 'Yield management'],
  'restauration': ['Service', 'Hygiène alimentaire', 'Gestion équipe', 'Standards qualité'],
  
  // Agriculture
  'agriculteur': ['Agriculture', 'Élevage', 'Cultures', 'Machinisme agricole', 'Bio'],
  'agronome': ['Agronomie', 'Sols', 'Productions végétales', 'Conseil technique', 'Innovation agricole'],
  
  // Artisanat
  'coiffeur': ['Coiffure', 'Coloration', 'Coupe', 'Conseil beauté', 'Hygiène'],
  'esthéticien': ['Soins esthétiques', 'Massage', 'Épilation', 'Maquillage', 'Conseil beauté'],
  'couturier': ['Couture', 'Patronage', 'Retouches', 'Création', 'Textiles'],
  'menuisier': ['Menuiserie', 'Ébénisterie', 'Travail du bois', 'Finitions', 'Sur-mesure'],
  
  // Sécurité
  'sécurité': ['Surveillance', 'Prévention', 'Intervention', 'Premiers secours', 'Réglementation sécurité'],
  'agent': ['Vigilance', 'Ronde', 'Contrôle accès', 'Rapport', 'Gestion conflits'],
  'militaire': ['Discipline', 'Leadership', 'Stratégie', 'Logistique', 'Gestion crise'],
  'police': ['Enquête', 'Procédures', 'Maintien ordre', 'Rédaction PV', 'Médiation'],
};

// Catégories de compétences
export enum SkillCategory {
  TECHNIQUE = 'technique',
  MANAGEMENT = 'management',
  COMMERCIAL = 'commercial',
  ADMINISTRATIF = 'administratif',
  ARTISANAL = 'artisanal',
  MEDICAL = 'medical',
  JURIDIQUE = 'juridique',
  EDUCATION = 'education',
  TRANSPORT = 'transport',
  SECURITE = 'securite',
  AGRICULTURE = 'agriculture',
  RESTAURATION = 'restauration',
  FINANCE = 'finance',
}

// Mapping des mots-clés vers les catégories
const CATEGORY_KEYWORDS: Record<SkillCategory, string[]> = {
  [SkillCategory.TECHNIQUE]: ['développeur', 'ingénieur', 'informatique', 'data', 'tech', 'it'],
  [SkillCategory.MANAGEMENT]: ['manager', 'directeur', 'chef', 'responsable', 'coordinateur'],
  [SkillCategory.COMMERCIAL]: ['commercial', 'vente', 'marketing', 'business', 'export'],
  [SkillCategory.ADMINISTRATIF]: ['administratif', 'assistant', 'secrétaire', 'bureau'],
  [SkillCategory.ARTISANAL]: ['artisan', 'menuisier', 'plombier', 'électricien', 'maçon', 'coiffeur'],
  [SkillCategory.MEDICAL]: ['médecin', 'infirmier', 'santé', 'pharmacien', 'aide-soignant'],
  [SkillCategory.JURIDIQUE]: ['avocat', 'juriste', 'notaire', 'juridique', 'droit'],
  [SkillCategory.EDUCATION]: ['enseignant', 'professeur', 'formateur', 'éducation', 'école'],
  [SkillCategory.TRANSPORT]: ['chauffeur', 'logistique', 'transport', 'livreur', 'routier'],
  [SkillCategory.SECURITE]: ['sécurité', 'agent', 'militaire', 'police', 'gardien'],
  [SkillCategory.AGRICULTURE]: ['agriculteur', 'agronome', 'éleveur', 'fermier'],
  [SkillCategory.RESTAURATION]: ['cuisinier', 'serveur', 'hôtel', 'restauration', 'barman'],
  [SkillCategory.FINANCE]: ['comptable', 'finance', 'banque', 'audit', 'trésorier'],
};

// Niveaux d'expertise basés sur l'expérience
export enum ExpertiseLevel {
  JUNIOR = 'junior',
  INTERMEDIAIRE = 'intermediaire',
  SENIOR = 'senior',
  EXPERT = 'expert',
}

export interface ExtractedSkill {
  name: string;
  category: SkillCategory;
  level: ExpertiseLevel;
  keywords: string[];
  relevanceScore: number;
}

export interface ProfileSkillsAnalysis {
  primarySkills: ExtractedSkill[];
  secondarySkills: ExtractedSkill[];
  suggestedSkills: ExtractedSkill[];
  category: SkillCategory;
  experienceLevel: ExpertiseLevel;
  marketDemand: 'high' | 'medium' | 'low';
  cvSummary: string;
}

/**
 * Extrait les compétences d'un profil de manière intelligente
 */
export function extractSkillsFromProfile(profile: {
  workStatus?: WorkStatus | null;
  profession?: string | null;
  employer?: string | null;
  employerAddress?: string | null;
  activityInGabon?: string | null;
  birthDate?: Date | null;
}): ProfileSkillsAnalysis {
  const skills: ExtractedSkill[] = [];
  let category = SkillCategory.ADMINISTRATIF;
  let experienceLevel = ExpertiseLevel.JUNIOR;

  // 1. Analyser le statut professionnel
  if (profile.workStatus) {
    const statusSkills = WORK_STATUS_SKILLS_MAP[profile.workStatus] || [];
    statusSkills.forEach(skill => {
      skills.push({
        name: skill,
        category: SkillCategory.ADMINISTRATIF,
        level: ExpertiseLevel.INTERMEDIAIRE,
        keywords: [profile.workStatus!],
        relevanceScore: 0.6,
      });
    });
  }

  // 2. Analyser la profession
  if (profile.profession) {
    const professionLower = profile.profession.toLowerCase();
    
    // Déterminer la catégorie principale
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => professionLower.includes(kw))) {
        category = cat as SkillCategory;
        break;
      }
    }

    // Extraire les compétences spécifiques
    for (const [keyword, profSkills] of Object.entries(PROFESSION_KEYWORDS_SKILLS)) {
      if (professionLower.includes(keyword)) {
        profSkills.forEach(skill => {
          skills.push({
            name: skill,
            category,
            level: experienceLevel,
            keywords: [keyword, profile.profession!],
            relevanceScore: 0.9,
          });
        });
      }
    }

    // Ajouter la profession elle-même comme compétence principale
    if (!skills.some(s => s.name.toLowerCase() === professionLower)) {
      skills.push({
        name: profile.profession,
        category,
        level: experienceLevel,
        keywords: [profile.profession],
        relevanceScore: 1.0,
      });
    }
  }

  // 3. Calculer le niveau d'expérience basé sur l'âge
  if (profile.birthDate) {
    const age = new Date().getFullYear() - new Date(profile.birthDate).getFullYear();
    if (age < 25) experienceLevel = ExpertiseLevel.JUNIOR;
    else if (age < 35) experienceLevel = ExpertiseLevel.INTERMEDIAIRE;
    else if (age < 45) experienceLevel = ExpertiseLevel.SENIOR;
    else experienceLevel = ExpertiseLevel.EXPERT;
  }

  // 4. Analyser l'employeur pour des compétences sectorielles
  if (profile.employer) {
    const employerLower = profile.employer.toLowerCase();
    
    // Ajouter des compétences basées sur le type d'employeur
    if (employerLower.includes('international') || employerLower.includes('onu') || employerLower.includes('ambassade')) {
      skills.push({
        name: 'Relations internationales',
        category: SkillCategory.ADMINISTRATIF,
        level: experienceLevel,
        keywords: ['international', profile.employer],
        relevanceScore: 0.8,
      });
      skills.push({
        name: 'Multilinguisme',
        category: SkillCategory.ADMINISTRATIF,
        level: experienceLevel,
        keywords: ['langues', profile.employer],
        relevanceScore: 0.7,
      });
    }
    
    if (employerLower.includes('bank') || employerLower.includes('banque')) {
      skills.push({
        name: 'Services bancaires',
        category: SkillCategory.FINANCE,
        level: experienceLevel,
        keywords: ['banque', profile.employer],
        relevanceScore: 0.8,
      });
    }
  }

  // 5. Trier les compétences par score de pertinence
  skills.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 6. Séparer en compétences primaires et secondaires
  const primarySkills = skills.filter(s => s.relevanceScore >= 0.8);
  const secondarySkills = skills.filter(s => s.relevanceScore >= 0.6 && s.relevanceScore < 0.8);

  // 7. Suggérer des compétences complémentaires
  const suggestedSkills: ExtractedSkill[] = [];
  
  // Suggestions basées sur la catégorie
  const categorySuggestions: Record<SkillCategory, string[]> = {
    [SkillCategory.TECHNIQUE]: ['Cloud computing', 'DevOps', 'IA/ML', 'Cybersécurité'],
    [SkillCategory.MANAGEMENT]: ['Agilité', 'Change management', 'Strategic planning', 'Risk management'],
    [SkillCategory.COMMERCIAL]: ['CRM', 'Inbound marketing', 'Growth hacking', 'Account management'],
    [SkillCategory.MEDICAL]: ['Télémédecine', 'E-santé', 'Recherche clinique', 'Santé publique'],
    [SkillCategory.JURIDIQUE]: ['LegalTech', 'RGPD', 'Arbitrage', 'Médiation'],
    [SkillCategory.EDUCATION]: ['E-learning', 'Pédagogie numérique', 'Neurosciences', 'Coaching'],
    [SkillCategory.FINANCE]: ['FinTech', 'Blockchain', 'Analyse risque', 'Compliance'],
    [SkillCategory.ARTISANAL]: ['Eco-construction', 'Domotique', 'Impression 3D', 'Design'],
    [SkillCategory.TRANSPORT]: ['Véhicules électriques', 'Logistique 4.0', 'Drones', 'Last mile'],
    [SkillCategory.SECURITE]: ['Cybersécurité', 'Gestion de crise', 'Intelligence', 'Protection VIP'],
    [SkillCategory.AGRICULTURE]: ['Agriculture de précision', 'Permaculture', 'AgroTech', 'Bio'],
    [SkillCategory.RESTAURATION]: ['Cuisine moléculaire', 'Diététique', 'Food tech', 'Événementiel'],
    [SkillCategory.ADMINISTRATIF]: ['Transformation digitale', 'Process optimization', 'Data analysis', 'Project management'],
  };

  const suggestions = categorySuggestions[category] || [];
  suggestions.slice(0, 3).forEach(suggestion => {
    if (!skills.some(s => s.name === suggestion)) {
      suggestedSkills.push({
        name: suggestion,
        category,
        level: ExpertiseLevel.JUNIOR,
        keywords: ['suggestion', 'tendance'],
        relevanceScore: 0.5,
      });
    }
  });

  // 8. Déterminer la demande du marché
  const highDemandCategories = [SkillCategory.TECHNIQUE, SkillCategory.MEDICAL, SkillCategory.FINANCE];
  const mediumDemandCategories = [SkillCategory.MANAGEMENT, SkillCategory.COMMERCIAL, SkillCategory.EDUCATION];
  
  let marketDemand: 'high' | 'medium' | 'low' = 'low';
  if (highDemandCategories.includes(category)) marketDemand = 'high';
  else if (mediumDemandCategories.includes(category)) marketDemand = 'medium';

  // 9. Générer un résumé CV
  const cvSummary = generateCVSummary({
    profession: profile.profession,
    workStatus: profile.workStatus,
    employer: profile.employer,
    experienceLevel,
    primarySkills: primarySkills.map(s => s.name),
    category,
  });

  return {
    primarySkills,
    secondarySkills,
    suggestedSkills,
    category,
    experienceLevel,
    marketDemand,
    cvSummary,
  };
}

/**
 * Génère un résumé de CV synthétique
 */
function generateCVSummary(data: {
  profession?: string | null;
  workStatus?: WorkStatus | null;
  employer?: string | null;
  experienceLevel: ExpertiseLevel;
  primarySkills: string[];
  category: SkillCategory;
}): string {
  const levelText = {
    [ExpertiseLevel.JUNIOR]: 'Professionnel junior',
    [ExpertiseLevel.INTERMEDIAIRE]: 'Professionnel confirmé',
    [ExpertiseLevel.SENIOR]: 'Professionnel senior',
    [ExpertiseLevel.EXPERT]: 'Expert reconnu',
  };

  const statusText = {
    [WorkStatus.EMPLOYEE]: 'en poste',
    [WorkStatus.SELF_EMPLOYED]: 'entrepreneur',
    [WorkStatus.STUDENT]: 'en formation',
    [WorkStatus.RETIRED]: 'retraité actif',
    [WorkStatus.UNEMPLOYED]: 'en recherche active',
    [WorkStatus.OTHER]: '',
  };

  let summary = `${levelText[data.experienceLevel]}`;
  
  if (data.profession) {
    summary += ` en ${data.profession}`;
  }
  
  if (data.workStatus && statusText[data.workStatus]) {
    summary += `, ${statusText[data.workStatus]}`;
  }
  
  if (data.employer) {
    summary += ` chez ${data.employer}`;
  }
  
  if (data.primarySkills.length > 0) {
    summary += `. Compétences clés : ${data.primarySkills.slice(0, 3).join(', ')}`;
  }
  
  summary += '.';
  
  return summary;
}

/**
 * Calcule un score de compatibilité entre deux profils
 */
export function calculateSkillCompatibility(
  profile1Skills: ExtractedSkill[],
  profile2Skills: ExtractedSkill[]
): number {
  if (profile1Skills.length === 0 || profile2Skills.length === 0) return 0;
  
  let matchScore = 0;
  const totalSkills = Math.max(profile1Skills.length, profile2Skills.length);
  
  profile1Skills.forEach(skill1 => {
    const match = profile2Skills.find(skill2 => 
      skill2.name.toLowerCase() === skill1.name.toLowerCase() ||
      skill2.category === skill1.category
    );
    
    if (match) {
      // Score plus élevé si les niveaux sont proches
      const levelDiff = Math.abs(
        Object.values(ExpertiseLevel).indexOf(skill1.level) -
        Object.values(ExpertiseLevel).indexOf(match.level)
      );
      matchScore += 1 - (levelDiff * 0.2);
    }
  });
  
  return (matchScore / totalSkills) * 100;
}
