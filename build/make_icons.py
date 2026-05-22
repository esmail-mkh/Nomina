"""
make_icons.py — rasterize build/icon.svg into platform icon files.

Generates next to icon.svg:
  - icon.ico   (Windows, multi-size: 16, 24, 32, 48, 64, 128, 256)
  - icon.png   (Linux, 512x512)
  - icon.icns  (macOS) — only when run on macOS; uses Apple's `iconutil`.

Dependencies:
  pip install cairosvg pillow
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SVG = HERE / "icon.svg"
ICO = HERE / "icon.ico"
PNG = HERE / "icon.png"
ICNS = HERE / "icon.icns"

ICO_SIZES = (16, 24, 32, 48, 64, 128, 256)
ICNS_SIZES = (16, 32, 64, 128, 256, 512, 1024)


def _register_cairo_dll_dirs() -> None:
    # Python 3.8+ on Windows: ctypes.CDLL no longer searches PATH for DLLs,
    # so cairocffi can't find libcairo-2.dll even if its directory is on PATH.
    # Register likely install locations explicitly via os.add_dll_directory().
    if sys.platform != "win32":
        return
    candidates = [
        os.environ.get("CAIRO_DLL_DIR"),
        r"C:\msys64\mingw64\bin",
        r"C:\msys64\ucrt64\bin",
        r"C:\Program Files\GTK3-Runtime Win64\bin",
    ]
    for path in candidates:
        if path and os.path.isdir(path):
            try:
                os.add_dll_directory(path)
            except (OSError, AttributeError):
                pass


def _rasterize(size: int) -> bytes:
    _register_cairo_dll_dirs()
    import cairosvg
    return cairosvg.svg2png(url=str(SVG), output_width=size, output_height=size)


def make_png() -> None:
    PNG.write_bytes(_rasterize(512))
    print(f"  ✓ {PNG.name}")


def make_ico() -> None:
    from io import BytesIO
    from PIL import Image
    images = [Image.open(BytesIO(_rasterize(s))).convert("RGBA") for s in ICO_SIZES]
    images[0].save(ICO, format="ICO", sizes=[(s, s) for s in ICO_SIZES], append_images=images[1:])
    print(f"  ✓ {ICO.name}")


def make_icns() -> None:
    if sys.platform != "darwin":
        print("  ⚠  skipping icon.icns (requires macOS `iconutil`)")
        return
    iconset = HERE / "icon.iconset"
    if iconset.exists():
        shutil.rmtree(iconset)
    iconset.mkdir()
    mapping = {
        16:  ("icon_16x16.png",   "icon_16x16@2x.png"),
        32:  ("icon_32x32.png",   "icon_32x32@2x.png"),
        128: ("icon_128x128.png", "icon_128x128@2x.png"),
        256: ("icon_256x256.png", "icon_256x256@2x.png"),
        512: ("icon_512x512.png", "icon_512x512@2x.png"),
    }
    for base, (name1x, name2x) in mapping.items():
        (iconset / name1x).write_bytes(_rasterize(base))
        (iconset / name2x).write_bytes(_rasterize(base * 2))
    subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(ICNS)], check=True)
    shutil.rmtree(iconset)
    print(f"  ✓ {ICNS.name}")


def main() -> int:
    if not SVG.exists():
        print(f"ERROR: {SVG} not found", file=sys.stderr)
        return 1
    print(f"Generating icons from {SVG.name}")
    make_png()
    make_ico()
    make_icns()
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
