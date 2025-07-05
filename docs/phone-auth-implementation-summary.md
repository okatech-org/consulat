# Authentification par téléphone/email - Implémentation

## Résumé de l'implémentation

Cette implémentation utilise NextAuth.js avec un provider personnalisé pour l'authentification par OTP (One-Time Password) via SMS ou email.

## Architecture

### 1. Provider OTP personnalisé (`src/server/auth/otp-provider.ts`)

Le provider gère deux actions :
- **send** : Envoie le code OTP via Vonage
- **verify** : Vérifie le code OTP et authentifie l'utilisateur

**Nouveauté** : Au lieu de retourner un utilisateur temporaire lors de l'envoi du code, le provider lance une erreur spéciale avec le code `CODE_SENT` pour indiquer que le code a été envoyé avec succès.

```typescript
// Au lieu de retourner un utilisateur temporaire :
// return { id: 'temp-sending-code', name: 'Sending Code', email: null, image: null };

// Nous lançons une erreur spéciale :
throw createCodeSentError('Code envoyé avec succès');
```

### 2. Gestion des erreurs

Le système utilise des erreurs personnalisées avec des codes spécifiques :

```typescript
function createCodeSentError(message: string) {
  class CodeSentError extends CredentialsSignin {
    code = 'CODE_SENT';
  }
  const error = new CodeSentError();
  error.message = message;
  return error;
}
```

### 3. Interface utilisateur (`src/components/auth/login-form.tsx`)

Le composant de connexion gère maintenant le code `CODE_SENT` comme un succès :

```typescript
const sendOTPCode = React.useCallback(
  async (identifier: string) => {
    const result = await signIn('otp', {
      identifier,
      action: 'send',
      redirect: false,
    });

    if (result?.error) {
      // Vérifier si c'est le code spécial CODE_SENT
      if (result.code === 'CODE_SENT') {
        // C'est un succès, pas une erreur
        return;
      }
      
      // Sinon, c'est une vraie erreur
      throw new Error(errorMessage);
    }
  },
  [tErrors],
);
```

## Avantages de cette approche

1. **Pas de session temporaire** : Évite la création d'une session avec un utilisateur fictif
2. **Logique plus claire** : Les callbacks NextAuth n'ont plus besoin de gérer des cas spéciaux
3. **Gestion d'erreurs cohérente** : Utilise le système d'erreurs standard de NextAuth
4. **Sécurité renforcée** : Pas de risque de laisser une session temporaire active

## Flux d'authentification

1. **Étape 1 - Envoi du code** :
   - L'utilisateur saisit son email/téléphone
   - Le provider lance une erreur `CODE_SENT` après envoi réussi
   - L'interface passe à l'étape de saisie du code

2. **Étape 2 - Vérification** :
   - L'utilisateur saisit le code reçu
   - Le provider vérifie le code et retourne l'utilisateur authentifié
   - Une vraie session est créée

## Configuration requise

- NextAuth.js avec strategy JWT
- Provider Vonage pour l'envoi des codes
- Base de données pour stocker les codes temporaires
- Traductions pour les messages d'erreur

## Sécurité

- Codes expirés après 5 minutes
- Limitation des tentatives (3 max)
- Validation des formats d'identifiants
- Stockage sécurisé des requestId Vonage
