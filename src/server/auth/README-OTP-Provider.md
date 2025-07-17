# Provider OTP Personnalisable

Ce provider OTP personnalisable permet de créer un système d'authentification par code à usage unique (OTP) en utilisant vos propres fonctions d'envoi pour les emails et SMS.

## Fonctionnalités

- **Support multi-canal** : Email et SMS
- **Fonctions d'envoi personnalisables** : Utilise vos propres services d'envoi
- **Configuration flexible** : Longueur du code, durée d'expiration, nombre de tentatives
- **Intégration avec services existants** : Compatible avec Resend et Twilio/Vonage
- **Gestion d'erreurs complète** : Messages d'erreur détaillés et typés
- **Sécurité renforcée** : Limitation des tentatives, expiration des codes

## Installation et Configuration

### 1. Importer le provider

```typescript
import { createOTPAuthProvider } from '@/server/auth/otp-auth-provider';
import { sendOTPViaNotifications } from '@/lib/services/notifications/otp-integration';
```

### 2. Créer une instance du provider

```typescript
const otpProvider = createOTPAuthProvider({
  sendOTP: sendOTPViaNotifications,
  codeLength: 6, // Optionnel, par défaut 6
  expiryMinutes: 5, // Optionnel, par défaut 5
  maxAttempts: 3, // Optionnel, par défaut 3
});
```

### 3. Ajouter à la configuration NextAuth

```typescript
export const authConfig = {
  providers: [
    otpProvider,
    // autres providers...
  ],
  // resto de la config...
};
```

## Exemples de Configuration

### Provider Complet (Email + SMS)

```typescript
import { sendOTPViaNotifications } from '@/lib/services/notifications/otp-integration';

const otpProviderComplete = createOTPAuthProvider({
  sendOTP: sendOTPViaNotifications,
  codeLength: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
});
```

### Provider Email Uniquement

```typescript
import { sendEmailOTP } from '@/lib/services/notifications/otp-integration';

const otpProviderEmailOnly = createOTPAuthProvider({
  sendOTP: sendEmailOTP,
  codeLength: 6,
  expiryMinutes: 10,
  maxAttempts: 5,
});
```

### Provider SMS Uniquement

```typescript
import { sendSMSOTP } from '@/lib/services/notifications/otp-integration';

const otpProviderSMSOnly = createOTPAuthProvider({
  sendOTP: sendSMSOTP,
  codeLength: 4,
  expiryMinutes: 3,
  maxAttempts: 3,
});
```

### Provider avec Fonction Personnalisée

```typescript
const otpProviderCustom = createOTPAuthProvider({
  sendOTP: async (channel, target, code) => {
    console.log(`Envoi code ${code} via ${channel} vers ${target}`);

    try {
      if (channel === 'email') {
        // Votre logique d'envoi email personnalisée
        // Par exemple, utiliser un autre service que Resend
        await yourCustomEmailService.send(target, code);
        return { success: true };
      } else if (channel === 'sms') {
        // Votre logique d'envoi SMS personnalisée
        // Par exemple, utiliser un autre service que Twilio
        await yourCustomSMSService.send(target, code);
        return { success: true };
      }

      return { success: false, error: 'Canal non supporté' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  },
  codeLength: 8,
  expiryMinutes: 15,
  maxAttempts: 2,
});
```

## Utilisation Côté Client

### Envoi du Code

```typescript
const result = await signIn('otp-auth', {
  identifier: 'user@example.com', // ou '+33612345678'
  action: 'send',
  redirect: false,
});
```

### Vérification du Code

```typescript
const result = await signIn('otp-auth', {
  identifier: 'user@example.com',
  code: '123456',
  action: 'verify',
  redirect: false,
});
```

## Interface de la Fonction d'Envoi

```typescript
export type OTPSendFunction = (
  channel: 'email' | 'sms',
  target: string,
  code: string,
) => Promise<{ success: boolean; error?: string }>;
```

### Paramètres

- **channel** : Type de canal ('email' ou 'sms')
- **target** : Destinataire (adresse email ou numéro de téléphone)
- **code** : Code OTP généré automatiquement

### Retour

- **success** : `true` si l'envoi a réussi, `false` sinon
- **error** : Message d'erreur en cas d'échec (optionnel)

## Gestion des Erreurs

Le provider gère automatiquement les erreurs suivantes :

- `invalid_identifier` : Format d'identifiant invalide
- `send_failed` : Erreur lors de l'envoi du code
- `missing_code` : Code de vérification manquant
- `no_code_pending` : Aucun code en attente
- `code_expired` : Code expiré
- `code_already_used` : Code déjà utilisé
- `invalid_code` : Code invalide
- `too_many_attempts` : Trop de tentatives
- `invalid_code_length` : Longueur de code incorrecte

## Fonctions d'Intégration Prêtes à l'Emploi

Le package inclut des fonctions d'intégration pour les services existants :

### `sendOTPViaNotifications`

Utilise les services Resend (email) et Twilio/Vonage (SMS) configurés dans votre projet.

### `sendEmailOTP`

Spécialisée pour les emails uniquement via Resend.

### `sendSMSOTP`

Spécialisée pour les SMS uniquement via Twilio/Vonage.

## Sécurité

- **Codes temporaires** : Expiration automatique configurable
- **Limitation des tentatives** : Nombre maximum de tentatives configurables
- **Validation des formats** : Vérification automatique des emails/téléphones
- **Codes à usage unique** : Chaque code ne peut être utilisé qu'une fois

## Migration depuis l'Ancien Provider

Si vous utilisez l'ancien `otpProvider`, vous pouvez facilement migrer :

```typescript
// Ancien
import { otpProvider } from './otp-provider';

// Nouveau
import { createOTPAuthProvider } from './otp-auth-provider';
import { sendOTPViaNotifications } from '@/lib/services/notifications/otp-integration';

const newOtpProvider = createOTPAuthProvider({
  sendOTP: sendOTPViaNotifications,
});
```

Le comportement par défaut sera identique à l'ancien provider mais avec plus de flexibilité.
