export default {
  dashboard: {
    title: 'Tableau de bord',
    welcome: 'Bienvenue, {name}',
    stats: {
      appointments: 'Rendez-vous',
      appointments_description: "Rendez-vous à venir aujourd'hui",
      requests: 'Demandes',
      requests_description: 'Demandes en attente de traitement',
      users: 'Utilisateurs',
      users_description: 'Utilisateurs actifs',
    },
  },
  notifications: {
    REQUEST_NEW: {
      title: 'Vous avez été assigné à une nouvelle demande',
      message: 'Une demande de type {requestType} vous a été assignée',
      see_request: 'Voir la demande',
    },
  },
} as const;
