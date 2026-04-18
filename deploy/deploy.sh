#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Portfolio redeploy — pull latest main, rebuild backend + frontend in place,
# restart both systemd services. Run as the "deploy" user.
#
#   sudo -u deploy bash /opt/portfolio/src/deploy/deploy.sh
#
# Flags:
#   --no-pull   skip git fetch/reset (used by bootstrap for the first deploy)
# ---------------------------------------------------------------------------
set -euo pipefail

APP_ROOT="/opt/portfolio"
SRC="$APP_ROOT/src"
BACKEND_DIR="$SRC/backend/src/Portfolio.Api"
FRONTEND_DIR="$SRC/frontend"
API_OUT="$APP_ROOT/api"
API_URL="https://api.amindehghani.me"

NO_PULL=0
[[ "${1:-}" == "--no-pull" ]] && NO_PULL=1

if [[ "$(id -un)" != "deploy" ]]; then
	echo "error: run as the 'deploy' user (try: sudo -u deploy bash $0)"
	exit 1
fi

cd "$SRC"
if [[ $NO_PULL -eq 0 ]]; then
	echo "--- pulling latest main ---"
	git fetch origin
	git reset --hard origin/main
fi

# --- .NET API --------------------------------------------------------------
echo "--- building backend (.NET publish) ---"
mkdir -p "$API_OUT"
dotnet publish "$BACKEND_DIR" \
	-c Release -r linux-x64 --self-contained false \
	-o "$API_OUT" \
	--nologo

chmod +x "$API_OUT/Portfolio.Api" || true

# --- Next.js frontend ------------------------------------------------------
echo "--- building frontend (next build) ---"
cd "$FRONTEND_DIR"

# Production API URL is baked into the client bundle at build time.
printf 'NEXT_PUBLIC_API_URL=%s\n' "$API_URL" > .env.production

npm ci
npm run build

# --- restart services ------------------------------------------------------
echo "--- restarting services ---"
sudo /bin/systemctl restart portfolio-api
sudo /bin/systemctl restart portfolio-web

echo "--- deploy complete ---"
