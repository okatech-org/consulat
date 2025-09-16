#!/bin/bash

# Script pour exécuter la migration des numéros de téléphone
# Usage: ./scripts/run-phone-migration.sh

set -e

echo "🚀 Démarrage de la migration des numéros de téléphone"
echo "📋 Ce script va convertir les numéros du format +33-612250393 vers +33612250393"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier que les variables d'environnement sont définies
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL n'est pas définie"
    echo "💡 Assurez-vous d'avoir un fichier .env.local avec les bonnes variables"
    exit 1
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "❌ Erreur: CLERK_SECRET_KEY n'est pas définie"
    echo "💡 Assurez-vous d'avoir configuré Clerk correctement"
    exit 1
fi

echo "✅ Variables d'environnement vérifiées"
echo ""

# Demander confirmation
read -p "⚠️  Cette opération va modifier les numéros de téléphone en base de données. Continuer ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration annulée"
    exit 1
fi

echo ""
echo "🔄 Exécution de la migration..."

# Exécuter le script de migration
npx tsx scripts/migrate-phone-numbers.ts

echo ""
echo "✅ Migration terminée!"
echo ""
echo "📊 Prochaines étapes:"
echo "1. Vérifiez les logs ci-dessus pour identifier d'éventuelles erreurs"
echo "2. Testez la connexion avec quelques utilisateurs"
echo "3. Vérifiez que les numéros sont bien synchronisés dans Clerk"
echo ""
echo "🔍 Pour vérifier les numéros en base:"
echo "   npx prisma studio"
echo ""
echo "🔍 Pour vérifier les numéros dans Clerk:"
echo "   Consultez le dashboard Clerk"
