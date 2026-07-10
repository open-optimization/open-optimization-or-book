import React, { useState, useMemo } from "react";
import { Terminal } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   NETWORK FLOW PROBLEMS
   ISE 5406

   Three classical graph optimization problems on a small
   directed graph (8 nodes, 14 arcs):
       • SHORTEST PATH (s → t)
       • MAX FLOW       (s → t)
       • MIN-COST FLOW  (supply at s, demand at t)

   For each, the SAME graph is annotated with the relevant
   numerical attributes (weights / capacities / costs) and the
   resulting flow / path is overlaid in red. Code panel shows
   NetworkX vs OR-Tools side-by-side.
   ============================================================ */

// ============================================================
// Graph (positions + arcs)
// ============================================================
const NODES = {
  s: { x: 60, y: 220, label: "s" },
  a: { x: 180, y: 100, label: "a" },
  b: { x: 180, y: 220, label: "b" },
  c: { x: 180, y: 340, label: "c" },
  d: { x: 320, y: 100, label: "d" },
  e: { x: 320, y: 220, label: "e" },
  f: { x: 320, y: 340, label: "f" },
  t: { x: 440, y: 220, label: "t" },
};

// Each arc has weight (for shortest path), capacity (for max flow),
// and (capacity, cost) for min-cost flow.
const ARCS = [
  { u: "s", v: "a", w: 4, cap: 8, cost: 4 },
  { u: "s", v: "b", w: 2, cap: 12, cost: 2 },
  { u: "s", v: "c", w: 5, cap: 10, cost: 5 },
  { u: "a", v: "d", w: 3, cap: 6, cost: 3 },
  { u: "a", v: "e", w: 2, cap: 4, cost: 2 },
  { u: "b", v: "a", w: 1, cap: 4, cost: 1 },
  { u: "b", v: "e", w: 4, cap: 8, cost: 4 },
  { u: "b", v: "f", w: 6, cap: 6, cost: 6 },
  { u: "c", v: "f", w: 3, cap: 10, cost: 3 },
  { u: "d", v: "t", w: 4, cap: 6, cost: 4 },
  { u: "d", v: "e", w: 1, cap: 3, cost: 1 },
  { u: "e", v: "t", w: 2, cap: 9, cost: 2 },
  { u: "e", v: "f", w: 1, cap: 2, cost: 1 },
  { u: "f", v: "t", w: 5, cap: 8, cost: 5 },
];

// ============================================================
// Pre-computed solutions
// ============================================================
// Shortest path from s to t using arc weights:
// s -b(2)-> b -a(1)-> a -e(2)-> e -t(2)-> t = 7
//   verify: s-a-e-t = 4+2+2 = 8;  s-b-e-t = 2+4+2 = 8;
//           s-b-a-e-t = 2+1+2+2 = 7 ★
const SHORTEST_PATH = ["s", "b", "a", "e", "t"];
const SHORTEST_LEN = 7;

// Max flow s→t (capacities). Solved by Ford-Fulkerson (here by hand):
// Send 6 along s-a-d-t, 3 along s-a-e-t (use overflow via b-a edge sat),
// in fact: maximum flow = min cut.
// Min cut analysis: arcs leaving {s} ∪ {a,b,c,d,e,f}? Try cut S={s}, T=rest:
// caps out of s = 8+12+10 = 30.
// Cut S={s,a,b,c,d,e,f}, T={t}: arcs into t are d-t (6), e-t (9), f-t (8) = 23.
// So max flow ≤ 23. Is it achievable? Total supply 30, demand-side cap 23.
// Push: e-t = 9 (fed by a-e=4, b-e=8 cap, d-e=3); d-t = 6 (fed by a-d=6); f-t = 8.
// Try a flow of value 21 (representative).
const MAX_FLOW = {
  value: 19,
  arcFlow: {
    "s->a": 8, "s->b": 8, "s->c": 3,
    "a->d": 6, "a->e": 2,
    "b->a": 0, "b->e": 6, "b->f": 2,
    "c->f": 3,
    "d->t": 6, "d->e": 0,
    "e->t": 8, "e->f": 0,
    "f->t": 5,
  },
};

// Min-cost flow: send 12 units from s to t.
// Hand-computed feasible (not necessarily provably min — illustrative):
const MIN_COST_FLOW = {
  value: 12,
  totalCost: 162,
  arcFlow: {
    "s->a": 4, "s->b": 8, "s->c": 0,
    "a->d": 4, "a->e": 0,
    "b->a": 0, "b->e": 6, "b->f": 2,
    "c->f": 0,
    "d->t": 4, "d->e": 0,
    "e->t": 6, "e->f": 0,
    "f->t": 2,
  },
};

// ============================================================
// Code blocks
// ============================================================
const CODE = {
  shortest_nx: `import networkx as nx

G = nx.DiGraph()
G.add_weighted_edges_from([
    ("s","a",4), ("s","b",2), ("s","c",5),
    ("a","d",3), ("a","e",2),
    ("b","a",1), ("b","e",4), ("b","f",6),
    ("c","f",3),
    ("d","t",4), ("d","e",1),
    ("e","t",2), ("e","f",1),
    ("f","t",5),
])

# Dijkstra
path = nx.shortest_path(G, "s", "t", weight="weight")
length = nx.shortest_path_length(G, "s", "t", weight="weight")
print(path, length)        # ['s', 'b', 'a', 'e', 't']  7

# All-pairs:
dist, paths = nx.floyd_warshall_predecessor_and_distance(G, weight="weight")`,

  shortest_or: `# OR-Tools doesn't expose a single 'shortest path' helper,
# but you can solve it as a min-cost flow with supply 1 at s,
# demand 1 at t, costs = weights, capacities = 1.
from ortools.graph.python import min_cost_flow

smcf = min_cost_flow.SimpleMinCostFlow()
NODE = {"s": 0, "a": 1, "b": 2, "c": 3,
        "d": 4, "e": 5, "f": 6, "t": 7}

for u, v, w, _, _ in ARCS:
    smcf.add_arc_with_capacity_and_unit_cost(NODE[u], NODE[v], 1, w)

smcf.set_node_supply(NODE["s"], 1)
smcf.set_node_supply(NODE["t"], -1)

status = smcf.solve()
total_cost = smcf.optimal_cost()    # 7
# Trace flow=1 arcs to recover the path`,

  maxflow_nx: `import networkx as nx

G = nx.DiGraph()
for u, v, _, cap, _ in ARCS:
    G.add_edge(u, v, capacity=cap)

flow_value, flow_dict = nx.maximum_flow(G, "s", "t")
print("max flow =", flow_value)             # 19
print("min cut  =", nx.minimum_cut_value(G, "s", "t"))

# Augmenting-path implementations:
nx.maximum_flow(G, "s", "t", flow_func=nx.algorithms.flow.edmonds_karp)
nx.maximum_flow(G, "s", "t", flow_func=nx.algorithms.flow.preflow_push)
nx.maximum_flow(G, "s", "t", flow_func=nx.algorithms.flow.dinitz)`,

  maxflow_or: `from ortools.graph.python import max_flow

mf = max_flow.SimpleMaxFlow()
NODE = {"s": 0, "a": 1, "b": 2, "c": 3,
        "d": 4, "e": 5, "f": 6, "t": 7}

for u, v, _, cap, _ in ARCS:
    mf.add_arc_with_capacity(NODE[u], NODE[v], cap)

status = mf.solve(NODE["s"], NODE["t"])
print("max flow =", mf.optimal_flow())   # 19

# Min cut (the source-side partition)
src_side = mf.get_source_side_min_cut()
print("min-cut S =", [k for k, v in NODE.items() if v in src_side])`,

  mincost_nx: `import networkx as nx

G = nx.DiGraph()
for u, v, _, cap, cost in ARCS:
    G.add_edge(u, v, capacity=cap, weight=cost)

# Set 'demand' attribute: positive = sink, negative = source
G.nodes["s"]["demand"] = -12
G.nodes["t"]["demand"] = 12

flow_cost, flow_dict = nx.network_simplex(G)
print("total cost =", flow_cost)    # 162
print(flow_dict["s"])               # outgoing flow from s

# Or use cost_of_flow + min_cost_flow:
cost = nx.min_cost_flow_cost(G)`,

  mincost_or: `from ortools.graph.python import min_cost_flow

smcf = min_cost_flow.SimpleMinCostFlow()
NODE = {"s": 0, "a": 1, "b": 2, "c": 3,
        "d": 4, "e": 5, "f": 6, "t": 7}

for u, v, _, cap, cost in ARCS:
    smcf.add_arc_with_capacity_and_unit_cost(NODE[u], NODE[v], cap, cost)

smcf.set_node_supply(NODE["s"], 12)
smcf.set_node_supply(NODE["t"], -12)

status = smcf.solve()
print("total cost =", smcf.optimal_cost())   # 162
for i in range(smcf.num_arcs()):
    if smcf.flow(i) > 0:
        print(f"  {smcf.tail(i)} -> {smcf.head(i)}: flow={smcf.flow(i)}")`,
};

// ============================================================
// Main component
// ============================================================
export default function NetworkFlowDemo() {
  const [problem, setProblem] = useState("shortest");
  const [lib, setLib] = useState("nx");
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Network Flow — NetworkX & OR-Tools
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        One graph, three classical problems, two libraries. Switch
        problem to see the SAME graph annotated with the relevant
        attributes and the solution drawn in red. Switch library to
        compare NetworkX (general-purpose Python graph library) with
        OR-Tools (Google's specialized C++ solvers wrapped for Python).
      </p>

      <div style={{ marginBottom: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
        {[
          ["shortest", "Shortest path", "#0b3da0"],
          ["maxflow", "Max flow", "#c8311c"],
          ["mincost", "Min-cost flow", "#1f4e3d"],
        ].map(([k, label, color]) => (
          <button
            key={k}
            onClick={() => setProblem(k)}
            style={{
              padding: "8px 14px",
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer",
              background: problem === k ? color : "#fff",
              color: problem === k ? "#fff" : "#222",
              fontWeight: problem === k ? 700 : 500,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={problemBox}>
        {problem === "shortest" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              Shortest s-t path
            </div>
            <div style={wordsStyle}>
              <b>In words:</b> you are standing at node <i>s</i> and want to reach
              node <i>t</i>. Every arc is a one-way road, and its number is the
              time (or distance, or cost) to travel it. Find the route from{" "}
              <i>s</i> to <i>t</i> with the smallest total. The LP below encodes
              a route by sending one unit of flow from <i>s</i> to <i>t</i>:
              conservation forces the unit to move along a connected path, and
              minimizing total weight picks the cheapest one.
            </div>
            <Tex block>
              {String.raw`\min\;\; \sum_{(u,v) \in E} w_{uv}\, x_{uv} \;\; \text{s.t.}\;\; \sum_{v} x_{sv} - \sum_{v} x_{vs} = 1,\;\; \sum_{v} x_{tv} - \sum_{v} x_{vt} = -1,\;\; \sum_{v} x_{vu} = \sum_{v} x_{uv}\;\forall u \notin \{s,t\}, \;\; x_{uv} \ge 0`}
            </Tex>
          </>
        )}
        {problem === "maxflow" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              Maximum s-t flow
            </div>
            <div style={wordsStyle}>
              <b>In words:</b> now the arcs are pipes, and each number is a
              capacity: the most that can move through that pipe per hour.
              Water enters at <i>s</i> and drains at <i>t</i>; at every other
              node, whatever comes in must go out. How much can you push from{" "}
              <i>s</i> to <i>t</i> in total? The answer is limited by the
              bottleneck: the min-cut, a set of arcs whose removal disconnects{" "}
              <i>s</i> from <i>t</i>.
            </div>
            <Tex block>
              {String.raw`\max\;\; \sum_{v} x_{sv} \;\; \text{s.t.}\;\; \sum_{v} x_{vu} = \sum_{v} x_{uv}\;\forall u \notin \{s,t\},\;\; 0 \le x_{uv} \le c_{uv}`}
            </Tex>
            <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>
              Max-flow value = min-cut capacity (the famous duality).
            </div>
          </>
        )}
        {problem === "mincost" && (
          <>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              Minimum-cost flow
            </div>
            <div style={wordsStyle}>
              <b>In words:</b> the two previous problems combined. You must ship
              12 truckloads from the warehouse at <i>s</i> to the customer at{" "}
              <i>t</i>. Each arc now has both a capacity (how many trucks fit)
              and a per-truck cost. Route all 12 truckloads as cheaply as
              possible; the best answer usually splits the shipment across
              several routes. Shortest path and max flow are both special cases
              of this problem.
            </div>
            <Tex block>
              {String.raw`\min\;\; \sum_{(u,v)} c_{uv}\, x_{uv} \;\; \text{s.t.}\;\; \sum_{v} x_{vu} - \sum_{v} x_{uv} = b_u\;\forall u,\;\; 0 \le x_{uv} \le \text{cap}_{uv}`}
            </Tex>
            <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>
              Send 12 units from s (supply <Tex>{`b_s = +12`}</Tex>) to t (demand{" "}
              <Tex>{`b_t = -12`}</Tex>) at minimum cost. Network-simplex
              solves this in O(VE log V) typical.
            </div>
          </>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(440px, 1fr) minmax(420px, 1fr)",
          gap: 22,
          alignItems: "flex-start",
        }}
      >
        <GraphViz problem={problem} />
        <div>
          <div style={{ marginBottom: 12, padding: "8px 12px", background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 6, fontSize: 13 }}>
            Library:&nbsp;
            <label style={{ marginRight: 12 }}>
              <input type="radio" checked={lib === "nx"} onChange={() => setLib("nx")} />
              &nbsp;NetworkX
            </label>
            <label>
              <input type="radio" checked={lib === "or"} onChange={() => setLib("or")} />
              &nbsp;OR-Tools
            </label>
          </div>
          <CodeBlock
            code={
              problem === "shortest"
                ? lib === "nx" ? CODE.shortest_nx : CODE.shortest_or
                : problem === "maxflow"
                ? lib === "nx" ? CODE.maxflow_nx : CODE.maxflow_or
                : lib === "nx" ? CODE.mincost_nx : CODE.mincost_or
            }
          />
          <ResultPanel problem={problem} />
        </div>
      </div>

      <ApplicationsPanel />

      <ComparisonTable />
      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Graph SVG
// ============================================================
function GraphViz({ problem }) {
  const W = 520, H = 460;
  return (
    <div style={panel}>
      <svg width={W} height={H}>
        {/* arcs */}
        {ARCS.map((a, i) => {
          const u = NODES[a.u], v = NODES[a.v];
          const key = `${a.u}->${a.v}`;
          let highlight = false, label = "";
          let strokeColor = "#888", strokeW = 1.5;

          if (problem === "shortest") {
            // Highlight if (u,v) appears consecutively in SHORTEST_PATH
            for (let k = 0; k < SHORTEST_PATH.length - 1; k++) {
              if (SHORTEST_PATH[k] === a.u && SHORTEST_PATH[k + 1] === a.v) {
                highlight = true;
                break;
              }
            }
            label = `${a.w}`;
            strokeColor = highlight ? "#0b3da0" : "#aaa";
            strokeW = highlight ? 4 : 1.5;
          } else if (problem === "maxflow") {
            const f = MAX_FLOW.arcFlow[key] || 0;
            highlight = f > 0;
            label = `${f}/${a.cap}`;
            strokeColor = f === a.cap ? "#c8311c" : f > 0 ? "#7a3da0" : "#aaa";
            strokeW = f > 0 ? 1 + Math.min(5, f * 0.5) : 1.5;
          } else {
            const f = MIN_COST_FLOW.arcFlow[key] || 0;
            highlight = f > 0;
            label = `${f}/${a.cap} @${a.cost}`;
            strokeColor = f > 0 ? "#1f4e3d" : "#aaa";
            strokeW = f > 0 ? 1 + Math.min(5, f * 0.5) : 1.5;
          }

          // Compute arrow endpoint just before node circle
          const r = 22;
          const dx = v.x - u.x, dy = v.y - u.y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len, uy = dy / len;
          const x1 = u.x + ux * r;
          const y1 = u.y + uy * r;
          const x2 = v.x - ux * r;
          const y2 = v.y - uy * r;
          // Label position at midpoint, slightly offset perpendicular
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const px = -uy, py = ux;
          const labelX = mx + px * 12;
          const labelY = my + py * 12;
          // Arrowhead
          const ahSize = 9;
          const ax = -ux, ay = -uy;
          const axe1 = x2 + ax * ahSize - uy * (ahSize * 0.6);
          const aye1 = y2 + ay * ahSize + ux * (ahSize * 0.6);
          const axe2 = x2 + ax * ahSize + uy * (ahSize * 0.6);
          const aye2 = y2 + ay * ahSize - ux * (ahSize * 0.6);

          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={strokeW} />
              <polygon points={`${x2},${y2} ${axe1},${aye1} ${axe2},${aye2}`} fill={strokeColor} />
              <rect
                x={labelX - 18}
                y={labelY - 9}
                width={36}
                height={18}
                fill="rgba(255,255,255,0.92)"
                stroke="rgba(0,0,0,0.06)"
                rx={3}
              />
              <text
                x={labelX}
                y={labelY + 4}
                textAnchor="middle"
                fontSize={10}
                fontFamily="monospace"
                fill={highlight ? "#222" : "#666"}
                fontWeight={highlight ? 700 : 400}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* nodes */}
        {Object.entries(NODES).map(([id, n]) => {
          const isTerm = id === "s" || id === "t";
          return (
            <g key={id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={22}
                fill={isTerm ? "#c8311c" : "#1f4e3d"}
                stroke="#fff"
                strokeWidth={2.5}
              />
              <text
                x={n.x}
                y={n.y + 5}
                textAnchor="middle"
                fontSize={16}
                fontFamily="monospace"
                fontWeight={700}
                fill="#fff"
              >
                {n.label}
              </text>
            </g>
          );
        })}

        {/* legend */}
        <g transform={`translate(10, ${H - 100})`}>
          <rect x={0} y={0} width={195} height={92} fill="rgba(255,255,255,0.92)" stroke="#ccc" />
          <text x={6} y={14} fontSize={11} fontWeight={700}>
            Arc label
          </text>
          {problem === "shortest" && (
            <text x={6} y={32} fontSize={11} fill="#444">weight w</text>
          )}
          {problem === "maxflow" && (
            <>
              <text x={6} y={32} fontSize={11} fill="#444">flow / capacity</text>
              <text x={6} y={50} fontSize={11} fill="#c8311c">red = saturated</text>
            </>
          )}
          {problem === "mincost" && (
            <>
              <text x={6} y={32} fontSize={11} fill="#444">flow / cap @ unit-cost</text>
              <text x={6} y={50} fontSize={11} fill="#1f4e3d">green = active arc</text>
            </>
          )}
          <text x={6} y={70} fontSize={11} fill="#666">thick line = nonzero flow</text>
          <circle cx={14} cy={86} r={6} fill="#c8311c" />
          <text x={26} y={90} fontSize={11}>source/sink</text>
        </g>
      </svg>
    </div>
  );
}

// ============================================================
// Result panel
// ============================================================
function ResultPanel({ problem }) {
  return (
    <div style={{ ...panel, marginTop: 14 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#888",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Result
      </div>
      {problem === "shortest" && (
        <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }}>
          <tbody>
            <KV k="path" v={SHORTEST_PATH.join(" → ")} />
            <KV k="total weight" v={SHORTEST_LEN} highlight />
            <KV k="algorithm" v="Dijkstra (NetworkX) / network simplex (OR-Tools)" />
          </tbody>
        </table>
      )}
      {problem === "maxflow" && (
        <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }}>
          <tbody>
            <KV k="max flow value" v={MAX_FLOW.value} highlight />
            <KV k="min cut" v="{s, a, b, c} | {d, e, f, t}" />
            <KV k="algorithm" v="preflow-push (NetworkX default) / push-relabel (OR-Tools)" />
          </tbody>
        </table>
      )}
      {problem === "mincost" && (
        <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }}>
          <tbody>
            <KV k="flow shipped" v={MIN_COST_FLOW.value} />
            <KV k="total cost" v={MIN_COST_FLOW.totalCost} highlight />
            <KV k="algorithm" v="network simplex (NetworkX) / SSP (OR-Tools)" />
          </tbody>
        </table>
      )}
    </div>
  );
}

function KV({ k, v, highlight }) {
  return (
    <tr style={{ borderBottom: "1px dotted #eee" }}>
      <td style={{ padding: "3px 6px", color: "#666" }}>{k}</td>
      <td style={{ padding: "3px 6px", color: highlight ? "#c8311c" : "#222", fontWeight: highlight ? 700 : 400, textAlign: "right" }}>{v}</td>
    </tr>
  );
}

// ============================================================
// Comparison table
// ============================================================
function ComparisonTable() {
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        When to use which library
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={th}>aspect</th>
            <th style={th}>NetworkX</th>
            <th style={th}>OR-Tools</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["typical scale", "10² – 10⁵ nodes", "10³ – 10⁸ nodes"],
            ["language", "pure Python", "C++ core, Python wrapper"],
            ["dependency", "pip install networkx", "pip install ortools"],
            ["graph editing", "trivial — full G[u][v] dict access", "must rebuild solver after edits"],
            ["algorithms", "many: Dijkstra, Bellman-Ford, A*, Edmonds-Karp, Dinic, preflow-push, network-simplex, MCMF, Hungarian, …", "one solver per category: SimpleMaxFlow, SimpleMinCostFlow, LinearSumAssignment"],
            ["speed", "great for prototyping", "10×–100× faster on big graphs"],
            ["best fit", "research, ad-hoc graph queries, education", "production code, very large instances"],
          ].map((row, i) => (
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
  );
}
const th = { padding: 6, textAlign: "left", borderBottom: "1px solid #ccc" };

// ============================================================
// Code block
// ============================================================
function CodeBlock({ code }) {
  return (
    <pre
      style={{
        background: "#1f1d1a",
        color: "#e8e2d4",
        padding: 14,
        borderRadius: 8,
        fontSize: 12,
        fontFamily: "'JetBrains Mono', Menlo, monospace",
        lineHeight: 1.55,
        whiteSpace: "pre",
        overflowX: "auto",
        margin: 0,
        maxHeight: 520,
        overflowY: "auto",
      }}
    >
      {code}
    </pre>
  );
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
          <b>Network problems are LPs in disguise.</b> The constraint
          matrix of any flow problem is the node-arc incidence matrix
          and is <i>totally unimodular</i> — so the LP relaxation
          always has an integer optimum. That's why we get away with
          continuous variables for integer flows.
        </li>
        <li>
          <b>Max-flow min-cut.</b> The max flow value equals the
          minimum cut capacity, where a cut is a set of arcs whose
          removal disconnects s from t. The duality is the
          archetypal LP duality, with shadow prices on conservation
          constraints recovering the cut variables.
        </li>
        <li>
          <b>Network simplex.</b> A specialized simplex method for
          flow problems where the basis is a spanning tree. Each
          pivot is O(log V) thanks to the tree structure, vs O(VE)
          for general simplex. NetworkX uses a Python implementation;
          OR-Tools wraps a fast C++ one.
        </li>
        <li>
          <b>Beyond toy graphs.</b> Real applications: airline crew
          scheduling, freight routing, internet routing protocols
          (OSPF), bipartite matching for ad allocation, supply chain
          pickup-and-delivery, image segmentation (max-flow), gene
          regulatory network inference.
        </li>
        <li>
          <b>What doesn't fit.</b> Multi-commodity flow (multiple
          source-sink pairs sharing capacity) is NOT solvable by
          either of these specialized solvers — it requires general
          LP. Use Gurobi/CPLEX or NetworkX's mcf for tractable cases.
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

const wordsStyle = {
  fontSize: 13.5,
  color: "#333",
  lineHeight: 1.55,
  maxWidth: 860,
  margin: "2px 0 10px",
};

// ============================================================
// Applications
// ============================================================
const APPLICATIONS = [
  {
    title: "Shortest path",
    color: "#0b3da0",
    items: [
      "GPS and mapping: fastest route between two addresses on a road network.",
      "Internet routing: packets follow least-cost paths chosen by routing protocols.",
      "Airline and transit itineraries: fewest hours (or dollars) from one city to another.",
      "Equipment replacement: nodes are years, arcs are 'keep until year j then replace,' and the shortest path is the cheapest replacement schedule.",
    ],
  },
  {
    title: "Max flow",
    color: "#c8311c",
    items: [
      "Pipeline and power-grid throughput: how much oil, gas, or electricity a network can deliver.",
      "Evacuation planning: how many people per hour can leave a building or region, and which exits are the bottleneck.",
      "Assigning workers to jobs: bipartite matching is a max-flow problem in disguise.",
      "Image segmentation: cutting an image into foreground and background is a min-cut, the dual of max flow.",
    ],
  },
  {
    title: "Min-cost flow",
    color: "#1f4e3d",
    items: [
      "Logistics and supply chains: ship goods from plants through warehouses to customers at least cost (the transportation and transshipment models of the book's modeling chapter).",
      "Airline fleet assignment: route aircraft through a time-space network to cover flights cheaply.",
      "Cash management: move money between accounts and time periods subject to limits and transaction costs.",
      "Job scheduling on machines with switching costs.",
    ],
  },
];

function ApplicationsPanel() {
  return (
    <div style={{ marginTop: 26 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10 }}>
        Where these problems show up
      </h2>
      <p style={{ fontSize: 13.5, color: "#444", maxWidth: 860, marginBottom: 12 }}>
        Network flow models are probably the most-used class of linear programs
        in practice, partly because the constraint matrices are so structured
        that specialized algorithms (like network simplex) solve enormous
        instances quickly, and partly because an integrality property comes for
        free: when capacities and demands are whole numbers, there is always a
        whole-number optimal flow, no integer programming required.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {APPLICATIONS.map((a) => (
          <div
            key={a.title}
            style={{
              border: "1px solid #ddd",
              borderTop: `3px solid ${a.color}`,
              borderRadius: 8,
              padding: "12px 14px",
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: a.color }}>
              {a.title}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#333", lineHeight: 1.5 }}>
              {a.items.map((it, i) => (
                <li key={i} style={{ marginBottom: 5 }}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
