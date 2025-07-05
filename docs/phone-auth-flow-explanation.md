# Flux d'authentification par téléphone

## Problème identifié

L'erreur "Aucune vérification en cours" se produit car il y a un conflit entre deux approches :

1. L'API tRPC qui gère la vérification
2. NextAuth qui essaie aussi de vérifier

## Solution mise en place

Nous avons créé deux approches possibles :

### Approche 1 : Utiliser uniquement l'API tRPC (Recommandé)

**Composant** : `PhoneLogin` (original)
**Avantages** :

- Plus de contrôle sur le flux
- Gestion des erreurs plus fine
- Possibilité d'ajouter des fonctionnalités custom

**Flux** :

1. Envoi du code via `api.auth.sendVerificationCode`
2. Vérification via `api.auth.verifyCode`
3. L'API crée la session directement

### Approche 2 : Utiliser uniquement NextAuth

**Composant** : `PhoneLoginSimple`
**Avantages** :

- Intégration native avec NextAuth
- Gestion automatique des sessions

**Flux** :

1. Envoi du code via `signIn("phone", { action: "send" })`
2. Vérification via `signIn("phone", { action: "verify" })`

## Configuration actuelle

Le système utilise actuellement :

- Vonage Verify V2 avec authentification JWT
- Base de données PostgreSQL pour stocker les vérifications
- NextAuth pour la gestion des sessions

## Pour corriger l'erreur

Si vous utilisez `PhoneLogin` (avec tRPC), modifiez le composant pour ne PAS appeler `signIn` après la vérification réussie. L'API tRPC devrait gérer la création de session directement.

Si vous utilisez `PhoneLoginSimple` (NextAuth uniquement), assurez-vous que le provider retourne toujours un utilisateur valide, même pour l'action "send".
