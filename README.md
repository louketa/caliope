# CALIOPE

"Sua voz no mundo": plataforma de autopublicação de escritos curtos (estilo Pinterest). PWA mobile-first, bilíngue PT/ES.
Começa por **aforismos** e **romances** (prévia + link externo); poesia, contos, cordéis e letras aparecem como "em breve".

## Estrutura

```
CALIOPE/
├── backend/            Laravel 13 (API + login por sessão via Sanctum)
├── frontend/           React 19 + Vite + PWA
├── docker/             Caddyfile, php.ini e entrypoint da imagem
├── Dockerfile          build do front + imagem FrankenPHP (Caddy + PHP)
├── docker-compose.yml  app (porta 80/443) + Postgres 17
└── scripts/backup.sh   dump diário do banco
```

Um container só (`app`) serve tudo no mesmo domínio: o React em `/`, a API em `/api`. O HTTPS (Let's Encrypt) é automático.

## Subir na VPS

Pré-requisitos: Docker + plugin compose, portas 80 e 443 abertas, e o domínio `caliopevox.com` com registro DNS **A** apontando para o IP da VPS.

```bash
git clone <repo> /opt/caliope && cd /opt/caliope
cp .env.example .env
# DOMAIN já vem como caliopevox.com; gere as chaves:
echo "APP_KEY=base64:$(openssl rand -base64 32)" >> .env
echo "DB_PASSWORD=$(openssl rand -hex 24)" >> .env
# (apague as linhas APP_KEY= e DB_PASSWORD= vazias que vieram do exemplo)
docker compose up -d --build
docker compose logs -f app   # migrations, seed e emissão do certificado
```

A cada start o container roda as migrations e o seed (idempotente) sozinho.

**Atualizar:** `git pull && docker compose up -d --build`

**Backup:** `./scripts/backup.sh` (agende no cron; instrução no próprio arquivo).
Restaurar: `gunzip -c backups/<arquivo>.sql.gz | docker compose exec -T db psql -U caliope -d caliope`

> Não troque `APP_KEY` depois de subir: derruba todas as sessões. `DB_PASSWORD` só vale na criação do volume do banco.

## Desenvolvimento

```bash
# 1) API + banco no Docker em http://localhost:8080
cat > .env <<'ENV'
DOMAIN=localhost:8080
SERVER_NAME=:80
APP_URL=http://localhost:8080
SESSION_SECURE_COOKIE=false
SANCTUM_STATEFUL_DOMAINS=localhost:8080,localhost:5173
ENV
echo "APP_KEY=base64:$(openssl rand -base64 32)" >> .env
echo "DB_PASSWORD=dev" >> .env
# na porta 8080 em vez de 80: crie docker-compose.override.yml com
#   services: { app: { ports: !override ["8080:80"] } }
docker compose up -d --build

# 2) Front com hot reload em http://localhost:5173 (proxy de /api para :8080)
cd frontend && npm install && npm run dev
```

**Testes da API** (Pest, dentro do Docker): `docker compose --profile test run --rm test`

## API

| Método | Rota | Auth | O quê |
|---|---|---|---|
| POST | `/api/register` | — | cria conta (nome, e-mail, senha ≥ 8) e já loga |
| POST | `/api/login` | — | entra (10 tentativas/min por IP) |
| POST | `/api/logout` | sim | sai |
| GET | `/api/me` | sim | usuário logado |
| GET | `/api/posts?kind=&lang=` | sim | feed: destaques primeiro, depois mais novos (até 200) |
| POST | `/api/posts` | sim | publica; autor é sempre o usuário logado |
| POST | `/api/posts/{id}/like` | sim | curte/descurte (1 por usuário) |

Login é por cookie de sessão (Sanctum SPA), com proteção CSRF. Só funciona a partir do próprio domínio do app.

## Pendências conhecidas

- **Destaque** ainda é só uma caixa de seleção (sem pagamento): qualquer autor pode destacar a própria obra.
- Sem "esqueci minha senha" (precisa de um servidor de e-mail SMTP).

## Paleta

| Uso | Cor |
|---|---|
| Fundo | `#100c09` |
| Laranja (logo, botão de escrever) | `#f38634` |
| Dourado (botão, abas) | `#d9af75` |

O logo em `frontend/public/logo-mark.svg` é uma reprodução; trocar pelo arquivo original do Lovable e rodar `frontend/scripts/icons.sh` (precisa de `rsvg-convert`).
