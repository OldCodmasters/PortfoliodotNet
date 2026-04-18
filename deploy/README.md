# Deploy

Production deployment to a Linux VPS (tested on **Ubuntu 24.04 LTS**).

## Topology

```
Internet
  │
  ├──▶ :443 Caddy 2  ──┬──▶ 127.0.0.1:3000  Next.js  (systemd: portfolio-web)
  │                    └──▶ 127.0.0.1:5080  .NET API (systemd: portfolio-api)
  │
  └──▶ :80  Caddy 2  (HTTP→HTTPS redirect + ACME HTTP-01)
```

- **amindehghani.me / www.amindehghani.me** → Next.js
- **api.amindehghani.me** → .NET API
- TLS certs auto-obtained by Caddy from Let's Encrypt the first time a request hits each hostname.

## Files

| File | Purpose |
|---|---|
| `Caddyfile` | Reverse proxy + auto-HTTPS |
| `portfolio-api.service` | systemd unit for the .NET API |
| `portfolio-web.service` | systemd unit for Next.js |
| `bootstrap.sh` | One-shot server setup — run **once as root** on a fresh VM |
| `deploy.sh` | Repeatable redeploy — pulls main, rebuilds, restarts services |

## One-time bootstrap

Fresh VM, root login:

```bash
curl -fsSL https://raw.githubusercontent.com/OldCodmasters/PortfoliodotNet/main/deploy/bootstrap.sh | bash
```

The bootstrap script:
1. Installs .NET 10 SDK, Node 22, Caddy 2, ufw
2. Creates a `deploy` user with scoped passwordless `sudo` for service restarts
3. Clones the repo to `/opt/portfolio/src`
4. Installs the Caddyfile and the two systemd units
5. Runs the first build via `deploy.sh --no-pull`
6. Enables and starts `portfolio-api`, `portfolio-web`, `caddy`

After bootstrap finishes, point DNS at the server (see below) and TLS will be issued on the first request.

## Redeploy

Any time a new version is pushed to `main`:

```bash
# from the server
sudo -u deploy bash /opt/portfolio/src/deploy/deploy.sh
```

This pulls `main`, rebuilds both apps, and restarts the two services. Caddy keeps running.

## DNS

At the domain registrar, create:

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `@` | `<server-IP>` | 300 |
| A | `www` | `<server-IP>` | 300 |
| A | `api` | `<server-IP>` | 300 |

Wait for DNS to propagate (`dig +short amindehghani.me` from your laptop should return the server IP). Caddy will issue certs within a minute of the first request to each hostname.

## Useful commands on the server

```bash
# logs
journalctl -u portfolio-api -f
journalctl -u portfolio-web -f
journalctl -u caddy -f

# manual restart
sudo systemctl restart portfolio-api portfolio-web
sudo systemctl reload caddy

# health check
curl -sI https://api.amindehghani.me/api/content
curl -sI https://amindehghani.me
```

## Paths on the server

```
/opt/portfolio/
├── api/              # dotnet publish output (runtime)
└── src/              # cloned repo (build workspace)
    ├── backend/
    ├── frontend/
    │   ├── .next/    # next build output
    │   └── node_modules/
    └── deploy/       # you are here
```

## Hardening checklist (after first successful deploy)

- [ ] Add your SSH public key to `/root/.ssh/authorized_keys` (and to `/home/deploy/.ssh/authorized_keys`)
- [ ] Disable password SSH login: set `PasswordAuthentication no` in `/etc/ssh/sshd_config.d/90-no-password.conf`, then `systemctl reload ssh`
- [ ] Change the root password in Vultr's panel (the one used for first bootstrap)
- [ ] Install `fail2ban` if you keep SSH on port 22
- [ ] Enable Vultr auto-backups ($2.40/mo) once the site is stable
