#!/usr/bin/env python3
"""
generate-book2-figure-catalog.py
Generates a LaTeX catalog of all figures used in book2-main.tex.
Organizes by Part and Chapter, shows metadata status, and identifies missing figures.
Extracts page numbers from the compiled aux file.
"""

import re
import os
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Use relative path from script location for portability
SCRIPT_DIR = Path(__file__).parent.resolve()
BASE_DIR = SCRIPT_DIR.parent
BOOK_DIR = BASE_DIR / "book"
FIGURES_STATIC = BASE_DIR / "optimization/figures/figures-static"
FIGURES_SOURCE = BASE_DIR / "optimization/figures/figures-source"
OUTPUT_TEX = SCRIPT_DIR / "book2-figure-catalog.tex"
OUTPUT_MD = BOOK_DIR / "BOOK2_FIGURES_CATALOG.md"
BOOK2_AUX = BOOK_DIR / "book2-main.aux"

# Book2 specific directories
BOOK2_PARTS = {
    'part3-integer-programming': 'Part I: Integer Programming',
    'part4-nonlinear-programming': 'Part II: Nonlinear Programming',
    'appendices': 'Appendices',
}

# Book2 chapter mapping
BOOK2_CHAPTERS = {
    'ch11-ip-formulations': 'Chapter 11: IP Formulations',
    'ch12-solvers': 'Chapter 12: Solvers',
    'ch13-ip-algorithms': 'Chapter 13: IP Algorithms',
    'ch14-exponential-formulations': 'Chapter 14: Exponential Formulations',
    'ch15-complexity': 'Chapter 15: Complexity',
    'ch16-heuristics': 'Chapter 16: Heuristics',
    'ch17-nlp-intro': 'Chapter 17: NLP Introduction',
    'ch18-nlp-algorithms': 'Chapter 18: NLP Algorithms',
    'GradientMethods': 'Gradient Methods',
    'OneD_Optimization': 'One-D Optimization',
    'linear-algebra': 'Linear Algebra Appendix',
}

# Image extensions
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.pdf', '.eps', '.svg'}


def parse_aux_for_pages():
    """Parse the aux file to extract figure labels and their page numbers."""
    figure_pages = {}

    if not BOOK2_AUX.exists():
        print(f"Warning: {BOOK2_AUX} not found. Page numbers will not be available.")
        return figure_pages

    try:
        with open(BOOK2_AUX, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading aux file: {e}")
        return figure_pages

    # Primary pattern to match figure labels with page numbers
    # Format: \newlabel{fig:name}{{figure_num}{page}{caption...
    # Example: \newlabel{fig:wiki-File-knapsack}{{1.1}{6}{\ifx ...
    # Note: aux file may have escaped backslashes (\\newlabel), so we try both patterns
    simple_pattern = r'\\\\newlabel\{fig:([^}@]+)\}\{\{[^}]*\}\{(\d+)\}'
    matches = re.findall(simple_pattern, content)
    if not matches:
        # Try with single backslash
        simple_pattern = r'\\newlabel\{fig:([^}@]+)\}\{\{[^}]*\}\{(\d+)\}'
        matches = re.findall(simple_pattern, content)
    for fig_name, page in matches:
        figure_pages[fig_name] = int(page)
        # Also store without extension for easier lookup
        base_name = Path(fig_name).stem
        if base_name != fig_name:
            figure_pages[base_name] = int(page)

    # Also parse @cref entries which have page in format:
    # \newlabel{fig:name@cref}{{[figure][num][chapter]1.1}{[1][5][]6}{}{}{}}
    # The page is the last number before the empty braces
    cref_pattern = r'\\\\newlabel\{fig:([^}]+)@cref\}\{\{[^}]*\}\{\[1\]\[\d+\]\[\](\d+)\}'
    matches = re.findall(cref_pattern, content)
    if not matches:
        cref_pattern = r'\\newlabel\{fig:([^}]+)@cref\}\{\{[^}]*\}\{\[1\]\[\d+\]\[\](\d+)\}'
        matches = re.findall(cref_pattern, content)
    for fig_name, page in matches:
        if fig_name not in figure_pages:
            figure_pages[fig_name] = int(page)
            base_name = Path(fig_name).stem
            if base_name not in figure_pages:
                figure_pages[base_name] = int(page)

    # Also extract from @writefile{lof} entries which list figures
    # Format: \@writefile{lof}{\contentsline {figure}{\numberline {1.1}...}{page}{...
    lof_pattern = r'@writefile\{lof\}.*?numberline\s*\{([^}]+)\}.*?\}\{(\d+)\}'
    matches = re.findall(lof_pattern, content)
    for fig_num, page in matches:
        # Store by figure number too
        figure_pages[f'fig_{fig_num}'] = int(page)

    return figure_pages


def get_book2_tex_files():
    """Get all .tex files that are part of book2."""
    book2_files = []

    # Read book2-main.tex to find included files
    book2_main = BOOK_DIR / "book2-main.tex"
    if not book2_main.exists():
        print(f"Warning: {book2_main} not found")
        return book2_files

    # Find files in book2-specific directories
    for part_dir in BOOK2_PARTS.keys():
        part_path = BOOK_DIR / part_dir
        if part_path.exists():
            for tex_file in part_path.rglob('*.tex'):
                book2_files.append(tex_file)

    # Also include relevant appendix files
    appendix_path = BOOK_DIR / "appendices" / "linear-algebra"
    if appendix_path.exists():
        for tex_file in appendix_path.rglob('*.tex'):
            book2_files.append(tex_file)

    return book2_files


def extract_figures_from_file(tex_file):
    """Extract all figure references from a tex file."""
    figures = []

    try:
        with open(tex_file, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        print(f"Error reading {tex_file}: {e}")
        return figures

    # Patterns to match figure includes
    patterns = [
        (r'\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}', 'includegraphics'),
        (r'\\includegraphicstatic(?:\[[^\]]*\])?\{([^}]+)\}', 'includegraphicstatic'),
        (r'\\includegraphicsource(?:\[[^\]]*\])?\{([^}]+)\}', 'includegraphicsource'),
        (r'\\refincludefigurestatic(?:\[[^\]]*\]){0,3}\{([^}]+)\}', 'refincludefigurestatic'),
        (r'\\refincludefiguresource(?:\[[^\]]*\]){0,3}\{([^}]+)\}', 'refincludefiguresource'),
    ]

    # Track current figure environment context for label association
    current_figure_start = None
    figure_labels = {}

    # First pass: find figure labels
    in_figure = False
    figure_start_line = 0
    for line_num, line in enumerate(lines, 1):
        if r'\begin{figure}' in line:
            in_figure = True
            figure_start_line = line_num
        elif r'\end{figure}' in line:
            in_figure = False
        elif in_figure and r'\label{' in line:
            label_match = re.search(r'\\label\{([^}]+)\}', line)
            if label_match:
                label = label_match.group(1)
                figure_labels[figure_start_line] = label

    # Second pass: extract figures
    in_figure = False
    figure_start_line = 0
    for line_num, line in enumerate(lines, 1):
        if r'\begin{figure}' in line:
            in_figure = True
            figure_start_line = line_num

        # Skip commented lines
        stripped = line.strip()
        if stripped.startswith('%'):
            continue

        for pattern, cmd_type in patterns:
            matches = re.finditer(pattern, line)
            for match in matches:
                fig_path = match.group(1)
                # Skip tikz references
                if fig_path.startswith('#'):
                    continue

                fig_entry = {
                    'path': fig_path,
                    'filename': Path(fig_path).name,
                    'line': line_num,
                    'command': cmd_type,
                    'source_file': tex_file,
                    'commented': False,
                    'label': figure_labels.get(figure_start_line) if in_figure else None,
                }
                figures.append(fig_entry)

        if r'\end{figure}' in line:
            in_figure = False

        # Also check for commented figures (for documentation)
        if stripped.startswith('%'):
            for pattern, cmd_type in patterns:
                matches = re.finditer(pattern, stripped[1:])
                for match in matches:
                    fig_path = match.group(1)
                    if fig_path.startswith('#'):
                        continue
                    figures.append({
                        'path': fig_path,
                        'filename': Path(fig_path).name,
                        'line': line_num,
                        'command': cmd_type,
                        'source_file': tex_file,
                        'commented': True,
                        'label': None,
                    })

    return figures


def parse_bib_metadata(bib_path):
    """Parse a bib file and return metadata keyed by filename."""
    metadata = {}
    if not bib_path.exists():
        return metadata

    try:
        with open(bib_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {bib_path}: {e}")
        return metadata

    # Find all @Online or @misc entries
    pattern = r'@(?:Online|misc)\{([^,]+),(.*?)(?=@(?:Online|misc)|\Z)'
    matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)

    for entry_id, entry_content in matches:
        entry_id = entry_id.strip()
        entry = {'id': entry_id}

        # Extract fields
        field_patterns = {
            'author': r'author\s*=\s*\{+([^}]+)\}+',
            'title': r'(?<!short)title\s*=\s*\{([^}]+)\}',
            'year': r'year\s*=\s*\{([^}]+)\}',
            'abstract': r'abstract\s*=\s*\{([^}]+)\}',
            'url': r'url\s*=\s*\{([^}]+)\}',
            'license': r'license\s*=\s*\{([^}]+)\}',
            'note': r'note\s*=\s*\{([^}]+)\}',
        }

        for field, field_pattern in field_patterns.items():
            match = re.search(field_pattern, entry_content, re.IGNORECASE)
            if match:
                entry[field] = match.group(1).strip()

        metadata[entry_id] = entry
        # Also store without extension
        base_name = Path(entry_id).stem
        if base_name != entry_id:
            metadata[base_name] = entry

    return metadata


def find_figure_file(fig_info):
    """Try to find the actual figure file."""
    filename = fig_info['filename']
    fig_path = fig_info['path']

    # Search locations based on command type
    search_paths = []

    if 'static' in fig_info['command']:
        search_paths.append(FIGURES_STATIC)
    elif 'source' in fig_info['command']:
        search_paths.append(FIGURES_SOURCE)
        search_paths.append(FIGURES_SOURCE / 'tikz')
    else:
        # Generic includegraphics - check multiple locations
        search_paths = [
            FIGURES_STATIC,
            FIGURES_SOURCE,
            FIGURES_SOURCE / 'tikz',
            BASE_DIR / 'Figures',
            BOOK_DIR / fig_path.rsplit('/', 1)[0] if '/' in fig_path else BOOK_DIR,
        ]

    # Also check relative to source file
    source_dir = fig_info['source_file'].parent
    search_paths.append(source_dir)
    search_paths.append(source_dir / 'figures')
    search_paths.append(source_dir / 'Figures')

    # Try to find the file
    for search_path in search_paths:
        if not search_path.exists():
            continue

        # Try exact path
        test_path = search_path / filename
        if test_path.exists():
            return test_path

        # Try without extension
        base_name = Path(filename).stem
        for ext in IMAGE_EXTENSIONS:
            test_path = search_path / (base_name + ext)
            if test_path.exists():
                return test_path

    # Try the full path from the tex file
    if '/' in fig_path:
        full_path = BOOK_DIR / fig_path
        if full_path.exists():
            return full_path
        # Try with extensions
        for ext in IMAGE_EXTENSIONS:
            test_path = BOOK_DIR / (fig_path + ext)
            if test_path.exists():
                return test_path

    return None


def get_chapter_info(tex_file):
    """Determine the part and chapter from file path."""
    rel_path = tex_file.relative_to(BOOK_DIR)
    parts = rel_path.parts

    part_name = "Unknown"
    chapter_name = "Unknown"

    for part_key, part_label in BOOK2_PARTS.items():
        if part_key in str(rel_path):
            part_name = part_label
            break

    for ch_key, ch_label in BOOK2_CHAPTERS.items():
        if ch_key in str(rel_path):
            chapter_name = ch_label
            break

    return part_name, chapter_name


def generate_latex_catalog(all_figures, metadata_static, metadata_source):
    """Generate the LaTeX catalog file."""

    # Organize figures by part/chapter
    by_part_chapter = defaultdict(lambda: defaultdict(list))

    for fig in all_figures:
        if fig['commented']:
            continue
        part, chapter = get_chapter_info(fig['source_file'])
        by_part_chapter[part][chapter].append(fig)

    # Generate LaTeX
    latex = []
    latex.append(r"""\documentclass[11pt]{article}
\usepackage[margin=1in]{geometry}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{xcolor}
\usepackage{hyperref}
\usepackage{graphicx}

\definecolor{found}{HTML}{228B22}
\definecolor{missing}{HTML}{DC143C}
\definecolor{warning}{HTML}{FF8C00}

\title{Book 2: Figures Catalog}
\author{Auto-generated}
\date{""" + datetime.now().strftime("%Y-%m-%d") + r"""}

\begin{document}
\maketitle

\tableofcontents
\newpage

""")

    # Statistics
    total_active = sum(1 for f in all_figures if not f['commented'])
    total_commented = sum(1 for f in all_figures if f['commented'])
    total_found = sum(1 for f in all_figures if not f['commented'] and f.get('found'))
    total_missing = total_active - total_found
    total_with_metadata = sum(1 for f in all_figures if not f['commented'] and f.get('has_metadata'))

    total_with_page = sum(1 for f in all_figures if not f['commented'] and f.get('page'))

    latex.append(r"""
\section{Summary Statistics}
\begin{itemize}
    \item \textbf{Total Active Figures:} """ + str(total_active) + r"""
    \item \textbf{Figures Found:} \textcolor{found}{""" + str(total_found) + r"""}
    \item \textbf{Figures Missing:} \textcolor{missing}{""" + str(total_missing) + r"""}
    \item \textbf{Figures with Metadata:} """ + str(total_with_metadata) + r"""
    \item \textbf{Figures with Page Numbers:} """ + str(total_with_page) + r"""
    \item \textbf{Commented-out Figures:} """ + str(total_commented) + r"""
\end{itemize}
\newpage

""")

    # Generate sections for each part/chapter
    for part_name in ['Part I: Integer Programming', 'Part II: Nonlinear Programming', 'Appendices']:
        if part_name not in by_part_chapter:
            continue

        latex.append(r"\section{" + part_name + "}\n\n")

        for chapter_name, figures in sorted(by_part_chapter[part_name].items()):
            latex.append(r"\subsection{" + chapter_name + "}\n\n")

            if not figures:
                latex.append(r"\textit{No figures in this chapter.}\n\n")
                continue

            latex.append(r"""
\begin{longtable}{|p{3.5cm}|p{1.5cm}|p{1cm}|p{4cm}|p{2cm}|}
\hline
\textbf{Filename} & \textbf{Line} & \textbf{Page} & \textbf{Source File} & \textbf{Status} \\
\hline
\endhead
""")

            for fig in figures:
                filename = fig['filename'].replace('_', r'\_')
                line = str(fig['line'])
                page = str(fig.get('page', '')) if fig.get('page') else '--'
                source = fig['source_file'].name.replace('_', r'\_')

                if fig.get('found'):
                    if fig.get('has_metadata'):
                        status = r"\textcolor{found}{Found + Meta}"
                    else:
                        status = r"\textcolor{warning}{Found (no meta)}"
                else:
                    status = r"\textcolor{missing}{MISSING}"

                latex.append(f"{filename} & {line} & {page} & {source} & {status} \\\\\n\\hline\n")

            latex.append(r"\end{longtable}" + "\n\n")

    # Missing figures section
    missing_figs = [f for f in all_figures if not f['commented'] and not f.get('found')]
    if missing_figs:
        latex.append(r"""
\section{Missing Figures}
The following figures are referenced but could not be found:

\begin{longtable}{|p{4cm}|p{4cm}|p{5cm}|}
\hline
\textbf{Filename} & \textbf{Referenced Path} & \textbf{Source File} \\
\hline
\endhead
""")
        for fig in missing_figs:
            filename = fig['filename'].replace('_', r'\_')
            path = fig['path'].replace('_', r'\_')
            source = fig['source_file'].name.replace('_', r'\_')
            latex.append(f"{filename} & {path} & {source} \\\\\n\\hline\n")

        latex.append(r"\end{longtable}" + "\n\n")

    # Figures needing metadata
    need_meta = [f for f in all_figures if not f['commented'] and f.get('found') and not f.get('has_metadata')]
    if need_meta:
        latex.append(r"""
\section{Figures Needing Metadata}
The following figures exist but have no attribution metadata:

\begin{longtable}{|p{5cm}|p{4cm}|p{4cm}|}
\hline
\textbf{Filename} & \textbf{Location} & \textbf{Source File} \\
\hline
\endhead
""")
        for fig in need_meta:
            filename = fig['filename'].replace('_', r'\_')
            location = str(fig.get('found_path', 'Unknown')).replace('_', r'\_')[-40:]
            source = fig['source_file'].name.replace('_', r'\_')
            latex.append(f"{filename} & ...{location} & {source} \\\\\n\\hline\n")

        latex.append(r"\end{longtable}" + "\n\n")

    latex.append(r"\end{document}")

    return '\n'.join(latex)


def generate_markdown_catalog(all_figures, metadata_static, metadata_source):
    """Generate the Markdown catalog file."""

    # Organize figures by part/chapter
    by_part_chapter = defaultdict(lambda: defaultdict(list))

    for fig in all_figures:
        part, chapter = get_chapter_info(fig['source_file'])
        by_part_chapter[part][chapter].append(fig)

    md = []
    md.append("# Book 2: Figures Catalog\n")
    md.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
    md.append(f"**Source:** `book2-main.tex`\n\n")
    md.append("---\n\n")

    # Statistics
    total_active = sum(1 for f in all_figures if not f['commented'])
    total_commented = sum(1 for f in all_figures if f['commented'])
    total_found = sum(1 for f in all_figures if not f['commented'] and f.get('found'))
    total_missing = total_active - total_found
    total_with_metadata = sum(1 for f in all_figures if not f['commented'] and f.get('has_metadata'))

    total_with_page = sum(1 for f in all_figures if not f['commented'] and f.get('page'))

    md.append("## Summary Statistics\n\n")
    md.append(f"| Metric | Count |\n")
    md.append(f"|--------|-------|\n")
    md.append(f"| Total Active Figures | {total_active} |\n")
    md.append(f"| Figures Found | {total_found} |\n")
    md.append(f"| Figures Missing | {total_missing} |\n")
    md.append(f"| Figures with Metadata | {total_with_metadata} |\n")
    md.append(f"| Figures with Page Numbers | {total_with_page} |\n")
    md.append(f"| Commented-out Figures | {total_commented} |\n\n")
    md.append("---\n\n")

    # Table of Contents
    md.append("## Table of Contents\n\n")
    for part_name in ['Part I: Integer Programming', 'Part II: Nonlinear Programming', 'Appendices']:
        if part_name in by_part_chapter:
            anchor = part_name.lower().replace(' ', '-').replace(':', '')
            md.append(f"- [{part_name}](#{anchor})\n")
            for chapter_name in sorted(by_part_chapter[part_name].keys()):
                ch_anchor = chapter_name.lower().replace(' ', '-').replace(':', '')
                md.append(f"  - [{chapter_name}](#{ch_anchor})\n")
    md.append("\n---\n\n")

    # Generate sections for each part/chapter
    for part_name in ['Part I: Integer Programming', 'Part II: Nonlinear Programming', 'Appendices']:
        if part_name not in by_part_chapter:
            continue

        md.append(f"## {part_name}\n\n")

        for chapter_name, figures in sorted(by_part_chapter[part_name].items()):
            md.append(f"### {chapter_name}\n\n")

            active_figs = [f for f in figures if not f['commented']]
            commented_figs = [f for f in figures if f['commented']]

            if not active_figs:
                md.append("*No active figures in this chapter.*\n\n")
            else:
                md.append(f"**Source file:** `{active_figs[0]['source_file'].name}`\n\n")
                md.append("| Filename | Line | Page | Command | Status |\n")
                md.append("|----------|------|------|---------|--------|\n")

                for fig in active_figs:
                    filename = fig['filename']
                    line = fig['line']
                    page = str(fig.get('page', '')) if fig.get('page') else '--'
                    cmd = fig['command']

                    if fig.get('found'):
                        if fig.get('has_metadata'):
                            status = "✓ Found + Metadata"
                        else:
                            status = "⚠ Found (no metadata)"
                    else:
                        status = "✗ **MISSING**"

                    md.append(f"| `{filename}` | {line} | {page} | `{cmd}` | {status} |\n")

                md.append("\n")

            if commented_figs:
                md.append(f"**Commented-out figures:** {len(commented_figs)}\n\n")

            md.append("---\n\n")

    # Missing figures section
    missing_figs = [f for f in all_figures if not f['commented'] and not f.get('found')]
    if missing_figs:
        md.append("## Missing Figures\n\n")
        md.append("The following figures are referenced but could not be found:\n\n")
        md.append("| Filename | Path | Source File |\n")
        md.append("|----------|------|-------------|\n")
        for fig in missing_figs:
            md.append(f"| `{fig['filename']}` | `{fig['path']}` | `{fig['source_file'].name}` |\n")
        md.append("\n---\n\n")

    # Figures needing metadata
    need_meta = [f for f in all_figures if not f['commented'] and f.get('found') and not f.get('has_metadata')]
    if need_meta:
        md.append("## Figures Needing Metadata\n\n")
        md.append("The following figures exist but have no attribution metadata:\n\n")
        md.append("| Filename | Location |\n")
        md.append("|----------|----------|\n")
        for fig in need_meta:
            location = str(fig.get('found_path', 'Unknown'))
            # Shorten path for display
            if len(location) > 60:
                location = "..." + location[-57:]
            md.append(f"| `{fig['filename']}` | `{location}` |\n")
        md.append("\n")

    return '\n'.join(md)


def main():
    print("=" * 60)
    print("Book 2 Figure Catalog Generator")
    print("=" * 60)

    # Get all tex files for book2
    print("\nFinding book2 tex files...")
    tex_files = get_book2_tex_files()
    print(f"Found {len(tex_files)} tex files")

    # Parse aux file for page numbers
    print("\nParsing aux file for page numbers...")
    figure_pages = parse_aux_for_pages()
    print(f"Found {len(figure_pages)} figure page references")

    # Parse metadata
    print("\nParsing metadata files...")
    metadata_static = parse_bib_metadata(FIGURES_STATIC / "00_METADATA.bib")
    metadata_source = parse_bib_metadata(FIGURES_SOURCE / "00_METADATA.bib")
    print(f"Found {len(metadata_static)} entries in figures-static")
    print(f"Found {len(metadata_source)} entries in figures-source")

    # Also check local metadata files
    local_metadata = {}
    for tex_file in tex_files:
        local_bib = tex_file.parent / "figures" / "00_METADATA.bib"
        if local_bib.exists():
            local_meta = parse_bib_metadata(local_bib)
            local_metadata.update(local_meta)
            print(f"Found {len(local_meta)} entries in {local_bib.relative_to(BOOK_DIR)}")

    # Combine all metadata
    all_metadata = {**metadata_static, **metadata_source, **local_metadata}

    # Extract figures from all files
    print("\nExtracting figure references...")
    all_figures = []
    for tex_file in tex_files:
        figures = extract_figures_from_file(tex_file)
        all_figures.extend(figures)

    print(f"Found {len(all_figures)} figure references")
    print(f"  - Active: {sum(1 for f in all_figures if not f['commented'])}")
    print(f"  - Commented: {sum(1 for f in all_figures if f['commented'])}")

    # Check which figures exist and have metadata
    print("\nChecking figure files and page numbers...")
    for fig in all_figures:
        found_path = find_figure_file(fig)
        fig['found'] = found_path is not None
        fig['found_path'] = found_path

        # Check for metadata
        filename = fig['filename']
        base_name = Path(filename).stem
        fig['has_metadata'] = (
            filename in all_metadata or
            base_name in all_metadata
        )

        # Look up page number - try multiple strategies
        fig['page'] = None

        # Strategy 1: Use the label from the figure environment (most reliable)
        label = fig.get('label', '')
        if label:
            # Remove 'fig:' prefix if present for lookup
            label_key = label.replace('fig:', '')
            if label_key in figure_pages:
                fig['page'] = figure_pages[label_key]
            elif label in figure_pages:
                fig['page'] = figure_pages[label]

        # Strategy 2: Try by exact filename
        if fig['page'] is None:
            if filename in figure_pages:
                fig['page'] = figure_pages[filename]
            elif base_name in figure_pages:
                fig['page'] = figure_pages[base_name]

        # Strategy 3: Try with common prefixes (wiki-File-, tikz-)
        if fig['page'] is None:
            for prefix in ['wiki-File-', 'tikz-']:
                if f"{prefix}{base_name}" in figure_pages:
                    fig['page'] = figure_pages[f"{prefix}{base_name}"]
                    break
                # Also try with .pdf extension
                if f"{prefix}{base_name}.pdf" in figure_pages:
                    fig['page'] = figure_pages[f"{prefix}{base_name}.pdf"]
                    break

        # Strategy 4: Try matching part of the filename
        if fig['page'] is None:
            for key in figure_pages:
                # Check if key contains the base_name or vice versa
                if base_name in key or key in base_name:
                    fig['page'] = figure_pages[key]
                    break

    found_count = sum(1 for f in all_figures if not f['commented'] and f['found'])
    meta_count = sum(1 for f in all_figures if not f['commented'] and f['has_metadata'])
    page_count = sum(1 for f in all_figures if not f['commented'] and f.get('page'))
    print(f"  - Found: {found_count}")
    print(f"  - With metadata: {meta_count}")
    print(f"  - With page numbers: {page_count}")

    # Generate LaTeX catalog
    print("\nGenerating LaTeX catalog...")
    latex_content = generate_latex_catalog(all_figures, metadata_static, metadata_source)
    with open(OUTPUT_TEX, 'w', encoding='utf-8') as f:
        f.write(latex_content)
    print(f"Saved to: {OUTPUT_TEX}")

    # Generate Markdown catalog
    print("\nGenerating Markdown catalog...")
    md_content = generate_markdown_catalog(all_figures, metadata_static, metadata_source)
    with open(OUTPUT_MD, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"Saved to: {OUTPUT_MD}")

    print("\n" + "=" * 60)
    print("Done!")
    print("=" * 60)


if __name__ == '__main__':
    main()
