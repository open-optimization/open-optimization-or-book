# Chapter 5 Completion Log (Book 1)

Date: 2026-05-14

## 1. Inventory

**Chapter 5 of Book 1** is titled "Modeling with Compact Notation" and is
sourced from two `.tex` files that share a single `\chapter{...}` header:

- `/Users/roberthildebrand/Documents/GitHub/open-optimization-or-book/Intro-Math-Programming/baseText/book/part1-linear-programming/ch02-modeling/modeling-sums.tex`
  (contains the `\chapter{Modeling with Compact Notation}` header on line 1
  and material through Section 5.3 "Modeling Tricks").
- `/Users/roberthildebrand/Documents/GitHub/open-optimization-or-book/Intro-Math-Programming/baseText/book/part1-linear-programming/ch02-modeling/modeling-sums-continued.tex`
  (contains Sections 5.4--5.7).

The chapter ordering comes from `book1-main.tex` lines 130--131. The
preceding `\chapter{}` calls are: ch1 = Additional Resources, ch2 =
Mathematical Programming, ch3 = Modeling: Linear Programming, ch4 =
Software - Excel, so the two files above produce Chapter 5.

### Sections present (from `book1-main.toc`)

| Number | Title | File |
|---|---|---|
| 5.0.1 (orphan) | Notes on Sets, Indices, and Summation | modeling-sums.tex |
| 5.1 | Production Planning Models | modeling-sums.tex |
| 5.2 | Assignment Problem | modeling-sums.tex |
| 5.3 | Modeling Tricks | modeling-sums.tex |
| 5.3.1 | Maximizing a minimum | modeling-sums.tex |
| 5.4 | Network Flow Models and Applications | modeling-sums-continued.tex |
| 5.4.1 | Graphs | modeling-sums-continued.tex |
| 5.4.2 | Example: Minimum-Cost Flow in a Transportation Network | modeling-sums-continued.tex |
| 5.4.3 | Minimum Cost Network Flow Problem | modeling-sums-continued.tex |
| 5.4.4 | (Unstructured) Minimum Cost Network Flow Problem | modeling-sums-continued.tex |
| 5.4.5 | Maximum flow | modeling-sums-continued.tex |
| 5.4.6 | Multi-Commodity Minimum Cost Network Flow with Integrality Constraints | modeling-sums-continued.tex |
| 5.4.7 | Example - Multicommodity Flow (renamed: "Multicommodity Flow: Source--Sink Formulation") | modeling-sums-continued.tex |
| 5.5 | Transportation Problem | modeling-sums-continued.tex |
| 5.5.1 | Solving the Minimum-Cost Network Flow Problem | modeling-sums-continued.tex |
| 5.6 | "Something Else" (renamed to "Multi-Period Capital Investment") | modeling-sums-continued.tex |
| 5.7 | Exercises | modeling-sums-continued.tex |

### Example numbering (the `exo` counter)

All instances of `examplewithcode`, `examplewithallcode`, `general`,
`optexample`, `examplewithoutcode`, and `ex` share the `exo` counter,
which is reset per chapter and prints as `\thechapter.\arabic{exo}`.
Counting them in order through Chapter 5:

| # | Example | File:line |
|---|---|---|
| 5.1 | Production Planning with 10 Periods | modeling-sums.tex:173 |
| 5.2 | Production Planning with Overtime (10 days) | modeling-sums.tex:265 |
| 5.3 | `general{Assignment Problem}` | modeling-sums.tex:455 |
| 5.4 | Machine Assignment | modeling-sums.tex:460 |
| 5.5 | School Bus Routing Problem | modeling-sums.tex:504 |
| 5.6 | Hiring for tasks | modeling-sums.tex:548 |
| 5.7 | Min-cost transportation example | modeling-sums-continued.tex:76 |
| 5.8 | Airline Transfer Network | modeling-sums-continued.tex:427 |
| **5.9** | **Multi-commodity network flow** | **modeling-sums-continued.tex:716** |
| 5.10 | Multi-Period Capital Investment Problem | modeling-sums-continued.tex:885 |

(The basic `\begin{example}{...}` environments at lines 488 and 816 of
modeling-sums.tex are a separate `[chapter]` counter and produce their
own "Example 5.X" sequence; they do not participate in the `exo` count.)

## 2. Diagnosis

### Issue A: Example 5.9 (Multi-commodity network flow) -- modeling-sums-continued.tex line 716

The example was almost entirely commented out:

- The `\begin{verbatim} ... \end{verbatim}` block contained Python sample
  data, but every interior line was prefixed with `%`, so the verbatim
  block actually printed `%# Sample data ...` rather than usable code.
  Worse, putting `%` inside `verbatim` does *not* comment lines out; it
  prints them as-is. So the example displayed Python that looked like
  it had been disabled.
- The signature of `\begin{examplewithcode}{title}{codelink}` was
  passing a raw URL as `#2` rather than an `\href{url}{label}`, which
  produces an unstyled raw URL where every other "Example with code"
  shows a clickable "Gurobipy" link.
- No introductory prose explained what the example shows; the figures
  appeared with no caption-level discussion.
- No `\label{...}` was attached, so this important example could not be
  referenced from later chapters.

### Issue B: Section 5.4.7 "Example - Multicommodity Flow" -- line 734

This subsection was Wikipedia-derived material that had been pasted in
with line-by-line `%` comments interleaved through the prose. The
visible output read approximately:

> [URL]
> network flow problem with multiple commodities
> Problem Definition
> K_1,K_2,...,K_k, defined by K_i=(s_i,t_i,d_i), where
> s_i and t_i is the source and sink of
> f_i(u,v) defines the fraction of flow i along edge ...

i.e. every other sentence was commented out, leaving incoherent
fragments. The author's note ("an example or something") accurately
flags this: the title says "Example" but it is structurally a
`\subsection` containing the secondary source--sink formulation of the
multi-commodity flow problem, sitting immediately after the
primary node-demand formulation in Section 5.4.6.

The right fix is to treat 5.4.7 as a *subsection* presenting an
alternative formulation (the "source--sink" or "demand-routing"
formulation), not as a worked numerical example. The Wikipedia
attribution stays in place via `\url{}`.

Additional bugs in the same subsection:
- `\href{flow_network}{network flow}` -- broken `\href` whose first
  argument is not a URL.
- Same pattern at `\href{minimum_cost_flow_problem}{...}` etc.
- Trailing block of `%\hypertarget{...}` Wikipedia anchors that produce
  no output but clutter the source.

### Issue C: Section 5.4.6 (Multi-Commodity ... with Integrality Constraints) -- line 669

The introductory paragraphs were commented out (lines 671--675), and
inside the model (lines 699--714) the flow-conservation constraint and
the integrality constraint were both commented out, as were the bullet
points that describe what each constraint family does. As written, the
model contained only the objective and the capacity constraint, with a
malformed left-hand side that subtracted incoming flow from outgoing
flow but then printed `\leq u_{ij}` (which mixed capacity and flow
balance into one expression).

### Issue D: Section 5.5 "Transportation Problem" -- line 818

Same disease as 5.4.6:
- The opening paragraph and "Let I, J ..." description were commented
  out, leaving only two `\href` lines floating in the document.
- The model omitted both the demand-equality constraint and the
  non-negativity constraint (commented out at lines 848-849 originally).
- The closing prose explanation was commented out.

### Issue E: Section 5.5.0.1 "Explanation" -- line 859

This was an empty `\subsubsection{Explanation}` placed *directly under*
`\section*{Concluding Comments}` (a starred section), which in turn
generated the bizarre TOC entry `5.5.0.1`. The subsubsection had no
content and no point.

### Issue F: Section 5.6 "Something Else" -- line 884

- The section title was a placeholder ("Something Else").
- The `examplewithallcode{Multi-Period Capital Investment Problem}`
  contained no visible content (the entire problem statement was
  commented out).
- The associated `table` had no header row and no data rows -- every
  line in the tabular was commented out, producing a blank framed
  table with a caption.
- The associated `solution` environment had every constraint commented
  out -- only the objective and the `\underline{...}` headers showed.

### Issue G: Subsection 5.0.1 (orphan numbering)

`\subsection{Notes on Sets, Indices, and Summation}` (line 43 of
modeling-sums.tex) appeared under `\section*{A Brief Review of
Summation Notation ...}`, a *starred* section. Because the parent had
no number, the subsection got numbered as 5.0.1 -- a strange artifact.

### Issue H: Duplicate labels across chapters

`\label{eq:objective}` was used both at modeling-sums.tex:433 (Chapter 5)
and at integerProgrammingFormulations-LP-notes.tex:136 (Chapter 11).
Same generic name, two definitions -> "multiply defined label" warning
at compile time, and any `\eqref{eq:objective}` could resolve to either.

The four generic labels in the assignment-problem align block
(`eq:objective`, `eq:agent_constraint`, `eq:task_constraint`,
`eq:binary_constraint`) were all at risk; only `eq:objective` was
actually duplicated today, but all four should be namespaced for safety.

## 3. Edits applied

### Edit 1 -- modeling-sums.tex: change orphan subsection to starred section
Before:
```
\subsection{Notes on Sets, Indices, and Summation}
```
After:
```
\section*{Notes on Sets, Indices, and Summation}
```
Effect: removes the 5.0.1 ghost number from the TOC.

### Edit 2 -- modeling-sums.tex: namespace the assignment-problem equation labels
Renamed inside the `\begin{align} ... \end{align}` block at line 433ff
and the corresponding `\eqref` calls in the "Explanation" itemize:
- `eq:objective` -> `eq:assignment_objective`
- `eq:agent_constraint` -> `eq:assignment_agent_constraint`
- `eq:task_constraint` -> `eq:assignment_task_constraint`
- `eq:binary_constraint` -> `eq:assignment_binary_constraint`

Effect: eliminates the duplicate-label collision with Chapter 11.

### Edit 3 -- modeling-sums-continued.tex: complete Section 5.4.6
- Uncommented the three introductory paragraphs.
- Added `\label{sec:multicommodity-flow}`.
- Replaced the malformed model with a clean three-constraint
  formulation: capacity (summed over commodities), flow conservation
  (per commodity), and integrality (per arc, per commodity).
- Restored the bullet list under "Constraints:" describing capacity,
  flow conservation, and integrality.

### Edit 4 -- modeling-sums-continued.tex: complete Example 5.9
- Rewrote `\begin{examplewithcode}{Multi-commodity network flow}{...}`
  to wrap the URL in `\href{...}{Gurobipy}` so the link styling matches
  every other example in the chapter.
- Added `\label{ex:multicommodity-network-flow}`.
- Removed the in-verbatim `%` prefixes so the Python sample data
  prints as actual Python.
- Reflowed the verbatim block to fit within reasonable line widths.
- Added a one-sentence introduction explaining the network and a
  bridging sentence introducing the two figures.

### Edit 5 -- modeling-sums-continued.tex: rebuild Section 5.4.7
- Renamed the subsection from "Example - Multicommodity Flow" to
  "Multicommodity Flow: Source--Sink Formulation" (so the title now
  matches what it actually is: an alternative formulation, not a
  worked example).
- Added `\label{sec:multicommodity-source-sink}`.
- Removed all interleaved `%` line-comments inside the prose so the
  paragraphs read as continuous English.
- Restored the four constraint blocks (link capacity, flow
  conservation on transit nodes, flow conservation at source, flow
  conservation at destination) with full descriptive prose.
- Added a "Corresponding optimization problems" subparagraph that
  enumerates load balancing, minimum cost MCF, and maximum MCF.
- Added a "Relation to other problems" subparagraph that cross-
  references Section 5.4.3 (Minimum Cost Network Flow Problem) and
  notes the circulation-problem generalization.
- Removed the dead Wikipedia anchor block (`\hypertarget` lines).
- Removed the broken `\href{flow_network}{...}`,
  `\href{minimum_cost_flow_problem}{...}`,
  `\href{Routing_and_wavelength_assignment}{...}`, etc.
- Added a TODO comment for the author to optionally append a worked
  numerical instance.

### Edit 6 -- modeling-sums-continued.tex: add label to Section 5.4.3
Added `\label{sec:min-cost-network-flow}` so the cross-reference from
the new 5.4.7 prose ("Section X (single-commodity)") has a target.

### Edit 7 -- modeling-sums-continued.tex: complete Section 5.5 (Transportation)
- Uncommented the intro paragraph, the parameter/variable description,
  and the closing explanation.
- Restored the demand-equality constraint and the non-negativity
  constraint in the model.
- Changed the supply constraint from equality to `<=` (more standard
  for the transportation problem, and consistent with the surrounding
  language about "supply available").
- Restructured the two `\href` URLs into a proper "Additional
  resources" itemize.
- Added `\label{sec:transportation-problem}`.

### Edit 8 -- modeling-sums-continued.tex: remove the empty 5.5.0.1 and demote the orphan subsection
Deleted the empty `\subsubsection{Explanation}` and the surrounding
stray comment lines, so the structure under "Concluding Comments"
goes directly to "Solving the Minimum-Cost Network Flow Problem".
Also demoted `\subsection{Solving the Minimum-Cost Network Flow Problem}`
to `\subsection*{...}` because it lives under a starred parent
(`\section*{Concluding Comments}`) and was previously generating the
spurious TOC entry 5.5.1 (a subsection of "Transportation Problem"
when it should have been under "Concluding Comments").

### Edit 9 -- modeling-sums-continued.tex: fix `\end{itemize>` typo
A literal `\end{itemize>` (with `>` instead of `}`) was sitting in the
"Solving the Minimum-Cost Network Flow Problem" subsection. Fixed to
`\end{itemize}` and removed the four orphan `%` lines that followed.

### Edit 10 -- modeling-sums-continued.tex: rename "Something Else" -> "Multi-Period Capital Investment" and restore the example
- Renamed `\section{Something Else}` to
  `\section{Multi-Period Capital Investment}`.
- Added `\label{sec:multi-period-capital-investment}` and
  `\label{ex:multi-period-capital-investment}`.
- Uncommented the problem statement inside the `examplewithallcode`.
- Restored the table header row and all twelve data rows
  (12 investments A--L across 4 periods).
- Restored the decision-variable definition and parameter definitions
  inside the `solution` environment.
- Restored the four budget constraints and the binary-variable
  constraint with the actual coefficients.

## 4. TODO comments left for the author

Two `% TODO(author): ...` comments were inserted, both visible in the
source but invisible in the rendered PDF:

1. **modeling-sums-continued.tex (after Section 5.4.7)** -- suggests
   adding a small worked numerical instance for the source--sink
   formulation, to parallel the other examples in the chapter.
2. **modeling-sums-continued.tex (inside the Section 5.6 solution
   environment)** -- the binary-variable formulation I restored may
   not be what the author intended; flags this for the author to
   decide between 0--1 selection, fractional investment levels, or
   continuous-with-cap.

No content was fabricated for these gaps; both are explicitly marked
for the author.

## 5. Label / reference verification

### Labels defined inside Chapter 5

In modeling-sums.tex (after edits):
- `eq:assignment_objective`
- `eq:assignment_agent_constraint`
- `eq:assignment_task_constraint`
- `eq:assignment_binary_constraint`

In modeling-sums-continued.tex (after edits):
- `eq:example_objective`, `eq:supply1`, `eq:supply2`, `eq:demand1`,
  `eq:demand2`, `eq:capacity_constraint_example`
  (in the transportation example, lines 123--129)
- `sec:min-cost-network-flow` (Section 5.4.3, new)
- `tab:arc_costs`, `tab:net_flow` (existing, in Section 5.4.4)
- `sec:multicommodity-flow` (Section 5.4.6, new)
- `ex:multicommodity-network-flow` (Example 5.9, new)
- `sec:multicommodity-source-sink` (Section 5.4.7, new)
- `sec:transportation-problem` (Section 5.5, new)
- `sec:multi-period-capital-investment` (Section 5.6, new)
- `ex:multi-period-capital-investment` (Example 5.10, new)
- `tab:multi_period_investments` (existing)
- `fig:multi-network-flow-data.png`, `fig:multi-network-flow-solution.png`
  (auto-generated by `\includefigurestatic`, untouched)

### References inside Chapter 5

- `\eqref{eq:assignment_objective}`, `\eqref{eq:assignment_agent_constraint}`,
  `\eqref{eq:assignment_task_constraint}`, `\eqref{eq:assignment_binary_constraint}`
  in modeling-sums.tex -- all four resolve to local labels above. OK.
- `\ref{example:hiring-for-tasks}` in modeling-sums.tex line 549 --
  resolves to a label in modeling-linear-programming.tex (Chapter 3).
  Pre-existing; not touched. OK.
- `Section~\ref{sec:min-cost-network-flow}` in modeling-sums-continued.tex
  (in new 5.4.7 prose) -- resolves to the new label at line 166. OK.

### Duplicate labels within the chapter

Checked: no `\label{X}` appears twice in modeling-sums.tex or
modeling-sums-continued.tex after edits.

### Duplicate labels across the book

Pre-edit, the chapter had four labels (`eq:objective`,
`eq:agent_constraint`, `eq:task_constraint`, `eq:binary_constraint`)
that collided with generic labels elsewhere in the project. After
renaming to the `eq:assignment_*` prefix, none of the new labels
collide with any other `\label{...}` in
`/Users/roberthildebrand/Documents/GitHub/open-optimization-or-book/Intro-Math-Programming/baseText/book`.

### Orphan label targets

None. Every `\label` added has at least the cross-reference functionality
of being addressable from other chapters; the new `\ref` introduced
points to a defined target.
