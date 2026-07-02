# Feedback and TODO List for Book Revision

This document collects feedback from reviewers and notes for future improvements.

---

## Feedback from Rohit

### Content Additions Needed

1. **More examples outside of ISE** - Especially in Section/Part 2
   - Modern applications: YouTube (max user engagement), Netflix (recommendation systems), ChatGPT
   - Make content more accessible to students from different backgrounds

2. **Dynamic Programming (Section 2.3)**
   - Clarify: Is this modeling or algorithm?
   - Consider reframing as "Sequential Decision Making"
   - Resource to add: https://didp.ai/ (dynamic programming module)
   - Teaching example: Ocean plastic DP paper https://pubsonline.informs.org/doi/epdf/10.1287/opre.2023.0515

3. **Chapter 5** - More exercises needed
   - Hard material - abstraction is difficult for students
   - Consider adding YouTube video links for supplementary explanation

4. **Chapter 6** - Better explanation of level curves needed

5. **Integer Programming - Big M**
   - Students find Big M confusing
   - Add example: Camera placement / modeling non-overlapping constraints (Manish's research)

6. **Chapter 15** - Fewer examples compared to earlier parts
   - **Cutting planes**: Combine current book content + Fischetti for cutting planes and branch-and-cut
   - **Column generation**: Note that number of patterns could be very large

7. **Vehicle Routing** - Students very interested in this topic
   - Add heuristics: Clarkson-Wright, Sweep algorithms
   - Mention Timefold software

8. **Section 16.4** - Add guidance on:
   - How to interpret solver output
   - What to keep track of during solving
   - How to troubleshoot when solver doesn't work

9. **TSP content** - Get figures and exercises from Rohit

10. **Spell checking** - Do a thorough pass

---

## Random Notes - Resources to Add

### Solvers and Software

| Resource | Description | URL |
|----------|-------------|-----|
| Hexaly | Solver to mention | |
| Timefold | Vehicle routing software | |
| UpperInc | VRP software | https://www.upperinc.com/ |

### Python Packages for Optimization

- [ ] Create complete list of Python packages for optimization
- [ ] pyCombinatorial - Heuristics for TSP

### Code Repositories to Link

**TSP:**
- Concorde: https://github.com/matthelb/concorde
- pytsp: https://github.com/flyte/pytsp

**VRP:**
- VRPSolver: https://vrpsolver.math.u-bordeaux.fr/
- VRPSolverEasy (Inria): https://github.com/inria-UFF/VRPSolverEasy
- pyvrp: https://pypi.org/project/pyvrp/
- VRPSolverEasy (PyPI): https://pypi.org/project/VRPSolverEasy/

**Other:**
- psanse: https://github.com/psanse
- IFORS Newsletter (Dec 2024): https://ifors.org/newsletter/ifors-news-dec-2024.pdf

### Teaching Resources

- [ ] Tepper CMU optimizer highlights video: https://www.youtube.com/watch?v=ptmRa3wzKdY
- [ ] stockpyl (inventory): https://stockpyl.readthedocs.io/en/latest/
  - Video: https://www.youtube.com/watch?v=5MyLF-XLcdI

---

## OER Requirements from Anita (VTech Publishing)

### CRITICAL - Accessibility

1. **Alt-text for images** - MOST IMPORTANT
   - Follow standard guidance for writing alt-text
   - Every figure needs descriptive alt-text

2. **Create accessible formats**
   - ePub or HTML version needed
   - Explore tex4ht for ePub generation
   - Contact Sandeep Sangha for technical consultation on Pressbooks LaTeX import

### Content Organization

1. **Push homework questions into the book** - Currently separate?

2. **Working on Part 1 first** - Focus efforts here

### Legal/Attribution Requirements

1. **Fair use analysis**
   - Review assignment problem in Section 6.3
   - No verbatim copying
   - Snippets OK if summarizing/paraphrasing

2. **Source attribution**
   - Create list of all sources used
   - Include: what was used, under what license, URLs
   - Format: "Adapted from ... these sources..."

3. **AI usage disclosure**
   - Describe what AI was used for
   - Include transparency statement
   - Provide example types of prompts used
   - Note: "Didn't prompt to use this resource from chapter 4" (clarify?)

4. **Update contributions section** at end of book

5. **Copyright page** - Review and update

### Submission Requirements

1. **Peer review target: MID AUGUST**

2. **Submission checklist** - needs to go with final manuscript

3. **Signed agreement** - Required

4. **VTech Works** - Upload all source files

5. **Send sample chapter to Kindred** in all available formats

---

## Action Items Summary

### High Priority (Before Peer Review)

- [~] Alt-text for all figures (May 5, 2026 — every entry in `optimization/figures/figures-source/00_METADATA.bib` now has at least a placeholder; status: 21 GOOD, 55 caption-derived drafts, 63 context-derived drafts, 91 chapter-only stubs, 2 blank. Reports: `book/alt-text-status.md`, `book/alt-text-inventory.csv`, `book/alt-text-draft-log.md`. Remaining work: refine drafts and write hand-crafted descriptions for the 91 stubs. The 64 `\includegraphics` calls are NOT in the bib and need a separate alt-text pass.)
- [x] AI usage disclosure statement (May 5, 2026 — `book/frontmatter/ai-usage-disclosure.tex`, wired into `book1-main.tex` after sources-attribution; review / personalize as needed)
- [x] Source attribution list with licenses (May 5, 2026 — `book/frontmatter/sources-attribution.tex`, wired into `book1-main.tex` after the preface)
- [~] Spell check entire book (May 5, 2026 — automated pyspellchecker pass over 64 .tex files; 5,019 unique tokens, 796 suspects after LaTeX-aware stripping + OR/math whitelist, of which 632 are short rare tokens that look like plausible typos. Triage report: `book/spellcheck-suspects.md` (top 300 + likely-typo table); CSV: `book/spellcheck-suspects.csv`. Remaining work: scan the report, add domain terms to a `\.aspellrc` or whitelist, fix actual typos.)
- [ ] Review fair use for Section 6.3

### Medium Priority (Content Improvements)

- [ ] More examples in Part 2 (non-ISE applications)
- [ ] More exercises in Chapter 5
- [ ] Level curves explanation in Chapter 6
- [ ] Big M clarification with camera placement example
- [ ] More examples in Chapter 15
- [ ] Solver troubleshooting guidance in Section 16.4
- [ ] Vehicle routing content (Clarkson-Wright, Sweep)

### Lower Priority (Enhancements)

- [ ] Complete Python packages list
- [ ] Add links to best code repositories
- [ ] Add teaching resources and videos
- [ ] Dynamic programming module integration
- [ ] ePub/HTML generation exploration

---

## GitHub Links to Check

When code files are reorganized, these links may break:
- [ ] Colab notebook links in Python chapter
- [ ] GitHub repository links
- [ ] Any hardcoded paths to notebooks

---

## Notes for Later Discussion

1. **Dynamic Programming framing** - "Sequential Decision Making" might be clearer title?

2. **Book 1 vs Book 2 split** - How does this affect the OER submission? Submit both? Just Book 1 first?

3. **Pressbooks compatibility** - Need to test LaTeX import capabilities

4. **Peer review process** - Who are the reviewers? What format do they need?
