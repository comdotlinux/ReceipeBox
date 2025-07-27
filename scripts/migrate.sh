#!/bin/bash
set -e

echo "Starting database migration..."

# Wait for PocketBase to be ready
until curl -f http://localhost:8090/api/health; do
  echo "Waiting for PocketBase to be ready..."
  sleep 5
done

echo "PocketBase is ready. Running migrations..."

# Copy migration files
docker cp ./pocketbase/pb_migrations/ myrecipebox-pocketbase:/pb_migrations/

# Run migrations
docker exec myrecipebox-pocketbase /usr/local/bin/pocketbase migrate

echo "Migration completed successfully!"