export const profileFormTooltips = {
  // Basic Info
  identityPicture: {
    content: "Photo d'identité récente sur fond clair",
    example: "Photo format passeport, visage de face, sans lunettes de soleil"
  },
  gender: {
    content: "Sélectionnez votre genre tel qu'inscrit sur vos documents officiels"
  },
  firstName: {
    content: "Votre prénom tel qu'inscrit sur votre passeport ou acte de naissance",
    example: "Jean, Marie-Claire"
  },
  lastName: {
    content: "Votre nom de famille tel qu'inscrit sur votre passeport ou acte de naissance",
    example: "Dupont, Martin-Dubois"
  },
  birthDate: {
    content: "Date de naissance au format jour/mois/année",
    example: "15/03/1985"
  },
  birthPlace: {
    content: "Ville ou village de naissance tel qu'inscrit sur votre acte de naissance",
    example: "Libreville, Port-Gentil"
  },
  birthCountry: {
    content: "Pays de naissance"
  },
  nationality: {
    content: "Votre nationalité actuelle"
  },
  acquisitionMode: {
    content: "Comment avez-vous obtenu votre nationalité gabonaise?"
  },
  passportNumber: {
    content: "Numéro de passeport en majuscules sans espaces",
    example: "AB123456"
  },
  passportIssueDate: {
    content: "Date de délivrance inscrite sur votre passeport",
    example: "01/01/2020"
  },
  passportExpiryDate: {
    content: "Date d'expiration inscrite sur votre passeport",
    example: "01/01/2030"
  },
  passportIssueAuthority: {
    content: "Autorité ayant délivré le passeport",
    example: "Ministère de l'Intérieur"
  },
  cardPin: {
    content: "Code NIP à 6 chiffres (optionnel)",
    example: "123456"
  },

  // Contact Info
  email: {
    content: "Adresse email valide pour recevoir les notifications",
    example: "nom.prenom@email.com"
  },
  phoneNumber: {
    content: "Numéro de téléphone avec indicatif",
    example: "+241 07 12 34 56"
  },
  address: {
    content: "Adresse complète de résidence actuelle"
  },
  residentContact: {
    content: "Contact d'urgence dans votre pays de résidence",
    example: "Personne à contacter en cas d'urgence"
  },

  // Family Info
  maritalStatus: {
    content: "Votre situation matrimoniale actuelle"
  },
  fatherFullName: {
    content: "Nom complet de votre père",
    example: "Jean Martin Dupont"
  },
  motherFullName: {
    content: "Nom complet de votre mère (nom de jeune fille)",
    example: "Marie Claire Durand"
  },
  spouseFullName: {
    content: "Nom complet de votre conjoint(e)",
    example: "Paul Pierre Martin"
  },

  // Professional Info
  workStatus: {
    content: "Votre situation professionnelle actuelle"
  },
  profession: {
    content: "Votre métier ou profession",
    example: "Ingénieur, Médecin, Enseignant"
  },
  employer: {
    content: "Nom de votre employeur actuel",
    example: "Société ABC, Ministère XYZ"
  },
  employerAddress: {
    content: "Adresse complète de votre lieu de travail"
  },
  activityInGabon: {
    content: "Dernière activité exercée au Gabon",
    example: "Consultant, Commerçant"
  },

  // Documents
  passport: {
    content: "Copie de la page d'identité de votre passeport",
    example: "Format PDF ou image (JPG, PNG)"
  },
  birthCertificate: {
    content: "Copie intégrale de votre acte de naissance",
    example: "Document de moins de 3 mois"
  },
  addressProof: {
    content: "Justificatif de domicile récent",
    example: "Facture d'électricité, contrat de location (moins de 3 mois)"
  },
  residencePermit: {
    content: "Titre de séjour en cours de validité",
    example: "Pour les non-Gabonais résidant au Gabon"
  }
} as const;