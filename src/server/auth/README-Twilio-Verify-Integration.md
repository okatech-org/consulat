# Guide d'intégration Twilio Verify - Provider Unifié

Ce guide explique comment utiliser le nouveau provider d'authentification unifié qui utilise Twilio Verify pour SMS/appels et Resend pour les emails.

## Architecture

### Services créés

1. **TwilioVerifyService** (`src/server/services/twilio-verify.ts`)
   - Service wrapper autour de l'API Twilio Verify v2
   - Gère l'envoi et la vérification des codes SMS/appels
   - Gestion d'erreurs robuste avec messages français

2. **UnifiedVerifyService** (`src/server/services/unified-verify.ts`)
   - Service unifié qui combine Twilio Verify (SMS/call) et Resend (email)
   - Interface unique pour tous les canaux de vérification
   - Détection automatique du type d'identifiant

3. **Providers NextAuth unifiés** (`src/server/auth/unified-verify-provider.ts`)
   - `unifiedLoginProvider` : Connexion OTP
   - `unifiedSignupProvider` : Inscription avec vérification

### Configuration NextAuth

La nouvelle configuration se trouve dans `src/server/auth/unified-config.ts` et est utilisée par défaut.

## Configuration requise

### Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# Configuration Twilio Verify
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configuration Twilio SMS (existant)
TWILIO_PHONE_NUMBER=+1234567890

# Configuration Resend (existant)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_SENDER=noreply@votredomaine.com
```

### Création du Service Twilio Verify

1. Connectez-vous à la [Console Twilio](https://console.twilio.com)
2. Allez dans **Verify** > **Services**
3. Cliquez sur **Create new Service**
4. Donnez un nom à votre service (ex: "Consulat.ga Verify")
5. Copiez le **Service SID** dans `TWILIO_VERIFY_SERVICE_SID`

### Configuration du Service

Dans la console Twilio Verify, configurez :

- **Code Length** : 6 chiffres
- **Channels** : Activez SMS, désactivez Call/Email si non utilisés
- **Fraud Protection** : Activez selon vos besoins
- **Rate Limiting** : Configurez selon votre usage

## Utilisation

### Dans les composants React

Le provider unifié est transparent pour les composants existants :

```typescript
// Connexion
const result = await signIn('unified-login', {
  identifier: 'user@example.com', // ou '+33-123456789'
  action: 'send',
  redirect: false,
});

// Vérification
const result = await signIn('unified-login', {
  identifier: 'user@example.com',
  code: '123456',
  action: 'verify',
  redirect: false,
});
```

### Inscription

```typescript
// Envoi du code
const result = await signIn('unified-signup', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+33-123456789',
  countryCode: 'FR',
  verificationMethod: 'sms', // ou 'email'
  action: 'send',
  redirect: false,
});

// Vérification et création du compte
const result = await signIn('unified-signup', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+33-123456789',
  countryCode: 'FR',
  verificationMethod: 'sms',
  code: '123456',
  action: 'verify',
  redirect: false,
});
```

## Avantages du provider unifié

### Pour SMS et appels (Twilio Verify)

✅ **Reliability** : Infrastructure mondiale de Twilio  
✅ **Deliverability** : Routes optimisées par pays  
✅ **Fraud Protection** : Protection anti-fraude intégrée  
✅ **Rate Limiting** : Limitation automatique des tentatives  
✅ **Analytics** : Insights détaillés dans la console Twilio  
✅ **Compliance** : Respect des réglementations locales

### Pour les emails (Resend)

✅ **High Deliverability** : Taux de délivrance élevé  
✅ **Templates** : Templates React email existants  
✅ **Monitoring** : Suivi des emails envoyés  
✅ **Cost Effective** : Coût optimisé pour les emails

## Gestion d'erreurs

### Codes d'erreur Twilio Verify

| Code  | Description          | Action                         |
| ----- | -------------------- | ------------------------------ |
| 60200 | Numéro invalide      | Vérifier le format             |
| 60203 | Numéro non supporté  | Utiliser un autre numéro       |
| 60212 | Trop de tentatives   | Attendre ou changer de méthode |
| 60229 | Canal non disponible | Utiliser SMS au lieu de call   |

### Messages d'erreur traduits

Le service gère automatiquement la traduction des erreurs Twilio en français :

```typescript
// Exemple de gestion d'erreur
const result = await unifiedVerifyService.sendVerificationCode(phone);
if (!result.success) {
  console.error(result.error); // Message en français
}
```

## Monitoring et debugging

### Logs

Les services loggent automatiquement :

- Tentatives d'envoi de codes
- Vérifications réussies/échouées
- Erreurs détaillées

### Console Twilio

Surveillez dans la console Twilio :

- **Verify** > **Logs** : Historique des vérifications
- **Usage** : Consommation des crédits
- **Insights** : Métriques de performance

## Migration depuis l'ancien système

### Étapes de migration

1. **Backup** : Sauvegardez votre configuration actuelle
2. **Test** : Testez le nouveau système en development
3. **Switch** : Changez l'import dans `src/server/auth/index.ts`
4. **Monitor** : Surveillez les logs pendant 24h

### Rollback si nécessaire

Pour revenir à l'ancien système :

```typescript
// Dans src/server/auth/index.ts
import { authConfig } from './config'; // Au lieu de unified-config
```

## Coûts

### Twilio Verify

- **SMS** : ~0.05€ par verification
- **Call** : ~0.10€ par verification
- **International** : Varie selon le pays

### Optimisation des coûts

1. **Utilisez SMS par défaut** (moins cher que les appels)
2. **Configurez le rate limiting** pour éviter les abus
3. **Activez la fraud protection** pour bloquer les tentatives malveillantes
4. **Utilisez email pour les cas non-critiques**

## Sécurité

### Bonnes pratiques

1. **Rate Limiting** : 3 tentatives max par défaut
2. **Expiration** : Codes valides 10 minutes max
3. **One-time use** : Les codes ne peuvent être utilisés qu'une fois
4. **Format validation** : Validation côté client et serveur
5. **Fraud protection** : Détection automatique des patterns suspects

### Conformité

- **RGPD** : Les données sont stockées selon les standards
- **SMS regulations** : Respect des réglementations SMS par pays
- **Data retention** : Données de vérification supprimées automatiquement

## Support

### Debugging

1. Vérifiez les variables d'environnement
2. Consultez les logs serveur
3. Testez avec un numéro de test Twilio
4. Vérifiez la console Twilio Verify

### Problèmes courants

| Problème       | Solution                                 |
| -------------- | ---------------------------------------- |
| Code non reçu  | Vérifier le numéro, tester avec un autre |
| Erreur 60203   | Le pays n'est pas supporté               |
| Trop cher      | Utiliser email ou optimiser usage        |
| Latence élevée | Vérifier la configuration des routes     |

### Contact

Pour tout problème technique :

1. Consultez d'abord la documentation Twilio
2. Vérifiez les logs de l'application
3. Contactez l'équipe technique avec les détails d'erreur
