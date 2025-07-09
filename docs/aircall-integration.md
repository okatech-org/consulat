# Intégration Aircall

## Vue d'ensemble

L'intégration Aircall permet aux agents consulaires de passer des appels téléphoniques directement depuis l'interface de review des demandes. Cette fonctionnalité utilise le SDK Aircall Everywhere V2 pour fournir une expérience d'appel intégrée.

## Fonctionnalités

### 🎯 Appels depuis l'interface
- **Bouton d'appel** : Directement dans l'interface de review des demandes
- **Informations utilisateur** : Affichage du nom et numéro de téléphone
- **Interface intégrée** : Workspace Aircall embarqué dans un modal

### ⚙️ Configuration par organisation
- **Paramètres centralisés** : Configuration dans les settings d'organisation
- **Permissions granulaires** : Contrôle des actions autorisées
- **Événements personnalisables** : Choix des événements à tracer

### 📊 Traçabilité
- **Historique des appels** : Enregistrement automatique dans les notes
- **Suivi des actions** : Logs des événements d'appel
- **Intégration timeline** : Affichage dans l'historique des demandes

## Configuration

### Prérequis
1. **Compte Aircall** : Avoir un compte Aircall actif
2. **Clés API** : Générer les clés API depuis le dashboard Aircall
3. **Permissions** : Rôle ADMIN, MANAGER ou SUPER_ADMIN requis

### Étapes de configuration

#### 1. Accéder aux paramètres
```
Dashboard → Settings → Onglet "Aircall"
```

#### 2. Activer l'intégration
- Cocher "Activer Aircall"
- Remplir les informations requises :
  - **Clé API** : Votre clé API Aircall
  - **ID API** : Votre ID API Aircall
  - **Nom d'intégration** : Nom personnalisé (ex: "consulat-ga")

#### 3. Configurer l'espace de travail
- **Taille** : Small, Medium ou Big selon vos besoins
- **Événements** : Sélectionner les événements à tracer
- **Permissions** : Définir les actions autorisées

#### 4. Sauvegarder
- Cliquer sur "Sauvegarder"
- Vérifier que la configuration est active

## Utilisation

### Pour les agents

#### Passer un appel
1. **Ouvrir une demande** : Accéder à l'interface de review
2. **Vérifier le numéro** : S'assurer qu'un numéro est disponible
3. **Cliquer sur "Appeler"** : Le bouton apparaît si Aircall est configuré
4. **Interface d'appel** : Une modal s'ouvre avec l'interface Aircall
5. **Effectuer l'appel** : Utiliser les contrôles Aircall

#### Contrôles disponibles
- **Composer** : Lancer l'appel
- **Raccrocher** : Terminer l'appel
- **Statut** : Voir l'état de la connexion

### Statuts d'appel
- **En attente** : Prêt à appeler
- **Appel en cours** : Numérotation en cours
- **Connecté** : Appel établi
- **Terminé** : Appel fini

## Architecture technique

### Composants principaux

#### 1. Hook `useAircall`
```typescript
const aircall = useAircall({
  config: aircallConfig,
  domElementId: 'aircall-workspace',
  onCallStart: (data) => console.log('Appel démarré'),
  onCallEnd: (data) => console.log('Appel terminé'),
});
```

#### 2. Composant `AircallCallButton`
```typescript
<AircallCallButton
  phoneNumber={phoneNumber}
  userDisplayName={userDisplayName}
  requestId={request.id}
  config={aircallConfig}
/>
```

#### 3. Configuration dans les settings
```typescript
<AircallSettings
  organizationId={organizationId}
  countryCode={countryCode}
  config={currentConfig}
/>
```

### Schémas de données

#### Configuration Aircall
```typescript
interface AircallConfig {
  enabled: boolean;
  apiKey?: string;
  apiId?: string;
  integrationName?: string;
  workspaceSize: 'small' | 'medium' | 'big';
  events: {
    onLogin: boolean;
    onLogout: boolean;
    onCallStart: boolean;
    onCallEnd: boolean;
    onCallAnswer: boolean;
  };
  permissions: {
    canMakeOutboundCalls: boolean;
    canReceiveInboundCalls: boolean;
    canTransferCalls: boolean;
    canRecordCalls: boolean;
  };
}
```

#### Action d'appel
```typescript
interface AircallCallAction {
  requestId: string;
  phoneNumber: string;
  userDisplayName?: string;
  notes?: string;
}
```

### Server Actions

#### Mettre à jour la configuration
```typescript
await updateAircallConfig(organizationId, countryCode, config);
```

#### Récupérer la configuration
```typescript
const { data: config } = await getAircallConfig(organizationId, countryCode);
```

#### Enregistrer une action d'appel
```typescript
await logAircallAction({
  requestId: 'req-123',
  phoneNumber: '+33123456789',
  userDisplayName: 'Jean Dupont',
  notes: 'Appel de suivi'
});
```

## Sécurité

### Permissions requises
- **Configuration** : ADMIN, MANAGER, SUPER_ADMIN
- **Utilisation** : Tous les agents autorisés
- **Consultation** : Selon les permissions de la demande

### Données sensibles
- **Clés API** : Stockées de manière sécurisée
- **Numéros de téléphone** : Accès contrôlé
- **Historique** : Traçabilité complète

### Validation
- **Schémas Zod** : Validation des données d'entrée
- **Sanitisation** : Nettoyage des données utilisateur
- **Erreurs** : Gestion sécurisée des erreurs

## Dépannage

### Problèmes courants

#### Aircall ne se charge pas
1. **Vérifier la configuration** : Clés API correctes
2. **Contrôler la connexion** : Réseau et firewall
3. **Consulter les logs** : Console navigateur

#### Bouton d'appel absent
1. **Configuration activée** : Vérifier que Aircall est activé
2. **Numéro disponible** : S'assurer qu'un numéro existe
3. **Permissions** : Vérifier les droits utilisateur

#### Appel ne fonctionne pas
1. **Connexion Aircall** : Vérifier le statut de connexion
2. **Permissions API** : Contrôler les permissions Aircall
3. **Format numéro** : Vérifier le format du numéro

### Logs et monitoring

#### Logs côté client
```javascript
// Activer les logs Aircall
localStorage.setItem('aircall-debug', 'true');
```

#### Logs côté serveur
```typescript
// Les actions sont automatiquement loggées
console.log('Aircall action:', action);
```

## Maintenance

### Mise à jour des clés API
1. Générer de nouvelles clés dans Aircall
2. Mettre à jour dans les settings
3. Tester la connexion

### Monitoring des performances
- **Temps de chargement** : Script Aircall
- **Succès des appels** : Taux de réussite
- **Utilisation** : Statistiques d'usage

### Sauvegarde de configuration
- **Export** : Sauvegarder la configuration
- **Import** : Restaurer en cas de problème
- **Versioning** : Historique des modifications

## Roadmap

### Fonctionnalités futures
- **Appels entrants** : Gestion des appels reçus
- **Transfert d'appels** : Entre agents
- **Enregistrement** : Sauvegarde des appels
- **Statistiques** : Dashboard d'analytics
- **Intégration CRM** : Synchronisation avancée

### Améliorations prévues
- **Performance** : Optimisation du chargement
- **UX** : Amélioration de l'interface
- **Mobile** : Support mobile amélioré
- **Offline** : Gestion hors ligne

## Support

### Documentation Aircall
- [API Reference](https://developer.aircall.io/api-references/)
- [SDK Documentation](https://developer.aircall.io/integrations/aircall-everywhere/)
- [Best Practices](https://developer.aircall.io/guides/)

### Contact
- **Support technique** : Équipe développement
- **Configuration** : Administrateurs système
- **Formation** : Équipe support utilisateurs 

## Guide de Test

### 1. Vérification des Permissions

Avant de tester l'intégration Aircall, assurez-vous que :

- L'utilisateur a le rôle `ADMIN` ou `MANAGER` pour accéder aux paramètres
- L'utilisateur est bien assigné à une organisation (`assignedOrganizationId` ou `organizationId`)
- L'organisation a au moins un pays associé dans la base de données

### 2. Test de Configuration

1. **Accéder aux paramètres d'organisation** :
   - Aller à `/dashboard/settings`
   - Cliquer sur l'onglet "Aircall"
   - Vérifier que le formulaire de configuration s'affiche

2. **Configurer Aircall** :
   - Activer l'intégration Aircall
   - Saisir les informations d'API (clé et ID)
   - Configurer les paramètres selon vos besoins
   - Sauvegarder la configuration

3. **Vérifier la sauvegarde** :
   - Actualiser la page
   - Vérifier que les paramètres sont bien conservés

### 3. Test de l'Interface d'Appel

1. **Accéder à une demande** :
   - Aller à `/dashboard/requests`
   - Cliquer sur une demande avec un utilisateur ayant un numéro de téléphone
   - Cliquer sur "Examiner la demande"

2. **Vérifier le bouton d'appel** :
   - Le bouton "Appeler" doit être visible si :
     - Aircall est activé dans l'organisation
     - L'utilisateur de la demande a un numéro de téléphone
     - L'utilisateur connecté a les permissions
   - Cliquer sur le bouton pour ouvrir la modal

3. **Tester l'appel** :
   - La modal Aircall doit s'ouvrir
   - Le workspace Aircall doit se charger
   - Tester un appel (selon votre configuration Aircall)

### 4. Résolution des Problèmes

#### Erreur "Vous ne pouvez accéder qu'à votre organisation"

**Symptôme** : L'erreur apparaît dans les logs lors de l'accès aux paramètres ou aux demandes.

**Solution** :
1. Vérifier que l'utilisateur a bien une organisation assignée :
   ```sql
   SELECT id, name, organizationId, assignedOrganizationId 
   FROM User 
   WHERE id = 'USER_ID';
   ```

2. Vérifier que l'organisation existe :
   ```sql
   SELECT id, name, status 
   FROM Organization 
   WHERE id = 'ORGANIZATION_ID';
   ```

3. Vérifier que l'utilisateur a les bons rôles :
   ```sql
   SELECT id, name, roles 
   FROM User 
   WHERE id = 'USER_ID';
   ```

#### Le bouton d'appel ne s'affiche pas

**Vérifications** :
1. Aircall est activé dans l'organisation
2. L'utilisateur de la demande a un numéro de téléphone
3. L'organisation a une configuration Aircall valide
4. L'utilisateur connecté a les permissions nécessaires

#### La modal Aircall ne se charge pas

**Vérifications** :
1. Les clés API Aircall sont correctes
2. Le domaine est autorisé dans Aircall
3. La configuration JavaScript est correcte
4. Vérifier la console pour les erreurs

### 5. Test en Production

Avant de déployer en production :

1. **Tester avec de vraies données Aircall**
2. **Vérifier les permissions sur différents rôles**
3. **Tester la journalisation des appels**
4. **Vérifier les notifications**
5. **Tester sur différents navigateurs**

### 6. Monitoring

Surveillez les logs pour :
- Erreurs de configuration Aircall
- Échecs d'appels
- Problèmes de permissions
- Erreurs de chargement du SDK

## Résolution des Problèmes Courants

### Problème : "Organization not found"
**Cause** : L'utilisateur n'est pas correctement assigné à une organisation.
**Solution** : Vérifier et corriger l'assignation dans la base de données.

### Problème : "Aircall SDK failed to load"
**Cause** : Problème de réseau ou clés API incorrectes.
**Solution** : Vérifier la configuration et la connectivité.

### Problème : "Permission denied"
**Cause** : Utilisateur sans les permissions nécessaires.
**Solution** : Vérifier les rôles et permissions de l'utilisateur.

## Maintenance

### Mise à jour des Clés API
1. Aller dans les paramètres d'organisation
2. Mettre à jour les clés dans l'interface
3. Tester la connexion

### Surveillance des Performances
- Surveiller les temps de chargement du SDK
- Vérifier la qualité des appels
- Analyser les logs d'utilisation

### Sauvegarde de Configuration
La configuration Aircall est stockée dans le champ `metadata` de l'organisation. Assurez-vous d'inclure ce champ dans vos sauvegardes. 