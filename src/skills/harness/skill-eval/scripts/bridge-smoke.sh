#!/usr/bin/env bash
# Check that the local bridges for a skill serve the same SKILL.md as src/.
# Read-only: it changes nothing.
#
# Usage: bridge-smoke.sh <skill-name>
#
# A missing bridge is reported, not failed: a skill is only bridged while it is
# being tested locally. A bridge that exists but differs from src/, or that is
# not gitignored, fails the check.
set -eu

if [ "$#" -ne 1 ]; then
  echo "usage: bridge-smoke.sh <skill-name>" >&2
  exit 2
fi

name="$1"
root="$(cd "$(dirname "$0")/../../../../.." && pwd)"

matches=$(ls -d "$root"/src/skills/*/"$name" 2>/dev/null || true)
count=$(printf '%s\n' "$matches" | grep -c . || true)
if [ "$count" -ne 1 ]; then
  echo "refused: expected one skill named '$name' under src/skills/, found $count" >&2
  exit 1
fi
canon="$matches/SKILL.md"

fail=0
for bridge in ".claude/skills/$name" ".agents/skills/$name"; do
  if [ ! -e "$root/$bridge/SKILL.md" ]; then
    echo "$bridge: no bridge (skipped)"
    continue
  fi
  if ! cmp -s "$root/$bridge/SKILL.md" "$canon"; then
    echo "$bridge: FAIL, SKILL.md differs from $canon"
    fail=1
    continue
  fi
  if git -C "$root" check-ignore -q "$bridge"; then
    echo "$bridge: OK (same SKILL.md, gitignored)"
  else
    echo "$bridge: FAIL, bridge is not gitignored"
    fail=1
  fi
done

exit "$fail"
