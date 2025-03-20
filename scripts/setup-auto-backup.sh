#!/usr/bin/env bash
# Script pour configurer une sauvegarde automatique via crontab

# Chemin absolu du projet
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_SCRIPT="$PROJECT_DIR/scripts/db-backup.sh"

# Vérifier si le script de sauvegarde existe
if [ ! -f "$BACKUP_SCRIPT" ]; then
  echo "Le script de sauvegarde n'existe pas: $BACKUP_SCRIPT"
  exit 1
fi

# S'assurer que le script est exécutable
chmod +x "$BACKUP_SCRIPT"

# Créer une entrée crontab pour exécuter la sauvegarde tous les jours à 3h du matin
CRON_JOB="0 3 * * * cd $PROJECT_DIR && bash $BACKUP_SCRIPT >> $PROJECT_DIR/backups/database/backup.log 2>&1"

# Vérifier si l'entrée existe déjà dans crontab
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "$BACKUP_SCRIPT")

if [ -z "$EXISTING_CRON" ]; then
  echo "Configuration de la sauvegarde automatique quotidienne à 3h00..."
  
  # Ajouter la nouvelle entrée crontab
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  
  if [ $? -eq 0 ]; then
    echo "Configuration réussie!"
    echo "La base de données sera sauvegardée tous les jours à 3h00 du matin."
    echo "Les logs seront écrits dans $PROJECT_DIR/backups/database/backup.log"
  else
    echo "Erreur lors de la configuration de crontab."
    exit 1
  fi
else
  echo "Une configuration de sauvegarde automatique existe déjà."
  echo "Configuration actuelle:"
  crontab -l | grep -F "$BACKUP_SCRIPT"
fi

# Afficher toutes les tâches cron configurées
echo "Liste de toutes les tâches cron configurées:"
crontab -l 