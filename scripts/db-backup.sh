#!/usr/bin/env bash
# Script pour sauvegarder la base de données PostgreSQL

# Définir les constantes
DB_CONTAINER_NAME="consulatDB"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/database"
BACKUP_FILE="${BACKUP_DIR}/consulatdb_${TIMESTAMP}.sql"

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Charger les variables d'environnement
set -a
if [ -f .env ]; then
  source .env
fi

# Vérifier si le conteneur est en cours d'exécution
if ! docker ps | grep -q "$DB_CONTAINER_NAME"; then
  echo "Le conteneur '$DB_CONTAINER_NAME' n'est pas en cours d'exécution."
  echo "Démarrage de la base de données..."
  docker-compose up -d
  
  # Attendre que la base de données soit prête
  sleep 5
fi

echo "Création de la sauvegarde de la base de données..."

# Exécuter la sauvegarde via docker exec - format SQL plain
docker exec -t "$DB_CONTAINER_NAME" pg_dump -U okafrancois -d consulatDB --no-owner --no-acl -f - > "$BACKUP_FILE"

# Vérifier si la sauvegarde a réussi
if [ $? -eq 0 ]; then
  echo "Sauvegarde réussie: $BACKUP_FILE"
  
  # Compresser la sauvegarde
  gzip -f "$BACKUP_FILE"
  echo "Sauvegarde compressée: ${BACKUP_FILE}.gz"
  
  # Afficher la taille du fichier de sauvegarde
  du -h "${BACKUP_FILE}.gz"
  
  # Liste des sauvegardes existantes (garder les 5 plus récentes)
  echo "Sauvegardes disponibles:"
  ls -lth "$BACKUP_DIR" | head -n 6
  
  # Supprimer les sauvegardes anciennes (garder les 10 plus récentes)
  OLD_BACKUPS=$(ls -t "$BACKUP_DIR" | tail -n +11)
  if [ ! -z "$OLD_BACKUPS" ]; then
    echo "Suppression des anciennes sauvegardes..."
    for OLD_BACKUP in $OLD_BACKUPS; do
      rm -f "$BACKUP_DIR/$OLD_BACKUP"
      echo "Supprimé: $OLD_BACKUP"
    done
  fi
else
  echo "Échec de la sauvegarde."
  exit 1
fi

echo "Opération de sauvegarde terminée." 