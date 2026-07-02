# Prompt for Claude Code — alt-text refinement run

Copy the block below and paste it into Claude Code at the repo root.
The agent will read the working plan, partition the work, spawn
parallel workers, merge their output back into the bib, and run a
compile check.

---

```
You are running an alt-text refinement project for Book 1 of an open-source
optimization textbook. Read these files in order, then execute the plan they
describe:

  1. Intro-Math-Programming/baseText/book/ALT-TEXT-AGENT-PLAN.md
  2. Intro-Math-Programming/baseText/book/alt-text-status.md
  3. Intro-Math-Programming/baseText/book/alt-text-inventory.csv
  4. Intro-Math-Programming/baseText/BOOK1-PEER-REVIEW-READINESS.md

The plan defines four roles — orchestrator, workers, merger, verifier — and
a coordination model that uses per-chapter JSON drafts to avoid conflicts on
the single bib file. You are the orchestrator.

Concrete steps for you to follow:

1. Read all four files above. Confirm to me what you understand about
   the partition strategy and the JSON output format before doing
   anything else.

2. Build the chapter partition from the inventory CSV. Group entries by
   the parent directory of the source file (e.g.
   "part1-linear-programming/ch02-modeling/" -> "ch02-modeling"). Cap each
   worker at ~30 figures and combine very small chapters.

3. Show me the partition (chapter key, file count, figure count per
   worker) and ask me to approve before spawning workers.

4. After approval, create the directory
   Intro-Math-Programming/baseText/book/alt-text-drafts/ and spawn one
   parallel Task agent per partition. Each worker:
     - Receives the chapter key, the list of bibkeys it owns, and the
       JSON output path.
     - Reads ALT-TEXT-AGENT-PLAN.md before doing anything.
     - For each bibkey: opens the source .tex file at the noted line,
       reads the surrounding TikZ source + caption + prose, and writes
       a 1-3 sentence alt-text per the style rules in Section 2 of the
       plan.
     - Writes a JSON file: { "<bibkey>": "<alt-text>" , ... }.
     - Reports a count of figures completed and any entries it marked
       [NEEDS_AUTHOR_REVIEW].

5. After all workers finish, spawn a merger agent. The merger:
     - Reads every JSON in alt-text-drafts/.
     - Updates only the abstract = {...} field for the listed bibkeys
       in 00_METADATA.bib, atomically per entry.
     - Preserves brace balance and other fields.
     - Updates book/alt-text-status.md with new counts.
     - Writes book/alt-text-merger-log.md.

6. After the merger finishes, spawn a verifier agent. The verifier
   runs `pdflatex -draftmode -interaction=nonstopmode -halt-on-error
   book1-main.tex` from Intro-Math-Programming/baseText/book/ and
   reports the result. It does NOT modify any files.

7. Report a final summary: how many entries refined, how many marked
   [NEEDS_AUTHOR_REVIEW], compile status, links to the merger log and
   updated status file. Do not commit or push — let me review first.

Constraints:
- Workers MUST NOT edit 00_METADATA.bib directly. Only the merger
  writes to it.
- Do not touch NON-DISTRIBUTABLE/, Griffin paths, or Book 2 files
  (see plan Section 6).
- Use the Task tool to spawn workers in parallel; in a single message
  spawn all chapter workers at once so they run concurrently.
- Each worker should be given the absolute path of
  ALT-TEXT-AGENT-PLAN.md and instructed to read it before doing
  anything else, so the conventions stay consistent.

Begin by reading the four context files and reporting your
understanding plus the proposed partition.
```

---

## Notes for Robert

- The plan file (`ALT-TEXT-AGENT-PLAN.md`) is the durable contract.
  Future sessions can re-run the same prompt or amend the plan.
- If you want a smaller test run first, ask Claude Code to "do just
  the smallest two chapters end-to-end so I can review the output
  quality before scaling up." The plan supports that — the
  orchestrator can spawn fewer workers.
- Cost note: ~91 PLACEHOLDER + 63 CONTEXT figures across ~10–15
  workers, each reading source code and writing alt-text, will use
  meaningful tokens. Expect a single full run to be 30–60 minutes of
  agent time. Smaller batches first is a good idea.
- After the run, before you commit, eyeball ~5 random entries from
  different chapters. If quality is good, commit the bib + drafts +
  status update in one batch and move on.
