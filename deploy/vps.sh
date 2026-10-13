#!/usr/bin/env bash
# Run on the VPS: cd ~/native-site-src && git pull --ff-only && bash deploy/vps.sh
set -euo pipefail
SOURCE=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
LIVE=${NATIVE_SITE_LIVE:-$HOME/native-site}
BACKUPS=${NATIVE_SITE_BACKUPS:-$HOME/native-site-backups}
exec 9>"$HOME/.native-site-deploy.lock"
flock -n 9 || { echo "Another website deployment is running."; exit 1; }
[ -f "$LIVE/ecosystem.config.cjs" ] || { echo "Missing live PM2 configuration."; exit 1; }
cd "$SOURCE"
npm ci
# Build away from the live bundle, with the existing secret passed only to the child process.
export NATIVE_SITE_LIVE="$LIVE"
node <<'NODE'
const { execFileSync } = require('node:child_process');
const processes = JSON.parse(execFileSync('pm2', ['jlist'], {encoding: 'utf8'}));
const runtime = processes.find(p => p.name === 'native-site')?.pm2_env;
if (!runtime?.NATIVE_SITE_KEY && !runtime?.NOCTRA_SITE_KEY) throw new Error('Missing website API key in live environment');
const env = {...process.env, NEXT_PUBLIC_SITE_URL:'https://playnative.net', NATIVE_API_URL:'https://api.playnative.net', NATIVE_SITE_KEY:runtime.NATIVE_SITE_KEY || runtime.NOCTRA_SITE_KEY};
execFileSync('npm', ['run','lint'], {stdio:'inherit',env});
execFileSync('npm', ['run','build'], {stdio:'inherit',env});
NODE
STAGE=$(mktemp -d "$HOME/.native-site-stage.XXXXXX")
mkdir -p "$BACKUPS"; chmod 700 "$BACKUPS"
BACKUP="$BACKUPS/$(date -u +%Y%m%dT%H%M%SZ)-vps"
mkdir -m 700 "$BACKUP"
activated=0
cleanup() {
  code=$?
  if [ "$code" -ne 0 ] && [ "$activated" = 1 ]; then
    echo "Deployment failed; restoring previous website."
    [ ! -d "$LIVE" ] || mv "$LIVE" "$BACKUP/failed"
    mv "$BACKUP/live" "$LIVE"
    (cd "$LIVE" && pm2 restart ecosystem.config.cjs --only native-site --update-env) || true
  fi
  [ ! -d "$STAGE" ] || rm -rf "$STAGE"
  exit "$code"
}
trap cleanup EXIT
cp -a .next/standalone/. "$STAGE/"
# A full server-side install should produce real traced dependencies, not a workspace symlink.
[ ! -L "$STAGE/node_modules" ] || { echo "Standalone dependency symlink is unsafe for deployment."; exit 1; }
mkdir -p "$STAGE/.next"
cp -a .next/static "$STAGE/.next/"
cp -a public "$STAGE/"
cp -p "$LIVE/ecosystem.config.cjs" "$STAGE/"
chmod 600 "$STAGE/ecosystem.config.cjs"
# Fresh bundle means no old route/fetch caches, chunks or sitemap responses survive.
mv "$LIVE" "$BACKUP/live"
activated=1
mv "$STAGE" "$LIVE"
cd "$LIVE"
pm2 restart ecosystem.config.cjs --only native-site --update-env
healthy=0
for i in $(seq 1 30); do
  if curl -fsS --max-time 5 http://127.0.0.1:3100/support >/dev/null && curl -fsS --max-time 5 http://127.0.0.1:3100/robots.txt | grep -q 'Host: https://playnative.net'; then healthy=1; break; fi
  sleep 1
done
[ "$healthy" = 1 ] || { echo "Website health check failed."; exit 1; }
pm2 save >/dev/null
echo "VPS website deployment healthy. Previous website: $BACKUP/live"
