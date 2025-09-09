// Données complètes des projets DGSS avec coordonnées réelles

export interface ResponsableProjet {
  nom: string;
  poste: string;
  email: string;
  telephone: string;
  organisation: string;
  adresse?: string;
}

export interface MembreEquipe {
  initiales: string;
  nom: string;
  role: string;
  email: string;
  telephone?: string;
  organisation: string;
}

export interface Risque {
  id: number;
  titre: string;
  description: string;
  niveau: 'faible' | 'moyen' | 'eleve' | 'critique';
  probabilite: number;
  impact: 'faible' | 'moyen' | 'eleve' | 'critique';
  mitigation: string;
  responsable: string;
  statut: 'nouveau' | 'actif' | 'surveille' | 'resolu';
}

export interface Livrable {
  id: number;
  nom: string;
  statut: 'planifie' | 'en_cours' | 'complete' | 'retard';
  echeance: string;
  description: string;
  responsable: string;
  progression?: number;
}

export interface Objectif {
  id: number;
  titre: string;
  statut: 'planifie' | 'en_cours' | 'complete';
  progression: number;
}

export interface KPI {
  nom: string;
  valeur: string;
  objectif: string;
  unite: string;
  evolution: 'positive' | 'negative' | 'stable';
}

export interface CategoreBudget {
  nom: string;
  alloue: number;
  utilise: number;
  pourcentage: number;
}

export interface Activite {
  date: string;
  action: string;
  auteur: string;
  type: 'budget' | 'livraison' | 'test' | 'formation' | 'reunion' | 'securite' | 'communication';
  importance: 'haute' | 'moyenne' | 'basse';
}

export interface Document {
  id: number;
  nom: string;
  taille: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX';
  date: string;
  url: string;
  auteur?: string;
}

export interface ProchainEtape {
  id: number;
  titre: string;
  echeance: string;
  responsable: string;
  priorite: 'haute' | 'moyenne' | 'basse';
  statut: 'planifie' | 'en_cours' | 'complete';
}

export interface Projet {
  id: string;
  nom: string;
  code: string;
  description: string;
  statut: 'actif' | 'planifie' | 'complete' | 'critique' | 'suspendu';
  priorite: 'haute' | 'moyenne' | 'basse' | 'critique';
  progression: number;
  budget: number;
  budgetUtilise: number;
  budgetReste: number;
  dateDebut: Date;
  dateEcheance: Date;
  responsable: ResponsableProjet;
  equipe: MembreEquipe[];
  zone: string;
  beneficiaires?: number;
  phase: string;
  risques: Risque[];
  objectifs: Objectif[];
  livrables: Livrable[];
  kpis: KPI[];
  budget_details: {
    categories: CategoreBudget[];
  };
  activites: Activite[];
  documents: Document[];
  prochaines_etapes: ProchainEtape[];
}

// Données des projets DGSS avec coordonnées réelles
export const projets: Projet[] = [
  {
    id: 'dgss-001',
    nom: 'Digital Gouv - Modernisation Consulaire',
    code: 'DGSS-2025-001',
    description: 'Programme de digitalisation complète des services consulaires pour la diaspora gabonaise en France. Déploiement de l\'application mobile, consulats mobiles et cartes NFC pour 35,000 citoyens.',
    statut: 'actif',
    priorite: 'haute',
    progression: 35,
    budget: 336900,
    budgetUtilise: 118415,
    budgetReste: 218485,
    dateDebut: new Date('2025-09-01'),
    dateEcheance: new Date('2025-12-31'),
    responsable: {
      nom: 'Jean-Rémy MAGANGA-NZAMBA',
      poste: 'Consul Général du Gabon en France',
      email: 'consul.general@consulat.ga',
      telephone: '+241 06 60 68 19',
      organisation: 'Consulat Général du Gabon',
      adresse: '26bis Av. Raphaël, 75016 Paris'
    },
    equipe: [
      { 
        initiales: 'JM', 
        nom: 'Jean-Rémy MAGANGA-NZAMBA', 
        role: 'Consul Général', 
        email: 'consul.general@consulat.ga',
        telephone: '+241 06 60 68 19',
        organisation: 'Consulat Général du Gabon'
      },
      { 
        initiales: 'GA', 
        nom: 'PELLEN-LAKOUMBA Gueylord Asted', 
        role: 'Chef de Projet Digital', 
        email: 'contact@oka-tech.com',
        telephone: '+33 6 60 00 26 16',
        organisation: 'OKA Tech'
      },
      { 
        initiales: 'AN', 
        nom: 'Alice NDONG', 
        role: 'Tech Lead Consulat.ga', 
        email: 'a.ndong@consulat.ga',
        organisation: 'Consulat Général du Gabon'
      },
      { 
        initiales: 'PO', 
        nom: 'Paul OBIANG', 
        role: 'Coordinateur Consulats Mobiles', 
        email: 'p.obiang@consulat.ga',
        organisation: 'Consulat Général du Gabon'
      },
      { 
        initiales: 'ML', 
        nom: 'Marie LEBLANC', 
        role: 'Responsable Communication', 
        email: 'm.leblanc@consulat.ga',
        organisation: 'Consulat Général du Gabon'
      }
    ],
    zone: 'France',
    beneficiaires: 35000,
    phase: 'Déploiement Actif',
    risques: [
      {
        id: 1,
        titre: 'Résistance au changement diaspora',
        description: 'Certains citoyens pourraient être réticents à adopter les nouveaux outils digitaux',
        niveau: 'moyen',
        probabilite: 40,
        impact: 'eleve',
        mitigation: 'Campagne de communication intensive et formation utilisateurs avec OKA Tech',
        responsable: 'Marie LEBLANC',
        statut: 'actif'
      },
      {
        id: 2,
        titre: 'Coordination multi-sites consulats mobiles',
        description: 'Complexité de coordination entre Paris et sites déployés',
        niveau: 'moyen',
        probabilite: 35,
        impact: 'moyen',
        mitigation: 'Système de coordination centralisé et formation équipes terrain',
        responsable: 'Paul OBIANG',
        statut: 'surveille'
      }
    ],
    objectifs: [
      { id: 1, titre: 'Digitaliser 100% des services consulaires', statut: 'en_cours', progression: 45 },
      { id: 2, titre: 'Atteindre 40% d\'inscription de la diaspora (14,000 citoyens)', statut: 'en_cours', progression: 15 },
      { id: 3, titre: 'Déployer 3 consulats mobiles opérationnels', statut: 'en_cours', progression: 25 },
      { id: 4, titre: 'Produire et distribuer 10,000 cartes NFC', statut: 'en_cours', progression: 30 }
    ],
    livrables: [
      { 
        id: 1,
        nom: 'Application Consulat.ga v1.0', 
        statut: 'complete', 
        echeance: '2025-10-01',
        description: 'Plateforme digitale complète développée par OKA Tech',
        responsable: 'PELLEN-LAKOUMBA Gueylord Asted',
        progression: 100
      },
      { 
        id: 2,
        nom: 'Infrastructure Cloud Sécurisée', 
        statut: 'complete', 
        echeance: '2025-09-30',
        description: 'Déploiement sécurisé avec chiffrement DGSS',
        responsable: 'Alice NDONG',
        progression: 100
      },
      { 
        id: 3,
        nom: 'Consulats Mobiles - Phase 1', 
        statut: 'en_cours', 
        echeance: '2025-11-15',
        description: '3 véhicules équipés pour missions terrain France',
        responsable: 'Paul OBIANG',
        progression: 65
      },
      { 
        id: 4,
        nom: 'Cartes NFC Première Vague', 
        statut: 'en_cours', 
        echeance: '2025-12-01',
        description: '10,000 cartes consulaires haute sécurité',
        responsable: 'Jean-Rémy MAGANGA-NZAMBA',
        progression: 30
      },
      { 
        id: 5,
        nom: 'Formation Agents Consulaires', 
        statut: 'en_cours', 
        echeance: '2025-12-15',
        description: 'Certification 25 agents aux nouveaux outils digitaux',
        responsable: 'Marie LEBLANC',
        progression: 20
      }
    ],
    kpis: [
      { nom: 'Inscriptions consulat.ga', valeur: '5,250', objectif: '14,000', unite: 'citoyens', evolution: 'positive' },
      { nom: 'Satisfaction utilisateurs', valeur: '78%', objectif: '85%', unite: '%', evolution: 'positive' },
      { nom: 'Temps traitement RDV', valeur: '45min', objectif: '30min', unite: 'minutes', evolution: 'stable' },
      { nom: 'Disponibilité consulat.ga', valeur: '99.2%', objectif: '99.9%', unite: '%', evolution: 'positive' },
      { nom: 'Consulats mobiles actifs', valeur: '1', objectif: '3', unite: 'unités', evolution: 'positive' },
      { nom: 'ROI estimé', valeur: '280%', objectif: '300%', unite: '%', evolution: 'positive' }
    ],
    budget_details: {
      categories: [
        { nom: 'Consulats Mobiles (Coordination)', alloue: 75000, utilise: 35000, pourcentage: 22.3 },
        { nom: 'Développement Consulat.ga (OKA Tech)', alloue: 72000, utilise: 65000, pourcentage: 21.4 },
        { nom: 'Cartes NFC et Production', alloue: 149900, utilise: 45000, pourcentage: 44.5 },
        { nom: 'Événements et Communication', alloue: 40000, utilise: 15415, pourcentage: 11.8 }
      ]
    },
    activites: [
      { 
        date: 'Il y a 2 heures', 
        action: 'Validation budget Q4 2025 - 336,900€ approuvés par Ministère', 
        auteur: 'Jean-Rémy MAGANGA-NZAMBA',
        type: 'budget',
        importance: 'haute'
      },
      { 
        date: 'Il y a 6 heures', 
        action: 'Déploiement consulat.ga v1.0 - Tests utilisateurs réussis', 
        auteur: 'PELLEN-LAKOUMBA Gueylord (OKA Tech)',
        type: 'livraison',
        importance: 'haute'
      },
      { 
        date: 'Il y a 1 jour', 
        action: 'Formation équipe consulat mobile Paris - 5 agents certifiés', 
        auteur: 'Paul OBIANG',
        type: 'formation',
        importance: 'moyenne'
      },
      { 
        date: 'Il y a 2 jours', 
        action: 'Réunion coordination Consul Général - OKA Tech', 
        auteur: 'Jean-Rémy MAGANGA-NZAMBA',
        type: 'reunion',
        importance: 'haute'
      }
    ],
    documents: [
      { id: 1, nom: 'Cahier des charges Digital Gouv', taille: '2.4 MB', type: 'PDF', date: '2025-08-15', url: '/docs/cahier-charges.pdf', auteur: 'OKA Tech' },
      { id: 2, nom: 'Architecture consulat.ga', taille: '1.8 MB', type: 'PDF', date: '2025-09-01', url: '/docs/architecture.pdf', auteur: 'PELLEN-LAKOUMBA Gueylord' },
      { id: 3, nom: 'Plan communication diaspora', taille: '890 KB', type: 'DOCX', date: '2025-09-10', url: '/docs/plan-comm.docx', auteur: 'Marie LEBLANC' },
      { id: 4, nom: 'Protocole sécurité DGSS', taille: '1.2 MB', type: 'PDF', date: '2025-10-01', url: '/docs/securite.pdf', auteur: 'Consul Général' },
      { id: 5, nom: 'Budget détaillé Q4 2025', taille: '456 KB', type: 'XLSX', date: '2025-10-15', url: '/docs/budget-q4.xlsx', auteur: 'Jean-Rémy MAGANGA-NZAMBA' }
    ],
    prochaines_etapes: [
      { 
        id: 1,
        titre: 'Déploiement consulat mobile Lyon', 
        echeance: '2025-11-05', 
        responsable: 'Paul OBIANG',
        priorite: 'haute',
        statut: 'planifie'
      },
      { 
        id: 2,
        titre: 'Intégration fonctionnalités avancées consulat.ga', 
        echeance: '2025-11-10', 
        responsable: 'PELLEN-LAKOUMBA Gueylord (OKA Tech)',
        priorite: 'haute',
        statut: 'en_cours'
      },
      { 
        id: 3,
        titre: 'Journée Porte Ouverte Paris - 26bis Av. Raphaël', 
        echeance: '2025-11-20', 
        responsable: 'Jean-Rémy MAGANGA-NZAMBA',
        priorite: 'haute',
        statut: 'planifie'
      }
    ]
  },
  
  {
    id: 'dgss-002',
    nom: 'Digital Gouv - Cartographie Intelligente',
    code: 'DGSS-2025-002',
    description: 'Système de surveillance et cartographie avancée des 129 entités gabonaises en France avec analyse prédictive par IA et scoring de risque automatique développé par OKA Tech.',
    statut: 'actif',
    priorite: 'haute',
    progression: 72,
    budget: 250000,
    budgetUtilise: 180000,
    budgetReste: 70000,
    dateDebut: new Date('2025-01-15'),
    dateEcheance: new Date('2026-03-31'),
    responsable: {
      nom: 'PELLEN-LAKOUMBA Gueylord Asted',
      poste: 'Président OKA Tech - Chef de Projet Digital',
      email: 'contact@oka-tech.com',
      telephone: '+33 6 60 00 26 16',
      organisation: 'OKA Tech',
      adresse: 'Siège OKA Tech, France'
    },
    equipe: [
      { 
        initiales: 'GA', 
        nom: 'PELLEN-LAKOUMBA Gueylord Asted', 
        role: 'Chef de Projet & Stratégie Digitale', 
        email: 'contact@oka-tech.com',
        telephone: '+33 6 60 00 26 16',
        organisation: 'OKA Tech'
      },
      { 
        initiales: 'JM', 
        nom: 'Jean-Rémy MAGANGA-NZAMBA', 
        role: 'Superviseur DGSS', 
        email: 'consul.general@consulat.ga',
        telephone: '+241 06 60 68 19',
        organisation: 'Consulat Général du Gabon'
      },
      { 
        initiales: 'ML', 
        nom: 'Marie LEBLANC', 
        role: 'Analyste Intelligence', 
        email: 'm.leblanc@consulat.ga',
        organisation: 'DGSS'
      },
      { 
        initiales: 'SK', 
        nom: 'Samuel KOUMBA', 
        role: 'DevOps & Infrastructure', 
        email: 's.koumba@oka-tech.com',
        organisation: 'OKA Tech'
      }
    ],
    zone: 'France',
    beneficiaires: 129,
    phase: 'Finalisation Technique',
    risques: [
      {
        id: 1,
        titre: 'Complexité algorithmes IA',
        description: 'Développement des algorithmes de prédiction et scoring nécessite expertise avancée',
        niveau: 'moyen',
        probabilite: 30,
        impact: 'eleve',
        mitigation: 'Expertise OKA Tech en IA et partenariat universités',
        responsable: 'PELLEN-LAKOUMBA Gueylord',
        statut: 'surveille'
      }
    ],
    objectifs: [
      { id: 1, titre: 'Cartographier 129 entités gabonaises', statut: 'complete', progression: 100 },
      { id: 2, titre: 'Implémenter IA prédictive', statut: 'en_cours', progression: 75 },
      { id: 3, titre: 'Scoring risque automatique', statut: 'en_cours', progression: 80 },
      { id: 4, titre: 'Interface DGSS opérationnelle', statut: 'en_cours', progression: 85 }
    ],
    livrables: [
      { 
        id: 1,
        nom: 'Base de données 129 entités', 
        statut: 'complete', 
        echeance: '2025-02-28',
        description: 'Cartographie complète avec géolocalisation',
        responsable: 'OKA Tech',
        progression: 100
      },
      { 
        id: 2,
        nom: 'Interface cartographie interactive', 
        statut: 'complete', 
        echeance: '2025-06-30',
        description: 'Système de visualisation avancé',
        responsable: 'PELLEN-LAKOUMBA Gueylord',
        progression: 100
      },
      { 
        id: 3,
        nom: 'Algorithmes IA prédictive', 
        statut: 'en_cours', 
        echeance: '2025-12-31',
        description: 'Machine Learning pour analyse comportementale',
        responsable: 'OKA Tech',
        progression: 75
      }
    ],
    kpis: [
      { nom: 'Entités cartographiées', valeur: '129', objectif: '129', unite: 'entités', evolution: 'stable' },
      { nom: 'Précision IA', valeur: '94%', objectif: '95%', unite: '%', evolution: 'positive' },
      { nom: 'Temps traitement analyse', valeur: '2.3s', objectif: '2.0s', unite: 'secondes', evolution: 'positive' },
      { nom: 'Couverture géographique', valeur: '100%', objectif: '100%', unite: '%', evolution: 'stable' }
    ],
    budget_details: {
      categories: [
        { nom: 'Développement IA (OKA Tech)', alloue: 120000, utilise: 90000, pourcentage: 48.0 },
        { nom: 'Infrastructure & Hosting', alloue: 80000, utilise: 55000, pourcentage: 32.0 },
        { nom: 'Coordination DGSS', alloue: 30000, utilise: 20000, pourcentage: 12.0 },
        { nom: 'Formation et Documentation', alloue: 20000, utilise: 15000, pourcentage: 8.0 }
      ]
    },
    activites: [
      { 
        date: 'Il y a 4 heures', 
        action: 'Déploiement algorithme IA v2.1 - Précision améliorée à 94%', 
        auteur: 'PELLEN-LAKOUMBA Gueylord (OKA Tech)',
        type: 'livraison',
        importance: 'haute'
      },
      { 
        date: 'Il y a 1 jour', 
        action: 'Validation cartographie 129 entités par DGSS', 
        auteur: 'Jean-Rémy MAGANGA-NZAMBA',
        type: 'securite',
        importance: 'haute'
      }
    ],
    documents: [
      { id: 1, nom: 'Spécifications IA prédictive', taille: '3.2 MB', type: 'PDF', date: '2025-01-20', url: '/docs/ia-specs.pdf', auteur: 'OKA Tech' },
      { id: 2, nom: 'Cartographie entités validée', taille: '5.8 MB', type: 'PDF', date: '2025-06-15', url: '/docs/cartographie.pdf', auteur: 'DGSS' }
    ],
    prochaines_etapes: [
      { 
        id: 1,
        titre: 'Optimisation algorithmes IA', 
        echeance: '2025-11-30', 
        responsable: 'PELLEN-LAKOUMBA Gueylord',
        priorite: 'haute',
        statut: 'en_cours'
      }
    ]
  },

  {
    id: 'dgss-003',
    nom: 'Digital Gouv - Extension Nationale',
    code: 'DGSS-2026-003',
    description: 'Déploiement du système DGSS sur le territoire national gabonais. Phase pilote à Libreville et Port-Gentil pour 500,000 citoyens avec infrastructure complète.',
    statut: 'planifie',
    priorite: 'moyenne',
    progression: 15,
    budget: 2500000,
    budgetUtilise: 125000,
    budgetReste: 2375000,
    dateDebut: new Date('2026-01-01'),
    dateEcheance: new Date('2026-12-31'),
    responsable: {
      nom: 'Jean-Rémy MAGANGA-NZAMBA',
      poste: 'Consul Général - Coordinateur Extension',
      email: 'consul.general@consulat.ga',
      telephone: '+241 06 60 68 19',
      organisation: 'Consulat Général du Gabon',
      adresse: '26bis Av. Raphaël, 75016 Paris'
    },
    equipe: [
      { 
        initiales: 'JM', 
        nom: 'Jean-Rémy MAGANGA-NZAMBA', 
        role: 'Coordinateur Extension', 
        email: 'consul.general@consulat.ga',
        telephone: '+241 06 60 68 19',
        organisation: 'Consulat Général du Gabon'
      },
      { 
        initiales: 'GA', 
        nom: 'PELLEN-LAKOUMBA Gueylord Asted', 
        role: 'Consultant Stratégie Digitale', 
        email: 'contact@oka-tech.com',
        telephone: '+33 6 60 00 26 16',
        organisation: 'OKA Tech'
      }
    ],
    zone: 'Gabon',
    beneficiaires: 500000,
    phase: 'Planification Stratégique',
    risques: [
      {
        id: 1,
        titre: 'Infrastructure Gabon',
        description: 'Nécessité d\'adapter l\'infrastructure aux conditions locales gabonaises',
        niveau: 'eleve',
        probabilite: 60,
        impact: 'critique',
        mitigation: 'Étude préalable approfondie et partenariats locaux',
        responsable: 'Jean-Rémy MAGANGA-NZAMBA',
        statut: 'nouveau'
      }
    ],
    objectifs: [
      { id: 1, titre: 'Études préliminaires territoire', statut: 'planifie', progression: 20 },
      { id: 2, titre: 'Partenariats institutions gabonaises', statut: 'planifie', progression: 10 },
      { id: 3, titre: 'Adaptation technique OKA Tech', statut: 'planifie', progression: 15 }
    ],
    livrables: [
      { 
        id: 1,
        nom: 'Étude de faisabilité', 
        statut: 'en_cours', 
        echeance: '2026-03-31',
        description: 'Analyse technique et économique extension Gabon',
        responsable: 'PELLEN-LAKOUMBA Gueylord',
        progression: 25
      }
    ],
    kpis: [
      { nom: 'Études préliminaires', valeur: '3/10', objectif: '10/10', unite: 'études', evolution: 'stable' },
      { nom: 'Partenariats signés', valeur: '2/8', objectif: '8/8', unite: 'partenariats', evolution: 'positive' },
      { nom: 'Budget approuvé', valeur: '5%', objectif: '100%', unite: '%', evolution: 'stable' }
    ],
    budget_details: {
      categories: [
        { nom: 'Études et Consulting (OKA Tech)', alloue: 500000, utilise: 75000, pourcentage: 20.0 },
        { nom: 'Infrastructure Gabon', alloue: 1500000, utilise: 25000, pourcentage: 60.0 },
        { nom: 'Formation et Déploiement', alloue: 300000, utilise: 15000, pourcentage: 12.0 },
        { nom: 'Coordination et Management', alloue: 200000, utilise: 10000, pourcentage: 8.0 }
      ]
    },
    activites: [
      { 
        date: 'Il y a 1 semaine', 
        action: 'Lancement étude faisabilité extension Gabon', 
        auteur: 'Jean-Rémy MAGANGA-NZAMBA',
        type: 'reunion',
        importance: 'haute'
      }
    ],
    documents: [
      { id: 1, nom: 'Étude marché Gabon', taille: '4.5 MB', type: 'PDF', date: '2025-10-01', url: '/docs/etude-gabon.pdf', auteur: 'OKA Tech' }
    ],
    prochaines_etapes: [
      { 
        id: 1,
        titre: 'Mission exploratoire Libreville', 
        echeance: '2026-01-15', 
        responsable: 'Jean-Rémy MAGANGA-NZAMBA',
        priorite: 'haute',
        statut: 'planifie'
      }
    ]
  },

  {
    id: 'dgss-004',
    nom: 'Digital Gouv - Surveillance Frontières',
    code: 'DGSS-2025-004',
    description: 'Mise en place d\'un système de surveillance biométrique aux points d\'entrée stratégiques avec détection d\'anomalies en temps réel et intégration DGSS.',
    statut: 'critique',
    priorite: 'critique',
    progression: 45,
    budget: 450000,
    budgetUtilise: 202500,
    budgetReste: 247500,
    dateDebut: new Date('2025-03-01'),
    dateEcheance: new Date('2025-10-31'),
    responsable: {
      nom: 'Jean-Rémy MAGANGA-NZAMBA',
      poste: 'Consul Général - Responsable Sécurité',
      email: 'consul.general@consulat.ga',
      telephone: '+241 06 60 68 19',
      organisation: 'Consulat Général du Gabon / DGSS',
      adresse: '26bis Av. Raphaël, 75016 Paris'
    },
    equipe: [
      { 
        initiales: 'JM', 
        nom: 'Jean-Rémy MAGANGA-NZAMBA', 
        role: 'Responsable Sécurité DGSS', 
        email: 'consul.general@consulat.ga',
        telephone: '+241 06 60 68 19',
        organisation: 'Consulat Général du Gabon'
      },
      { 
        initiales: 'GA', 
        nom: 'PELLEN-LAKOUMBA Gueylord', 
        role: 'Consultant Sécurité Digitale', 
        email: 'contact@oka-tech.com',
        telephone: '+33 6 60 00 26 16',
        organisation: 'OKA Tech'
      }
    ],
    zone: 'Gabon',
    beneficiaires: 12,
    phase: 'Déploiement Critique',
    risques: [
      {
        id: 1,
        titre: 'Sécurité nationale',
        description: 'Enjeux critiques de sécurité aux frontières nécessitent vigilance maximale',
        niveau: 'critique',
        probabilite: 20,
        impact: 'critique',
        mitigation: 'Coordination DGSS et expertise sécurité OKA Tech',
        responsable: 'Jean-Rémy MAGANGA-NZAMBA',
        statut: 'actif'
      }
    ],
    objectifs: [
      { id: 1, titre: 'Installer 12 points de contrôle', statut: 'en_cours', progression: 50 },
      { id: 2, titre: 'Système détection temps réel', statut: 'en_cours', progression: 40 },
      { id: 3, titre: 'Formation agents sécurité', statut: 'planifie', progression: 30 }
    ],
    livrables: [
      { 
        id: 1,
        nom: 'Système biométrique points d\'entrée', 
        statut: 'en_cours', 
        echeance: '2025-10-31',
        description: 'Installation et configuration 12 points',
        responsable: 'Jean-Rémy MAGANGA-NZAMBA',
        progression: 45
      }
    ],
    kpis: [
      { nom: 'Points installés', valeur: '5/12', objectif: '12/12', unite: 'points', evolution: 'positive' },
      { nom: 'Détections réussies', valeur: '1,247', objectif: '2,000', unite: 'détections', evolution: 'positive' },
      { nom: 'Taux faux positifs', valeur: '2.1%', objectif: '<2%', unite: '%', evolution: 'positive' }
    ],
    budget_details: {
      categories: [
        { nom: 'Équipements biométriques', alloue: 200000, utilise: 90000, pourcentage: 44.4 },
        { nom: 'Installation et déploiement', alloue: 150000, utilise: 67500, pourcentage: 33.3 },
        { nom: 'Formation sécurité', alloue: 60000, utilise: 25000, pourcentage: 13.3 },
        { nom: 'Coordination DGSS', alloue: 40000, utilise: 20000, pourcentage: 8.9 }
      ]
    },
    activites: [
      { 
        date: 'Il y a 1 heure', 
        action: 'Alerte critique - Tentative intrusion point Nord détectée', 
        auteur: 'Système Automatique DGSS',
        type: 'securite',
        importance: 'haute'
      }
    ],
    documents: [
      { id: 1, nom: 'Protocole sécurité DGSS', taille: '2.1 MB', type: 'PDF', date: '2025-03-01', url: '/docs/protocole-securite.pdf', auteur: 'DGSS' }
    ],
    prochaines_etapes: [
      { 
        id: 1,
        titre: 'Installation points 6-8', 
        echeance: '2025-11-15', 
        responsable: 'Jean-Rémy MAGANGA-NZAMBA',
        priorite: 'haute',
        statut: 'planifie'
      }
    ]
  },

  {
    id: 'dgss-005',
    nom: 'Digital Gouv - Formation Agents',
    code: 'DGSS-2025-005',
    description: 'Programme de formation et certification des agents DGSS aux nouveaux outils digitaux et procédures de sécurité renforcées avec support OKA Tech.',
    statut: 'actif',
    priorite: 'moyenne',
    progression: 68,
    budget: 180000,
    budgetUtilise: 122400,
    budgetReste: 57600,
    dateDebut: new Date('2025-06-01'),
    dateEcheance: new Date('2025-11-30'),
    responsable: {
      nom: 'PELLEN-LAKOUMBA Gueylord Asted',
      poste: 'Responsable Formation DGSS',
      email: 'contact@oka-tech.com',
      telephone: '+33 6 60 00 26 16',
      organisation: 'OKA Tech',
      adresse: '26bis Av. Raphaël, 75016 Paris'
    },
    equipe: [
      { 
        initiales: 'PL', 
        nom: 'PELLEN-LAKOUMBA Gueylord Asted', 
        role: 'Responsable Formation', 
        email: 'contact@oka-tech.com',
        organisation: 'OKA Tech'
      },
      { 
        initiales: 'GA', 
        nom: 'PELLEN-LAKOUMBA Gueylord Asted', 
        role: 'Chef de Projet', 
        email: 'contact@oka-tech.com',
        telephone: '+33 6 60 00 26 16',
        organisation: 'OKA Tech'
      },
      { 
        initiales: 'IF', 
        nom: 'ITOUTOU BERNY François', 
        role: 'Développeur Front-End', 
        email: 'f.itoutou@oka-tech.com',
        organisation: 'OKA Tech'
      }
    ],
    zone: 'Multi-zones',
    beneficiaires: 450,
    phase: 'Formation Active',
    risques: [
      {
        id: 1,
        titre: 'Résistance changement agents',
        description: 'Adaptation aux nouveaux outils digitaux peut rencontrer des résistances',
        niveau: 'faible',
        probabilite: 25,
        impact: 'moyen',
        mitigation: 'Formation progressive et support continu OKA Tech',
        responsable: 'PELLEN-LAKOUMBA Gueylord Asted',
        statut: 'surveille'
      }
    ],
    objectifs: [
      { id: 1, titre: 'Former 450 agents DGSS', statut: 'en_cours', progression: 68 },
      { id: 2, titre: 'Certification outils digitaux', statut: 'en_cours', progression: 60 },
      { id: 3, titre: 'Support technique continu', statut: 'en_cours', progression: 75 }
    ],
    livrables: [
      { 
        id: 1,
        nom: 'Programme formation digitale', 
        statut: 'complete', 
        echeance: '2025-07-15',
        description: 'Curriculum complet développé avec OKA Tech',
        responsable: 'PELLEN-LAKOUMBA Gueylord',
        progression: 100
      },
      { 
        id: 2,
        nom: 'Certification 306 agents', 
        statut: 'en_cours', 
        echeance: '2025-11-30',
        description: 'Formation aux outils consulat.ga et DGSS',
        responsable: 'PELLEN-LAKOUMBA Gueylord Asted',
        progression: 68
      }
    ],
    kpis: [
      { nom: 'Agents formés', valeur: '306/450', objectif: '450/450', unite: 'agents', evolution: 'positive' },
      { nom: 'Taux réussite certification', valeur: '87%', objectif: '90%', unite: '%', evolution: 'positive' },
      { nom: 'Satisfaction formation', valeur: '92%', objectif: '85%', unite: '%', evolution: 'stable' }
    ],
    budget_details: {
      categories: [
        { nom: 'Formation technique (OKA Tech)', alloue: 80000, utilise: 55000, pourcentage: 44.4 },
        { nom: 'Matériel pédagogique', alloue: 50000, utilise: 35000, pourcentage: 27.8 },
        { nom: 'Coordination formation', alloue: 30000, utilise: 20000, pourcentage: 16.7 },
        { nom: 'Certification et évaluation', alloue: 20000, utilise: 12400, pourcentage: 11.1 }
      ]
    },
    activites: [
      { 
        date: 'Il y a 3 heures', 
        action: 'Session formation consulat.ga - 15 agents certifiés', 
        auteur: 'PELLEN-LAKOUMBA Gueylord (OKA Tech)',
        type: 'formation',
        importance: 'moyenne'
      }
    ],
    documents: [
      { id: 1, nom: 'Manuel formation consulat.ga', taille: '8.5 MB', type: 'PDF', date: '2025-07-01', url: '/docs/manuel-formation.pdf', auteur: 'OKA Tech' }
    ],
    prochaines_etapes: [
      { 
        id: 1,
        titre: 'Formation finale 144 agents restants', 
        echeance: '2025-11-30', 
        responsable: 'PELLEN-LAKOUMBA Gueylord Asted',
        priorite: 'haute',
        statut: 'planifie'
      }
    ]
  }
];

// Export des statistiques globales
export const statsGlobales = {
  totalProjets: projets.length,
  projetsActifs: projets.filter(p => p.statut === 'actif').length,
  projetsCritiques: projets.filter(p => p.statut === 'critique').length,
  budgetTotal: projets.reduce((sum, p) => sum + p.budget, 0),
  budgetUtilise: projets.reduce((sum, p) => sum + p.budgetUtilise, 0),
  progressionMoyenne: Math.round(projets.reduce((sum, p) => sum + p.progression, 0) / projets.length),
  beneficiairesTotal: projets.reduce((sum, p) => sum + (p.beneficiaires || 0), 0)
};

// Export des responsables principaux
export const responsablesPrincipaux = {
  consulGeneral: {
    nom: 'Jean-Rémy MAGANGA-NZAMBA',
    poste: 'Consul Général du Gabon en France',
    email: 'consul.general@consulat.ga',
    telephone: '+241 06 60 68 19',
    adresse: '26bis Av. Raphaël, 75016 Paris',
    projets: ['DGSS-2025-001', 'DGSS-2026-003', 'DGSS-2025-004']
  },
  okaTech: {
    nom: 'PELLEN-LAKOUMBA Gueylord Asted',
    poste: 'Président OKA Tech - Expert Digital Gouv',
    email: 'contact@oka-tech.com',
    telephone: '+33 6 60 00 26 16',
    organisation: 'OKA Tech',
    specialite: 'Stratégie d\'entreprise et digitale appliquée aux Administrations Publiques',
    projets: ['DGSS-2025-002', 'DGSS-2025-001', 'DGSS-2026-003', 'DGSS-2025-005']
  }
};
