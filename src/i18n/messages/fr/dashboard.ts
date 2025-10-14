export default {
  // Types de dashboard
  admin: {
    title: 'Tableau de bord Administrateur',
    description: "Vue d'ensemble des activités consulaires et gestion administrative",
  },
  agent: {
    title: 'Tableau de bord Agent',
    description: 'Gestion de vos demandes assignées et rendez-vous',
  },
  manager: {
    title: 'Tableau de bord Manager',
    description: 'Supervision des équipes et métriques de performance',
  },
  superadmin: {
    title: 'Tableau de bord Super Administrateur',
    description: 'Gestion globale du système et des organisations',
  },
  user: {
    title: 'Mon Espace Personnel',
    description: 'Suivi de vos démarches consulaires et services disponibles',
  },

  // Dashboard unifié
  unified: {
    title: 'Mon Espace Consulaire',
    subtitle: 'Gérez vos demandes et accédez à tous vos services',
    help: 'Aide',
    new_request: 'Nouvelle demande',
    refresh: 'Actualiser',
    error: 'Erreur lors du chargement',
    retry: 'Réessayer',

    // User Overview
    user_overview: {
      consular_card: 'Carte consulaire',
      passport_expires: 'Passeport expire le',
      passport_available: 'Passeport disponible',
      member_since: 'Inscrit depuis',
      anonymous_user: 'Utilisateur anonyme',
      member_since_unknown: "Date d'inscription inconnue",
      status: 'Statut',
      stats: {
        in_progress: 'EN COURS',
        completed: 'TERMINÉES',
        documents: 'DOCUMENTS',
        children: 'ENFANTS',
      },
      profile_status: {
        draft: 'Brouillon',
        active: 'Actif',
        inactive: 'Inactif',
        pending: 'En attente',
        suspended: 'Suspendu',
      },
    },

    // Empty State
    empty_state: {
      title: 'Aucune demande en cours',
      description:
        "Vous n'avez actuellement aucune demande de service en cours de traitement. Démarrez votre première demande pour commencer vos démarches consulaires.",
      create_first: 'Créer ma première demande',
    },

    // Quick Actions
    quick_actions: {
      title: 'Services et Actions',
      subtitle: 'Accédez rapidement à vos services',
      view_all_services: 'Voir tous les services',
      actions: {
        life_certificate: {
          title: 'Certificat de vie',
          description: 'Obtenez votre certificat de vie pour vos démarches de pension',
        },
        appointment: {
          title: 'Prendre un rendez-vous',
          description: 'Planifiez votre visite au consulat',
        },
        document_legalization: {
          title: 'Légalisation de document',
          description: 'Faites légaliser vos documents officiels',
        },
        profile_update: {
          title: 'Mise à jour du profil',
          description: 'Complétez ou modifiez vos informations personnelles',
        },
        various_certificates: {
          title: 'Attestations diverses',
          description: 'Demandez vos attestations de résidence, revenus, etc.',
        },
        consular_support: {
          title: 'Support consulaire',
          description: 'Contactez notre équipe pour toute assistance',
        },
      },
    },

    // Recent History
    recent_history: {
      title: 'Historique récent',
      subtitle: 'Vos dernières demandes',
      view_all: 'Voir tout',
      no_history: 'Aucun historique',
      no_history_description: "Vous n'avez pas encore de demandes dans votre historique.",
      make_first_request: 'Faire ma première demande',
    },

    // Current Request Card
    current_request: {
      submitted_ago: 'Demande soumise',
      assigned_to: 'Assignée à',
      status: {
        processing: 'En traitement',
        completed: 'Terminée',
        validated: 'Validée',
        submitted: 'Soumise',
        draft: 'Brouillon',
        pending: 'En attente',
        rejected: 'Rejetée',
        cancelled: 'Annulée',
        edited: 'Modifiée',
        pending_completion: "En attente d'information",
        card_in_production: 'Carte en production',
        document_in_production: 'Document en production',
        ready_for_pickup: 'Prête pour retrait',
        appointment_scheduled: 'RDV programmé',
      },
      progress: {
        submitted: 'Soumise',
        verified: 'Vérifiée',
        in_processing: 'En traitement',
        validation: 'Validation',
        completed: 'Terminée',
      },
      steps: {
        request_submitted: 'Demande soumise',
        documents_verified: 'Documents vérifiés',
        processing: 'En cours de traitement',
        final_validation: 'Validation finale',
        request_completed: 'Demande terminée',
        by: 'Par',
        waiting: 'En attente',
        ready_for_pickup: 'Prête pour retrait',
      },
      actions: {
        view_details: 'Voir les détails',
        contact_agent: "Contacter l'agent",
        add_document: 'Ajouter un document',
        contact: 'Contacter',
        document: 'Document',
      },
    },
  },

  // Statistiques
  stats: {
    completed_requests: 'Demandes terminées',
    processing_requests: 'En traitement',
    validated_profiles: 'Profils validés',
    pending_profiles: 'Profils en attente',
    total_users: 'Utilisateurs totaux',
    total_appointments: 'Rendez-vous totaux',
    pending_requests: 'Demandes en attente',
    upcoming_appointments: 'Rendez-vous à venir',
    completed_appointments: 'Rendez-vous terminés',
    total_requests: 'Demandes totales',
    requests_today: "Demandes aujourd'hui",
    appointments_today: "Rendez-vous aujourd'hui",
    completed_today: "Terminées aujourd'hui",
    urgent_pending: 'Urgentes en attente',
    total_countries: 'Pays totaux',
    total_organizations: 'Organisations totales',
    total_services: 'Services totaux',
    active_countries: 'Pays actifs',
    active_organizations: 'Organisations actives',
  },

  // Sections
  sections: {
    real_time_stats: {
      title: 'Statistiques en temps réel',
      description: 'Données actualisées toutes les 10 secondes',
    },
    recent_data: {
      title: 'Données récentes',
      recent_registrations: 'Inscriptions récentes',
      upcoming_appointments: 'Rendez-vous à venir',
      recent_requests: 'Demandes récentes',
    },
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
        proof_of_address: 'Preuve de domicile',
      },
      actions: {
        complete: 'Compléter mon profil',
        view: 'Voir le profil',
      },
      and_more: 'et {count} autres',
    },
  },

  // Actions
  actions: {
    refresh: 'Actualiser',
    view_all: 'Voir tout',
    retry: 'Réessayer',
  },

  // Messages
  messages: {
    loading: 'Chargement...',
    error: 'Erreur lors du chargement des données',
    no_data: 'Aucune donnée disponible',
    unauthorized: 'Accès non autorisé',
  },

  // Contact page
  contact: {
    title: 'Nous contacter',
    description: 'Choisissez le moyen de contact qui vous convient le mieux',
    back: 'Retour',

    // Cas où l'utilisateur n'a pas d'organisme associé
    no_organization: {
      title: 'Aucun organisme consulaire associé',
      description:
        "Vous devez d'abord soumettre votre demande d'inscription consulaire pour accéder aux services de contact de votre organisme.",
      action: 'Démarrer mon inscription consulaire',
    },

    // Section support pour les utilisateurs non associés
    support: {
      title: 'Support et assistance',
      chat: {
        title: 'Chat en direct avec Ray',
        description: 'Assistant virtuel disponible 24h/7j',
        action: 'Démarrer le chat',
      },
      feedback: {
        title: 'Envoyer un commentaire',
        description: 'Partagez vos questions ou suggestions',
        action: 'Contacter le support',
      },
    },

    methods: {
      emergency: {
        title: "Assistance d'urgence",
        description: "Pour les situations d'urgence uniquement",
        action: 'Appeler maintenant',
      },
      chat: {
        title: 'Chat en direct',
        description: 'Assistance immédiate par chat',
        action: 'Démarrer le chat',
      },
      email: {
        title: 'Email',
        description: 'Réponse sous 24-48h',
        action: 'Envoyer un email',
      },
      consulate: {
        title: 'Se rendre au consulat',
        description: 'Rendez-vous sur place',
        action: 'Prendre RDV',
      },
    },

    info: {
      title: 'Informations de contact',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      hours: 'Horaires',
      website: 'Site web',
      address_value: '26 bis avenue Raphaël\n75016 Paris, France',
      phone_value: '+33 1 45 00 97 57',
      email_value: 'contact@consulat.ga',
      hours_value: 'Lun-Ven: 9h-17h\nFermé le weekend',
      address_unavailable: 'Adresse non disponible',
      phone_unavailable: 'Téléphone non disponible',
      email_unavailable: 'Email non disponible',
      hours_unavailable: 'Horaires non disponibles',
      closed: 'Fermé',
    },

    // Jours de la semaine pour les horaires
    days: {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mer',
      thursday: 'Jeu',
      friday: 'Ven',
      saturday: 'Sam',
      sunday: 'Dim',
    },
  },

  // History page
  history: {
    title: 'Historique des demandes',
    description: 'Retrouvez toutes vos demandes passées et en cours',
    back: 'Retour',
    search_placeholder: 'Rechercher par nom ou ID...',
    status_placeholder: 'Sélectionner un statut',
    statuses: {
      all: 'Tous les statuts',
      processing: 'En cours',
      completed: 'Terminées',
      submitted: 'Soumises',
      draft: 'Brouillons',
      rejected: 'Rejetées',
      cancelled: 'Annulées',
      pending: 'En attente',
      validated: 'Validées',
    },
    labels: {
      completed: 'Terminée',
      processing: 'En traitement',
      validated: 'Validée',
      submitted: 'Soumise',
      draft: 'Brouillon',
      rejected: 'Rejetée',
      cancelled: 'Annulée',
      pending: 'En attente',
    },
    submitted_ago: 'Soumise',
    id_label: 'ID',
    actions: {
      view_details: 'Voir les détails',
      download: 'Télécharger',
      contact_agent: "Contacter l'agent",
    },
    empty: {
      no_requests: "Aucune demande dans l'historique",
      no_requests_description: "Vous n'avez pas encore fait de demande de service.",
      no_results: 'Aucune demande trouvée',
      no_results_description: 'Essayez de modifier vos filtres de recherche.',
      reset_filters: 'Réinitialiser les filtres',
      first_request: 'Faire ma première demande',
    },
    error: {
      loading: "Erreur lors du chargement de l'historique",
      retry: 'Réessayer',
    },
  },

  // Service request details page
  request_details: {
    contact: {
      title: 'Nous contacter',
      subtitle: 'Choisissez le moyen de contact qui vous convient le mieux',
      emergency: {
        title: "Assistance d'urgence",
        description: "Pour les situations d'urgence uniquement",
        action: 'Appeler maintenant',
      },
      chat: {
        title: 'Chat en ligne',
        description: 'Assistance immédiate par chat',
        action: 'Démarrer le chat',
      },
      email: {
        title: 'Email',
        description: 'Réponse sous 24-48h',
        action: 'Envoyer un email',
      },
      visit: {
        title: 'Se rendre au consulat',
        description: 'Rendez-vous sur place',
        action: 'Prendre RDV',
      },
      info: {
        title: 'Informations de contact',
        address: 'Adresse',
        phone: 'Téléphone',
        email: 'Email',
        hours: 'Horaires',
        office_hours: 'Lun-Ven: 9h-17h\nFermé le weekend',
      },
    },
    details: {
      title: 'Détails de votre demande en cours',
      progress: {
        title: 'Progression de votre demande',
        steps: {
          submitted: 'Soumise',
          verified: 'Vérifiée',
          processing: 'En traitement',
          validation: 'Validation',
          completed: 'Terminée',
        },
      },
      info: {
        title: 'Informations de la demande',
        request_number: 'Numéro de demande',
        submission_date: 'Date de soumission',
        last_update: 'Dernière mise à jour',
        assigned_to: 'Assignée à',
        estimated_deadline: 'Délai estimé',
        fees: 'Frais',
        free: 'Gratuit',
        days_ago: 'il y a {count} jours',
        business_days: '{count} jours ouvrés',
      },
      documents: {
        title: 'Documents fournis',
        verified: 'Vérifié',
        under_review: 'En cours de vérification',
        view: 'Voir',
      },
      actions: {
        title: 'Actions disponibles',
        contact_agent: "Contacter l'agent",
        add_document: 'Ajouter un document',
      },
    },
    history: {
      title: 'Historique des demandes',
      subtitle: 'Retrouvez toutes vos demandes passées et en cours',
      filters: {
        search: 'Rechercher par nom ou ID...',
        all_requests: 'Toutes les demandes',
        in_progress: 'En cours',
        completed: 'Terminées',
        pending: 'En attente',
        all_services: 'Tous les services',
        consular_registration: 'Inscription Consulaire',
        life_certificate: 'Certificat de vie',
        certificates: 'Attestations',
      },
      request_info: {
        submitted_on: 'Soumise le',
        assigned_to: 'Assignée à',
        id: 'ID',
      },
      actions: {
        view_details: 'Voir les détails',
        contact: 'Contacter',
        download: 'Télécharger',
        download_card: 'Télécharger la carte',
      },
    },
    new_request: {
      title: 'Nouvelle demande',
      subtitle: 'Choisissez le service consulaire dont vous avez besoin',
      filters: {
        search: 'Rechercher un service par nom, description ou organisme...',
        all_categories: 'Toutes catégories',
        civil_status: 'État civil',
        identity: 'Identité',
        certificates: 'Attestations',
        legalizations: 'Légalisations',
        all_organizations: 'Tous organismes',
        gabon_consulate: 'Consulat Général du Gabon',
        foreign_affairs: 'Ministère des Affaires Étrangères',
      },
      service_status: {
        active: 'Actif',
      },
      service_action: 'Démarrer la demande',
      help: {
        title: "Besoin d'aide ?",
        description:
          'Vous ne trouvez pas le service que vous cherchez ou vous avez des questions sur une démarche ?',
        contact: 'Nous contacter',
        guide: "Guide d'aide",
      },
    },
    navigation: {
      back: 'Retour',
      breadcrumb: {
        my_space: 'Mon espace',
        procedures: 'Démarches et services',
        consular_services: 'Services consulaires',
      },
      tabs: {
        contact: 'Nous contacter',
        details: 'Voir les détails',
        history: 'Historique des demandes',
        new_request: 'Nouvelle demande',
      },
    },
  },
} as const;
