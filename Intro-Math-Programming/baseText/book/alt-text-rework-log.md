# Alt-text Rework Log

**Date:** 2026-05-14
**Scope:** Single bibkey flagged NEEDS REWORK by the alt-text quality auditor
(Phase 1.A, `book/alt-text-audit-report.md`).

## Entry

- **Bibkey:** `tikz-graphtheory-dor1-49-68959709`
- **Source:** `part2-discrete-algorithms/ch10-graph-theory/graphtheory-dor1.tex`, line 2096
  (the `\end{tabular}` of a three-column tabular spanning lines 2060–2096;
  the entry describes the middle `\begin{tikzpicture}` block at lines 2072–2082).

## Before alt-text

> Six-vertex graph with several internal edges yielding several vertices of
> degree 3 or 4; presented as a candidate for an Euler circuit exercise.

## After alt-text

> Middle of three side-by-side graphs in a tabular for an Euler-circuit
> exercise: six vertices at (0,0), (2,0), (4,0), (1,1), (3,1), (2,2);
> edges form a fan from (2,0) plus a triangle (1,1)-(3,1)-(2,2). All
> degrees are even, so an Euler circuit exists.

## Rationale

Auditor flagged the original as too vague about which of three side-by-side
graphs it described and about the actual topology. The new alt-text names
the position (middle of three), pins the six vertex coordinates, identifies
the two distinguishing substructures (fan from (2,0); triangle on the upper
three vertices), and states the relevant pedagogical conclusion (all-even
degrees -> Euler circuit exists), which is what the surrounding exercise
("Does each of these graphs have an Euler circuit?") is asking the reader
to determine.
