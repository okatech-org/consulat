export default {
  title: 'Paramètres du compte',
  roles: {
    SUPER_ADMIN: 'Super administrateur',
    ADMIN: 'Administrateur',
    AGENT: 'Agent',
    USER: 'Utilisateur',
    MANAGER: 'Manager',
  },
  // Common translations
  profile: 'Profil',
  security: 'Sécurité',
  notifications: 'Notifications',
  profile_information: 'Informations du profil',
  profile_description: 'Gérez vos informations personnelles et vos préférences.',
  first_name: 'Prénom',
  last_name: 'Nom',
  email: 'Email',
  change_avatar: "Changer l'avatar",
  save_changes: 'Enregistrer les modifications',
  profile_updated: 'Profil mis à jour avec succès',
  profile_update_error: 'Erreur lors de la mise à jour du profil',

  // Notification preferences
  notification_preferences: 'Préférences de notification',
  notification_description: 'Gérez vos préférences de notification pour rester informé.',
  email_notifications: 'Notifications par email',
  email_notifications_description:
    'Recevez des notifications par email pour les mises à jour importantes.',
  sms_notifications: 'Notifications SMS',
  sms_notifications_description:
    'Recevez des notifications SMS pour les mises à jour urgentes.',

  // Security settings
  security_settings: 'Paramètres de sécurité',
  security_description: 'Gérez vos paramètres de sécurité et de confidentialité.',
  two_factor_auth: 'Authentification à deux facteurs',
  two_factor_description: 'Ajoutez une couche de sécurité supplémentaire à votre compte.',
  enable_2fa: "Activer l'authentification à deux facteurs",
  change_password: 'Changer le mot de passe',
  password_description: 'Mettez à jour votre mot de passe pour sécuriser votre compte.',
  update_password: 'Mettre à jour le mot de passe',

  // Admin specific translations
  performance: 'Performance',
  preferences: 'Préférences',
  admin_profile_description: 'Gérez votre profil administrateur et vos préférences.',
  performance_metrics: 'Métriques de performance',
  performance_description:
    'Consultez vos statistiques de performance et vos indicateurs.',
  completed_requests: 'Demandes complétées',
  average_processing_time: 'Temps moyen de traitement',
  active_requests_limit: 'Limite de demandes actives',
  hours: 'heures',
  not_available: 'Non disponible',

  // Work preferences
  work_preferences: 'Préférences de travail',
  work_preferences_description:
    "Personnalisez vos préférences de travail et d'assignation.",
  admin_email_notifications_description:
    'Recevez des notifications pour les nouvelles demandes et les mises à jour.',
  auto_assignment: 'Assignation automatique',
  auto_assignment_description:
    "Permettre l'assignation automatique des demandes selon vos spécialisations.",

  // Admin security
  admin_security_description:
    'Gérez la sécurité de votre compte administrateur et vos accès API.',
  api_access: 'Accès API',
  api_access_description: 'Gérez vos clés API et vos accès aux services.',
  manage_api_keys: 'Gérer les clés API',

  // Specializations
  specializations: 'Spécialisations',
  select_specialization: 'Sélectionnez une spécialisation',
  service_category: {
    IDENTITY: 'Identité',
    CIVIL_STATUS: 'État civil',
    VISA: 'Visa',
    CERTIFICATION: 'Certification',
    REGISTRATION: 'Inscription',
    OTHER: 'Autre',
  },
} as const;
