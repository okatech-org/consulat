#!/usr/bin/env bash
# Script pour restaurer la base de données PostgreSQL à partir d'une sauvegarde

# Définir les constantes
DB_CONTAINER_NAME="consulatDB"
BACKUP_DIR="./backups/database"

# Charger les variables d'environnement
set -a
if [ -f .env ]; then
  source .env
fi

# Vérifier si le répertoire de sauvegarde existe
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Le répertoire de sauvegarde $BACKUP_DIR n'existe pas."
  exit 1
fi

# Lister les fichiers de sauvegarde disponibles
echo "Sauvegardes disponibles:"
BACKUPS=($(ls -t "$BACKUP_DIR" | grep -E '\.(gz|sql)$'))

if [ ${#BACKUPS[@]} -eq 0 ]; then
  echo "Aucune sauvegarde trouvée dans $BACKUP_DIR"
  exit 1
fi

# Afficher les sauvegardes numérotées
for i in "${!BACKUPS[@]}"; do
  echo "$i: ${BACKUPS[$i]}"
done

# Demander à l'utilisateur de choisir une sauvegarde
echo -n "Entrez le numéro de la sauvegarde à restaurer [0]: "
read BACKUP_INDEX

# Par défaut, utiliser la sauvegarde la plus récente (indice 0)
if [ -z "$BACKUP_INDEX" ]; then
  BACKUP_INDEX=0
fi

# Vérifier que l'indice est valide
if ! [[ "$BACKUP_INDEX" =~ ^[0-9]+$ ]] || [ "$BACKUP_INDEX" -ge ${#BACKUPS[@]} ]; then
  echo "Indice invalide. Utilisation de la sauvegarde la plus récente."
  BACKUP_INDEX=0
fi

BACKUP_FILE="$BACKUP_DIR/${BACKUPS[$BACKUP_INDEX]}"
echo "Sauvegarde sélectionnée: $BACKUP_FILE"

# Vérifier si le conteneur est en cours d'exécution
if ! docker ps | grep -q "$DB_CONTAINER_NAME"; then
  echo "Le conteneur '$DB_CONTAINER_NAME' n'est pas en cours d'exécution."
  echo "Démarrage de la base de données..."
  docker-compose up -d
  
  # Attendre que la base de données soit prête
  sleep 5
fi

# Demander confirmation avant de procéder
echo "ATTENTION: Cette opération va remplacer la base de données actuelle par la sauvegarde sélectionnée."
echo -n "Voulez-vous continuer? [y/N]: "
read CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Opération annulée."
  exit 0
fi

# Préparer le fichier pour la restauration
RESTORE_FILE="$BACKUP_FILE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Décompression de la sauvegarde..."
  gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
  RESTORE_FILE="${BACKUP_FILE%.gz}"
fi

echo "Restauration de la base de données à partir de: $RESTORE_FILE"

# Supprimer les connexions existantes pour pouvoir supprimer la base de données
docker exec -t "$DB_CONTAINER_NAME" psql -U okafrancois -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'consulatDB' AND pid <> pg_backend_pid();" postgres

# Suppression et création d'une nouvelle base de données vide
docker exec -t "$DB_CONTAINER_NAME" dropdb -U okafrancois consulatDB --if-exists
docker exec -t "$DB_CONTAINER_NAME" createdb -U okafrancois consulatDB

# Restauration de la base de données
cat "$RESTORE_FILE" | docker exec -i "$DB_CONTAINER_NAME" psql -U okafrancois -d consulatDB

# Vérifier si la restauration a réussi
if [ $? -eq 0 ]; then
  echo "Restauration réussie."
  
  # Nettoyer le fichier temporaire si nous avons décompressé
  if [[ "$BACKUP_FILE" == *.gz ]]; then
    rm "$RESTORE_FILE"
  fi
else
  echo "Des erreurs se sont produites lors de la restauration."
  echo "Il est possible que certaines erreurs soient normales en fonction du contenu de la sauvegarde."
fi

echo "Opération de restauration terminée." 