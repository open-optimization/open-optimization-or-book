#!/usr/bin/env python3
"""
generate-figure-catalog.py
Generates a PDF catalog of all figures with their images and metadata side-by-side.
Organizes by: Used in Book vs Not Used in Book
"""

import re
import os
import subprocess
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.platypus import KeepTogether
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# Use relative path from script location for portability
SCRIPT_DIR = Path(__file__).parent.resolve()
BASE_DIR = SCRIPT_DIR.parent
FIGURES_STATIC = BASE_DIR / "book/optimization/figures/figures-static"
FIGURES_SOURCE = BASE_DIR / "book/optimization/figures/figures-source"
BOOK_DIR = BASE_DIR / "book"
OUTPUT_PDF = SCRIPT_DIR / "figure-catalog.pdf"

# Image extensions we can display directly
DISPLAYABLE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif'}
# PDF files - we'll try to convert these
PDF_EXTENSIONS = {'.pdf'}
# Extensions we have but can't easily display inline
OTHER_EXTENSIONS = {'.eps', '.svg'}

# Try to import pdf2image for PDF rendering
try:
    from pdf2image import convert_from_path
    HAS_PDF2IMAGE = True
    # Increase PIL limit to handle larger PDFs
    from PIL import Image as PILImage
    PILImage.MAX_IMAGE_PIXELS = 500000000  # 500 megapixels
except ImportError:
    HAS_PDF2IMAGE = False
    print("Note: pdf2image not available. PDF files will show placeholder text.")
    print("Install with: pip install pdf2image (requires poppler)")

# Temp directory for converted PDFs
import tempfile
TEMP_DIR = Path(tempfile.mkdtemp())


def get_used_images():
    """Find all images referenced in the book's .tex files."""
    used = set()

    # Find all includegraphics references
    for tex_file in BOOK_DIR.rglob('*.tex'):
        try:
            with open(tex_file, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()

            # Match various includegraphics patterns
            patterns = [
                r'\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}',
                r'\\includegraphicstatic(?:\[[^\]]*\])?\{([^}]+)\}',
                r'\\includegraphicsource(?:\[[^\]]*\])?\{([^}]+)\}',
                r'\\includefigurestatic(?:\[[^\]]*\]){0,3}\{([^}]+)\}',
                r'\\includefiguresource(?:\[[^\]]*\]){0,3}\{([^}]+)\}',
                r'\\refincludefigurestatic(?:\[[^\]]*\]){0,3}\{([^}]+)\}',
                r'\\refincludefiguresource(?:\[[^\]]*\]){0,3}\{([^}]+)\}',
            ]

            for pattern in patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    # Extract just the filename
                    filename = match.split('/')[-1]
                    # Remove any path prefixes
                    if filename.startswith('#'):
                        continue  # Skip tikz references like #1
                    used.add(filename)
                    # Also add without extension
                    base = Path(filename).stem
                    used.add(base)

        except Exception as e:
            print(f"Error reading {tex_file}: {e}")

    return used


def parse_bib_file(bib_path):
    """Parse a bib file and return a list of entries with their metadata."""
    entries = []
    if not bib_path.exists():
        return entries

    with open(bib_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    # Find all @Online entries
    pattern = r'@Online\{([^,]+),(.*?)(?=@Online|\Z)'
    matches = re.findall(pattern, content, re.DOTALL)

    for entry_id, entry_content in matches:
        entry_id = entry_id.strip()

        # Extract fields
        entry = {'id': entry_id}

        # Author
        author_match = re.search(r'author\s*=\s*\{+([^}]+)\}+', entry_content)
        if author_match:
            entry['author'] = author_match.group(1).strip()

        # Title
        title_match = re.search(r'(?<!short)title\s*=\s*\{([^}]+)\}', entry_content)
        if title_match:
            entry['title'] = title_match.group(1).strip()

        # Year
        year_match = re.search(r'year\s*=\s*\{([^}]+)\}', entry_content)
        if year_match:
            entry['year'] = year_match.group(1).strip()

        # Abstract (alt text)
        abstract_match = re.search(r'abstract\s*=\s*\{([^}]+)\}', entry_content)
        if abstract_match:
            entry['abstract'] = abstract_match.group(1).strip()

        # URL
        url_match = re.search(r'url\s*=\s*\{([^}]+)\}', entry_content)
        if url_match:
            entry['url'] = url_match.group(1).strip()

        entries.append(entry)

    return entries


def find_image_file(entry_id, folder):
    """Find the actual image file for an entry ID."""
    # Try exact match first
    exact_path = folder / entry_id
    if exact_path.exists():
        return exact_path

    # Try without extension - check all possible extensions
    base_name = Path(entry_id).stem
    all_extensions = DISPLAYABLE_EXTENSIONS | PDF_EXTENSIONS | OTHER_EXTENSIONS
    for ext in all_extensions:
        test_path = folder / (base_name + ext)
        if test_path.exists():
            return test_path

    # Try with common extensions appended (in case entry_id has no extension)
    for ext in all_extensions:
        test_path = folder / (entry_id + ext)
        if test_path.exists():
            return test_path

    # Try case-insensitive search
    try:
        folder_files = {f.name.lower(): f for f in folder.iterdir() if f.is_file()}
        entry_lower = entry_id.lower()
        base_lower = base_name.lower()

        # Check exact match (case insensitive)
        if entry_lower in folder_files:
            return folder_files[entry_lower]

        # Check base name with extensions
        for ext in all_extensions:
            test_name = base_lower + ext
            if test_name in folder_files:
                return folder_files[test_name]
    except Exception:
        pass

    return None


def convert_pdf_to_image(pdf_path):
    """Convert first page of PDF to PNG for display."""
    if not HAS_PDF2IMAGE:
        return None

    try:
        # Convert first page only, at reasonable resolution
        images = convert_from_path(str(pdf_path), first_page=1, last_page=1, dpi=150)
        if images:
            # Save to temp file
            png_path = TEMP_DIR / (pdf_path.stem + "_preview.png")
            images[0].save(str(png_path), 'PNG')
            return png_path
    except Exception as e:
        print(f"Could not convert PDF {pdf_path.name}: {e}")
    return None


def is_image_used(entry_id, used_images):
    """Check if an image is used in the book."""
    # Check exact match
    if entry_id in used_images:
        return True
    # Check without extension
    base_name = Path(entry_id).stem
    if base_name in used_images:
        return True
    # Check with common extensions
    for ext in ['.png', '.jpg', '.jpeg', '.pdf', '.eps']:
        if (base_name + ext) in used_images:
            return True
    return False


def create_catalog():
    """Create the PDF catalog."""
    # Get used images
    print("Finding images used in book...")
    used_images = get_used_images()
    print(f"Found {len(used_images)} image references in book")

    # Parse bib files
    static_entries = parse_bib_file(FIGURES_STATIC / "00_METADATA.bib")
    source_entries = parse_bib_file(FIGURES_SOURCE / "00_METADATA.bib")

    print(f"Found {len(static_entries)} entries in figures-static")
    print(f"Found {len(source_entries)} entries in figures-source")

    # Categorize entries
    static_used = [e for e in static_entries if is_image_used(e['id'], used_images)]
    static_unused = [e for e in static_entries if not is_image_used(e['id'], used_images)]
    source_used = [e for e in source_entries if is_image_used(e['id'], used_images)]
    source_unused = [e for e in source_entries if not is_image_used(e['id'], used_images)]

    print(f"\nUsed in book: {len(static_used)} static, {len(source_used)} source")
    print(f"Not used: {len(static_unused)} static, {len(source_unused)} source")

    # Create PDF document
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=landscape(letter),
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch
    )

    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=20,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=10,
        textColor=colors.darkblue
    )
    subheading_style = ParagraphStyle(
        'SubHeading',
        parent=styles['Heading3'],
        fontSize=12,
        spaceAfter=8,
        textColor=colors.darkgreen
    )
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=9,
        spaceAfter=2
    )
    alt_text_style = ParagraphStyle(
        'AltText',
        parent=styles['Normal'],
        fontSize=9,
        spaceAfter=2,
        textColor=colors.darkgreen,
        leftIndent=10
    )
    missing_style = ParagraphStyle(
        'Missing',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.red
    )
    warning_style = ParagraphStyle(
        'Warning',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.orange
    )

    # Build story
    story = []

    # Title page
    story.append(Paragraph("Figure Catalog", title_style))
    story.append(Paragraph("Images and Metadata from Intro-Math-Programming", styles['Heading2']))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"<b>Total figures:</b> {len(static_entries) + len(source_entries)}", normal_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Used in Book:</b>", normal_style))
    story.append(Paragraph(f"&nbsp;&nbsp;• figures-static: {len(static_used)}", normal_style))
    story.append(Paragraph(f"&nbsp;&nbsp;• figures-source: {len(source_used)}", normal_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Not Used in Book:</b>", normal_style))
    story.append(Paragraph(f"&nbsp;&nbsp;• figures-static: {len(static_unused)}", normal_style))
    story.append(Paragraph(f"&nbsp;&nbsp;• figures-source: {len(source_unused)}", normal_style))
    story.append(PageBreak())

    # SECTION 1: Images Used in Book
    story.append(Paragraph("PART 1: Images Used in Book", title_style))
    story.append(Spacer(1, 20))

    # Static images used
    if static_used:
        story.append(Paragraph(f"Figures-Static ({len(static_used)} images)", heading_style))
        story.append(Spacer(1, 10))
        for i, entry in enumerate(static_used):
            elements = create_entry_elements(entry, FIGURES_STATIC, normal_style, alt_text_style, missing_style, warning_style, used=True)
            if elements:
                story.extend(elements)
                if (i + 1) % 3 == 0:
                    story.append(PageBreak())
                else:
                    story.append(Spacer(1, 15))
        story.append(PageBreak())

    # Source images used
    if source_used:
        story.append(Paragraph(f"Figures-Source ({len(source_used)} images)", heading_style))
        story.append(Spacer(1, 10))
        for i, entry in enumerate(source_used):
            elements = create_entry_elements(entry, FIGURES_SOURCE, normal_style, alt_text_style, missing_style, warning_style, used=True)
            if elements:
                story.extend(elements)
                if (i + 1) % 3 == 0:
                    story.append(PageBreak())
                else:
                    story.append(Spacer(1, 15))
        story.append(PageBreak())

    # SECTION 2: Images NOT Used in Book
    story.append(Paragraph("PART 2: Images NOT Used in Book", title_style))
    story.append(Paragraph("<i>(Consider removing or archiving these)</i>", normal_style))
    story.append(Spacer(1, 20))

    # Static images not used
    if static_unused:
        story.append(Paragraph(f"Figures-Static ({len(static_unused)} images)", heading_style))
        story.append(Spacer(1, 10))
        for i, entry in enumerate(static_unused):
            elements = create_entry_elements(entry, FIGURES_STATIC, normal_style, alt_text_style, missing_style, warning_style, used=False)
            if elements:
                story.extend(elements)
                if (i + 1) % 3 == 0:
                    story.append(PageBreak())
                else:
                    story.append(Spacer(1, 15))
        story.append(PageBreak())

    # Source images not used
    if source_unused:
        story.append(Paragraph(f"Figures-Source ({len(source_unused)} images)", heading_style))
        story.append(Spacer(1, 10))
        for i, entry in enumerate(source_unused):
            elements = create_entry_elements(entry, FIGURES_SOURCE, normal_style, alt_text_style, missing_style, warning_style, used=False)
            if elements:
                story.extend(elements)
                if (i + 1) % 3 == 0:
                    story.append(PageBreak())
                else:
                    story.append(Spacer(1, 15))

    # Build PDF
    doc.build(story)
    print(f"\nCatalog saved to: {OUTPUT_PDF}")


def create_entry_elements(entry, folder, normal_style, alt_text_style, missing_style, warning_style, used=True):
    """Create the elements for a single entry."""
    entry_id = entry.get('id', 'Unknown')

    # Find image file
    image_path = find_image_file(entry_id, folder)

    # Create metadata text
    metadata_parts = []

    # Entry ID / filename
    metadata_parts.append(Paragraph(f"<b>File:</b> {entry_id}", normal_style))

    # Title
    if entry.get('title'):
        metadata_parts.append(Paragraph(f"<b>Title:</b> {entry['title']}", normal_style))

    # Author - highlight if needs attention
    if entry.get('author'):
        author = entry['author'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        if 'needs attribution' in author.lower() or 'unknown' in author.lower() or 'external source' in author.lower():
            metadata_parts.append(Paragraph(f"<b>Author:</b> <font color='orange'>{author}</font>", normal_style))
        else:
            metadata_parts.append(Paragraph(f"<b>Author:</b> {author}", normal_style))

    # Year
    if entry.get('year'):
        metadata_parts.append(Paragraph(f"<b>Year:</b> {entry['year']}", normal_style))

    # Alt text
    if entry.get('abstract'):
        abstract = entry['abstract'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        if 'Missing AltText' in abstract:
            metadata_parts.append(Paragraph(f"<b>Alt Text:</b> <font color='red'>{abstract}</font>", normal_style))
        else:
            metadata_parts.append(Paragraph("<b>Alt Text:</b>", normal_style))
            metadata_parts.append(Paragraph(abstract, alt_text_style))

    # Create image element
    display_path = None
    if image_path:
        suffix = image_path.suffix.lower()
        if suffix in DISPLAYABLE_EXTENSIONS:
            display_path = image_path
        elif suffix in PDF_EXTENSIONS:
            # Try to convert PDF to image
            converted = convert_pdf_to_image(image_path)
            if converted:
                display_path = converted

    if display_path:
        try:
            # Get image dimensions and scale to fit
            img = Image(str(display_path))
            max_width = 3.5 * inch
            max_height = 2 * inch

            # Scale proportionally
            aspect = img.imageWidth / img.imageHeight if img.imageHeight > 0 else 1
            if aspect > max_width / max_height:
                img.drawWidth = max_width
                img.drawHeight = max_width / aspect
            else:
                img.drawHeight = max_height
                img.drawWidth = max_height * aspect

            image_cell = img
        except Exception as e:
            image_cell = Paragraph(f"<i>Error loading image: {str(e)[:50]}</i>", missing_style)
    elif image_path and image_path.suffix.lower() in PDF_EXTENSIONS:
        image_cell = Paragraph(f"<i>[PDF file - install pdf2image to display]</i>", warning_style)
    elif image_path and image_path.suffix.lower() in OTHER_EXTENSIONS:
        image_cell = Paragraph(f"<i>[{image_path.suffix.upper()} file - not displayable]</i>", normal_style)
    else:
        image_cell = Paragraph(f"<i>[Image file not found: {entry_id}]</i>", missing_style)

    # Create a table with image on left, metadata on right
    # Use different background color for used vs unused
    bg_color = colors.Color(0.95, 0.98, 0.95) if used else colors.Color(0.98, 0.95, 0.95)

    table_data = [[image_cell, metadata_parts]]

    table = Table(table_data, colWidths=[4*inch, 5.5*inch])
    table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('BOX', (0, 0), (-1, -1), 1, colors.lightgrey),
        ('BACKGROUND', (0, 0), (-1, -1), bg_color),
    ]))

    return [KeepTogether([table])]


def cleanup_temp():
    """Clean up temporary files."""
    import shutil
    try:
        shutil.rmtree(TEMP_DIR)
    except Exception:
        pass


if __name__ == '__main__':
    try:
        create_catalog()
    finally:
        cleanup_temp()
