export default {
  common: {
    error_title: 'Erreur',
    success_title: 'Succès',
    unknown_error: 'Une erreur inattendue est survenue',
    try_again: 'Veuillez réessayer plus tard',
  },
  auth: {
    update_profile: 'Erreur lors de la mise à jour du profil',
    user_not_found: 'Utilisateur introuvable',
    unauthorized: 'Vous devez être connecté pour effectuer cette action',
    forbidden: "Vous n'avez pas les permissions nécessaires pour effectuer cette action",
    session_expired: 'Votre session a expiré, veuillez vous reconnecter',
    invalid_credentials: 'Identifiants invalides',
  },
  form: {
    submission_failed: "Échec de l'envoi du formulaire",
    invalid_data: 'Données invalides',
    required_field: 'Ce champ est requis',
    try_again: 'Veuillez réessayer',
  },
} as const;
