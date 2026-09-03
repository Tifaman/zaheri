# Hosting ZaHeri

Production target: a **Verpex VPS** (plain Ubuntu, root SSH) running the API in
Docker behind Nginx, with the frontend served as static files by Nginx.

Verpex's shared/cPanel "Node.js hosting" is **not** suitable — it has no
WebSocket support and no Redis, and ZaHeri's backend needs both (Socket.IO for
the real-time queue, BullMQ for jobs). Use a **VPS** plan (root access, plain
Linux) instead.

## Managed services (already provisioned)

- **Postgres** — [Neon](https://neon.com). Project `little-tree-40380610` (org
  `zaheri`), branch `production`. Managed via the `neon` CLI and `neon.ts` in
  this repo (`neon deploy` applies branch policy; it does not run migrations).
- **Redis** — Redis Cloud. Used for BullMQ and the Socket.IO Redis adapter.

Both connection strings live in `apps/api/.env` (gitignored, never committed).
The VPS needs its own copy of this file with production values — see below.

## 0. Plan choice

Verpex VPS-D4 (2 vCPU / 4GB RAM / 80GB NVMe) or higher, Ubuntu 24.04 LTS, no
control panel.

## 1. DNS

Point these at the VPS's IP once Verpex assigns one:

- `A` record: `yourdomain.com` → VPS IP (frontend)
- `A` record: `api.yourdomain.com` → VPS IP (backend)

Two separate origins, same pattern as local dev: the frontend calls the API
cross-origin via `VITE_API_BASE_URL`, and the API allows it via `CORS_ORIGIN`.

## 2. Initial server setup (SSH in as root)

```bash
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx ufw

ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable

adduser deploy && usermod -aG docker,sudo deploy
```

## 3. Get the code onto the server

```bash
su - deploy
git clone https://github.com/Tifaman/zaheri.git
cd zaheri
```

## 4. Backend: `docker-compose.prod.yml`

Already in the repo root — builds `apps/api/Dockerfile` as-is. No self-hosted
Postgres/Redis containers; both are external managed services.

Create `apps/api/.env` on the server (copy `.env.example`, fill in real values
— **do not** reuse local dev secrets):

- `DATABASE_URL` — Neon connection string
- `REDIS_URL` — Redis Cloud connection string
- `JWT_SECRET`, `RECEIPT_SIGNING_KEY` — generate fresh with `openssl rand -hex 32`
- `CORS_ORIGIN=https://yourdomain.com`
- `PORT=3000` (matches the Dockerfile's `EXPOSE 3000` and the Nginx proxy below —
  differs from local dev's `PORT=3001`)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Migrations run automatically on container start (`prisma migrate deploy` in
the Dockerfile's `CMD`, idempotent and safe to repeat on every redeploy).

## 5. Frontend build

```bash
corepack enable
VITE_API_BASE_URL=https://api.yourdomain.com pnpm --filter @zaheri/web... run build
sudo mkdir -p /var/www/zaheri-web
sudo cp -r apps/web/dist/* /var/www/zaheri-web/
```

## 6. Nginx — frontend (SPA)

`/etc/nginx/sites-available/zaheri-web`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/zaheri-web;
    index index.html;
    location / { try_files $uri /index.html; }
}
```

## 7. Nginx — backend (API + WebSocket upgrade for Socket.IO)

`/etc/nginx/sites-available/zaheri-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/zaheri-web /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/zaheri-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 8. SSL

```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## 9. Redeploys

```bash
cd zaheri && git pull
docker compose -f docker-compose.prod.yml up -d --build              # backend
pnpm --filter @zaheri/web... run build && sudo cp -r apps/web/dist/* /var/www/zaheri-web/  # frontend
```

## Rejected alternatives

- **Vercel / Render** — dropped; see git history (`render.yaml`, `vercel.json`
  removed).
- **Firebase Hosting + Cloud Run** — viable but needs `gcloud` + a GCP billing
  account; not pursued.
- **Wasmer.io (Anybuild)** — build failed: its auto-detector only scans the
  repo root, and this is a pnpm monorepo (no `start` script/entry file at the
  root — the real app is in `apps/api`). Even with that fixed, Wasmer's WASM/
  WASIX runtime is uncertain for Prisma's native query-engine binary and
  persistent Socket.IO/BullMQ connections — not pursued further.
