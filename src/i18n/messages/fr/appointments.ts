export default {
  description: 'Gérez vos rendez-vous consulaires',
  new: {
    title: 'Prendre un rendez-vous',
    description:
      'Sélectionnez un service et un créneau disponible pour votre rendez-vous',
    button: 'Prendre rendez-vous',
    back: 'Retour aux rendez-vous',
    no_slots_available: 'Aucun créneau disponible',
    loading: 'Chargement des créneaux...',
    attendee_id_required: 'Vous devez être connecté pour prendre un rendez-vous',
  },
  appointmentWith: 'Rendez-vous avec {name}',
  cancel: {
    title: 'Annuler le rendez-vous',
    description:
      'Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.',
  },
  tabs: {
    upcoming: {
      title: 'Rendez-vous à venir',
      empty: 'Aucun rendez-vous à venir',
    },
    past: {
      title: 'Rendez-vous passés',
      empty: 'Aucun rendez-vous passé',
    },
    cancelled: {
      title: 'Rendez-vous annulés',
      empty: 'Aucun rendez-vous annulé',
    },
  },
  service_categories: {
    IDENTITY: 'Identité',
    CIVIL_STATUS: 'État civil',
    VISA: 'Visa',
    CERTIFICATION: 'Certification',
    REGISTRATION: 'Inscription',
    OTHER: 'Autre',
  },
  title: 'Mes rendez-vous',
  status: {
    loading: 'Chargement des rendez-vous...',
    no_appointments: 'Aucun rendez-vous',
    upcoming: 'À venir',
    past: 'Passés',
    cancelled: 'Annulés',
    upcoming_title: 'Rendez-vous à venir',
    past_title: 'Rendez-vous passés',
    cancelled_title: 'Rendez-vous annulés',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    missed: 'Manqué',
    rescheduled: 'Reporté',
  },
  actions: {
    new: 'Nouveau rendez-vous',
    reschedule: 'Reporter',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    submitting: 'Envoi en cours...',
    loading: 'Chargement des rendez-vous...',
  },
  service: {
    label: 'Service',
    placeholder: 'Sélectionnez un service',
    description: 'Choisissez le service pour lequel vous souhaitez prendre rendez-vous',
  },
  type: {
    label: 'Type de rendez-vous',
    placeholder: 'Sélectionnez un type',
    options: {
      DOCUMENT_SUBMISSION: 'Dépôt de documents',
      DOCUMENT_COLLECTION: 'Retrait de documents',
      INTERVIEW: 'Entretien',
      MARRIAGE_CEREMONY: 'Cérémonie de mariage',
      EMERGENCY: 'Urgence',
      OTHER: 'Autre',
    },
  },
  datetime: {
    pick_date: 'Sélectionnez une date',
    pick_time: 'Sélectionnez un horaire',
  },
  confirmation: {
    service: 'Service',
    type: 'Type',
    date: 'Date',
    time: 'Horaire',
  },
  steps: {
    service: 'Service',
    slot: 'Horaire',
    confirmation: 'Confirmation',
    request: 'Demande',
  },
  agent: 'Agent consulaire',
  validation: {
    date_required: 'La date est requise',
    start_time_required: "L'heure de début est requise",
    end_time_required: "L'heure de fin est requise",
    type_required: 'Le type de rendez-vous est requis',
    organization_required: "L'organisation est requise",
    service_required: 'Le service est requis',
    country_required: 'Le pays est requis',
    duplicate_service: 'Vous avez déjà un rendez-vous pour ce service',
    duplicate_request: 'Vous avez déjà un rendez-vous pour cette demande',
  },
  reschedule: {
    title: 'Reporter le rendez-vous',
    description:
      'Sélectionnez une nouvelle date et un nouveau créneau pour votre rendez-vous',
    success: {
      title: 'Rendez-vous reporté',
      description: 'Votre rendez-vous a été reporté avec succès',
    },
    error: {
      not_found: 'Rendez-vous introuvable',
      not_found_description:
        "Le rendez-vous que vous essayez de reporter n'existe pas ou a été supprimé",
      failed: 'Échec du report',
      failed_description: 'Une erreur est survenue lors du report du rendez-vous',
    },
  },
  error: {
    failed: 'Une erreur est survenue',
    not_found: 'Rendez-vous introuvable',
    not_found_description:
      "Le rendez-vous que vous essayez de gérer n'existe pas ou a été supprimé",
  },
  details: {
    title: 'Détails du rendez-vous',
    subtitle: 'Rendez-vous #{id}',
    service: 'Service',
    attendee: 'Personne',
    datetime: 'Date et heure',
    location: 'Lieu',
    duration: '{duration} minutes',
  },
  request: {
    label: 'Demande',
    placeholder: 'Sélectionnez une demande',
    description: 'Choisissez la demande pour laquelle vous souhaitez prendre rendez-vous',
    no_eligible: 'Aucune demande éligible pour la prise de rendez-vous.',
  },
} as const;
