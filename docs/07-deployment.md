# ERP Portal — Live Deployment (Hostinger VPS) — as executed

> This is the **actual, as-run** deployment of the ERP Portal to the Hostinger VPS,
> serving **https://erp.buildnweb.in** (frontend) + **https://api.erp.buildnweb.in** (API).
> Generic/templated version: [06-deployment.md](06-deployment.md).

## Result

| Piece | URL / value |
|---|---|
| Frontend (Next.js, PM2 `erp-web`, :8001) | https://erp.buildnweb.in |
| API (NestJS, PM2 `erp-api`, :8000) | https://api.erp.buildnweb.in |
| Database | Supabase Postgres (remote — nothing hosted on the VPS) |
| Server | Hostinger VPS `187.127.130.218`, Ubuntu (questing), root login |
| Repo path on server | `/root/ERP-Portal` |
| TLS | Let's Encrypt (certbot), auto-renew, expires 2026-08-30 |

**Architecture:** the frontend is **client-side** — the browser calls the API directly.
So the API must be reachable over **HTTPS** (a plain-HTTP API would be blocked as mixed
content from an HTTPS page). That's why the API gets its own HTTPS subdomain.

```
Browser ──https──▶ nginx :443
                     ├─ erp.buildnweb.in      → 127.0.0.1:8001 (Next.js / erp-web)
                     └─ api.erp.buildnweb.in  → 127.0.0.1:8000 (NestJS / erp-api) ──▶ Supabase
```

---

## 0. DNS (Hostinger → Domains → DNS / Nameservers)

The base domain is `buildnweb.in`. An `api` A-record already existed (another app), so the
ERP API uses `api.erp` to avoid a clash. Added **two A records**:

| Type | Name | Value | TTL |
|------|--------|-----------------|-------|
| A | `erp` | `187.127.130.218` | 14400 |
| A | `api.erp` | `187.127.130.218` | 14400 |

→ `erp.buildnweb.in` (frontend) and `api.erp.buildnweb.in` (API).

Verify before requesting SSL:
```bash
dig erp.buildnweb.in +short        # 187.127.130.218
dig api.erp.buildnweb.in +short    # 187.127.130.218
```

---

## 1. One-time server setup

SSH in (`ssh root@187.127.130.218`), then:

```bash
apt update && apt -y install nginx git curl ufw
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt -y install nodejs                              # Node 20.x
corepack enable && corepack prepare pnpm@9.9.0 --activate
npm i -g pm2
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
```

(nginx/git/curl/ufw were already present; Node was upgraded to 20.20.x. A "pending kernel
upgrade" notice is informational — reboot at your convenience, not required for deploy.)

---

## 2. Get the code

```bash
cd /root
git clone https://github.com/Sanjay-Balam/ERP-Portal.git
cd ERP-Portal && pnpm install
```

> Cloned into `/root` (alongside the existing `Real-Chess` app). If you use `/var/www`
> instead, change the `cd` paths in steps 4–5 accordingly.

---

## 3. Environment files

```bash
DOMAIN=erp.buildnweb.in
EMAIL=admin@buildnweb.in

cat > apps/api/.env <<EOF
DATABASE_URL="postgresql://postgres:SanjayNani%400701@db.udqihejftkzknzqrlsfh.supabase.co:5432/postgres"
JWT_SECRET="dev-secret-change-me"
PORT=8000
WEB_ORIGIN="https://$DOMAIN"
EOF

cat > apps/web/.env <<EOF
NEXT_PUBLIC_API_URL="https://api.$DOMAIN"
EOF
chmod 600 apps/api/.env apps/web/.env
```

Notes:
- `WEB_ORIGIN` is the CORS allow-origin for the API; must equal the site origin.
- `NEXT_PUBLIC_API_URL` is **baked into the web build** — set it before building.
- `JWT_SECRET` is currently the dev value `dev-secret-change-me` (weak, in repo history).
  **Rotate it** post-launch: `openssl rand -base64 48` → update `apps/api/.env` →
  `pm2 restart erp-api` (all users must re-login).
- The old `AUTH_SECRET` / `NEXTAUTH_URL` vars are dead (app is client-side JWT now) — omitted.

---

## 4. Build

```bash
cd /root/ERP-Portal
pnpm --filter @erp/types build      # shared types package (build first — others import it)
pnpm --filter api db:generate       # prisma client
pnpm --filter api build             # -> apps/api/dist
pnpm --filter web build             # -> apps/web/.next  (NEXT_PUBLIC_API_URL baked in here)
```

(DB schema is already live on Supabase. If it weren't: `pnpm --filter api db:push`.)

> If the web build is `Killed` (OOM on a small VPS), add swap once then re-run the web build:
> ```bash
> fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
> ```
> (Not needed on this box — build succeeded directly.)

---

## 5. Run with PM2

```bash
cd /root/ERP-Portal/apps/api && pm2 start "node dist/main.js" --name erp-api
cd /root/ERP-Portal/apps/web && pm2 start "pnpm start" --name erp-web
pm2 save
pm2 startup systemd          # prints a command — run it, then `pm2 save` again
```

`pm2 startup systemd` installed `/etc/systemd/system/pm2-root.service` so both apps
resurrect on reboot.

Local smoke test:
```bash
pm2 status                                                       # both online
curl -s -o /dev/null -w '%{http_code}\n' localhost:8000/dashboard  # 401 = API up
curl -I localhost:8001                                            # 200 = web up
```

---

## 6. nginx reverse proxy

```bash
DOMAIN=erp.buildnweb.in
cat > /etc/nginx/sites-available/erp <<EOF
server {
  listen 80;
  server_name $DOMAIN;
  location / {
    proxy_pass http://127.0.0.1:8001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
  }
}
server {
  listen 80;
  server_name api.$DOMAIN;
  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF
ln -sf /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/erp
nginx -t && systemctl reload nginx
```

> The default site / other apps (chess, docmost) on this nginx were left untouched —
> only the `erp` server blocks were added.

---

## 7. HTTPS (Let's Encrypt)

Only after both `dig` checks (§0) return the VPS IP:

```bash
DOMAIN=erp.buildnweb.in
EMAIL=admin@buildnweb.in
apt -y install certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN -d api.$DOMAIN --redirect -m $EMAIL --agree-tos --no-eff-email
```

certbot issued one cert covering both names, rewrote the nginx blocks for :443, added the
HTTP→HTTPS redirect, and scheduled auto-renewal.
- Cert: `/etc/letsencrypt/live/erp.buildnweb.in/`
- Expires 2026-08-30, auto-renews.

---

## 8. Verify

```bash
curl -s -o /dev/null -w 'web:   %{http_code}\n' https://erp.buildnweb.in              # 200
curl -s -o /dev/null -w 'api:   %{http_code}\n' https://api.erp.buildnweb.in/dashboard # 401
curl -s -X POST https://api.erp.buildnweb.in/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"b.sanjay0701@gmail.com","password":"Test@123"}' \
  -o /dev/null -w 'login: %{http_code}\n'                                              # 201
```

Then open **https://erp.buildnweb.in** → log in (`b.sanjay0701@gmail.com` / `Test@123`).
DevTools → Network shows calls hitting `https://api.erp.buildnweb.in`.

---

## 9. Redeploy after code changes

```bash
cd /root/ERP-Portal
git pull
pnpm install
pnpm --filter @erp/types build
pnpm --filter api db:generate          # only if schema changed
pnpm --filter api build
pnpm --filter web build
pm2 restart erp-api erp-web
```

If the Prisma schema changed: also `pnpm --filter api db:push` (pushes to Supabase) before
restarting.

---

## 10. Operations cheatsheet

```bash
pm2 status                       # process state
pm2 logs erp-api                 # API logs
pm2 logs erp-web                 # web logs
pm2 restart erp-api erp-web      # restart both
systemctl reload nginx           # after nginx config edits
certbot renew --dry-run          # test TLS renewal
```

---

## 11. Security checklist (post-launch)

- [ ] **Rotate `JWT_SECRET`** off `dev-secret-change-me` → `openssl rand -base64 48`,
      update `apps/api/.env`, `pm2 restart erp-api`.
- [ ] **Rotate the root password** that was shared in plaintext (`passwd`); prefer SSH keys
      + disable `PasswordAuthentication` in `/etc/ssh/sshd_config`.
- [ ] **Rotate the Supabase DB password** (shared in plaintext) and update `DATABASE_URL`.
- [ ] `.env` files are `chmod 600`, never committed.
- [ ] `ufw` enabled; only 22/80/443 open.
- [ ] JWT is in browser `localStorage` (client-side model) — keep deps patched vs XSS.

---

## 12. Troubleshooting

| Symptom | Check |
|---|---|
| 502 Bad Gateway | PM2 process down — `pm2 logs`. Wrong upstream port in nginx. |
| CORS error in browser | `WEB_ORIGIN` (api `.env`) must equal `https://erp.buildnweb.in`; `pm2 restart erp-api`. |
| Mixed-content blocked | `NEXT_PUBLIC_API_URL` must be **https** + web rebuilt after setting it. |
| 401 everywhere | `JWT_SECRET` changed/mismatch, or token expired — re-login. |
| certbot fails | DNS A records not propagated — re-check `dig`. |
| Login works, data calls fail | DevTools Network → confirm calls hit `https://api.erp.buildnweb.in`. |
| Apps gone after reboot | `pm2 resurrect` / ensure `pm2-root.service` enabled (`systemctl status pm2-root`). |
