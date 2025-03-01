# Guide d'utilisation du système Parent-Enfant

Ce document explique le fonctionnement du système de gestion des profils enfants et de l'autorité parentale dans l'application consulaire.

## 1. Vue d'ensemble

Le système permet aux utilisateurs ayant un profil adulte de :

- Créer des profils pour leurs enfants mineurs
- Gérer l'autorité parentale (partagée entre plusieurs parents)
- Effectuer des démarches administratives pour leurs enfants
- Partager les demandes de service entre les parents
- Recevoir des notifications sur les actions concernant leurs enfants

## 2. Modèle de données

### Structure principale

- **User**: Représente un utilisateur de l'application (parent ou enfant)
- **Profile**: Profil d'une personne (adulte ou mineur)
- **ParentalAuthority**: Relation d'autorité parentale entre un profil enfant et des utilisateurs parents

### Catégories de profils

- `ADULT`: Profil adulte pouvant être parent
- `MINOR`: Profil enfant mineur géré par ses parents

### Rôles parentaux

- `FATHER`: Père de l'enfant
- `MOTHER`: Mère de l'enfant
- `LEGAL_GUARDIAN`: Tuteur légal

## 3. Création d'un profil enfant

Pour créer un profil enfant, un utilisateur doit :

1. Avoir un compte utilisateur avec un profil `ADULT`
2. Fournir les informations personnelles de l'enfant
3. Spécifier son rôle parental (père, mère ou tuteur légal)
4. Optionnellement, fournir les informations sur l'autre parent

Lors de la création d'un profil enfant, le système :

- Crée un nouvel utilisateur sans accès (géré par les parents)
- Crée un profil de catégorie `MINOR` pour cet utilisateur
- Établit une relation d'autorité parentale entre le parent et l'enfant
- Si les informations sur l'autre parent sont fournies, l'associe également

## 4. Gestion de l'autorité parentale

L'autorité parentale permet de :

- Déterminer quels utilisateurs peuvent gérer un profil enfant
- Définir le rôle parental de chaque utilisateur par rapport à un enfant
- Partager les informations et demandes entre les parents

### Opérations disponibles

- `createParentalAuthority`: Établit une nouvelle relation d'autorité parentale
- `updateParentalAuthority`: Modifie une relation existante (rôle, statut actif)
- `deleteParentalAuthority`: Supprime une relation d'autorité parentale
- `addParentUserToAuthority`: Ajoute un parent à une autorité existante
- `removeParentUserFromAuthority`: Retire un parent d'une autorité existante

## 5. Gestion des demandes de service pour un enfant

Un parent peut :

- Soumettre des demandes de service au nom de son enfant
- Voir toutes les demandes soumises pour ses enfants
- Recevoir des notifications concernant les demandes

Le système :

- Vérifie l'autorité parentale avant de permettre toute action
- Partage automatiquement les demandes avec les autres parents
- Notifie tous les parents des mises à jour importantes

## 6. Contrôle d'accès

L'accès aux informations d'un enfant est strictement contrôlé :

- Seuls les parents ayant une autorité parentale active peuvent accéder aux données
- La fonction `canAccessChildProfile` vérifie les droits d'accès
- Les API vérifient systématiquement l'autorité parentale avant toute opération

## 7. Utilisation des API

### Création d'un profil enfant

```typescript
import { createChildProfile } from '@/actions/child-profiles';

const childProfile = await createChildProfile({
  firstName: 'Prénom',
  lastName: 'Nom',
  gender: 'MALE',
  birthDate: '2018-05-12',
  birthPlace: 'Paris',
  birthCountry: 'France',
  nationality: 'Gabon',
  passportNumber: 'ABC123456',
  passportIssueDate: new Date('2022-01-15'),
  passportExpiryDate: new Date('2027-01-14'),
  passportIssueAuthority: 'Ambassade du Gabon à Paris',

  parentUserId: 'user_123', // ID de l'utilisateur parent
  parentRole: 'FATHER',

  otherParentInfo: {
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'autre.parent@exemple.com',
    userId: 'user_456', // Si l'autre parent est déjà utilisateur
  },
});
```

### Vérification de l'autorité parentale

```typescript
import { canAccessChildProfile } from '@/actions/child-profiles';

const hasAccess = await canAccessChildProfile('user_123', 'profile_456');
```

### Création d'une demande de service pour un enfant

```typescript
import { createChildServiceRequest } from '@/actions/child-service-requests';

const request = await createChildServiceRequest({
  serviceId: 'service_123',
  submittedById: 'user_123',
  childProfileId: 'profile_456',
  serviceCategory: 'IDENTITY',
  priority: 'STANDARD',
  formData: {
    // Données du formulaire
  },
});
```

## 8. Notifications

Le système envoie automatiquement des notifications aux parents lorsque :

- Une nouvelle demande est soumise pour leur enfant
- Le statut d'une demande est mis à jour
- Une action importante est effectuée sur le profil de l'enfant

## 9. Migration des données

Pour migrer les données existantes vers le nouveau schéma, utilisez le script :

```bash
npx tsx src/scripts/migrate-parent-child-relationships.ts
```

Ce script met à jour les relations entre les profils enfants et les utilisateurs parents selon le nouveau modèle.
