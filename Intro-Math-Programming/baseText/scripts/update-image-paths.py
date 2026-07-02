#!/usr/bin/env python3
"""
update-image-paths.py
Updates image paths in LaTeX files to use the consolidated figures-static folder.
"""

import os
import re
import sys
from pathlib import Path

# Base directory
BASE_DIR = Path("/sessions/bold-adoring-fermat/mnt/open-optimization-or-book/Intro-Math-Programming/baseText")
BOOK_DIR = BASE_DIR / "book"
FIGURES_STATIC = "optimization/figures/figures-static"

# Path replacements: old_pattern -> new_path
# These are the scattered directories we consolidated
PATH_REPLACEMENTS = [
    # Figures/ directory (most common)
    (r'Figures/', f'{FIGURES_STATIC}/'),
    # graph-theory-graphics/
    (r'graph-theory-graphics/', f'{FIGURES_STATIC}/'),
    # optimization/multi-objective/images/
    (r'optimization/multi-objective/images/', f'{FIGURES_STATIC}/'),
]

# For \includetikz, we need special handling since it expects paths without extension
TIKZ_REPLACEMENTS = [
    (r'Figures/', f'{FIGURES_STATIC}/'),
]

def update_file(filepath, dry_run=True):
    """Update image paths in a single file."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    original = content
    changes = []

    # Update \includegraphics paths
    for old_pattern, new_path in PATH_REPLACEMENTS:
        # Match \includegraphics with various option formats
        pattern = r'(\\includegraphics\s*(?:\[[^\]]*\])?\s*\{)' + re.escape(old_pattern)
        replacement = r'\g<1>' + new_path
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            changes.append(f"  includegraphics: {old_pattern} -> {new_path}")
            content = new_content

    # Update \includetikz paths
    for old_pattern, new_path in TIKZ_REPLACEMENTS:
        pattern = r'(\\includetikz\s*(?:\[[^\]]*\])?\s*\{)' + re.escape(old_pattern)
        replacement = r'\g<1>' + new_path
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            changes.append(f"  includetikz: {old_pattern} -> {new_path}")
            content = new_content

    if content != original:
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        return changes
    return None

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
        changes = update_file(filepath, dry_run=dry_run)
        if changes:
            print(f"\n{filepath.relative_to(BASE_DIR)}:")
            for change in changes:
                print(change)
            files_changed += 1
            total_changes += len(changes)

    print(f"\n{'Would update' if dry_run else 'Updated'} {files_changed} files with {total_changes} path changes")

    if dry_run:
        print("\nRun without --dry-run to apply changes")

if __name__ == '__main__':
    main()
