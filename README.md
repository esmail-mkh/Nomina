<div align="center">

# ✦ Nomina ✦

### Advanced Batch File & Folder Renamer

A modern, beautiful desktop app for renaming files and folders in bulk — with live preview, a flexible rule engine, presets, and a fully bilingual UI (English / فارسی).

<p>
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white&style=for-the-badge" alt="Python" />
  <img src="https://img.shields.io/badge/pywebview-7C6DFA?logo=python&logoColor=white&style=for-the-badge" alt="pywebview" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge" alt="CSS3" />
</p>

<p>
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows" />
  <img src="https://img.shields.io/badge/license-MIT-3ecf8e?style=flat-square" />
  <img src="https://img.shields.io/badge/status-active-7c6dfa?style=flat-square" />
  <img src="https://img.shields.io/badge/i18n-EN%20%2F%20FA-9d91fb?style=flat-square" />
</p>

[فارسی 🇮🇷](./README-fa.md) · [Features](#-features) · [Install](#-installation) · [Usage](#-usage) · [Shortcuts](#-keyboard-shortcuts)

</div>

---

## ✨ Overview

**Nomina** turns the tedious task of renaming dozens — or thousands — of files into a smooth, visual workflow. Drop a folder, stack up rules (prefix, suffix, replace, slice, transform, numbering), and watch the new names update live before a single file is touched on disk.

> Crafted with care for clarity and speed. No bloat, no telemetry, no surprises.

---

## 🚀 Features

| | |
|---|---|
| ⚡ **Batch Rename** | Rename hundreds of files & folders in one sweep |
| 🔍 **Live Filter** | Quickly narrow down items by name |
| 🎨 **Rule Engine** | Mix prefix, suffix, replace, remove, slice, case-transform, and numbering |
| 🔄 **Live Preview** | See every new name update in real time as you tweak rules |
| 🧠 **Smart Validation** | Detects invalid characters, name conflicts, and reserved names |
| 💾 **Presets** | Save and reuse your favorite rule combinations |
| 🌐 **Bilingual UI** | Full English & Persian (RTL) support, switch on the fly |
| 🌗 **Dark / Light** | Beautiful themes that respect your eyes |
| 🖱️ **Drag & Drop** | Drop a folder anywhere on the window to load it |
| 📋 **Clipboard Paste** | `Ctrl+Shift+V` to load a copied path instantly |
| 🛡️ **Safe by Default** | Nothing is renamed until you hit **Rename** — preview first, commit later |
| 🎯 **Metadata Cleanup** | Optional removal of file metadata on rename |

---

## 🧩 Rule Engine

Build complex rename pipelines by combining any of these rules:

- **Prefix / Suffix** — add text before or after the name
- **Replace** — find & replace, with optional regex
- **Remove** — strip out unwanted substrings
- **Slice** — keep a portion of the original name by index
- **Transform** — UPPERCASE, lowercase, Title Case, camelCase, kebab-case, snake_case
- **Numbering** — sequential numbers with custom start, step, and zero-padding
- **Extension** — change or normalize file extensions

Each rule can be **toggled independently** and applied to **all items** or just the **selected ones**.

---

## 📦 Installation

### Requirements

- **Python 3.10+**
- **Windows 10/11** (uses Edge WebView2 via pywebview)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/esmail-mkh/nomina.git
cd nomina

# 2. (Recommended) Create a virtual environment
python -m venv .venv
.venv\Scripts\activate

# 3. Install dependencies
pip install pywebview pyperclip

# 4. Run the app
python main.py
```

> 💡 **Tip:** On first run, Nomina creates its config folder at  
> `Documents\EMKH_Apps\Nomina\` for your presets and settings.

---

## 🎬 Usage

1. **Load** a folder — click *Browse*, paste a path, or drag-and-drop a folder onto the window.
2. **Filter** (optional) — narrow the list to what you want to rename.
3. **Select** items (optional) — leave nothing checked to apply to all, or tick specific rows.
4. **Configure rules** — turn on Prefix / Suffix / Replace / Numbering / Transform / etc.
5. **Preview** — the *New Name* column updates live as you change rules.
6. **Validate** — click *Validate* to surface any invalid names or conflicts.
7. **Rename** — click *Rename* to commit changes to disk.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Load path from input |
| `Ctrl + Shift + V` | Paste path from clipboard and load |
| `Ctrl + S` | Execute Rename |
| `Esc` | Close any open modal |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| 🐍 **Core** | Python 3.10+ |
| 🪟 **Window / Bridge** | [pywebview](https://pywebview.flowrl.com/) |
| 🎨 **UI** | HTML5 · CSS3 · Vanilla JavaScript |
| 📋 **Utilities** | pyperclip, pathlib, tkinter (folder picker) |

</div>

---

## 📁 Project Structure

```
nomina/
├── main.py          # Python entry point + pywebview API bridge
├── index.html       # Main UI markup
├── style.css        # All styling (dark + light themes, RTL support)
├── script.js        # UI logic, i18n, rule engine, preview
└── fonts/           # Bundled fonts (Outfit, IBM Plex Mono, Vazirmatn)
```

---

## 👤 Developer

<div align="center">

**E.MKH** — _Python Developer_  
_Crafting tools that feel effortless._

[![GitHub](https://img.shields.io/badge/GitHub-esmail--mkh-181717?logo=github&style=for-the-badge)](https://github.com/esmail-mkh)
[![Telegram](https://img.shields.io/badge/Telegram-@esisensei-0088CC?logo=telegram&style=for-the-badge)](https://t.me/esisensei)

</div>

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

If Nomina saved you time, consider giving it a ⭐ on GitHub — it really helps!

<sub>Made with ☕ and a little Python magic.</sub>

</div>
