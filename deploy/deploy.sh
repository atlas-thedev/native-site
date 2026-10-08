#!/usr/bin/env bash
# Build locally (the VPS has only ~1 GB RAM) and ship the standalone bundle.
# Usage: VPS=ubuntu@158.178.247.161 KEY=~/.ssh/vps.pem ./deploy/deploy.sh
set -euo pipefail
VPS=${VPS:-ubuntu@158.178.247.161}; KEY=${KEY:-$HOME/.ssh/vps.pem}
NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://playnative.fun} npm run build
rm -rf /tmp/native-pkg && mkdir /tmp/native-pkg
cp -r .next/standalone/. /tmp/native-pkg/ && mkdir -p /tmp/native-pkg/.next
cp -r .next/static /tmp/native-pkg/.next/static && cp -r public /tmp/native-pkg/public
tar czf /tmp/native-site.tgz -C /tmp/native-pkg .
scp -i "$KEY" /tmp/native-site.tgz "$VPS":/tmp/
# ecosystem.config.cjs (holds NATIVE_SITE_KEY) stays on the server and is not overwritten.
ssh -i "$KEY" "$VPS" 'cd ~/native-site && tar xzf /tmp/native-site.tgz && pm2 reload native-site --update-env'
