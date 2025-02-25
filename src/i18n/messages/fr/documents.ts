export default {
  title: 'Mes documents',
  description: 'Gérez vos documents officiels et suivez leur statut',
  empty: {
    title: 'Aucun document',
    description: "Vous n'avez pas encore téléchargé de documents",
  },
  types: {
    passport: 'Passeport',
    birth_certificate: 'Acte de naissance',
    residence_permit: 'Titre de séjour',
    proof_of_address: 'Justificatif de domicile',
    identity_card: "Carte d'identité",
  },
  status: {
    pending: 'En attente',
    validated: 'Validé',
    rejected: 'Rejeté',
    expired: 'Expiré',
  },
  expires_on: 'Expire le',
  actions: {
    view: 'Voir',
    download: 'Télécharger',
  },
} as const;
