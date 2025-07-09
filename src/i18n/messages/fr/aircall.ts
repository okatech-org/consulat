export default {
  title: 'Configuration Aircall',
  description: 'Gérer l\'intégration téléphonique Aircall pour votre organisation',
  
  settings: {
    title: 'Paramètres Aircall',
    enabled: 'Activer Aircall',
    apiKey: 'Clé API',
    apiId: 'ID API',
    integrationName: 'Nom de l\'intégration',
    workspaceSize: 'Taille de l\'espace de travail',
    
    workspaceSizes: {
      small: 'Petit',
      medium: 'Moyen',
      big: 'Grand',
    },
    
    events: {
      title: 'Événements',
      onLogin: 'Connexion',
      onLogout: 'Déconnexion',
      onCallStart: 'Début d\'appel',
      onCallEnd: 'Fin d\'appel',
      onCallAnswer: 'Réponse d\'appel',
    },
    
    permissions: {
      title: 'Permissions',
      canMakeOutboundCalls: 'Appels sortants',
      canReceiveInboundCalls: 'Appels entrants',
      canTransferCalls: 'Transfert d\'appels',
      canRecordCalls: 'Enregistrement d\'appels',
    },
    
    placeholders: {
      apiKey: 'Entrez votre clé API Aircall',
      apiId: 'Entrez votre ID API Aircall',
      integrationName: 'Nom de votre intégration (ex: consulat-ga)',
    },
  },
  
  call: {
    title: 'Appel téléphonique',
    calling: 'Appel en cours...',
    connected: 'Connecté',
    ended: 'Appel terminé',
    idle: 'En attente',
    
    actions: {
      call: 'Appeler',
      hangup: 'Raccrocher',
      answer: 'Répondre',
      hold: 'Mettre en attente',
      mute: 'Couper le micro',
      unmute: 'Activer le micro',
    },
    
    status: {
      connected: 'Aircall connecté',
      disconnected: 'Aircall déconnecté',
      loading: 'Chargement...',
      error: 'Erreur de connexion',
    },
  },
  
  notifications: {
    configSaved: 'Configuration Aircall sauvegardée avec succès',
    configError: 'Erreur lors de la sauvegarde de la configuration',
    callStarted: 'Appel démarré',
    callEnded: 'Appel terminé',
    callConnected: 'Appel connecté',
    callError: 'Erreur lors de l\'appel',
    noPhoneNumber: 'Aucun numéro de téléphone disponible',
    notConnected: 'Aircall n\'est pas connecté',
  },
  
  errors: {
    invalidConfig: 'Configuration Aircall invalide',
    connectionFailed: 'Impossible de se connecter à Aircall',
    scriptLoadFailed: 'Impossible de charger le script Aircall',
    callFailed: 'Échec de l\'appel',
    noPermission: 'Vous n\'avez pas les permissions nécessaires',
  },
  
  buttons: {
    save: 'Sauvegarder',
    cancel: 'Annuler',
    test: 'Tester la connexion',
    reset: 'Réinitialiser',
  },
  
  help: {
    title: 'Aide Aircall',
    description: 'Pour configurer Aircall, vous devez avoir un compte Aircall et les clés API appropriées.',
    steps: {
      1: 'Connectez-vous à votre compte Aircall',
      2: 'Allez dans les paramètres API',
      3: 'Générez une nouvelle clé API',
      4: 'Copiez la clé API et l\'ID API',
      5: 'Collez-les dans les champs correspondants',
      6: 'Activez les permissions nécessaires',
      7: 'Sauvegardez la configuration',
    },
  },
} as const; 