#!/bin/bash
set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <backup_date>"
    echo "Example: $0 20240127_143022"
    echo ""
    echo "Available backups:"
    ls -la /opt/myrecipebox/backups/pocketbase_data_*.tar.gz 2>/dev/null | awk '{print $9}' | sed 's/.*pocketbase_data_//' | sed 's/.tar.gz//' || echo "No backups found"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="/opt/myrecipebox/backups"

echo "Restoring backup from date: $BACKUP_DATE"

# Check if backup files exist
if [ ! -f "$BACKUP_DIR/pocketbase_data_$BACKUP_DATE.tar.gz" ]; then
    echo "Error: Database backup file not found: $BACKUP_DIR/pocketbase_data_$BACKUP_DATE.tar.gz"
    exit 1
fi

if [ ! -f "$BACKUP_DIR/pocketbase_uploads_$BACKUP_DATE.tar.gz" ]; then
    echo "Error: Uploads backup file not found: $BACKUP_DIR/pocketbase_uploads_$BACKUP_DATE.tar.gz"
    exit 1
fi

# Stop services
echo "Stopping services..."
docker-compose -f docker-compose.prod.yml down

# Restore data volume
echo "Restoring PocketBase data volume..."
docker run --rm \
  -v myrecipebox_pocketbase_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine sh -c "cd /data && rm -rf * && tar xzf /backup/pocketbase_data_$BACKUP_DATE.tar.gz"

# Restore uploads volume  
echo "Restoring PocketBase uploads volume..."
docker run --rm \
  -v myrecipebox_pocketbase_public:/data \
  -v $BACKUP_DIR:/backup \
  alpine sh -c "cd /data && rm -rf * && tar xzf /backup/pocketbase_uploads_$BACKUP_DATE.tar.gz"

# Restore config if exists
if [ -f "$BACKUP_DIR/config_$BACKUP_DATE.tar.gz" ]; then
    echo "Restoring configuration files..."
    tar -xzf "$BACKUP_DIR/config_$BACKUP_DATE.tar.gz"
fi

# Start services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "Restore completed successfully!"
echo "Please verify that services are running correctly:"
echo "docker-compose -f docker-compose.prod.yml ps"