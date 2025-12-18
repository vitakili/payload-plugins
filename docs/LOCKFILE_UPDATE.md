If you modify `package.json` (scripts, dependencies, etc.), update the lockfile so CI can install dependencies.

Steps:

1. Run `pnpm install` at the repository root.
2. Stage and commit the updated lockfile:

```bash
git add pnpm-lock.yaml
git commit -m "chore: update pnpm-lock.yaml"
git push
```

Tip: Use the helper script to update and commit the lockfile automatically:

```bash
chmod +x ./scripts/update-lockfile.sh
./scripts/update-lockfile.sh
```

3. Include the lockfile in your PR and mention it in the PR description.

If you can't run `pnpm install` locally, ask a maintainer to run it and open a follow-up PR that updates `pnpm-lock.yaml`.
