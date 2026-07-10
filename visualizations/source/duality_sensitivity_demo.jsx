import React, { useState, useMemo } from "react";
import { Terminal } from "lucide-react";
import { Tex } from "./math.jsx";

/* ============================================================
   LP DUALITY & SENSITIVITY ANALYSIS
   ISE 5406

   2-variable LP, interactive. Slide the constraint RHS values
   and watch:
     • feasible region deform
     • optimal vertex jump
     • objective value change linearly
     • shadow prices (dual values) — slope of the objective
       w.r.t. each RHS
     • sensitivity ranges (SARHSLow / SARHSUp) — how far each
       RHS can move before the optimal basis changes

   Standard production LP:
       max  c1 x + c2 y
       s.t. a11 x + a12 y <= b1
            a21 x + a22 y <= b2
            x, y >= 0
   ============================================================ */

// ============================================================
// Problem (the classic "wood / labor" LP)
//   max  3 x + 5 y         (profit)
//   s.t. 2 x +   y <= b1    (wood)
//          x + 3 y <= b2    (labor)
//        x, y >= 0
// ============================================================
const C = [3, 5];
const A = [
  [2, 1], // wood
  [1, 3], // labor
];

function solveLP(b) {
  // 2D enumeration of vertices
  // Constraints: a11 x + a12 y <= b1, a21 x + a22 y <= b2, x>=0, y>=0
  const lines = [
    [A[0][0], A[0][1], b[0]], // wood
    [A[1][0], A[1][1], b[1]], // labor
    [1, 0, 0], // x = 0
    [0, 1, 0], // y = 0
  ];
  const vertices = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const [a1, b1, c1] = lines[i];
      const [a2, b2, c2] = lines[j];
      const det = a1 * b2 - a2 * b1;
      if (Math.abs(det) < 1e-9) continue;
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      const eps = 1e-9;
      if (
        x >= -eps &&
        y >= -eps &&
        A[0][0] * x + A[0][1] * y <= b[0] + eps &&
        A[1][0] * x + A[1][1] * y <= b[1] + eps
      ) {
        vertices.push({ x: Math.max(0, x), y: Math.max(0, y), pair: [i, j] });
      }
    }
  }
  if (vertices.length === 0) return { feasible: false };
  let best = vertices[0];
  let bestVal = C[0] * best.x + C[1] * best.y;
  for (const v of vertices) {
    const val = C[0] * v.x + C[1] * v.y;
    if (val > bestVal + 1e-9) {
      bestVal = val;
      best = v;
    }
  }
  // Identify which constraints are ACTIVE at the optimum (the basis).
  const slack = [
    b[0] - A[0][0] * best.x - A[0][1] * best.y,
    b[1] - A[1][0] * best.x - A[1][1] * best.y,
  ];
  const activeMask = [Math.abs(slack[0]) < 1e-7, Math.abs(slack[1]) < 1e-7];
  const xActive = best.x < 1e-7;
  const yActive = best.y < 1e-7;

  // Shadow prices — solve A^T y = c restricted to the active rows.
  // Cases (active set has 2 elements among {wood, labor, x>=0, y>=0}):
  let pi = [0, 0]; // dual on (wood, labor)
  let rc = [0, 0]; // reduced cost on (x, y)
  if (activeMask[0] && activeMask[1]) {
    // Both wood and labor active: solve [A] pi = c → pi = A^{-T} c
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    pi = [
      (A[1][1] * C[0] - A[1][0] * C[1]) / det,
      (-A[0][1] * C[0] + A[0][0] * C[1]) / det,
    ];
    rc = [0, 0];
  } else if (activeMask[0] && yActive) {
    // wood active, y = 0 ⇒ x*pi_wood = c_x, pi_wood = c_x / a_wood_x
    pi = [C[0] / A[0][0], 0];
    rc = [0, C[1] - pi[0] * A[0][1] - pi[1] * A[1][1]];
  } else if (activeMask[0] && xActive) {
    pi = [C[1] / A[0][1], 0];
    rc = [C[0] - pi[0] * A[0][0] - pi[1] * A[1][0], 0];
  } else if (activeMask[1] && yActive) {
    pi = [0, C[0] / A[1][0]];
    rc = [0, C[1] - pi[0] * A[0][1] - pi[1] * A[1][1]];
  } else if (activeMask[1] && xActive) {
    pi = [0, C[1] / A[1][1]];
    rc = [C[0] - pi[0] * A[0][0] - pi[1] * A[1][0], 0];
  } else if (xActive && yActive) {
    // Origin (degenerate)
    pi = [0, 0];
    rc = [...C];
  }

  // Sensitivity ranges on b.
  // For each constraint, find largest interval such that the optimal basis
  // is unchanged. Equivalently: vary b_k while keeping all 'currently
  // active' inequalities active and all 'currently inactive' inequalities
  // (including non-negativity) feasible.
  function rangeOnB(k) {
    let lo = -Infinity, hi = Infinity;
    // Try b' = b with b'[k] = b[k] + d. Walk d in both directions until
    // basis changes. We can compute analytically: x* and y* depend
    // linearly on b within the basis. Implement numerically with a fine
    // sweep.
    for (let d = 0.01; d < 30; d += 0.05) {
      const bUp = [...b];
      bUp[k] += d;
      const r = solveLPRaw(bUp, best.pair);
      if (!r.same) {
        hi = b[k] + d;
        break;
      }
    }
    for (let d = -0.01; d > -30; d -= 0.05) {
      const bDn = [...b];
      bDn[k] += d;
      if (bDn[k] < -1e-9) {
        lo = 0;
        break;
      }
      const r = solveLPRaw(bDn, best.pair);
      if (!r.same) {
        lo = b[k] + d;
        break;
      }
    }
    return [lo, hi];
  }

  const sa = [rangeOnB(0), rangeOnB(1)];

  return {
    feasible: true,
    x: best.x,
    y: best.y,
    obj: bestVal,
    vertices,
    activeMask,
    xActive,
    yActive,
    pi,
    rc,
    slack,
    sa,
    bestPair: best.pair,
  };
}

// Cheaper solve: returns whether the optimal basis is THE SAME as `targetPair`.
function solveLPRaw(b, targetPair) {
  const lines = [
    [A[0][0], A[0][1], b[0]],
    [A[1][0], A[1][1], b[1]],
    [1, 0, 0],
    [0, 1, 0],
  ];
  const vertices = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const [a1, b1, c1] = lines[i];
      const [a2, b2, c2] = lines[j];
      const det = a1 * b2 - a2 * b1;
      if (Math.abs(det) < 1e-9) continue;
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      const eps = 1e-9;
      if (
        x >= -eps &&
        y >= -eps &&
        A[0][0] * x + A[0][1] * y <= b[0] + eps &&
        A[1][0] * x + A[1][1] * y <= b[1] + eps
      ) {
        vertices.push({ x, y, pair: [i, j] });
      }
    }
  }
  if (vertices.length === 0) return { same: false };
  let best = vertices[0];
  let bestVal = C[0] * best.x + C[1] * best.y;
  for (const v of vertices) {
    const val = C[0] * v.x + C[1] * v.y;
    if (val > bestVal + 1e-9) {
      bestVal = val;
      best = v;
    }
  }
  const same =
    best.pair[0] === targetPair[0] && best.pair[1] === targetPair[1];
  return { same };
}

// ============================================================
// Main component
// ============================================================
export default function DualitySensitivityDemo() {
  const [b, setB] = useState([8, 6]);

  const sol = useMemo(() => solveLP(b), [b]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        LP Duality & Sensitivity Analysis
      </h1>
      <p style={{ color: "#666", marginBottom: 18, maxWidth: 880 }}>
        Slide the constraint right-hand-sides and watch the feasible region
        deform, the optimum jump from vertex to vertex, the objective
        change linearly, and the shadow prices update. Below, the dual
        problem is shown side-by-side with the primal — strong duality
        means both have the same optimal value.
      </p>

      <div style={problemBox}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              Primal LP (production planning)
            </div>
            <Tex block>
              {String.raw`\begin{aligned} \max\;\; & 3x + 5y \\ \text{s.t.}\;\; & 2x + y \le b_1 \quad (\pi_1, \text{wood}) \\ & x + 3y \le b_2 \quad (\pi_2, \text{labor}) \\ & x, y \ge 0 \end{aligned}`}
            </Tex>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              Dual LP (resource pricing)
            </div>
            <Tex block>
              {String.raw`\begin{aligned} \min\;\; & b_1 \pi_1 + b_2 \pi_2 \\ \text{s.t.}\;\; & 2\pi_1 + \pi_2 \ge 3 \quad (x) \\ & \pi_1 + 3\pi_2 \ge 5 \quad (y) \\ & \pi_1, \pi_2 \ge 0 \end{aligned}`}
            </Tex>
          </div>
        </div>
      </div>

      <div style={controlBox}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
          Tune the right-hand sides
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Slider
            label={
              <>
                <Tex>{`b_1`}</Tex> (wood capacity)
              </>
            }
            value={b[0]}
            onChange={(v) => setB([v, b[1]])}
            min={0}
            max={20}
            step={0.1}
          />
          <Slider
            label={
              <>
                <Tex>{`b_2`}</Tex> (labor capacity)
              </>
            }
            value={b[1]}
            onChange={(v) => setB([b[0], v])}
            min={0}
            max={20}
            step={0.1}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(440px, 1fr) minmax(440px, 1fr)",
          gap: 22,
          alignItems: "flex-start",
        }}
      >
        <FeasibleRegion sol={sol} b={b} />
        <DualRegion sol={sol} b={b} />
      </div>

      <DualityPanel sol={sol} b={b} />

      <ObjectiveVsRHS sol={sol} b={b} />

      <SensitivityRanges sol={sol} b={b} />
      <CodePanel />
      <PedagogicalNotes />
    </div>
  );
}

// ============================================================
// Slider with live readout
// ============================================================
function Slider({ label, value, onChange, min, max, step }) {
  return (
    <div>
      <div style={{ fontSize: 13, marginBottom: 4 }}>
        {label}: <b>{value.toFixed(1)}</b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ width: "100%" }}
      />
    </div>
  );
}

// ============================================================
// Feasible region + objective + sensitivity bands
// ============================================================
function FeasibleRegion({ sol, b }) {
  const W = 480, H = 480;
  const padL = 50, padR = 16, padT = 18, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xmin = -1, xmax = 12;
  const ymin = -1, ymax = 12;
  const xs = (x) => padL + ((x - xmin) / (xmax - xmin)) * chartW;
  const ys = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * chartH;

  let polyPts = [];
  if (sol.feasible) {
    const cx = sol.vertices.reduce((s, v) => s + v.x, 0) / sol.vertices.length;
    const cy = sol.vertices.reduce((s, v) => s + v.y, 0) / sol.vertices.length;
    polyPts = [...sol.vertices].sort(
      (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
    );
  }

  // Objective level lines through optimum + a couple lower
  const objLines = [];
  if (sol.feasible) {
    for (const dz of [-2, -1, 0]) {
      const z = sol.obj + dz * 4;
      // c1 x + c2 y = z, drawn in [xmin, xmax]
      const x1 = xmin, y1 = (z - C[0] * x1) / C[1];
      const x2 = xmax, y2 = (z - C[0] * x2) / C[1];
      objLines.push({ x1, y1, x2, y2, optimal: dz === 0 });
    }
  }

  return (
    <div style={panel}>
      <svg width={W} height={H}>
        {/* axes */}
        <line x1={padL} y1={ys(0)} x2={padL + chartW} y2={ys(0)} stroke="#888" />
        <line x1={xs(0)} y1={padT} x2={xs(0)} y2={padT + chartH} stroke="#888" />

        {/* grid */}
        {[2, 4, 6, 8, 10].map((v) => (
          <React.Fragment key={v}>
            <line x1={xs(v)} y1={padT} x2={xs(v)} y2={padT + chartH} stroke="#eee" strokeDasharray="2,3" />
            <line x1={padL} y1={ys(v)} x2={padL + chartW} y2={ys(v)} stroke="#eee" strokeDasharray="2,3" />
          </React.Fragment>
        ))}

        {/* feasible region */}
        {polyPts.length >= 3 && (
          <polygon
            points={polyPts.map((p) => `${xs(p.x)},${ys(p.y)}`).join(" ")}
            fill="rgba(31, 78, 61, 0.10)"
            stroke="#1f4e3d"
            strokeWidth={1.5}
          />
        )}

        {/* constraint lines */}
        <ConstraintLine
          a={A[0][0]} bb={A[0][1]} c={b[0]}
          xs={xs} ys={ys} xmin={xmin} xmax={xmax}
          color="#0b3da0"
          active={sol.feasible && sol.activeMask[0]}
          label="2x + y = b₁"
        />
        <ConstraintLine
          a={A[1][0]} bb={A[1][1]} c={b[1]}
          xs={xs} ys={ys} xmin={xmin} xmax={xmax}
          color="#7a3da0"
          active={sol.feasible && sol.activeMask[1]}
          label="x + 3y = b₂"
        />

        {/* objective level lines */}
        {objLines.map((l, i) => (
          <line
            key={i}
            x1={xs(l.x1)} y1={ys(l.y1)} x2={xs(l.x2)} y2={ys(l.y2)}
            stroke={l.optimal ? "#c8311c" : "#e5d8b8"}
            strokeWidth={l.optimal ? 2 : 1}
            strokeDasharray={l.optimal ? "" : "3,3"}
          />
        ))}

        {/* vertices */}
        {sol.feasible && sol.vertices.map((v, i) => (
          <circle
            key={i}
            cx={xs(v.x)}
            cy={ys(v.y)}
            r={4}
            fill="#fff"
            stroke="#1f4e3d"
            strokeWidth={1.5}
          />
        ))}

        {/* optimum */}
        {sol.feasible && (
          <>
            <circle cx={xs(sol.x)} cy={ys(sol.y)} r={8} fill="#c8311c" stroke="#fff" strokeWidth={2.5} />
            <text x={xs(sol.x) + 12} y={ys(sol.y) - 6} fontSize={12} fontFamily="monospace" fill="#c8311c" fontWeight={700}>
              ({sol.x.toFixed(2)}, {sol.y.toFixed(2)})
            </text>
            <text x={xs(sol.x) + 12} y={ys(sol.y) + 10} fontSize={11} fontFamily="monospace" fill="#c8311c">
              z = {sol.obj.toFixed(2)}
            </text>
          </>
        )}

        {/* labels */}
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <text key={`xl${v}`} x={xs(v)} y={padT + chartH + 14} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#666">
            {v}
          </text>
        ))}
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <text key={`yl${v}`} x={padL - 6} y={ys(v) + 3} textAnchor="end" fontSize={10} fontFamily="monospace" fill="#666">
            {v}
          </text>
        ))}
        <text x={padL + chartW - 8} y={ys(0) - 6} textAnchor="end" fontSize={11} fontFamily="monospace" fill="#666">
          x
        </text>
        <text x={xs(0) + 8} y={padT + 12} fontSize={11} fontFamily="monospace" fill="#666">
          y
        </text>
      </svg>
    </div>
  );
}

function ConstraintLine({ a, bb, c, xs, ys, xmin, xmax, color, active, label }) {
  // a x + bb y = c
  if (Math.abs(bb) > 1e-9) {
    const x1 = xmin, y1 = (c - a * x1) / bb;
    const x2 = xmax, y2 = (c - a * x2) / bb;
    return (
      <>
        <line
          x1={xs(x1)} y1={ys(y1)} x2={xs(x2)} y2={ys(y2)}
          stroke={color}
          strokeWidth={active ? 3 : 1.6}
        />
        {active && (
          <text x={xs(x2) - 6} y={ys(y2) - 4} textAnchor="end" fontSize={10} fontFamily="monospace" fill={color} fontWeight={700}>
            ★ active
          </text>
        )}
      </>
    );
  }
  return null;
}

// ============================================================
// Duality panel
// ============================================================
function DualityPanel({ sol, b }) {
  if (!sol.feasible) {
    return (
      <div style={panel}>
        <div style={{ fontWeight: 700, color: "#c8311c" }}>Infeasible</div>
        <div style={{ fontSize: 13 }}>The chosen RHS makes the LP infeasible (or has only the origin as a vertex).</div>
      </div>
    );
  }
  const primalObj = sol.obj;
  const dualObj = b[0] * sol.pi[0] + b[1] * sol.pi[1];
  return (
    <div style={panel}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        Primal & dual at the current optimum
      </div>
      <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13, borderCollapse: "collapse" }}>
        <tbody>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <td style={{ padding: 4 }}>
              <Tex>{`x^\\star`}</Tex>
            </td>
            <td style={{ padding: 4, textAlign: "right" }}>{sol.x.toFixed(4)}</td>
            <td style={{ padding: 4 }}>
              <Tex>{`y^\\star`}</Tex>
            </td>
            <td style={{ padding: 4, textAlign: "right" }}>{sol.y.toFixed(4)}</td>
          </tr>
          <tr>
            <td style={{ padding: 4 }} colSpan={2}>
              Primal obj <Tex>{`z^\\star = c^T x^\\star`}</Tex>
            </td>
            <td style={{ padding: 4, textAlign: "right", fontWeight: 700, color: "#c8311c" }} colSpan={2}>
              {primalObj.toFixed(4)}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <td style={{ padding: 4 }} colSpan={2}>
              Dual obj <Tex>{`b^T \\pi^\\star`}</Tex>
            </td>
            <td style={{ padding: 4, textAlign: "right", fontWeight: 700, color: "#c8311c" }} colSpan={2}>
              {dualObj.toFixed(4)}
            </td>
          </tr>
          <tr style={{ borderTop: "2px solid #444" }}>
            <td style={{ padding: 4, color: "#0b3da0" }}>π₁ (wood)</td>
            <td style={{ padding: 4, textAlign: "right", color: "#0b3da0", fontWeight: 700 }}>{sol.pi[0].toFixed(4)}</td>
            <td style={{ padding: 4, color: "#7a3da0" }}>π₂ (labor)</td>
            <td style={{ padding: 4, textAlign: "right", color: "#7a3da0", fontWeight: 700 }}>{sol.pi[1].toFixed(4)}</td>
          </tr>
          <tr>
            <td style={{ padding: 4 }} colSpan={2}>slack on wood</td>
            <td style={{ padding: 4, textAlign: "right" }} colSpan={2}>{sol.slack[0].toFixed(4)}</td>
          </tr>
          <tr>
            <td style={{ padding: 4 }} colSpan={2}>slack on labor</td>
            <td style={{ padding: 4, textAlign: "right" }} colSpan={2}>{sol.slack[1].toFixed(4)}</td>
          </tr>
          <tr>
            <td style={{ padding: 4 }} colSpan={2}>reduced cost (x)</td>
            <td style={{ padding: 4, textAlign: "right" }} colSpan={2}>{sol.rc[0].toFixed(4)}</td>
          </tr>
          <tr>
            <td style={{ padding: 4 }} colSpan={2}>reduced cost (y)</td>
            <td style={{ padding: 4, textAlign: "right" }} colSpan={2}>{sol.rc[1].toFixed(4)}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 12, padding: "8px 12px", background: "#fff8e1", border: "1px solid #f5d68d", borderRadius: 6, fontSize: 13, lineHeight: 1.5 }}>
        <b>Strong duality.</b> Primal obj = Dual obj at optimum (both LPs are feasible
        and bounded). <b>Complementary slackness:</b> πᵢ &gt; 0 ⇒ constraint i is
        tight; slack &gt; 0 ⇒ πᵢ = 0.
      </div>
    </div>
  );
}

// ============================================================
// Dual feasible region plot
//   min  b1 π1 + b2 π2
//   s.t. 2 π1 + π2 ≥ c1=3,  π1 + 3 π2 ≥ c2=5,  π1, π2 ≥ 0
// ============================================================
function DualRegion({ sol, b }) {
  const W = 480, H = 480;
  const padL = 50, padR = 16, padT = 18, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const piMax = 5;
  const xmin = -0.4, xmax = piMax + 0.2;
  const ymin = -0.4, ymax = piMax + 0.2;
  const xs = (x) => padL + ((x - xmin) / (xmax - xmin)) * chartW;
  const ys = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * chartH;

  // Dual constraints (≥): coefficients are columns of A; RHS is c.
  // Constraint k: A[0][k] π1 + A[1][k] π2 ≥ C[k]
  const dualLines = [
    [A[0][0], A[1][0], C[0]], // from x ≥ 0 → 2 π1 + π2 ≥ 3
    [A[0][1], A[1][1], C[1]], // from y ≥ 0 → π1 + 3 π2 ≥ 5
  ];

  // Compute dual-feasible polygon vertices inside [0, piMax]^2
  const vertices = useMemo(() => {
    const lines = [
      [dualLines[0][0], dualLines[0][1], dualLines[0][2]],
      [dualLines[1][0], dualLines[1][1], dualLines[1][2]],
      [1, 0, 0],            // π1 = 0
      [0, 1, 0],            // π2 = 0
      [1, 0, piMax],        // π1 = piMax
      [0, 1, piMax],        // π2 = piMax
    ];
    const pts = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const [a1, b1, c1] = lines[i];
        const [a2, b2, c2] = lines[j];
        const det = a1 * b2 - a2 * b1;
        if (Math.abs(det) < 1e-9) continue;
        const x = (c1 * b2 - c2 * b1) / det;
        const y = (a1 * c2 - a2 * c1) / det;
        const eps = 1e-7;
        // Must satisfy: dual constraints (≥), nonneg, ≤ piMax
        if (
          x >= -eps && y >= -eps &&
          x <= piMax + eps && y <= piMax + eps &&
          dualLines[0][0] * x + dualLines[0][1] * y >= dualLines[0][2] - eps &&
          dualLines[1][0] * x + dualLines[1][1] * y >= dualLines[1][2] - eps
        ) {
          pts.push({ x: Math.max(0, x), y: Math.max(0, y) });
        }
      }
    }
    return pts;
  }, []);

  // Sort by polar angle
  let polyPts = [];
  if (vertices.length >= 3) {
    const cx = vertices.reduce((s, v) => s + v.x, 0) / vertices.length;
    const cy = vertices.reduce((s, v) => s + v.y, 0) / vertices.length;
    polyPts = [...vertices].sort(
      (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
    );
  }

  // Dual objective level lines through optimum and lower
  const dualObjLines = [];
  if (sol.feasible) {
    const dualOpt = b[0] * sol.pi[0] + b[1] * sol.pi[1];
    for (const dz of [-3, -2, -1, 0, 1]) {
      const z = dualOpt + dz * Math.max(2, dualOpt * 0.25);
      // b1·π1 + b2·π2 = z, parameterize over π1
      let x1, y1, x2, y2;
      if (Math.abs(b[1]) > 1e-6) {
        x1 = xmin; y1 = (z - b[0] * x1) / b[1];
        x2 = xmax; y2 = (z - b[0] * x2) / b[1];
      } else if (Math.abs(b[0]) > 1e-6) {
        x1 = z / b[0]; y1 = ymin;
        x2 = z / b[0]; y2 = ymax;
      } else {
        continue;
      }
      dualObjLines.push({ x1, y1, x2, y2, optimal: dz === 0 });
    }
  }

  return (
    <div style={panel}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
        Dual feasible region — min b<sub>1</sub>π<sub>1</sub> + b<sub>2</sub>π<sub>2</sub>
      </div>
      <svg width={W} height={H}>
        {/* axes */}
        <line x1={padL} y1={ys(0)} x2={padL + chartW} y2={ys(0)} stroke="#888" />
        <line x1={xs(0)} y1={padT} x2={xs(0)} y2={padT + chartH} stroke="#888" />

        {/* grid */}
        {[1, 2, 3, 4, 5].map((v) => (
          <React.Fragment key={v}>
            <line x1={xs(v)} y1={padT} x2={xs(v)} y2={padT + chartH} stroke="#eee" strokeDasharray="2,3" />
            <line x1={padL} y1={ys(v)} x2={padL + chartW} y2={ys(v)} stroke="#eee" strokeDasharray="2,3" />
          </React.Fragment>
        ))}

        {/* feasible region (capped at piMax) */}
        {polyPts.length >= 3 && (
          <polygon
            points={polyPts.map((p) => `${xs(p.x)},${ys(p.y)}`).join(" ")}
            fill="rgba(122, 61, 160, 0.10)"
            stroke="#7a3da0"
            strokeWidth={1.5}
          />
        )}

        {/* dual constraint lines (rotated colors: x-constraint blue, y-constraint purple → match primal vars) */}
        <DualConstraintLine
          a={dualLines[0][0]} bb={dualLines[0][1]} c={dualLines[0][2]}
          xs={xs} ys={ys} xmin={xmin} xmax={xmax}
          color="#0b3da0"
          active={sol.feasible && Math.abs(sol.rc[0]) < 1e-6 && !sol.activeMask.every(() => false) && (sol.x > 1e-7)}
          label="2π₁ + π₂ = 3"
        />
        <DualConstraintLine
          a={dualLines[1][0]} bb={dualLines[1][1]} c={dualLines[1][2]}
          xs={xs} ys={ys} xmin={xmin} xmax={xmax}
          color="#7a3da0"
          active={sol.feasible && Math.abs(sol.rc[1]) < 1e-6 && (sol.y > 1e-7)}
          label="π₁ + 3π₂ = 5"
        />

        {/* dual obj level lines */}
        {dualObjLines.map((l, i) => (
          <line
            key={i}
            x1={xs(l.x1)} y1={ys(l.y1)} x2={xs(l.x2)} y2={ys(l.y2)}
            stroke={l.optimal ? "#c8311c" : "#e5d8b8"}
            strokeWidth={l.optimal ? 2 : 1}
            strokeDasharray={l.optimal ? "" : "3,3"}
          />
        ))}

        {/* vertices */}
        {vertices.map((v, i) => (
          <circle
            key={i}
            cx={xs(v.x)} cy={ys(v.y)}
            r={4} fill="#fff" stroke="#7a3da0" strokeWidth={1.5}
          />
        ))}

        {/* dual optimum */}
        {sol.feasible && (
          <>
            <circle cx={xs(sol.pi[0])} cy={ys(sol.pi[1])} r={8} fill="#c8311c" stroke="#fff" strokeWidth={2.5} />
            <text x={xs(sol.pi[0]) + 12} y={ys(sol.pi[1]) - 6} fontSize={12} fontFamily="monospace" fill="#c8311c" fontWeight={700}>
              π* = ({sol.pi[0].toFixed(2)}, {sol.pi[1].toFixed(2)})
            </text>
            <text x={xs(sol.pi[0]) + 12} y={ys(sol.pi[1]) + 10} fontSize={11} fontFamily="monospace" fill="#c8311c">
              bᵀπ = {(b[0] * sol.pi[0] + b[1] * sol.pi[1]).toFixed(2)}
            </text>
          </>
        )}

        {/* axis ticks */}
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <text key={`xl${v}`} x={xs(v)} y={padT + chartH + 14} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#666">
            {v}
          </text>
        ))}
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <text key={`yl${v}`} x={padL - 6} y={ys(v) + 3} textAnchor="end" fontSize={10} fontFamily="monospace" fill="#666">
            {v}
          </text>
        ))}
        <text x={padL + chartW - 8} y={ys(0) - 6} textAnchor="end" fontSize={11} fontFamily="monospace" fill="#666">
          π₁
        </text>
        <text x={xs(0) + 8} y={padT + 12} fontSize={11} fontFamily="monospace" fill="#666">
          π₂
        </text>
      </svg>
      <div style={{ fontSize: 12, color: "#555", marginTop: 4, lineHeight: 1.45 }}>
        Dual is a <i>minimization</i> over <Tex>{`(\\pi_1, \\pi_2) \\ge 0`}</Tex> — feasible region lies <i>above</i> the
        dual constraint lines (each primal variable contributes a dual constraint).
        Sliding <Tex>{`b_1, b_2`}</Tex> changes the dual <i>objective</i> (cost vector); the feasible region itself
        is fixed because it's set by the primal cost <Tex>{`c`}</Tex>.
      </div>
    </div>
  );
}

function DualConstraintLine({ a, bb, c, xs, ys, xmin, xmax, color, active, label }) {
  if (Math.abs(bb) > 1e-9) {
    const x1 = xmin, y1 = (c - a * x1) / bb;
    const x2 = xmax, y2 = (c - a * x2) / bb;
    return (
      <line x1={xs(x1)} y1={ys(y1)} x2={xs(x2)} y2={ys(y2)} stroke={color} strokeWidth={active ? 3 : 1.6} />
    );
  }
  return null;
}

// ============================================================
// Objective z* vs RHS chart — sweep each b_i, plot z*(b_i)
// ============================================================
function ObjectiveVsRHS({ sol, b }) {
  if (!sol.feasible) return null;
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        Optimal objective <Tex>{`z^\\star`}</Tex> as a function of each RHS
      </div>
      <div style={{ fontSize: 13, color: "#444", marginBottom: 10, lineHeight: 1.5 }}>
        Sweep one <Tex>{`b_i`}</Tex> while holding the other fixed at its
        current slider value. Inside the sensitivity range, the curve is a
        straight line with slope <Tex>{`\\pi_i`}</Tex> (the shadow price);
        outside, the basis changes and the slope drops or jumps.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <ZvsBChart whichB={0} b={b} sol={sol} />
        <ZvsBChart whichB={1} b={b} sol={sol} />
      </div>
    </div>
  );
}

function ZvsBChart({ whichB, b, sol }) {
  const W = 460, H = 280;
  const padL = 50, padR = 16, padT = 18, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const bMax = 22;

  // Sample b_i ∈ [0, bMax]
  const samples = useMemo(() => {
    const N = 240;
    const arr = [];
    for (let k = 0; k <= N; k++) {
      const v = (k / N) * bMax;
      const bb = [...b];
      bb[whichB] = v;
      const r = solveLP(bb);
      arr.push({ bi: v, z: r.feasible ? r.obj : null });
    }
    return arr;
  }, [whichB, b[1 - whichB]]);

  const zMax = Math.max(
    ...samples.map((s) => (s.z ?? 0)),
    sol.obj,
    1
  );
  const xs = (v) => padL + (v / bMax) * chartW;
  const ys = (z) => padT + (1 - z / (zMax * 1.15)) * chartH;

  // Sensitivity range bar for current b_i
  const [lo, hi] = sol.sa[whichB];
  const bMin = lo === -Infinity ? 0 : Math.max(0, lo);
  const bHi = hi === Infinity ? bMax : Math.min(bMax, hi);

  // Build path
  let path = "";
  for (let k = 0; k < samples.length; k++) {
    const s = samples[k];
    if (s.z === null) continue;
    path += (path === "" ? "M" : "L") + xs(s.bi) + "," + ys(s.z) + " ";
  }

  const colors = ["#0b3da0", "#7a3da0"];
  const labels = ["b₁ (wood)", "b₂ (labor)"];
  const piVal = sol.pi[whichB];

  return (
    <div>
      <div style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: colors[whichB] }}>{labels[whichB]}</span> &nbsp;
        slope at current point: <Tex>{`\\pi_${whichB + 1} = ${piVal.toFixed(3)}`}</Tex>
      </div>
      <svg width={W} height={H}>
        {/* axes */}
        <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="#888" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#888" />

        {/* sensitivity range band */}
        <rect
          x={xs(bMin)}
          y={padT}
          width={Math.max(2, xs(bHi) - xs(bMin))}
          height={chartH}
          fill={colors[whichB] + "18"}
        />

        {/* z* curve */}
        <path d={path} stroke={colors[whichB]} strokeWidth={2} fill="none" />

        {/* current point */}
        <line
          x1={xs(b[whichB])} y1={padT}
          x2={xs(b[whichB])} y2={padT + chartH}
          stroke="#c8311c" strokeDasharray="3,3" strokeWidth={1}
        />
        <circle cx={xs(b[whichB])} cy={ys(sol.obj)} r={6} fill="#c8311c" stroke="#fff" strokeWidth={2} />
        <text x={xs(b[whichB]) + 8} y={ys(sol.obj) - 8} fontSize={11} fontFamily="monospace" fill="#c8311c" fontWeight={700}>
          ({b[whichB].toFixed(1)}, {sol.obj.toFixed(2)})
        </text>

        {/* range bracket on x-axis */}
        <line x1={xs(bMin)} y1={padT + chartH + 4} x2={xs(bHi)} y2={padT + chartH + 4} stroke={colors[whichB]} strokeWidth={3} />
        <text x={(xs(bMin) + xs(bHi)) / 2} y={padT + chartH + 18} fontSize={10} textAnchor="middle" fontFamily="monospace" fill={colors[whichB]}>
          range [{lo === -Infinity ? "−∞" : lo.toFixed(1)}, {hi === Infinity ? "+∞" : hi.toFixed(1)}]
        </text>

        {/* x ticks */}
        {[0, 5, 10, 15, 20].map((v) => (
          <g key={v}>
            <line x1={xs(v)} y1={padT + chartH} x2={xs(v)} y2={padT + chartH + 3} stroke="#666" />
            <text x={xs(v)} y={padT + chartH + 32} fontSize={10} textAnchor="middle" fontFamily="monospace" fill="#666">
              {v}
            </text>
          </g>
        ))}
        {/* y ticks */}
        {(() => {
          const stepY = niceStep(zMax * 1.15 / 4);
          const ticks = [];
          for (let v = 0; v <= zMax * 1.15; v += stepY) ticks.push(v);
          return ticks.map((v) => (
            <g key={v}>
              <line x1={padL - 3} y1={ys(v)} x2={padL} y2={ys(v)} stroke="#666" />
              <text x={padL - 6} y={ys(v) + 3} fontSize={10} textAnchor="end" fontFamily="monospace" fill="#666">
                {v.toFixed(0)}
              </text>
            </g>
          ));
        })()}

        {/* axis labels */}
        <text x={padL + chartW} y={padT + chartH + 14} fontSize={11} fontFamily="monospace" fill="#666" textAnchor="end">
          b<tspan baselineShift="sub" fontSize="9">{whichB + 1}</tspan>
        </text>
        <text x={padL + 4} y={padT + 12} fontSize={11} fontFamily="monospace" fill="#666">
          z*
        </text>
      </svg>
    </div>
  );
}

function niceStep(v) {
  const exp = Math.floor(Math.log10(v));
  const f = v / Math.pow(10, exp);
  let nf;
  if (f < 1.5) nf = 1;
  else if (f < 3) nf = 2;
  else if (f < 7) nf = 5;
  else nf = 10;
  return nf * Math.pow(10, exp);
}

// ============================================================
// Sensitivity ranges panel
// ============================================================
function SensitivityRanges({ sol, b }) {
  if (!sol.feasible) return null;
  const labels = ["b₁ (wood)", "b₂ (labor)"];
  const colors = ["#0b3da0", "#7a3da0"];
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        Sensitivity ranges (RHS)
      </div>
      <div style={{ fontSize: 13, color: "#444", marginBottom: 8 }}>
        How far each <Tex>{`b_i`}</Tex> can move while the optimal basis stays
        the same. Inside the range, the optimum's objective changes linearly
        at slope <Tex>{`\\pi_i`}</Tex>; outside, the basis changes and a
        different vertex becomes optimal.
      </div>
      {[0, 1].map((i) => {
        const [lo, hi] = sol.sa[i];
        const W = 600;
        const span = 22;
        const toX = (v) => 12 + ((v - 0) / span) * (W - 24);
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 4 }}>
              {labels[i]}: current <b style={{ color: colors[i] }}>{b[i].toFixed(2)}</b>, range [
              {lo === -Infinity ? "−∞" : lo.toFixed(2)},{" "}
              {hi === Infinity ? "+∞" : hi.toFixed(2)}], shadow price π = {sol.pi[i].toFixed(3)}
            </div>
            <svg width={W} height={36}>
              <line x1={12} y1={18} x2={W - 12} y2={18} stroke="#ccc" strokeWidth={2} />
              {/* range bar */}
              <rect
                x={toX(Math.max(0, lo === -Infinity ? 0 : lo))}
                y={12}
                width={
                  toX(Math.min(span, hi === Infinity ? span : hi)) -
                  toX(Math.max(0, lo === -Infinity ? 0 : lo))
                }
                height={12}
                fill={colors[i] + "33"}
                stroke={colors[i]}
              />
              {/* current point */}
              <circle cx={toX(b[i])} cy={18} r={6} fill={colors[i]} />
              {/* tick labels */}
              {[0, 5, 10, 15, 20].map((t) => (
                <g key={t}>
                  <line x1={toX(t)} y1={28} x2={toX(t)} y2={32} stroke="#666" />
                  <text x={toX(t)} y={36} textAnchor="middle" fontSize={9} fill="#666" fontFamily="monospace">
                    {t}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Code panel — shows how to extract this info in PuLP/Gurobi
// ============================================================
function CodePanel() {
  return (
    <div style={{ ...panel, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
        Extracting duals & sensitivity in code
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Pre title="PuLP">
{`from pulp import *

m = LpProblem("prod", LpMaximize)
x = LpVariable("x", lowBound=0)
y = LpVariable("y", lowBound=0)
m += 3*x + 5*y
wood  = m.addConstraint(2*x + y <= 8)
labor = m.addConstraint(x + 3*y <= 6)
m.solve()

print("x*, y* =", x.value(), y.value())
# Duals on each constraint
for c in m.constraints.values():
    print(c.name, "π =", c.pi, "slack =", c.slack)
# Reduced costs
for v in m.variables():
    print(v.name, "rc =", v.dj)`}
        </Pre>
        <Pre title="Gurobi">
{`import gurobipy as gp
from gurobipy import GRB

m = gp.Model("prod")
x = m.addVar(name="x")
y = m.addVar(name="y")
m.setObjective(3*x + 5*y, GRB.MAXIMIZE)
wood  = m.addConstr(2*x + y <= 8, "wood")
labor = m.addConstr(x + 3*y <= 6, "labor")
m.optimize()

# Duals (.Pi), slack (.Slack), reduced costs (.RC)
for c in m.getConstrs():
    print(c.ConstrName, "π =", c.Pi, "slack =", c.Slack)
for v in m.getVars():
    print(v.VarName, "rc =", v.RC,
          "obj range [", v.SAObjLow, ",", v.SAObjUp, "]")
for c in m.getConstrs():
    print(c.ConstrName, "RHS range [",
          c.SARHSLow, ",", c.SARHSUp, "]")`}
        </Pre>
      </div>
    </div>
  );
}

function Pre({ title, children }) {
  return (
    <div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", marginBottom: 4 }}>
        {title}
      </div>
      <pre
        style={{
          background: "#1f1d1a",
          color: "#e8e2d4",
          padding: 12,
          borderRadius: 6,
          fontSize: 12,
          fontFamily: "'JetBrains Mono', Menlo, monospace",
          lineHeight: 1.55,
          margin: 0,
          whiteSpace: "pre",
          overflowX: "auto",
        }}
      >
        {children}
      </pre>
    </div>
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
          <b>Shadow price = marginal value.</b>{" "}
          <Tex>{`\\pi_i = \\partial z^\\star / \\partial b_i`}</Tex>{" "}
          on the interior of the sensitivity range. Loosening a constraint
          by one unit improves the optimal objective by{" "}
          <Tex>{`\\pi_i`}</Tex>.
        </li>
        <li>
          <b>Reduced cost = price of forcing a variable in.</b> If{" "}
          <Tex>{`x = 0`}</Tex> at the optimum, its reduced cost is the
          per-unit penalty for forcing one unit of <Tex>{`x`}</Tex> into
          the solution.
        </li>
        <li>
          <b>Complementary slackness.</b> For every constraint, either the
          slack is zero (constraint binds) or the dual is zero. No
          constraint pays you a positive shadow price unless it's binding.
        </li>
        <li>
          <b>Sensitivity range = 'basis lifetime'.</b> Inside the range
          the same optimal vertex stays optimal — only its coordinates
          shift linearly with <Tex>{`b`}</Tex>. Outside, a different
          basis takes over and the slope changes.
        </li>
        <li>
          <b>Strong duality.</b> If primal and dual are both feasible,
          they share the same optimal value:{" "}
          <Tex>{`z^\\star = b^T \\pi^\\star`}</Tex>. The dual variables
          live in the constraint-RHS units; the primal variables live
          in resource units. Each row of the constraint matrix has both
          a primal slack AND a dual price.
        </li>
        <li>
          <b>Use this in production.</b> A 1% change in feedstock cost?
          Multiply by the dual to see if you should re-solve.
          Capacity-expansion ROI? Compare the project cost to{" "}
          <Tex>{`\\pi_i`}</Tex> times the proposed expansion.
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
const controlBox = {
  marginBottom: 16,
  padding: "12px 16px",
  background: "#fff",
  border: "1px solid #e0d8c0",
  borderRadius: 8,
};
