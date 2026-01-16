# File Structure Reorganization - COMPLETED

**Book:** Mathematical Programming and Operations Research
**Author:** Robert Hildebrand
**Date:** January 2026

---

## Summary of Changes

The repository has been reorganized from a flat structure with 524+ scattered .tex files into a clean, hierarchical structure organized by book parts and chapters.

### Before vs After

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Repository size | 282 MB | 87 MB | -69% |
| Organization | Flat, scattered | Hierarchical by chapter | Improved |

---

## New Directory Structure

```
baseText/
├── book/                              # MAIN BOOK SOURCE
│   ├── main.tex                       # New main document (use this!)
│   ├── preamble/                      # Consolidated LaTeX setup
│   ├── frontmatter/                   # Title, preface, contributors
│   ├── part1-linear-programming/
│   │   ├── ch01-introduction/
│   │   ├── ch02-modeling/
│   │   ├── ch03-software/
│   │   ├── ch04-graphical/
│   │   ├── ch05-lp-theory/
│   │   ├── ch06-simplex/
│   │   ├── ch07-sensitivity/
│   │   ├── ch08-duality/
│   │   └── ch09-multi-objective/
│   ├── part2-discrete-algorithms/
│   │   └── ch10-graph-theory/
│   ├── part3-integer-programming/
│   │   ├── ch11-ip-formulations/
│   │   ├── ch12-solvers/
│   │   ├── ch13-ip-algorithms/
│   │   ├── ch14-exponential-formulations/
│   │   ├── ch15-complexity/
│   │   └── ch16-heuristics/
│   ├── part4-nonlinear-programming/   # Currently disabled in main.tex
│   │   ├── ch17-nlp-intro/
│   │   └── ch18-nlp-algorithms/
│   ├── appendices/
│   └── backmatter/
│
├── slides/                            # PRESENTATION MATERIALS
│   ├── LinearProgramming-slides-template.tex
│   ├── LinearProgramming-slides-week1.tex
│   └── graph-algorithms/
│       ├── slides-dikjstra.tex
│       └── slides-kruskal.tex
│
├── archive/                           # PRESERVED BUT NOT ACTIVE
│   ├── orphaned-content/              # 62 unused .tex files (may incorporate later)
│   ├── old-preambles/                 # 11 old preamble variants
│   ├── old-versions/                  # Old document versions
│   └── duplicate-files/               # Files with "copy" in name
│
├── optimization/                      # ORIGINAL SOURCE (still referenced)
├── aFirstCourseLinearAlgebra/         # EXTERNAL: Linear algebra appendix
├── lineqlpbook/                       # EXTERNAL: LP definitions
├── Christopher_Griffin_Penn_State_University/  # EXTERNAL: LP examples
├── foundationsAppliedMathematicsLabs/ # EXTERNAL: NLP labs
│
└── LinearProgramming.tex              # LEGACY main file (kept for reference)
```

---

## How to Compile

### New Structure (Recommended)
```bash
cd book/
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

### Legacy (Still Works)
```bash
pdflatex LinearProgramming.tex
```

---

## What Was Archived

### orphaned-content/ (62 files)
Content that was not being used in the book but may be incorporated later:
- Advanced topics (MINLP, SOS2, piecewise linear)
- Alternative algorithm presentations
- Additional examples and applications
- Constraint programming, robust optimization
- Lagrangian relaxation, column generation
- Neural networks, SVM, regression
- PuLP tutorials

### old-preambles/ (11 files)
Multiple preamble variants consolidated into `book/preamble/`:
- preamble.tex, preamble0.tex, preamble2.tex
- preamble-slides.tex, preamble-slides2.tex
- preamble-jupyter.tex, preamble-cleaned.tex
- merged_preamble.tex, preamble_merged_restructured.tex
- preamble0-biblatex.tex, preamble-optimization.tex

### duplicate-files/ (4 files)
- packages-and-commands copy.tex
- PuLP Tutorial latex copy.tex
- simplex-basis-driven-copy.tex
- Section2-copy-copy.tex

---

## What Was Removed

### Reference PDFs (~195 MB)
Large PDF files that were reference materials, not figures:
- UC Davis course notes (optimization, LP, SDP, complexity)
- Old course note compilations
- Previously compiled book versions

**Note:** All figure PDFs in `Figures/`, `Christopher_Griffin_Penn_State/`, etc. were preserved.

### Build Artifacts
- .idx, .ilg, .ind, .aux, .log files
- epub build directories and files
- Temporary compilation files

---

## Backup

A backup branch was created before reorganization:
```bash
git checkout reorganization-backup-jan2026
```

---

## Next Steps

1. **Test compilation** of `book/main.tex`
2. **Review archived content** in `archive/orphaned-content/` for material to incorporate
3. **Update any external references** to file paths
4. **Consider git submodules** for external sources (aFirstCourseLinearAlgebra, etc.)

---

## Files Still at Root Level

These files remain at the baseText root for backward compatibility:
- `LinearProgramming.tex` - Legacy main file
- `packages-and-commands.tex` - Used by legacy main
- `preface.tex` - Used by legacy main
- `contributors.tex`, `contributors-foundations.tex`
- `references.bib` - Bibliography (also copied to book/)
