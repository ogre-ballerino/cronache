#!/usr/bin/env bash
# Netlify `ignore` command: exit 0 skips the build, anything else builds.
# Usage: scripts/netlify-ignore.sh <site>
set -u

site="$1"
paths=("sites/$site" sites/ogre-ballerino.mjs packages/core package.json pnpm-lock.yaml pnpm-workspace.yaml)

if [ "${CONTEXT:-}" != "deploy-preview" ]; then
  git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- "${paths[@]}"
  exit $?
fi

# Deploy previews are opt-in: Netlify doesn't rebuild when a label is added,
# so push again or retry the deploy after labelling the PR.
labels=$(curl -fsS "https://api.github.com/repos/ogre-ballerino/cronache/issues/$REVIEW_ID/labels") || {
  echo "Couldn't read the labels of PR #$REVIEW_ID: skipping the preview."
  exit 0
}
if ! grep -q '"name": *"preview"' <<<"$labels"; then
  echo "PR #$REVIEW_ID has no 'preview' label: skipping the preview."
  exit 0
fi

# CACHED_COMMIT_REF isn't the branch point on a PR's first build: diff against main instead.
git fetch -q origin main && git diff --quiet FETCH_HEAD...HEAD -- "${paths[@]}"
