#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Portfolio server bootstrap — one-shot, run as root on a fresh
# Ubuntu 24.04 LTS VM. Safe to re-run; idempotent where trivial.
#
#   Installs: .NET 10 SDK, Node 22, Caddy 2, git, ufw
#   Creates:  /opt/portfolio  and a "deploy" user
#   Configures: firewall (22/80/443), systemd services, Caddy reverse proxy
#   First deploy: clones the GitHub repo, builds both apps, starts services
#
# Usage (on the server, as root):
#   curl -fsSL https://raw.githubusercontent.com/OldCodmasters/PortfoliodotNet/main/deploy/bootstrap.sh | bash
# ---------------------------------------------------------------------------
set -euo pipefail

DOMAIN="amindehghani.me"
API_DOMAIN="api.amindehghani.me"
REPO_URL="https://github.com/OldCodmasters/PortfoliodotNet.git"
DEPLOY_USER="deploy"
APP_ROOT="/opt/portfolio"
LOG=/var/log/portfolio-bootstrap.log

exec > >(tee -a "$LOG") 2>&1
echo "=== portfolio bootstrap — $(date -u) ==="

# --- sanity ----------------------------------------------------------------
if [[ $EUID -ne 0 ]]; then
	echo "error: run as root (try: sudo bash bootstrap.sh)"
	exit 1
fi
. /etc/os-release
if [[ "${VERSION_ID:-}" != "24.04" ]]; then
	echo "warn: expected Ubuntu 24.04 (noble), got ${VERSION_ID:-unknown}. Continuing."
fi

# --- apt basics ------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y curl wget gnupg ca-certificates lsb-release \
	git ufw rsync debian-keyring debian-archive-keyring apt-transport-https

# --- firewall --------------------------------------------------------------
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# --- .NET 10 SDK (build + runtime) -----------------------------------------
if ! command -v dotnet >/dev/null 2>&1; then
	wget -qO /tmp/ms.asc https://packages.microsoft.com/keys/microsoft.asc
	gpg --dearmor </tmp/ms.asc >/usr/share/keyrings/microsoft.gpg
	echo "deb [signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/24.04/prod noble main" \
		>/etc/apt/sources.list.d/microsoft-prod.list
	apt-get update
	apt-get install -y dotnet-sdk-10.0
fi
dotnet --info | head -3

# --- Node 22 ---------------------------------------------------------------
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1)" != "v22" ]]; then
	curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
	apt-get install -y nodejs
fi
node -v
npm -v

# --- Caddy 2 ---------------------------------------------------------------
if ! command -v caddy >/dev/null 2>&1; then
	curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
		| gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
	curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
		>/etc/apt/sources.list.d/caddy-stable.list
	apt-get update
	apt-get install -y caddy
fi
caddy version

# --- deploy user -----------------------------------------------------------
if ! id -u "$DEPLOY_USER" >/dev/null 2>&1; then
	useradd -m -s /bin/bash "$DEPLOY_USER"
fi
# passwordless sudo for the two service restarts + Caddy reload
cat >/etc/sudoers.d/90-portfolio-deploy <<'EOF'
deploy ALL=(root) NOPASSWD: /bin/systemctl restart portfolio-api
deploy ALL=(root) NOPASSWD: /bin/systemctl restart portfolio-web
deploy ALL=(root) NOPASSWD: /bin/systemctl reload caddy
EOF
chmod 440 /etc/sudoers.d/90-portfolio-deploy

# --- /opt/portfolio layout -------------------------------------------------
mkdir -p "$APP_ROOT"/{api,src}
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_ROOT"

# --- clone / update repo (as deploy) ---------------------------------------
sudo -u "$DEPLOY_USER" bash <<EOSU
set -e
cd "$APP_ROOT"
if [[ ! -d src/.git ]]; then
	git clone "$REPO_URL" src
else
	cd src && git fetch origin && git reset --hard origin/main
fi
EOSU

# --- copy systemd units + Caddyfile ----------------------------------------
install -m 0644 "$APP_ROOT/src/deploy/portfolio-api.service" /etc/systemd/system/
install -m 0644 "$APP_ROOT/src/deploy/portfolio-web.service" /etc/systemd/system/

mkdir -p /etc/caddy /var/log/caddy
install -m 0644 "$APP_ROOT/src/deploy/Caddyfile" /etc/caddy/Caddyfile
chown -R caddy:caddy /var/log/caddy || true

systemctl daemon-reload

# --- first deploy (build backend + frontend) ------------------------------
sudo -u "$DEPLOY_USER" bash "$APP_ROOT/src/deploy/deploy.sh" --no-pull

# --- enable + start --------------------------------------------------------
systemctl enable --now portfolio-api portfolio-web
systemctl enable --now caddy
systemctl reload caddy || systemctl restart caddy

# --- status ----------------------------------------------------------------
sleep 2
systemctl --no-pager --lines=5 status portfolio-api || true
systemctl --no-pager --lines=5 status portfolio-web || true
systemctl --no-pager --lines=5 status caddy || true

echo
echo "=== bootstrap complete — $(date -u) ==="
echo "Next step: point DNS A records for $DOMAIN and $API_DOMAIN at this server's IP."
echo "Caddy will obtain TLS certificates automatically once DNS propagates."
