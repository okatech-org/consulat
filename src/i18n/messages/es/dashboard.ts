export default {
  sections: {
    profile: {
      title: 'Mon profil',
      status: {
        pending: 'En attente',
      },
      completion: 'Complétude du profil',
      missing_fields: 'Champs manquants :',
      fields: {
        all: 'Tous les champs sont requis',
        identity_photo: "Photo d'identité",
        passport: 'Passeport',
        birth_certificate: 'Acte de naissance',
        residence_permit: 'Titre de séjour',
      },
      actions: {
        complete: 'Compléter mon profil',
        view: 'Voir le profil',
      },
      and_more: 'et {count} autres',
    },
  },
} as const;
