#!/bin/bash

# Script pour exécuter la migration globale des données utilisateur
# Ce script migre les numéros de téléphone, emails et synchronise les métadonnées avec Clerk

set -e

echo "🚀 Démarrage de la migration globale des données utilisateur"
echo "============================================================"

# Vérifier que les variables d'environnement sont définies
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL n'est pas définie"
    exit 1
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "❌ Erreur: CLERK_SECRET_KEY n'est pas définie"
    exit 1
fi

echo "✅ Variables d'environnement vérifiées"

# Vérifier que tsx est installé
if ! command -v tsx &> /dev/null; then
    echo "📦 Installation de tsx..."
    npm install -g tsx
fi

echo "✅ tsx est disponible"

# Exécuter les tests préalables
echo "🧪 Exécution des tests préalables..."
tsx scripts/test-migration.ts

if [ $? -ne 0 ]; then
    echo "❌ Les tests ont échoué. Arrêt de la migration."
    exit 1
fi

echo "✅ Tous les tests sont passés"

# Demander confirmation avant la migration
echo ""
echo "⚠️  Vous êtes sur le point d'exécuter la migration complète des données utilisateur."
echo "   Cette opération va:"
echo "   - Normaliser tous les numéros de téléphone et emails"
echo "   - Synchroniser les métadonnées avec Clerk"
echo "   - Modifier les données en base"
echo ""
read -p "Voulez-vous continuer? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration annulée par l'utilisateur"
    exit 0
fi

# Exécuter la migration
echo "🔄 Exécution de la migration..."
tsx scripts/migrate-user-data.ts

echo ""
echo "🎉 Migration terminée!"
echo ""
echo "📋 Résumé des actions effectuées:"
echo "   - Normalisation des numéros de téléphone (suppression des espaces et tirets)"
echo "   - Normalisation des emails (conversion en minuscules)"
echo "   - Synchronisation des métadonnées avec Clerk"
echo ""
echo "🔍 Métadonnées ajoutées à Clerk:"
echo "   - id (ID utilisateur)"
echo "   - profileId"
echo "   - roles"
echo "   - role"
echo "   - countryCode"
echo "   - assignedOrganizationId (si présent)"
echo "   - organizationId (si présent)"
