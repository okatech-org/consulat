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
    welcome: {
      title: "Bienvenue dans l'équipe consulaire",
      message:
        "Votre compte agent a été créé avec succès. Vous êtes maintenant membre de l'équipe consulaire de {organization}.",
      action: 'Accéder à mon espace',
    },
    new_agent: {
      title: 'Nouvel agent ajouté',
      message:
        'Un nouvel agent, {firstName} {lastName}, a été ajouté à votre organisation.',
      action: 'Voir le profil',
    },
  },
} as const;
