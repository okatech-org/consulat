export default {
  loading: {
    default: 'Chargement en cours',
    saving: 'Enregistrement...',
    submitting: 'Envoi en cours...',
    processing: 'Traitement en cours...',
  },
  error: {
    title: 'Erreur',
    unknown: "Une erreur inattendue s'est produite",
    network: 'Erreur de connexion',
    validation: 'Veuillez corriger les erreurs',
  },
  success: {
    title: 'Succès',
    saved: 'Enregistré avec succès',
    updated: 'Mis à jour avec succès',
    deleted: 'Supprimé avec succès',
  },
  form: {
    title: 'Formulaire de retour utilisateur',
    description:
      'Votre avis nous aide à améliorer notre application. Merci de prendre le temps de nous faire part de vos commentaires.',
    subject: 'Sujet',
    subjectPlaceholder: 'Résumez votre retour en quelques mots',
    message: 'Message',
    messagePlaceholder: 'Décrivez votre expérience, problème ou suggestion',
    category: 'Catégorie',
    categories: {
      bug: 'Bug / Problème technique',
      feature: 'Nouvelle fonctionnalité',
      improvement: 'Amélioration',
      other: 'Autre',
    },
    rating: 'Note',
    email: 'Email (optionnel)',
    emailPlaceholder: 'Votre email si vous souhaitez être recontacté',
    submit: 'Envoyer',
    cancel: 'Annuler',
  },
  banner: {
    betaVersion: 'Version Bêta',
    feedbackWelcome: 'Vos retours sont les bienvenus',
    openFeedback: 'Donner mon avis',
  },
  confirmation: {
    title: 'Merci pour votre retour',
    message:
      'Votre feedback a été envoyé avec succès. Nous vous remercions de nous aider à améliorer notre application.',
  },
} as const;
