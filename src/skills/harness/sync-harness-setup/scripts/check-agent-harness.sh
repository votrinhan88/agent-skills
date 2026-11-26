#!/usr/bin/env bash
# Usage: scripts/check-agent-harness.sh   (bash + git only; run in CI on Linux, full checkout)
# Fails when entry points or skills drift from the canonical AGENTS.md / .agents/skills.
set -u
cd "$(git rev-parse --show-toplevel)"
fail=0; marker=.generated-from-agents-skills
err()  { echo "FAIL: $*" >&2; fail=1; }
warn() { echo "WARN: $*" >&2; }
has_import() { awk '/^```/{f=!f; next} !f && /^@(\.\/)?AGENTS\.md[ \t]*$/{ok=1} END{exit !ok}' "$1"; }  # real import, not in a code fence
files=$(git ls-files -co --exclude-standard | while IFS= read -r f; do [ -e "$f" ] || [ -L "$f" ] && echo "$f"; done)  # skip tracked-but-deleted

# 1. Instructions ------------------------------------------------------------
[ -f AGENTS.md ] || err "AGENTS.md missing at repo root"
if [ -L CLAUDE.md ]; then [ "$(readlink CLAUDE.md)" = "AGENTS.md" ] || err "CLAUDE.md symlink must point to AGENTS.md"
elif [ -f CLAUDE.md ]; then has_import CLAUDE.md || err "CLAUDE.md has no '@AGENTS.md' import line (Claude Code would ignore AGENTS.md)"; fi
if [ -f GEMINI.md ] || [ -f .gemini/settings.json ]; then
  { grep -qs 'AGENTS\.md' .gemini/settings.json || has_import GEMINI.md 2>/dev/null; } \
    || err "Gemini CLI not pointed at AGENTS.md (context.fileName or GEMINI.md import)"
fi
# Nested AGENTS.md: with a root CLAUDE.md, Claude Code ignores them unless a sibling CLAUDE.md imports them.
for f in $(printf '%s\n' "$files" | grep -E '/AGENTS\.md$'); do
  d=$(dirname "$f")
  if [ -e CLAUDE.md ] && ! { [ -f "$d/CLAUDE.md" ] && { has_import "$d/CLAUDE.md" || [ -L "$d/CLAUDE.md" ]; }; }; then
    err "$f: nested AGENTS.md is invisible to Claude Code; add $d/CLAUDE.md with '@AGENTS.md' or flatten into root"
  fi
done
# Codex stops at project_doc_max_bytes (32768) across the root->cwd chain.
for f in $(printf '%s\n' "$files" | grep -E '(^|/)AGENTS\.md$'); do
  total=0; d=$(dirname "$f")
  while :; do [ -f "$d/AGENTS.md" ] && total=$((total + $(wc -c < "$d/AGENTS.md"))); [ "$d" = . ] && break; d=$(dirname "$d"); done
  [ "$total" -le 32768 ] || err "$f: AGENTS.md chain is $total bytes (>32768); Codex truncates"
done

# 2. Skills: spec-only frontmatter, allowlisted exceptions ---------------------
spec="name description license compatibility metadata"
allow=.agents/frontmatter-allowlist     # lines: "<skill-name|*> <key>"  (# comments ok)
skillfiles=$(printf '%s\n' "$files" | grep -E '(^|/)\.agents/skills/[^/]+/SKILL\.md$' || true)
names=""
for f in $skillfiles; do
  dir=$(basename "$(dirname "$f")")
  [ "$(head -n1 "$f")" = "---" ] || { err "$f: frontmatter must start on line 1"; continue; }
  fm=$(awk 'NR==1{next} /^---[ \t]*$/{exit} {print}' "$f")
  name=$(printf '%s\n' "$fm" | sed -n 's/^name:[ \t]*//p' | head -n1 | tr -d "\"'" | sed 's/[ \t]*$//')
  printf '%s\n' "$fm" | grep -qE '^description:' || err "$f: missing description"
  [ -n "$name" ] || { err "$f: missing name"; continue; }
  [ "$name" = "$dir" ] || err "$f: name '$name' must equal directory '$dir'"
  { printf '%s' "$name" | grep -qE '^[a-z0-9]+(-[a-z0-9]+)*$' && [ "${#name}" -le 64 ]; } || err "$f: invalid name '$name'"
  for k in $(printf '%s\n' "$fm" | grep -oE '^[A-Za-z_][A-Za-z0-9_-]*:' | tr -d ':'); do
    case " $spec " in *" $k "*) continue ;; esac
    grep -qsE "^(\*|$dir)[[:space:]]+$k([[:space:]]|\$)" "$allow" || err "$f: non-spec key '$k' (allowlist it in $allow if intentional)"
  done
  names="$names$name"$'\n'
done
dups=$(printf '%s' "$names" | sort | uniq -d); [ -z "$dups" ] || err "duplicate skill names: $(echo $dups)"

# 3. Claude Code bridge: symlink or generated copy -----------------------------
for base in $(printf '%s\n' "$files" | grep -E '(^|/)\.(agents|claude)/skills/[^/]+' | sed -E 's#^#./#; s#\.(agents|claude)/skills/.*$##' | sort -u); do
  for d in "${base}.agents/skills"/*/; do
    [ -f "${d}SKILL.md" ] || continue
    n=$(basename "$d"); l="${base}.claude/skills/$n"
    if [ -L "$l" ]; then
      [ "$(readlink "$l")" = "../../.agents/skills/$n" ] || err "$l -> '$(readlink "$l")' (expected ../../.agents/skills/$n)"
      [ -f "$l/SKILL.md" ] || err "$l is dangling"
      mode=$(git ls-files -s -- "$l" | cut -d' ' -f1); [ -z "$mode" ] || [ "$mode" = 120000 ] || err "$l committed as mode $mode, not a symlink"
    elif [ -d "$l" ] && [ -f "$l/$marker" ]; then
      diff -rq -x "$marker" "${d%/}" "$l" >/dev/null || err "$l is a stale copy (run sync-skill-links.sh --copy)"
    elif [ -e "$l" ]; then err "$l is a hand-made path shadowing canonical skill '$n'"
    else err "$l missing (run scripts/sync-skill-links.sh)"; fi
  done
  for l in "${base}.claude/skills"/*; do
    [ -e "$l" ] || [ -L "$l" ] || continue
    src="${base}.agents/skills/$(basename "$l")"
    if [ -L "$l" ] || [ -f "$l/$marker" ]; then [ -d "$src" ] || err "$l is orphaned (canonical skill removed; run sync-skill-links.sh)"
    else warn "$l is Claude-only (not shared with other harnesses)"; fi
  done
done

[ "$fail" -eq 0 ] && echo "agent harness: OK"
exit "$fail"
