# Summary of Accessibility Changes to Intro-Math-Programming Book

**Date:** January 2026
**Purpose:** Implement accessible graphics macros and TikZ figure extraction for PDF accessibility

---

## Overview

This document summarizes the changes made to implement accessibility features in the LaTeX book, including:
- Accessible graphics macros with alt text support
- TikZ figure extraction to standalone PDFs
- PDF tagging via `\DocumentMetadata`

---

## 1. Accessible Graphics Macros

**File:** `book/preamble/preamble0-biblatex.tex`

### What was added:

Custom macros that pull alt text from BibLaTeX `.bib` files using the `abstract` field:

#### Inline Graphics (no caption/label):
- `\includegraphicstatic[options]{bibkey}` - for images in `figures-static/`
- `\includegraphicsource[options]{bibkey}` - for images in `figures-source/`
- `\includegraphictikz[options]{bibkey}` - for TikZ PDFs with fallback support

#### Figure Environments (with caption and label):
- `\includefigurestatic[caption][options][placement]{bibkey}`
- `\includefiguresource[caption][options][placement]{bibkey}`
- `\includefiguretikz[caption][options][placement]{bibkey}`

#### Figure Environments with Auto-Reference:
- `\refincludefigurestatic[caption][options][placement]{bibkey}`
- `\refincludefiguresource[caption][options][placement]{bibkey}`
- `\refincludefiguretikz[caption][options][placement]{bibkey}`

### Key Design Decision:

The inline macros (`\includegraphicstatic`, `\includegraphicsource`, `\includegraphictikz`) were **simplified to NOT include `\begin{center}...\end{center}`** wrappers. This was necessary because the original version with centering caused "missing \item" errors when used inside:
- Minipage environments
- Tabular cells
- TikZ nodes

The macros now just include the graphic with alt text - centering should be done externally if needed.

### How Alt Text Works:

1. Each image has a corresponding entry in a `.bib` file
2. The `abstract` field contains the alt text description
3. When including an image, the macro extracts the alt text and applies it via `\includegraphics[alt={...}]`

Example `.bib` entry:
```bibtex
@Online{my-figure,
    author = {Author Name},
    title = {Figure Title},
    year = {2026},
    abstract = {Detailed description of what the figure shows for screen readers},
}
```

---

## 2. TikZ Figure Extraction

**Script:** `scripts/extract-tikz-figures.py`

### What it does:

1. Scans all `.tex` files in the book for `\begin{tikzpicture}...\end{tikzpicture}` blocks
2. Skips overlay/annotation TikZ and commented-out code
3. Creates standalone `.tex` files for each TikZ figure
4. Compiles them to PDF
5. Adds BibLaTeX entries to `figures-source/00_METADATA.bib`
6. Replaces inline TikZ with `\includegraphicsource{bibkey}` calls

### Results:
- **218 TikZ figures** identified
- **202 successfully compiled** to PDF
- **16 failed** (nested tikzpictures, external dependencies, etc.)
- PDFs stored in `optimization/figures/figures-source/`

### Usage:

```bash
cd book

# Preview what would be extracted (no changes made)
python3 ../scripts/extract-tikz-figures.py --dry-run

# Create standalone .tex files and compile to PDF
python3 ../scripts/extract-tikz-figures.py --compile

# Full workflow: compile PDFs and replace inline TikZ in source files
python3 ../scripts/extract-tikz-figures.py --compile --replace
```

### Standalone Template:

The script uses a template that includes common book macros:
- Math macros: `\x`, `\y`, `\z`, `\A`, `\b`, `\c`, `\R`, `\N`, `\Z`, `\Q`, etc.
- TikZ styles: `main`, `dot`, `vertex`, `edge`, `directed edge`
- TikZ libraries: arrows, positioning, calc, shapes, etc.

---

## 3. DocumentMetadata for Math Accessibility

**File:** `book/book1-main.tex` (lines 11-15)

### What was added:

```latex
\DocumentMetadata{
  lang=en-US,
  pdfversion=2.0,
  testphase={phase-III}
}
```

### Purpose:
- Enables PDF tagging for screen readers
- Provides **automatic alt text for math equations** (LaTeX source becomes alt text)
- Creates PDF/UA compliant accessible PDFs

### Requirements:
- **TeX Live 2022 (with updates) or TeX Live 2023+**
- Will fail with "Undefined control sequence" on older TeX installations
- If it fails, comment out lines 11-15 to disable

---

## 4. Bug Fixes Made

### a) Tab characters in graphtheory-dor1.tex (lines 1175-1182)

Fixed tab characters in a tabular environment that were causing parsing errors:

```latex
% Before (had tab characters)
AB&	\$4&	add AB\\

% After (spaces)
AB & \$4 & add AB\\
```

### b) Moved `\OO@fallbackext` inside `\makeatletter` block

The macro using `@` was defined before `\makeatletter`, causing "Missing number" errors.

---

## 5. Helper Scripts

### convert-to-accessible-macros.py

**Location:** `scripts/convert-to-accessible-macros.py`

Converts existing `\includegraphics{path}` calls to accessible macro calls.

```bash
python3 ../scripts/convert-to-accessible-macros.py --dry-run  # Preview
python3 ../scripts/convert-to-accessible-macros.py            # Apply changes
```

### generate-figure-catalog.py

**Location:** `scripts/generate-figure-catalog.py`

Generates a PDF catalog of all figures with their metadata.

```bash
python3 ../scripts/generate-figure-catalog.py
```

**Latest run results:**
- 500 image references in book
- 145 static images used (124 unused)
- 210 source images used (23 unused)

---

## 6. Current Compilation Status

### On older TeX Live (2022/dev):
- **Cannot compile** with `\DocumentMetadata` enabled
- Without it: compiles to ~473 pages with 61 non-fatal errors

### On newer TeX Live (2022 with updates, or 2023+):
- Should compile to ~483 pages with `\DocumentMetadata` enabled
- Minor errors expected

---

## 7. Known Remaining Issues

1. **Pre-existing errors** in the book unrelated to accessibility:
   - csquotes configuration warnings
   - Some tcolorbox/tcb@savebox environment mismatches
   - Undefined citations (need `biber book1-main` run)

2. **16 TikZ figures that failed to compile** - these remain as inline TikZ in the source

3. **Alt text for extracted TikZ figures** is placeholder text - needs manual descriptions in the `.bib` file's `abstract` field

---

## 8. File Locations Summary

| Item | Location |
|------|----------|
| Main book file | `book/book1-main.tex` |
| Accessible macros | `book/preamble/preamble0-biblatex.tex` |
| Static figures | `optimization/figures/figures-static/` |
| Source figures (including extracted TikZ) | `optimization/figures/figures-source/` |
| Static metadata | `optimization/figures/figures-static/00_METADATA.bib` |
| Source metadata | `optimization/figures/figures-source/00_METADATA.bib` |
| Extraction script | `scripts/extract-tikz-figures.py` |
| Conversion script | `scripts/convert-to-accessible-macros.py` |
| Catalog script | `scripts/generate-figure-catalog.py` |
| This documentation | `docs/accessibility-changes-summary.md` |

---

## 9. Next Steps / To-Do

To fix remaining compilation errors, focus on:

1. The tcolorbox environment mismatches (lines ~2727-2728 in compiled output)
2. The "pioneerspotlight" environment that seems malformed
3. Running `biber book1-main` to resolve citation warnings
4. Adding meaningful alt text descriptions to the `abstract` fields in `.bib` files for extracted TikZ figures

---

## 10. How to Add Alt Text to New Figures

1. Add the image file to `optimization/figures/figures-static/` or `optimization/figures/figures-source/`

2. Add an entry to the corresponding `00_METADATA.bib`:
   ```bibtex
   @Online{my-new-figure,
       author = {Your Name},
       title = {Descriptive Title},
       year = {2026},
       abstract = {Detailed alt text description of what the figure shows, suitable for screen readers. Describe the key visual elements and their meaning.},
   }
   ```

3. Use in LaTeX:
   ```latex
   \includegraphicstatic{my-new-figure}
   % or
   \includefigurestatic[Optional caption]{my-new-figure}
   ```
