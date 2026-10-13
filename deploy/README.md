# VPS website deployment

Website builds and deployment run directly on the VPS. GitHub Actions is not required for `native-site`; launcher and mod workflows are separate.

On `ubuntu@3.106.132.147`:

```bash
cd ~/native-site-src
git pull --ff-only
bash deploy/vps.sh
```

The script installs dependencies, runs typechecking and a production build, stages a fresh standalone bundle, preserves the existing PM2 configuration/API key, backs up the previous website, restarts `native-site`, and checks health. A failed activation restores the previous website. Concurrent deployments are blocked. The running site is untouched if dependency installation or build fails.

The website and API use `https://playnative.net` and `https://api.playnative.net`. Keep secrets only in the VPS configuration—not in Git.

The older `deploy/deploy.sh` remains an optional local-build/SSH deployment path. Prefer `deploy/vps.sh` for routine website updates.
