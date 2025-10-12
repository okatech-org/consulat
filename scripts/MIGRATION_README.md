# Guide de Migration Prisma vers Convex

Ce guide explique comment migrer toutes les données de votre base de données PostgreSQL (via Prisma) vers Convex.

## 📋 Prérequis

1. **Base de données Prisma fonctionnelle** avec des données à migrer
2. **Convex configuré** avec les schémas de tables définis
3. **Variables d'environnement** configurées :
   ```bash
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   NEXT_PUBLIC_CONVEX_URL="https://your-convex-deployment.convex.cloud"
   ```

## 🚀 Processus de Migration

### Étape 0: Pré-vérification (Recommandé)

Avant de lancer la migration, vérifiez que tout est prêt :

```bash
bun run migrate:check
```

Ce script va vérifier :

- ✅ Les variables d'environnement
- ✅ La connexion à Prisma
- ✅ La connexion à Convex
- ✅ Le déploiement Convex
- ✅ Le nombre de données à migrer
- ✅ L'espace disque disponible

### Étape 1: Préparation

1. **Vérifier que Convex est déployé** :

   ```bash
   npx convex dev
   ```

2. **Installer les dépendances** :

   ```bash
   bun install
   ```

3. **Afficher l'aide si nécessaire** :
   ```bash
   bun run migrate:help
   ```

### Étape 2: Ordre de Migration

Les données doivent être migrées dans un ordre spécifique pour respecter les relations entre tables :

```
1. Countries (Pays)
   ↓
2. Organizations (Organisations)
   ↓
3. Users (Utilisateurs)
   ↓
4. Profiles (Profils)
   ↓
5. Services (Services consulaires)
   ↓
6. Documents (Documents utilisateur)
   ↓
7. Requests (Demandes de service)
   ↓
8. Appointments (Rendez-vous)
   ↓
9. Notifications (Notifications)
```

### Étape 3: Exécution

#### Migration Complète (Recommandé)

Migrer toutes les données en une seule commande :

```bash
bun run scripts/migrate-to-convex.ts
```

Cela va :

- ✅ Migrer tous les pays
- ✅ Migrer toutes les organisations avec leurs configurations
- ✅ Migrer tous les utilisateurs (avec IDs temporaires)
- ✅ Migrer tous les profils avec adresses
- ✅ Migrer tous les services
- ✅ Migrer tous les documents
- ✅ Migrer toutes les demandes de service
- ✅ Migrer tous les rendez-vous
- ✅ Migrer toutes les notifications
- 📊 Afficher un résumé détaillé

#### Migration Partielle (Avancé)

Pour migrer seulement certaines entités, vous pouvez modifier le script `migrate-to-convex.ts` et commenter les fonctions non nécessaires dans la fonction `main()`.

## 📊 Fonctionnement

### Traitement par Lots

Les migrations utilisent un traitement par lots pour éviter les timeouts :

- **Users** : 50 par lot
- **Profiles** : 50 par lot
- **Documents** : 50 par lot
- **Requests** : 50 par lot
- **Notifications** : 100 par lot

### Gestion des Relations

Les scripts gèrent automatiquement les relations entre entités :

```typescript
// Exemple : Migration d'un profil avec son adresse
{
  userId: await findConvexUserByLegacyId(ctx, postgresProfile.userId),
  addressId: await createAddress(ctx, postgresProfile.address),
  // ... autres champs
}
```

### Mapping des Enums

Tous les enums Prisma sont automatiquement convertis vers les enums Convex :

```typescript
const statusMapping = {
  PENDING: RequestStatus.Pending,
  VALIDATED: RequestStatus.Validated,
  // ...
};
```

## 🔍 Vérification Post-Migration

Après la migration, vérifiez vos données dans Convex :

1. **Dashboard Convex** : https://dashboard.convex.dev
2. **Vérifier les comptages** :
   ```typescript
   // Dans la console Convex
   await ctx.db.query('users').collect().length;
   await ctx.db.query('profiles').collect().length;
   // etc.
   ```

## ⚠️ Points d'Attention

### 1. IDs Temporaires

Les utilisateurs sont créés avec des IDs temporaires (`temp_${legacyId}`) qui doivent être remplacés par les vrais IDs Clerk :

```bash
# Récupérer les utilisateurs à synchroniser
bun run scripts/sync-clerk-ids.ts
```

### 2. Fichiers Non Migrés

Les fichiers stockés (documents, images) ne sont PAS automatiquement migrés. Vous devez :

- Migrer les fichiers vers Convex Storage séparément
- Mettre à jour les `storageId` dans les documents

### 3. Relations Manquantes

Si des relations sont manquantes, le script :

- Affiche un warning dans la console
- Continue avec les autres enregistrements
- Enregistre l'erreur dans le résumé final

## 🛠️ Dépannage

### Erreur : "Too many documents"

Si vous avez beaucoup de données :

1. Réduire la taille des lots dans le script
2. Migrer en plusieurs fois en commentant certaines entités

### Erreur : "Network timeout"

Si la connexion timeout :

1. Vérifier votre connexion internet
2. Augmenter les timeouts dans le client HTTP
3. Migrer par plus petits lots

### Erreur : "Invalid enum value"

Si un enum n'est pas reconnu :

1. Vérifier le mapping dans `convex/functions/migration.ts`
2. Ajouter la valeur manquante au mapping

## 📈 Monitoring

Le script affiche en temps réel :

- ✅ Nombre d'entités migrées par lot
- ❌ Erreurs rencontrées
- 📊 Résumé final avec statistiques détaillées

Exemple de sortie :

```
🚀 DÉBUT DE LA MIGRATION PRISMA → CONVEX
================================================================================

🌍 Migration des pays...
✅ 50 pays migrés

🏢 Migration des organisations...
✅ 10 organisations migrées
✅ 45 configurations pays créées

👤 Migration des utilisateurs...
✅ Lot 1: 50 utilisateurs migrés
✅ Lot 2: 30 utilisateurs migrés
✅ Total: 80/80 utilisateurs migrés

================================================================================
📊 RÉSUMÉ DE LA MIGRATION
================================================================================

COUNTRIES:
  Total: 50
  ✅ Succès: 50 (100.00%)
  ❌ Échecs: 0

USERS:
  Total: 80
  ✅ Succès: 80 (100.00%)
  ❌ Échecs: 0
...
```

## 🔒 Sécurité

- Les scripts n'écrivent JAMAIS dans PostgreSQL
- Toutes les opérations sont en lecture seule sur Prisma
- Les mutations Convex sont atomiques par lot
- En cas d'erreur, seul le lot en cours est affecté

## 📝 Scripts Disponibles

1. **`migrate-to-convex.ts`** : Script principal de migration
2. **`sync-clerk-ids.ts`** : (À créer) Synchronisation des IDs Clerk
3. **`verify-migration.ts`** : (À créer) Vérification des données migrées
4. **`rollback.ts`** : (À créer) Rollback en cas de problème

## 🎯 Prochaines Étapes

Après une migration réussie :

1. ✅ Synchroniser les IDs Clerk
2. ✅ Migrer les fichiers vers Convex Storage
3. ✅ Vérifier toutes les relations
4. ✅ Tester les fonctionnalités de l'application
5. ✅ Mettre à jour les configurations d'authentification
6. ✅ Basculer l'application vers Convex
7. ✅ Désactiver l'ancien système Prisma

## 🤝 Support

En cas de problème :

1. Consulter les logs détaillés
2. Vérifier les relations dans le dashboard Convex
3. Contacter l'équipe de développement
