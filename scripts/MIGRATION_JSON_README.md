# 🚀 Migration Prisma → Convex via JSON

## 📋 Vue d'ensemble

Cette approche exporte d'abord toutes les données de Prisma en fichiers JSON, puis les importe vers Convex. C'est une méthode plus simple et plus robuste que la migration directe.

### Avantages

- ✅ **Inspection des données** : Visualisez les données JSON avant l'import
- ✅ **Rollback facile** : Les fichiers JSON servent de backup
- ✅ **Architecture user-centric** : Données groupées par utilisateur
- ✅ **Import progressif** : Importez par étapes avec contrôle
- ✅ **Débogage facile** : Identifiez rapidement les problèmes

### Architecture des données

```
📦 data/exports/
├── countries.json              # Pays (indépendant)
├── organizations.json          # Organisations (indépendant)
├── services.json              # Services consulaires (indépendant)
├── users-data.json            # Données centrées utilisateur
│   └── Chaque user contient:
│       ├── profile
│       ├── documents
│       ├── submittedRequests
│       ├── appointmentsToAttend
│       ├── notifications
│       ├── feedbacks
│       └── childAuthorities
├── orphaned-data.json         # Données sans user (optionnel)
├── metadata.json              # Métadonnées de l'export
└── import-manifest.json       # Ordre et instructions d'import
```

## 🎯 Processus de Migration

### Étape 1: Pré-vérification

Vérifiez que tout est prêt :

```bash
bun run migrate:check
```

Cela vérifie :

- ✅ Variables d'environnement
- ✅ Connexion Prisma
- ✅ Connexion Convex
- ✅ Espace disque disponible

### Étape 2: Export des données Prisma

Exportez toutes les données en JSON :

```bash
bun run migrate:export-json
```

**Ce que fait ce script :**

1. Exporte les **pays** avec leurs métadonnées
2. Exporte les **organisations** avec leurs pays liés
3. Exporte les **services** avec leurs étapes
4. Exporte les **utilisateurs** avec toutes leurs données :
   - Profil complet
   - Documents
   - Demandes de service
   - Rendez-vous
   - Notifications
   - Feedbacks
   - Autorités parentales
5. Exporte les **données orphelines** (sans utilisateur)
6. Génère les **métadonnées** et le **manifeste d'import**

**Sortie attendue :**

```
🚀 EXPORT PRISMA → JSON
================================================================================
📁 Dossier d'export créé : ./data/exports

🌍 Export des pays...
✅ 195 pays exportés → ./data/exports/countries.json

🏢 Export des organisations...
✅ 3 organisations exportées → ./data/exports/organizations.json

🛎️ Export des services...
✅ 12 services exportés → ./data/exports/services.json

👤 Export des données centrées utilisateur...
✅ 1,234 utilisateurs avec données exportés → ./data/exports/users-data.json
   📊 Total enregistrements inclus : 8,456

🔍 Export des données orphelines...
✅ 15 enregistrements orphelins exportés → ./data/exports/orphaned-data.json
   📋 Profils : 10
   📝 Demandes : 3
   📅 Rendez-vous : 2

================================================================================
📊 RÉSUMÉ DE L'EXPORT
================================================================================
```

### Étape 3: Vérification des fichiers JSON

Inspectez les fichiers JSON générés :

```bash
ls -lh ./data/exports/
```

Vous pouvez ouvrir et vérifier n'importe quel fichier :

```bash
# Voir les métadonnées
cat ./data/exports/metadata.json

# Compter les pays
jq '. | length' ./data/exports/countries.json

# Voir un exemple d'utilisateur
jq '.[0]' ./data/exports/users-data.json
```

### Étape 4: Import vers Convex

Importez les données JSON dans Convex :

```bash
bun run migrate:import-json
```

**Ce que fait ce script :**

1. Lit le manifeste d'import
2. Importe dans l'ordre :
   - **Countries** → Base de données
   - **Organizations** → Avec liens vers countries
   - **Services** → Avec liens vers organizations
   - **Users-Data** → Chaque user avec toutes ses données
   - **Orphaned-Data** → Données sans user (optionnel)

**Sortie attendue :**

```
🚀 IMPORT JSON → CONVEX
================================================================================

📋 Manifeste d'import chargé
   Version : 1.0.0
   Étapes : 5

🌍 Import des pays...
✅ 195 pays importés

🏢 Import des organisations...
✅ 3 organisations importées

🛎️ Import des services...
✅ 12 services importés

👤 Import des données centrées utilisateur...

   📍 Import utilisateur : john.doe@example.com
   ✅ Utilisateur importé avec 15 enregistrements liés

   📍 Import utilisateur : jane.smith@example.com
   ✅ Utilisateur importé avec 8 enregistrements liés

✅ 1,234/1,234 utilisateurs importés avec leurs données

================================================================================
📊 RÉSUMÉ DE L'IMPORT
================================================================================

COUNTRIES:
  Total: 195
  ✅ Succès: 195 (100.00%)
  ❌ Échecs: 0

ORGANIZATIONS:
  Total: 3
  ✅ Succès: 3 (100.00%)
  ❌ Échecs: 0

SERVICES:
  Total: 12
  ✅ Succès: 12 (100.00%)
  ❌ Échecs: 0

USERS-DATA:
  Total: 1,234
  ✅ Succès: 1,234 (100.00%)
  ❌ Échecs: 0
```

## 🔧 Configuration

### Variables d'environnement requises

```env
# PostgreSQL (Prisma)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Convex
NEXT_PUBLIC_CONVEX_URL="https://your-convex-deployment.convex.cloud"
```

## 📊 Structure des données exportées

### Countries (countries.json)

```json
[
  {
    "id": "clx...",
    "name": "France",
    "code": "FR",
    "status": "ACTIVE",
    "flag": "🇫🇷",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Organizations (organizations.json)

```json
[
  {
    "id": "clx...",
    "name": "Consulat du Gabon à Paris",
    "code": "ORG_FR",
    "type": "CONSULATE",
    "status": "ACTIVE",
    "metadata": {
      "FR": {
        "contact": {...}
      }
    },
    "countries": [
      {
        "code": "FR",
        "name": "France"
      }
    ]
  }
]
```

### Services (services.json)

```json
[
  {
    "id": "clx...",
    "name": "Passeport biométrique",
    "description": "...",
    "category": "IDENTITY",
    "isActive": true,
    "organizationId": "clx...",
    "requiredDocuments": ["PASSPORT", "IDENTITY_PHOTO"],
    "steps": [...]
  }
]
```

### Users-Data (users-data.json)

Structure centrée utilisateur :

```json
[
  {
    "id": "clx...",
    "clerkId": "user_...",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["USER"],
    "profile": {
      "id": "clx...",
      "firstName": "John",
      "lastName": "Doe",
      "address": {
        "firstLine": "123 Rue...",
        "city": "Paris",
        "country": "France"
      }
    },
    "documents": [
      {
        "id": "clx...",
        "type": "PASSPORT",
        "status": "VALIDATED",
        "fileUrl": "..."
      }
    ],
    "submittedRequests": [
      {
        "id": "clx...",
        "serviceId": "clx...",
        "status": "COMPLETED",
        "formData": {...}
      }
    ],
    "appointmentsToAttend": [...],
    "notifications": [...],
    "feedbacks": [...]
  }
]
```

## 🛠️ Commandes utiles

### Inspection des données

```bash
# Compter les enregistrements par type
jq '. | length' ./data/exports/countries.json
jq '. | length' ./data/exports/users-data.json

# Voir les métadonnées
cat ./data/exports/metadata.json | jq

# Voir le manifeste
cat ./data/exports/import-manifest.json | jq

# Chercher un utilisateur spécifique
jq '.[] | select(.email == "john@example.com")' ./data/exports/users-data.json
```

### Ré-export d'une catégorie

Si vous devez ré-exporter une catégorie spécifique, modifiez le script `export-prisma-to-json.ts` pour ne garder que les fonctions souhaitées.

### Import sélectif

Pour importer seulement certaines données, modifiez le script `import-json-to-convex.ts` et commentez les appels de fonctions non souhaités.

## ⚠️ Gestion des erreurs

### Problèmes d'export

Si l'export échoue :

1. Vérifiez la connexion Prisma : `npx prisma db push`
2. Vérifiez l'espace disque : `df -h`
3. Consultez les logs d'erreur dans la console

### Problèmes d'import

Si l'import échoue :

1. Vérifiez que Convex est accessible : `npx convex dev`
2. Vérifiez les fichiers JSON : assurez-vous qu'ils sont bien formés
3. Essayez d'importer par étapes (commentez certaines fonctions)
4. Consultez les logs d'erreur détaillés

### Relations manquantes

Si des relations sont manquantes :

- Les `orphaned-data.json` contiennent les enregistrements sans utilisateur
- Vous pouvez les importer manuellement ou les associer après coup

## 🔄 Rollback

En cas de problème, vous pouvez :

1. **Supprimer les données dans Convex** via le dashboard
2. **Ré-importer** avec `bun run migrate:import-json`
3. **Modifier les JSON** si nécessaire et ré-importer

## 📈 Performance

### Temps estimés

| Enregistrements | Export | Import | Total     |
| --------------- | ------ | ------ | --------- |
| < 1,000         | ~10s   | ~1min  | ~1-2min   |
| 1,000 - 5,000   | ~30s   | ~5min  | ~5-6min   |
| 5,000 - 10,000  | ~1min  | ~10min | ~11-12min |
| > 10,000        | ~2min  | ~20min | ~22-25min |

### Optimisation

- L'export est très rapide (lecture SQL)
- L'import est plus lent (insertions Convex une par une)
- Les utilisateurs sont traités séquentiellement pour garantir l'intégrité

## 🎯 Prochaines étapes

Après la migration :

1. **Vérifier les données** dans le dashboard Convex
2. **Tester l'application** avec les nouvelles données
3. **Synchroniser Clerk** si nécessaire
4. **Supprimer les fichiers JSON** une fois validé (backup d'abord !)

## 📞 Support

En cas de problème :

1. Vérifiez les logs dans la console
2. Consultez le dashboard Convex
3. Vérifiez les fichiers JSON générés
4. Contactez l'équipe de développement

---

**Note** : Gardez les fichiers JSON comme backup pendant au moins 30 jours après une migration réussie.
