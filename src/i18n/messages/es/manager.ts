export default {
  dashboard: {
    title: 'Tableau de bord',
    overview: {
      title: "Vue d'ensemble",
      pending_requests: 'Demandes en attente',
      processing_requests: 'Demandes en cours',
      completed_requests: 'Demandes traitées',
    },
    stats: {
      daily: 'Statistiques journalières',
      weekly: 'Statistiques hebdomadaires',
      monthly: 'Statistiques mensuelles',
      processing_time: 'Temps moyen de traitement',
      completion_rate: 'Taux de complétion',
      pending_requests: 'Demandes en attente',
      pending_description: 'Demandes nécessitant une action',
      active_users: 'Utilisateurs actifs',
      users_description: "Utilisateurs connectés aujourd'hui",
      average_time: 'Temps moyen de traitement',
      time_description: 'Durée moyenne de traitement des demandes',
      completed_requests: 'Demandes traitées',
      completed_description: 'Demandes finalisées ce mois',
    },
    queue: {
      title: "Files d'attente",
      by_type: 'Par type de démarche',
      empty: 'Aucune demande en attente',
    },
    alerts: {
      title: 'Alertes importantes',
      empty: 'Aucune alerte',
    },
    priority: {
      high: 'Urgent',
      medium: 'Normal',
      low: 'Faible',
    },
    requests: {
      types: {
        passport_request: 'Demande de passeport',
        visa_request: 'Demande de visa',
        birth_registration: 'Déclaration de naissance',
        marriage_registration: 'Déclaration de mariage',
        death_registration: 'Déclaration de décès',
        certificate_request: 'Demande de certificat',
        consular_card: 'Carte consulaire',
        document_legalization: 'Légalisation de document',
      },
    },
  },
  settings: {
    title: "Paramètres de l'organisation",
    description: 'Personnalisez les paramètres de votre organisation',
    copy_config: 'Copier la configuration',
    copy_from: 'Copier depuis',
    copy_to: 'Copier vers',
    copy_success: 'Configuration copiée avec succès',
    tabs: {
      organization: "Informations de l'organisme",
      general: 'Paramètres généraux',
    },
    general: {
      title: 'Paramètres généraux',
      description: "Personnalisez les paramètres généraux de l'organisation",
      notifications: {
        sms: 'Notifications SMS',
        sms_description:
          'Recevez des notifications par SMS pour les demandes en attente et les rendez-vous',
        email: 'Notifications Email',
        email_description:
          'Recevez des notifications par email pour les demandes en attente et les rendez-vous',
      },
      sms: {
        title: 'Notifications SMS',
        enabled: 'Activer les notifications SMS',
        description:
          'Recevez des notifications par SMS pour les demandes en attente et les rendez-vous',
      },
      save: 'Enregistrer les paramètres',
      saving: 'Enregistrement en cours...',
    },
    messages: {
      success: {
        update: 'Paramètres mis à jour',
        update_description:
          "Les paramètres de l'organisation ont été mis à jour avec succès",
      },
      error: {
        update: 'Erreur lors de la mise à jour',
        unknown: 'Une erreur inconnue est survenue',
      },
    },
  },
} as const;
