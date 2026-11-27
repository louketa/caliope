#!/bin/sh
# Dump compactado do Postgres em ./backups (mantém os últimos 14). Agende no cron da VPS, ex.:
# 0 3 * * * cd /opt/caliope && ./scripts/backup.sh >> backups/backup.log 2>&1
set -e
cd "$(dirname "$0")/.."
mkdir -p backups
file="backups/caliope-$(date +%Y%m%d-%H%M%S).sql.gz"
docker compose exec -T db pg_dump -U caliope -d caliope --clean --if-exists | gzip > "$file"
ls -1t backups/caliope-*.sql.gz | tail -n +15 | xargs -r rm --
echo "ok: $file"
