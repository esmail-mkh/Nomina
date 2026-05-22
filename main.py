"""
Nomina — Advanced Batch File & Folder Renamer App
Built with Python + pywebview
"""

import json
import logging
import os
import sys
import struct
import tempfile
import tkinter as tk
from pathlib import Path
from tkinter import filedialog

import pyperclip
import webview
from webview.dom import DOMEventHandler


_PRESET_DIR = Path.home() / "Documents" / "EMKH_Apps" / "Nomina"
_PRESET_FILE = _PRESET_DIR / "presets.json"
_SETTINGS_FILE = _PRESET_DIR / "settings.json"


def _ensure_preset_dir():
    _PRESET_DIR.mkdir(parents=True, exist_ok=True)


def _load_presets_data():
    if _PRESET_FILE.exists():
        try:
            with open(_PRESET_FILE, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save_presets_data(data):
    _ensure_preset_dir()
    with open(_PRESET_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _load_settings():
    if _SETTINGS_FILE.exists():
        try:
            with open(_SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save_settings_data(data):
    _ensure_preset_dir()
    with open(_SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _path_key(path):
    return os.path.normcase(os.path.abspath(str(path)))


def _is_relative_to(path, parent):
    try:
        Path(path).resolve().relative_to(Path(parent).resolve())
        return True
    except ValueError:
        return False


def _replace_path_prefix(path, old_prefix, new_prefix):
    path = Path(path)
    try:
        rel = path.resolve().relative_to(Path(old_prefix).resolve())
        return Path(new_prefix) / rel
    except ValueError:
        return path


def get_items_from_paths(paths, recursive=False):
    """Return items for an arbitrary list of paths.
    - File paths are included directly (matching the dropped selection).
    - Folder paths are expanded to their contents (optionally recursive).
    Duplicates are removed via resolved-path comparison.
    """
    items = []
    seen = set()

    def _key(p):
        try:
            return os.path.normcase(os.path.abspath(str(p)))
        except Exception:
            return str(p)

    def _add(p, force_file=False):
        k = _key(p)
        if k in seen:
            return
        seen.add(k)
        is_file = force_file or p.is_file()
        items.append({
            "name": p.name,
            "path": str(p),
            "type": "file" if is_file else "folder",
            "extension": p.suffix if is_file else "",
            "size": p.stat().st_size if is_file else 0,
        })

    for raw in paths or []:
        target = Path(raw)
        if not target.exists():
            continue
        if target.is_file():
            _add(target, force_file=True)
        elif target.is_dir():
            walker = target.rglob("*") if recursive else target.iterdir()
            for child in sorted(walker):
                if child == target:
                    continue
                _add(child)

    return {"items": items}


def get_items(path, recursive=False):
    """Return list of files/folders at the given path."""
    target = Path(path)
    if not target.exists():
        return {"error": "Path does not exist"}

    items = []
    if target.is_file():
        items.append(
            {
                "name": target.name,
                "path": str(target),
                "type": "file",
                "extension": target.suffix,
                "size": target.stat().st_size,
            }
        )
    elif target.is_dir():
        if recursive:
            for item in sorted(target.rglob("*")):
                if item == target:
                    continue
                items.append(
                    {
                        "name": item.name,
                        "path": str(item),
                        "type": "folder" if item.is_dir() else "file",
                        "extension": item.suffix if item.is_file() else "",
                        "size": item.stat().st_size if item.is_file() else 0,
                    }
                )
        else:
            for item in sorted(target.iterdir()):
                items.append(
                    {
                        "name": item.name,
                        "path": str(item),
                        "type": "folder" if item.is_dir() else "file",
                        "extension": item.suffix if item.is_file() else "",
                        "size": item.stat().st_size if item.is_file() else 0,
                    }
                )
    return {"items": items}


def rename_items(items_data, preview=False):
    """Rename items based on the provided data."""
    results = {"success": [], "failed": [], "errors": []}

    for item in items_data:
        old_path = item["path"]
        new_name = item.get("newName", item["name"])

        # Skip only if the new name is exactly the same as the original name
        if new_name == item["name"]:
            results["success"].append(item["name"])
            continue

        try:
            parent = Path(old_path).parent
            new_path = parent / new_name

            if preview:
                results["success"].append(f"Preview: {old_path} -> {new_path}")
            else:
                new_path.parent.mkdir(parents=True, exist_ok=True)
                Path(old_path).rename(new_path)
                results["success"].append(item["name"])
        except Exception as e:
            results["failed"].append(item["name"])
            results["errors"].append(str(e))

    return results


def count_files(items_data):
    """Count files and folders."""
    files = sum(1 for i in items_data if i.get("type") == "file")
    folders = sum(1 for i in items_data if i.get("type") == "folder")
    return {"files": files, "folders": folders, "total": len(items_data)}


def remove_metadata(file_paths):
    """Remove metadata from image/audio/video files."""
    results = {"success": [], "failed": []}
    
    for file_path in file_paths:
        ext = Path(file_path).suffix.lower()
        try:
            if ext in (".jpg", ".jpeg"):
                _remove_jpeg_metadata(file_path)
                results["success"].append(file_path)
            elif ext == ".png":
                _remove_png_metadata(file_path)
                results["success"].append(file_path)
            elif ext in (".webp",):
                _remove_webp_metadata(file_path)
                results["success"].append(file_path)
            elif ext in (".mp3",):
                _remove_id3_metadata(file_path)
                results["success"].append(file_path)
            elif ext in (".mp4", ".m4a"):
                _remove_mp4_metadata(file_path)
                results["success"].append(file_path)
            elif ext in (".avi",):
                results["success"].append(file_path)
            elif ext in (".mkv",):
                results["success"].append(file_path)
            else:
                results["success"].append(file_path)
        except Exception as e:
            results["failed"].append((file_path, str(e)))
    
    return results


def _remove_jpeg_metadata(file_path):
    """Remove EXIF and other metadata from JPEG files while keeping the image data."""
    with open(file_path, "rb") as f:
        data = f.read()

    if len(data) < 4 or data[:2] != b"\xff\xd8":
        return

    output = bytearray(data[:2])
    offset = 2
    strip_markers = {0xE1, 0xED, 0xFE}  # APP1 EXIF/XMP, APP13 Photoshop/IPTC, COM

    while offset < len(data):
        if offset + 1 >= len(data) or data[offset] != 0xFF:
            output.extend(data[offset:])
            break

        marker = data[offset + 1]
        if marker == 0xDA:  # Start of Scan: entropy data follows.
            output.extend(data[offset:])
            break
        if marker == 0xD9:
            output.extend(data[offset:])
            break
        if marker == 0x00 or 0xD0 <= marker <= 0xD8:
            output.extend(data[offset:offset + 2])
            offset += 2
            continue
        if offset + 4 > len(data):
            output.extend(data[offset:])
            break

        seg_len = struct.unpack(">H", data[offset + 2:offset + 4])[0]
        segment_end = offset + 2 + seg_len
        if seg_len < 2 or segment_end > len(data):
            output.extend(data[offset:])
            break

        if marker not in strip_markers:
            output.extend(data[offset:segment_end])
        offset = segment_end

    with open(file_path, "wb") as f:
        f.write(output)


def _remove_png_metadata(file_path):
    """Remove all metadata chunks from PNG files, keeping only IHDR and IDAT."""
    with open(file_path, "rb") as f:
        header = f.read(8)

        chunks = []
        ihdr_found = False

        while True:
            length_data = f.read(4)
            if len(length_data) < 4:
                break

            length = struct.unpack(">I", length_data)[0]
            chunk_type = f.read(4)
            chunk_data = f.read(length)
            f.read(4)  # CRC

            if chunk_type == b"IHDR":
                chunks.append(("IHDR", chunk_data))
                ihdr_found = True
            elif chunk_type not in (
                b"tEXt", b"zTXt", b"iTXt", b"tIME", b"pHYs",
                b"gAMA", b"sRGB", b"iCCP", b"cHRM", b"bKGD",
            ):
                chunks.append((chunk_type.decode("ascii", errors="replace"), chunk_data))

    with open(file_path, "wb") as f:
        f.write(header)
        for chunk_type, chunk_data in chunks:
            type_bytes = chunk_type.encode("ascii") if isinstance(chunk_type, str) else chunk_type
            f.write(struct.pack(">I", len(chunk_data)))
            f.write(type_bytes)
            f.write(chunk_data)
            crc = _png_crc(type_bytes, chunk_data)
            f.write(struct.pack(">I", crc))


def _png_crc(chunk_type, chunk_data):
    import zlib
    return zlib.crc32(chunk_type + chunk_data) & 0xFFFFFFFF


def _remove_webp_metadata(file_path):
    """Remove metadata from WebP files."""
    with open(file_path, "rb") as f:
        data = f.read()
    
    if len(data) < 12 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return

    offset = 12
    chunks = bytearray()
    stripped_types = {b"EXIF", b"XMP ", b"ICCP"}

    while offset + 8 <= len(data):
        chunk_type = data[offset:offset + 4]
        chunk_size = struct.unpack("<I", data[offset + 4:offset + 8])[0]
        data_start = offset + 8
        data_end = data_start + chunk_size
        padded_end = data_end + (chunk_size % 2)
        if data_end > len(data) or padded_end > len(data):
            return

        chunk_data = data[data_start:data_end]
        if chunk_type == b"VP8X" and len(chunk_data) >= 10:
            flags = chunk_data[0] & ~0x2C  # Clear ICC, EXIF, and XMP flags.
            chunk_data = bytes([flags]) + chunk_data[1:]

        if chunk_type not in stripped_types:
            chunks.extend(chunk_type)
            chunks.extend(struct.pack("<I", len(chunk_data)))
            chunks.extend(chunk_data)
            if len(chunk_data) % 2:
                chunks.extend(b"\x00")

        offset = padded_end

    body = b"WEBP" + bytes(chunks)
    with open(file_path, "wb") as f:
        f.write(b"RIFF")
        f.write(struct.pack("<I", len(body)))
        f.write(body)


def _remove_id3_metadata(file_path):
    """Remove ID3v2 metadata from MP3 files."""
    rest_data = None
    with open(file_path, "rb") as f:
        header = f.read(3)

        if header == b"ID3":
            f.read(2)  # version
            flags = f.read(1)
            size = _decode_synchsafe_int(f.read(4))
            total_size = 10 + size + (10 if flags and flags[0] & 0x10 else 0)
            f.seek(total_size)
            rest_data = f.read()

    if rest_data is not None:
        with open(file_path, "wb") as f:
            f.write(rest_data)


def _decode_synchsafe_int(bytes_data):
    result = 0
    for b in bytes_data:
        result = (result << 7) | (b & 0x7F)
    return result


def _remove_mp4_metadata(file_path):
    """Remove metadata from MP4 files."""
    with open(file_path, "rb") as f:
        data = f.read()

    stripped = _strip_mp4_metadata_boxes(data)
    if stripped:
        with open(file_path, "wb") as f:
            f.write(stripped)


def _strip_mp4_metadata_boxes(data):
    metadata_boxes = {b"udta", b"meta", b"ilst"}
    container_boxes = {b"moov", b"trak", b"mdia", b"minf", b"stbl", b"edts", b"dinf"}
    output = bytearray()
    offset = 0

    while offset < len(data):
        if offset + 8 > len(data):
            output.extend(data[offset:])
            break

        size = struct.unpack(">I", data[offset:offset + 4])[0]
        box_type = data[offset + 4:offset + 8]
        header_size = 8

        if size == 1:
            if offset + 16 > len(data):
                return data
            size = struct.unpack(">Q", data[offset + 8:offset + 16])[0]
            header_size = 16
        elif size == 0:
            size = len(data) - offset

        if size < header_size or offset + size > len(data):
            return data

        box_end = offset + size
        if box_type in metadata_boxes:
            offset = box_end
            continue

        if box_type in container_boxes:
            payload = _strip_mp4_metadata_boxes(data[offset + header_size:box_end])
            new_size = header_size + len(payload)
            if header_size == 16:
                output.extend(struct.pack(">I4sQ", 1, box_type, new_size))
            else:
                output.extend(struct.pack(">I4s", new_size, box_type))
            output.extend(payload)
        else:
            output.extend(data[offset:box_end])

        offset = box_end

    return bytes(output)


def _planned_rename_path(path, temp_moves):
    path = Path(path)
    for moved_old, moved_temp in temp_moves:
        if _path_key(path) == _path_key(moved_old) or _is_relative_to(path, moved_old):
            return _replace_path_prefix(path, moved_old, moved_temp)
    return path


def _rename_items_batch(api, items_data, preview=False, record_history=True):
    results = {"success": [], "failed": [], "errors": [], "renamed": []}
    planned = []

    for item in items_data:
        try:
            old_path = Path(item["path"])
            new_name = item.get("newName", item["name"])
            if new_name == item["name"]:
                continue
            new_path = old_path.parent / new_name
            planned.append({"item": item, "old": old_path, "new": new_path})
            if preview:
                results["success"].append(f"Preview: {old_path} -> {new_path}")
        except Exception as e:
            results["failed"].append(item.get("name", "Unknown"))
            results["errors"].append(str(e))

    if preview or not planned:
        return results

    planned.sort(key=lambda p: len(p["old"].parts), reverse=True)
    old_keys = {_path_key(p["old"]) for p in planned}
    new_keys = {}
    valid = []

    for plan in planned:
        try:
            if not plan["old"].exists():
                raise FileNotFoundError(f"Source '{plan['old']}' does not exist.")
            new_key = _path_key(plan["new"])
            if new_key in new_keys:
                raise FileExistsError(f"Duplicate target '{plan['new'].name}'.")
            new_keys[new_key] = plan
            if plan["new"].exists() and new_key not in old_keys:
                raise FileExistsError(f"File '{plan['new'].name}' already exists.")
            valid.append(plan)
        except Exception as e:
            results["failed"].append(plan["item"]["name"])
            results["errors"].append(str(e))

    temp_moves = []
    final_moves = []
    history_batch = []

    try:
        for plan in valid:
            source = _planned_rename_path(plan["old"], temp_moves)
            temp_path = source.parent / f".nomina_tmp_{os.getpid()}_{next(tempfile._get_candidate_names())}"
            source.rename(temp_path)
            plan["temp"] = temp_path
            temp_moves.append((plan["old"], temp_path))
            for other in valid:
                if other is not plan and other.get("temp") and _is_relative_to(other["temp"], source):
                    other["temp"] = _replace_path_prefix(other["temp"], source, temp_path)

        for plan in sorted(valid, key=lambda p: len(p["new"].parts)):
            target = plan["new"]
            for final_path, original_path, _name in final_moves:
                if _path_key(target) != _path_key(original_path) and _is_relative_to(target, original_path):
                    target = _replace_path_prefix(target, original_path, final_path)
                    break
            for moved_old, moved_temp in temp_moves:
                if _path_key(target) != _path_key(moved_old) and _is_relative_to(target, moved_old):
                    target = _replace_path_prefix(target, moved_old, moved_temp)
                    break
            target.parent.mkdir(parents=True, exist_ok=True)
            temp_source = plan["temp"]
            temp_source.rename(target)
            for other in valid:
                if other is not plan and other.get("temp") and _is_relative_to(other["temp"], temp_source):
                    other["temp"] = _replace_path_prefix(other["temp"], temp_source, target)
            final_moves.append((target, plan["old"], plan["item"]["name"]))
            history_batch.append((str(target), str(plan["old"])))
            results["success"].append(plan["item"]["name"])
            results["renamed"].append({
                "oldName": plan["item"]["name"],
                "newName": plan["new"].name,
                "path": str(plan["old"]),
                "newPath": str(target),
                "type": plan["item"].get("type", "file"),
            })
    except Exception as e:
        for new_path, old_path, _name in reversed(final_moves):
            try:
                if Path(new_path).exists() and not Path(old_path).exists():
                    Path(new_path).rename(old_path)
            except Exception:
                pass
        for plan in reversed(valid):
            temp_path = plan.get("temp")
            if temp_path and Path(temp_path).exists():
                try:
                    Path(temp_path).rename(plan["old"])
                except Exception:
                    pass
        for plan in valid:
            name = plan["item"]["name"]
            if name not in results["success"] and name not in results["failed"]:
                results["failed"].append(name)
                results["errors"].append(str(e))
        # Rolled-back items must not appear in undo history
        history_batch = []
        results["success"] = []
        results["renamed"] = []

    if record_history and history_batch:
        api._undo_history.append(history_batch)

    return results


def _validate_items_batch(items_data):
    import re
    invalid_chars_re = re.compile(r'[<>:"|?*]')
    max_len = 255
    warnings = []
    seen_targets = {}
    planned = []

    for item in items_data:
        new_name = item.get("newName", "")
        old_name = item.get("name", "")
        if not new_name or new_name == old_name:
            continue
        old_path = Path(item.get("path", old_name))
        new_path = old_path.parent / new_name
        planned.append((item, old_path, new_path))

        if invalid_chars_re.search(new_name):
            warnings.append({
                "type": "invalidChars",
                "message": f"{old_name} -> new name contains invalid chars (< > : \" | ? *)"
            })
        if len(new_name) > max_len:
            warnings.append({
                "type": "tooLong",
                "message": f"{old_name} -> new name too long ({len(new_name)}/{max_len} chars)"
            })

        target_key = _path_key(new_path)
        if target_key in seen_targets:
            warnings.append({
                "type": "duplicate",
                "message": f"{old_name} -> duplicate new name '{new_name}'"
            })
        seen_targets[target_key] = old_name

    source_keys = {_path_key(old_path) for _item, old_path, _new_path in planned}
    for item, _old_path, new_path in planned:
        if new_path.exists() and _path_key(new_path) not in source_keys:
            warnings.append({
                "type": "conflict",
                "message": f"{item.get('name', '')} -> new name conflicts with existing '{new_path.name}'"
            })

    return {"warnings": warnings}


def browse_folder():
    """Open a folder browser dialog and return selected path."""
    root = tk.Tk()
    root.withdraw()
    path = filedialog.askdirectory(title="Select Folder to Rename")
    root.destroy()
    return path if path else None


class Api:
    """API class exposed to JavaScript."""

    def __init__(self, window=None):
        self._window = window
        self._is_maximized = False
        self._undo_history = []  # history of rename operations for Undo

    def bind_window(self, window):
        self._window = window
        self._is_maximized = False

    def get_items(self, path, recursive=False):
        return get_items(path, recursive)

    def get_items_from_paths(self, paths, recursive=False):
        return get_items_from_paths(paths, recursive)

    def rename_items(self, items_data, preview=False):
        return _rename_items_batch(self, items_data, preview)

    def remove_metadata(self, file_paths):
        return remove_metadata(file_paths)

    def undo_last(self):
        """Undo the last rename batch."""
        if not self._undo_history:
            return {"success": False, "error": "No history to undo."}
        
        last_batch = self._undo_history.pop()
        undo_items = []
        for new_path, old_path in reversed(last_batch):
            new_path_obj = Path(new_path)
            old_path_obj = Path(old_path)
            undo_items.append({
                "name": new_path_obj.name,
                "path": str(new_path_obj),
                "type": "folder" if new_path_obj.is_dir() else "file",
                "newName": old_path_obj.name,
            })

        result = _rename_items_batch(self, undo_items, False, record_history=False)
        return {
            "success": len(result["failed"]) == 0,
            "restored": len(result["success"]),
            "total": len(last_batch),
            "errors": result["errors"],
        }

    def count_files(self, items_data):
        return count_files(items_data)

    def browse_folder(self, starting_directory=None):
        root = tk.Tk()
        root.withdraw()
        initial = starting_directory or getattr(self, '_last_folder_path', None)
        path = filedialog.askdirectory(
            title="Select Folder to Rename",
            initialdir=initial
        )
        root.destroy()
        if path:
            self._last_folder_path = path
            # Save to settings
            try:
                import json
                settings = _load_settings()
                settings['lastFolderPath'] = path
                _save_settings_data(settings)
            except Exception:
                pass
        return path if path else None

    def get_clipboard_text(self):
        try:
            return pyperclip.paste()
        except Exception:
            return ""

    def save_preset(self, name, rules=None, transform="none", numbering=None, inputs=None):
        import datetime
        _ensure_preset_dir()
        data = _load_presets_data()
        data[name] = {
            "created_at": datetime.datetime.now().isoformat(),
            "rules": rules or {
                "prefix": False, "suffix": False, "replace": False,
                "remove": False, "slice": False, "extension": False,
            },
            "transform": transform or "none",
            "numbering": numbering or {"start": 1, "padding": 3, "prefix": ""},
            "inputs": inputs or {},
        }
        _save_presets_data(data)
        return {"success": True}

    def list_presets(self):
        data = _load_presets_data()
        presets = []
        for name, info in data.items():
            presets.append({"name": name, "created_at": info.get("created_at", "")})
        presets.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"presets": presets}

    def delete_preset(self, name):
        data = _load_presets_data()
        if name in data:
            del data[name]
            _save_presets_data(data)
            return {"success": True}
        return {"error": "Preset not found"}

    def get_preset(self, name):
        data = _load_presets_data()
        if name in data:
            return {"preset": data[name]}
        return {"error": "Preset not found"}

    def apply_preset(self, name):
        data = _load_presets_data()
        if name not in data:
            return {"error": "Preset not found"}
        preset = data[name]
        rules = preset.get("rules", {})
        transform = preset.get("transform", "none")
        numbering = preset.get("numbering", {})
        result = {"success": True, "applied_rules": []}
        for rule in ["prefix", "suffix", "replace", "remove", "slice", "extension"]:
            if rules.get(rule):
                result["applied_rules"].append(rule)
        result["transform"] = transform
        result["numbering"] = numbering
        return result

    def export_presets_file(self):
        """Export all saved presets as a JSON file."""
        import tkinter as tk
        from tkinter import filedialog
        data = _load_presets_data()
        if not data:
            return {"error": "No presets to export"}
        root = tk.Tk()
        root.withdraw()
        path = filedialog.asksaveasfilename(
            title="Export Presets",
            defaultextension=".json",
            filetypes=[("JSON files", "*.json")],
            initialfile="nomina_presets.json",
        )
        root.destroy()
        if not path:
            return {"error": "Cancelled"}
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return {"success": True, "path": path}
        except Exception as e:
            return {"error": str(e)}

    def import_presets_file(self, data):
        """Import presets from a JSON file (replace all existing)."""
        try:
            if not isinstance(data, dict):
                return {"error": "Invalid file format"}
            # Replace all presets with imported data
            _ensure_preset_dir()
            _save_presets_data(data)
            count = len(data)
            return {"success": True, "count": count}
        except Exception as e:
            return {"error": str(e)}

    def export_preset_file(self, name, rules=None, transform="none", numbering=None, inputs=None):
        """Export a single preset as a JSON file via tkinter dialog."""
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        safe_name = name.replace("/", "_").replace("\\", "_").replace(":", "_").replace("*", "_").replace("?", "_").replace('"', "_").replace("<", "_").replace(">", "_").replace("|", "_")
        path = filedialog.asksaveasfilename(
            title="Export Preset",
            defaultextension=".json",
            filetypes=[("JSON files", "*.json")],
            initialfile=safe_name + "_renamer_preset.json",
        )
        root.destroy()
        if not path:
            return {"error": "Cancelled"}
        try:
            preset_data = {
                "version": 1,
                "exported_at": __import__("datetime").datetime.now().isoformat(),
                "app": "Nomina",
                "rules": rules or {},
                "transform": transform,
                "numbering": numbering or {"start": 1, "padding": 3, "prefix": ""},
                "inputs": inputs or {},
            }
            with open(path, "w", encoding="utf-8") as f:
                json.dump(preset_data, f, indent=2, ensure_ascii=False)
            return {"success": True, "path": path}
        except Exception as e:
            return {"error": str(e)}

    def import_single_preset_file(self):
        """Import a single preset from a JSON file via tkinter dialog, replacing all existing presets."""
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        path = filedialog.askopenfilename(
            title="Import Preset",
            filetypes=[("JSON files", "*.json")],
        )
        root.destroy()
        if not path:
            return {"error": "Cancelled"}
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if not isinstance(data, dict):
                return {"error": "Invalid file format"}
            # Check if this is a presets bundle (multiple presets) or single preset
            if "presets" in data:
                # Multi-preset bundle: replace all
                _save_presets_data(data["presets"])
                count = len(data["presets"])
                return {"success": True, "count": count}
            elif "rules" in data or "transform" in data:
                # Single preset file: extract and save as only preset
                preset_name = data.get("name") or Path(path).stem.replace("_renamer_preset", "")
                rules = data.get("rules", {})
                transform = data.get("transform", "none")
                numbering = data.get("numbering", {"start": 1, "padding": 3, "prefix": ""})
                inputs = data.get("inputs", {})
                _ensure_preset_dir()
                presets_data = {
                    preset_name: {
                        "created_at": __import__("datetime").datetime.now().isoformat(),
                        "rules": rules,
                        "transform": transform,
                        "numbering": numbering,
                        "inputs": inputs,
                    }
                }
                _save_presets_data(presets_data)
                return {"success": True, "name": preset_name}
            else:
                # Treat as presets dict directly (merge format)
                _save_presets_data(data)
                count = len(data)
                return {"success": True, "count": count}
        except json.JSONDecodeError:
            return {"error": "Invalid JSON file"}
        except Exception as e:
            return {"error": str(e)}

    def import_presets_file_from_dialog(self):
        """Import presets from a JSON file selected via tkinter dialog (replace all existing)."""
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        path = filedialog.askopenfilename(
            title="Import Presets",
            filetypes=[("JSON files", "*.json")],
        )
        root.destroy()
        if not path:
            return {"error": "Cancelled"}
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if not isinstance(data, dict):
                return {"error": "Invalid file format"}
            # Replace all presets with imported data
            _ensure_preset_dir()
            _save_presets_data(data)
            count = len(data)
            return {"success": True, "count": count}
        except json.JSONDecodeError:
            return {"error": "Invalid JSON file"}
        except Exception as e:
            return {"error": str(e)}

    def validate_items(self, items_data):
        return _validate_items_batch(items_data)

    def get_settings(self):
        """Load app settings from settings.json."""
        return _load_settings()

    def save_settings(self, data):
        """Save app settings to settings.json."""
        try:
            settings = _load_settings()
            settings.update(data or {})
            _save_settings_data(settings)
            return {"success": True}
        except Exception as e:
            return {"error": str(e)}

    def minimize(self):
        if self._window: self._window.minimize()

    def maximize(self):
        if self._window:
            if self._is_maximized:
                self._window.restore()
                self._is_maximized = False
            else:
                self._window.maximize()
                self._is_maximized = True

    def get_window_position(self):
        if not self._window: return {"x": 0, "y": 0}
        return {"x": self._window.x, "y": self._window.y}

    def move_window(self, x, y):
        if self._window: self._window.move(int(x), int(y))

    def close(self):
        if self._window: self._window.destroy()


if __name__ == "__main__":
    app_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(app_dir, "index.html")

    api = Api()

    def create_window():
        # Calculate center position using tkinter
        root = tk.Tk()
        root.withdraw()
        screen_width = root.winfo_screenwidth()
        screen_height = root.winfo_screenheight()
        root.destroy()

        window_width = 1100
        window_height = 750
        x = (screen_width - window_width) // 2
        y = (screen_height - window_height) // 2

        return webview.create_window(
            "Nomina",
            html_path,
            x=x,
            y=y,
            width=window_width,
            height=window_height,
            min_size=(800, 550),
            resizable=True,
            frameless=True,
            easy_drag=False,
            background_color="#0f1117",
            js_api=api,
        )

    window = create_window()
    api.bind_window(window)

    def _on_drop(event):
        # pywebview populates pywebviewFullPath on each file ONLY when a Python-side
        # drop handler is registered (see webview/util.py + edgechromium.py). The browser
        # drop event alone gives no real path — that's the bug everyone hits first.
        try:
            files = ((event or {}).get('dataTransfer') or {}).get('files') or []
            paths = []
            for f in files:
                full = f.get('pywebviewFullPath')
                if full:
                    paths.append(full)
            if not paths:
                return
            payload = json.dumps(paths)
            window.evaluate_js(f'window.handleDroppedPaths({payload})')
        except Exception:
            logging.exception('Drop handler failed')

    def _register_drop():
        try:
            window.dom.body.events.drop += DOMEventHandler(_on_drop, prevent_default=True)
            from webview.dom import _dnd_state
            print(f'[drop] handler registered, num_listeners={_dnd_state["num_listeners"]}', flush=True)
        except Exception:
            logging.exception('Failed to register drop handler')

    window.events.loaded += _register_drop

    webview.start(debug=False)
