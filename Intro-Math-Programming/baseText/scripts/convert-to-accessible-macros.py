#!/usr/bin/env python3
"""
convert-to-accessible-macros.py
Converts \includegraphics calls to accessible macros (\includegraphicstatic, \includegraphicsource).
"""

import os
import re
import sys
from pathlib import Path

BASE_DIR = Path("/sessions/bold-adoring-fermat/mnt/open-optimization-or-book/Intro-Math-Programming/baseText")
BOOK_DIR = BASE_DIR / "book"

# Pattern mappings for conversion
# The accessible macros use bibkeys (just the filename), not full paths
CONVERSIONS = [
    # figures-static path with full path
    (r'\\includegraphics(\[[^\]]*\])?\{optimization/figures/figures-static/([^}]+)\}',
     r'\\includegraphicstatic\1{\2}'),
    # figures-source path with full path
    (r'\\includegraphics(\[[^\]]*\])?\{optimization/figures/figures-source/([^}]+)\}',
     r'\\includegraphicsource\1{\2}'),
]

# Files/patterns to skip (logo commands, etc.)
SKIP_PATTERNS = [
    r'\\newcommand',  # Don't modify command definitions
    r'\\renewcommand',
    r'julia-logo',
    r'jupyter-logo',
    r'jump-logo',
    r'gurobi-logo',
    r'coin-or-logo',
]

# Files to skip entirely (preamble files with macro definitions)
SKIP_FILES = [
    'preamble0-biblatex.tex',
    'preamble-simplified.tex',
    'preamble-optimization.tex',
]


def should_skip_line(line):
    """Check if a line should be skipped."""
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, line):
            return True
    return False


def convert_file(filepath, dry_run=True):
    """Convert includegraphics calls in a single file."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()

    changes = []
    new_lines = []

    for line_num, line in enumerate(lines, 1):
        if should_skip_line(line):
            new_lines.append(line)
            continue

        new_line = line
        for old_pattern, new_pattern in CONVERSIONS:
            if re.search(old_pattern, new_line):
                updated = re.sub(old_pattern, new_pattern, new_line)
                if updated != new_line:
                    changes.append((line_num, line.strip(), updated.strip()))
                    new_line = updated

        new_lines.append(new_line)

    if changes and not dry_run:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)

    return changes


def main():
    dry_run = '--dry-run' in sys.argv or '-n' in sys.argv

    if dry_run:
        print("DRY RUN - no files will be modified")
        print("Run without --dry-run to apply changes\n")

    # Find all .tex files in book directory
    tex_files = list(BOOK_DIR.rglob('*.tex'))

    files_changed = 0
    total_changes = 0

    for filepath in tex_files:
        # Skip preamble files with macro definitions
        if filepath.name in SKIP_FILES:
            continue
        changes = convert_file(filepath, dry_run=dry_run)
        if changes:
            rel_path = filepath.relative_to(BASE_DIR)
            print(f"\n{rel_path}:")
            for line_num, old, new in changes:
                print(f"  Line {line_num}:")
                print(f"    - {old}")
                print(f"    + {new}")
            files_changed += 1
            total_changes += len(changes)

    print(f"\n{'Would update' if dry_run else 'Updated'} {files_changed} files with {total_changes} conversions")

    if dry_run:
        print("\nRun without --dry-run to apply changes")


if __name__ == '__main__':
    main()
