#!/bin/sh
set -e

if [ -z "$APP_KEY" ]; then
    echo "APP_KEY vazio. Gere com: echo \"base64:$(openssl rand -base64 32)\"" >&2
    exit 1
fi

# Espera o Postgres aceitar conexões (até ~60s)
tries=0
until php -r 'new PDO("pgsql:host=".getenv("DB_HOST").";port=".getenv("DB_PORT").";dbname=".getenv("DB_DATABASE"), getenv("DB_USERNAME"), getenv("DB_PASSWORD"));' 2>/dev/null; do
    tries=$((tries + 1))
    if [ "$tries" -ge 30 ]; then
        echo "Postgres não respondeu." >&2
        exit 1
    fi
    sleep 2
done

php artisan migrate --force
php artisan db:seed --force
php artisan optimize
chown -R www-data:www-data storage bootstrap/cache

exec "$@"
