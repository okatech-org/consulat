export default {
  welcome: 'Bienvenue {name}',
  countries: {
    title: 'Gestion des Pays',
    actions: {
      create: 'Ajouter un pays',
      edit: 'Modifier',
      delete: 'Supprimer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      update: 'Mettre à jour',
      activate: 'Activer',
      deactivate: 'Suspendre',
      deleting: 'Suppression en cours...',
    },
    table: {
      name: 'Nom',
      code: 'Code',
      status: 'Statut',
      organizationsCount: 'Organismes',
      usersCount: 'Utilisateurs',
      actions: 'Actions',
      empty: 'Aucun pays trouvé',
      loading: 'Chargement des pays...',
    },
    form: {
      edit_title: 'Modifier le pays',
      name: {
        label: 'Nom du pays',
        placeholder: 'Ex: France',
        error: 'Le nom est requis',
      },
      code: {
        label: 'Code pays',
        placeholder: 'Ex: FR',
        error: 'Le code pays doit contenir 2 caractères',
      },
      status: {
        label: 'Statut',
        placeholder: 'Sélectionner un statut',
        options: {
          active: 'Actif',
          inactive: 'Inactif',
        },
      },
      flag: {
        label: 'Drapeau',
        placeholder: 'Sélectionner un fichier',
      },
      description: 'Remplissez les informations pour créer un nouveau pays.',
      placeholder: 'Sélectionner un pays',
      search: 'Rechercher un pays',
      label: 'Pays',
      empty: 'Aucun pays trouvé',
    },
    messages: {
      createSuccess: 'Pays créé avec succès',
      updateSuccess: 'Pays mis à jour avec succès',
      deleteSuccess: 'Pays supprimé avec succès',
      error: {
        create: 'Erreur lors de la création du pays',
        update: 'Erreur lors de la mise à jour du pays',
        delete: 'Erreur lors de la suppression du pays',
        fetch: 'Erreur lors du chargement des pays',
      },
    },
    dialogs: {
      delete: {
        title: 'Supprimer le pays',
        description:
          'Êtes-vous sûr de vouloir supprimer ce pays ? Cette action est irréversible.',
        confirm: 'Oui, supprimer',
        cancel: 'Annuler',
      },
      regionalSettings: {
        title: 'Paramètres régionaux du pays',
        description: 'Modifier les paramètres régionaux spécifiques à ce pays',
      },
    },
  },
  organizations: {
    title: 'Gestion des Organismes',
    types: {
      EMBASSY: 'Ambassade',
      CONSULATE: 'Consulat',
      GENERAL_CONSULATE: 'Consulat général',
      HONORARY_CONSULATE: 'Consulat honoraire',
      OTHER: 'Autre',
    },
    status: {
      ACTIVE: 'Actif',
      INACTIVE: 'Inactif',
      SUSPENDED: 'Suspendu',
    },
    actions: {
      create: 'Ajouter un organisme',
      edit: 'Modifier',
      delete: 'Supprimer',
      suspend: 'Suspendre',
      activate: 'Activer',
    },
    table: {
      name: 'Nom',
      type: 'Type',
      country: 'Pays',
      status: 'Statut',
      users: 'Utilisateurs',
      services: 'Services',
      actions: 'Actions',
    },
    form: {
      create_title: 'Ajouter un organisme',
      basic_info: 'Informations de base',
      name: {
        label: "Nom de l'organisme",
        placeholder: 'Ex: Consulat du Gabon à Paris',
      },
      type: {
        label: "Type d'organisme",
        placeholder: 'Sélectionner un type',
      },
      status: {
        label: 'Statut',
        placeholder: 'Sélectionner un statut',
      },
      countries: {
        label: 'Pays de rattachement',
        placeholder: 'Sélectionner un pays',
        search: 'Rechercher un pays',
      },
      admin_email: {
        label: "Email de l'administrateur",
        placeholder: 'Ex: admin@example.com',
      },
      country: {
        label: 'Pays de rattachement',
        placeholder: 'Sélectionner un pays',
      },
      contact: {
        title: 'Coordonnées',
        email: 'Email',
        phone: 'Téléphone',
        phone_placeholder: 'Ex: 01 23 45 67 89',
        website: 'Site web',
      },
      address: {
        title: 'Adresse',
        street: 'Rue',
        city: 'Ville',
        zipCode: 'Code postal',
        country: 'Pays',
      },
    },
    messages: {
      createSuccess: 'Organisme créé avec succès',
      updateSuccess: 'Organisme mis à jour avec succès',
      deleteSuccess: 'Organisme supprimé avec succès',
      error: {
        create: 'Erreur lors de la création',
        update: 'Erreur lors de la mise à jour',
        delete: 'Erreur lors de la suppression',
      },
    },
    dialog: {
      create_title: 'Ajouter un organisme',
      edit_title: "Modifier l'organisme",
    },
  },
} as const;
