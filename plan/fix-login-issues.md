# Plan de correction des problèmes de connexion

## Vue d'ensemble

La page de connexion présente plusieurs problèmes critiques :

1. Absence de messages d'erreur lors de la saisie d'un code OTP incorrect
2. La redirection automatique vers l'espace utilisateur ne fonctionne pas
3. Potentiels autres problèmes à identifier et corriger

## Analyse des problèmes identifiés

### 1. Messages d'erreur OTP manquants

- [x] Vérifier la gestion des erreurs dans `validateOTP`
- [x] S'assurer que les erreurs sont correctement propagées et affichées
- [x] Vérifier que les traductions d'erreur sont utilisées

### 2. Redirection automatique défaillante

- [x] Analyser le flux de redirection après validation OTP réussie
- [x] Vérifier la logique de `handleManualRedirect`
- [x] S'assurer que l'état utilisateur est correctement mis à jour après connexion
- [x] Vérifier les permissions et rôles pour la redirection

### 3. Autres problèmes potentiels

- [ ] Vérifier la gestion du cooldown pour le renvoi d'OTP
- [ ] S'assurer que les états de chargement sont correctement gérés
- [ ] Vérifier la persistance de session après connexion

## Plan d'implémentation

### Phase 1 : Correction des messages d'erreur OTP

- [x] Améliorer la gestion des erreurs dans `validateOTP`
- [x] Ajouter des messages d'erreur spécifiques selon le type d'erreur
- [x] S'assurer que les erreurs sont affichées dans le formulaire
- [x] Ajouter les traductions manquantes pour les erreurs

### Phase 2 : Correction de la redirection automatique

- [x] Revoir la logique de redirection après succès OTP
- [x] Implémenter une redirection automatique après validation réussie
- [x] Gérer les différents cas de redirection selon les rôles
- [x] Ajouter un délai approprié pour éviter les conditions de course

### Phase 3 : Améliorations générales

- [x] Améliorer les retours visuels (états de chargement, succès, erreur)
- [ ] Optimiser la gestion du state pour éviter les re-rendus inutiles
- [x] Ajouter des logs pour faciliter le débogage
- [ ] Vérifier la compatibilité mobile

### Phase 4 : Tests et validation

- [ ] Tester tous les scénarios de connexion (email/téléphone)
- [ ] Vérifier les redirections pour chaque rôle utilisateur
- [ ] Valider l'affichage des messages d'erreur
- [ ] S'assurer que le cooldown de renvoi fonctionne correctement

## Changements effectués

### 1. Gestion des erreurs améliorée

- Ajout de messages d'erreur spécifiques pour les codes OTP invalides/expirés
- Utilisation des traductions pour tous les messages d'erreur
- Affichage d'un toast ET d'une ErrorCard pour une meilleure visibilité

### 2. Redirection automatique corrigée

- Utilisation de `useCurrentSession` avec `refetch` pour s'assurer que la session est à jour
- Implémentation d'une redirection automatique après 1.5 secondes
- Utilisation de `router.push` au lieu de `window.location` pour une navigation plus fiable
- Gestion du cas où l'utilisateur n'est pas encore dans le state

### 3. Améliorations de l'UX

- Ajout d'un état de succès avec animation visuelle
- Bouton de redirection manuelle en cas de problème avec l'auto-redirection
- Messages clairs indiquant la redirection en cours

## Notes techniques

- Utiliser le composant `ErrorCard` existant pour afficher les erreurs
- S'assurer que toutes les chaînes sont traduites via `useTranslations`
- Respecter les patterns existants pour la gestion des états
- Utiliser `tryCatch` pour une gestion cohérente des erreurs

# Résolution du problème d'inscription NewProfileForm

## Problème identifié

L'utilisateur recevait bien le code OTP mais obtenait une erreur `messages.errors.user_creation_failed` lors de la validation de l'inscription.

## Causes racines

### 1. Configuration better-auth incorrecte

- ❌ `disableSignUp: true` dans emailOTP empêchait la création d'utilisateurs par email
- ❌ Champs `role`, `phoneNumber`, `profileId` marqués comme requis mais non fournis lors de l'inscription

### 2. Utilisation de mauvaises méthodes d'authentification

- ❌ `authClient.signIn.emailOtp()` utilisé pour l'inscription (méthode de connexion)
- ❌ `authClient.phoneNumber.verify()` utilisé au lieu de `signUp()`
- ❌ `type: 'sign-in'` utilisé dans `sendVerificationOtp` au lieu de `'sign-up'`

## Solutions appliquées

### ✅ 1. Correction de la configuration better-auth (`src/lib/auth/auth.ts`)

```typescript
user: {
  additionalFields: {
    role: {
      required: false,        // ✅ Rendu optionnel
      defaultValue: 'USER',   // ✅ Valeur par défaut ajoutée
    },
    phoneNumber: {
      required: false,        // ✅ Rendu optionnel
    },
    profileId: {
      required: false,        // ✅ Rendu optionnel
    },
  },
},
emailOTP({
  disableSignUp: false,       // ✅ Inscription activée
}),
```

### ✅ 2. Correction des méthodes d'inscription (`src/components/registration/new-profile-form.tsx`)

**Envoi OTP :**

```typescript
// Email
authClient.emailOtp.sendVerificationOtp({
  email: identifier,
  type: 'sign-up', // ✅ Changé de 'sign-in' vers 'sign-up'
});

// Téléphone (inchangé - déjà correct)
authClient.phoneNumber.sendOtp({
  phoneNumber: identifier,
});
```

**Validation OTP et création utilisateur :**

```typescript
// Téléphone
authClient.phoneNumber.signUp({
  // ✅ Changé de .verify() vers .signUp()
  phoneNumber: data.phoneNumber,
  code: data.otp!,
  name: `${data.firstName} ${data.lastName}`, // ✅ Ajouté
  email: data.email, // ✅ Ajouté
});

// Email
authClient.signUp.emailOtp({
  // ✅ Changé de .signIn vers .signUp
  email: data.email!,
  otp: data.otp!,
  name: `${data.firstName} ${data.lastName}`, // ✅ Ajouté
  phoneNumber: data.phoneNumber, // ✅ Ajouté
});
```

## Flux d'inscription corrigé

1. **Vérification utilisateur existant ✅**

   - Vérification email/téléphone déjà utilisés

2. **Envoi OTP ✅**

   - Email : `type: 'sign-up'` pour l'inscription
   - Téléphone : méthode standard `sendOtp`

3. **Validation OTP et création utilisateur ✅**

   - Utilisation des méthodes `signUp` appropriées
   - Fourniture des données utilisateur (nom, email, téléphone)
   - Champs optionnels dans better-auth avec valeurs par défaut

4. **Création du profil ✅**
   - Fonction `createUserProfile` inchangée (déjà correcte)
   - Mise à jour de l'utilisateur créé avec les informations complètes
   - Création du profil lié

## Tests à effectuer

- [ ] Inscription par téléphone avec OTP SMS
- [ ] Inscription par email avec OTP email
- [ ] Vérification que l'utilisateur est bien créé dans la base
- [ ] Vérification que le profil est bien lié à l'utilisateur
- [ ] Test des cas d'erreur (OTP incorrect, utilisateur déjà existant)

## Remarques techniques

- La fonction `createUserProfile` était déjà correcte et n'a pas été modifiée
- Les schémas de validation sont cohérents entre les différents fichiers
- La configuration better-auth permet maintenant l'inscription complète via email et téléphone
