#!/usr/bin/env bash
# Recreate the local build symlinks in Intro-Math-Programming/baseText/book/.
#
# These directory symlinks let the book compile from book/ with relative
# paths like optimization/... . They are NOT tracked in git because GitHub
# Pages' artifact upload fails hard on symlinks. Run this once after
# cloning (CI runs it automatically).
set -euo pipefail
cd "$(dirname "$0")/../Intro-Math-Programming/baseText/book"

ln -sfn ../optimization optimization
ln -sfn ../Figures Figures
ln -sfn ../graph-theory-graphics graph-theory-graphics
ln -sfn ../external-sources/applied-finite-mathematics applied-finite-mathematics
ln -sfn ../external-sources/foundationsAppliedMathematicsLabs foundationsAppliedMathematicsLabs

echo "build symlinks created in $(pwd)"
