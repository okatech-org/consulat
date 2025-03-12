export default {
  form: {
    title: "Formulaire d'inscription consulaire",
    subtitle: 'Suivez les étapes pour créer votre carte consulaire',
    gender: 'Genre',
    first_name: 'Prénom(s)',
    last_name: 'Nom(s)',
    first_name_placeholder: 'Entrez votre/vos prénom(s)',
    last_name_placeholder: 'Entrez votre/vos nom(s)',
    birth_date: 'Date de naissance',
    birth_place: 'Lieu de naissance',
    birth_place_placeholder: 'Ville de naissance',
    birth_country: 'Pays de naissance',
    nationality: 'Nationalité',
    select_nationality: 'Sélectionnez votre nationalité',
    search_nationality: 'Rechercher une nationalité',
    no_nationality_found: 'Aucune nationalité trouvée',
    required_field: 'Ce champ est obligatoire',
    invalid_date: 'Date invalide',
    acquiring_mode: "Mode d'acquisition de la nationalité",
    passport: {
      section_title: 'Informations du passeport',
      section_description:
        'Renseignez les informations de votre passeport gabonais en cours de validité',
      number: {
        label: 'Numéro de passeport',
        placeholder: 'Ex: GA123456',
        help: 'Le numéro se trouve en haut à droite de votre passeport',
      },
      issue_date: {
        label: "Date d'émission",
        placeholder: "Sélectionnez la date d'émission",
        help: 'Date à laquelle votre passeport a été émis',
      },
      expiry_date: {
        label: "Date d'expiration",
        placeholder: "Sélectionnez la date d'expiration",
        help: 'Date à laquelle votre passeport expire',
      },
      authority: {
        label: 'Autorité émettrice',
        placeholder: "Ex: Ministère de l'Intérieur",
        help: "L'organisme qui a délivré votre passeport",
      },
    },
  },
  steps: {
    request_type: 'Type de demande',
    documents: 'Documents',
    identity: 'Identité',
    family: 'Famille',
    contact: 'Contact',
    professional: 'Professionnel',
    review: 'Révision',
    progress: 'Étape {current}/{total}',
    status: {
      complete: 'Terminé',
      in_progress: 'En cours',
      pending: 'À venir',
    },
  },
  documents: {
    analysis: {
      success: {
        title: 'Documents analysés avec succès',
        description:
          "Les informations ont été extraites de vos documents. Vous pouvez maintenant passer à l'étape suivante.",
        action: 'Continuer',
        action_hint: "Cliquez pour passer à l'étape suivante",
      },
      error: {
        failed_analysis: "L'analyse des documents a échoué",
        retry: 'Réessayer',
      },
    },
  },
  navigation: {
    previous: 'Précédent',
    next: 'Suivant',
    submit: 'Soumettre',
    submitting: 'Envoi en cours...',
  },
  validation: {
    dates: {
      issue_date_future: "La date d'émission ne peut pas être dans le futur",
      expiry_date_past: "La date d'expiration doit être dans le futur",
      invalid_date_format: 'Format de date invalide',
    },
    error: {
      title: 'Erreur de validation',
      description: 'Veuillez corriger les erreurs avant de continuer',
    },
    submit: 'Soumettre',
  },
  help: {
    request_type:
      "Sélectionnez le type de demande et votre mode d'acquisition de la nationalité gabonaise",
    documents:
      'Téléchargez les documents requis. Ces documents seront analysés pour pré-remplir vos informations',
    identity: "Vérifiez et complétez vos informations d'identité",
    family: 'Renseignez les informations sur votre famille',
    contact: 'Fournissez vos coordonnées actuelles',
    professional: 'Renseignez votre situation professionnelle',
    review: 'Vérifiez toutes les informations avant de soumettre',
  },
  success: {
    title: 'Demande envoyée',
    form_submitted: 'Votre demande de carte consulaire a été envoyée avec succès',
  },
  errors: {
    submission_failed: "Échec de l'envoi du formulaire",
    validation_failed: 'Certaines informations sont invalides',
  },
  submission: {
    success: {
      title: 'Demande envoyée',
      description: 'Votre demande a été envoyée avec succès',
      action: 'Voir mon espace',
      action_hint: 'Aller à mon espace personnel',
    },
    error: {
      title: 'Erreur',
      unknown: "Une erreur est survenue lors de l'envoi",
    },
  },
} as const;
