export default {
  title: 'Profil utilisateur',
  dashboard: {
    title: 'Tableau de bord',
    overview: {
      title: "Vue d'ensemble",
      pending_requests: 'Demandes en attente',
      processing_requests: 'Demandes en cours',
      completed_requests: 'Demandes traitées',
    },
    appointments: {
      title: 'Mes rendez-vous',
      new_appointment: 'Nouveau rendez-vous',
      tabs: {
        upcoming: 'À venir',
        past: 'Passés',
        cancelled: 'Annulés',
      },
      upcoming: {
        title: 'Prochains rendez-vous',
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
      new_appointment_dialog: {
        title: 'Prendre un rendez-vous',
        steps: {
          service: 'Service',
          date: 'Date',
          confirm: 'Confirmation',
        },
        service_select: 'Sélectionnez un service',
        select_service: 'Choisir un service',
        service_details: 'Détails du service',
        duration: 'Durée du rendez-vous',
        duration_value: '{duration} minutes',
        instructions: 'Instructions',
        next: 'Suivant',
        back: 'Retour',
        price: 'Prix',
        price_value: '{price} €',
        submit: 'Confirmer le rendez-vous',
        confirmation: {
          service: 'Service sélectionné',
          date: 'Date',
          time: 'Heure',
          duration: 'Durée',
          price: 'Prix',
          instructions: 'Instructions',
          important: 'Informations importantes',
          bring_documents: "N'oubliez pas d'apporter tous les documents requis",
          arrive_early: "Merci d'arriver 10 minutes avant votre rendez-vous",
          cancel_notice: "En cas d'empêchement, merci d'annuler au moins 24h à l'avance",
        },
      },
      date_picker: {
        select_date: 'Sélectionnez une date',
        no_slots: 'Aucun créneau disponible pour cette date',
      },
    },
  },
  nav: {
    dashboard: 'Mon espace',
    requests: 'Mes demandes',
    profile: 'Mon profil',
    documents: 'Mes documents',
    appointments: 'Mes rendez-vous',
    procedures: 'Démarches',
    services: 'Nouvelle démarche',
    my_requests: 'Mes démarches',
    children: 'Mes enfants',
  },
  children: {
    title: 'Profils de mes enfants',
    subtitle: 'Gérez les profils de vos enfants et effectuez des démarches en leur nom',
    no_children: "Vous n'avez pas encore ajouté de profil d'enfant",
    add_child: 'Ajouter un enfant',
    no_children_message:
      'Créez un profil pour vos enfants mineurs pour effectuer des démarches en leur nom',
    child_card: {
      age: '{age} ans',
      view_profile: 'Voir le profil',
      make_request: 'Faire une demande',
      delete: 'Supprimer',
      delete_success: 'Profil supprimé avec succès',
      delete_error: 'Erreur lors de la suppression du profil',
    },
    actions: {
      create: 'Créer un profil enfant',
      edit: 'Modifier le profil',
      delete: 'Supprimer le profil',
      share: "Partager avec l'autre parent",
    },
    create_form: {
      title: 'Créer un profil enfant',
      subtitle: 'Remplissez les informations de votre enfant',
      success: 'Profil enfant créé avec succès',
      error: 'Une erreur est survenue lors de la création du profil',
    },
    edit_form: {
      title: 'Compléter le profil enfant',
    },
    form: {
      family_info: {
        title: 'Informations familiales',
        has_parental_authority: "J'ai l'autorité parentale sur cet enfant",
        has_parental_authority_description:
          "En cochant cette case, je confirme que je dispose de l'autorité parentale légale sur cet enfant.",

        other_parent_first_name: "Prénom de l'autre parent",
        other_parent_last_name: "Nom de l'autre parent",
        other_parent_email: "Email de l'autre parent",
        other_parent_phone: "Téléphone de l'autre parent",

        family_situation: 'Situation familiale',
        family_situation_description:
          'Décrivez brièvement la situation familiale actuelle (garde partagée, exclusivité, etc.)',

        other_information: 'Autres informations',
        other_information_description:
          "Ajoutez toute information complémentaire concernant la situation familiale de l'enfant.",
      },
    },
  },
} as const;
