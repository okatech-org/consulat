# Scripts de Migration des Données Utilisateur

Ce dossier contient les scripts pour migrer les données utilisateur et synchroniser les métadonnées avec Clerk.

## 📋 Scripts Disponibles

### 1. `migrate-user-data.ts`
Script principal de migration qui effectue :
- **Normalisation des numéros de téléphone** : Supprime les espaces et tirets (ex: `+33-612250393` → `+33612250393`)
- **Normalisation des emails** : Convertit en minuscules et supprime les espaces
- **Synchronisation des métadonnées avec Clerk** : Ajoute les champs suivants aux métadonnées publiques :
  - `id` : ID utilisateur de la base de données
  - `profileId` : ID du profil associé
  - `roles` : Rôles de l'utilisateur
  - `role` : Rôle principal
  - `countryCode` : Code du pays
  - `assignedOrganizationId` : ID de l'organisation assignée (si présent)
  - `organizationId` : ID de l'organisation (si présent)

### 2. `check-clerk-metadata.ts`
Script de vérification pour :
- Vérifier l'état des métadonnées Clerk
- Lister tous les utilisateurs avec leurs métadonnées
- Identifier les utilisateurs sans métadonnées

### 3. `run-user-migration.sh`
Script shell pour exécuter la migration avec vérifications préalables.

### 4. `test-migration.ts`
Script de test pour vérifier que tout fonctionne avant la migration complète.

### 5. `rollback-migration.ts`
Script de rollback pour annuler les changements si nécessaire.

## 🚀 Utilisation

### Migration Complète
```bash
# Exécuter la migration complète
./scripts/run-user-migration.sh
```

### Vérification des Métadonnées
```bash
# Vérifier les utilisateurs sans métadonnées
tsx scripts/check-clerk-metadata.ts

# Lister tous les utilisateurs
tsx scripts/check-clerk-metadata.ts --all

# Vérifier un utilisateur spécifique
tsx scripts/check-clerk-metadata.ts --user <userId>
```

### Tests Préalables
```bash
# Tester la migration avant de l'exécuter
tsx scripts/test-migration.ts
```

### Migration Manuelle
```bash
# Exécuter directement le script TypeScript
tsx scripts/migrate-user-data.ts
```

### Rollback
```bash
# Lister les utilisateurs avec métadonnées
tsx scripts/rollback-migration.ts --list

# Supprimer toutes les métadonnées Clerk
tsx scripts/rollback-migration.ts --remove

# Afficher l'aide
tsx scripts/rollback-migration.ts --help
```

## 📊 Métadonnées Ajoutées à Clerk

Les métadonnées suivantes sont ajoutées aux utilisateurs Clerk dans `publicMetadata` :

```typescript
{
  id: string,                    // ID utilisateur de la base de données
  profileId: string | null,      // ID du profil associé
  roles: UserRole[],             // Rôles de l'utilisateur
  role: UserRole,                // Rôle principal
  countryCode: string | null,    // Code du pays
  assignedOrganizationId?: string, // ID de l'organisation assignée (si présent)
  organizationId?: string        // ID de l'organisation (si présent)
}
```

## ⚠️ Prérequis

1. **Variables d'environnement** :
   - `DATABASE_URL` : URL de la base de données PostgreSQL
   - `CLERK_SECRET_KEY` : Clé secrète Clerk

2. **Dépendances** :
   - `tsx` : Pour exécuter les scripts TypeScript
   - `@prisma/client` : Client Prisma
   - `@clerk/nextjs/server` : SDK Clerk

## 🔍 Vérification Post-Migration

Après la migration, vous pouvez vérifier que les métadonnées ont été correctement ajoutées :

```bash
# Vérifier l'état général
tsx scripts/check-clerk-metadata.ts

# Vérifier un utilisateur spécifique
tsx scripts/check-clerk-metadata.ts --user <userId>
```

## 📈 Exemple de Sortie

```
🚀 Début de la migration globale des données utilisateur

🔄 Début de la migration des données utilisateur...
📊 150 utilisateurs trouvés à migrer
✅ Utilisateur user_123 mis à jour
✅ Utilisateur user_456 mis à jour

📈 Résultats de la migration base de données:
   - Numéros de téléphone mis à jour: 45
   - Emails mis à jour: 12
   - Erreurs: 0

🔄 Début de la synchronisation des métadonnées avec Clerk...
📊 150 utilisateurs avec Clerk ID trouvés
✅ Métadonnées mises à jour pour user_clerk_123
✅ Métadonnées mises à jour pour user_clerk_456

📈 Résultats de la synchronisation Clerk:
   - Succès: 150
   - Erreurs: 0

🎉 Migration terminée avec succès!
```

## 🛠️ Dépannage

### Erreur de Variables d'Environnement
```
❌ Erreur: DATABASE_URL n'est pas définie
❌ Erreur: CLERK_SECRET_KEY n'est pas définie
```
**Solution** : Vérifiez que les variables d'environnement sont correctement définies dans votre fichier `.env`.

### Erreur de Dépendances
```
❌ Erreur: tsx n'est pas installé
```
**Solution** : Installez tsx globalement : `npm install -g tsx`

### Erreur de Connexion Clerk
```
❌ Erreur lors de la mise à jour des métadonnées pour user_clerk_123
```
**Solution** : Vérifiez que la clé secrète Clerk est correcte et que l'utilisateur existe dans Clerk.
