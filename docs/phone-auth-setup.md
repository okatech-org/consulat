# Configuration de l'authentification par téléphone avec Vonage

## Prérequis

1. Un compte Vonage avec des crédits SMS
2. Une application Vonage avec les capacités Verify V2
3. L'ID de l'application et la clé privée

## Configuration

### 1. Créer une application Vonage

1. Connectez-vous au [Dashboard Vonage](https://dashboard.nexmo.com)
2. Allez dans "Applications" > "Create a new application"
3. Donnez un nom à votre application
4. Activez les capacités "Verify"
5. Générez une clé privée et téléchargez-la
6. Notez l'Application ID

### 2. Variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```env
# Vonage API (pour l'authentification par téléphone)
VONAGE_API_KEY="votre_api_key" # Toujours nécessaire pour certaines opérations
VONAGE_API_SECRET="votre_api_secret" # Toujours nécessaire pour certaines opérations
VONAGE_APPLICATION_ID="votre_application_id"
VONAGE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVotre clé privée ici\n-----END PRIVATE KEY-----"
```

**Note importante** : Pour la clé privée, remplacez les vrais sauts de ligne par `\n` dans le fichier `.env`.

### 3. Base de données

Exécutez la migration pour créer les tables nécessaires :

```bash
bun run db:push
```

Cela créera :

- Les champs `phone` et `phoneVerified` dans la table `User`
- La table `PhoneVerification` pour stocker les tentatives de vérification

### 4. Utilisation

#### Page de connexion

Accédez à `/auth/login` pour utiliser l'interface de connexion par téléphone.

#### API tRPC

Les endpoints suivants sont disponibles :

- `api.auth.sendVerificationCode` - Envoie un code de vérification
- `api.auth.verifyCode` - Vérifie le code reçu
- `api.auth.resendCode` - Renvoie un nouveau code

#### Composant React

Utilisez le composant `PhoneLogin` :

```tsx
import { PhoneLogin } from "@/components/auth/phone-login";

export function MyPage() {
  return <PhoneLogin />;
}
```

## Format des numéros de téléphone

Les numéros doivent être au format international E.164 :

- Commencer par `+`
- Suivi du code pays (ex: 33 pour la France)
- Puis le numéro sans le 0 initial

Exemples :

- France : `+33612345678`
- USA : `+14155552671`
- UK : `+447700900123`

## Flux d'authentification

1. L'utilisateur entre son numéro de téléphone
2. Un code à 6 chiffres est envoyé par SMS via Vonage
3. L'utilisateur entre le code reçu
4. Si le code est valide :
   - Un compte utilisateur est créé (ou mis à jour)
   - Une session NextAuth est créée
   - L'utilisateur est redirigé vers la page d'accueil

## Sécurité

- Les codes expirent après 5 minutes
- Un seul code actif par numéro à la fois
- Limite du nombre de tentatives de vérification
- Les numéros de téléphone sont uniques dans la base de données

## Coûts

L'envoi de SMS via Vonage est payant. Consultez la [grille tarifaire Vonage](https://www.vonage.com/communications-apis/sms/pricing/) pour les coûts par pays.

## Dépannage

### Erreur "Impossible d'envoyer le code de vérification"

- Vérifiez vos crédits Vonage
- Vérifiez que les clés API sont correctes
- Vérifiez que le numéro est au bon format

### Erreur "Code invalide ou expiré"

- Le code a expiré (plus de 5 minutes)
- Le code entré est incorrect
- Demandez un nouveau code avec "Renvoyer le code"
