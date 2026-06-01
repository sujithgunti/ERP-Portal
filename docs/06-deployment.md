# ERP Portal — Deployment Guide (Hostinger VPS)

> **Target:** Hostinger VPS (Ubuntu), root or sudo user.
> **Apps:** `apps/api` (NestJS :8000) + `apps/web` (Next.js :8001), behind nginx + HTTPS.
> **DB:** Supabase Postgres (already remote — nothing to host).
> Replace `DOMAIN` with your real domain throughout (e.g. `verdanterp.com`).

---

## 0. Architecture on the VPS

```
                         ┌──────── nginx (:80/:443, SSL) ────────┐
  Browser ──https──▶     │  DOMAIN          → 127.0.0.1:8001 (web)│
                         │  api.DOMAIN      → 127.0.0.1:8000 (api)│
                         └───────────────────────────────────────┘
                                   │ web (Next.js, PM2)
                                   │ api (NestJS, PM2) ──▶ Supabase Postgres
```

**Critical:** the frontend now calls the API **from the browser** (client-side). So the API must be publicly reachable over **HTTPS** — a plain-HTTP API would be blocked as mixed content. That's why the API gets its own HTTPS subdomain `api.DOMAIN`.

**DNS (do this first, at your registrar / Hostinger DNS):**
| Type | Name | Value |
|------|------|-------|
| A | `@` (DOMAIN) | `187.127.130.218` |
| A | `api` | `187.127.130.218` |

Wait for propagation (`dig DOMAIN +short` → VPS IP) before running certbot.

---

## 1. One-time server setup

SSH in (`ssh root@187.127.130.218`), then:

```bash
# system
apt update && apt -y upgrade
apt -y install nginx git curl ufw

# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt -y install nodejs
corepack enable && corepack prepare pnpm@9.9.0 --activate

# process manager
npm i -g pm2

# firewall
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
```

---

## 2. Get the code

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/Sanjay-Balam/ERP-Portal.git
cd ERP-Portal
pnpm install
```

---

## 3. Environment files

**`apps/api/.env`** (never committed):
```
DATABASE_URL="postgresql://postgres:SanjayNani%400701@db.udqihejftkzknzqrlsfh.supabase.co:5432/postgres"
JWT_SECRET="<strong-random-secret>"
PORT=8000
WEB_ORIGIN="https://DOMAIN"
```

**`apps/web/.env`**:
```
NEXT_PUBLIC_API_URL="https://api.DOMAIN"
```

> Generate a secret: `openssl rand -base64 48`. `WEB_ORIGIN` must match the site origin for CORS. `NEXT_PUBLIC_API_URL` is **baked into the web build** — set it before `pnpm build`.

---

## 4. Build

```bash
cd /var/www/ERP-Portal
pnpm --filter api db:generate          # prisma client
pnpm --filter api build                # -> apps/api/dist
pnpm --filter web build                # -> apps/web/.next
```

(DB schema already live on Supabase. If not: `pnpm --filter api db:push`.)

---

## 5. Run with PM2

```bash
cd /var/www/ERP-Portal/apps/api && pm2 start "node dist/main.js" --name erp-api
cd /var/www/ERP-Portal/apps/web && pm2 start "pnpm start" --name erp-web
pm2 save
pm2 startup systemd        # run the printed command to enable boot-start
```

Check: `pm2 status`, `pm2 logs erp-api`, `pm2 logs erp-web`.
Local smoke: `curl localhost:8000/dashboard` (401 = up), `curl localhost:8001` (HTML).

---

## 6. nginx reverse proxy

`/etc/nginx/sites-available/erp` :

```nginx
# Frontend — DOMAIN
server {
  listen 80;
  server_name DOMAIN www.DOMAIN;
  location / {
    proxy_pass http://127.0.0.1:8001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}

# Backend API — api.DOMAIN
server {
  listen 80;
  server_name api.DOMAIN;
  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
ln -s /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/erp
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 7. HTTPS (Let's Encrypt)

```bash
apt -y install certbot python3-certbot-nginx
certbot --nginx -d DOMAIN -d www.DOMAIN -d api.DOMAIN --redirect -m you@DOMAIN --agree-tos
```

Certbot rewrites the nginx blocks for 443 + auto-renews (`certbot renew --dry-run`).

After SSL is live, confirm `NEXT_PUBLIC_API_URL=https://api.DOMAIN`, then **rebuild web** (`pnpm --filter web build`) and `pm2 restart erp-web` so the HTTPS API URL is baked in.

---

## 8. Deploying updates

```bash
cd /var/www/ERP-Portal
git pull
pnpm install
pnpm --filter api db:generate
pnpm --filter api build && pnpm --filter web build
pm2 restart erp-api erp-web
```

(Optional: put this in `scripts/deploy.sh`.)

---

## 9. Security checklist

- [ ] **Rotate the root password** that was shared in plaintext (`passwd`), or disable root password login.
- [ ] Create a non-root sudo deploy user; use SSH keys, disable `PasswordAuthentication` in `/etc/ssh/sshd_config`.
- [ ] `.env` files are `chmod 600`, never committed.
- [ ] `JWT_SECRET` is a fresh strong random value (not the dev `dev-secret-change-me`).
- [ ] Rotate the **Supabase DB password** if it was shared; consider a least-privilege DB role.
- [ ] `ufw` enabled; only 22/80/443 open.
- [ ] Reminder: the JWT is stored in the browser's `localStorage` (client-side model) — keep dependencies patched against XSS.

---

## 10. Troubleshooting

| Symptom | Check |
|---|---|
| 502 Bad Gateway | PM2 process down — `pm2 logs`. Wrong port in nginx. |
| CORS error in browser | `WEB_ORIGIN` (api `.env`) must equal `https://DOMAIN`; restart `erp-api`. |
| Mixed content blocked | `NEXT_PUBLIC_API_URL` must be **https** and web rebuilt after setting it. |
| 401 everywhere | `JWT_SECRET` mismatch / not set; token expired (re-login). |
| certbot fails | DNS A records not propagated yet — `dig DOMAIN +short`. |
| Login works but API calls fail | Open DevTools Network — confirm calls hit `https://api.DOMAIN`. |
```
