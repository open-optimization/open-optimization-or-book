#!/usr/bin/env python3
"""
generate-bib-entries.py
Generates missing bib entries for images and adds 'Missing AltText' placeholder
to entries that don't have an abstract field.
"""

import os
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("/sessions/bold-adoring-fermat/mnt/open-optimization-or-book/Intro-Math-Programming/baseText")
FIGURES_STATIC = BASE_DIR / "optimization/figures/figures-static"
FIGURES_SOURCE = BASE_DIR / "optimization/figures/figures-source"

# Image extensions to process
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.pdf', '.eps', '.svg', '.gif'}

def parse_bib_file(bib_path):
    """Parse a bib file and return a dict of entries keyed by their ID."""
    entries = {}
    if not bib_path.exists():
        return entries

    with open(bib_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    # Find all @Online entries
    pattern = r'@Online\{([^,]+),([^@]*?)(?=@Online|\Z)'
    matches = re.findall(pattern, content, re.DOTALL)

    for entry_id, entry_content in matches:
        entry_id = entry_id.strip()
        has_abstract = 'abstract' in entry_content.lower()
        entries[entry_id] = {
            'content': entry_content,
            'has_abstract': has_abstract
        }

    return entries

def generate_bib_entry(filename, has_tex_source=False):
    """Generate a skeleton bib entry for an image file."""
    # Remove extension for the entry ID
    name = Path(filename).stem
    ext = Path(filename).suffix.lower()

    # Keep extension in ID for consistency with existing entries
    entry_id = filename

    # Generate a title from the filename
    title = name.replace('-', ' ').replace('_', ' ').title()

    entry = f'''@Online{{{entry_id},
  author = {{{{Robert Hildebrand [CC BY-SA 4.0]}}}},
  title = {{{title}}},
  shorttitle = {{{title}}},
  year = {{{datetime.now().year}}},
  abstract = {{Missing AltText: Please add a description for screen readers.}},
  options = {{skipbib=true}},
}}

'''
    return entry

def add_abstract_to_entry(entry_content, entry_id):
    """Add an abstract field to an existing entry that lacks one."""
    # Find where to insert the abstract (after shorttitle or title)
    # Look for the last field before options

    # Add abstract before options line
    if 'options' in entry_content:
        pattern = r'(\s*options\s*=)'
        replacement = r'  abstract = {Missing AltText: Please add a description for screen readers.},\n\1'
        new_content = re.sub(pattern, replacement, entry_content, count=1)
        return new_content
    else:
        # Add at the end
        return entry_content.rstrip() + '\n  abstract = {Missing AltText: Please add a description for screen readers.},\n'

def get_image_files(folder):
    """Get all image files in a folder."""
    images = []
    if not folder.exists():
        return images

    for f in folder.iterdir():
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS:
            images.append(f.name)

    return sorted(images)

def main():
    # Process figures-static
    print("=" * 60)
    print("Processing figures-static")
    print("=" * 60)

    bib_static = FIGURES_STATIC / "00_METADATA.bib"
    existing_static = parse_bib_file(bib_static)
    image_files_static = get_image_files(FIGURES_STATIC)

    print(f"Found {len(existing_static)} existing bib entries")
    print(f"Found {len(image_files_static)} image files")

    # Find entries without abstract
    entries_without_abstract = [k for k, v in existing_static.items() if not v['has_abstract']]
    print(f"Entries without abstract field: {len(entries_without_abstract)}")

    # Find images without entries
    existing_ids = set(existing_static.keys())
    # Also check without extension
    existing_stems = {Path(k).stem for k in existing_ids}

    missing_entries = []
    for img in image_files_static:
        stem = Path(img).stem
        if img not in existing_ids and stem not in existing_ids and stem not in existing_stems:
            missing_entries.append(img)

    print(f"Images without bib entries: {len(missing_entries)}")

    # Generate new entries
    new_entries = []
    for img in missing_entries[:50]:  # Limit to 50 at a time
        entry = generate_bib_entry(img)
        new_entries.append(entry)
        print(f"  + {img}")

    if len(missing_entries) > 50:
        print(f"  ... and {len(missing_entries) - 50} more (run again to generate more)")

    # Write updates to bib file
    if new_entries or entries_without_abstract:
        with open(bib_static, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        # Add abstract to entries that don't have it
        for entry_id in entries_without_abstract:
            print(f"  * Adding abstract to: {entry_id}")
            # Find and update the entry
            pattern = rf'(@Online\{{{re.escape(entry_id)},)([^@]*?)(\}})\s*(?=@Online|\Z)'
            match = re.search(pattern, content, re.DOTALL)
            if match:
                old_entry = match.group(0)
                entry_content = match.group(2)
                if 'abstract' not in entry_content.lower():
                    new_entry_content = add_abstract_to_entry(entry_content, entry_id)
                    new_entry = match.group(1) + new_entry_content + match.group(3) + '\n\n'
                    content = content.replace(old_entry, new_entry)

        # Append new entries
        if new_entries:
            content = content.rstrip() + '\n\n% Auto-generated entries (need alt text)\n'
            content += ''.join(new_entries)

        with open(bib_static, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"\nUpdated {bib_static}")

    # Process figures-source
    print("\n" + "=" * 60)
    print("Processing figures-source")
    print("=" * 60)

    bib_source = FIGURES_SOURCE / "00_METADATA.bib"
    existing_source = parse_bib_file(bib_source)
    image_files_source = get_image_files(FIGURES_SOURCE)

    print(f"Found {len(existing_source)} existing bib entries")
    print(f"Found {len(image_files_source)} image files")

    # Find entries without abstract
    entries_without_abstract_src = [k for k, v in existing_source.items() if not v['has_abstract']]
    print(f"Entries without abstract field: {len(entries_without_abstract_src)}")

    # Find images without entries in source
    existing_ids_src = set(existing_source.keys())
    existing_stems_src = {Path(k).stem for k in existing_ids_src}

    missing_entries_src = []
    for img in image_files_source:
        stem = Path(img).stem
        if img not in existing_ids_src and stem not in existing_ids_src and stem not in existing_stems_src:
            missing_entries_src.append(img)

    print(f"Images without bib entries: {len(missing_entries_src)}")

    # Generate new entries for source
    new_entries_src = []
    for img in missing_entries_src[:50]:
        entry = generate_bib_entry(img, has_tex_source=True)
        new_entries_src.append(entry)
        print(f"  + {img}")

    if len(missing_entries_src) > 50:
        print(f"  ... and {len(missing_entries_src) - 50} more")

    # Write updates to source bib file
    if new_entries_src or entries_without_abstract_src:
        with open(bib_source, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        # Add abstract to entries that don't have it
        for entry_id in entries_without_abstract_src:
            print(f"  * Adding abstract to: {entry_id}")
            pattern = rf'(@Online\{{{re.escape(entry_id)},)([^@]*?)(\}})\s*(?=@Online|\Z)'
            match = re.search(pattern, content, re.DOTALL)
            if match:
                old_entry = match.group(0)
                entry_content = match.group(2)
                if 'abstract' not in entry_content.lower():
                    new_entry_content = add_abstract_to_entry(entry_content, entry_id)
                    new_entry = match.group(1) + new_entry_content + match.group(3) + '\n\n'
                    content = content.replace(old_entry, new_entry)

        # Append new entries
        if new_entries_src:
            content = content.rstrip() + '\n\n% Auto-generated entries (need alt text)\n'
            content += ''.join(new_entries_src)

        with open(bib_source, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"\nUpdated {bib_source}")

    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"figures-static: {len(entries_without_abstract)} entries updated, {len(new_entries)} new entries")
    print(f"figures-source: {len(entries_without_abstract_src)} entries updated, {len(new_entries_src)} new entries")
    print("\nSearch for 'Missing AltText' in the .bib files to find entries that need descriptions.")

if __name__ == '__main__':
    main()
