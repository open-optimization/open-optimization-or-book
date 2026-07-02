#!/usr/bin/env python3
"""
fix-attributions.py
Fixes misattributed entries in the bib file.
"""

import re
from pathlib import Path

BASE_DIR = Path("/sessions/bold-adoring-fermat/mnt/open-optimization-or-book/Intro-Math-Programming/baseText")
FIGURES_STATIC_BIB = BASE_DIR / "optimization/figures/figures-static/00_METADATA.bib"

# Attribution corrections: entry_id -> (author, url if applicable)
ATTRIBUTION_FIXES = {
    # From an open source book on discrete mathematics
    "GraphExercise1.png": ("{{Open source discrete mathematics textbook}}", None),
    "GraphExercise15.png": ("{{Open source discrete mathematics textbook}}", None),
    "GraphExercise2.png": ("{{Open source discrete mathematics textbook}}", None),
    "GraphPicture.png": ("{{Open source discrete mathematics textbook}}", None),
    "GraphPictureDot.png": ("{{Open source discrete mathematics textbook}}", None),
    "Konigsberg_bridges.png": ("{{Open source discrete mathematics textbook}}", None),

    # From Wikipedia but remade
    "IP-with-LP-relaxation.png": ("{{Robert Hildebrand [CC BY-SA 4.0], based on Wikipedia}}", None),

    # Unknown source
    "SalaryPictogram.png": ("{{Unknown source}}", None),

    # Logos - not owned
    "coin-or-logo.png": ("{{COIN-OR Foundation}}", "https://www.coin-or.org/"),
    "gurobi-logo.jpg": ("{{Gurobi Optimization, LLC}}", "https://www.gurobi.com/"),
    "julia-logo.png": ("{{Julia Language}}", "https://julialang.org/"),
    "jump-logo.png": ("{{JuMP.dev}}", "https://jump.dev/"),
    "jupyter-logo.png": ("{{Project Jupyter}}", "https://jupyter.org/"),
    "logo1.png": ("{{Virginia Tech}}", "https://vt.edu/"),

    # From free online source
    "pipes.png": ("{{Free online source}}", None),

    # From YouTube video on Dijkstra
    "dijkstra-video-end.jpg": ("{{YouTube video on Dijkstra's algorithm}}", "https://www.youtube.com/"),
    "dijkstra-video-start.jpg": ("{{YouTube video on Dijkstra's algorithm}}", "https://www.youtube.com/"),
    "dijkstra-video.jpg": ("{{YouTube video on Dijkstra's algorithm}}", "https://www.youtube.com/"),

    # 2022_02_28 images - likely from a PDF/paper
    "2022_02_28_634e8079070800ac7e3cg-02.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-03.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-05.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-10.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-13.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-14.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-15.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-15(1).jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-17.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-19.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-20.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-21.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-22.jpg": ("{{External source - needs attribution}}", None),
    "2022_02_28_634e8079070800ac7e3cg-23.jpg": ("{{External source - needs attribution}}", None),
}


def fix_attributions(bib_path):
    """Fix misattributed entries in the bib file."""
    with open(bib_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    fixed_count = 0

    for entry_id, (new_author, new_url) in ATTRIBUTION_FIXES.items():
        # Find the entry
        entry_pattern = rf'(@Online\{{{re.escape(entry_id)},)'
        if not re.search(entry_pattern, content):
            # Try without extension
            base_name = entry_id.rsplit('.', 1)[0] if '.' in entry_id else entry_id
            entry_pattern = rf'(@Online\{{{re.escape(base_name)},)'
            if not re.search(entry_pattern, content):
                print(f"  Entry not found: {entry_id}")
                continue

        # Replace author field
        # Pattern to match the entry and its author field
        full_pattern = rf'(@Online\{{(?:{re.escape(entry_id)}|{re.escape(entry_id.rsplit(".", 1)[0]) if "." in entry_id else entry_id}),.*?)(author\s*=\s*\{{[^}}]+\}})'
        match = re.search(full_pattern, content, re.DOTALL)
        if match:
            old_author = match.group(2)
            new_author_field = f'author = {new_author}'
            content = content.replace(old_author, new_author_field, 1)
            fixed_count += 1
            print(f"  Fixed: {entry_id}")

    # Write back
    with open(bib_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return fixed_count


def main():
    print("=" * 60)
    print("Fixing misattributed entries")
    print("=" * 60)

    print(f"\nProcessing: {FIGURES_STATIC_BIB}")
    count = fix_attributions(FIGURES_STATIC_BIB)
    print(f"\nFixed {count} entries")


if __name__ == '__main__':
    main()
