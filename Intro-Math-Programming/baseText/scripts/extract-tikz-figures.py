#!/usr/bin/env python3
"""
extract-tikz-figures.py
Extracts TikZ figures from book .tex files into standalone files.
Compiles them to PDF and replaces inline TikZ with \includegraphicstatic calls.

IMPORTANT:
- Skips overlay tikzpictures (which annotate other elements)
- Skips commented-out tikzpictures
- Creates standalone .tex files that can be compiled independently
"""

import re
import os
import subprocess
import hashlib
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("/sessions/bold-adoring-fermat/mnt/open-optimization-or-book/Intro-Math-Programming/baseText")
BOOK_DIR = BASE_DIR / "book"
FIGURES_SOURCE = BASE_DIR / "optimization/figures/figures-source"
TIKZ_OUTPUT_DIR = FIGURES_SOURCE / "tikz-extracted"
BIB_FILE = FIGURES_SOURCE / "00_METADATA.bib"

# TikZ libraries used in the book
TIKZ_LIBRARIES = [
    "arrows", "automata", "backgrounds", "calendar", "chains",
    "decorations", "decorations.pathreplacing", "decorations.text",
    "fit", "matrix", "mindmap", "patterns", "petri", "plotmarks",
    "positioning", "shadows", "shapes", "shapes.callouts",
    "shapes.geometric", "shapes.misc", "spy", "trees",
    "calc", "intersections", "tikzmark", "arrows.meta"
]

# Standalone template for compiling TikZ figures
STANDALONE_TEMPLATE = r'''\documentclass[tikz,border=10pt]{{standalone}}
\usepackage{{amsmath,amssymb}}
\usepackage{{tikz}}
\usetikzlibrary{{{libraries}}}
\usepackage{{xcolor}}
\usepackage{{pgfplots}}
\pgfplotsset{{compat=1.16}}

% Common math macros from the book
\def\x{{\mathbf{{x}}}}
\def\y{{\mathbf{{y}}}}
\def\z{{\mathbf{{z}}}}
\def\A{{\mathbf{{A}}}}
\def\b{{\mathbf{{b}}}}
\def\c{{\mathbf{{c}}}}
\def\w{{\mathbf{{w}}}}
\def\v{{\mathbf{{v}}}}
\def\u{{\mathbf{{u}}}}
\def\e{{\mathbf{{e}}}}
\def\zero{{\mathbf{{0}}}}
\def\R{{\mathbb{{R}}}}
\def\N{{\mathbb{{N}}}}
\def\Z{{\mathbb{{Z}}}}
\def\Q{{\mathbb{{Q}}}}
\def\st{{\text{{s.t.}}}}
\def\vect#1{{\mathbf{{#1}}}}
\def\xLP{{x^{{\mathrm{{LP}}}}}}
\def\zLP{{z^{{\mathrm{{LP}}}}}}
\def\xIP{{x^{{\mathrm{{IP}}}}}}

% Common node styles from the book
\tikzset{{
    main/.style={{circle, draw, fill=gray!20, minimum size=1cm, font=\normalsize}},
    dot/.style={{circle,fill=blue,minimum size=3pt,inner sep=0pt, outer sep=-1pt}},
    vertex/.style={{circle,fill=black!25,minimum size=20pt,inner sep=0pt}},
    edge/.style={{draw,-,thick}},
    directed edge/.style={{draw,->,>=latex,thick}},
}}

% Additional macros for 3D/coordinate systems
\newcommand{{\xhat}}{{\hat{{\x}}}}
\newcommand{{\yhat}}{{\hat{{\y}}}}
\newcommand{{\zhat}}{{\hat{{\z}}}}
\newcommand{{\ihat}}{{\hat{{\imath}}}}
\newcommand{{\jhat}}{{\hat{{\jmath}}}}
\newcommand{{\khat}}{{\hat{{k}}}}

\begin{{document}}
{tikz_code}
\end{{document}}
'''

# Files/patterns to skip
SKIP_FILES = [
    'titlepage.tex',
    'backpage.tex',
    'test-preamble.tex',
]

# Skip patterns within files
SKIP_PATTERNS = [
    'overlay',           # Overlay pictures annotate other elements
    'remember picture',  # Usually used with overlay
]

# Minimum size for extraction (skip tiny inline annotations)
MIN_TIKZ_LINES = 3  # Skip tikzpictures with fewer than 3 lines of content


def is_commented_out(content, start_pos):
    """Check if a tikzpicture at start_pos is commented out."""
    # Find the start of the line
    line_start = content.rfind('\n', 0, start_pos) + 1
    line_before = content[line_start:start_pos]
    # Check if there's a % before it (ignoring whitespace)
    stripped = line_before.lstrip()
    return stripped.startswith('%')


def should_skip_tikz(tikz_code, options_str, body):
    """Check if a TikZ picture should be skipped (overlay, too small, etc.)."""
    for pattern in SKIP_PATTERNS:
        if pattern in options_str or pattern in tikz_code[:200]:
            return True
    # Skip very small tikzpictures (likely inline annotations)
    line_count = body.count('\n')
    if line_count < MIN_TIKZ_LINES:
        return True
    return False


def extract_tikz_from_file(filepath, dry_run=True):
    """Extract all TikZ pictures from a file."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    # Pattern to match tikzpicture environments
    # Captures optional arguments and the full content
    pattern = r'(\\begin\{tikzpicture\})(\[[^\]]*\])?(.*?)(\\end\{tikzpicture\})'

    extractions = []
    new_content = content
    offset = 0

    for match in re.finditer(pattern, content, re.DOTALL):
        start_tag = match.group(1)
        options = match.group(2) or ''
        body = match.group(3)
        end_tag = match.group(4)

        full_match = match.group(0)
        match_start = match.start()
        match_end = match.end()

        # Check if commented out
        if is_commented_out(content, match_start):
            continue

        # Check if should skip (overlay, too small, etc.)
        if should_skip_tikz(body, options, body):
            continue

        # Create unique filename based on content hash and file location
        rel_path = filepath.relative_to(BOOK_DIR)
        base_name = filepath.stem
        content_hash = hashlib.md5(full_match.encode()).hexdigest()[:8]

        # Create descriptive name
        figure_num = len(extractions) + 1
        figure_name = f"tikz-{base_name}-{figure_num:02d}-{content_hash}"

        extractions.append({
            'name': figure_name,
            'tikz_code': full_match,
            'options': options,
            'body': body,
            'source_file': str(rel_path),
            'line_num': content[:match_start].count('\n') + 1,
            'match_start': match_start,
            'match_end': match_end,
        })

    return extractions


def create_standalone_file(extraction, output_dir):
    """Create a standalone .tex file for a TikZ figure."""
    output_path = output_dir / f"{extraction['name']}.tex"

    tikz_code = extraction['tikz_code']

    # Create standalone document
    standalone_content = STANDALONE_TEMPLATE.format(
        libraries=','.join(TIKZ_LIBRARIES),
        tikz_code=tikz_code
    )

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(standalone_content)

    return output_path


def compile_to_pdf(tex_path):
    """Compile a standalone .tex file to PDF."""
    try:
        result = subprocess.run(
            ['pdflatex', '-interaction=nonstopmode', '-halt-on-error', tex_path.name],
            cwd=tex_path.parent,
            capture_output=True,
            text=True,
            timeout=60
        )

        pdf_path = tex_path.with_suffix('.pdf')
        if pdf_path.exists():
            # Clean up auxiliary files
            for ext in ['.aux', '.log']:
                aux_file = tex_path.with_suffix(ext)
                if aux_file.exists():
                    aux_file.unlink()
            return True, pdf_path
        else:
            return False, result.stderr[:500] if result.stderr else result.stdout[:500]
    except subprocess.TimeoutExpired:
        return False, "Compilation timed out"
    except FileNotFoundError:
        return False, "pdflatex not found"


def create_bib_entry(extraction, compiled_successfully):
    """Create a BibLaTeX entry for a TikZ figure."""
    entry_id = extraction['name']
    source_file = extraction['source_file']

    # Generate placeholder alt text
    alt_text = f"TikZ diagram extracted from {source_file}, line {extraction['line_num']}. Missing AltText - needs description."

    entry = f'''@Online{{{entry_id},
    author = {{{{Robert Hildebrand}}}},
    title = {{{entry_id}}},
    year = {{{datetime.now().year}}},
    shorttitle = {{TikZ figure from {source_file}}},
    abstract = {{{alt_text}}},
    note = {{Extracted from {source_file}, line {extraction['line_num']}}},
}}

'''
    return entry


def replace_tikz_with_includegraphics(filepath, extractions, compiled_set, dry_run=True):
    """Replace inline TikZ with includegraphicsource calls (only for successfully compiled figures)."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    # Filter to only successfully compiled figures
    compilable_extractions = [e for e in extractions if e['name'] in compiled_set]

    if not compilable_extractions:
        return []

    # Sort by position in reverse order to preserve positions during replacement
    sorted_extractions = sorted(compilable_extractions, key=lambda x: x['match_start'], reverse=True)

    new_content = content
    replacements = []

    for extraction in sorted_extractions:
        old_code = extraction['tikz_code']
        figure_name = extraction['name']

        # Create replacement includegraphics call
        # Note: We use the PDF output
        replacement = f'\\includegraphicsource{{{figure_name}}}'

        # Find and replace
        start = extraction['match_start']
        end = extraction['match_end']

        # Check if it's wrapped in a center or figure environment
        before = new_content[:start]
        after = new_content[end:]

        # Check if we need to preserve the environment wrapper
        # If tikz is standalone (not in center/figure), add centering
        before_stripped = before.rstrip()
        needs_centering = not (before_stripped.endswith('\\begin{center}') or
                               before_stripped.endswith('\\centering') or
                               '\\begin{figure}' in before[-100:])

        if needs_centering:
            replacement = f'\\begin{{center}}\n{replacement}\n\\end{{center}}'

        new_content = before + replacement + after
        replacements.append((extraction['line_num'], figure_name))

    if not dry_run and replacements:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    return replacements


def main():
    import sys

    dry_run = '--dry-run' in sys.argv or '-n' in sys.argv
    compile_pdf = '--compile' in sys.argv or '-c' in sys.argv
    replace = '--replace' in sys.argv or '-r' in sys.argv

    if dry_run:
        print("DRY RUN - no files will be modified")
        print("Run with --compile to compile PDFs, --replace to update source files\n")

    # Create output directory
    TIKZ_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Find all .tex files
    tex_files = list(BOOK_DIR.rglob('*.tex'))

    all_extractions = []
    files_with_tikz = 0

    print("=" * 60)
    print("Scanning for extractable TikZ figures...")
    print("=" * 60)

    for filepath in tex_files:
        # Skip certain files
        if filepath.name in SKIP_FILES:
            continue
        if '_updated' in filepath.name:  # Skip backup files
            continue
        if '.backup' in filepath.name:
            continue

        extractions = extract_tikz_from_file(filepath, dry_run=dry_run)

        if extractions:
            rel_path = filepath.relative_to(BASE_DIR)
            print(f"\n{rel_path}: {len(extractions)} extractable TikZ figures")
            for ext in extractions:
                print(f"  Line {ext['line_num']}: {ext['name']}")

            all_extractions.extend([(filepath, ext) for ext in extractions])
            files_with_tikz += 1

    print(f"\n{'=' * 60}")
    print(f"Total: {len(all_extractions)} TikZ figures in {files_with_tikz} files")
    print(f"{'=' * 60}")

    if dry_run:
        print("\nRun with the following options:")
        print("  --compile  Create standalone .tex files and compile to PDF")
        print("  --replace  Replace inline TikZ with \\includegraphicsource calls")
        return

    # Create standalone files
    print("\nCreating standalone .tex files...")
    created_files = []

    for filepath, extraction in all_extractions:
        tex_path = create_standalone_file(extraction, TIKZ_OUTPUT_DIR)
        created_files.append((filepath, extraction, tex_path))
        print(f"  Created: {tex_path.name}")

    # Compile to PDF if requested
    compiled_set = set()  # Track successfully compiled figures
    if compile_pdf:
        print("\nCompiling to PDF...")
        compiled_count = 0
        failed_count = 0

        for filepath, extraction, tex_path in created_files:
            success, result = compile_to_pdf(tex_path)
            if success:
                print(f"  ✓ {tex_path.stem}.pdf")
                compiled_count += 1
                compiled_set.add(extraction['name'])
            else:
                print(f"  ✗ {tex_path.stem}: {result[:100]}")
                failed_count += 1

        print(f"\nCompiled: {compiled_count} succeeded, {failed_count} failed")

    # Add bib entries (only if not already present)
    print("\nChecking BibLaTeX entries...")
    existing_ids = set()
    if BIB_FILE.exists():
        with open(BIB_FILE, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
            # Find all existing entry IDs
            for match in re.finditer(r'@Online\{([^,]+),', content):
                existing_ids.add(match.group(1).strip())

    new_entries = []
    for filepath, extraction in all_extractions:
        if extraction['name'] not in existing_ids:
            entry = create_bib_entry(extraction, True)
            new_entries.append(entry)

    if new_entries:
        with open(BIB_FILE, 'a', encoding='utf-8') as f:
            f.write('\n% TikZ figures extracted from book files\n')
            f.write(f'% Generated on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n\n')
            for entry in new_entries:
                f.write(entry)
        print(f"Added {len(new_entries)} new entries to {BIB_FILE.name}")
    else:
        print("All bib entries already exist, no new entries added")

    # Replace inline TikZ if requested
    if replace:
        # If we didn't compile, check existing PDFs to build compiled_set
        if not compile_pdf:
            print("\nChecking for existing compiled PDFs...")
            for filepath, extraction in all_extractions:
                pdf_path = TIKZ_OUTPUT_DIR / f"{extraction['name']}.pdf"
                if pdf_path.exists():
                    compiled_set.add(extraction['name'])
            print(f"Found {len(compiled_set)} existing PDFs")

        print(f"\nReplacing inline TikZ with \\includegraphicsource (only {len(compiled_set)} compiled figures)...")

        # Group by source file
        by_file = {}
        for filepath, extraction in all_extractions:
            if filepath not in by_file:
                by_file[filepath] = []
            by_file[filepath].append(extraction)

        total_replacements = 0
        for filepath, extractions in by_file.items():
            replacements = replace_tikz_with_includegraphics(filepath, extractions, compiled_set, dry_run=False)
            if replacements:
                rel_path = filepath.relative_to(BASE_DIR)
                print(f"  {rel_path}: {len(replacements)} replacements")
                total_replacements += len(replacements)

        print(f"\nTotal: {total_replacements} TikZ figures replaced")

    print("\nDone!")


if __name__ == '__main__':
    main()
