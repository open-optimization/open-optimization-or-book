# Accessible Graphics for LaTeX

This folder contains example files demonstrating how to add alt text (alternative text) to images in LaTeX documents for accessibility compliance.

## Requirements

- **TeX Live 2025 or newer** (for full `alt={}` key support in `\includegraphics`)
- **LuaLaTeX** compiler (recommended) or pdfLaTeX
- **BibLaTeX with Biber** (for the full version with metadata)

> **Note:** On older TeX Live versions (2022-2024), the `alt={}` key may be silently ignored. The document will compile, but alt text won't be embedded in the PDF.

## Quick Start for the Main Book

The main book (`book1-main.tex`) has been updated to support accessibility. To enable it:

1. **Ensure you have TeX Live 2025+** installed
2. **The `\DocumentMetadata` block is already added** at the top of `book1-main.tex`
3. **Add alt text to your images** by adding an `abstract` field to the bib entries in:
   - `optimization/figures/figures-static/00_METADATA.bib`
   - `optimization/figures/figures-source/00_METADATA.bib`

Example bib entry with alt text:
```bibtex
@Online{my-figure.png,
  author = {{Your Name [CC BY-SA 4.0]}},
  title = {Figure Title for Caption},
  abstract = {Detailed description for screen readers: A graph showing...},
  year = {2025},
  options = {skipbib=true},
}
```

## Files in This Test Folder

| File | Description |
|------|-------------|
| `preamble-accessible-graphics.tex` | Standalone test macros (for reference) |
| `test-metadata.bib` | Example BibLaTeX metadata with `abstract` field for alt text |
| `accessibility-test.tex` | Full example using BibLaTeX metadata |
| `accessibility-test-simple.tex` | Simplified example (no BibLaTeX required) |

## Available Commands

The following commands are defined in `preamble0-biblatex.tex`:

### Inline Graphics (no figure environment)

| Command | Description |
|---------|-------------|
| `\includegraphicstatic[opts]{bibkey}` | Image from figures-static/ with auto alt text |
| `\includegraphicsource[opts]{bibkey}` | Image from figures-source/ with auto alt text |
| `\includegraphictikz[opts]{bibkey}` | TikZ/PDF from figures-source/ with auto alt text |
| `\includegraphicstaticalt[opts]{bibkey}{alt}` | Manual alt text override |
| `\includegraphicsourcealt[opts]{bibkey}{alt}` | Manual alt text override |

### Figure Environments (with caption and label)

| Command | Description |
|---------|-------------|
| `\includefigurestatic[caption][opts][placement]{bibkey}` | Figure from figures-static/ |
| `\includefiguresource[caption][opts][placement]{bibkey}` | Figure from figures-source/ |
| `\includefiguretikz[caption][opts][placement]{bibkey}` | TikZ/PDF figure |
| `\refincludefigurestatic[...]{bibkey}` | Same + auto-reference |
| `\refincludefiguresource[...]{bibkey}` | Same + auto-reference |
| `\refincludefiguretikz[...]{bibkey}` | Same + auto-reference |

## TikZ / PDF Switching for EPUB

The book supports switching between TikZ source files and pre-compiled PDFs:

```latex
% In book1-main.tex:
\setboolean{usetikz}{false}  % Use PDF versions (default, EPUB-compatible)
\setboolean{usetikz}{true}   % Use TikZ source (slower, but editable)
```

### Converting TikZ to PDF

Use the provided script to batch-convert TikZ standalone files:

```bash
cd scripts/
./convert-tikz-to-pdf.sh ../optimization/figures/figures-source/

# Also create EPS versions:
./convert-tikz-to-pdf.sh ../optimization/figures/figures-source/ --eps
```

## Document Setup

Add this **before** `\documentclass`:

```latex
% For TeX Live 2025 (January release):
\DocumentMetadata{
  lang=en-US,
  pdfversion=2.0,
  testphase={phase-III}
}
\documentclass{book}

% For later releases (2025-11-01+), use:
% \DocumentMetadata{lang=en-US, pdfversion=2.0, tagging=on}
```

## How Alt Text Works

### The `abstract` Field

Alt text is stored in the `abstract` field of each BibLaTeX entry:

```bibtex
@Online{LP-feasible-region.png,
  author = {{Robert Hildebrand [CC BY-SA 4.0]}},
  title = {Linear Programming Feasible Region},
  abstract = {A two-dimensional coordinate system showing a shaded
    polygonal region representing the feasible region of a linear
    program. The polygon is bounded by several linear constraint
    lines, with the optimal solution point marked at one vertex.},
  year = {2023},
  options = {skipbib=true},
}
```

### Writing Good Alt Text

- **Be concise but complete**: Describe what's important for understanding
- **Don't start with "Image of..."**: Screen readers already announce it's an image
- **Include data if relevant**: For charts/graphs, describe trends and key values
- **Match the context**: The alt text should support the surrounding text

## Compilation

```bash
# Full version with BibLaTeX
lualatex accessibility-test.tex
biber accessibility-test
lualatex accessibility-test.tex
lualatex accessibility-test.tex

# Simple version (no BibLaTeX)
lualatex accessibility-test-simple.tex
```

## Verifying Accessibility

1. Open the PDF in Adobe Acrobat Pro
2. Go to **View** → **Navigation Panels** → **Tags**
3. Expand the tag tree and find `<Figure>` tags
4. Right-click and select **Properties** to see the alt text
5. Or use **Accessibility** → **Full Check** for an audit

### Quick Python Verification

```python
import re
with open('your-document.pdf', 'rb') as f:
    content = f.read()
matches = re.findall(rb'/Alt\s*<([^>]+)>', content)
for m in matches:
    try:
        hex_str = m.decode('ascii').replace(' ', '')
        text = bytes.fromhex(hex_str).decode('utf-16-be', errors='replace')
        print(repr(text))
    except: pass
```

## References

- [LaTeX Tagged PDF Project](https://latex3.github.io/tagging-project/documentation/prototype-usage-instructions.html)
- [tagpdf Package Documentation](https://ctan.org/pkg/tagpdf)
- [Creating Accessible LaTeX PDFs (TAMU)](https://esail.tamu.edu/faculty-tutorials/accessible-latex-pdf-ua-2-overleaf-2025/)
- [PDF/UA-2 Standard](https://www.pdfa.org/resource/pdfua-2-technical-notes/)
