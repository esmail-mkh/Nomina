"""
make_icons.py — convert build/icon.png into platform icon files.
Generates next to icon.png:
  icon.ico   (Windows, multi-size: 16, 24, 32, 48, 64, 128, 256)
  icon.icns  (macOS) — only when run on macOS; uses Apple's `iconutil`.
  icon.png   (Linux) — already exists, no conversion needed.

Dependencies:
  pip install pillow
"""
from __future__ import annotations
import shutil
import subprocess
import sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
PNG_SRC = HERE / "icon.png"
ICO = HERE / "icon.ico"
ICNS = HERE / "icon.icns"

ICO_SIZES = (16, 24, 32, 48, 64, 128, 256)

def make_ico() -> None:
    if not PNG_SRC.exists():
        print(f"ERROR: {PNG_SRC} not found", file=sys.stderr)
        sys.exit(1)

    img = Image.open(PNG_SRC)
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    img.save(
        ICO,
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
    )
    # Use ASCII [OK] instead of Unicode checkmark to avoid cp1252 encoding errors on Windows CI
    print(f"  [OK] {ICO.name}")

def make_icns() -> None:
    if sys.platform != "darwin":
        # Use ASCII [SKIP] instead of Unicode warning sign
        print("  [SKIP] icon.icns (only needed on macOS)")
        return

    if not PNG_SRC.exists():
        print(f"ERROR: {PNG_SRC} not found", file=sys.stderr)
        sys.exit(1)

    iconset = HERE / "icon.iconset"
    if iconset.exists():
        shutil.rmtree(iconset)
    iconset.mkdir()

    img = Image.open(PNG_SRC)
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    mapping = {
        16:  ("icon_16x16.png",    "icon_16x16@2x.png"),
        32:  ("icon_32x32.png",    "icon_32x32@2x.png"),
        128: ("icon_128x128.png",  "icon_128x128@2x.png"),
        256: ("icon_256x256.png",  "icon_256x256@2x.png"),
        512: ("icon_512x512.png",  "icon_512x512@2x.png"),
    }

    for base, (name1x, name2x) in mapping.items():
        img.resize((base, base), Image.Resampling.LANCZOS).save(iconset / name1x)
        img.resize((base * 2, base * 2), Image.Resampling.LANCZOS).save(iconset / name2x)

    subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(ICNS)], check=True)
    shutil.rmtree(iconset)
    print(f"  [OK] {ICNS.name}")

def main() -> int:
    print(f"Generating icons from {PNG_SRC.name}")
    make_ico()
    make_icns()
    print("Done.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
