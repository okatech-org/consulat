export type ProfileField = {
  path: string;
  label: string;
  type: string;
};

export const profileFields: ProfileField[] = [
  { path: 'personal.firstName', label: 'Prénom', type: 'string' },
  { path: 'personal.lastName', label: 'Nom', type: 'string' },
  { path: 'personal.birthDate', label: 'Date de naissance', type: 'date' },
  { path: 'personal.birthPlace', label: 'Lieu de naissance', type: 'string' },
  { path: 'personal.birthCountry', label: 'Pays de naissance', type: 'string' },
  { path: 'personal.gender', label: 'Genre', type: 'string' },
  { path: 'personal.nationality', label: 'Nationalité', type: 'string' },
  { path: 'personal.acquisitionMode', label: "Mode d'acquisition", type: 'string' },
  { path: 'personal.nipCode', label: 'Code NIP', type: 'string' },
  { path: 'contacts.email', label: 'Email', type: 'email' },
  { path: 'contacts.phone', label: 'Téléphone', type: 'phone' },
  { path: 'contacts.address.street', label: 'Rue', type: 'string' },
  { path: 'contacts.address.city', label: 'Ville', type: 'string' },
  { path: 'contacts.address.postalCode', label: 'Code postal', type: 'string' },
  { path: 'contacts.address.country', label: 'Pays', type: 'string' },
  { path: 'family.maritalStatus', label: 'Statut marital', type: 'string' },
  { path: 'family.father.firstName', label: 'Prénom du père', type: 'string' },
  { path: 'family.father.lastName', label: 'Nom du père', type: 'string' },
  { path: 'family.mother.firstName', label: 'Prénom de la mère', type: 'string' },
  { path: 'family.mother.lastName', label: 'Nom de la mère', type: 'string' },
  { path: 'family.spouse.firstName', label: 'Prénom du conjoint', type: 'string' },
  { path: 'family.spouse.lastName', label: 'Nom du conjoint', type: 'string' },
  {
    path: 'professionSituation.workStatus',
    label: 'Statut professionnel',
    type: 'string',
  },
  { path: 'professionSituation.profession', label: 'Profession', type: 'string' },
  { path: 'professionSituation.employer', label: 'Employeur', type: 'string' },
  {
    path: 'professionSituation.employerAddress',
    label: "Adresse de l'employeur",
    type: 'string',
  },
  {
    path: 'professionSituation.activityInGabon',
    label: 'Activité au Gabon',
    type: 'boolean',
  },
];
