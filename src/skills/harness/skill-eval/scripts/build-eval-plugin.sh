#!/usr/bin/env bash
# Build a throwaway plugin from one skill and its eval suite, for `claude plugin eval`.
#
# Usage: build-eval-plugin.sh [--root <repo>] <skill-name> <out-dir>
#
# The skill is copied with cp -RL, so links and junctions are followed and the
# plugin holds real files. The suite is copied from <repo>/evals/<skill-name>/
# into the plugin's evals/ folder, which is where the CLI looks by default.
set -eu

root=""
if [ "${1:-}" = "--root" ]; then
  root="$2"
  shift 2
fi

if [ "$#" -ne 2 ]; then
  echo "usage: build-eval-plugin.sh [--root <repo>] <skill-name> <out-dir>" >&2
  exit 2
fi

name="$1"
out="$2"

if ! printf '%s' "$name" | grep -Eq '^[a-z][a-z0-9-]*$'; then
  echo "refused: skill name must be lowercase letters, digits and hyphens: $name" >&2
  exit 2
fi

if [ -z "$root" ]; then
  root="$(cd "$(dirname "$0")/../../../../.." && pwd)"
fi

matches=$(ls -d "$root"/src/skills/*/"$name" 2>/dev/null || true)
count=$(printf '%s\n' "$matches" | grep -c . || true)
if [ "$count" -ne 1 ]; then
  echo "refused: expected one skill named '$name' under $root/src/skills/, found $count" >&2
  exit 1
fi
skill_dir="$matches"

if [ -e "$out" ] && [ -n "$(ls -A "$out" 2>/dev/null)" ]; then
  echo "refused: output folder is not empty: $out" >&2
  exit 1
fi

mkdir -p "$out/.claude-plugin" "$out/skills" "$out/evals"
cp -RL "$skill_dir" "$out/skills/$name"

suite="$root/evals/$name"
if [ -d "$suite" ]; then
  cp -RL "$suite/." "$out/evals/"
else
  echo "note: no suite at $suite; the plugin has the skill only" >&2
fi

cat > "$out/.claude-plugin/plugin.json" <<EOF
{
  "name": "eval-$name",
  "version": "0.0.0",
  "description": "Throwaway build of the $name skill for claude plugin eval. Not shipped."
}
EOF

echo "built: $out"
echo "  skill: $out/skills/$name (from $skill_dir)"
echo "  cases: $(find "$out/evals" -name case.yaml 2>/dev/null | wc -l | tr -d ' ')"
