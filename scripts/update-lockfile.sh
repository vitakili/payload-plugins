#!/usr/bin/env bash
set -euo pipefail

echo "Running pnpm install to update pnpm-lock.yaml..."
pnpm install

echo "Staging pnpm-lock.yaml and creating commit..."
git add pnpm-lock.yaml
if git diff --staged --name-only | grep -q "pnpm-lock.yaml"; then
  git commit -m "chore: update pnpm-lock.yaml"
  echo "Committed updated pnpm-lock.yaml. Please push your branch or open a PR."
else
  echo "No changes to pnpm-lock.yaml detected after install. Nothing to commit."
fi
