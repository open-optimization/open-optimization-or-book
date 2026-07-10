import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Play, Pause, RotateCcw, StepForward, Terminal } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   LP MODELERS — same problem, four languages, WITH CODE STEPPER
   ISE 5406

   PuLP, AMPL, Gurobi (gurobipy), CPLEX (docplex). Each tab
   steps through its own code line-by-line with a narration box
   and a growing state panel that mirrors the build-up.
   ============================================================ */

// ============================================================
// Same problem across all languages:
//   max  3 x + 5 y
//   s.t. 2 x +   y <= 8   (wood)
//          x + 3 y <= 6   (labor)
//        x, y >= 0
// Optimum: (x, y) = (3.6, 0.8), z = 14.8
// Duals : pi_wood = 0.8, pi_labor = 1.4
// ============================================================

// ============================================================
// PuLP
// ============================================================
const PULP = {
  key: "pulp",
  label: "PuLP",
  color: "#1f4e3d",
  code: [
    null,
    "from pulp import LpProblem, LpVariable, LpMaximize, LpStatus",
    "",
    "m = LpProblem('production', LpMaximize)",
    "",
    "x = LpVariable('x', lowBound=0)",
    "y = LpVariable('y', lowBound=0)",
    "",
    "m += 3*x + 5*y, 'profit'",
    "",
    "wood  = m.addConstraint(2*x + 1*y <= 8, 'wood')",
    "labor = m.addConstraint(1*x + 3*y <= 6, 'labor')",
    "",
    "m.solve()",
    "",
    "print('status :', LpStatus[m.status])",
    "print('z*     :', m.objective.value())",
    "print('x*, y* :', x.value(), y.value())",
    "",
    "for c in m.constraints.values():",
    "    print(f'  {c.name}: π = {c.pi}, slack = {c.slack}')",
    "for v in m.variables():",
    "    print(f'  rc({v.name}) = {v.dj}')",
  ],
  events: [
    { line: 1, kind: "import", note: "Import PuLP. LpProblem is the model container, LpVariable creates variables, LpMaximize / LpMinimize sets sense, LpStatus turns integer status codes into readable strings." },
    { line: 3, kind: "create_model", note: "Empty LP with 'maximize' sense. Underlying solver isn't chosen yet — PuLP defaults to CBC (bundled) unless you pass a solver later." },
    { line: 5, kind: "add_var", payload: { name: "x", lb: 0 }, note: "Continuous variable with lower bound 0. No upper bound (defaults to ∞). Add cat='Binary' or cat='Integer' for integer programming." },
    { line: 6, kind: "add_var", payload: { name: "y", lb: 0 } },
    { line: 8, kind: "set_objective", payload: { expr: "3x + 5y", sense: "Max" }, note: "PuLP overloads '+=' on the model: model += expression sets the objective; model += constraint adds a constraint. The trailing string is the objective name (optional)." },
    { line: 10, kind: "add_constraint", payload: { name: "wood", expr: "2x + y <= 8" }, note: "Explicitly using addConstraint (rather than 'm += ...') so we can bind the constraint object to a Python variable. That's how we'll read duals back later — c.pi requires we have a handle to the constraint." },
    { line: 11, kind: "add_constraint", payload: { name: "labor", expr: "x + 3y <= 6" } },
    { line: 13, kind: "solve", payload: { status: "OPTIMAL", z: 14.8, vars: { x: 3.6, y: 0.8 }, duals: { wood: 0.8, labor: 1.4 } }, note: "Solve with the default solver (CBC). Returns 1 if optimal, other integers for infeasible / unbounded. m.status is the raw int; LpStatus turns it into 'Optimal' / 'Infeasible' / etc." },
    { line: 15, kind: "print", payload: { text: "status : Optimal" } },
    { line: 16, kind: "print", payload: { text: "z*     : 14.8" } },
    { line: 17, kind: "print", payload: { text: "x*, y* : 3.6 0.8" } },
    { line: 19, kind: "print", payload: { text: "  wood: π = 0.8, slack = 0.0" }, note: "c.pi is the shadow price. Positive because the wood constraint is binding — one extra wood unit would improve the optimum by 0.8." },
    { line: 20, kind: "print", payload: { text: "  labor: π = 1.4, slack = 0.0" } },
    { line: 21, kind: "print", payload: { text: "  rc(x) = 0.0" }, note: "v.dj is the reduced cost. Zero for basic variables. If a variable's reduced cost is negative and it's at its lower bound, forcing it into the basis would decrease the objective (for max, we want positive rc's on non-basic vars — sign convention differs by solver)." },
    { line: 22, kind: "print", payload: { text: "  rc(y) = 0.0" } },
  ],
};

// ============================================================
// AMPL
// ============================================================
const AMPL = {
  key: "ampl",
  label: "AMPL",
  color: "#0b3da0",
  code: [
    null,
    "# production.mod",
    "var x >= 0;",
    "var y >= 0;",
    "",
    "maximize profit: 3*x + 5*y;",
    "",
    "subject to wood:  2*x + 1*y <= 8;",
    "subject to labor: 1*x + 3*y <= 6;",
    "",
    "# production.run  (driver)",
    "model production.mod;",
    "option solver gurobi;",
    "solve;",
    "",
    "display x, y, profit;",
    "display wood.dual, labor.dual;",
    "display wood.slack, labor.slack;",
    "display x.rc, y.rc;",
    "",
    "option presolve 0;",
    "display wood.up, wood.down;",
    "display x.up, x.down;",
  ],
  events: [
    { line: 1, kind: "comment", note: "AMPL splits the model (.mod) and the driver (.run) into separate files. The .mod file is data-INDEPENDENT — the same model runs on different .dat files." },
    { line: 2, kind: "add_var", payload: { name: "x", lb: 0 }, note: "'var' declares a decision variable with an implicit domain (real by default). '>= 0' sets the lower bound as a variable attribute — clean and self-documenting." },
    { line: 3, kind: "add_var", payload: { name: "y", lb: 0 } },
    { line: 5, kind: "set_objective", payload: { expr: "3x + 5y", sense: "Max" }, note: "'maximize <name>: <expr>' declares the objective. AMPL supports multiple named objectives; use 'objective profit;' to pick one to optimize." },
    { line: 7, kind: "add_constraint", payload: { name: "wood", expr: "2x + y <= 8" }, note: "Named constraint. Same 'subject to' syntax works for equality (=) and both inequality directions. Range constraints: a <= expr <= b." },
    { line: 8, kind: "add_constraint", payload: { name: "labor", expr: "x + 3y <= 6" } },
    { line: 10, kind: "comment", note: "Now the driver script (.run file) — this is what you actually invoke." },
    { line: 11, kind: "meta", payload: { action: "model" }, note: "Load the model file. Instantiates variables/constraints/objectives without solving." },
    { line: 12, kind: "meta", payload: { action: "solver" }, note: "Pick the solver. AMPL is backend-agnostic — swap gurobi ↔ cplex ↔ cbc ↔ highs ↔ ipopt ↔ knitro without changing the model file." },
    { line: 13, kind: "solve", payload: { status: "OPTIMAL", z: 14.8, vars: { x: 3.6, y: 0.8 }, duals: { wood: 0.8, labor: 1.4 } }, note: "'solve;' invokes the chosen solver, sends the model over, and imports the primal + dual solution back into AMPL's environment." },
    { line: 15, kind: "print", payload: { text: "x = 3.6, y = 0.8, profit = 14.8" } },
    { line: 16, kind: "print", payload: { text: "wood.dual = 0.8, labor.dual = 1.4" }, note: "AMPL exposes shadow prices as '<name>.dual' — a natural syntax students can guess at." },
    { line: 17, kind: "print", payload: { text: "wood.slack = 0.0, labor.slack = 0.0" } },
    { line: 18, kind: "print", payload: { text: "x.rc = 0.0, y.rc = 0.0" } },
    { line: 20, kind: "meta", payload: { action: "presolve off" }, note: "Disable AMPL's presolver so the sensitivity report reflects the original problem, not a simplified one." },
    { line: 21, kind: "print", payload: { text: "wood.up = 12,  wood.down = 4" }, note: "RHS sensitivity range for the wood constraint. Within [4, 12] the same basis stays optimal; only the constraint values inside shift linearly at slope wood.dual." },
    { line: 22, kind: "print", payload: { text: "x.up = 10.0,  x.down = 1.667" }, note: "Objective-coefficient sensitivity: c_x can range in [1.667, 10] without changing the basis." },
  ],
};

// ============================================================
// Gurobi (gurobipy)
// ============================================================
const GUROBI = {
  key: "gurobi",
  label: "Gurobi (gurobipy)",
  color: "#a40000",
  code: [
    null,
    "import gurobipy as gp",
    "from gurobipy import GRB",
    "",
    "m = gp.Model('production')",
    "",
    "x = m.addVar(name='x', lb=0)",
    "y = m.addVar(name='y', lb=0)",
    "",
    "m.setObjective(3*x + 5*y, GRB.MAXIMIZE)",
    "",
    "wood  = m.addConstr(2*x + 1*y <= 8, 'wood')",
    "labor = m.addConstr(1*x + 3*y <= 6, 'labor')",
    "",
    "m.optimize()",
    "",
    "print('status :', m.Status)",
    "print('z*     :', m.ObjVal)",
    "print('x*, y* :', x.X, y.X)",
    "",
    "for c in m.getConstrs():",
    "    print(f'  {c.ConstrName}: π = {c.Pi}, slack = {c.Slack}')",
    "for v in m.getVars():",
    "    print(f'  rc({v.VarName}) = {v.RC},',",
    "          f' obj range [{v.SAObjLow}, {v.SAObjUp}]')",
    "for c in m.getConstrs():",
    "    print(f'  {c.ConstrName}: RHS range [{c.SARHSLow}, {c.SARHSUp}]')",
  ],
  events: [
    { line: 1, kind: "import", note: "The gurobipy package. Loads the Gurobi C library and checks for a license (silent unless you use restricted-size features)." },
    { line: 2, kind: "import", note: "GRB is Gurobi's enum class: GRB.MAXIMIZE, GRB.MINIMIZE, GRB.BINARY, GRB.CONTINUOUS, GRB.INTEGER, GRB.OPTIMAL, GRB.INFEASIBLE, etc. All the sentinel constants live here." },
    { line: 4, kind: "create_model", note: "Empty Model. The string is a display name (used in log output and MPS/LP file dumps)." },
    { line: 6, kind: "add_var", payload: { name: "x", lb: 0 }, note: "addVar with no bounds defaults to lb=0, ub=GRB.INFINITY, vtype=GRB.CONTINUOUS. All defaults match the LP conventions." },
    { line: 7, kind: "add_var", payload: { name: "y", lb: 0 } },
    { line: 9, kind: "set_objective", payload: { expr: "3x + 5y", sense: "Max" }, note: "setObjective takes an expression and a sense enum. Second call REPLACES the objective, not appends." },
    { line: 11, kind: "add_constraint", payload: { name: "wood", expr: "2x + y <= 8" }, note: "addConstr accepts an expression comparison directly. Named constraints get retrievable by m.getConstrByName('wood')." },
    { line: 12, kind: "add_constraint", payload: { name: "labor", expr: "x + 3y <= 6" } },
    { line: 14, kind: "solve", payload: { status: "OPTIMAL", z: 14.8, vars: { x: 3.6, y: 0.8 }, duals: { wood: 0.8, labor: 1.4 } }, note: "Solve. The status code is exposed as m.Status. 2 = OPTIMAL, 3 = INFEASIBLE, 5 = UNBOUNDED, 9 = TIME_LIMIT." },
    { line: 16, kind: "print", payload: { text: "status : 2" }, note: "Status 2 = GRB.OPTIMAL. Compare with m.Status == GRB.OPTIMAL when writing production code." },
    { line: 17, kind: "print", payload: { text: "z*     : 14.8" } },
    { line: 18, kind: "print", payload: { text: "x*, y* : 3.6 0.8" }, note: "Variable primal values live on v.X (capital X). Other useful attributes: v.RC (reduced cost), v.LB, v.UB (bounds)." },
    { line: 20, kind: "print", payload: { text: "  wood: π = 0.8, slack = 0.0" }, note: "c.Pi is the dual. Slack = RHS − LHS; zero when the constraint binds." },
    { line: 21, kind: "print", payload: { text: "  labor: π = 1.4, slack = 0.0" } },
    { line: 22, kind: "print", payload: { text: "  rc(x) = 0.0, obj range [1.667, 10.0]" }, note: "SAObjLow / SAObjUp are Gurobi-specific: the range within which the CURRENT basis stays optimal if you perturb the objective coefficient." },
    { line: 23, kind: "print", payload: { text: "  rc(y) = 0.0, obj range [1.5, 9.0]" } },
    { line: 25, kind: "print", payload: { text: "  wood: RHS range [4.0, 12.0]" }, note: "SARHSLow / SARHSUp: how far you can move the RHS while keeping the basis unchanged. Multiply by the shadow price to project the new optimal value." },
    { line: 26, kind: "print", payload: { text: "  labor: RHS range [4.0, 24.0]" } },
  ],
};

// ============================================================
// CPLEX (docplex)
// ============================================================
const CPLEX = {
  key: "cplex",
  label: "CPLEX (docplex)",
  color: "#7a3da0",
  code: [
    null,
    "from docplex.mp.model import Model",
    "",
    "m = Model(name='production')",
    "",
    "x = m.continuous_var(name='x', lb=0)",
    "y = m.continuous_var(name='y', lb=0)",
    "",
    "m.maximize(3*x + 5*y)",
    "",
    "wood  = m.add_constraint(2*x + 1*y <= 8, ctname='wood')",
    "labor = m.add_constraint(1*x + 3*y <= 6, ctname='labor')",
    "",
    "sol = m.solve()",
    "",
    "print('status :', m.solve_details.status)",
    "print('z*     :', sol.objective_value)",
    "print('x*, y* :', sol[x], sol[y])",
    "",
    "duals  = m.dual_values([wood, labor])",
    "slacks = m.slack_values([wood, labor])",
    "rcs    = m.reduced_costs([x, y])",
    "for ct, pi, sl in zip([wood, labor], duals, slacks):",
    "    print(f'  {ct.name}: π = {pi}, slack = {sl}')",
    "for v, rc in zip([x, y], rcs):",
    "    print(f'  rc({v.name}) = {rc}')",
    "",
    "sa = m.sensitivity()",
    "print(sa.constraints_rhs([wood, labor]))",
    "print(sa.objective_coefs([x, y]))",
  ],
  events: [
    { line: 1, kind: "import", note: "docplex is IBM's modern object-oriented Python interface. Under the hood it uses the CPLEX C engine; the free 'Community Edition' works up to ~1000 vars/cons." },
    { line: 3, kind: "create_model", note: "Model constructor. name= is display-only; log_output=True streams the engine log; float_precision, checker='off' etc. tune diagnostic behavior." },
    { line: 5, kind: "add_var", payload: { name: "x", lb: 0 }, note: "continuous_var declares a continuous variable. Corresponding factories: binary_var, integer_var, semi_continuous_var (for switch-on-only continuous vars)." },
    { line: 6, kind: "add_var", payload: { name: "y", lb: 0 } },
    { line: 8, kind: "set_objective", payload: { expr: "3x + 5y", sense: "Max" }, note: "m.maximize / m.minimize take the expression directly. Alternative: m.set_objective('max', expr) explicitly." },
    { line: 10, kind: "add_constraint", payload: { name: "wood", expr: "2x + y <= 8" }, note: "add_constraint returns the constraint object. ctname= is the label used later in dual/slack lookups." },
    { line: 11, kind: "add_constraint", payload: { name: "labor", expr: "x + 3y <= 6" } },
    { line: 13, kind: "solve", payload: { status: "OPTIMAL", z: 14.8, vars: { x: 3.6, y: 0.8 }, duals: { wood: 0.8, labor: 1.4 } }, note: "solve() returns a SolveSolution (or None if infeasible). sol.objective_value + sol[var] for primal reads." },
    { line: 15, kind: "print", payload: { text: "status : integer optimal solution" }, note: "solve_details.status is a string. status_code is the numeric CPLEX code. Common statuses: 'optimal', 'infeasible', 'unbounded', 'time_limit'." },
    { line: 16, kind: "print", payload: { text: "z*     : 14.8" } },
    { line: 17, kind: "print", payload: { text: "x*, y* : 3.6 0.8" } },
    { line: 19, kind: "meta", payload: { action: "extract duals" }, note: "docplex requires a LIST of constraints/variables — it returns a parallel list of duals/slacks/reduced-costs. Vectorized rather than per-object attributes." },
    { line: 22, kind: "print", payload: { text: "  wood: π = 0.8, slack = 0.0" } },
    { line: 23, kind: "print", payload: { text: "  labor: π = 1.4, slack = 0.0" } },
    { line: 24, kind: "print", payload: { text: "  rc(x) = 0.0" } },
    { line: 25, kind: "print", payload: { text: "  rc(y) = 0.0" } },
    { line: 27, kind: "meta", payload: { action: "sensitivity" }, note: "m.sensitivity() returns a Sensitivity object exposing RHS ranges, objective-coefficient ranges, and basis diagnostics. Only available after solving an LP." },
    { line: 28, kind: "print", payload: { text: "[(4.0, 12.0), (4.0, 24.0)]" }, note: "RHS ranges for wood and labor. Same interpretation as Gurobi's SARHSLow/SARHSUp." },
    { line: 29, kind: "print", payload: { text: "[(1.667, 10.0), (1.5, 9.0)]" }, note: "Objective-coefficient ranges for x and y." },
  ],
};

const LANGS = [PULP, AMPL, GUROBI, CPLEX];

// ============================================================
// State replay
// ============================================================
function replayState(events, upTo) {
  const s = {
    imports: 0,
    model: null,
    vars: [],
    objective: null,
    constraints: [],
    result: null,
    prints: [],
  };
  for (let i = 0; i <= upTo && i < events.length; i++) {
    const ev = events[i];
    switch (ev.kind) {
      case "import":
        s.imports += 1;
        break;
      case "create_model":
        s.model = "production";
        break;
      case "add_var":
        s.vars.push(ev.payload);
        break;
      case "set_objective":
        s.objective = ev.payload;
        break;
      case "add_constraint":
        s.constraints.push(ev.payload);
        break;
      case "solve":
        s.result = ev.payload;
        break;
      case "print":
        s.prints.push(ev.payload.text);
        break;
      default:
        break;
    }
  }
  return s;
}

// ============================================================
// Main component
// ============================================================
export default function LpSolversDemo() {
  const [tabKey, setTabKey] = useState("pulp");
  const lang = useMemo(() => LANGS.find((l) => l.key === tabKey), [tabKey]);

  const [evIdx, setEvIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(700);

  useEffect(() => {
    setEvIdx(0);
    setRunning(false);
  }, [tabKey]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setEvIdx((k) => {
        if (k + 1 >= lang.events.length) {
          setRunning(false);
          return k;
        }
        return k + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [running, speed, lang.events.length]);

  const stepOnce = useCallback(
    () => setEvIdx((k) => Math.min(lang.events.length - 1, k + 1)),
    [lang.events.length]
  );
  const reset = useCallback(() => {
    setEvIdx(0);
    setRunning(false);
  }, []);

  const ev = lang.events[evIdx];
  const state = useMemo(() => replayState(lang.events, evIdx), [lang, evIdx]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        LP Modelers — Same Problem, Four Languages
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        The classic production-planning LP, written four ways: PuLP,
        AMPL, Gurobi (gurobipy), and CPLEX (docplex). Switch tabs to
        pick a language, then step through the code line-by-line — the
        narration box on the right explains what each line does and the
        state panel shows the model being built up. Numerical results
        are identical across all four.
      </p>

      <div style={problemBox}>
        <Tex block>
          {String.raw`\begin{aligned} \max\;\; & 3 x + 5 y \\ \text{s.t.}\;\; & 2 x + y \le 8 \quad (\text{wood}) \\ & x + 3 y \le 6 \quad (\text{labor}) \\ & x, y \ge 0 \end{aligned}`}
        </Tex>
        <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>
          Optimum: <Tex>{`(x^\\star, y^\\star) = (3.6, 0.8),\\;\\; z^\\star = 14.8`}</Tex>.
          Both constraints binding at the optimum, so slacks and reduced
          costs of both decision variables are zero.
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {LANGS.map((l) => (
          <button
            key={l.key}
            onClick={() => setTabKey(l.key)}
            style={{
              padding: "8px 14px",
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer",
              background: tabKey === l.key ? l.color : "#fff",
              color: tabKey === l.key ? "#fff" : "#222",
              fontWeight: tabKey === l.key ? 700 : 500,
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(440px, 1fr) minmax(420px, 1fr)",
          gap: 22,
          alignItems: "flex-start",
        }}
      >
        <div>
          <CodePanel codeLines={lang.code} highlightedLine={ev?.line || 1} accent={lang.color} />
          <div style={narrationBox}>
            <div
              style={{
                fontSize: 11,
                color: "#777",
                marginBottom: 4,
                fontFamily: "monospace",
              }}
            >
              what this line does
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              {ev?.note || "(no note for this line — keep stepping)"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button
              onClick={stepOnce}
              disabled={evIdx >= lang.events.length - 1}
              style={btnPrimary}
            >
              <StepForward size={16} /> Step
            </button>
            <button
              onClick={() => setRunning((r) => !r)}
              disabled={evIdx >= lang.events.length - 1}
              style={btn}
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? " Pause" : " Run"}
            </button>
            <button onClick={reset} style={btn}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={smallLabel}>
              speed (ms/step): <b>{speed}</b>
            </label>
            <input
              type="range"
              min={150}
              max={1500}
              step={50}
              value={speed}
              onChange={(e) => setSpeed(+e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div
            style={{
              marginTop: 8,
              height: 6,
              background: "#eee",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: lang.color,
                width: `${(100 * (evIdx + 1)) / lang.events.length}%`,
                transition: "width 0.1s",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace", marginTop: 4 }}>
            event {evIdx + 1} / {lang.events.length}
          </div>
        </div>

        <StatePanel state={state} lang={lang} />
      </div>

      <ApiCheatSheet />
      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Code panel with highlighted line
// ============================================================
function CodePanel({ codeLines, highlightedLine, accent }) {
  const lineHeight = 22;
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', Menlo, ui-monospace, monospace",
        fontSize: 13,
        background: "#1f1d1a",
        color: "#e8e2d4",
        padding: "12px 0",
        borderRadius: 8,
        overflow: "hidden",
        lineHeight: `${lineHeight}px`,
        minHeight: codeLines.length * lineHeight + 24,
      }}
    >
      {codeLines.map((line, i) => {
        if (i === 0) return null;
        const active = i === highlightedLine;
        const isBlank = line === "";
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              background: active ? "#3b3526" : "transparent",
              borderLeft: active ? `3px solid ${accent}` : "3px solid transparent",
              minHeight: lineHeight,
            }}
          >
            <span
              style={{
                width: 22,
                color: active ? accent : "#7f7864",
                fontSize: 11,
                userSelect: "none",
              }}
            >
              {active ? "▶" : ""}
            </span>
            <span
              style={{
                width: 28,
                color: "#7f7864",
                textAlign: "right",
                marginRight: 12,
                fontSize: 11,
                userSelect: "none",
              }}
            >
              {i}
            </span>
            <span
              style={{
                color: active ? "#fff8e1" : isBlank ? "#7f7864" : "#e8e2d4",
                whiteSpace: "pre",
              }}
            >
              {line || " "}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// State panel
// ============================================================
function StatePanel({ state, lang }) {
  return (
    <div style={statePanelOuter}>
      <Section title="Imports">
        {state.imports > 0 ? (
          <span style={chip(lang.color)}>
            {state.imports} import{state.imports === 1 ? "" : "s"} loaded
          </span>
        ) : (
          <Empty />
        )}
      </Section>

      <Section title="Model">
        {state.model ? <span style={chip("#0b3da0")}>Model('{state.model}')</span> : <Empty />}
      </Section>

      <Section title="Variables">
        {state.vars.length === 0 ? (
          <Empty />
        ) : (
          state.vars.map((v, i) => (
            <div
              key={i}
              style={{
                marginBottom: 6,
                padding: "5px 10px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 6,
              }}
            >
              <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{v.name}</span>
              <span style={{ marginLeft: 8, fontSize: 11, color: "#666", fontFamily: "monospace" }}>
                lb = {v.lb}
              </span>
            </div>
          ))
        )}
      </Section>

      <Section title="Objective">
        {state.objective ? (
          <div
            style={{
              padding: "6px 10px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            <span style={{ color: "#555", fontSize: 11 }}>{state.objective.sense}</span>
            <div>{state.objective.expr}</div>
          </div>
        ) : (
          <Empty />
        )}
      </Section>

      <Section title="Constraints">
        {state.constraints.length === 0 ? (
          <Empty />
        ) : (
          state.constraints.map((c, i) => (
            <div
              key={i}
              style={{
                marginBottom: 5,
                padding: "5px 10px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              <div>{c.expr}</div>
              <span style={{ color: "#888", fontSize: 11 }}>{c.name}</span>
            </div>
          ))
        )}
      </Section>

      {state.result && (
        <Section title="Solver result">
          <div
            style={{
              background: "#1f1d1a",
              color: "#e8e2d4",
              padding: 10,
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 12,
              lineHeight: 1.55,
            }}
          >
            <RL k="status" v={state.result.status} c="#7dd87d" />
            <RL k="z*" v={state.result.z.toFixed(4)} c="#f5a524" />
            <RL k="x*" v={state.result.vars.x.toFixed(4)} c="#f5a524" />
            <RL k="y*" v={state.result.vars.y.toFixed(4)} c="#f5a524" />
            <div style={{ color: "#7f7864", fontSize: 11, marginTop: 6 }}>duals</div>
            <RL k="π_wood" v={state.result.duals.wood.toFixed(4)} c="#9a4caa" />
            <RL k="π_labor" v={state.result.duals.labor.toFixed(4)} c="#9a4caa" />
          </div>
        </Section>
      )}

      {state.prints.length > 0 && (
        <Section title="Console output">
          <div
            style={{
              background: "#0a0a0a",
              color: "#dadada",
              padding: 10,
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 12,
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
            }}
          >
            {state.prints.map((line, i) => (
              <div key={i}>
                <span style={{ color: "#5a5a5a" }}>{">>> "}</span>
                {line}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "#888",
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
function Empty() {
  return (
    <div
      style={{
        padding: "6px 10px",
        background: "#fff",
        border: "1px dashed #ddd",
        borderRadius: 6,
        color: "#999",
        fontSize: 12,
        fontStyle: "italic",
      }}
    >
      (none yet)
    </div>
  );
}
function chip(color) {
  return {
    display: "inline-block",
    padding: "4px 10px",
    background: color,
    color: "#fff",
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: 600,
  };
}
function RL({ k, v, c }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#7f7864" }}>{k}</span>
      <span style={{ color: c || "#e8e2d4", fontWeight: 600 }}>{v}</span>
    </div>
  );
}

// ============================================================
// API cheat sheet — mapping across the 4 modelers
// ============================================================
function ApiCheatSheet() {
  const ROWS = [
    ["create model", "LpProblem(name, LpMaximize)", "(implicit)", "gp.Model(name)", "Model(name)"],
    ["continuous var ≥ 0", "LpVariable(name, lowBound=0)", "var x >= 0;", "m.addVar(name)", "m.continuous_var(name, lb=0)"],
    ["binary var", "LpVariable(name, cat='Binary')", "var x binary;", "m.addVar(vtype=GRB.BINARY)", "m.binary_var(name)"],
    ["objective", "m += 3*x + 5*y", "maximize p: 3*x + 5*y;", "m.setObjective(3*x+5*y, GRB.MAXIMIZE)", "m.maximize(3*x + 5*y)"],
    ["constraint", "m += 2*x + y <= 8", "s.t. c: 2*x + y <= 8;", "m.addConstr(2*x + y <= 8)", "m.add_constraint(2*x + y <= 8)"],
    ["solve", "m.solve()", "solve;", "m.optimize()", "m.solve()"],
    ["primal value", "x.value()", "x.val", "x.X", "sol[x]"],
    ["objective value", "m.objective.value()", "profit or z.val", "m.ObjVal", "sol.objective_value"],
    ["dual", "c.pi", "c.dual", "c.Pi", "m.dual_values([c])"],
    ["slack", "c.slack", "c.slack", "c.Slack", "m.slack_values([c])"],
    ["reduced cost", "v.dj", "v.rc", "v.RC", "m.reduced_costs([v])"],
    ["RHS sens.", "(N/A)", "c.up / c.down", "c.SARHSLow / .SARHSUp", "m.sensitivity().constraints_rhs(...)"],
    ["obj coef sens.", "(N/A)", "v.up / v.down", "v.SAObjLow / .SAObjUp", "m.sensitivity().objective_coefs(...)"],
  ];
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        API cheat sheet
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", fontFamily: "monospace", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={cellHead}>operation</th>
              <th style={cellHead}>PuLP</th>
              <th style={cellHead}>AMPL</th>
              <th style={cellHead}>gurobipy</th>
              <th style={cellHead}>docplex</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px dotted #eee" }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: 6, fontWeight: j === 0 ? 700 : 400 }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const cellHead = { padding: 6, textAlign: "left", fontWeight: 700, borderBottom: "1px solid #ccc" };
const panel = { background: "#fafafa", border: "1px solid #ddd", borderRadius: 8, padding: 12 };

// ============================================================
// Pedagogical notes
// ============================================================
function PedagogicalNotes() {
  return (
    <div style={{ marginTop: 28, padding: 16, background: "#fff8e1", borderRadius: 10, border: "1px solid #f5d68d" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        <Terminal size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
        Notes for class
      </div>
      <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6, fontSize: 14, color: "#3d2f00" }}>
        <li>
          <b>Same math, different feel.</b> Step through the four
          languages back to back and watch how the SAME model expresses
          itself. PuLP overloads Python's + and ≤; AMPL is a purpose-
          built algebraic language; gurobipy is closest to the underlying
          C API; docplex is object-oriented with vectorized dual/RC
          access.
        </li>
        <li>
          <b>Modeler vs solver.</b> All four wrappers ship the model to a
          backend SOLVER (CBC, HiGHS, Gurobi, CPLEX, …). Modelers own
          syntax and indexing; solvers own the math.
        </li>
        <li>
          <b>Sensitivity is solver-specific.</b> Gurobi and CPLEX both
          expose SARHSLow/SARHSUp-style ranges natively. AMPL relies on
          the underlying solver's ranging (works with Gurobi, CPLEX,
          HiGHS). PuLP historically doesn't — you can either drop down
          to the raw solver, or re-solve with perturbed RHS to
          approximate.
        </li>
        <li>
          <b>Pick PuLP for teaching, PROOF-OF-CONCEPT.</b> Free, one pip
          install, embedded CBC — perfect for homework and quick
          experiments.
        </li>
        <li>
          <b>Pick AMPL when structure dominates.</b> If your model has
          hundreds of indexed sets and thousands of constraint families,
          AMPL's set/param/subscript machinery reads much more clearly
          than dictionary-of-dictionary Python.
        </li>
        <li>
          <b>Pick Gurobi/CPLEX in production.</b> Both offer warm starts,
          callbacks, tuning tools, and sensitivity attributes that PuLP
          and AMPL don't expose. Free for academics, paid for commercial.
        </li>
      </ul>
    </div>
  );
}

// ============================================================
// Style atoms
// ============================================================
const problemBox = {
  marginBottom: 16,
  padding: "12px 16px",
  background: "#f6f4ee",
  border: "1px solid #ece8dd",
  borderRadius: 8,
};
const btn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#f7f7f7",
  cursor: "pointer",
  fontWeight: 500,
};
const btnPrimary = { ...btn, background: "#111", color: "#fff", border: "1px solid #111" };
const narrationBox = {
  marginTop: 14,
  padding: "12px 16px",
  background: "#f4efe6",
  borderRadius: 8,
  border: "1px solid #ddd",
};
const smallLabel = {
  display: "block",
  fontSize: 12,
  color: "#444",
  marginBottom: 4,
  fontFamily: "monospace",
};
const statePanelOuter = {
  background: "#fafafa",
  border: "1px solid #eee",
  borderRadius: 8,
  padding: 14,
};
