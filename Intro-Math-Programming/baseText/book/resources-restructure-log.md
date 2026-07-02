# Front-Matter Restructure Log — 2026-05-13

Goal: Move "Additional Resources" content out of Chapter 1 to a back-matter
appendix, and keep Notation as an unnumbered front-matter chapter, before
Part I.

## Inventory (what was in each of the four files)

### `part1-linear-programming/ch01-introduction/introduction-book.tex`
- Unnumbered Introduction chapter: `\chapter*{Introduction}` with sections
  "Letter to instructors", "Letter to students", "How to use this book",
  "Outline of this book". No additional resources, no notation. **No change.**

### `part1-linear-programming/ch01-introduction/resources_and_notation.tex`
- Despite the filename, this file contained **only "Additional Resources"** —
  no notation content. Single `\chapter{Additional Resources}` followed by
  four `\paragraph` groups of `\href` links (Optimization & LP, Discrete Math,
  Math Background, Programming) and a `\noindent` paragraph cross-referencing
  Appendix~\ref{app:software}.
- No `\label`s defined. Safe to relocate.

### `part1-linear-programming/ch01-introduction/introductionNotation.tex`
- A `\section*{Notation}` (note: section, not chapter) — older notation list
  using bullet items with $\one$, $\forall$, $\exists$, $\Z$, $\Q$, $\R$,
  $\setminus$, $\cup$, $\cap$, vector spaces, dot product, sample sentence.
- No `\label`s. Already superseded by a cleaner `frontmatter/notation.tex`
  that exists on disk (uses `\chapter*{Notation}` with table-based layout
  and `\addcontentsline{toc}{chapter}{Notation}`).

### `part1-linear-programming/ch01-introduction/mathematicalProgramming.tex`
- `\chapter{Mathematical Programming}` — warm-up scenario, Why OR, What is
  MP, Applications, Types of optimization problems, LP/MILP/NLP/MINLP,
  Optimization Under Uncertainty.
- Contains 12 `\label`s (general:LP, eq:LP, eq:standardLP, eq:BIP, eq:ILP,
  eq:MILP, eq:NLP, eq:convex-programming, eq:BIP-NLP, eq:minlp,
  eq:convex-minlp, eq:nonconvex-minlp). **No change** — stays in Chapter 1.

## Split decisions

| Content | From | To | Style |
|---|---|---|---|
| Additional Resources (link lists) | `ch01-introduction/resources_and_notation.tex` | `backmatter/further-reading-and-resources.tex` (NEW) | `\chapter{Further Reading and Resources}` (numbered as appendix because placed after `\appendix`) |
| Notation (front-matter) | already at `frontmatter/notation.tex` | unchanged | `\chapter*{Notation}` (unnumbered) plus `\addcontentsline` so it shows in TOC |
| Old in-chapter notation (`introductionNotation.tex`) | was an `\input` in Chapter 1 area | no longer `\input`-ed; file kept on disk with a provenance comment | n/a |
| Mathematical Programming chapter | unchanged | unchanged | numbered chapter |
| Introduction (letter to instructors/students) | unchanged | unchanged | `\chapter*{Introduction}` |

The original `resources_and_notation.tex` file was emptied (kept as a stub
with an explanatory comment) so any stale `\input` in other entry points
will not fail.

## Files created
- `/Users/roberthildebrand/Documents/GitHub/open-optimization-or-book/Intro-Math-Programming/baseText/book/backmatter/further-reading-and-resources.tex`

## Files modified
- `/Users/roberthildebrand/Documents/GitHub/open-optimization-or-book/Intro-Math-Programming/baseText/book/book1-main.tex`
- `/Users/roberthildebrand/Documents/GitHub/open-optimization-or-book/Intro-Math-Programming/baseText/book/part1-linear-programming/ch01-introduction/resources_and_notation.tex` (emptied to stub with provenance comment)
- `/Users/roberthildebrand/Documents/GitHub/open-optimization-or-book/Intro-Math-Programming/baseText/book/part1-linear-programming/ch01-introduction/introductionNotation.tex` (added "no longer included" comment; content retained)

## Files explicitly NOT modified
- `book1-main-simplified.tex` and `main.tex` still reference the old paths.
  They are out of scope for this restructure; touching them risks breaking
  other build flows. The stub at the old path keeps both compiling.
- All Book 2 files, NON-DISTRIBUTABLE/, external-sources/.

## `book1-main.tex` changes (before/after of affected lines)

### Before (lines 97-116):
```latex
% Table of Contents
{
  \hypersetup{hidelinks}
  \phantomsection
  \addcontentsline{toc}{chapter}{Contents}
  \setlength{\parskip}{3.5pt}
  \addtocontents{toc}{\protect\hypertarget{toc}{}}
  \tableofcontents
  \cleardoublepage
}
\cleardoublepage
\mainmatter

%=============================================================================
% INTRODUCTION
%=============================================================================
\input{part1-linear-programming/ch01-introduction/introduction-book.tex}
\input{part1-linear-programming/ch01-introduction/resources_and_notation.tex}
\input{part1-linear-programming/ch01-introduction/introductionNotation.tex}
\input{part1-linear-programming/ch01-introduction/mathematicalProgramming.tex}
```

### After:
```latex
% Table of Contents
{
  \hypersetup{hidelinks}
  \phantomsection
  \addcontentsline{toc}{chapter}{Contents}
  \setlength{\parskip}{3.5pt}
  \addtocontents{toc}{\protect\hypertarget{toc}{}}
  \tableofcontents
  \cleardoublepage
}
\cleardoublepage

% Notation: unnumbered front-matter chapter (appears before Part I)
\input{frontmatter/notation.tex}
\cleardoublepage

\mainmatter

%=============================================================================
% INTRODUCTION
%=============================================================================
\input{part1-linear-programming/ch01-introduction/introduction-book.tex}
% Note: "Additional Resources" chapter (resources_and_notation.tex) was moved
% on 2026-05-13 to backmatter/further-reading-and-resources.tex (loaded after
% the appendices, before the index). The notation chapter is now in front matter
% via \input{frontmatter/notation.tex} above (introductionNotation.tex remains
% on disk but is no longer included here).
\input{part1-linear-programming/ch01-introduction/mathematicalProgramming.tex}

% Option B (alternative): place "Further Reading and Resources" at end of
% Chapter 2 instead of as a back-matter appendix. To use, uncomment the next
% line AND comment out the corresponding \input{backmatter/...} line further
% down in this file (after \appendix).
% \input{backmatter/further-reading-and-resources.tex}
```

### Back-matter block, before:
```latex
%=============================================================================
% BACK MATTER
% Appendix: Optimization Software Resources
\input{appendices/software-resources.tex}

%=============================================================================
\section{Contributors}
```

### Back-matter block, after:
```latex
%=============================================================================
% BACK MATTER
% Appendix: Optimization Software Resources
\input{appendices/software-resources.tex}

% Appendix: Further Reading and Resources
% Moved from Chapter 1 on 2026-05-13. To relocate to end of Chapter 2 instead,
% comment this line out and uncomment the matching \input line near the top of
% this file (search for "Option B").
\input{backmatter/further-reading-and-resources.tex}

%=============================================================================
\section{Contributors}
```

## Switching-point note

To move "Further Reading and Resources" from a back-matter appendix to the
end of Chapter 2 (after `modeling-linear-programming.tex` etc.), the user
swaps two lines in `book1-main.tex`:

1. Comment out the active `\input{backmatter/further-reading-and-resources.tex}`
   line in the BACK MATTER block (after `\appendix`).
2. Uncomment the prepared `% \input{backmatter/further-reading-and-resources.tex}`
   line marked "Option B" near the top of the file.

Or move the uncommented `\input` line to whatever exact position inside Part I
the user prefers (e.g., directly after `Section2.tex`). Because the file uses
`\chapter{...}`, dropping it inside Part I will render it as a numbered chapter
in Part I rather than an appendix-numbered chapter. To keep it unnumbered, the
user can change `\chapter` to `\chapter*` inside the file and add a manual
`\addcontentsline{toc}{chapter}{...}` line.

## Reference-integrity check

- Searched for `\label{` in the four Chapter 1 source files. Labels exist only
  in `mathematicalProgramming.tex` (12 labels in `general:` and `eq:` form),
  and that file is unchanged and still `\input`-ed in the same place. No
  labels live in the relocated content.
- Searched the codebase for `\ref`/`\cref`/`\hyperref`/`\autoref` targets that
  could point at content inside the moved file. The "Additional Resources"
  chapter contained one outgoing reference (`Appendix~\ref{app:software}`),
  which is preserved verbatim in the new file; `\label{app:software}` is
  defined in `appendices/software-resources.tex` and is unaffected.
- Notation file was not the target of any `\ref`/`\cref` calls (it had no
  labels), and the replacement `frontmatter/notation.tex` is also label-free.

**Result: no broken cross-references.**

## TOC behaviour

- `\chapter*{Notation}` in `frontmatter/notation.tex` already includes
  `\addcontentsline{toc}{chapter}{Notation}`, so Notation appears in the TOC
  as an unnumbered chapter at the front, just after Contents and before
  Part I.
- `\chapter{Further Reading and Resources}` in the new back-matter file is
  placed after `\appendix` in `book1-main.tex`, so it is numbered as an
  appendix-style chapter (letter rather than number) and listed alongside
  other appendices in the TOC.
