# Notation Standardization Proposal

## Executive Summary

This document proposes standardized notation for the textbook "Mathematical Programming and Operations Research." After reviewing all chapters, several inconsistencies were identified that could confuse readers. This proposal aims to establish clear, consistent conventions.

---

## Current Issues Identified

### 1. Vector Notation (HIGH PRIORITY)
**Problem:** Three different styles used interchangeably:
- Shorthand macros: `\x`, `\c`, `\b` (renders as **x**, **c**, **b**)
- Explicit bold: `\mathbf{x}`, `\mathbf{c}`
- Plain italic: `x`, `c`, `b`

**Examples of inconsistency (mathematicalProgramming.tex):**
```latex
Line 179: \max \quad & \c^\top \x       % shorthand
Line 215: \max \quad & \c^\top x        % mixed!
Line 251: \max \quad & c^\top x         % plain
```

### 2. Constraint Notation (MEDIUM PRIORITY)
**Problem:** Three formats used:
- `\st` macro (renders as " s.t. ")
- `\text{s.t.}`
- `\text{subject to}`

**Found in duality.tex:** All three formats appear in the same chapter.

### 3. Set Notation (LOW PRIORITY - mostly consistent)
**Problem:** Minor inconsistencies between `\R` shorthand and explicit `\mathbb{R}`.

**Currently defined (preamble-simplified.tex):**
- `\R` → **R** (blackboard bold)
- `\Z` → **Z** (blackboard bold)
- `\Q` → **Q** (blackboard bold)

### 4. Transpose Notation (CONSISTENT - no action needed)
Currently uses `^\top` consistently. The `\trp` macro exists but `^\top` is more common.

### 5. Optimization Problem Formatting (MEDIUM PRIORITY)
**Problem:** Inconsistent spacing after min/max:
- `\max \quad &`
- `\max\;`
- `\max\ `

---

## Proposed Standard Notation

### Vectors and Matrices

| Element | Notation | LaTeX | Rationale |
|---------|----------|-------|-----------|
| Decision variable vectors | Bold lowercase | `\x` or `\mathbf{x}` | Standard in optimization |
| Parameter vectors | Bold lowercase | `\c`, `\b`, `\a` | Distinguishes from scalars |
| Matrices | Plain uppercase italic | `A`, `B` | Standard convention |
| Scalars | Plain lowercase italic | `x_i`, `c_j` | Standard convention |
| Index sets | Calligraphic | `\mathcal{I}`, `\II` | Distinguishes from scalars |

**Recommendation:** Use shorthand macros (`\x`, `\c`, `\b`) consistently throughout. These are already defined in preamble-simplified.tex.

### Number Sets

| Set | Notation | LaTeX |
|-----|----------|-------|
| Real numbers | **R** | `\R` or `\mathbb{R}` |
| Integers | **Z** | `\Z` or `\mathbb{Z}` |
| Rationals | **Q** | `\Q` or `\mathbb{Q}` |
| Natural numbers | **N** | `\nn` or `\mathbb{N}` |
| Non-negative reals | **R**₊ | `\R_+` |
| Non-negative integers | **Z**₊ | `\Z_+` |

**Recommendation:** Use shorthand macros for consistency.

### Optimization Problems

**Standard format:**
```latex
\begin{equation}
\begin{split}
\max \quad & \c^\top \x \\
\st \quad & A\x \leq \b \\
& \x \geq \0
\end{split}
\end{equation}
```

| Element | Notation | LaTeX |
|---------|----------|-------|
| Maximize | max | `\max` |
| Minimize | min | `\min` |
| Subject to | s.t. | `\st` |
| Such that | : | `\tq` or `:` |
| Spacing after max/min | quad | `\max \quad &` |

**Recommendation:** Use `\st` macro consistently for "subject to."

### Constraint Types

| Constraint | Notation | LaTeX |
|------------|----------|-------|
| Less than or equal | ≤ | `\leq` |
| Greater than or equal | ≥ | `\geq` |
| Equality | = | `=` |
| Set membership | ∈ | `\in` |

### Transpose and Other Operations

| Operation | Notation | LaTeX |
|-----------|----------|-------|
| Transpose | ⊤ | `^\top` |
| Inverse | ⁻¹ | `^{-1}` |
| Gradient | ∇f | `\nabla f` |
| Dot product | **a**⊤**b** | `\a^\top \b` |

---

## Implementation Plan

### Phase 1: Preamble Verification (No changes needed)
The preamble-simplified.tex already defines all necessary macros correctly:
- Lines 753-767: Bold vector shortcuts
- Lines 784-789: Number set shortcuts
- Line 814: `\st` for "subject to"

### Phase 2: Chapter-by-Chapter Updates

#### High Priority (Part 1 - Linear Programming)
1. **Ch01 - Introduction/mathematicalProgramming.tex**
   - Standardize to `\x`, `\c`, `\b` throughout
   - Replace plain `x`, `c` with macros where vectors are intended

2. **Ch02 - Modeling chapters**
   - Already mostly consistent
   - Minor cleanup of mixed notation

3. **Ch08 - Duality/duality.tex**
   - Replace `\mathbf{x}` with `\x`
   - Replace `\text{s.t.}` and `\text{subject to}` with `\st`

#### Medium Priority (Part 3 - Integer Programming)
4. **Ch11 - IP Formulations**
   - Review for consistency with LP chapters

#### Lower Priority (Parts 2, 4)
5. **Graph theory chapters** - Different notation may be appropriate
6. **NLP chapters** - Check gradient/Hessian notation

### Phase 3: Add Notation Guide
Add a "Notation" section to the front matter listing all conventions:

```latex
\chapter*{Notation}
\addcontentsline{toc}{chapter}{Notation}

\section*{Sets}
\begin{tabular}{ll}
$\R$ & Real numbers \\
$\R^n$ & $n$-dimensional real vectors \\
$\R_+$ & Non-negative real numbers \\
$\Z$ & Integers \\
$\Z_+$ & Non-negative integers \\
\end{tabular}

\section*{Vectors and Matrices}
\begin{tabular}{ll}
$\x, \y, \z$ & Decision variable vectors (bold) \\
$\a, \b, \c$ & Parameter vectors (bold) \\
$A, B$ & Matrices (capital italic) \\
$x_i$ & $i$-th component of vector $\x$ \\
\end{tabular}

\section*{Optimization}
\begin{tabular}{ll}
$\max$, $\min$ & Maximize, minimize \\
s.t. & Subject to \\
$\leq$, $\geq$ & Inequality constraints \\
$^\top$ & Transpose \\
\end{tabular}
```

---

## Files Requiring Updates

Based on the analysis, these files have the most inconsistencies:

| File | Issues | Priority |
|------|--------|----------|
| mathematicalProgramming.tex | Mixed vector notation | HIGH |
| duality.tex | Mixed `\st`/`\text{s.t.}`, mixed vector notation | HIGH |
| complimentary-slackness.tex | Check constraint notation | MEDIUM |
| formalize-LP.tex | Review for consistency | MEDIUM |
| modeling-sums.tex | Mixed notation in examples | MEDIUM |

---

## Search-and-Replace Commands

To help with standardization, here are useful grep patterns:

```bash
# Find plain 'x' that should be \x (context needed)
grep -n "c\^\top x" *.tex

# Find explicit \mathbf that could use shortcuts
grep -n "\\mathbf{x}" *.tex

# Find \text{s.t.} that should be \st
grep -n "\\text{s\.t\.}" *.tex

# Find \text{subject to}
grep -n "\\text{subject to}" *.tex
```

---

## Questions for Author

1. **Scalar vs. Vector:** Should indexed scalars like $x_i$ remain plain, or use a different convention?

2. **Transpose:** Prefer `^\top` or introduce `\trp` macro universally?

3. **Constraint notation preference:**
   - `s.t.` (compact)
   - `subject to` (clear for beginners)
   - Both allowed in different contexts?

4. **Matrix notation:** Keep plain $A$ or introduce `\A` for consistency with vectors?

---

## Appendix: Current Macro Definitions

From preamble-simplified.tex (lines 750-830):

```latex
% Bold vectors
\def\0{\mathbf{0}}
\def\a{\mathbf{a}}
\renewcommand{\b}{\mathbf{b}}
\renewcommand{\c}{\mathbf{c}}
\def\x{\mathbf{x}}
\def\y{\mathbf{y}}
\def\z{\mathbf{z}}
% ... and more

% Number sets
\def\R{\mathbb{R}}
\def\Z{\mathbb{Z}}
\def\Q{\mathbb{Q}}

% Constraint
\def\st{\text{ s.t. }}

% Transpose
\newcommand{\trp}{^{\mathsf T}}
```

All necessary macros are already defined - the issue is inconsistent usage in content files.
