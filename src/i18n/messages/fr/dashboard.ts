export default {
  // Types de dashboard
  admin: {
    title: 'Tableau de bord Administrateur',
    description: 'Vue d\'ensemble des activités consulaires et gestion administrative',
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
    requests_today: 'Demandes aujourd\'hui',
    appointments_today: 'Rendez-vous aujourd\'hui',
    completed_today: 'Terminées aujourd\'hui',
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
} as const;
