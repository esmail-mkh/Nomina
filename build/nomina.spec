# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec for Nomina — onedir, cross-platform.
Builds:
  Windows : dist/Nomina/Nomina.exe       (icon embedded from build/icon.ico)
  Linux   : dist/Nomina/Nomina           (icon.png bundled alongside)
  macOS   : dist/Nomina.app              (icon embedded from build/icon.icns)

Build from project root:
  pyinstaller build/nomina.spec --noconfirm --clean
"""
from pathlib import Path
import sys

# SPECPATH points to this file's folder (build/); project root is its parent.
ICON_DIR = Path(SPECPATH).resolve()
ROOT = ICON_DIR.parent

if sys.platform == "win32":
    ICON_PATH = str(ICON_DIR / "icon.ico")
elif sys.platform == "darwin":
    ICON_PATH = str(ICON_DIR / "icon.icns")
else:
    ICON_PATH = str(ICON_DIR / "icon.png")

datas = [
    (str(ROOT / "index.html"), "."),
    (str(ROOT / "style.css"),  "."),
    (str(ROOT / "script.js"),  "."),
    (str(ROOT / "fonts"),      "fonts"),
    (str(ICON_DIR / "icon.png"), "."),
]

a = Analysis(
    [str(ROOT / "main.py")],
    pathex=[str(ROOT)],
    binaries=[],
    datas=datas,
    hiddenimports=["webview", "webview.platforms.cef", "webview.platforms.edgechromium",
                   "webview.platforms.gtk", "webview.platforms.cocoa", "webview.platforms.qt"],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data)

# UPX: enable on Windows + Linux. Skip on macOS — UPX often breaks
# Mach-O bundles and trips Gatekeeper on notarized apps.
USE_UPX = sys.platform != "darwin"

# Don't let UPX touch these — known to corrupt or trip AV heuristics.
UPX_EXCLUDE = [
    "vcruntime140.dll",
    "vcruntime140_1.dll",
    "python3.dll",
    "python311.dll",
    "python312.dll",
    "ucrtbase.dll",
    "api-ms-win-*.dll",
    "WebView2Loader.dll",
    "msvcp140.dll",
    "_uuid.pyd",
]

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="Nomina",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=USE_UPX,
    upx_exclude=UPX_EXCLUDE,
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=ICON_PATH if Path(ICON_PATH).exists() else None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=USE_UPX,
    upx_exclude=UPX_EXCLUDE,
    name="Nomina",
)

if sys.platform == "darwin":
    app = BUNDLE(
        coll,
        name="Nomina.app",
        icon=ICON_PATH if Path(ICON_PATH).exists() else None,
        bundle_identifier="com.emkh.nomina",
        info_plist={
            "CFBundleName": "Nomina",
            "CFBundleDisplayName": "Nomina",
            "CFBundleShortVersionString": "1.0.0",
            "NSHighResolutionCapable": True,
        },
    )
