#!/usr/bin/env bash
# Usage: scripts/sync-skill-links.sh [--link | --junction | --copy] [--dry-run]
# Bridge canonical .agents/skills/<n> into .claude/skills/<n> (needed by Claude Code).
# Default (auto): junction on Windows (Git Bash; no admin or Developer Mode needed),
#                 relative symlink elsewhere.
# --link:     force symlink. Fails silently on Windows without Developer Mode, so refused there.
# --copy:     generated copy (no links at all: archive delivery, core.symlinks=false).
# Acts only inside the git repo: paths come from git, and canonical skills that resolve
# outside the repo are skipped.
# Works per package: apps/web/.agents/skills -> apps/web/.claude/skills.
set -euo pipefail
mode=auto; dry=0
for a in "$@"; do
  case "$a" in
    --link) mode=link ;;
    --junction) mode=junction ;;
    --copy) mode=copy ;;
    --dry-run) dry=1 ;;
    *) echo "usage: $0 [--link | --junction | --copy] [--dry-run]" >&2; exit 2 ;;
  esac
done
win=0; case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) win=1 ;; esac
if [ "$mode" = auto ]; then if [ "$win" = 1 ]; then mode=junction; else mode=link; fi; fi
if [ "$mode" = junction ] && [ "$win" = 0 ]; then echo "--junction is for Windows (Git Bash); Linux and macOS use the default symlink" >&2; exit 2; fi
if [ "$mode" = link ] && [ "$win" = 1 ]; then echo "--link does not work on Windows without Developer Mode (ln -s makes a plain directory). Use the default (junction) or --copy." >&2; exit 2; fi
run() { if [ "$dry" = 1 ]; then echo "plan: $*"; else "$@"; fi; }
marker=.generated-from-agents-skills
cd "$(git rev-parse --show-toplevel)"
root_real=$(pwd -P)

# Windows junction helpers. Paths go through environment variables, never into PowerShell code,
# so a path with quotes cannot inject commands. Removal calls Delete on the link itself:
# rm -r can follow a junction into its target.
wpath() { cygpath -wa "$1"; }   # absolute: PowerShell resolves relative paths against its own cwd
is_junction() {
  [ "$win" = 1 ] && [ "$(LINK_PATH="$(wpath "$1")" powershell.exe -NoProfile -Command '$i = Get-Item -Force -LiteralPath $env:LINK_PATH -ErrorAction SilentlyContinue; if ($i) { $i.Attributes.HasFlag([IO.FileAttributes]::ReparsePoint) } else { $false }' | tr -d '\r')" = True ]
}
is_link()     { [ -L "$1" ] || is_junction "$1"; }
# True if the link points into .agents/skills/. Sync prunes only those, so Claude-only links into src/ survive.
points_to_agents() {
  local t
  if [ -L "$1" ]; then t=$(readlink "$1")
  else t=$(LINK_PATH="$(wpath "$1")" powershell.exe -NoProfile -Command '(Get-Item -Force -LiteralPath $env:LINK_PATH).Target' | tr -d '\r'); fi
  t=${t//\\//}
  case "$t" in */.agents/skills/*) return 0 ;; *) return 1 ;; esac
}
remove_link() {
  if is_junction "$1"; then
    if [ "$dry" = 1 ]; then echo "plan: remove junction $1"; else LINK_PATH="$(wpath "$1")" powershell.exe -NoProfile -Command '(Get-Item -Force -LiteralPath $env:LINK_PATH).Delete()' >/dev/null; fi
  else run rm "$1"; fi
}
make_junction() {
  if [ "$dry" = 1 ]; then echo "plan: junction $1 -> $2"; else LINK_PATH="$(wpath "$1")" TARGET_PATH="$(wpath "$2")" powershell.exe -NoProfile -Command 'New-Item -ItemType Junction -Path $env:LINK_PATH -Target $env:TARGET_PATH | Out-Null' >/dev/null; fi
}

# No --exclude-standard: gitignored bridges (junctions) must still be found, or their orphans never get pruned.
bases=$(git ls-files -co | while IFS= read -r f; do [ -e "$f" ] || [ -L "$f" ] && echo "$f"; done \
  | grep -E '(^|/)\.(agents|claude)/skills/[^/]+' \
  | sed -E 's#^#./#; s#\.(agents|claude)/skills/.*$##' | sort -u)   # both sides, so orphans get pruned

for base in $bases; do
  run mkdir -p "${base}.claude/skills"
  for d in "${base}.agents/skills"/*/; do
    [ -f "${d}SKILL.md" ] || continue
    real=$(cd "$d" && pwd -P)
    case "$real/" in "$root_real/"*) ;; *) echo "skipping $d: resolves outside the repo ($real)" >&2; continue ;; esac
    n=$(basename "$d"); dst="${base}.claude/skills/$n"
    if is_link "$dst"; then remove_link "$dst"
    elif [ -d "$dst" ] && [ -f "$dst/$marker" ]; then run rm -rf "$dst"
    elif [ -e "$dst" ]; then echo "refusing to replace hand-made path: $dst (move it into ${base}.agents/skills first)" >&2; exit 1
    fi
    case "$mode" in
      link)     run ln -s "../../.agents/skills/$n" "$dst" ;;
      junction) make_junction "$dst" "${d%/}" ;;   # (link, target)
      copy)     run cp -R "${d%/}" "$dst"; run touch "$dst/$marker" ;;
    esac
  done
  for l in "${base}.claude/skills"/*; do   # prune links/copies whose source skill is gone
    n=$(basename "$l")
    if is_link "$l" && [ ! -f "${base}.agents/skills/$n/SKILL.md" ] && points_to_agents "$l"; then remove_link "$l"
    elif [ -d "$l" ] && [ -f "$l/$marker" ] && [ ! -f "${base}.agents/skills/$n/SKILL.md" ]; then run rm -rf "$l"; fi
  done
done
echo "skill bridge ($mode) done"
