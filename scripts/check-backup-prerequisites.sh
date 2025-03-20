#!/usr/bin/env bash
# Script pour vérifier que tous les prérequis pour les sauvegardes sont présents

echo "Vérification des prérequis pour les sauvegardes de base de données..."
echo "------------------------------------------------------"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
  echo "❌ Docker n'est pas installé."
  echo "   Veuillez installer Docker : https://docs.docker.com/get-docker/"
  EXIT_STATUS=1
else
  echo "✅ Docker est installé."
  
  # Vérifier que le démon Docker est en cours d'exécution
  if ! docker info &> /dev/null; then
    echo "❌ Le démon Docker n'est pas en cours d'exécution."
    echo "   Veuillez démarrer Docker."
    EXIT_STATUS=1
  else
    echo "✅ Le démon Docker est en cours d'exécution."
  fi
fi

# Vérifier que docker-compose est installé
if ! command -v docker-compose &> /dev/null; then
  echo "❌ docker-compose n'est pas installé."
  echo "   Veuillez installer docker-compose."
  EXIT_STATUS=1
else
  echo "✅ docker-compose est installé."
fi

# Vérifier que pg_dump est disponible via Docker
if docker-compose ps | grep -q "consulatDB"; then
  if ! docker exec -t consulatDB pg_dump --version &> /dev/null; then
    echo "❌ pg_dump n'est pas disponible dans le conteneur de base de données."
    EXIT_STATUS=1
  else
    echo "✅ pg_dump est disponible dans le conteneur de base de données."
  fi
else
  echo "⚠️ Le conteneur de base de données n'est pas en cours d'exécution."
  echo "   Utilisez 'npm run db:server' pour démarrer la base de données."
fi

# Vérifier que le répertoire de sauvegarde existe ou peut être créé
BACKUP_DIR="./backups/database"
if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "❌ Impossible de créer le répertoire de sauvegarde $BACKUP_DIR."
    EXIT_STATUS=1
  else
    echo "✅ Répertoire de sauvegarde créé : $BACKUP_DIR"
    rmdir "$BACKUP_DIR" 2>/dev/null
  fi
else
  echo "✅ Le répertoire de sauvegarde existe déjà : $BACKUP_DIR"
  
  # Vérifier les permissions
  if [ ! -w "$BACKUP_DIR" ]; then
    echo "❌ Le répertoire de sauvegarde n'est pas accessible en écriture."
    EXIT_STATUS=1
  else
    echo "✅ Le répertoire de sauvegarde est accessible en écriture."
  fi
fi

# Vérifier si la base de données est configurée dans docker-compose.yml
if [ -f "docker-compose.yml" ]; then
  if grep -q "consulatDB" docker-compose.yml; then
    echo "✅ La base de données est configurée dans docker-compose.yml."
  else
    echo "❌ La base de données n'est pas configurée dans docker-compose.yml."
    EXIT_STATUS=1
  fi
else
  echo "❌ Le fichier docker-compose.yml n'existe pas."
  EXIT_STATUS=1
fi

# Vérifier les scripts de sauvegarde
if [ ! -f "scripts/db-backup.sh" ]; then
  echo "❌ Le script de sauvegarde n'existe pas."
  EXIT_STATUS=1
else
  echo "✅ Le script de sauvegarde existe."
  
  # Vérifier que le script est exécutable
  if [ ! -x "scripts/db-backup.sh" ]; then
    echo "❌ Le script de sauvegarde n'est pas exécutable."
    EXIT_STATUS=1
  else
    echo "✅ Le script de sauvegarde est exécutable."
  fi
fi

# Résumé
echo "------------------------------------------------------"
if [ -z "$EXIT_STATUS" ]; then
  echo "✅ Tous les prérequis sont satisfaits. Vous pouvez utiliser les commandes de sauvegarde."
  echo "   - npm run db:backup   : Sauvegarder la base de données"
  echo "   - npm run db:restore  : Restaurer la base de données"
  echo "   - npm run db:auto-backup : Configurer une sauvegarde automatique"
  exit 0
else
  echo "❌ Certains prérequis ne sont pas satisfaits. Veuillez corriger les problèmes ci-dessus."
  exit 1
fi 