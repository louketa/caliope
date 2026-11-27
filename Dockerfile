# syntax=docker/dockerfile:1

# 1) Front-end: React build (vira arquivos estáticos em public/ do Laravel)
FROM node:24-alpine AS frontend
WORKDIR /front
COPY frontend/package.json frontend/package-lock.json frontend/.npmrc ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) Base PHP: FrankenPHP (Caddy + PHP num binário só, HTTPS automático)
FROM dunglas/frankenphp:1-php8.4-alpine AS base
RUN install-php-extensions pdo_pgsql intl opcache pcntl
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app

# 3) Imagem de testes (com dependências de dev); usada só pelo serviço "test"
FROM base AS test
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY backend/ ./
RUN cp .env.example .env && composer dump-autoload --optimize && php artisan package:discover
CMD ["./vendor/bin/pest"]

# 4) Imagem de produção
FROM base AS production
ENV APP_ENV=production APP_DEBUG=false LOG_CHANNEL=stderr
RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php.ini "$PHP_INI_DIR/conf.d/zz-caliope.ini"
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY backend/ ./
COPY --from=frontend /front/dist/ ./public/
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev \
    && php artisan package:discover \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache
COPY docker/Caddyfile /etc/frankenphp/Caddyfile
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/caliope-entrypoint
EXPOSE 80 443 443/udp
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD wget -q --spider http://127.0.0.1:2019/config/ || exit 1
ENTRYPOINT ["caliope-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile"]
