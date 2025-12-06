# Asset Management Documentation - Modular Structure

## 📁 Project Structure

```
documentation addon/
├── .github/
│   └── copilot-instructions.md
├── .bak/
│   ├── index_backup.html
│   ├── styles_old.css
│   ├── script_old.js
│   ├── styles_monolith.css       # Backup before CSS split
│   └── README_old.md
├── css/                          # 🎨 Modular CSS (5 Files)
│   ├── main.css                  # Entry point (imports all)
│   ├── base.css                  # Foundation (variables, reset, typography, preloader)
│   ├── layout.css                # Structure (header, grid, sidebar, TOC, footer)
│   ├── components.css            # UI Elements (buttons, cards, callouts, tables)
│   └── responsive.css            # Mobile & Tablet breakpoints
├── icon/
│   └── logo.png                  # 32x32 logo image
├── index.html                    # Main HTML (1470+ lines with templates)
├── script.js                     # JavaScript (single file)
└── README.md                     # This file
```

---

## 🎯 Architecture Overview

### Single-Page Application (SPA)
- **HTML**: One `index.html` with `<template>` tags for all sections
- **CSS**: Modular structure imported via `main.css`
- **JavaScript**: ES6 modules imported via `main.js`

### 3-Column Layout
```
┌────────────────────────────────────────────────────┐
│  HEADER (Fixed, 60px)                              │
├─────────┬──────────────────────────┬───────────────┤
│ SIDEBAR │    MAIN CONTENT          │     TOC       │
│ (240px) │    (flexible)            │   (200px)     │
│         │                          │               │
│ Search  │  Dynamic content from    │ Auto-gen from │
│ Nav     │  templates               │ h2/h3 headings│
│         │                          │               │
│         │                          │               │
└─────────┴──────────────────────────┴───────────────┘
│                FOOTER (Full width)                 │
└────────────────────────────────────────────────────┘
```

---

## 🔧 How It Works

### 1. CSS Architecture (5 Files - Optimized Split)
CSS is modularly organized for easy maintenance:

| File | Lines | Purpose |
|------|-------|---------|
| **`main.css`** | 70 | Entry point - imports all CSS files |
| **`base.css`** | 335 | Foundation (variables, reset, typography, preloader) |
| **`layout.css`** | 435 | Structure (header, grid, sidebar, content, TOC, footer) |
| **`components.css`** | 485 | UI Elements (buttons, cards, callouts, code blocks, tables) |
| **`responsive.css`** | 100 | Mobile & tablet breakpoints |

**Load Order**: Base → Layout → Components → Responsive  
**Total**: ~1400 lines (vs 1389 lines monolithic)  
**Benefits**: Easy to find/edit, better caching, clear separation of concerns

### 2. JavaScript Architecture
All JavaScript is split into ES6 modules:

**Core** → Navigation & routing logic  
**UI** → Interface components (sidebar, TOC, theme)  
**Utils** → Helper functions (debounce, copy code)

**Entry Point**: `main.js` imports all modules and exposes `navigateTo()` globally

### 3. Content Loading
- All sections stored in `<template>` tags (hidden)
- JavaScript clones template content → Fades out → Replaces HTML → Fades in
- TOC auto-generated from `h2` and `h3` headings
- URL hash changes to reflect current section

---

## 📝 Development Guidelines

### Editing CSS
1. **Change colors/variables**: Edit `css/base.css` (lines 12-50)
2. **Modify layout/grid**: Edit `css/layout.css`
3. **Update UI components**: Edit `css/components.css`
4. **Adjust mobile styles**: Edit `css/responsive.css`
5. No need to touch `css/main.css` (just imports)

### Adding a New JavaScript Module
1. Create file in `js/[core|ui|utils]/your-module.js`
2. Export functions: `export function myFunction() { ... }`
3. Import in `main.js`: `import { myFunction } from './js/.../your-module.js';`
4. Initialize in DOMContentLoaded if needed

### Adding a New Documentation Section
1. Add `<template id="template-section-name">` in `index.html`
2. Add navigation link in sidebar with `onclick="navigateTo('section-name')"`
3. No CSS/JS changes needed (auto-handled)

---

## 🚀 Quick Start

### Development
Simply open `index.html` in a browser. ES6 modules require a server:

```powershell
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

### Production
Deploy all files to GitHub Pages or any static host. No build step required!

---

## 🎨 Customization

### Change Theme Colors
Edit `css/base/reset.css` → `:root` variables

### Adjust Layout Widths
Edit `css/layout/grid.css` → `.main-layout` grid-template-columns

### Modify Responsive Breakpoints
Edit `css/layout/responsive.css` → `@media` queries

---

## 📚 Documentation Sections

Current documentation includes:
1. **Introduction** - Addon overview & features
2. **Installation** - Setup guide
3. **Quick Start** - First-time usage
4. **Publishing** - Asset publishing system
5. **Texture Tools** - Texture management features
6. **Versioning** - Version control system
7. **File Protection** - Safety features
8. **Scene Analysis** - Deep scanning tools
9. **Batch Operations** - Batch processing
10. **Linked Libraries** - Library management
11. **FAQ** - Common questions
12. **Troubleshooting** - Problem solutions

---

## 🔄 Migration Notes

### From Old Structure
- `styles.css` (1168 lines) → Split into 12 modular files
- `script.js` (223 lines) → Split into 7 modular files
- Functionality unchanged, organization improved

### Benefits
✅ Easier maintenance (edit specific components)  
✅ Better code organization (clear separation)  
✅ Faster debugging (find issues quickly)  
✅ Team collaboration (no merge conflicts)  
✅ Reusability (import what you need)

---

## 📦 File Sizes

| File Type | Old | New (Total) | Modules |
|-----------|-----|-------------|---------|
| CSS | 1168 lines | ~1200 lines | 12 files |
| JavaScript | 223 lines | ~240 lines | 7 files |
| HTML | 1079 lines | 1104 lines | 1 file |

**Note**: Slight increase due to module comments & structure

---

## 🐛 Troubleshooting

### Modules not loading?
- Ensure you're using a local server (not `file://`)
- Check browser console for CORS errors
- Verify `type="module"` in script tag

### Styles not applying?
- Check all `@import` paths in `main.css`
- Ensure relative paths are correct
- Hard refresh browser (Ctrl+F5)

### Navigation not working?
- Check `window.navigateTo` is exposed globally
- Verify template IDs match onclick values
- Inspect console for template not found errors

---

## 📄 License
GPL-3.0 - Same as Blender Asset Management addon

## 👨‍💻 Author
Rizqi Alfajri - [GitHub](https://github.com/alfajririzqi)

## 🔗 Links
- **Addon Repository**: https://github.com/alfajririzqi/asset_management
- **Latest Release**: https://github.com/alfajririzqi/asset_management/releases

---

**Last Updated**: December 5, 2025  
**Documentation Version**: 2.0.0 (Modular Structure)  
**Addon Version**: v1.2.1
