#!/bin/bash
# AfriRide PostgreSQL/PostGIS Backup Script
# Meant to be executed via cron job (e.g., daily at 2 AM)

set -e

BACKUP_DIR="/var/backups/afriride"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILE_NAME="afriride_db_backup_$DATE.sql.gz"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "Starting database backup at $DATE..."

# Execute pg_dump inside the running Docker container, compress it, and save to host
docker exec -t afriride_db_prod pg_dump -U afriride_admin -d afriride -F c | gzip > "$BACKUP_DIR/$FILE_NAME"

echo "Backup completed successfully: $BACKUP_DIR/$FILE_NAME"

# Clean up backups older than retention period
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "Cleanup finished."
