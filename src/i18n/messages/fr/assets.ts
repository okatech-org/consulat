export default {
  marital_status: {
    single: 'Célibataire',
    married: 'Marié(e)',
    divorced: 'Divorcé(e)',
    widowed: 'Veuf(ve)',
    cohabiting: 'En concubinage',
    civil_union: 'PACS',
  },
  work_status: {
    employee: 'Salarié',
    entrepreneur: 'Entrepreneur',
    unemployed: 'Sans emploi',
    student: 'Étudiant',
    retired: 'Retraité',
    other: 'Autre',
  },
  gender: {
    male: 'Monsieur',
    male_type: 'Masculin',
    female: 'Madame',
    female_type: 'Féminin',
  },
  status: {
    pending: 'En traitement',
    approved: 'Valide',
    rejected: 'Invalide',
    incomplete: 'Incomplet',
  },
} as const;
