#!/bin/bash
set -e

BACKUP_DIR="/opt/myrecipebox/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="myrecipebox_backup_$DATE"

mkdir -p $BACKUP_DIR

echo "Creating backup: $BACKUP_NAME"

# Create temporary container to backup Docker volumes
echo "Backing up PocketBase data volume..."
docker run --rm \
  -v myrecipebox_pocketbase_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/pocketbase_data_$DATE.tar.gz -C /data .

echo "Backing up PocketBase uploads volume..."
docker run --rm \
  -v myrecipebox_pocketbase_public:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/pocketbase_uploads_$DATE.tar.gz -C /data .

# Backup configuration files
echo "Backing up configuration files..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
  .env.production \
  docker-compose.prod.yml \
  scripts/

echo "All backups created:"
echo "- Database: $BACKUP_DIR/pocketbase_data_$DATE.tar.gz"
echo "- Uploads: $BACKUP_DIR/pocketbase_uploads_$DATE.tar.gz" 
echo "- Config: $BACKUP_DIR/config_$DATE.tar.gz"

# Keep only last 7 backups
find $BACKUP_DIR -name "*_backup_*.tar.gz" -type f -mtime +7 -delete
find $BACKUP_DIR -name "pocketbase_*.tar.gz" -type f -mtime +7 -delete
find $BACKUP_DIR -name "config_*.tar.gz" -type f -mtime +7 -delete

echo "Cleanup completed. Backup finished successfully!"