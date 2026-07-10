import React, { useState } from "react";
import { Terminal, Lightbulb, AlertTriangle } from "lucide-react";
import { CopyCodeButton, DownloadNotebookButton } from "./code_panel_utils.jsx";
import { Tex } from "./math.jsx";

/* ============================================================
   MODELING INTRODUCTION — TUTORIAL FOR ISE 5406
   How to translate a real-world problem into a math program.
   ============================================================ */

const TOPICS = [
  { key: "what",     name: "1. What IS a model?",      body: () => <WhatSection /> },
  { key: "build",    name: "2. Build one — bakery",    body: () => <BuildSection /> },
  { key: "patterns", name: "3. Common patterns",       body: () => <PatternsSection /> },
  { key: "vars",     name: "4. Variable types",        body: () => <VarsSection /> },
  { key: "pitfalls", name: "5. Common pitfalls",       body: () => <PitfallsSection /> },
  { key: "solver",   name: "6. From model to solver",  body: () => <SolverSection /> },
  { key: "practice", name: "7. Practice problems",     body: () => <PracticeSection /> },
];

export default function ModelingIntroduction() {
  const [tab, setTab] = useState(TOPICS[0].key);
  const topic = TOPICS.find((t) => t.key === tab);
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        How to Build an Optimization Model
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        The hardest part of optimization isn't running the solver — it's
        translating a vague, messy, real-world problem into a clean math
        program the solver can chew on. This tutorial walks you through
        exactly that translation, with a worked example, the patterns you'll
        meet again and again, the pitfalls to dodge, and practice problems
        with worked solutions you can reveal one piece at a time.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {TOPICS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{ ...tabBtn, ...(tab === t.key ? tabBtnActive : {}) }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {topic.body()}
    </div>
  );
}

// ============================================================
// Section 1 — What IS a model?
// ============================================================
function WhatSection() {
  return (
    <div>
      <H2>What is an optimization model, really?</H2>
      <P>
        An optimization model is a precise mathematical description of a
        decision problem. It has exactly three ingredients — and almost every
        OR model you'll ever see fits this template:
      </P>

      <div style={threeBox}>
        <TrioCard
          title="Decision variables"
          plain="The unknowns we get to pick."
          example="How many cakes to bake today?"
          math={<Tex>{`x \\ge 0`}</Tex>}
        />
        <TrioCard
          title="Constraints"
          plain="Limits the choices have to respect."
          example="We have only 50 lb of flour."
          math={<Tex>{`2x + 3y \\le 50`}</Tex>}
        />
        <TrioCard
          title="Objective"
          plain="The single number we're trying to maximize or minimize."
          example="Maximize total profit."
          math={<Tex>{`\\max\\; 4x + 5y`}</Tex>}
        />
      </div>

      <H3>The standard form</H3>
      <P>
        Every model in this course can be written in this template:
      </P>
      <Tex block>{`\\begin{aligned}
\\min_{x \\in \\mathbb{R}^n}\\;\\; & f(x) \\\\
\\text{s.t.}\\;\\; & g_i(x) \\le 0, \\quad i = 1, \\dots, m \\\\
& h_j(x) = 0, \\quad j = 1, \\dots, p \\\\
& x \\in X
\\end{aligned}`}</Tex>
      <P>
        Here <Tex>{`f`}</Tex> is the objective, the <Tex>{`g_i`}</Tex> are
        inequality constraints, the <Tex>{`h_j`}</Tex> are equality
        constraints, and <Tex>{`X`}</Tex> captures variable types (e.g.
        non-negativity, integrality). "s.t." stands for{" "}
        <i>subject to</i>.
      </P>
      <P>
        Maximizing <Tex>{`f(x)`}</Tex> is the same as minimizing{" "}
        <Tex>{`-f(x)`}</Tex>, so we lose nothing by stating everything as a
        minimization. This is just a convention — pick whichever direction
        reads naturally for your problem.
      </P>

      <H3>Why this matters</H3>
      <P>
        A solver knows nothing about cakes, trucks, or hospitals. It knows
        about <i>numbers, variables, and inequalities</i>. The model is the
        shared language between you (who understands the business) and the
        solver (which understands the math). Get the model right and the
        solver does the rest. Get it wrong and even the best solver in the
        world will give you a wrong answer in milliseconds.
      </P>

      <Tip>
        When you sit down with a new problem, ask yourself the three
        questions in order: <b>What am I deciding? What are the limits? What
        am I trying to make best?</b> If you can answer those three sentences
        in plain English, the math is mostly mechanical from there.
      </Tip>

      <H3>The translation, in three columns</H3>
      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>real world</th>
            <th style={th}>OR concept</th>
            <th style={th}>math symbol</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>"How many trucks should I buy?"</td>
            <td style={td}>decision variable</td>
            <td style={td}><Tex>{`x \\in \\mathbb{Z}_{\\ge 0}`}</Tex></td>
          </tr>
          <tr>
            <td style={td}>"We can't spend more than $1M."</td>
            <td style={td}>budget constraint</td>
            <td style={td}><Tex>{`50000\\,x \\le 1000000`}</Tex></td>
          </tr>
          <tr>
            <td style={td}>"We want the cheapest plan."</td>
            <td style={td}>min-cost objective</td>
            <td style={td}><Tex>{`\\min\\; c^\\top x`}</Tex></td>
          </tr>
          <tr>
            <td style={td}>"Trucks can't be negative or fractional."</td>
            <td style={td}>variable type</td>
            <td style={td}><Tex>{`x \\in \\mathbb{Z}_{\\ge 0}`}</Tex></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function TrioCard({ title, plain, example, math }) {
  return (
    <div style={trioCard}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#1f4e3d", marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "#222", marginBottom: 6 }}>{plain}</div>
      <div style={{ fontSize: 12.5, color: "#555", fontStyle: "italic", marginBottom: 8 }}>
        e.g. {example}
      </div>
      <div style={{ fontSize: 13 }}>{math}</div>
    </div>
  );
}

// ============================================================
// Section 2 — Build one (bakery)
// ============================================================
function BuildSection() {
  return (
    <div>
      <H2>Worked example — Sam's Bakery</H2>
      <div style={storyBox}>
        <b>The story.</b> Sam runs a small bakery and has to decide how many
        chocolate <i>cakes</i> and trays of <i>cookies</i> to make tomorrow.
        Each cake earns $4 in profit and uses 3 cups of flour and 2 eggs.
        Each tray of cookies earns $3 in profit and uses 2 cups of flour and
        1 egg. Sam has 24 cups of flour and 12 eggs in the pantry. The
        farmer's market that Sam sells at will only buy at most 5 cakes
        tomorrow. How many of each should Sam make to maximize profit?
      </div>

      <P>
        Reading a problem like this for the first time can feel
        overwhelming. Don't try to write down the model in one shot. Walk
        through the three questions, slowly.
      </P>

      <H3>Step 1 — What are we DECIDING?</H3>
      <P>
        Highlight every quantity Sam controls. Two of them: cakes and
        cookie-trays. Each gets a variable name. Pick names that mean
        something to you.
      </P>
      <Tex block>{`x_C = \\text{number of cakes baked tomorrow}`}</Tex>
      <Tex block>{`x_K = \\text{number of cookie trays baked tomorrow}`}</Tex>
      <P>
        Already we have to make a choice: are these counts integers
        (you can't bake half a cake), or do we let them be continuous and
        round at the end? For now, let's allow real numbers — the simpler
        LP is much easier to solve and we'll come back to the integer
        question. We'll also require non-negativity, since we can't bake
        negative things.
      </P>
      <Tex block>{`x_C \\ge 0,\\quad x_K \\ge 0`}</Tex>

      <H3>Step 2 — What are the LIMITS?</H3>
      <P>
        Now read the problem again, hunting only for the word{" "}
        <i>only / at most / at least / no more than</i> and similar. Each
        such phrase is one constraint. List them in plain English first.
      </P>

      <ul style={list}>
        <li>Flour used can't exceed 24 cups.</li>
        <li>Eggs used can't exceed 12.</li>
        <li>Cakes sold can't exceed 5.</li>
        <li>(Implicitly: don't bake negative items.)</li>
      </ul>

      <P>
        Now translate each one. The trick is always: write down the
        <i>resource used by my decisions</i>, then <Tex>{`\\le`}</Tex> the
        amount available.
      </P>

      <Tex block>{`\\begin{aligned}
3 x_C + 2 x_K &\\le 24 && \\text{(flour, in cups)} \\\\
2 x_C + 1 x_K &\\le 12 && \\text{(eggs)} \\\\
x_C &\\le 5         && \\text{(market demand for cakes)} \\\\
x_C, x_K &\\ge 0
\\end{aligned}`}</Tex>

      <Tip>
        Notice how each constraint has units. The left side of the flour
        constraint is in cups — 3 cups per cake times <Tex>{`x_C`}</Tex> cakes
        plus 2 cups per tray times <Tex>{`x_K`}</Tex> trays — and the right
        side is also in cups. <b>If your two sides have different units, the
        constraint is wrong.</b>
      </Tip>

      <H3>Step 3 — What is the GOAL?</H3>
      <P>
        Sam wants the most profit. Each cake earns $4, each tray earns $3.
        Total profit is therefore:
      </P>
      <Tex block>{`\\text{profit} = 4 x_C + 3 x_K`}</Tex>
      <P>
        We want this as large as possible.
      </P>
      <Tex block>{`\\max\\; 4 x_C + 3 x_K`}</Tex>

      <H3>Step 4 — Put it all together</H3>
      <div style={modelBox}>
        <Tex block>{`\\begin{aligned}
\\max\\;\\; & 4 x_C + 3 x_K \\\\
\\text{s.t.}\\;\\; & 3 x_C + 2 x_K \\le 24 \\\\
& 2 x_C + 1 x_K \\le 12 \\\\
& x_C \\le 5 \\\\
& x_C,\\, x_K \\ge 0
\\end{aligned}`}</Tex>
      </div>
      <P>
        This is a linear program (LP). Two variables, three resource
        constraints, two non-negativity bounds. A solver returns the optimal
        in microseconds.
      </P>

      <H3>Step 5 — Solve and sanity-check</H3>
      <P>
        Solving by hand or with any LP solver gives{" "}
        <Tex>{`x_C = 4,\\; x_K = 4`}</Tex> with profit{" "}
        <Tex>{`4(4) + 3(4) = 28`}</Tex>. Plug back into the constraints to
        make sure they hold:
      </P>
      <ul style={list}>
        <li>Flour: <Tex>{`3(4) + 2(4) = 20 \\le 24`}</Tex>. OK (4 cups slack).</li>
        <li>Eggs: <Tex>{`2(4) + 1(4) = 12 \\le 12`}</Tex>. Tight — the binding constraint.</li>
        <li>Cakes-sold: <Tex>{`4 \\le 5`}</Tex>. OK (1 cake slack).</li>
      </ul>
      <P>
        The egg constraint is the bottleneck. If Sam wants more profit,
        getting more eggs would help; getting more flour would not (yet).
        This kind of "what's binding?" reading is the first step of
        sensitivity analysis.
      </P>

      <H3>The same model in code</H3>
      <P>
        Once the math is settled, every modeling library is a thin
        translator. Here's the same problem in <Code>pyomo</Code>.
      </P>
      <CodeBlock title="bakery LP — pyomo" code={`import pyomo.environ as pyo

m = pyo.ConcreteModel()

# Decision variables
m.x_C = pyo.Var(domain=pyo.NonNegativeReals)
m.x_K = pyo.Var(domain=pyo.NonNegativeReals)

# Objective
m.profit = pyo.Objective(
    expr = 4 * m.x_C + 3 * m.x_K,
    sense = pyo.maximize,
)

# Constraints
m.flour  = pyo.Constraint(expr = 3 * m.x_C + 2 * m.x_K <= 24)
m.eggs   = pyo.Constraint(expr = 2 * m.x_C + 1 * m.x_K <= 12)
m.demand = pyo.Constraint(expr = m.x_C <= 5)

# Solve
pyo.SolverFactory("glpk").solve(m)
print(f"x_C = {pyo.value(m.x_C):.2f}, x_K = {pyo.value(m.x_K):.2f}")
print(f"profit = {pyo.value(m.profit):.2f}")
`} />

      <Tip>
        Almost every model you'll write in this course follows the same
        rhythm: name your variables, list each limit as one inequality,
        write the objective, then translate to code. If you can't write down
        a model in plain English first, you're not ready to write the math.
      </Tip>
    </div>
  );
}

// ============================================================
// Section 3 — Common patterns
// ============================================================
function PatternsSection() {
  return (
    <div>
      <H2>The dozen patterns that cover most OR problems</H2>
      <P>
        After a while, you start to recognize problems on sight. "Oh, this
        is just a knapsack with extra constraints." Each pattern below comes
        with its trigger phrase, its variable structure, the canonical math
        form, and a one-line application. <b>Memorize the triggers</b> —
        spotting them is half the battle.
      </P>

      <PatternCard
        name="Production planning"
        trigger='"How much of each product should we make to maximize profit, subject to limited resources?"'
        vars={<><Tex>{`x_j \\ge 0`}</Tex> = amount of product <Tex>{`j`}</Tex> made.</>}
        math={`\\begin{aligned}
\\max\\; & \\sum_j p_j x_j \\\\
\\text{s.t.}\\; & \\sum_j a_{ij} x_j \\le b_i, \\; \\forall i \\\\
& x_j \\ge 0
\\end{aligned}`}
        app="The bakery from the previous tab. Profit per item, resource budgets per ingredient."
      />

      <PatternCard
        name="Diet / blending"
        trigger='"What is the cheapest mix that meets all the nutrient (or quality) requirements?"'
        vars={<><Tex>{`x_j \\ge 0`}</Tex> = amount of ingredient <Tex>{`j`}</Tex> in the mix.</>}
        math={`\\begin{aligned}
\\min\\; & \\sum_j c_j x_j \\\\
\\text{s.t.}\\; & \\sum_j a_{ij} x_j \\ge n_i, \\; \\forall i \\\\
& x_j \\ge 0
\\end{aligned}`}
        app="Cheapest cattle feed that meets daily protein, calcium, and energy minima."
      />

      <PatternCard
        name="Transportation"
        trigger='"Ship goods from sources (factories) to sinks (customers) at minimum cost, respecting supply and demand."'
        vars={<><Tex>{`x_{ij} \\ge 0`}</Tex> = units shipped from source <Tex>{`i`}</Tex> to sink <Tex>{`j`}</Tex>.</>}
        math={`\\begin{aligned}
\\min\\; & \\sum_{i,j} c_{ij} x_{ij} \\\\
\\text{s.t.}\\; & \\sum_j x_{ij} \\le s_i,\\; \\forall i \\quad (\\text{supply}) \\\\
& \\sum_i x_{ij} \\ge d_j,\\; \\forall j \\quad (\\text{demand}) \\\\
& x_{ij} \\ge 0
\\end{aligned}`}
        app="3 warehouses, 5 stores, ship-cost matrix, find cheapest plan."
      />

      <PatternCard
        name="Assignment"
        trigger='"Pair n workers with n jobs (one-to-one) at minimum total cost."'
        vars={<><Tex>{`x_{ij} \\in \\{0, 1\\}`}</Tex> = 1 if worker <Tex>{`i`}</Tex> is assigned to job <Tex>{`j`}</Tex>.</>}
        math={`\\begin{aligned}
\\min\\; & \\sum_{i,j} c_{ij} x_{ij} \\\\
\\text{s.t.}\\; & \\sum_j x_{ij} = 1, \\; \\forall i \\\\
& \\sum_i x_{ij} = 1, \\; \\forall j \\\\
& x_{ij} \\in \\{0,1\\}
\\end{aligned}`}
        app="Assign 5 nurses to 5 wards minimizing total dissatisfaction score."
      />

      <PatternCard
        name="Knapsack"
        trigger='"Pick a subset of items to maximize value, subject to a single capacity (weight, budget, time)."'
        vars={<><Tex>{`x_j \\in \\{0,1\\}`}</Tex> = 1 if item <Tex>{`j`}</Tex> is picked.</>}
        math={`\\begin{aligned}
\\max\\; & \\sum_j v_j x_j \\\\
\\text{s.t.}\\; & \\sum_j w_j x_j \\le W \\\\
& x_j \\in \\{0,1\\}
\\end{aligned}`}
        app="Choose research projects to fund under a $5M budget; each has cost and expected value."
      />

      <PatternCard
        name="Set covering"
        trigger='"Pick the smallest (or cheapest) set of options so that every requirement is covered by at least one chosen option."'
        vars={<><Tex>{`x_j \\in \\{0, 1\\}`}</Tex> = 1 if option <Tex>{`j`}</Tex> is chosen.</>}
        math={`\\begin{aligned}
\\min\\; & \\sum_j c_j x_j \\\\
\\text{s.t.}\\; & \\sum_{j \\in S_i} x_j \\ge 1, \\; \\forall i \\\\
& x_j \\in \\{0,1\\}
\\end{aligned}`}
        app="Place fire stations so every neighborhood is within 5 minutes of one."
      />

      <PatternCard
        name="Facility location"
        trigger='"Open some facilities (with fixed costs) and ship from them to customers (with variable costs)."'
        vars={<>
          <Tex>{`y_i \\in \\{0,1\\}`}</Tex>: open facility <Tex>{`i`}</Tex>?{" "}
          <Tex>{`x_{ij} \\ge 0`}</Tex>: flow from <Tex>{`i`}</Tex> to <Tex>{`j`}</Tex>.
        </>}
        math={`\\begin{aligned}
\\min\\; & \\sum_i f_i y_i + \\sum_{i,j} c_{ij} x_{ij} \\\\
\\text{s.t.}\\; & \\sum_i x_{ij} \\ge d_j, \\; \\forall j \\\\
& \\sum_j x_{ij} \\le M y_i, \\; \\forall i \\\\
& x_{ij} \\ge 0,\\; y_i \\in \\{0,1\\}
\\end{aligned}`}
        app="Pick which 3 of 10 candidate distribution centers to open. The big-M ties open/closed to the flow."
      />

      <PatternCard
        name="Scheduling"
        trigger='"When should each task run, on which machine, so we finish ASAP / hit deadlines?"'
        vars={<>
          <Tex>{`s_j \\ge 0`}</Tex>: start time of job <Tex>{`j`}</Tex>.{" "}
          <Tex>{`y_{jk} \\in \\{0,1\\}`}</Tex>: does <Tex>{`j`}</Tex> precede <Tex>{`k`}</Tex>?
        </>}
        math={`\\begin{aligned}
\\min\\; & C_{\\max} \\\\
\\text{s.t.}\\; & s_j + p_j \\le C_{\\max} \\\\
& s_k \\ge s_j + p_j - M(1 - y_{jk}) \\\\
& s_j \\ge s_k + p_k - M\\, y_{jk} \\\\
& s_j \\ge 0,\\; y_{jk} \\in \\{0,1\\}
\\end{aligned}`}
        app="Order surgeries on one OR — disjunctive constraints (no two at once) need binaries."
      />

      <PatternCard
        name="Network flow"
        trigger='"How much flow goes through each arc to satisfy supply / demand at every node?"'
        vars={<><Tex>{`x_{ij} \\ge 0`}</Tex> = flow on arc <Tex>{`(i,j)`}</Tex>.</>}
        math={`\\begin{aligned}
\\min\\; & \\sum_{(i,j)} c_{ij} x_{ij} \\\\
\\text{s.t.}\\; & \\sum_{j:(i,j)\\in A} x_{ij} - \\sum_{j:(j,i)\\in A} x_{ji} = b_i, \\; \\forall i \\\\
& 0 \\le x_{ij} \\le u_{ij}
\\end{aligned}`}
        app="Min-cost flow on a road network with arc capacities. Generalizes shortest path, max flow, transportation."
      />

      <PatternCard
        name="Multi-period inventory"
        trigger='"Decide what to produce / hold / ship in each time period."'
        vars={<>
          <Tex>{`x_t`}</Tex>: produced in period <Tex>{`t`}</Tex>.{" "}
          <Tex>{`I_t`}</Tex>: inventory at end of <Tex>{`t`}</Tex>.
        </>}
        math={`\\begin{aligned}
\\min\\; & \\sum_t (c_t x_t + h_t I_t) \\\\
\\text{s.t.}\\; & I_t = I_{t-1} + x_t - d_t, \\; \\forall t \\\\
& x_t, I_t \\ge 0
\\end{aligned}`}
        app="Lot-sizing: produce or hold each month to meet known demand at minimum cost."
      />

      <PatternCard
        name="Portfolio (QP)"
        trigger='"Allocate budget across assets to maximize expected return for a given risk."'
        vars={<><Tex>{`x_j \\ge 0`}</Tex> = fraction of wealth in asset <Tex>{`j`}</Tex>.</>}
        math={`\\begin{aligned}
\\min\\; & x^\\top \\Sigma\\, x - \\lambda\\, \\mu^\\top x \\\\
\\text{s.t.}\\; & \\sum_j x_j = 1 \\\\
& x_j \\ge 0
\\end{aligned}`}
        app="Markowitz mean-variance portfolio. Quadratic objective — strictly convex when Σ is PSD."
      />

      <PatternCard
        name="Nonlinear fit / regression"
        trigger='"Find parameters so a curve fits data."'
        vars={<><Tex>{`\\theta \\in \\mathbb{R}^p`}</Tex> = parameters of the model.</>}
        math={`\\min_\\theta \\; \\sum_{i=1}^n \\big( y_i - f(x_i;\\, \\theta) \\big)^2`}
        app="Calibrate a logistic, exponential, or any parametric model. Becomes an NLP when f is nonlinear in θ."
      />

      <Tip>
        Many real problems are <b>combinations</b>: facility location with
        transportation costs, scheduling with assignment, inventory with
        production planning. Spotting the building blocks lets you assemble
        a model out of patterns you already know.
      </Tip>
    </div>
  );
}

function PatternCard({ name, trigger, vars, math, app }) {
  return (
    <div style={patternCard}>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#0b3da0", marginBottom: 4 }}>
        {name}
      </div>
      <div style={{ fontSize: 13, color: "#444", fontStyle: "italic", marginBottom: 6 }}>
        Trigger: {trigger}
      </div>
      <div style={{ fontSize: 13, marginBottom: 4 }}>
        <b>Variables.</b> {vars}
      </div>
      <div style={{ marginBottom: 4 }}>
        <Tex block>{math}</Tex>
      </div>
      <div style={{ fontSize: 12.5, color: "#555" }}>
        <b>Example.</b> {app}
      </div>
    </div>
  );
}

// ============================================================
// Section 4 — Variable types
// ============================================================
function VarsSection() {
  return (
    <div>
      <H2>Picking the right kind of variable</H2>
      <P>
        Choosing variable types is one of the highest-leverage choices in
        modeling. The wrong type can make your model meaningless, or merely
        100,000× slower to solve. Here's the cheat sheet.
      </P>

      <H3>Continuous variables — <Tex>{`x \\in \\mathbb{R}`}</Tex></H3>
      <P>
        Use when the quantity is naturally divisible: a number of pounds, a
        fraction of a budget, a flow rate, a percentage. The solver will
        return any real number in the feasible region. LPs and most NLPs
        use only continuous variables and are by far the easiest class to
        solve.
      </P>
      <ul style={list}>
        <li>Production amount of a chemical (in liters).</li>
        <li>Money allocated to each marketing channel.</li>
        <li>Flow on a pipe (in cubic feet per minute).</li>
      </ul>

      <H3>Integer variables — <Tex>{`x \\in \\mathbb{Z}`}</Tex></H3>
      <P>
        Use when the quantity must be a whole number: number of trucks,
        number of nurses on shift, number of products on a shelf. Adding
        integrality turns an LP into a (much harder) MIP, so reach for
        integers only when you actually need them.
      </P>
      <ul style={list}>
        <li>Number of buses to schedule (you can't run 3.7 buses).</li>
        <li>Number of operating rooms to staff.</li>
        <li>Inventory level in cases (if cases are integer).</li>
      </ul>

      <H3>Binary variables — <Tex>{`x \\in \\{0, 1\\}`}</Tex></H3>
      <P>
        Use for yes/no decisions. This is where most of modeling's
        cleverness lives. A binary lets you say "is this facility open?",
        "do I assign worker A to job B?", "do I buy this stock?" — and
        gives you the building blocks for logical conditions like
        "if X then Y" or "at least 3 of these".
      </P>
      <ul style={list}>
        <li><Tex>{`y_i = 1`}</Tex> if facility <Tex>{`i`}</Tex> is opened, 0 otherwise.</li>
        <li><Tex>{`x_{ij} = 1`}</Tex> if worker <Tex>{`i`}</Tex> is assigned to job <Tex>{`j`}</Tex>.</li>
        <li><Tex>{`z_t = 1`}</Tex> if we produce in period <Tex>{`t`}</Tex> (triggers a setup cost).</li>
      </ul>

      <H3>The fixed-charge / big-M trick</H3>
      <P>
        A very common need: "I can produce any positive amount, but if I
        produce anything at all, I pay a fixed setup cost." That's a binary
        flag <Tex>{`y`}</Tex> times a continuous flow <Tex>{`x`}</Tex>,
        linked by a big-M constraint:
      </P>
      <Tex block>{`x \\le M \\cdot y, \\quad x \\ge 0, \\quad y \\in \\{0,1\\}`}</Tex>
      <P>
        Read this as: "if <Tex>{`y = 0`}</Tex>, then <Tex>{`x \\le 0`}</Tex>{" "}
        which forces <Tex>{`x = 0`}</Tex>; if <Tex>{`y = 1`}</Tex>, then{" "}
        <Tex>{`x \\le M`}</Tex> which is loose." So <Tex>{`y`}</Tex>{" "}
        functions as an on-switch for <Tex>{`x`}</Tex>. Then in the
        objective you can charge a fixed setup cost{" "}
        <Tex>{`f \\cdot y`}</Tex> only when <Tex>{`x > 0`}</Tex>.
      </P>

      <H3>How to pick</H3>
      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>kind of decision</th>
            <th style={th}>variable type</th>
            <th style={th}>solver class</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={td}>amount of stuff (lbs, gallons, dollars)</td><td style={td}>continuous</td><td style={td}>LP / NLP</td></tr>
          <tr><td style={td}>count of indivisible things</td><td style={td}>integer</td><td style={td}>MIP / MINLP</td></tr>
          <tr><td style={td}>yes/no, in/out, choose-which</td><td style={td}>binary</td><td style={td}>MIP / MINLP</td></tr>
          <tr><td style={td}>"open the facility" + "ship through it"</td><td style={td}>binary + continuous</td><td style={td}>MIP (fixed-charge)</td></tr>
          <tr><td style={td}>parameter of a curve to fit</td><td style={td}>continuous</td><td style={td}>NLP</td></tr>
        </tbody>
      </table>

      <Tip>
        Heuristic: <b>start continuous</b>, solve the LP, see if the answer
        already happens to be integer (transportation problems often are),
        and only add integrality if you need it. Continuous LPs take
        milliseconds; the same model with binaries can take hours.
      </Tip>
    </div>
  );
}

// ============================================================
// Section 5 — Pitfalls
// ============================================================
function PitfallsSection() {
  return (
    <div>
      <H2>The mistakes everybody makes (so you don't have to)</H2>
      <P>
        After grading hundreds of homework problems, these are the bugs we
        see again and again. Read them once now; check your model against
        them every time.
      </P>

      <PitfallCard
        title="Forgetting non-negativity"
        wrong={<Tex>{`x_C, x_K \\in \\mathbb{R}`}</Tex>}
        right={<Tex>{`x_C, x_K \\ge 0`}</Tex>}
        why="Without a lower bound, the solver may happily set x = -1000 if it helps the objective. Variables that represent amounts, counts, flows, or probabilities almost always need a non-negativity bound (or an explicit non-negative domain in code)."
      />

      <PitfallCard
        title="Wrong objective direction"
        wrong="min profit"
        right="max profit (or min −profit)"
        why="If the solver minimizes when you meant to maximize, you'll get a feasible but trivially bad answer (often a corner with zero production). Always read the objective sentence aloud: 'minimize cost' vs 'maximize profit'."
      />

      <PitfallCard
        title="Conflating constraints with the objective"
        wrong={<>"We want to make at least 100 units" written as <Tex>{`\\max\\; x \\ge 100`}</Tex>.</>}
        right={<>Constraint: <Tex>{`x \\ge 100`}</Tex>. Objective: separately, e.g. <Tex>{`\\min\\; \\text{cost}(x)`}</Tex>.</>}
        why={<>"At least", "at most", "no more than", "must be" — all of these are <b>constraints</b>. The objective is the single number you're optimizing. A model has many constraints but exactly one objective.</>}
      />

      <PitfallCard
        title="Continuous-then-round for integer decisions"
        wrong="Solve LP, round x = 3.7 to 4."
        right="Build it as a MIP from the start with the right integer / binary types."
        why="Rounding is sometimes correct, but is often INFEASIBLE (you violate a constraint) or sub-optimal (a different rounding is better). For binary 'open / closed' decisions, rounding is meaningless — you can't 0.4-open a facility."
      />

      <PitfallCard
        title="Big-M too large or too small"
        wrong={<><Tex>{`x \\le 10^{12}\\, y`}</Tex> for a flow that's at most 100.</>}
        right={<><Tex>{`x \\le 100\\, y`}</Tex> if 100 is a true upper bound on x.</>}
        why="A huge M makes the LP relaxation extremely loose, which destroys solver performance. A too-small M cuts off feasible solutions and gives wrong answers. Always pick the tightest valid M from the problem data."
      />

      <PitfallCard
        title="Forgetting to define index sets"
        wrong={<>Writing <Tex>{`\\sum_j x_j`}</Tex> and never saying what j ranges over.</>}
        right={<>Always say "for all <Tex>{`j \\in J`}</Tex>" or "for j = 1, …, n" with J defined in words.</>}
        why="The model is meaningless unless every index has a known set. The set might be 'all products', 'all hours of the day', or 'all candidate facility sites' — but it has to be specified."
      />

      <PitfallCard
        title="Missing the implicit constraint"
        wrong="Allow inventory I_t to go negative because no constraint forbids it."
        right={<><Tex>{`I_t \\ge 0`}</Tex> for all t — you can't have negative stock on hand.</>}
        why={`Many constraints feel "obvious" and so go unwritten. The solver doesn't know what's obvious. Always ask: "Is anything in the real world that the model would currently allow but shouldn't?"`}
      />

      <PitfallCard
        title="Mis-aligned units"
        wrong={<>Mixing minutes and hours, or dollars and cents, in the same constraint.</>}
        right="Pick one unit per quantity and stick to it across the whole model."
        why="Two terms in the same expression must have the same unit. If your right-hand side is in dollars and a coefficient is in cents, your numbers will be off by 100×."
      />

      <PitfallCard
        title="Variables that shouldn't depend on data values"
        wrong={<>Writing <Tex>{`p \\cdot x`}</Tex> in the objective and treating <Tex>{`p`}</Tex> as a variable when it's just market price data.</>}
        right={<>Decision variables = things you choose. Parameters = things given. Capitalize the former, lowercase the latter, or use any consistent convention — but don't mix them up.</>}
        why="A common bug in coded models: you write a Var() for something that should be a fixed number from your data file. The solver will then 'optimize' it freely."
      />

      <PitfallCard
        title="Building the data INTO the model"
        wrong={<>Hard-coding the price 4 inside the constraint expression for a particular product.</>}
        right={<>Use parameters: <Tex>{`\\sum_j p_j x_j`}</Tex> where <Tex>{`p_j`}</Tex> is read from data.</>}
        why="Real OR problems have hundreds or thousands of indexed entities. If you write out each constraint by hand, you can't scale up, and you can't change the data without rewriting the model."
      />

      <Tip>
        <b>Sanity-check ritual.</b> After writing a model, plug in a known
        easy solution (e.g. all zeros, or a baseline plan you know works)
        and verify (a) it's feasible and (b) the objective matches your
        hand calculation. Most modeling bugs reveal themselves in the first
        five minutes if you do this.
      </Tip>
    </div>
  );
}

function PitfallCard({ title, wrong, right, why }) {
  return (
    <div style={pitfallCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <AlertTriangle size={16} color="#a02a2a" />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#a02a2a" }}>{title}</span>
      </div>
      <div style={{ fontSize: 13, marginBottom: 3 }}>
        <b style={{ color: "#a02a2a" }}>Wrong:</b> {wrong}
      </div>
      <div style={{ fontSize: 13, marginBottom: 4 }}>
        <b style={{ color: "#1f4e3d" }}>Right:</b> {right}
      </div>
      <div style={{ fontSize: 12.5, color: "#555", lineHeight: 1.55 }}>
        <b>Why.</b> {why}
      </div>
    </div>
  );
}

// ============================================================
// Section 6 — From model to solver
// ============================================================
function SolverSection() {
  return (
    <div>
      <H2>From the math to the solver — same model, three syntaxes</H2>
      <P>
        Once you've written the model on paper, the rest is mechanical:
        translate each piece (variables, constraints, objective) into the
        modeling library you prefer. Below is the bakery LP from tab 2
        rendered in the three you're most likely to see in this course.
      </P>

      <div style={modelBox}>
        <Tex block>{`\\begin{aligned}
\\max\\;\\; & 4 x_C + 3 x_K \\\\
\\text{s.t.}\\;\\; & 3 x_C + 2 x_K \\le 24 \\\\
& 2 x_C + 1 x_K \\le 12 \\\\
& x_C \\le 5 \\\\
& x_C,\\, x_K \\ge 0
\\end{aligned}`}</Tex>
      </div>

      <H3>Pyomo (Python, free)</H3>
      <CodeBlock title="bakery LP — pyomo" code={`import pyomo.environ as pyo

m = pyo.ConcreteModel()
m.x_C = pyo.Var(domain=pyo.NonNegativeReals)
m.x_K = pyo.Var(domain=pyo.NonNegativeReals)

m.profit = pyo.Objective(expr = 4*m.x_C + 3*m.x_K, sense=pyo.maximize)

m.flour  = pyo.Constraint(expr = 3*m.x_C + 2*m.x_K <= 24)
m.eggs   = pyo.Constraint(expr = 2*m.x_C + 1*m.x_K <= 12)
m.demand = pyo.Constraint(expr = m.x_C <= 5)

pyo.SolverFactory("glpk").solve(m)
print(pyo.value(m.x_C), pyo.value(m.x_K), pyo.value(m.profit))
`} />

      <H3>AMPL (algebraic modeling language)</H3>
      <CodeBlock title="bakery LP — AMPL" code={`var xC >= 0;
var xK >= 0;

maximize Profit:
    4 * xC + 3 * xK;

subject to Flour:  3 * xC + 2 * xK <= 24;
subject to Eggs:   2 * xC + 1 * xK <= 12;
subject to Demand:        xC        <= 5;

option solver highs;
solve;
display xC, xK, Profit;
`} />

      <H3>gurobipy (Gurobi's Python API)</H3>
      <CodeBlock title="bakery LP — gurobipy" code={`import gurobipy as gp
from gurobipy import GRB

m = gp.Model("bakery")

xC = m.addVar(lb=0, name="xC")
xK = m.addVar(lb=0, name="xK")

m.setObjective(4*xC + 3*xK, GRB.MAXIMIZE)

m.addConstr(3*xC + 2*xK <= 24, name="flour")
m.addConstr(2*xC + 1*xK <= 12, name="eggs")
m.addConstr(xC <= 5,           name="demand")

m.optimize()
print(xC.X, xK.X, m.ObjVal)
`} />

      <H3>The translation table</H3>
      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>math</th>
            <th style={th}>pyomo</th>
            <th style={th}>AMPL</th>
            <th style={th}>gurobipy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}><Tex>{`x \\ge 0`}</Tex></td>
            <td style={td}><Code>Var(domain=NonNegativeReals)</Code></td>
            <td style={td}><Code>var x &gt;= 0;</Code></td>
            <td style={td}><Code>addVar(lb=0)</Code></td>
          </tr>
          <tr>
            <td style={td}><Tex>{`x \\in \\{0,1\\}`}</Tex></td>
            <td style={td}><Code>Var(domain=Binary)</Code></td>
            <td style={td}><Code>var x binary;</Code></td>
            <td style={td}><Code>addVar(vtype=GRB.BINARY)</Code></td>
          </tr>
          <tr>
            <td style={td}><Tex>{`x \\in \\mathbb{Z}_{\\ge 0}`}</Tex></td>
            <td style={td}><Code>Var(domain=NonNegativeIntegers)</Code></td>
            <td style={td}><Code>var x integer &gt;= 0;</Code></td>
            <td style={td}><Code>addVar(vtype=GRB.INTEGER, lb=0)</Code></td>
          </tr>
          <tr>
            <td style={td}><Tex>{`a^\\top x \\le b`}</Tex></td>
            <td style={td}><Code>Constraint(expr= a@x &lt;= b)</Code></td>
            <td style={td}><Code>subject to C: a*x &lt;= b;</Code></td>
            <td style={td}><Code>addConstr(a@x &lt;= b)</Code></td>
          </tr>
          <tr>
            <td style={td}><Tex>{`\\min\\; c^\\top x`}</Tex></td>
            <td style={td}><Code>Objective(expr=c@x, sense=minimize)</Code></td>
            <td style={td}><Code>minimize Cost: c*x;</Code></td>
            <td style={td}><Code>setObjective(c@x, GRB.MINIMIZE)</Code></td>
          </tr>
        </tbody>
      </table>

      <Tip>
        Pick whichever modeling layer you find most comfortable — the math
        is what really matters. The course tutorials cover Pyomo, AMPL,
        Gurobi, CVXPY, and SCIP separately so you can compare.
      </Tip>
    </div>
  );
}

// ============================================================
// Section 7 — Practice problems
// ============================================================
function PracticeSection() {
  return (
    <div>
      <H2>Practice — model these yourself</H2>
      <P>
        For each problem, try to write down the model (variables,
        constraints, objective) on paper before clicking to reveal. Even if
        you peek immediately, write out the answer once by hand — modeling
        is a motor skill.
      </P>

      <Practice
        title="Problem 1 — Two-product factory"
        story={
          <>
            A small electronics shop assembles two products, a
            <i> phone-charger</i> and a <i>powerbank</i>. Each charger uses 1
            hour of labor and 2 chips and earns $5 profit. Each powerbank
            uses 2 hours of labor and 5 chips and earns $12 profit. The shop
            has 40 labor hours and 90 chips per week. Maximize weekly
            profit.
          </>
        }
        steps={[
          {
            head: "Step 1 — variables",
            body: <>
              <Tex>{`x_C \\ge 0`}</Tex> = chargers per week.
              <br /><Tex>{`x_P \\ge 0`}</Tex> = powerbanks per week.
              <br /> (Treat as continuous for the LP relaxation; could be made integer.)
            </>,
          },
          {
            head: "Step 2 — constraints",
            body: <Tex block>{`\\begin{aligned}
1 x_C + 2 x_P &\\le 40 \\quad \\text{(labor)} \\\\
2 x_C + 5 x_P &\\le 90 \\quad \\text{(chips)} \\\\
x_C, x_P &\\ge 0
\\end{aligned}`}</Tex>,
          },
          {
            head: "Step 3 — objective",
            body: <Tex block>{`\\max\\; 5 x_C + 12 x_P`}</Tex>,
          },
          {
            head: "Step 4 — full model",
            body: <Tex block>{`\\begin{aligned}
\\max\\;\\; & 5 x_C + 12 x_P \\\\
\\text{s.t.}\\;\\; & x_C + 2 x_P \\le 40 \\\\
& 2 x_C + 5 x_P \\le 90 \\\\
& x_C, x_P \\ge 0
\\end{aligned}`}</Tex>,
          },
        ]}
      />

      <Practice
        title="Problem 2 — Cheapest fertilizer mix"
        story={
          <>
            A farmer wants to mix two fertilizers, A and B, to get at least
            10 kg of nitrogen and at least 6 kg of phosphorus. Each kg of A
            contains 0.5 kg N and 0.1 kg P and costs $2/kg. Each kg of B
            contains 0.2 kg N and 0.3 kg P and costs $1.5/kg. How much of
            each to buy to minimize cost?
          </>
        }
        steps={[
          {
            head: "Step 1 — variables",
            body: <>
              <Tex>{`x_A \\ge 0`}</Tex> = kg of fertilizer A bought.
              <br /><Tex>{`x_B \\ge 0`}</Tex> = kg of fertilizer B bought.
            </>,
          },
          {
            head: "Step 2 — constraints",
            body: <Tex block>{`\\begin{aligned}
0.5 x_A + 0.2 x_B &\\ge 10 \\quad \\text{(nitrogen)} \\\\
0.1 x_A + 0.3 x_B &\\ge 6 \\quad \\text{(phosphorus)} \\\\
x_A, x_B &\\ge 0
\\end{aligned}`}</Tex>,
          },
          {
            head: "Step 3 — objective",
            body: <Tex block>{`\\min\\; 2 x_A + 1.5 x_B`}</Tex>,
          },
          {
            head: "Step 4 — full model (diet pattern)",
            body: <Tex block>{`\\begin{aligned}
\\min\\;\\; & 2 x_A + 1.5 x_B \\\\
\\text{s.t.}\\;\\; & 0.5 x_A + 0.2 x_B \\ge 10 \\\\
& 0.1 x_A + 0.3 x_B \\ge 6 \\\\
& x_A, x_B \\ge 0
\\end{aligned}`}</Tex>,
          },
          {
            head: "Pattern note",
            body: "This is a classical diet / blending LP — minimize cost subject to nutrient floors.",
          },
        ]}
      />

      <Practice
        title="Problem 3 — Charity project selection"
        story={
          <>
            A foundation has $100,000 and is reviewing 5 proposals. Project j
            costs <Tex>{`c_j`}</Tex> dollars and has expected social value{" "}
            <Tex>{`v_j`}</Tex>. Each proposal can either be funded in full or
            not at all (no partial funding). Pick a subset that maximizes
            total expected value within budget.
          </>
        }
        steps={[
          {
            head: "Step 1 — variables",
            body: <Tex block>{`x_j \\in \\{0, 1\\}, \\quad j = 1, \\dots, 5`}</Tex>,
          },
          {
            head: "Step 2 — constraint",
            body: <Tex block>{`\\sum_{j=1}^{5} c_j x_j \\le 100000 \\quad \\text{(budget)}`}</Tex>,
          },
          {
            head: "Step 3 — objective",
            body: <Tex block>{`\\max\\; \\sum_{j=1}^{5} v_j x_j`}</Tex>,
          },
          {
            head: "Step 4 — full model",
            body: <Tex block>{`\\begin{aligned}
\\max\\;\\; & \\sum_j v_j x_j \\\\
\\text{s.t.}\\;\\; & \\sum_j c_j x_j \\le 100000 \\\\
& x_j \\in \\{0,1\\}
\\end{aligned}`}</Tex>,
          },
          {
            head: "Pattern note",
            body: "Pure 0-1 knapsack. The 'all-or-nothing' phrase is your hint to use binaries — fractional funding would have been a continuous LP.",
          },
        ]}
      />

      <Practice
        title="Problem 4 — Food bank with fixed delivery cost"
        story={
          <>
            A food bank picks up donations from 3 grocery stores and delivers
            to 4 shelters. The cost to ship 1 lb from store i to shelter j is{" "}
            <Tex>{`c_{ij}`}</Tex>. Each store has supply{" "}
            <Tex>{`s_i`}</Tex> lbs; each shelter has demand{" "}
            <Tex>{`d_j`}</Tex> lbs. Additionally, opening a route from store
            i to shelter j requires hiring a driver at fixed cost{" "}
            <Tex>{`f_{ij}`}</Tex>. Minimize total cost.
          </>
        }
        steps={[
          {
            head: "Step 1 — variables",
            body: <>
              <Tex>{`x_{ij} \\ge 0`}</Tex>: lbs shipped from store i to shelter j.
              <br /><Tex>{`y_{ij} \\in \\{0,1\\}`}</Tex>: is the i-to-j route used?
            </>,
          },
          {
            head: "Step 2 — constraints",
            body: <Tex block>{`\\begin{aligned}
\\sum_j x_{ij} &\\le s_i, \\quad \\forall i \\quad \\text{(supply)}\\\\
\\sum_i x_{ij} &\\ge d_j, \\quad \\forall j \\quad \\text{(demand)}\\\\
x_{ij} &\\le M\\, y_{ij}, \\quad \\forall i, j \\quad \\text{(big-M link)}\\\\
x_{ij} &\\ge 0,\\;\\; y_{ij} \\in \\{0,1\\}
\\end{aligned}`}</Tex>,
          },
          {
            head: "Step 3 — objective",
            body: <Tex block>{`\\min\\; \\sum_{i,j} c_{ij} x_{ij} + \\sum_{i,j} f_{ij} y_{ij}`}</Tex>,
          },
          {
            head: "Step 4 — full model",
            body: <Tex block>{`\\begin{aligned}
\\min\\;\\; & \\sum_{i,j} c_{ij} x_{ij} + \\sum_{i,j} f_{ij} y_{ij} \\\\
\\text{s.t.}\\;\\; & \\sum_j x_{ij} \\le s_i, \\;\\forall i \\\\
& \\sum_i x_{ij} \\ge d_j, \\;\\forall j \\\\
& x_{ij} \\le M\\, y_{ij}, \\;\\forall i,j \\\\
& x_{ij} \\ge 0,\\; y_{ij} \\in \\{0,1\\}
\\end{aligned}`}</Tex>,
          },
          {
            head: "Pattern note",
            body: "Classic fixed-charge transportation — the binary y turns on/off a continuous flow x via a big-M constraint. Pick M as a real upper bound on x_ij (e.g. min(s_i, d_j)) to keep the relaxation tight.",
          },
        ]}
      />

      <Tip>
        If you got stuck on any of these: re-read the problem and underline
        every quantity. Decisions get variables. "At most / at least / no
        more than" is a constraint. "Maximize / minimize / cheapest /
        biggest" is the objective. The patterns from tab 3 will start to
        click after the third or fourth one.
      </Tip>
    </div>
  );
}

function Practice({ title, story, steps }) {
  const [open, setOpen] = useState(steps.map(() => false));
  const toggle = (i) =>
    setOpen((cur) => cur.map((v, k) => (k === i ? !v : v)));
  const reveal = () => setOpen(steps.map(() => true));
  const hide = () => setOpen(steps.map(() => false));
  return (
    <div style={practiceBox}>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#0b3da0", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 13.5, color: "#222", lineHeight: 1.6, marginBottom: 10 }}>
        {story}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <button style={smallBtn} onClick={reveal}>Reveal all</button>
        <button style={smallBtn} onClick={hide}>Hide all</button>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <button style={revealBtn} onClick={() => toggle(i)}>
            {open[i] ? "▾" : "▸"} {s.head}
          </button>
          {open[i] && (
            <div style={{
              marginTop: 6,
              padding: "8px 12px",
              background: "#fff",
              border: "1px solid #d8d4c8",
              borderRadius: 6,
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "#222",
            }}>
              {s.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Reusable bits
// ============================================================
function H2({ children }) {
  return <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, marginBottom: 10, color: "#1f4e3d" }}>{children}</h2>;
}
function H3({ children }) {
  return <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 18, marginBottom: 6, color: "#222" }}>{children}</h3>;
}
function P({ children }) {
  return <p style={{ fontSize: 14, lineHeight: 1.6, color: "#222", marginTop: 0, marginBottom: 12 }}>{children}</p>;
}
function Code({ children }) {
  return (
    <code style={{
      fontFamily: "monospace", fontSize: 13.5,
      background: "#f0eee9", padding: "1px 6px", borderRadius: 4, color: "#0b3da0",
    }}>
      {children}
    </code>
  );
}
function Tip({ children }) {
  return (
    <div style={{
      marginTop: 12, marginBottom: 12,
      padding: "10px 14px",
      background: "#fff8e1", border: "1px solid #f5d68d", borderRadius: 8,
      fontSize: 13.5, lineHeight: 1.55,
    }}>
      <Lightbulb size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
      <b>Tip.</b> {children}
    </div>
  );
}
function CodeBlock({ code, title }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            # {title}
          </span>
          <CopyCodeButton code={code} />
          <DownloadNotebookButton
            code={code}
            filename={`modeling_${(title || "snippet").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.ipynb`}
            title={title || "Modeling snippet"}
            description=""
            label=".ipynb"
          />
        </div>
      )}
      <pre style={{
        background: "#1f1d1a",
        color: "#e8e2d4",
        padding: "12px 14px",
        borderRadius: 6,
        fontFamily: "'JetBrains Mono', Menlo, ui-monospace, monospace",
        fontSize: 12.5,
        lineHeight: 1.55,
        margin: 0,
        whiteSpace: "pre",
        overflowX: "auto",
      }}>
        {code}
      </pre>
    </div>
  );
}

// ============================================================
// Style atoms
// ============================================================
const tabBtn = {
  padding: "8px 14px",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: 13,
};
const tabBtnActive = {
  background: "#1f4e3d",
  color: "#fff",
  border: "1px solid #1f4e3d",
};
const tbl = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 14,
  fontSize: 13.5,
};
const th = {
  padding: "6px 10px",
  borderBottom: "2px solid #888",
  textAlign: "left",
  fontFamily: "monospace",
  fontSize: 12,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#555",
};
const td = {
  padding: "6px 10px",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
};
const list = {
  paddingLeft: 22,
  lineHeight: 1.65,
  fontSize: 14,
  color: "#222",
  marginTop: 0,
  marginBottom: 12,
};
const threeBox = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
  marginBottom: 14,
};
const trioCard = {
  padding: "10px 12px",
  border: "1px solid #d8d4c8",
  borderRadius: 8,
  background: "#fbfaf6",
};
const storyBox = {
  padding: "12px 14px",
  background: "#eef5ee",
  border: "1px solid #b9d2bd",
  borderRadius: 8,
  fontSize: 14,
  lineHeight: 1.65,
  color: "#222",
  marginBottom: 14,
};
const modelBox = {
  padding: "10px 14px",
  background: "#fbfaf6",
  border: "1px solid #d8d4c8",
  borderRadius: 8,
  marginBottom: 14,
};
const patternCard = {
  padding: "12px 14px",
  border: "1px solid #d8d4c8",
  borderRadius: 8,
  background: "#fff",
  marginBottom: 12,
};
const pitfallCard = {
  padding: "10px 14px",
  border: "1px solid #e3c4c4",
  background: "#fdf5f5",
  borderRadius: 8,
  marginBottom: 10,
};
const practiceBox = {
  padding: "12px 14px",
  border: "1px solid #cdd7e0",
  background: "#f6f8fb",
  borderRadius: 8,
  marginBottom: 14,
};
const smallBtn = {
  padding: "4px 10px",
  fontSize: 12,
  fontFamily: "inherit",
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: 6,
  cursor: "pointer",
};
const revealBtn = {
  padding: "5px 10px",
  fontSize: 13,
  fontFamily: "inherit",
  background: "#fff",
  border: "1px solid #cdd7e0",
  borderRadius: 6,
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  fontWeight: 600,
  color: "#0b3da0",
};
