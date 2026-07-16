#!/usr/bin/env bash
# ============================================================================
# purge-history.sh - permanently remove non-CC-BY-SA-4.0 content from git
# history using git-filter-repo.
#
# WHAT THIS REMOVES (in history only; none of these are in the current tree):
#   1. Griffin's PSU course materials (CC BY-NC-SA 3.0, incompatible) at ALL
#      THREE historical locations (verified by full-history scan 2026-07-16):
#        - ClassNotes/                                   (root, 202 files)
#        - Intro-Math-Programming/baseText/Christopher_Griffin_Penn_State_University/
#        - Intro-Math-Programming/baseText/external-sources/Christopher_Griffin_Penn_State_University/
#      (ClassNotes/ verified to be a pure subset of the Griffin file set.)
#   2. Intro-Math-Programming/baseText/optimization/ucdavis-*.pdf
#      Six UC Davis course-notes PDFs once \includepdf'd wholesale
#      (copyright status unresolved; never confirmed open).
#   3. The Erickson LP-notes excerpt (CC BY-NC-SA 4.0, incompatible) under
#      all THREE historical names: baseText/borrowed-duality.tex,
#      optimization/duality-borrowed.tex, and
#      archive/orphaned-content/borrowed-duality.tex.
#
# KNOWN LIMITATION (deliberate): pre-May-2026 versions of the book's own
# chapter files still contain Griffin-derived prose (that is what the license
# cleanup rewrote). Purging those would mean deleting the book's entire
# editing history. If you ever want that too, the clean alternative is to
# start a fresh repo from the current tree (squash to a single initial
# commit) rather than filtering.
#
# NOT removed (checked and fine): external-sources/aFirstCourseLinearAlgebra
# (Lyryx, open license), CourseNotes-*.pdf (author's own builds),
# NON-DISTRIBUTABLE/ (gitignored, never tracked).
#
# READ BEFORE RUNNING:
#   * This rewrites every commit SHA. All collaborators must re-clone.
#     Open PRs/branches based on old SHAs will need rebasing.
#   * Run on a FRESH CLONE, not your working copy.
#   * After force-pushing, old commits may survive on GitHub's servers
#     (cached views, PR refs, forks). To fully scrub GitHub:
#       - contact GitHub Support to run garbage collection / invalidate
#         cached views of the old commits, and
#       - ask owners of any forks to delete or rebase them.
#   * Install the tool first:  pip install git-filter-repo
#     (or brew install git-filter-repo)
#
# USAGE:
#   git clone https://github.com/open-optimization/open-optimization-or-book.git fresh-clone
#   cd fresh-clone
#   bash ../open-optimization-or-book/scripts/purge-history.sh
#   # inspect the result (git log --stat, sizes, spot-checks), then:
#   git remote add origin https://github.com/open-optimization/open-optimization-or-book.git
#   git push --force --all origin
#   git push --force --tags origin
# ============================================================================
set -euo pipefail

if command -v git-filter-repo >/dev/null 2>&1; then
  FILTER_REPO="git filter-repo"
elif python3 -c "import git_filter_repo" 2>/dev/null; then
  FILTER_REPO="python3 -m git_filter_repo"
else
  echo "ERROR: git-filter-repo not found. Install with: pip install git-filter-repo" >&2
  exit 1
fi

$FILTER_REPO \
  --invert-paths \
  --path 'ClassNotes/' \
  --path 'Intro-Math-Programming/baseText/Christopher_Griffin_Penn_State_University/' \
  --path 'Intro-Math-Programming/baseText/external-sources/Christopher_Griffin_Penn_State_University/' \
  --path 'Intro-Math-Programming/baseText/optimization/ucdavis-advanced-linear-programming.pdf' \
  --path 'Intro-Math-Programming/baseText/optimization/ucdavis-mathematical-programming-notes.pdf' \
  --path 'Intro-Math-Programming/baseText/optimization/ucdavis-optimization-notes.pdf' \
  --path 'Intro-Math-Programming/baseText/optimization/ucdavis-polynomial-optimization.pdf' \
  --path 'Intro-Math-Programming/baseText/optimization/ucdavis-semidefinite-programming-SOS.pdf' \
  --path 'Intro-Math-Programming/baseText/optimization/ucdavis-turing-machines.pdf' \
  --path 'Intro-Math-Programming/baseText/optimization/duality-borrowed.tex' \
  --path 'Intro-Math-Programming/baseText/borrowed-duality.tex' \
  --path 'Intro-Math-Programming/baseText/archive/orphaned-content/borrowed-duality.tex' \
  --path 'Intro-Math-Programming/baseText/book/PLAGIARISM-SWEEP-REPORT.md' \
  --path 'Intro-Math-Programming/baseText/book/fair-use-fix-log.md' \
  --path 'Intro-Math-Programming/baseText/book/section-6.3-fair-use-review.md' \
  --path 'book1-license-audit.docx'

echo
echo "Done. Verify with:"
echo "  git log --all --oneline | head"
echo "  git log --all --diff-filter=A --name-only --format='' | grep -i 'griffin\|ucdavis\|borrowed-duality'   # should print nothing"
echo "  git count-objects -vH"
echo "Then force-push (see header comments)."
