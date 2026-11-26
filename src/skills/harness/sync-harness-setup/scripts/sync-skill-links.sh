#!/usr/bin/env bash
# Usage: scripts/sync-skill-links.sh [--copy] [--dry-run]
# Bridge canonical .agents/skills/<n> into .claude/skills/<n> (needed by Claude Code).
# Default: relative per-skill symlink. --copy: generated copy (Windows / core.symlinks=false).
# Works per package: apps/web/.agents/skills -> apps/web/.claude/skills.
set -euo pipefail
mode=link; dry=0
for a in "$@"; do
  case "$a" in --copy) mode=copy ;; --dry-run) dry=1 ;; *) echo "usage: $0 [--copy] [--dry-run]" >&2; exit 2 ;; esac
done
run() { if [ "$dry" = 1 ]; then echo "plan: $*"; else "$@"; fi; }
marker=.generated-from-agents-skills
cd "$(git rev-parse --show-toplevel)"

bases=$(git ls-files -co --exclude-standard | while IFS= read -r f; do [ -e "$f" ] || [ -L "$f" ] && echo "$f"; done \
  | grep -E '(^|/)\.(agents|claude)/skills/[^/]+' \
  | sed -E 's#^#./#; s#\.(agents|claude)/skills/.*$##' | sort -u)   # both sides, so orphans get pruned

for base in $bases; do
  run mkdir -p "${base}.claude/skills"
  for d in "${base}.agents/skills"/*/; do
    [ -f "${d}SKILL.md" ] || continue
    n=$(basename "$d"); dst="${base}.claude/skills/$n"
    if [ -L "$dst" ]; then run rm "$dst"
    elif [ -d "$dst" ] && [ -f "$dst/$marker" ]; then run rm -rf "$dst"
    elif [ -e "$dst" ]; then echo "refusing to replace hand-made path: $dst (move it into ${base}.agents/skills first)" >&2; exit 1
    fi
    if [ "$mode" = link ]; then run ln -s "../../.agents/skills/$n" "$dst"
    else run cp -R "${d%/}" "$dst"; run touch "$dst/$marker"; fi
  done
  for l in "${base}.claude/skills"/*; do   # prune links/copies whose source skill is gone
    n=$(basename "$l")
    if [ -L "$l" ] && [ ! -e "$l" ]; then run rm "$l"
    elif [ -d "$l" ] && [ -f "$l/$marker" ] && [ ! -d "${base}.agents/skills/$n" ]; then run rm -rf "$l"; fi
  done
done
echo "skill bridge ($mode) done"
