# Case Study Proposals for Book 1

**Update (2026-07-10):** every candidate is now graded on the author's key
criterion: *does the published paper explicitly state the model* (variables,
constraints, objective, assumptions) at a clarity a student could read, the way
the Uruguayan housing paper does? Grades:

- **A = full model printed in the paper** (formulation you could teach from)
- **B = model precisely described; full algebra in a citable companion paper**
- **C = story and savings only; method not clearly revealed** (fails the test)

| Candidate | Grade | Notes |
|---|---|---|
| WFP Nutritious Supply Chain (IJOO 2021) | **A** | Technical journal; complete MILP with nutrition, flow, and modality constraints stated; assumptions discussed. Open access. |
| Denver fire stations (Oper. Res. 1977) | **A** | OR journal; explicit covering formulation. 1970s notation but simple. |
| ACC basketball (Nemhauser & Trick, Oper. Res. 1998) | **A** | Explicit phase-by-phase IP formulations. |
| Istanbul fire stations (Interfaces 2013) | A- | Covering/max-cover models shown; confirm notation depth when drafting. |
| Kellogg KPS (Interfaces 2001) | A- | Brown & Wood normally print the full LP; confirm the formulation appendix when drafting. |
| Harvest Hope Food Bank (Interfaces 2018) — NEW | A- | Real food bank, integer program for promotion targeting; Interfaces case with model. Small, human-scale story like the housing study. Ahire, S., Pekgun, P. (2018), Interfaces 48(4). Verify pages/DOI. |
| School Timetabling case (INFORMS Trans. on Education 2022) — NEW | **A** | ITE case articles are *designed* for this: real problem, explicit ILP, teaching notes. doi:10.1287/ited.2022.0276ca. ITE generally is the best hunting ground for more. |
| Traveling Umpire Problem (Interfaces 2012) | **B** | TUP defined formally in the Interfaces paper; full IP/CP formulations in Trick & Yildiz companion papers (cite both). |
| Dutch railway timetable (Interfaces 2009) | **B** | Narrative paper; PESP model algebra in companion papers by the same group. |
| Air New Zealand crews (Interfaces 2001) | B- | Set-partitioning described; moderate algebra. |
| L.L. Bean staffing (Interfaces 1993) | B- | Objective printed, but it is economic/queueing optimization, not LP/IP; wrong model class for Book 1. |
| NBC ad sales (Interfaces 2002) | **C** | Systems description; model not cleanly revealed. Dropped. |
| UPS ORION (Interfaces 2017) | **C** | The algorithm is proprietary and the paper does not reveal it. Keep ONLY as a motivation mention (as in the Ch. 1 value panel), not as a case study. Dropped. |

**Revised Tier 1 (all grade A/A-):** WFP, Kellogg, Denver+Istanbul fire
stations, Harvest Hope Food Bank, with the School Timetabling ITE case as a
ready-made classroom project. The Traveling Umpire stays as a Tier 2 pick with
its companion paper cited for the formulation.

---


## Tier 1 — best fits, recommend writing first

### 1. Kellogg's cereal empire runs on an LP (Ch. 4, production planning)
**Story:** For decades Kellogg planned production, inventory, and distribution
of cereals across plants and DCs with the "Kellogg Planning System," a
large-scale *multiperiod linear program* run weekly (operational) and monthly
(tactical). Credited with ~$4.5M/year savings in the operational version and
$35–40M projected from capacity consolidation.
**Why it fits:** it is literally the book's §4.1 production-planning model
(periods, inventory balance, capacity) at industrial scale. Students see their
homework model running a household brand.
**Model:** multiperiod LP with inventory balance; maps directly onto
`production_10period` examples.
✔ Brown, G., Keegan, J., Vigus, B., Wood, K. (2001). "The Kellogg Company
Optimizes Production, Inventory, and Distribution." *Interfaces* 31(6), 1–15.
doi:10.1287/inte.31.6.1.9646

### 2. Feeding 100 million people: the UN World Food Programme (Ch. 2 diet model; also fits Ch. 13 multi-objective)
**Story:** WFP's "Optimus" tool decides food baskets, sourcing, and routing for
humanitarian operations (Iraq, Yemen, ...). It is a MILP that marries the
classical *diet problem* (nutrition at minimum cost) with a supply-chain
network. Cut operational costs in Iraq 17% while meeting 98% of nutritional
targets; won the 2021 Edelman Award.
**Why it fits:** the diet problem is in Chapter 2; here it saves lives at
scale. Also a natural multi-objective story (cost vs. nutrition) for Ch. 13.
**Model:** diet LP + min-cost flow, combined in a MILP.
✔ Peters, K., Silva, S., Gonçalves, R., Kavelj, M., Fleuren, H., den Hertog,
D., Ergun, O., Freeman, M. (2021). "The Nutritious Supply Chain: Optimizing
Humanitarian Food Assistance." *INFORMS Journal on Optimization* 3(2), 200–226.
doi:10.1287/ijoo.2019.0047

### 3. Where should the fire stations go? Denver, 1977 (Ch. 15 set covering)
**Story:** The Denver Fire Department used a set-covering/location model to
decide fire company locations, one of the earliest municipal OR successes;
the analysis supported closing/relocating stations while maintaining response
standards. This is *the same model as the book's fire-station example* in the
set covering section, with a real city behind it. Pair it with the modern
Istanbul follow-up for a then-and-now angle.
**Model:** set covering / facility location IP.
✔ Plane, D.R., Hendrick, T.E. (1977). "Mathematical Programming and the
Location of Fire Companies for the Denver Fire Department." *Operations
Research* 25(4), 563–578.
✔ Aktaş, E., Özaydın, Ö., Bozkaya, B., Ülengin, F., Önsel, Ş. (2013).
"Optimizing Fire Station Locations for the Istanbul Metropolitan Municipality."
*Interfaces* 43(3), 240–255.

### 4. The Traveling Umpire Problem (Ch. 4 assignment; also Part 2/3 flavor)
**Story:** MLB umpire crews travel ~35,000 miles a season. Before 2006 a former
umpire built the schedule by hand in Excel over weeks. Trick, Yildiz, and Yunes
formulated it as an optimization problem ("the Traveling Umpire Problem") and
MLB adopted their schedules for multiple seasons.
**Why it fits:** starts as an assignment problem (crews to game series), then
shows how real rules (don't see the same team too often, travel limits) push a
clean textbook model toward integer programming. Great "from the book to the
big leagues" arc, and sports hooks students.
**Model:** assignment + side constraints (IP).
✔ Trick, M.A., Yildiz, H., Yunes, T. (2012). "Scheduling Major League Baseball
Umpires and the Traveling Umpire Problem." *Interfaces* 42(3), 232–244.
doi:10.1287/inte.1100.0514

---

## Tier 2 — good candidates, write as time allows

### 5. Staffing the phones at L.L. Bean (Ch. 2 workforce scheduling)
Economic-optimization model for telephone-agent staffing levels; saved an
estimated $500K+/year. Pairs with the book's post-office/workforce scheduling
examples. (The model itself mixes queueing with optimization, so the box should
present the staffing-level LP/IP side and mention the queueing input as given
data.)
✔ Andrews, B.H., Parsons, H.L. (1993). "Establishing Telephone-Agent Staffing
Levels through Economic Optimization." *Interfaces* 23(2), 14–20.
Related: ✔ "L.L. Bean Chooses a Telephone Agent Scheduling System." *Interfaces*
19(6) (1989), and "Allocating Telecommunications Resources at L.L. Bean"
*Interfaces* 21(1).

### 6. The Dutch national train timetable (Ch. 4 networks / Part 2)
Already cited in the Ch. 1 value panel (`kroon2009dutch` in references.bib);
could be expanded into a full case study in the network chapter: a completely
new national timetable built with IP, ~€40M/year additional profit, 2008
Edelman winner. Zero new citation work needed.

### 7. UPS ORION (Ch. 4 networks / routing)
Also already in references.bib (`holland2017ups`). A case study box could sit
next to the network-flow section: 100M miles/year saved. The full routing model
is beyond Book 1, which the box should say honestly, but the story motivates
network models strongly.

### 8. Scheduling the ACC basketball conference (Ch. 15 IP)
Nemhauser and Trick scheduled the 1997–98 ACC basketball season with IP;
the schedule was used as-is by the conference. Small, concrete, and famous.
◦ Nemhauser, G.L., Trick, M.A. (1998). "Scheduling a Major College Basketball
Conference." *Operations Research* 46(1), 1–8. (Verify pages/DOI before use.)

### 9. NBC's advertising sales (Ch. 2/4 modeling at scale)
NBC used optimization to plan TV advertising sales plans; documented ~$200M
revenue improvement over several years.
◦ Bollapragada, S., Cheng, H., Phillips, M., Garbiras, M., Scholes, M., Gibbs,
T., Humphreville, M. (2002). "NBC's Optimization Systems Increase Revenues and
Productivity." *Interfaces* 32(1), 47–60. (Verify author list before use.)

### 10. Air New Zealand crew scheduling (Part 2/3, set partitioning)
Crew rostering via set-partitioning IPs, NZ$15M+/year documented savings;
2000 Edelman finalist. Good companion for set covering in Ch. 15.
◦ Butchers, E.R., et al. (2001). "Optimized Crew Scheduling at Air New
Zealand." *Interfaces* 31(1), 30–56. (Verify.)

---

## Recommended plan

Write Tier 1 first, placed as: Kellogg in §4.1 (production planning), WFP in
Ch. 2 after the diet problem (with a cross-reference from Ch. 13), Denver+
Istanbul fire stations in Ch. 15 right after the fire-station example, and the
Traveling Umpire Problem in §4.2 alongside the housing case study (or moved to
Ch. 15 if §4.2 shouldn't have two). Each box follows the §4.2 format and ends
with full references; bib entries should go into references.bib so the panels
can \cite properly (the Ch. 1 value panel already added kroon2009dutch,
holland2017ups, smith1992yield, informs2026edelman).

Happy to draft any of these boxes on request — Tier 1 items are ready to write
now since their citations are verified.

---

## Excitement tier (added 2026-07-10, deployment verified)

### E1. Kidney exchange — DEPLOYED, explicit models. Grade A.
Not just academic: the US national program (UNOS/OPTN kidney paired donation)
and the UK's National Living Donor Kidney Sharing Scheme both clear their
matches with integer programming; the UK scheme's quarterly matching runs on
algorithms from Manlove's group at Glasgow, and the IP-models literature tests
directly on real UNOS and UK NLDKSS data. The cycle-formulation ILP (choose
disjoint short donor-swap cycles maximizing transplants) is teachable at Book 1
level. Suggested citations: Abraham, Blum, Sandholm (2007), "Clearing Algorithms
for Barter Exchange Markets," ACM EC; Manlove, O'Malley (2015), "Paired and
Altruistic Kidney Donation in the UK," ACM J. Experimental Algorithmics 19(2.6);
Anderson, Ashlagi, Gamarnik, Roth (2015), PNAS 112(3) for chains. Verify exact
pages/DOIs when drafting.

### E2. Wildfire airtankers in Ontario — DEPLOYED, explicit model. Grade A.
MacLellan and Martell's home-basing model for Ontario's firefighting airtankers
informed the province's actual basing strategy from the 1993 fire season onward
(per Martell's own retrospective). Operations Research paper = explicit
formulation; the problem (where to base airtankers to cover expected fire load)
is a facility-location/assignment model in Book 1's range, with obvious
climate-era resonance.
✔ MacLellan, J.I., Martell, D.L. (1996). "Basing Airtankers for Forest Fire
Control in Ontario." *Operations Research* 44(5), 677-686.
Related: Martell, D.L., et al. "An Evaluation of Forest Fire Initial Attack
Resources." *Interfaces* 14(5), 20-32.

### E3. Amazon: Regionalize and Scale — NEW, brand-name excitement. Grade B+/A-.
Amazon published its fulfillment-network regionalization work in the INFORMS
Journal on Applied Analytics (2025; 2025 Edelman finalist): path-based network
MIP ("Middle Mile Topology Optimizer") plus a time-expanded-graph timing model;
$0.45/item cost reduction in the US in 2023 with fastest-ever delivery speeds.
Honesty bonus for the case-study box: the paper says explicitly where machine
learning enters (demand/travel-time inputs via graph attention networks) versus
where the MIP decides, which directly answers the "was it an LP? was ML
involved?" question this book wants students to ask. Verify how much of the
formulation is printed (IJAA level) when drafting; the network-flow structure is
clearly described.
✔ "Regionalize and Scale: Amazon's Fulfillment Network Design for Faster and
Cheaper Delivery." *INFORMS Journal on Applied Analytics* (2025).
doi:10.1287/inte.2025.0295

### Boeing — searched, no clean candidate found.
No Interfaces/IJAA-style Boeing paper with an explicit, teachable model
surfaced. Boeing's optimization work is mostly internal or in specialized
aerospace venues without clean formulations. If aerospace flavor is wanted, the
airline side is far better served (American Airlines crew pairing, Anbil et al.,
Interfaces 1991; yield management already cited as smith1992yield).
