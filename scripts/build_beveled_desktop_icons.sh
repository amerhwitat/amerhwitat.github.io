#!/usr/bin/env bash
# Deterministically derive the published beveled concept icon set from the
# unmodified 96x96 source slices. No generative model or random input is used.
set -euo pipefail

cd "$(dirname "$0")/.."
command -v magick >/dev/null 2>&1 || { echo "ImageMagick 7 (magick) is required" >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 is required" >&2; exit 1; }

SRC_DIR="assets/desktop-icons/slices"
OUT_DIR="assets/desktop-icons/beveled"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/sheet-a" "$OUT_DIR/sheet-b"

while IFS= read -r source; do
  relative="${source#$SRC_DIR/}"
  destination="$OUT_DIR/$relative"
  mkdir -p "$(dirname "$destination")"
  magick "$source" \
    \( -size 96x96 xc:none -fill white -draw "roundrectangle 0,0 95,95 20,20" -alpha extract \) \
    -alpha off -compose CopyOpacity -composite \
    \( -size 96x96 xc:none -stroke "#0b1626cc" -strokewidth 2 -fill none -draw "roundrectangle 1,1 94,94 19,19" \) \
    -compose Over -composite \
    \( -size 96x96 xc:none -stroke "#ffffffb3" -strokewidth 1 -fill none -draw "roundrectangle 3,3 92,92 17,17" \) \
    -compose Over -composite \
    -define png:color-type=6 -define png:compression-level=9 \
    -define png:compression-filter=0 -define png:compression-strategy=0 \
    -strip "$destination"
done < <(find "$SRC_DIR" -type f -name "*.png" | sort)

python3 - <<'PY'
import hashlib
import json
from pathlib import Path

root = Path(".").resolve()
sources = sorted((root / "assets/desktop-icons/slices").glob("sheet-*/*.png"))
if len(sources) != 100:
    raise SystemExit(f"expected 100 source slices, found {len(sources)}")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


records = []
for source in sources:
    relative = source.relative_to(root / "assets/desktop-icons/slices")
    derived = root / "assets/desktop-icons/beveled" / relative
    if not derived.is_file():
        raise SystemExit(f"missing derived asset: {derived}")
    records.append({
        "id": source.stem,
        "sheet": relative.parts[0],
        "source_asset": "/" + source.relative_to(root).as_posix(),
        "derived_asset": "/" + derived.relative_to(root).as_posix(),
        "source_sha256": digest(source),
        "derived_sha256": digest(derived),
    })

manifest = {
    "schema": "chimera-octavian-beveled-icon-set/v1",
    "concept_only": True,
    "asset_count": 100,
    "source_set": "/assets/desktop-icons/slices/",
    "derived_set": "/assets/desktop-icons/beveled/",
    "geometry": {
        "size": "96x96",
        "corner_radius_px": 20,
        "bevel": "2px translucent dark outer ring inset 1px plus 1px translucent light inner ring inset 3px, following the same 20px rounded-corner geometry",
    },
    "generation": {
        "method": "deterministic ImageMagick 7 commands; no AI or random input",
        "command": "magick SOURCE ( -size 96x96 xc:none -fill white -draw 'roundrectangle 0,0 95,95 20,20' -alpha extract ) -alpha off -compose CopyOpacity -composite ( -size 96x96 xc:none -stroke '#0b1626cc' -strokewidth 2 -fill none -draw 'roundrectangle 1,1 94,94 19,19' ) -compose Over -composite ( -size 96x96 xc:none -stroke '#ffffffb3' -strokewidth 1 -fill none -draw 'roundrectangle 3,3 92,92 17,17' ) -compose Over -composite -define png:color-type=6 -define png:compression-level=9 -define png:compression-filter=0 -define png:compression-strategy=0 -strip DERIVED",
    },
    "records": records,
}
path = root / "assets/desktop-icons/beveled/BEVELED_MANIFEST.json"
path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Generated {len(records)} beveled icons and {path.relative_to(root)}")
PY
