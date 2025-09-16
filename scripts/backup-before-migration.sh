#!/bin/bash

# Script de sauvegarde avant migration
# Crée une sauvegarde de la base de données avant d'exécuter la migration

set -e

echo "💾 Sauvegarde avant migration des données utilisateur"
echo "====================================================="

# Vérifier que les variables d'environnement sont définies
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL n'est pas définie"
    exit 1
fi

# Créer le dossier de sauvegarde s'il n'existe pas
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Générer un nom de fichier avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/user_migration_backup_$TIMESTAMP.sql"

echo "📁 Dossier de sauvegarde: $BACKUP_DIR"
echo "📄 Fichier de sauvegarde: $BACKUP_FILE"

# Extraire les informations de connexion de DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_URL_REGEX="postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)"
if [[ $DATABASE_URL =~ $DB_URL_REGEX ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "❌ Erreur: Impossible de parser DATABASE_URL"
    exit 1
fi

echo "🔗 Connexion à la base de données:"
echo "   - Host: $DB_HOST:$DB_PORT"
echo "   - Database: $DB_NAME"
echo "   - User: $DB_USER"

# Vérifier que pg_dump est disponible
if ! command -v pg_dump &> /dev/null; then
    echo "❌ Erreur: pg_dump n'est pas installé"
    echo "   Installez PostgreSQL client tools"
    exit 1
fi

echo "✅ pg_dump est disponible"

# Créer la sauvegarde
echo "🔄 Création de la sauvegarde..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    --file="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde créée avec succès: $BACKUP_FILE"
    
    # Afficher la taille du fichier
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "📊 Taille de la sauvegarde: $FILE_SIZE"
    
    # Créer un lien symbolique vers la dernière sauvegarde
    LATEST_BACKUP="$BACKUP_DIR/latest_backup.sql"
    ln -sf "$(basename "$BACKUP_FILE")" "$LATEST_BACKUP"
    echo "🔗 Lien vers la dernière sauvegarde: $LATEST_BACKUP"
    
    echo ""
    echo "💡 Pour restaurer cette sauvegarde:"
    echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $BACKUP_FILE"
    
else
    echo "❌ Erreur lors de la création de la sauvegarde"
    exit 1
fi

echo ""
echo "🎉 Sauvegarde terminée!"
echo "🚀 Vous pouvez maintenant exécuter la migration avec:"
echo "   ./scripts/run-user-migration.sh"
