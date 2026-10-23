#!/usr/bin/env bash
set -euo pipefail

# Safely install the supplied Unity WebGL archive into the portfolio checkout.
# This copies binary assets locally; it intentionally does not commit or publish.
if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /path/to/webgl.zip" >&2
  exit 2
fi
archive="$(realpath "$1")"
[[ -f "$archive" ]] || { echo "ERROR: archive not found: $archive" >&2; exit 1; }
command -v unzip >/dev/null || { echo "ERROR: unzip is required" >&2; exit 1; }
command -v gzip >/dev/null || { echo "ERROR: gzip is required" >&2; exit 1; }

# Reject path traversal and absolute paths before extraction.
while IFS= read -r entry; do
  case "$entry" in
    /*|../*|*/../*|*/..)
      echo "ERROR: unsafe archive path: $entry" >&2
      exit 1
      ;;
  esac
done < <(unzip -Z1 "$archive")

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
unzip -q "$archive" -d "$tmp"

src="$tmp/webgl/webgl"
if [[ ! -d "$src/Build" ]]; then
  echo "ERROR: expected webgl/webgl/Build in archive" >&2
  find "$tmp" -maxdepth 4 -type f -print >&2
  exit 1
fi

required=(
  "Build/webgl.loader.js"
  "Build/webgl.data.gz"
  "Build/webgl.framework.js.gz"
  "Build/webgl.wasm.gz"
  "TemplateData/style.css"
)
for rel in "${required[@]}"; do
  [[ -s "$src/$rel" ]] || { echo "ERROR: missing/empty required payload: $rel" >&2; exit 1; }
done
gzip -t "$src/Build/webgl.data.gz"
gzip -t "$src/Build/webgl.framework.js.gz"
gzip -t "$src/Build/webgl.wasm.gz"

dest="apps/webgl-unity"
mkdir -p "$dest"
rm -rf "$dest/Build" "$dest/TemplateData"
cp -a "$src/Build" "$dest/Build"
cp -a "$src/TemplateData" "$dest/TemplateData"

for rel in "${required[@]}"; do
  [[ -s "$dest/$rel" ]] || { echo "ERROR: copy verification failed: $rel" >&2; exit 1; }
done

echo "Unity WebGL payload copied and gzip-validated at $dest."
echo "Next: git add $dest/Build $dest/TemplateData"
echo "Review the binary diff, commit, push, and verify GitHub Pages response headers and browser launch."
