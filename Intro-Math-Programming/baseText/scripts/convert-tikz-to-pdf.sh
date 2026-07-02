#!/bin/bash
# convert-tikz-to-pdf.sh
# Batch convert TikZ standalone files to PDF for EPUB compatibility
#
# Usage:
#   ./convert-tikz-to-pdf.sh [directory]
#
# If no directory is specified, converts files in optimization/figures/figures-source/
#
# Requirements:
#   - lualatex or pdflatex
#   - TikZ standalone files should use \documentclass{standalone}

set -e

# Default directory
FIGURES_DIR="${1:-../optimization/figures/figures-source}"

# LaTeX compiler to use
LATEX_CMD="lualatex"

# Check if lualatex is available, fall back to pdflatex
if ! command -v lualatex &> /dev/null; then
    if command -v pdflatex &> /dev/null; then
        LATEX_CMD="pdflatex"
        echo "Using pdflatex (lualatex not found)"
    else
        echo "Error: Neither lualatex nor pdflatex found"
        exit 1
    fi
fi

echo "Converting TikZ files in: $FIGURES_DIR"
echo "Using: $LATEX_CMD"
echo ""

# Create a temporary directory for compilation
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Counter for converted files
converted=0
failed=0

# Find all .tex files that contain 'standalone' documentclass
for texfile in "$FIGURES_DIR"/*.tex; do
    [ -f "$texfile" ] || continue

    # Check if it's a standalone document
    if grep -q '\\documentclass.*standalone' "$texfile" 2>/dev/null; then
        filename=$(basename "$texfile" .tex)
        pdffile="$FIGURES_DIR/$filename.pdf"

        # Check if PDF already exists and is newer than tex file
        if [ -f "$pdffile" ] && [ "$pdffile" -nt "$texfile" ]; then
            echo "Skipping $filename.tex (PDF is up to date)"
            continue
        fi

        echo -n "Converting $filename.tex... "

        # Copy tex file to temp directory
        cp "$texfile" "$TEMP_DIR/"

        # Run LaTeX in temp directory
        cd "$TEMP_DIR"
        if $LATEX_CMD -interaction=nonstopmode "$filename.tex" > /dev/null 2>&1; then
            # Copy PDF back to figures directory
            cp "$filename.pdf" "$pdffile"
            echo "OK"
            ((converted++))
        else
            echo "FAILED"
            ((failed++))
            # Show error log
            if [ -f "$filename.log" ]; then
                echo "  Error log tail:"
                tail -20 "$filename.log" | sed 's/^/    /'
            fi
        fi

        # Return to original directory
        cd - > /dev/null

        # Clean temp directory
        rm -f "$TEMP_DIR"/*
    fi
done

echo ""
echo "Conversion complete: $converted succeeded, $failed failed"

# Also create EPS versions if requested
if [ "$2" = "--eps" ]; then
    echo ""
    echo "Creating EPS versions..."
    for pdffile in "$FIGURES_DIR"/*.pdf; do
        [ -f "$pdffile" ] || continue
        filename=$(basename "$pdffile" .pdf)
        epsfile="$FIGURES_DIR/$filename.eps"

        if [ -f "$epsfile" ] && [ "$epsfile" -nt "$pdffile" ]; then
            echo "Skipping $filename.pdf (EPS is up to date)"
            continue
        fi

        echo -n "Converting $filename.pdf to EPS... "
        if pdftops -eps "$pdffile" "$epsfile" 2>/dev/null; then
            echo "OK"
        else
            echo "FAILED (pdftops not available?)"
        fi
    done
fi
