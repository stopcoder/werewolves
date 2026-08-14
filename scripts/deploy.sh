#!/usr/bin/env bash
# Deploy dist/ to gh-pages branch on origin.
# Force-pushes gh-pages — main branch unaffected.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d -t werewolves-ghpages-XXXXXX)"
REMOTE_URL="$(git -C "$REPO_ROOT" remote get-url origin)"
GIT_USER_NAME="$(git -C "$REPO_ROOT" config user.name)"
GIT_USER_EMAIL="$(git -C "$REPO_ROOT" config user.email)"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "==> 1/3 Export web bundle"
cd "$REPO_ROOT"
rm -rf dist
npx expo export --platform web

echo "==> 2/3 Add SPA fallback + jekyll opt-out"
# 404.html → index.html so deep links (e.g. /werewolves/reveal) hit the
# SPA shell, then the client router resolves the route.
cp dist/index.html dist/404.html
touch dist/.nojekyll

echo "==> 3/3 Force-push to gh-pages"
cp -R dist/. "$TMP_DIR/"
cd "$TMP_DIR"
git init -q -b gh-pages
git remote add origin "$REMOTE_URL"
git add -A
git -c user.name="$GIT_USER_NAME" -c user.email="$GIT_USER_EMAIL" \
  commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -f -u origin gh-pages

echo ""
echo "✓ Deployed. Live at: https://stopcoder.github.io/werewolves/"