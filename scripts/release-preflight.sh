#!/usr/bin/env sh
set -e

if [ "$(git branch --show-current)" != "main" ]; then
  echo "❌ Release must run on branch main (current: $(git branch --show-current))"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working tree is not clean. Commit or stash before release."
  exit 1
fi

push_url="$(git remote get-url --push origin 2>/dev/null || true)"
case "$push_url" in
  https://github.com/*|http://github.com/*)
    echo "❌ Git push remote uses HTTPS: $push_url"
    echo "   GitHub no longer accepts password auth. Switch to SSH:"
    echo "   git remote set-url origin git@github.com:rrd108/nuxt-cart.git"
    exit 1
    ;;
esac

git fetch origin

behind="$(git rev-list HEAD..origin/main --count 2>/dev/null || echo 0)"
if [ "$behind" -ne 0 ]; then
  echo "❌ main is $behind commit(s) behind origin/main. Run: git pull --rebase origin main"
  exit 1
fi

echo "✓ Git: branch main, clean, synced with origin/main"
