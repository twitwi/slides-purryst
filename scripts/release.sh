#!/usr/bin/env bash
set -euo pipefail

# --- Parse args ---
no_latest=false
only_latest=false
only_delete_test=false
only_test=false
version=""

for arg in "$@"; do
  case "$arg" in
    --no-latest) no_latest=true ;;
    --only-latest) only_latest=true ;;
    --only-test) only_test=true ;;
    --delete-test) only_delete_test=true ;;
    -*) echo "Unknown option: $arg"; exit 1 ;;
    *) version="$arg" ;;
  esac
done

if [ "$only_delete_test" = true ]; then
    git tag -d test
    git push origin --delete test
    exit 1
fi

if [ -z "$version" ] && [ "$only_latest" = false ]; then
  echo "usage: release.sh [--no-latest|--only-latest|--only-test] v0.1.0"
  exit 1
fi


# --only-latest and --no-latest are mutually exclusive
if [ "$only_latest" = true ] && [ "$no_latest" = true ]; then
  echo "Error: --only-latest and --no-latest are mutually exclusive"
  exit 1
fi

# --- Dirty tree check ---
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree is dirty. Commit or stash changes first."
  exit 1
fi

# --- Version tag must match package.json ---
if [ "$only_latest" = false ] && [ "$only_test" = false ]; then
  pkg_ver="v$(node -p "require('./package.json').version")"
  if [ "$version" != "$pkg_ver" ]; then
    echo "Error: tag '$version' doesn't match package.json version '$pkg_ver'"
    exit 1
  fi
fi

# --- Build ---
pnpm build

# --- Commit dist and tag ---
msg="${version:-main@$(git rev-parse --short HEAD)}"
git add -f dist/
git commit -m "$msg"

if [ "$only_test" = true ]; then
  git tag -f test
  git push origin test --force
elif [ "$only_latest" = true ]; then
  git tag -f latest
  git push origin latest --force
elif [ "$no_latest" = true ]; then
  git tag -f "$version"
  git push origin "$version" --force
else
  git tag -f "$version"
  git tag -f latest
  git push origin "$version" latest --force
fi

# --- Restore main branch ---
git reset --soft HEAD~1
git restore --staged dist/
