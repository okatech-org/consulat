# 🚀 Guide Rapide de Migration Prisma → Convex

## 📋 Deux Approches de Migration

### 🌟 Approche A: Migration via JSON (Recommandée)

**Avantages** :

- ✅ Inspection des données avant import
- ✅ Rollback facile
- ✅ Architecture user-centric
- ✅ Fichiers JSON servent de backup

```bash
# 1. Vérification
bun run migrate:check

# 2. Export vers JSON
bun run migrate:export-json

# 3. Inspecter les fichiers dans ./data/exports/

# 4. Import vers Convex
bun run migrate:import-json
```

### ⚡ Approche B: Migration Directe (Legacy)

**Utilisation** : Migration directe sans fichiers intermédiaires

```bash
# 1. Vérification
bun run migrate:check

# 2. Migration complète
bun run migrate:to-convex
```

## 📝 Procédure Recommandée (JSON)

### Étape par Étape

```bash
# 1. Démarrer Convex en mode développement (terminal séparé)
npx convex dev

# 2. Vérifier que tout est prêt
bun run migrate:check

# 3. Exporter les données Prisma
bun run migrate:export-json

# 4. Vérifier les fichiers JSON
ls -lh ./data/exports/

# 5. Importer vers Convex
bun run migrate:import-json
```

## ⚙️ Configuration Requise

Assurez-vous d'avoir ces variables d'environnement :

```env
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"
NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"
```

## 📊 Structure des Données Exportées

L'export JSON crée une structure centrée utilisateur :

```
📦 data/exports/
├── countries.json              # 🌍 Pays (indépendant)
├── organizations.json          # 🏢 Organisations (indépendant)
├── services.json              # 🛎️ Services consulaires (indépendant)
├── users-data.json            # 👤 Données centrées utilisateur
│   └── Chaque user contient:
│       ├── profile            # Profil complet
│       ├── documents          # Documents personnels
│       ├── submittedRequests  # Demandes de service
│       ├── appointmentsToAttend # Rendez-vous
│       ├── notifications      # Notifications
│       ├── feedbacks          # Feedbacks
│       └── childAuthorities   # Autorités parentales
├── orphaned-data.json         # 🔍 Données sans user (optionnel)
├── metadata.json              # 📊 Métadonnées de l'export
└── import-manifest.json       # 📋 Ordre et instructions d'import
```

## ⏱️ Temps de Migration

Le temps dépend du volume de données :

| Enregistrements | Export | Import | Total     |
| --------------- | ------ | ------ | --------- |
| < 1,000         | ~10s   | ~1min  | ~1-2min   |
| 1,000 - 5,000   | ~30s   | ~5min  | ~5-6min   |
| 5,000 - 10,000  | ~1min  | ~10min | ~11-12min |
| > 10,000        | ~2min  | ~20min | ~22-25min |

## 🔍 Inspection des Données

Après l'export, inspectez les données :

```bash
# Compter les enregistrements
jq '. | length' ./data/exports/countries.json
jq '. | length' ./data/exports/users-data.json

# Voir les métadonnées
cat ./data/exports/metadata.json | jq

# Chercher un utilisateur spécifique
jq '.[] | select(.email == "john@example.com")' ./data/exports/users-data.json
```

## ⚠️ Important

### Avant de Migrer

- [ ] Faire un backup de la base Prisma
- [ ] Vérifier que Convex est déployé
- [ ] Vérifier l'espace disque (exports prennent ~50-200MB)
- [ ] Tester sur un environnement de dev d'abord

### Après la Migration

- [ ] Vérifier les comptages dans Convex Dashboard
- [ ] Synchroniser les IDs Clerk (si nécessaire)
- [ ] Migrer les fichiers vers Convex Storage
- [ ] Tester les fonctionnalités de l'app
- [ ] Garder les JSON comme backup (30 jours min)

## 🆘 En Cas de Problème

### Erreur d'export

```bash
# Vérifier Prisma
bunx prisma studio

# Vérifier l'espace disque
df -h
```

### Erreur d'import

```bash
# Vérifier Convex
npx convex dashboard

# Valider les fichiers JSON
jq empty ./data/exports/*.json
```

### Relations manquantes

Les données orphelines (sans user) sont dans `orphaned-data.json` :

```bash
cat ./data/exports/orphaned-data.json | jq
```

## 📚 Documentation

```bash
# Guide JSON complet (recommandé)
cat scripts/MIGRATION_JSON_README.md

# Guide migration directe (legacy)
bun run migrate:help
```

## 🎯 Quick Commands

```bash
# Vérification pré-migration
bun run migrate:check

# Export JSON (approche recommandée)
bun run migrate:export-json

# Import JSON vers Convex
bun run migrate:import-json

# Migration directe (legacy)
bun run migrate:to-convex

# Dashboard Convex
npx convex dashboard

# Prisma Studio
bunx prisma studio
```

## 🔄 Rollback

En cas de problème, vous pouvez facilement rollback avec l'approche JSON :

1. **Supprimer les données** dans Convex Dashboard
2. **Modifier les JSON** si nécessaire
3. **Ré-importer** avec `bun run migrate:import-json`

## 💡 Astuces

### Inspection avant import

Prenez le temps d'inspecter les JSON générés :

```bash
# Voir un exemple de chaque type
jq '.[0]' ./data/exports/countries.json
jq '.[0]' ./data/exports/organizations.json
jq '.[0]' ./data/exports/services.json
jq '.[0]' ./data/exports/users-data.json
```

### Import sélectif

Vous pouvez commenter certaines lignes dans `import-json-to-convex.ts` pour n'importer que certaines données.

### Performance

- L'export est très rapide (lecture SQL directe)
- L'import prend plus de temps (insertions Convex)
- Utilisateurs traités séquentiellement pour garantir l'intégrité

---

💡 **Astuce** : Utilisez toujours `migrate:check` avant toute migration !
