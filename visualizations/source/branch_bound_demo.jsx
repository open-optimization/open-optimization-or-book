import React, { useState, useMemo, useEffect } from "react";
import { StepForward, RotateCcw, Terminal, ChevronLeft } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   BRANCH-AND-BOUND TREE EXPLORER
   ISE 5406

   Pre-compute the entire B&B tree for several small MILP
   presets and let the user step through it node-by-node.
   Each step splits into sub-events: visit -> solve LP ->
   classify (fathom/branch) -> create children. The tree shows
   primal/dual bounds, fathoming reasons, and the branching
   decomposition (parent's relaxation + child constraints).
   ============================================================ */

// ============================================================
// Preset MILPs.
//   solver: a closure that solves max c^T x subject to the
//           preset's constraints AND extra integer-bounds.
//   varNames: TeX names for variables (used in node detail
//             and on tree edges)
// ============================================================
const PRESETS = [
  {
    key: "tworesource",
    name: "Two-resource MILP (most fractional)",
    blurb:
      "A gentle first example: the root LP is fractional, one branching splits the region in two, and each child's LP lands on an integer point. Watch how the branch throws away the strip between x = 2 and x = 3 (which contains no integer points) without losing any feasible integer solution.",
    varNames: ["x", "y"],
    nVars: 2,
    objTeX: String.raw`\max\;\; 5.5\,x + 4\,y`,
    constraintsTeX: String.raw`2x + y \le 7,\;\; x + 2y \le 6,\;\; x, y \ge 0,\;\; x, y \in \mathbb{Z}`,
    lpOptTeX: String.raw`(8/3,\; 5/3) \approx (2.667,\; 1.667),\;\; \text{obj} \approx 21.333`,
    ipOptTeX: String.raw`(3, 1),\;\; \text{obj} = 20.5`,
    plotRange: { xmin: -0.3, xmax: 4.0, ymin: -0.3, ymax: 4.0, ticks: [0, 1, 2, 3, 4] },
    constraintsForPlot: [
      { a: 2, b: 1, rhs: 7, label: "2x+y=7" },
      { a: 1, b: 2, rhs: 6, label: "x+2y=6" },
    ],
    solver: makeSolver2D({
      c: [5.5, 4],
      lines: [
        [2, 1, 7],
        [1, 2, 6],
      ],
      ineq: (x, y) => 2 * x + y <= 7 + 1e-9 && x + 2 * y <= 6 + 1e-9,
      objNames: ["x", "y"],
    }),
  },
  {
    key: "knapsack",
    name: "0/1 knapsack (4 items)",
    blurb:
      "A small 0/1 knapsack: pick a subset of 4 items to maximize value subject to a weight cap. With binary variables every branch fixes a variable to 0 or 1, so you watch the search tree explore subsets. The LP relaxation drops items fractionally; B&B fathoms branches whose LP bound can't beat the incumbent.",
    varNames: ["x_1", "x_2", "x_3", "x_4"],
    nVars: 4,
    objTeX: String.raw`\max\;\; 16\,x_1 + 19\,x_2 + 23\,x_3 + 28\,x_4`,
    constraintsTeX: String.raw`2 x_1 + 3 x_2 + 4 x_3 + 5 x_4 \le 7,\;\; x_j \in \{0,1\}`,
    lpOptTeX: String.raw`x = (1, 1, 0.5, 0),\;\; \text{obj} = 46.5`,
    ipOptTeX: String.raw`x = (0, 0, 0, 1)\text{ or }(1, 0, 0, 1)\dots`,
    solver: makeKnapsackSolver({
      values: [16, 19, 23, 28],
      weights: [2, 3, 4, 5],
      capacity: 7,
    }),
  },
  {
    key: "deep_branching",
    name: "Deeper tree (multiple branchings)",
    blurb:
      "A tighter MILP where the search really works: 11 nodes, 5 branchings, and a tree 4 levels deep. You will see all three fathoming rules fire (two LP-infeasible nodes, three fathomed by bound) before the incumbent (2, 2) with value 14 is proved optimal.",
    varNames: ["x", "y"],
    nVars: 2,
    objTeX: String.raw`\max\;\; 4\,x + 3\,y`,
    constraintsTeX: String.raw`6x + 4y \le 21,\;\; 2x + 3y \le 12,\;\; x, y \ge 0,\;\; x, y \in \mathbb{Z}`,
    lpOptTeX: String.raw`(1.5,\; 3),\;\; \text{obj} = 15`,
    ipOptTeX: String.raw`(2, 2),\;\; \text{obj} = 14`,
    plotRange: { xmin: -0.3, xmax: 4.2, ymin: -0.3, ymax: 4.5, ticks: [0, 1, 2, 3, 4] },
    constraintsForPlot: [
      { a: 6, b: 4, rhs: 21, label: "6x+4y=21" },
      { a: 2, b: 3, rhs: 12, label: "2x+3y=12" },
    ],
    solver: makeSolver2D({
      c: [4, 3],
      lines: [
        [6, 4, 21],
        [2, 3, 12],
      ],
      ineq: (x, y) => 6 * x + 4 * y <= 21 + 1e-9 && 2 * x + 3 * y <= 12 + 1e-9,
      objNames: ["x", "y"],
    }),
  },
  {
    key: "infeasible_demo",
    name: "Infeasibility + integrality",
    blurb:
      "A problem where one B&B branch becomes LP-infeasible (the new bound clashes with the constraints) — fathomed by infeasibility — while another branch's LP relaxation is integer at the first try, giving immediate fathom-by-integrality. Hits all three fathoming rules in a tiny tree.",
    varNames: ["x", "y"],
    nVars: 2,
    objTeX: String.raw`\max\;\; 3\,x + 2\,y`,
    constraintsTeX: String.raw`x + y \le 4.5,\;\; x \le 3.5,\;\; y \le 3.5,\;\; x, y \ge 0,\;\; x, y \in \mathbb{Z}`,
    lpOptTeX: String.raw`(3.5,\; 1),\;\; \text{obj} = 12.5`,
    ipOptTeX: String.raw`(3, 1),\;\; \text{obj} = 11`,
    plotRange: { xmin: -0.3, xmax: 4.5, ymin: -0.3, ymax: 4.5, ticks: [0, 1, 2, 3, 4] },
    constraintsForPlot: [
      { a: 1, b: 1, rhs: 4.5, label: "x+y=4.5" },
    ],
    solver: makeSolver2D({
      c: [3, 2],
      lines: [
        [1, 1, 4.5],
        [1, 0, 3.5],
        [0, 1, 3.5],
      ],
      ineq: (x, y) =>
        x + y <= 4.5 + 1e-9 && x <= 3.5 + 1e-9 && y <= 3.5 + 1e-9,
      objNames: ["x", "y"],
    }),
  },
];

// ============================================================
// 2-D LP solver factory: enumerate vertex intersections.
// ============================================================
function makeSolver2D({ c, lines, ineq }) {
  return function solveLP(extraBounds) {
    const { lo, hi } = extraBounds;
    const allLines = [
      ...lines,
      [1, 0, lo[0]],
      [1, 0, hi[0]],
      [0, 1, lo[1]],
      [0, 1, hi[1]],
    ];
    const vertices = [];
    for (let i = 0; i < allLines.length; i++) {
      for (let j = i + 1; j < allLines.length; j++) {
        const [a1, b1, c1] = allLines[i];
        const [a2, b2, c2] = allLines[j];
        const det = a1 * b2 - a2 * b1;
        if (Math.abs(det) < 1e-9) continue;
        const x = (c1 * b2 - c2 * b1) / det;
        const y = (a1 * c2 - a2 * c1) / det;
        if (
          ineq(x, y) &&
          x >= lo[0] - 1e-9 &&
          x <= hi[0] + 1e-9 &&
          y >= lo[1] - 1e-9 &&
          y <= hi[1] + 1e-9
        ) {
          vertices.push({ x, y });
        }
      }
    }
    if (vertices.length === 0) return { feasible: false };
    let best = vertices[0];
    let bestVal = c[0] * best.x + c[1] * best.y;
    for (const v of vertices) {
      const val = c[0] * v.x + c[1] * v.y;
      if (val > bestVal + 1e-9) {
        bestVal = val;
        best = v;
      }
    }
    return {
      feasible: true,
      x: [best.x, best.y],
      obj: bestVal,
      vertices,
    };
  };
}

// ============================================================
// Knapsack LP solver: greedy by value/weight ratio.
// Bounds: lo/hi are arrays of length n with values in {0,1}
// or open (lo = 0, hi = 1).
// ============================================================
function makeKnapsackSolver({ values, weights, capacity }) {
  const n = values.length;
  return function solveLP(extraBounds) {
    const { lo, hi } = extraBounds;
    let cap = capacity;
    const xv = new Array(n).fill(0);
    let obj = 0;
    // Forced-in (lo[i] = 1) items
    for (let i = 0; i < n; i++) {
      if (lo[i] >= 0.999) {
        xv[i] = 1;
        obj += values[i];
        cap -= weights[i];
      }
    }
    if (cap < -1e-9) return { feasible: false };
    // Free items: greedy by value/weight, fractional fill at the end.
    const free = [];
    for (let i = 0; i < n; i++) {
      if (lo[i] < 0.001 && hi[i] > 0.999) free.push(i);
    }
    free.sort((a, b) => values[b] / weights[b] - values[a] / weights[a]);
    for (const i of free) {
      if (weights[i] <= cap + 1e-9) {
        xv[i] = 1;
        obj += values[i];
        cap -= weights[i];
      } else if (cap > 1e-9) {
        const f = cap / weights[i];
        xv[i] = f;
        obj += values[i] * f;
        cap = 0;
      } else {
        xv[i] = 0;
      }
    }
    return { feasible: true, x: xv, obj };
  };
}

function isInteger(v) {
  return Math.abs(v - Math.round(v)) < 1e-6;
}

// ============================================================
// Build the B&B tree for a preset.
//   - Best-first by parent's LP value (queue resorted each pop).
//   - Branch on most-fractional variable.
//   - For knapsack, branching on x_j means floor=0 / ceil=1.
//   - Events list contains FINER-GRAINED steps:
//       visit -> lp_solved -> classify -> branch_create
//     so a user can step through each phase.
// ============================================================
function buildTree(preset) {
  const nVars = preset.nVars;
  const initLo = new Array(nVars).fill(0);
  const initHi = preset.key === "knapsack"
    ? new Array(nVars).fill(1)
    : new Array(nVars).fill(Infinity);

  let nextId = 0;
  const ROOT = {
    id: nextId++,
    parent: null,
    branchInfo: null,
    lo: initLo,
    hi: initHi,
    depth: 0,
  };
  const nodes = [ROOT];
  const queue = [0];
  let incumbentObj = -Infinity;
  let incumbentX = null;
  let incumbentNode = null;
  const events = [];

  events.push({
    action: "init",
    nodeId: 0,
    msg: "Initialize search at root. No integer cuts yet.",
  });

  while (queue.length > 0) {
    // Best-first: pop node whose PARENT had highest LP (fall back to insertion order).
    queue.sort((a, b) => {
      const na = nodes[a], nb = nodes[b];
      const va = na.parent != null ? (nodes[na.parent].lpObj ?? -Infinity) : Infinity;
      const vb = nb.parent != null ? (nodes[nb.parent].lpObj ?? -Infinity) : Infinity;
      return vb - va;
    });
    const id = queue.shift();
    const node = nodes[id];

    events.push({ action: "visit", nodeId: id });

    const lp = preset.solver({ lo: node.lo, hi: node.hi });
    node.lp = lp;

    if (!lp.feasible) {
      node.status = "infeasible";
      events.push({ action: "lp_solved", nodeId: id, feasible: false });
      events.push({ action: "fathom_infeasible", nodeId: id });
      continue;
    }

    node.lpObj = lp.obj;
    node.lpX = lp.x;
    events.push({ action: "lp_solved", nodeId: id, feasible: true, obj: lp.obj, x: lp.x });

    // Fathom by bound?
    if (lp.obj <= incumbentObj + 1e-9) {
      node.status = "fathomed_bound";
      events.push({
        action: "fathom_bound",
        nodeId: id,
        lpObj: lp.obj,
        incumbent: incumbentObj,
      });
      continue;
    }

    // Integer-feasible?
    const allInt = lp.x.every((v) => isInteger(v));
    if (allInt) {
      node.status = "integer";
      const roundedX = lp.x.map((v) => Math.round(v));
      events.push({
        action: "integer_found",
        nodeId: id,
        obj: lp.obj,
        x: roundedX,
        beatsIncumbent: lp.obj > incumbentObj,
        prevIncumbent: incumbentObj,
      });
      if (lp.obj > incumbentObj) {
        incumbentObj = lp.obj;
        incumbentX = roundedX;
        incumbentNode = id;
        node.becameIncumbent = true;
      }
      continue;
    }

    // Branch on most-fractional variable
    let bestK = -1, bestFrac = -1;
    for (let k = 0; k < nVars; k++) {
      const f = Math.abs(lp.x[k] - Math.round(lp.x[k]));
      if (f > bestFrac && f > 1e-6) {
        bestFrac = f;
        bestK = k;
      }
    }
    const branchVar = bestK;
    const branchVal = lp.x[branchVar];
    const lo = Math.floor(branchVal);
    const hi = Math.ceil(branchVal);
    node.branchVar = branchVar;
    node.branchVal = branchVal;
    node.status = "branched";

    const left = {
      id: nextId++,
      parent: id,
      branchInfo: { var: branchVar, op: "<=", val: lo },
      lo: [...node.lo],
      hi: [...node.hi],
      depth: node.depth + 1,
    };
    left.hi[branchVar] = lo;
    const right = {
      id: nextId++,
      parent: id,
      branchInfo: { var: branchVar, op: ">=", val: hi },
      lo: [...node.lo],
      hi: [...node.hi],
      depth: node.depth + 1,
    };
    right.lo[branchVar] = hi;
    nodes.push(left, right);
    node.children = [left.id, right.id];
    events.push({
      action: "branch_create",
      nodeId: id,
      leftId: left.id,
      rightId: right.id,
      var: branchVar,
      val: branchVal,
      loVal: lo,
      hiVal: hi,
    });
    queue.push(left.id, right.id);
  }
  return { nodes, events, incumbent: { obj: incumbentObj, x: incumbentX, fromNode: incumbentNode } };
}

// Cache trees by preset key so re-rendering doesn't rebuild.
const TREE_CACHE = {};
function getTree(presetKey) {
  if (!TREE_CACHE[presetKey]) {
    const p = PRESETS.find((x) => x.key === presetKey);
    TREE_CACHE[presetKey] = { preset: p, ...buildTree(p) };
  }
  return TREE_CACHE[presetKey];
}

// ============================================================
// Main component
// ============================================================
export default function BranchBoundDemo() {
  const [presetKey, setPresetKey] = useState(PRESETS[0].key);
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState(0);

  const tree = useMemo(() => getTree(presetKey), [presetKey]);
  const preset = tree.preset;

  // Reset step + selection when preset changes
  useEffect(() => {
    setStep(0);
    setSelectedId(0);
  }, [presetKey]);

  const totalSteps = tree.events.length - 1;
  const stepEvent = tree.events[Math.min(step, totalSteps)];

  // Visible nodes: any node referenced in events up to current step.
  const visibleNodes = useMemo(() => {
    const ids = new Set();
    for (let i = 0; i <= step && i < tree.events.length; i++) {
      const ev = tree.events[i];
      if (ev.nodeId != null) ids.add(ev.nodeId);
      if (ev.leftId != null) ids.add(ev.leftId);
      if (ev.rightId != null) ids.add(ev.rightId);
    }
    return ids;
  }, [step, tree]);

  // Track incumbent up to current step.
  const incumbent = useMemo(() => {
    let best = { obj: -Infinity, x: null, fromNode: null };
    for (let i = 0; i <= step && i < tree.events.length; i++) {
      const ev = tree.events[i];
      if (ev.action === "integer_found" && ev.obj > best.obj) {
        best = { obj: ev.obj, x: ev.x, fromNode: ev.nodeId };
      }
    }
    return best;
  }, [step, tree]);

  // Dual bound: max LP-obj over OPEN visible leaves (not fathomed, not yet branched).
  const dualBound = useMemo(() => {
    let maxOpen = -Infinity;
    tree.nodes.forEach((n, idx) => {
      if (!visibleNodes.has(idx)) return;
      if (n.lpObj == null) return;
      // Was the LP for this node already SOLVED at this step?
      let lpSolvedByNow = false;
      let classifiedByNow = null;
      for (let i = 0; i <= step && i < tree.events.length; i++) {
        const ev = tree.events[i];
        if (ev.nodeId !== idx) continue;
        if (ev.action === "lp_solved") lpSolvedByNow = true;
        if (
          ev.action === "fathom_bound" ||
          ev.action === "fathom_infeasible" ||
          ev.action === "integer_found" ||
          ev.action === "branch_create"
        ) {
          classifiedByNow = ev.action;
        }
      }
      if (!lpSolvedByNow) return;
      if (classifiedByNow === "fathom_bound" || classifiedByNow === "fathom_infeasible") return;
      // For branched nodes, replace by children's LP (when those are solved).
      if (classifiedByNow === "branch_create") {
        const childrenSolved =
          n.children &&
          n.children.every((cid) => {
            for (let i = 0; i <= step && i < tree.events.length; i++) {
              const ev = tree.events[i];
              if (ev.nodeId === cid && ev.action === "lp_solved") return true;
            }
            return false;
          });
        if (childrenSolved) return;
      }
      if (n.lpObj > maxOpen) maxOpen = n.lpObj;
    });
    return maxOpen;
  }, [step, visibleNodes, tree]);

  // Follow the action: when stepping, select the node the event refers to.
  React.useEffect(() => {
    if (stepEvent && stepEvent.nodeId != null) setSelectedId(stepEvent.nodeId);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedNode = tree.nodes[selectedId] || tree.nodes[0];

  // Has the selected node's branching already happened by the current step?
  const branchShown = useMemo(() => {
    if (!selectedNode.children) return false;
    for (let i = 0; i <= step && i < tree.events.length; i++) {
      const ev = tree.events[i];
      if (ev.action === "branch_create" && ev.nodeId === selectedNode.id) return true;
    }
    return false;
  }, [step, selectedNode, tree]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Branch-and-Bound Tree Explorer
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        Watch a small MILP get solved by branch-and-bound. Each step is one
        atomic phase: <i>visit</i> a node, <i>solve its LP</i>, <i>classify</i> it
        (fathom or branch), and <i>create children</i>. Click any node in the
        tree to inspect its LP relaxation, the bounds inherited from its
        parent, and the constraint added on the edge into it.
      </p>

      <PresetPicker presetKey={presetKey} setPresetKey={setPresetKey} />

      <ProblemBox preset={preset} />

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step <= 0}
          style={btn}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
          disabled={step >= totalSteps}
          style={btnPrimary}
        >
          <StepForward size={16} /> Next event
        </button>
        <button
          onClick={() => setStep(totalSteps)}
          disabled={step >= totalSteps}
          style={btn}
        >
          run to end
        </button>
        <button onClick={() => setStep(0)} style={btn}>
          <RotateCcw size={16} /> Reset
        </button>
        <span style={{ alignSelf: "center", fontSize: 12, fontFamily: "monospace", color: "#666" }}>
          event {step} / {totalSteps}
        </span>
      </div>

      <div style={eventBox}>
        <EventDescription ev={stepEvent} tree={tree} preset={preset} />
      </div>

      <BoundProgressBar incumbent={incumbent} dualBound={dualBound} preset={preset} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: preset.nVars === 2
            ? "minmax(440px, 1fr) minmax(420px, 1fr)"
            : "minmax(360px, 0.8fr) minmax(520px, 1.2fr)",
          gap: 22,
          alignItems: "flex-start",
        }}
      >
        {preset.nVars === 2 ? (
          <FeasibleRegionPlot node={selectedNode} incumbent={incumbent} preset={preset} branchShown={branchShown} />
        ) : (
          <KnapsackBoundsPanel node={selectedNode} preset={preset} />
        )}
        <TreeView
          tree={tree}
          visibleNodes={visibleNodes}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          incumbent={incumbent}
          dualBound={dualBound}
          preset={preset}
        />
      </div>

      <BranchingDecomposition node={selectedNode} tree={tree} preset={preset} />

      <NodeDetail node={selectedNode} preset={preset} />

      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Preset picker
// ============================================================
function PresetPicker({ presetKey, setPresetKey }) {
  const preset = PRESETS.find((p) => p.key === presetKey);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase" }}>
        examples — click one to load
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPresetKey(p.key)}
            style={{
              padding: "8px 14px",
              border: presetKey === p.key ? "1px solid #1f4e3d" : "1px solid #ccc",
              borderRadius: 6,
              background: presetKey === p.key ? "#1f4e3d" : "#fff",
              color: presetKey === p.key ? "#fff" : "#222",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
      {preset && (
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5, padding: "8px 12px", background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 6, marginTop: 6 }}>
          <b>{preset.name}.</b> {preset.blurb}
        </div>
      )}
    </div>
  );
}

function ProblemBox({ preset }) {
  return (
    <div style={problemBox}>
      <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Problem</div>
      <Tex block>{preset.objTeX + String.raw`\quad \text{s.t.} \quad ` + preset.constraintsTeX}</Tex>
      <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
        Continuous LP optimum: <Tex>{preset.lpOptTeX}</Tex>. Integer optimum:{" "}
        <Tex>{preset.ipOptTeX}</Tex>.
      </div>
    </div>
  );
}

// ============================================================
// Bound progress bar — shows incumbent ↑ and dual ↓ converging.
// ============================================================
function BoundProgressBar({ incumbent, dualBound, preset }) {
  const W = 720, H = 60;
  const padL = 60, padR = 60, padT = 6, padB = 22;
  const chartW = W - padL - padR;
  const lo = incumbent.obj === -Infinity ? 0 : incumbent.obj;
  const hi = dualBound === -Infinity ? 1 : dualBound;
  const span = Math.max(1, hi - lo);
  const lo2 = lo - 0.15 * span;
  const hi2 = hi + 0.15 * span;
  const xs = (v) => padL + ((v - lo2) / (hi2 - lo2)) * chartW;
  const gap =
    incumbent.obj === -Infinity || dualBound === -Infinity
      ? null
      : ((dualBound - incumbent.obj) / Math.max(0.01, Math.abs(incumbent.obj))) * 100;

  return (
    <div style={{ ...panel, marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontFamily: "monospace", color: "#444", marginBottom: 4 }}>
        bounds:{" "}
        <span style={{ color: "#a37300", fontWeight: 700 }}>
          primal = {incumbent.obj === -Infinity ? "−∞" : incumbent.obj.toFixed(3)}
        </span>
        {"   "}
        <span style={{ color: "#0b3da0", fontWeight: 700 }}>
          dual = {dualBound === -Infinity ? "+∞" : dualBound.toFixed(3)}
        </span>
        {"   gap = "}
        <span style={{ fontWeight: 700 }}>{gap == null ? "—" : `${gap.toFixed(2)}%`}</span>
      </div>
      <svg width={W} height={H}>
        <line x1={padL} y1={H / 2} x2={padL + chartW} y2={H / 2} stroke="#ddd" strokeWidth={2} />
        {incumbent.obj !== -Infinity && (
          <>
            <polygon
              points={`${xs(incumbent.obj)},${H / 2} ${xs(incumbent.obj) - 7},${H / 2 - 12} ${xs(incumbent.obj) + 7},${H / 2 - 12}`}
              fill="#f5a524"
              stroke="#a37300"
            />
            <text x={xs(incumbent.obj)} y={H / 2 + 18} textAnchor="middle" fontSize={11} fontFamily="monospace" fill="#a37300">
              {incumbent.obj.toFixed(2)}
            </text>
          </>
        )}
        {dualBound !== -Infinity && (
          <>
            <polygon
              points={`${xs(dualBound)},${H / 2} ${xs(dualBound) - 7},${H / 2 + 12} ${xs(dualBound) + 7},${H / 2 + 12}`}
              fill="#0b3da0"
              stroke="#062a73"
            />
            <text x={xs(dualBound)} y={H / 2 - 6} textAnchor="middle" fontSize={11} fontFamily="monospace" fill="#0b3da0">
              {dualBound.toFixed(2)}
            </text>
          </>
        )}
        {incumbent.obj !== -Infinity && dualBound !== -Infinity && (
          <line
            x1={xs(incumbent.obj)}
            x2={xs(dualBound)}
            y1={H / 2}
            y2={H / 2}
            stroke="#888"
            strokeWidth={4}
          />
        )}
        <text x={padL - 6} y={H / 2 + 4} textAnchor="end" fontSize={10} fontFamily="monospace" fill="#a37300">
          primal
        </text>
        <text x={padL + chartW + 6} y={H / 2 + 4} fontSize={10} fontFamily="monospace" fill="#0b3da0">
          dual
        </text>
      </svg>
    </div>
  );
}

// ============================================================
// Event description (for the per-step yellow callout).
// ============================================================
function EventDescription({ ev, tree, preset }) {
  if (!ev) return null;
  const varName = (k) => preset.varNames[k];
  if (ev.action === "init") {
    return (
      <span>
        <b>Step 0 — Initialize.</b> Place the root node (id 0) on the queue
        with no integer cuts applied. We have not solved any LP yet.
      </span>
    );
  }
  if (ev.action === "visit") {
    const node = tree.nodes[ev.nodeId];
    return (
      <span>
        <b>Visit node {ev.nodeId}.</b> Pop it from the queue (best-first by
        parent's LP value). Bounds inherited from ancestors:{" "}
        <NodeBoundsTeX node={node} preset={preset} />.
      </span>
    );
  }
  if (ev.action === "lp_solved") {
    if (!ev.feasible) {
      return (
        <span>
          <b>Solve LP at node {ev.nodeId}.</b> The relaxation is{" "}
          <b style={{ color: "#888" }}>infeasible</b> — the integer cuts collide
          with the constraints.
        </span>
      );
    }
    return (
      <span>
        <b>Solve LP at node {ev.nodeId}.</b> Relaxation optimum:{" "}
        <Tex>{`(${ev.x.map((v) => fmt(v)).join(", ")})`}</Tex>, objective{" "}
        <Tex>{`= ${ev.obj.toFixed(3)}`}</Tex>.
      </span>
    );
  }
  if (ev.action === "fathom_infeasible") {
    return (
      <span>
        <b>Fathom by infeasibility</b> at node {ev.nodeId}. No integer feasible
        point in this branch — close it.
      </span>
    );
  }
  if (ev.action === "fathom_bound") {
    return (
      <span>
        <b>Fathom by bound</b> at node {ev.nodeId}. LP bound{" "}
        <Tex>{`${ev.lpObj.toFixed(3)}`}</Tex>{" "}
        <Tex>{String.raw`\le`}</Tex> incumbent{" "}
        <Tex>{`${ev.incumbent === -Infinity ? "-\\infty" : ev.incumbent.toFixed(3)}`}</Tex>{" "}
        — every integer point in this subtree is dominated. Close it.
      </span>
    );
  }
  if (ev.action === "integer_found") {
    return (
      <span>
        <b>Fathom by integrality</b> at node {ev.nodeId}. The LP optimum is
        already integer:{" "}
        <Tex>{`(${ev.x.join(", ")})`}</Tex> with{" "}
        <Tex>{`\\text{obj} = ${ev.obj.toFixed(3)}`}</Tex>.{" "}
        {ev.beatsIncumbent ? (
          <>
            This <b style={{ color: "#a37300" }}>improves the incumbent</b>{" "}
            (was{" "}
            {ev.prevIncumbent === -Infinity ? (
              <Tex>{String.raw`-\infty`}</Tex>
            ) : (
              <Tex>{`${ev.prevIncumbent.toFixed(3)}`}</Tex>
            )}
            ).
          </>
        ) : (
          <>It does not beat the incumbent — discard.</>
        )}
      </span>
    );
  }
  if (ev.action === "branch_create") {
    const v = varName(ev.var);
    return (
      <span>
        <b>Branch from node {ev.nodeId}.</b> Variable{" "}
        <Tex>{`${v} = ${ev.val.toFixed(3)}`}</Tex> is fractional — create
        children:{" "}
        <Tex>{`${v} \\le ${ev.loVal}`}</Tex> (node {ev.leftId}) and{" "}
        <Tex>{`${v} \\ge ${ev.hiVal}`}</Tex> (node {ev.rightId}). Push both
        onto the queue.
      </span>
    );
  }
  return null;
}

function fmt(v) {
  if (Math.abs(v - Math.round(v)) < 1e-6) return String(Math.round(v));
  return v.toFixed(3);
}

// Render the per-node integer bounds in TeX.
function NodeBoundsTeX({ node, preset }) {
  if (node.id === 0) return <Tex>{String.raw`\text{(no cuts)}`}</Tex>;
  const parts = [];
  for (let k = 0; k < preset.nVars; k++) {
    const v = preset.varNames[k];
    const lo = node.lo[k];
    const hi = node.hi[k];
    const isKnap = preset.key === "knapsack";
    const defaultLo = 0;
    const defaultHi = isKnap ? 1 : Infinity;
    if (lo > defaultLo + 1e-9 || (Number.isFinite(hi) && hi < defaultHi - 1e-9)) {
      const loStr = lo > defaultLo + 1e-9 ? `${lo} \\le ` : "";
      const hiStr =
        Number.isFinite(hi) && hi < defaultHi - 1e-9 ? ` \\le ${hi}` : "";
      parts.push(`${loStr}${v}${hiStr}`);
    }
  }
  if (parts.length === 0) return <Tex>{String.raw`\text{(no cuts)}`}</Tex>;
  return <Tex>{parts.join(",\\;\\;")}</Tex>;
}

// ============================================================
// Branching decomposition — explicit display of parent's
// relaxation (with its LP optimum) and the cut added on the
// chosen edge to reach the selected node.
// ============================================================
function BranchingDecomposition({ node, tree, preset }) {
  if (node.id === 0) {
    return (
      <div style={{ ...decompBox, marginTop: 14 }}>
        <div style={decompTitle}>Branching decomposition</div>
        <div style={{ fontSize: 13, color: "#444" }}>
          Node 0 is the <b>root</b> — no parent, no branching cut applied yet.
          Step forward to see the first branch.
        </div>
      </div>
    );
  }
  const parent = tree.nodes[node.parent];
  const sibId = parent.children.find((c) => c !== node.id);
  const sib = sibId != null ? tree.nodes[sibId] : null;
  const v = preset.varNames[parent.branchVar];
  const lo = Math.floor(parent.branchVal);
  const hi = Math.ceil(parent.branchVal);

  return (
    <div style={{ ...decompBox, marginTop: 14 }}>
      <div style={decompTitle}>Branching decomposition into node {node.id}</div>
      <div style={{ fontSize: 13, lineHeight: 1.7 }}>
        <div>
          <span style={{ fontWeight: 600 }}>Parent (node {parent.id}) LP:</span>{" "}
          <Tex>{`(${parent.lpX.map((u) => fmt(u)).join(", ")}),\\; \\text{obj} = ${parent.lpObj.toFixed(3)}`}</Tex>.
          {" "}
          Variable <Tex>{`${v} = ${parent.branchVal.toFixed(3)}`}</Tex> is{" "}
          fractional — chosen as the branching variable (most-fractional rule).
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <ChildBox
            label={`Left child (node ${parent.children[0]})`}
            cutTeX={`${v} \\le ${lo}`}
            highlight={node.id === parent.children[0]}
          />
          <ChildBox
            label={`Right child (node ${parent.children[1]})`}
            cutTeX={`${v} \\ge ${hi}`}
            highlight={node.id === parent.children[1]}
          />
        </div>
        <div style={{ marginTop: 10, fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>This node's relaxation:</span>{" "}
          parent's LP{" "}
          <Tex>{String.raw`\;\cup\;`}</Tex>{" "}
          <Tex>{`\\{${node.id === parent.children[0] ? `${v} \\le ${lo}` : `${v} \\ge ${hi}`}\\}`}</Tex>.
          {sib && sib.lpObj != null && (
            <>
              {" "}Sibling (node {sib.id}) gets the opposite cut{" "}
              <Tex>{`${node.id === parent.children[0] ? `${v} \\ge ${hi}` : `${v} \\le ${lo}`}`}</Tex>.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ChildBox({ label, cutTeX, highlight }) {
  return (
    <div
      style={{
        flex: "1 1 200px",
        padding: "8px 12px",
        background: highlight ? "#e8f5e9" : "#fff",
        border: highlight ? "2px solid #1f4e3d" : "1px solid #ddd",
        borderRadius: 6,
      }}
    >
      <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
        {label}
      </div>
      <div>
        cut added: <Tex>{cutTeX}</Tex>
      </div>
    </div>
  );
}

// ============================================================
// 2-D feasible region plot
// ============================================================
function FeasibleRegionPlot({ node, incumbent, preset, branchShown }) {
  const W = 480, H = 480;
  const padL = 50, padR = 16, padT = 18, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const { xmin, xmax, ymin, ymax, ticks } = preset.plotRange;
  const xs = (x) => padL + ((x - xmin) / (xmax - xmin)) * chartW;
  const ys = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * chartH;

  const lp = node.lp || preset.solver({ lo: node.lo, hi: node.hi });
  let polyPts = [];
  if (lp.feasible) {
    const cx = lp.vertices.reduce((s, v) => s + v.x, 0) / lp.vertices.length;
    const cy = lp.vertices.reduce((s, v) => s + v.y, 0) / lp.vertices.length;
    polyPts = [...lp.vertices].sort(
      (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
    );
  }

  // Lattice points in the visible range
  const lattice = [];
  const iMax = Math.floor(xmax);
  const jMax = Math.floor(ymax);
  for (let i = 0; i <= iMax; i++) {
    for (let j = 0; j <= jMax; j++) {
      lattice.push({ x: i, y: j });
    }
  }
  const xMaxTick = iMax;
  const yMaxTick = jMax;

  return (
    <div style={panel}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        Node {node.id}: LP relaxation
      </div>
      <svg width={W} height={H}>
        <line x1={padL} y1={ys(0)} x2={padL + chartW} y2={ys(0)} stroke="#bbb" />
        <line x1={xs(0)} y1={padT} x2={xs(0)} y2={padT + chartH} stroke="#bbb" />
        {ticks.filter((v) => v > 0).map((v) => (
          <React.Fragment key={v}>
            <line x1={xs(v)} y1={padT} x2={xs(v)} y2={padT + chartH} stroke="#eee" strokeDasharray="2,3" />
            <line x1={padL} y1={ys(v)} x2={padL + chartW} y2={ys(v)} stroke="#eee" strokeDasharray="2,3" />
          </React.Fragment>
        ))}

        {polyPts.length >= 3 && (
          <polygon
            points={polyPts.map((p) => `${xs(p.x)},${ys(p.y)}`).join(" ")}
            fill="rgba(31, 78, 61, 0.12)"
            stroke="#1f4e3d"
            strokeWidth={2}
          />
        )}

        {/* Branch cut: when this node has been branched, shade the excluded
            strip between floor and ceil of the fractional value and label the
            two child constraints. */}
        {branchShown && node.branchVar != null && node.branchVar === 0 && (
          <g>
            <rect
              x={xs(Math.floor(node.branchVal))}
              y={padT}
              width={xs(Math.ceil(node.branchVal)) - xs(Math.floor(node.branchVal))}
              height={chartH}
              fill="rgba(200, 49, 28, 0.10)"
            />
            <line x1={xs(Math.floor(node.branchVal))} y1={padT} x2={xs(Math.floor(node.branchVal))} y2={padT + chartH} stroke="#c8311c" strokeWidth={2.5} />
            <line x1={xs(Math.ceil(node.branchVal))} y1={padT} x2={xs(Math.ceil(node.branchVal))} y2={padT + chartH} stroke="#c8311c" strokeWidth={2.5} />
            <text x={xs(Math.floor(node.branchVal)) - 6} y={padT + 14} textAnchor="end" fontSize={12} fontWeight={700} fill="#c8311c">
              {preset.varNames[0]} ≤ {Math.floor(node.branchVal)}
            </text>
            <text x={xs(Math.ceil(node.branchVal)) + 6} y={padT + 14} fontSize={12} fontWeight={700} fill="#c8311c">
              {preset.varNames[0]} ≥ {Math.ceil(node.branchVal)}
            </text>
            <text x={(xs(Math.floor(node.branchVal)) + xs(Math.ceil(node.branchVal))) / 2} y={padT + chartH / 2} textAnchor="middle" fontSize={10} fill="#c8311c" transform={`rotate(-90 ${(xs(Math.floor(node.branchVal)) + xs(Math.ceil(node.branchVal))) / 2} ${padT + chartH / 2})`}>
              no integer points here
            </text>
          </g>
        )}
        {branchShown && node.branchVar != null && node.branchVar === 1 && (
          <g>
            <rect
              x={padL}
              y={ys(Math.ceil(node.branchVal))}
              width={chartW}
              height={ys(Math.floor(node.branchVal)) - ys(Math.ceil(node.branchVal))}
              fill="rgba(200, 49, 28, 0.10)"
            />
            <line x1={padL} y1={ys(Math.floor(node.branchVal))} x2={padL + chartW} y2={ys(Math.floor(node.branchVal))} stroke="#c8311c" strokeWidth={2.5} />
            <line x1={padL} y1={ys(Math.ceil(node.branchVal))} x2={padL + chartW} y2={ys(Math.ceil(node.branchVal))} stroke="#c8311c" strokeWidth={2.5} />
            <text x={padL + chartW - 6} y={ys(Math.floor(node.branchVal)) + 14} textAnchor="end" fontSize={12} fontWeight={700} fill="#c8311c">
              {preset.varNames[1]} ≤ {Math.floor(node.branchVal)}
            </text>
            <text x={padL + chartW - 6} y={ys(Math.ceil(node.branchVal)) - 6} textAnchor="end" fontSize={12} fontWeight={700} fill="#c8311c">
              {preset.varNames[1]} ≥ {Math.ceil(node.branchVal)}
            </text>
          </g>
        )}

        {/* Branching bound lines (red dashed) */}
        {Number.isFinite(node.lo[0]) && node.lo[0] > 0 && (
          <line x1={xs(node.lo[0])} y1={padT} x2={xs(node.lo[0])} y2={padT + chartH} stroke="#c8311c" strokeWidth={2} strokeDasharray="6,3" />
        )}
        {Number.isFinite(node.hi[0]) && node.hi[0] < xMaxTick && (
          <line x1={xs(node.hi[0])} y1={padT} x2={xs(node.hi[0])} y2={padT + chartH} stroke="#c8311c" strokeWidth={2} strokeDasharray="6,3" />
        )}
        {Number.isFinite(node.lo[1]) && node.lo[1] > 0 && (
          <line x1={padL} y1={ys(node.lo[1])} x2={padL + chartW} y2={ys(node.lo[1])} stroke="#c8311c" strokeWidth={2} strokeDasharray="6,3" />
        )}
        {Number.isFinite(node.hi[1]) && node.hi[1] < yMaxTick && (
          <line x1={padL} y1={ys(node.hi[1])} x2={padL + chartW} y2={ys(node.hi[1])} stroke="#c8311c" strokeWidth={2} strokeDasharray="6,3" />
        )}

        {/* Lattice */}
        {lattice.map((p, i) => {
          const inside =
            p.x >= node.lo[0] - 1e-9 &&
            p.x <= node.hi[0] + 1e-9 &&
            p.y >= node.lo[1] - 1e-9 &&
            p.y <= node.hi[1] + 1e-9 &&
            (preset.constraintsForPlot || []).every((c) => c.a * p.x + c.b * p.y <= c.rhs + 1e-9);
          return (
            <circle
              key={i}
              cx={xs(p.x)}
              cy={ys(p.y)}
              r={inside ? 3 : 2}
              fill={inside ? "#444" : "#ccc"}
            />
          );
        })}

        {/* LP optimum */}
        {lp.feasible && (
          <>
            <circle cx={xs(lp.x[0])} cy={ys(lp.x[1])} r={6} fill="#0b3da0" stroke="#fff" strokeWidth={2} />
            <text x={xs(lp.x[0]) + 8} y={ys(lp.x[1]) - 8} fontSize={11} fontFamily="monospace" fill="#0b3da0">
              ({lp.x[0].toFixed(2)}, {lp.x[1].toFixed(2)})
            </text>
          </>
        )}

        {/* Incumbent */}
        {incumbent.x && (
          <>
            <rect
              x={xs(incumbent.x[0]) - 5}
              y={ys(incumbent.x[1]) - 5}
              width={10}
              height={10}
              fill="#f5a524"
              stroke="#fff"
              strokeWidth={2}
            />
            <text x={xs(incumbent.x[0]) + 8} y={ys(incumbent.x[1]) + 12} fontSize={10} fontFamily="monospace" fill="#a37300">
              incumbent ({incumbent.x[0]}, {incumbent.x[1]})
            </text>
          </>
        )}

        {ticks.map((v) => (
          <text key={`xl${v}`} x={xs(v)} y={padT + chartH + 14} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#666">
            {v}
          </text>
        ))}
        {ticks.map((v) => (
          <text key={`yl${v}`} x={padL - 6} y={ys(v) + 3} textAnchor="end" fontSize={10} fontFamily="monospace" fill="#666">
            {v}
          </text>
        ))}
        <text x={padL + chartW - 6} y={padT + chartH - 6} textAnchor="end" fontSize={11} fontFamily="monospace" fill="#666">
          {preset.varNames[0]}
        </text>
        <text x={padL + 6} y={padT + 12} fontSize={11} fontFamily="monospace" fill="#666">
          {preset.varNames[1]}
        </text>
      </svg>
    </div>
  );
}

// ============================================================
// Knapsack panel — shows the LP relaxation x-vector and
// the integer bounds for higher-D presets where 2-D plotting
// doesn't apply.
// ============================================================
function KnapsackBoundsPanel({ node, preset }) {
  const lp = node.lp;
  return (
    <div style={panel}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
        Node {node.id}: LP relaxation (knapsack)
      </div>
      <table style={{ fontFamily: "monospace", fontSize: 12, borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #bbb" }}>
            <th style={kpCell}>var</th>
            <th style={kpCell}>fixed?</th>
            <th style={kpCell}>LP value</th>
          </tr>
        </thead>
        <tbody>
          {preset.varNames.map((vn, k) => {
            const lo = node.lo[k], hi = node.hi[k];
            let fixed = "free";
            if (lo >= 0.999) fixed = "= 1";
            else if (hi <= 0.001) fixed = "= 0";
            const lpv = lp && lp.feasible ? lp.x[k] : null;
            return (
              <tr key={k} style={{ borderBottom: "1px solid #eee" }}>
                <td style={kpCell}><Tex>{vn}</Tex></td>
                <td style={{ ...kpCell, color: fixed === "free" ? "#888" : "#1f4e3d", fontWeight: fixed === "free" ? 400 : 700 }}>{fixed}</td>
                <td style={kpCell}>
                  {lpv == null ? "—" : (
                    <span style={{
                      color: lpv > 0.001 && lpv < 0.999 ? "#c8311c" : "#222",
                      fontWeight: lpv > 0.001 && lpv < 0.999 ? 700 : 400,
                    }}>
                      {lpv.toFixed(3)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 10, fontSize: 12, color: "#444" }}>
        {lp && lp.feasible ? (
          <>LP objective at this node: <Tex>{`${lp.obj.toFixed(3)}`}</Tex></>
        ) : (
          <span>LP infeasible at this node.</span>
        )}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: "#888" }}>
        Red values are fractional. The B&B tree branches on a fractional variable, fixing it to 0 (left) or 1 (right).
      </div>
    </div>
  );
}

const kpCell = { padding: "4px 8px", textAlign: "left" };

// ============================================================
// Tree view
// ============================================================
function TreeView({ tree, visibleNodes, selectedId, setSelectedId, incumbent, dualBound, preset }) {
  const W = 540, H = 520;

  // Build position layout (depth -> y, in-order x).
  const positions = {};
  const layoutSubtree = (id, xL, xR, depth) => {
    const cx = (xL + xR) / 2;
    positions[id] = { x: cx, y: 32 + depth * 78 };
    const node = tree.nodes[id];
    if (node.children) {
      const mid = (xL + xR) / 2;
      layoutSubtree(node.children[0], xL, mid, depth + 1);
      layoutSubtree(node.children[1], mid, xR, depth + 1);
    }
  };
  layoutSubtree(0, 24, W - 24, 0);

  return (
    <div style={panel}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        B&amp;B tree
      </div>
      <div style={{ fontSize: 12, color: "#444", fontFamily: "monospace", marginBottom: 8 }}>
        primal ={" "}
        <span style={{ color: "#a37300", fontWeight: 700 }}>
          {incumbent.obj === -Infinity ? "−∞" : incumbent.obj.toFixed(2)}
        </span>
        {"   "}
        dual ={" "}
        <span style={{ color: "#0b3da0", fontWeight: 700 }}>
          {dualBound === -Infinity ? "+∞" : dualBound.toFixed(2)}
        </span>
        {"   "}
        gap ={" "}
        <span style={{ fontWeight: 700 }}>
          {incumbent.obj === -Infinity || dualBound === -Infinity
            ? "—"
            : `${(((dualBound - incumbent.obj) / Math.max(0.01, Math.abs(incumbent.obj))) * 100).toFixed(2)}%`}
        </span>
      </div>
      <svg width={W} height={H}>
        {/* edges */}
        {tree.nodes.map((node) => {
          if (!node.children) return null;
          if (!visibleNodes.has(node.id)) return null;
          return node.children.map((cid) => {
            if (!visibleNodes.has(cid)) return null;
            const a = positions[node.id];
            const b = positions[cid];
            const child = tree.nodes[cid];
            const v = preset.varNames[child.branchInfo.var];
            const op = child.branchInfo.op;
            const val = child.branchInfo.val;
            const labelW = 60;
            return (
              <g key={cid}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#888" strokeWidth={1.5} />
                <rect
                  x={(a.x + b.x) / 2 - labelW / 2}
                  y={(a.y + b.y) / 2 - 9}
                  width={labelW}
                  height={18}
                  rx={3}
                  fill="#fff"
                  stroke="#bbb"
                />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily="monospace"
                  fill="#222"
                >
                  {v} {op === "<=" ? "≤" : "≥"} {val}
                </text>
              </g>
            );
          });
        })}

        {/* nodes */}
        {tree.nodes.map((node) => {
          if (!visibleNodes.has(node.id)) return null;
          const p = positions[node.id];
          const isSelected = node.id === selectedId;
          let color = "#aaa";
          if (node.status === "branched") color = "#0b3da0";
          else if (node.status === "integer") color = "#1f4e3d";
          else if (node.status === "infeasible") color = "#888";
          else if (node.status === "fathomed_bound") color = "#c8311c";
          if (node.becameIncumbent) color = "#f5a524";
          // If LP not yet solved at the current step, show as 'open' (gray).
          const lpSolved = node.lpObj != null;
          if (!lpSolved && node.status !== "infeasible") color = "#aaa";
          return (
            <g key={node.id} style={{ cursor: "pointer" }} onClick={() => setSelectedId(node.id)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 22 : 18}
                fill={color}
                stroke={isSelected ? "#000" : "#fff"}
                strokeWidth={isSelected ? 3 : 2}
              />
              <text
                x={p.x}
                y={p.y - 3}
                textAnchor="middle"
                fontSize={10}
                fontFamily="monospace"
                fill="#fff"
                fontWeight={700}
              >
                #{node.id}
              </text>
              <text x={p.x} y={p.y + 9} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="#fff">
                {lpSolved ? node.lpObj.toFixed(2) : "—"}
              </text>
            </g>
          );
        })}

        {/* legend */}
        <g transform={`translate(10, ${H - 110})`}>
          <rect x={0} y={0} width={180} height={104} fill="rgba(255,255,255,0.94)" stroke="#ccc" />
          <circle cx={12} cy={14} r={6} fill="#0b3da0" /><text x={24} y={18} fontSize={11}>branched</text>
          <circle cx={12} cy={32} r={6} fill="#1f4e3d" /><text x={24} y={36} fontSize={11}>integer-feasible</text>
          <circle cx={12} cy={50} r={6} fill="#f5a524" /><text x={24} y={54} fontSize={11}>incumbent</text>
          <circle cx={12} cy={68} r={6} fill="#c8311c" /><text x={24} y={72} fontSize={11}>fathomed (bound)</text>
          <circle cx={12} cy={86} r={6} fill="#888" /><text x={24} y={90} fontSize={11}>infeasible</text>
        </g>
      </svg>
    </div>
  );
}

// ============================================================
// Node detail
// ============================================================
function NodeDetail({ node, preset }) {
  if (!node) return null;
  const lp = node.lp;
  return (
    <div style={{ marginTop: 14, padding: 14, background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 8 }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        Selected node detail (id {node.id})
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.7 }}>
        <div>
          Bounds inherited from ancestors: <NodeBoundsTeX node={node} preset={preset} />
        </div>
        <div>
          LP relaxation:{" "}
          {!lp ? (
            <span style={{ color: "#888" }}>(not yet solved at this step)</span>
          ) : !lp.feasible ? (
            <span>infeasible</span>
          ) : (
            <Tex>
              {`(${lp.x.map((u) => fmt(u)).join(", ")}),\\;\\; \\text{obj} = ${lp.obj.toFixed(3)}`}
            </Tex>
          )}
        </div>
        <div>
          Status: <b style={{ color: nodeColor(node.status) }}>{node.status || "open"}</b>
          {node.becameIncumbent && (
            <span style={{ marginLeft: 10, color: "#a37300" }}>★ became incumbent</span>
          )}
        </div>
        {node.status === "branched" && node.branchVar != null && (
          <div>
            Branched on{" "}
            <Tex>{`${preset.varNames[node.branchVar]} = ${node.branchVal.toFixed(3)}`}</Tex>{" "}
            (most-fractional rule).
          </div>
        )}
      </div>
    </div>
  );
}

function nodeColor(status) {
  if (status === "branched") return "#0b3da0";
  if (status === "integer") return "#1f4e3d";
  if (status === "fathomed_bound") return "#c8311c";
  if (status === "infeasible") return "#888";
  return "#444";
}

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
          <b>Three ways to fathom.</b> A node is closed when (1) its LP is
          infeasible, (2) the LP optimum is integer-feasible, or (3) the LP
          optimum's objective is no better than the current incumbent
          (fathom by bound). The four presets above each highlight a
          different combination.
        </li>
        <li>
          <b>Most-fractional branching.</b> Branch on the variable whose LP
          value is closest to <Tex>{`0.5`}</Tex> away from an integer. Other
          rules: pseudo-cost, strong branching, reliability branching.
        </li>
        <li>
          <b>Best-first vs depth-first.</b> Best-first explores the open node
          with the best (largest, for max) LP value — most likely to improve
          the dual bound. Depth-first dives deep quickly to find feasible
          solutions. Most solvers blend both.
        </li>
        <li>
          <b>The branching decomposition.</b> Each child's LP{" "}
          <Tex>{String.raw`L_{\text{child}}`}</Tex> equals the parent's LP{" "}
          <Tex>{String.raw`L_{\text{parent}}`}</Tex> intersected with one new
          half-space (e.g.{" "}
          <Tex>{String.raw`x_j \le \lfloor v \rfloor`}</Tex> or{" "}
          <Tex>{String.raw`x_j \ge \lceil v \rceil`}</Tex>). The two children
          together cover every integer point of the parent — the fractional
          gap <Tex>{String.raw`\lfloor v \rfloor < x_j < \lceil v \rceil`}</Tex>{" "}
          contains no integer points and is safely discarded.
        </li>
        <li>
          <b>Why the gap matters.</b> The gap{" "}
          <Tex>{`(\\text{dual} - \\text{primal}) / |\\text{primal}|`}</Tex>{" "}
          is the official 'how close are we' metric. When gap = 0, the
          incumbent is provably optimal.
        </li>
        <li>
          <b>What real solvers add.</b> Cutting planes (Gomory, MIR, covers)
          tighten the LP at every node. Strong branching evaluates children's
          LPs before committing. Heuristics (RINS, RENS, feasibility pump)
          find good incumbents fast.
        </li>
      </ul>
    </div>
  );
}

// ============================================================
// Style atoms
// ============================================================
const panel = {
  background: "#fafafa",
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 12,
};
const problemBox = {
  marginBottom: 16,
  padding: "12px 16px",
  background: "#f6f4ee",
  border: "1px solid #ece8dd",
  borderRadius: 8,
};
const eventBox = {
  marginBottom: 14,
  padding: "10px 14px",
  background: "#fff4c8",
  border: "1px solid #f5d68d",
  borderRadius: 8,
  fontSize: 14,
  lineHeight: 1.55,
};
const decompBox = {
  padding: "12px 14px",
  background: "#eef4ff",
  border: "1px solid #cdd9f0",
  borderRadius: 8,
};
const decompTitle = {
  fontFamily: "monospace",
  fontSize: 10,
  color: "#0b3da0",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  marginBottom: 6,
  fontWeight: 700,
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
