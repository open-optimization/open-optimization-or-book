import React, { useState, useMemo } from "react";
import { Tex } from "./math.jsx";

/* ============================================================
   OBJECTIVE-LEVEL SLIDER — GILP-style
   ISE 5406

   Slide the objective value z and watch the level set move
   across the feasible region. The optimum is the largest /
   smallest z for which the level set still intersects the
   feasible region.

   Four tabs cover the canonical problem classes:
     • LP                   — linear obj on a polytope
     • IP                   — same LP, lattice points only
     • Convex NLP           — quadratic obj on a disk
     • Nonconvex NLP        — multi-modal obj on a box
   ============================================================ */

// ============================================================
// Tab registry
// ============================================================
const TABS = [
  { key: "lp", name: "LP" },
  { key: "ip", name: "IP" },
  { key: "convex", name: "Convex NLP" },
  { key: "nonconvex", name: "Nonconvex NLP" },
];

export default function ObjectiveSliderDemo() {
  const [tab, setTab] = useState("lp");
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Objective-Level Slider (GILP-style)
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        Slide the objective value <Tex>{`z`}</Tex>. The level set <Tex>{`\\{x : f(x) = z\\}`}</Tex>{" "}
        moves across the feasible region; the optimum is the extremal{" "}
        <Tex>{`z`}</Tex> for which the set still touches the region. This is
        the geometric picture every optimization algorithm is exploiting.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{ ...tabBtn, ...(t.key === tab ? tabBtnActive : {}) }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tab === "lp" && <LPTab />}
      {tab === "ip" && <IPTab />}
      {tab === "convex" && <ConvexTab />}
      {tab === "nonconvex" && <NonconvexTab />}

      <Notes />
    </div>
  );
}

// ============================================================
// 1) LP tab
//    max 3x + 5y  s.t. 2x+y ≤ 8, x+3y ≤ 6, x,y ≥ 0
// ============================================================
function LPTab() {
  const c = [3, 5];
  const A = [[2, 1], [1, 3]];
  const b = [8, 6];

  // Vertices (from earlier 2D code)
  const vertices = useMemo(() => {
    const lines = [
      [A[0][0], A[0][1], b[0]],
      [A[1][0], A[1][1], b[1]],
      [1, 0, 0], [0, 1, 0],
    ];
    const verts = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const [a1, b1, c1] = lines[i], [a2, b2, c2] = lines[j];
        const det = a1 * b2 - a2 * b1;
        if (Math.abs(det) < 1e-9) continue;
        const x = (c1 * b2 - c2 * b1) / det;
        const y = (a1 * c2 - a2 * c1) / det;
        const eps = 1e-7;
        if (x < -eps || y < -eps) continue;
        if (A[0][0] * x + A[0][1] * y > b[0] + eps) continue;
        if (A[1][0] * x + A[1][1] * y > b[1] + eps) continue;
        verts.push({ x, y });
      }
    }
    return verts;
  }, []);

  const zMin = 0;
  const zMax = c[0] * 3.6 + c[1] * 0.8 + 4; // optimum + slack
  const [z, setZ] = useState(zMax * 0.4);

  return (
    <div style={panel}>
      <FormulaHeader formula={String.raw`\max\;\; 3x + 5y \quad \text{s.t.}\quad 2x + y \le 8,\;\; x + 3y \le 6,\;\; x, y \ge 0`} />
      <Slider z={z} setZ={setZ} min={zMin} max={zMax} />
      <Plot2D vertices={vertices} c={c} z={z} optZ={14.8} optX={3.6} optY={0.8} />
      <Verdict
        z={z}
        optZ={14.8}
        msgFeasible={"Level line cuts THROUGH the polytope — there are feasible points with this z. The slider can keep going up."}
        msgOptimal={"At z = 14.8 the level line just kisses the optimal vertex (3.6, 0.8). Any higher and the line lies entirely outside."}
        msgInfeasible={"Level line is OUTSIDE the polytope — no feasible point achieves this z. The optimum is below."}
      />
    </div>
  );
}

// ============================================================
// 2) IP tab
//    max 3x + 5y  s.t. 2x+y ≤ 8, x+3y ≤ 6, x,y ≥ 0, integer
// ============================================================
function IPTab() {
  const c = [3, 5];
  const A = [[2, 1], [1, 3]];
  const b = [8, 6];

  // LP feasible polytope vertices (for outline)
  const vertices = useMemo(() => {
    const lines = [
      [A[0][0], A[0][1], b[0]],
      [A[1][0], A[1][1], b[1]],
      [1, 0, 0], [0, 1, 0],
    ];
    const verts = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const [a1, b1, c1] = lines[i], [a2, b2, c2] = lines[j];
        const det = a1 * b2 - a2 * b1;
        if (Math.abs(det) < 1e-9) continue;
        const x = (c1 * b2 - c2 * b1) / det;
        const y = (a1 * c2 - a2 * c1) / det;
        const eps = 1e-7;
        if (x < -eps || y < -eps) continue;
        if (A[0][0] * x + A[0][1] * y > b[0] + eps) continue;
        if (A[1][0] * x + A[1][1] * y > b[1] + eps) continue;
        verts.push({ x, y });
      }
    }
    return verts;
  }, []);

  // All integer points inside feasible region
  const lattice = useMemo(() => {
    const pts = [];
    for (let x = 0; x <= 4; x++) {
      for (let y = 0; y <= 6; y++) {
        if (A[0][0] * x + A[0][1] * y <= b[0] + 1e-9 &&
            A[1][0] * x + A[1][1] * y <= b[1] + 1e-9) {
          pts.push({ x, y, z: c[0] * x + c[1] * y });
        }
      }
    }
    return pts;
  }, []);

  // IP optimum
  const optPt = lattice.reduce((best, p) => (p.z > best.z ? p : best), lattice[0]);

  const [z, setZ] = useState(8);
  return (
    <div style={panel}>
      <FormulaHeader formula={String.raw`\max\;\; 3x + 5y \quad \text{s.t.}\quad 2x + y \le 8,\;\; x + 3y \le 6,\;\; x, y \in \mathbb{Z}_{\ge 0}`} />
      <Slider z={z} setZ={setZ} min={0} max={16} />
      <Plot2D
        vertices={vertices}
        c={c}
        z={z}
        optZ={optPt.z}
        optX={optPt.x}
        optY={optPt.y}
        lattice={lattice}
      />
      <Verdict
        z={z}
        optZ={optPt.z}
        msgFeasible={`Some integer points are at or above this z — the IP optimum is at least ${z.toFixed(1)} so far.`}
        msgOptimal={`At z = ${optPt.z} the level line passes through the IP optimum (${optPt.x}, ${optPt.y}). The LP relaxation reaches z = 14.8 — that's the gap caused by integrality.`}
        msgInfeasible={`No integer point achieves this z. The IP optimum is below: z* = ${optPt.z} at (${optPt.x}, ${optPt.y}).`}
      />
      <div style={{ marginTop: 8, fontSize: 12, color: "#555", lineHeight: 1.5 }}>
        Note the <b>integrality gap</b>: the LP relaxation has optimum 14.8 (continuous), but
        the integer optimum is only {optPt.z}. That gap is what branch-and-bound chases shut.
      </div>
    </div>
  );
}

// ============================================================
// 3) Convex NLP tab
//    min (x-3)² + (y-3)²  s.t.  x² + y² ≤ 4,  x, y ≥ 0
// ============================================================
function ConvexTab() {
  // Closest point on disk to (3,3): along direction (1,1)/√2 at radius 2 → (√2, √2)
  const optX = Math.sqrt(2), optY = Math.sqrt(2);
  const optZ = (3 - optX) ** 2 + (3 - optY) ** 2;

  const [z, setZ] = useState(8);
  return (
    <div style={panel}>
      <FormulaHeader formula={String.raw`\min\;\; (x-3)^2 + (y-3)^2 \quad \text{s.t.}\quad x^2 + y^2 \le 4,\;\; x, y \ge 0`} />
      <Slider z={z} setZ={setZ} min={0} max={20} label="z (level)" />
      <PlotConvex z={z} optX={optX} optY={optY} optZ={optZ} />
      <Verdict
        z={z}
        optZ={optZ}
        sense="min"
        msgFeasible={`Level circle (radius √z around the target (3,3)) reaches inside the disk — there are feasible points with f(x) ≤ ${z.toFixed(2)}. The optimum is somewhere lower.`}
        msgOptimal={`At z ≈ ${optZ.toFixed(2)} the level circle is tangent to the disk boundary at (√2, √2). That's the closest feasible point to (3,3).`}
        msgInfeasible={`Level circle is too small — it doesn't reach the disk yet. No feasible point has f(x) ≤ ${z.toFixed(2)}.`}
      />
      <div style={{ marginTop: 8, fontSize: 12, color: "#555", lineHeight: 1.5 }}>
        The level sets are CIRCLES (round, convex). The feasible region is a quarter-disk
        (also convex). A convex problem has exactly one local optimum — and it's global.
      </div>
    </div>
  );
}

// ============================================================
// 4) Nonconvex NLP tab
//    min (x²−4)² + (y²−4)²  s.t. −3 ≤ x ≤ 3, −3 ≤ y ≤ 3
//    Four global minima at (±2, ±2), all with z = 0.
// ============================================================
function NonconvexTab() {
  const minima = [
    { x: 2, y: 2 }, { x: 2, y: -2 }, { x: -2, y: 2 }, { x: -2, y: -2 },
  ];
  const [z, setZ] = useState(4);
  return (
    <div style={panel}>
      <FormulaHeader formula={String.raw`\min\;\; (x^2-4)^2 + (y^2-4)^2 \quad \text{s.t.}\quad -3 \le x \le 3,\;\; -3 \le y \le 3`} />
      <Slider z={z} setZ={setZ} min={0} max={50} label="z (level)" />
      <PlotNonconvex z={z} minima={minima} />
      <Verdict
        z={z}
        optZ={0}
        sense="min"
        msgFeasible={`Level set {f(x) ≤ ${z.toFixed(1)}} is non-empty — there are feasible points with this z value. Notice it can be MULTIPLE disjoint regions.`}
        msgOptimal={`At z = 0 the level set collapses to FOUR points: (±2, ±2). All are global minima — hallmark of a multimodal nonconvex landscape.`}
        msgInfeasible={`Below z = 0 is impossible — the objective is a sum of squares.`}
      />
      <div style={{ marginTop: 8, fontSize: 12, color: "#555", lineHeight: 1.5 }}>
        Watch the level set shrink as z → 0: it splits into <b>four separate basins</b>,
        each shrinking to one of the global minima. A local-search algorithm starting in
        any basin gets trapped — global optimization needs to know about all four.
      </div>
    </div>
  );
}

// ============================================================
// 2D plot for LP / IP — feasible polytope + objective level line
// ============================================================
function Plot2D({ vertices, c, z, optZ, optX, optY, lattice }) {
  const W = 540, H = 460;
  const padL = 50, padR = 16, padT = 18, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xmin = -0.5, xmax = 8;
  const ymin = -0.5, ymax = 7;
  const xs = (x) => padL + ((x - xmin) / (xmax - xmin)) * chartW;
  const ys = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * chartH;

  // Sort vertices for polygon
  let polyPts = vertices;
  if (vertices.length >= 3) {
    const cx = vertices.reduce((s, v) => s + v.x, 0) / vertices.length;
    const cy = vertices.reduce((s, v) => s + v.y, 0) / vertices.length;
    polyPts = [...vertices].sort(
      (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
    );
  }

  // Level line: c[0]*x + c[1]*y = z. If c[1] != 0, y = (z - c[0]*x) / c[1].
  let lineX1 = xmin, lineY1 = (z - c[0] * xmin) / c[1];
  let lineX2 = xmax, lineY2 = (z - c[0] * xmax) / c[1];

  // Feasibility check for current z
  const feasibleAtZ = lattice
    ? lattice.some((p) => Math.abs(p.z - z) < 0.5 || p.z >= z)
    : z <= optZ + 1e-6;

  return (
    <svg width={W} height={H}>
      {/* axes */}
      <line x1={padL} y1={ys(0)} x2={padL + chartW} y2={ys(0)} stroke="#888" />
      <line x1={xs(0)} y1={padT} x2={xs(0)} y2={padT + chartH} stroke="#888" />
      {/* grid */}
      {[1, 2, 3, 4, 5, 6, 7].map((v) => (
        <React.Fragment key={v}>
          <line x1={xs(v)} y1={padT} x2={xs(v)} y2={padT + chartH} stroke="#eee" strokeDasharray="2,3" />
          <line x1={padL} y1={ys(v)} x2={padL + chartW} y2={ys(v)} stroke="#eee" strokeDasharray="2,3" />
        </React.Fragment>
      ))}

      {/* feasible region */}
      {polyPts.length >= 3 && (
        <polygon
          points={polyPts.map((p) => `${xs(p.x)},${ys(p.y)}`).join(" ")}
          fill="rgba(31, 78, 61, 0.12)"
          stroke="#1f4e3d"
          strokeWidth={1.5}
        />
      )}

      {/* lattice points (IP only) */}
      {lattice && lattice.map((p, i) => (
        <circle
          key={i}
          cx={xs(p.x)} cy={ys(p.y)}
          r={4.5}
          fill={p.z >= z - 1e-9 ? "#c8311c" : "#999"}
          stroke="#fff" strokeWidth={1}
        />
      ))}
      {lattice && lattice.map((p, i) => (
        <text
          key={`l${i}`}
          x={xs(p.x) + 6} y={ys(p.y) - 6}
          fontSize={10} fontFamily="monospace"
          fill={p.z >= z - 1e-9 ? "#c8311c" : "#666"}
        >
          {p.z}
        </text>
      ))}

      {/* level line */}
      <line
        x1={xs(lineX1)} y1={ys(lineY1)}
        x2={xs(lineX2)} y2={ys(lineY2)}
        stroke={feasibleAtZ ? "#0b3da0" : "#c8311c"}
        strokeWidth={2.5}
        strokeDasharray="6,3"
      />
      <text
        x={xs(xmax) - 6} y={ys(lineY2) - 4}
        fontSize={12} fontFamily="monospace"
        fill={feasibleAtZ ? "#0b3da0" : "#c8311c"}
        fontWeight={700}
        textAnchor="end"
      >
        {`${c[0]}x + ${c[1]}y = ${z.toFixed(1)}`}
      </text>

      {/* optimum marker */}
      <circle cx={xs(optX)} cy={ys(optY)} r={7} fill="#1f4e3d" stroke="#fff" strokeWidth={2} />
      <text x={xs(optX) + 10} y={ys(optY) + 16} fontSize={11} fontFamily="monospace" fill="#1f4e3d" fontWeight={700}>
        optimum
      </text>

      {/* axis labels */}
      <text x={padL + chartW - 4} y={ys(0) - 4} fontSize={11} fontFamily="monospace" fill="#666" textAnchor="end">x</text>
      <text x={xs(0) + 6} y={padT + 12} fontSize={11} fontFamily="monospace" fill="#666">y</text>
    </svg>
  );
}

// ============================================================
// Convex NLP plot — disk feasible + circle level set
// ============================================================
function PlotConvex({ z, optX, optY, optZ }) {
  const W = 540, H = 460;
  const padL = 50, padR = 16, padT = 18, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xmin = -0.5, xmax = 4;
  const ymin = -0.5, ymax = 4;
  const xs = (x) => padL + ((x - xmin) / (xmax - xmin)) * chartW;
  const ys = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * chartH;

  // Feasible disk: x²+y² ≤ 4, x,y ≥ 0 (quarter disk)
  // Approximate boundary as polygon
  const N = 60;
  const arc = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * (Math.PI / 2);
    arc.push({ x: 2 * Math.cos(t), y: 2 * Math.sin(t) });
  }
  // Add corners (0,0)
  const polygonPts = [{ x: 0, y: 0 }, ...arc];

  // Level circle around (3, 3) with radius sqrt(z)
  const r = Math.sqrt(Math.max(0, z));
  const cxC = 3, cyC = 3;

  // Determine if level set intersects feasible region
  // Distance from (3,3) to origin: √18 ≈ 4.24. Disk radius 2. Closest feasible point distance = √18 - 2 ≈ 2.24.
  const minFeasDist = Math.sqrt(18) - 2;
  const feasibleAtZ = r >= minFeasDist - 1e-6;

  return (
    <svg width={W} height={H}>
      <line x1={padL} y1={ys(0)} x2={padL + chartW} y2={ys(0)} stroke="#888" />
      <line x1={xs(0)} y1={padT} x2={xs(0)} y2={padT + chartH} stroke="#888" />
      {[1, 2, 3].map((v) => (
        <React.Fragment key={v}>
          <line x1={xs(v)} y1={padT} x2={xs(v)} y2={padT + chartH} stroke="#eee" strokeDasharray="2,3" />
          <line x1={padL} y1={ys(v)} x2={padL + chartW} y2={ys(v)} stroke="#eee" strokeDasharray="2,3" />
        </React.Fragment>
      ))}

      {/* Feasible region */}
      <polygon
        points={polygonPts.map((p) => `${xs(p.x)},${ys(p.y)}`).join(" ")}
        fill="rgba(31, 78, 61, 0.12)"
        stroke="#1f4e3d"
        strokeWidth={1.5}
      />

      {/* Target point (objective center) */}
      <circle cx={xs(cxC)} cy={ys(cyC)} r={4} fill="#7a3da0" />
      <text x={xs(cxC) + 8} y={ys(cyC)} fontSize={11} fontFamily="monospace" fill="#7a3da0">target (3, 3)</text>

      {/* Level circle */}
      <circle
        cx={xs(cxC)} cy={ys(cyC)}
        r={r * (chartW / (xmax - xmin))}
        fill="none"
        stroke={feasibleAtZ ? "#0b3da0" : "#c8311c"}
        strokeWidth={2.5}
        strokeDasharray="6,3"
      />
      <text x={xs(cxC) - r * (chartW / (xmax - xmin)) - 4} y={ys(cyC) - 4} fontSize={11} fontFamily="monospace" fill={feasibleAtZ ? "#0b3da0" : "#c8311c"} fontWeight={700} textAnchor="end">
        f(x) = {z.toFixed(2)}
      </text>

      {/* Optimum */}
      <circle cx={xs(optX)} cy={ys(optY)} r={7} fill="#1f4e3d" stroke="#fff" strokeWidth={2} />
      <text x={xs(optX) + 10} y={ys(optY) + 16} fontSize={11} fontFamily="monospace" fill="#1f4e3d" fontWeight={700}>
        optimum (√2, √2), f={optZ.toFixed(2)}
      </text>

      {/* Axis labels */}
      <text x={padL + chartW - 4} y={ys(0) - 4} fontSize={11} fontFamily="monospace" fill="#666" textAnchor="end">x</text>
      <text x={xs(0) + 6} y={padT + 12} fontSize={11} fontFamily="monospace" fill="#666">y</text>
    </svg>
  );
}

// ============================================================
// Nonconvex NLP plot — multimodal level sets via marching squares
// f(x,y) = (x²-4)² + (y²-4)²
// ============================================================
function PlotNonconvex({ z, minima }) {
  const W = 540, H = 460;
  const padL = 50, padR = 16, padT = 18, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xmin = -3.2, xmax = 3.2;
  const ymin = -3.2, ymax = 3.2;
  const xs = (x) => padL + ((x - xmin) / (xmax - xmin)) * chartW;
  const ys = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * chartH;

  function f(x, y) { return (x * x - 4) ** 2 + (y * y - 4) ** 2; }

  // Marching squares for level f(x,y) = z
  const segments = useMemo(() => {
    const N = 80;
    const dx = (xmax - xmin) / N;
    const dy = (ymax - ymin) / N;
    const grid = [];
    for (let i = 0; i <= N; i++) {
      const row = [];
      for (let j = 0; j <= N; j++) {
        row.push(f(xmin + i * dx, ymin + j * dy));
      }
      grid.push(row);
    }
    const segs = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x0 = xmin + i * dx, y0 = ymin + j * dy;
        const x1 = x0 + dx, y1 = y0 + dy;
        const v00 = grid[i][j], v10 = grid[i + 1][j], v01 = grid[i][j + 1], v11 = grid[i + 1][j + 1];
        const c00 = v00 > z, c10 = v10 > z, c01 = v01 > z, c11 = v11 > z;
        const code = (c00 ? 1 : 0) | (c10 ? 2 : 0) | (c11 ? 4 : 0) | (c01 ? 8 : 0);
        if (code === 0 || code === 15) continue;
        // Edge interpolation
        function lerp(va, vb, ax, ay, bx, by) {
          const t = (z - va) / (vb - va);
          return [ax + (bx - ax) * t, ay + (by - ay) * t];
        }
        const e0 = (c00 !== c10) ? lerp(v00, v10, x0, y0, x1, y0) : null; // bottom
        const e1 = (c10 !== c11) ? lerp(v10, v11, x1, y0, x1, y1) : null; // right
        const e2 = (c11 !== c01) ? lerp(v11, v01, x1, y1, x0, y1) : null; // top
        const e3 = (c01 !== c00) ? lerp(v01, v00, x0, y1, x0, y0) : null; // left
        const pts = [e0, e1, e2, e3].filter((p) => p);
        if (pts.length === 2) segs.push([pts[0], pts[1]]);
        else if (pts.length === 4) {
          // Saddle: connect (e0-e1) (e2-e3) — not quite right for ambiguous case but visually OK
          segs.push([pts[0], pts[1]]);
          segs.push([pts[2], pts[3]]);
        }
      }
    }
    return segs;
  }, [z]);

  // Background heatmap (low-res shading)
  const cells = useMemo(() => {
    const out = [];
    const N = 30;
    const dx = (xmax - xmin) / N, dy = (ymax - ymin) / N;
    let maxV = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = xmin + (i + 0.5) * dx, y = ymin + (j + 0.5) * dy;
        const v = f(x, y);
        if (v > maxV) maxV = v;
        out.push({ x, y, v, dx, dy });
      }
    }
    return { cells: out, maxV };
  }, []);

  return (
    <svg width={W} height={H}>
      {/* Heatmap (back) */}
      {cells.cells.map((c, i) => {
        const intensity = Math.min(1, c.v / 30);
        const r = Math.round(255 - intensity * 100);
        const g = Math.round(248 - intensity * 80);
        const b = Math.round(225 - intensity * 130);
        return (
          <rect
            key={i}
            x={xs(c.x - c.dx / 2)} y={ys(c.y + c.dy / 2)}
            width={chartW / 30} height={chartH / 30}
            fill={`rgb(${r}, ${g}, ${b})`}
          />
        );
      })}

      {/* Axes */}
      <line x1={padL} y1={ys(0)} x2={padL + chartW} y2={ys(0)} stroke="#888" />
      <line x1={xs(0)} y1={padT} x2={xs(0)} y2={padT + chartH} stroke="#888" />

      {/* Level set segments */}
      {segments.map((seg, i) => (
        <line
          key={i}
          x1={xs(seg[0][0])} y1={ys(seg[0][1])}
          x2={xs(seg[1][0])} y2={ys(seg[1][1])}
          stroke="#0b3da0" strokeWidth={2}
        />
      ))}

      {/* Minima */}
      {minima.map((m, i) => (
        <g key={i}>
          <circle cx={xs(m.x)} cy={ys(m.y)} r={6} fill="#1f4e3d" stroke="#fff" strokeWidth={2} />
          <text x={xs(m.x) + 8} y={ys(m.y) + 4} fontSize={10} fontFamily="monospace" fill="#1f4e3d" fontWeight={700}>
            ({m.x}, {m.y})
          </text>
        </g>
      ))}

      <text x={padL + chartW - 4} y={ys(0) - 4} fontSize={11} fontFamily="monospace" fill="#666" textAnchor="end">x</text>
      <text x={xs(0) + 6} y={padT + 12} fontSize={11} fontFamily="monospace" fill="#666">y</text>

      <text x={padL + 4} y={padT + chartH - 6} fontSize={10} fontFamily="monospace" fill="#0b3da0" fontWeight={700}>
        level set f(x) = {z.toFixed(1)}
      </text>
    </svg>
  );
}

// ============================================================
// Reusable bits
// ============================================================
function FormulaHeader({ formula }) {
  return (
    <div style={{ marginBottom: 12, padding: "10px 14px", background: "#f6f4ee", border: "1px solid #ece8dd", borderRadius: 6 }}>
      <Tex block>{formula}</Tex>
    </div>
  );
}

function Slider({ z, setZ, min, max, label = "z (objective level)" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, marginBottom: 4 }}>
        {label}: <b>{z.toFixed(2)}</b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={(max - min) / 200}
        value={z}
        onChange={(e) => setZ(+e.target.value)}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function Verdict({ z, optZ, sense = "max", msgFeasible, msgOptimal, msgInfeasible }) {
  // For max: feasible if z <= optZ; infeasible if z > optZ
  // For min: feasible if z >= optZ; infeasible if z < optZ
  const eps = 0.05;
  let state, msg;
  if (Math.abs(z - optZ) < eps) {
    state = "optimal"; msg = msgOptimal;
  } else if ((sense === "max" && z < optZ) || (sense === "min" && z > optZ)) {
    state = "feasible"; msg = msgFeasible;
  } else {
    state = "infeasible"; msg = msgInfeasible;
  }
  const colors = {
    feasible: { bg: "#e8eef5", border: "#0b3da0", txt: "#0b3da0" },
    optimal: { bg: "#e8f5e9", border: "#1f4e3d", txt: "#1f4e3d" },
    infeasible: { bg: "#fde8e8", border: "#c8311c", txt: "#c8311c" },
  };
  const c = colors[state];
  return (
    <div style={{ marginTop: 10, padding: "10px 14px", background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 6, fontSize: 13.5, lineHeight: 1.55, color: "#222" }}>
      <span style={{ fontWeight: 700, color: c.txt, textTransform: "uppercase", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.12em", marginRight: 8 }}>
        {state}
      </span>
      {msg}
    </div>
  );
}

function Notes() {
  return (
    <div style={{ marginTop: 22, padding: 16, background: "#fff8e1", borderRadius: 10, border: "1px solid #f5d68d" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Notes for class</div>
      <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.6, fontSize: 14, color: "#3d2f00" }}>
        <li>
          <b>The optimum is where the level set <i>just barely</i> kisses the feasible region.</b> For LP, this happens at a vertex (or along an edge if the objective is parallel to it). For convex NLP it can happen anywhere on the boundary. For nonconvex problems, MULTIPLE places can host equal-quality minima.
        </li>
        <li>
          <b>Geometric difference between LP and IP.</b> The LP optimum is at a vertex of the polytope; the IP optimum is at a lattice point, which is usually NOT a vertex. The integrality gap is exactly the difference between these two optima.
        </li>
        <li>
          <b>Convex vs nonconvex.</b> Convex problems have a single global optimum that any "downhill" algorithm finds. Nonconvex problems have multiple local optima — local search gets stuck; global methods need either (i) stochastic restarts, (ii) branch-and-bound on a global relaxation, or (iii) algebraic / certificate methods.
        </li>
        <li>
          <b>The slider as a thought tool.</b> For any LP/NLP, ask: "if I slide z up, when does the level set stop intersecting the feasible region?" That moment is the optimum. Every algorithm we study is an efficient way of finding that moment without literally sliding.
        </li>
      </ul>
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
const panel = {
  background: "#fafafa",
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 14,
};
