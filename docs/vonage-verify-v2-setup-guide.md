# Guide de configuration Vonage Verify V2

## Étapes rapides pour configurer Vonage Verify V2

### 1. Créer un compte Vonage

Si vous n'avez pas encore de compte, inscrivez-vous sur [dashboard.nexmo.com](https://dashboard.nexmo.com).

### 2. Créer une application Vonage

1. Connectez-vous au Dashboard Vonage
2. Dans le menu de gauche, cliquez sur **"Applications"**
3. Cliquez sur **"Create a new application"**
4. Remplissez les informations :
   - **Application name** : "Consulat Auth" (ou le nom de votre choix)
   - **Capabilities** : Cochez **"Verify"**
5. Cliquez sur **"Generate public and private key"**
6. **IMPORTANT** : Téléchargez la clé privée immédiatement (elle ne sera plus accessible après)
7. Cliquez sur **"Create application"**

### 3. Récupérer les informations nécessaires

Après la création, vous aurez :

- **Application ID** : Affiché sur la page de l'application (format : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- **Private Key** : Dans le fichier téléchargé (`private.key`)

Vous avez aussi besoin de :

- **API Key** : Dans "Settings" > "API settings"
- **API Secret** : Dans "Settings" > "API settings"

### 4. Configurer les variables d'environnement

Dans votre fichier `.env`, ajoutez :

```env
# Récupéré depuis API settings
VONAGE_API_KEY="abc123def"
VONAGE_API_SECRET="AbCdEfGhIjKlMnOp"

# Récupéré depuis votre application
VONAGE_APPLICATION_ID="12345678-1234-1234-1234-123456789012"

# Contenu du fichier private.key téléchargé
# IMPORTANT : Remplacez les sauts de ligne par \n
VONAGE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

### 5. Formater la clé privée

La clé privée doit être sur une seule ligne avec `\n` à la place des sauts de ligne :

**Fichier original (private.key)** :

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...plusieurs lignes...
-----END PRIVATE KEY-----
```

**Format pour .env** :

```
VONAGE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n...\n-----END PRIVATE KEY-----"
```

### 6. Vérifier les crédits SMS

Verify V2 utilise des SMS pour envoyer les codes. Assurez-vous d'avoir des crédits :

1. Allez dans "Billing" > "Payment"
2. Ajoutez des crédits (minimum recommandé : 10€ pour les tests)

### 7. Tester l'envoi

Une fois configuré, testez en accédant à `/auth/login` et en entrant votre numéro de téléphone.

## Dépannage

### Erreur "Missing application id"

→ Vérifiez que `VONAGE_APPLICATION_ID` est bien défini dans `.env`

### Erreur "Invalid credentials"

→ Vérifiez que la clé privée est correctement formatée (sur une ligne avec `\n`)

### Erreur "Insufficient balance"

→ Ajoutez des crédits à votre compte Vonage

### Le SMS n'arrive pas

→ Vérifiez que le numéro est au format international (+33...)
