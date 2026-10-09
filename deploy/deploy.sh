#!/usr/bin/env bash
# Build locally and ship the standalone bundle to the VPS.
# Usage: ./deploy/deploy.sh   (defaults: VPS=ubuntu@3.106.132.147, KEY=~/.ssh/new.pem)
#        VPS=ubuntu@<ip> KEY=<path to .pem> ./deploy/deploy.sh   to override
# The site address comes from the backend (Admin → Domains → "Make main website").
set -euo pipefail
VPS=${VPS:-ubuntu@3.106.132.147}; KEY=${KEY:-$HOME/.ssh/new.pem}
[ -f "$KEY" ] || { echo "SSH key not found: $KEY (set KEY=/path/to/key.pem)"; exit 1; }
if [ -z "${NEXT_PUBLIC_SITE_URL:-}" ]; then
  NEXT_PUBLIC_SITE_URL=$(curl -fsS --max-time 10 https://api.nativelaunch.xyz/v1/domains/primary 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).site||"")}catch{}})' || true)
  NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://playnative.fun}
fi
echo "Building for $NEXT_PUBLIC_SITE_URL"
NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL npm run build
rm -rf /tmp/native-pkg && mkdir /tmp/native-pkg
cp -r .next/standalone/. /tmp/native-pkg/ && mkdir -p /tmp/native-pkg/.next
cp -r .next/static /tmp/native-pkg/.next/static && cp -r public /tmp/native-pkg/public
tar czf /tmp/native-site.tgz -C /tmp/native-pkg .
scp -i "$KEY" /tmp/native-site.tgz "$VPS":/tmp/
# ecosystem.config.cjs (holds NATIVE_SITE_KEY) stays on the server and is not overwritten.
ssh -i "$KEY" "$VPS" 'cd ~/native-site && tar xzf /tmp/native-site.tgz && pm2 reload native-site --update-env'
