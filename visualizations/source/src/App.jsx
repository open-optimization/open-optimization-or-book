import React, { useEffect, useState } from 'react';
import ModelingIntroduction from '../modeling_introduction.jsx';
import ExcelSolverDemo from '../excel_solver_demo.jsx';
import NetworkFlowDemo from '../network_flow_demo.jsx';
import ObjectiveSliderDemo from '../objective_slider_demo.jsx';
import SimplexDictionaryDemo from '../simplex_dictionary_demo.jsx';
import TwoPhaseSimplexDemo from '../two_phase_simplex_demo.jsx';
import SimplexTableauDemo from '../simplex_tableau_demo.jsx';
import TableauPivoterDemo from '../tableau_pivoter_demo.jsx';
import SensitivityWalkthroughDemo from '../sensitivity_walkthrough_demo.jsx';
import DualitySensitivityDemo from '../duality_sensitivity_demo.jsx';
import DualConstructionDemo from '../dual_construction_demo.jsx';
import LpSolversDemo from '../lp_solvers_demo.jsx';
import BranchBoundDemo from '../branch_bound_demo.jsx';
import GanttDemo from '../gantt_demo.jsx';
import DualSimplexDemo from '../dual_simplex_demo.jsx';
import QuizDemo from '../quiz_demo.jsx';

// Demos grouped to follow Book 1 (Linear and Integer Programming).
const GROUPS = [
  {
    heading: 'Modeling (Chapters 2-4)',
    demos: [
      { id: 'modeling-intro', title: 'From Words to Math: Modeling Introduction', description: 'Translate a real problem into variables, objective, and constraints, step by step.', Component: ModelingIntroduction },
      { id: 'excel-solver', title: 'Excel Solver Walkthrough', description: 'Set up and solve an LP in a spreadsheet: cells, formulas, and the Solver dialog.', Component: ExcelSolverDemo },
      { id: 'network-flow', title: 'Network Flow Problems', description: 'Min-cost flow, transportation, and shortest path on interactive networks.', Component: NetworkFlowDemo },
    ],
  },
  {
    heading: 'Geometry of Linear Programs (Chapters 5-6)',
    demos: [
      { id: 'objective-slider', title: 'Objective-Level Slider', description: 'Drag the objective level line across the feasible region and watch where optima land.', Component: ObjectiveSliderDemo },
    ],
  },
  {
    heading: 'The Simplex Method (Chapters 7-9)',
    demos: [
      { id: 'simplex-dictionary', title: 'Simplex Pivoter: Dictionary Form', description: 'Pick the entering variable and ratio-test row yourself; the dictionary rewrites live. Includes the bakery example from the book and custom problems.', Component: SimplexDictionaryDemo },
      { id: 'simplex-tableau', title: 'Simplex Pivoter: Tableau Form', description: 'The same pivoting mechanics in tableau form, with every row operation shown.', Component: SimplexTableauDemo },
      { id: 'tableau-pivoter', title: 'Free Tableau Pivoter', description: 'A Gauss-Jordan pivot sandbox: pivot on any entry and see the consequences.', Component: TableauPivoterDemo },
      { id: 'two-phase-simplex', title: 'Two-Phase Simplex', description: 'When the origin is not feasible: artificial variables, Phase 1, and the handoff to Phase 2.', Component: TwoPhaseSimplexDemo },
    ],
  },
  {
    heading: 'Sensitivity and Duality (Chapters 10-11)',
    demos: [
      { id: 'sensitivity-walkthrough', title: 'Sensitivity Analysis Walkthrough', description: 'Shadow prices, allowable ranges, and reduced costs derived step by step.', Component: SensitivityWalkthroughDemo },
      { id: 'duality-sensitivity', title: 'Duality and Sensitivity Explorer', description: 'Change the data and watch the primal, the dual, and the shadow prices respond.', Component: DualitySensitivityDemo },
      { id: 'dual-construction', title: 'Primal-to-Dual Construction', description: 'Build the dual one multiplier at a time, exactly as in the duality chapter.', Component: DualConstructionDemo },
    ],
  },
  {
    heading: 'Software (Chapter 12)',
    demos: [
      { id: 'lp-solvers', title: 'One LP, Four Modeling Languages', description: 'The same problem in PuLP, Pyomo, gurobipy, and AMPL, with a code stepper.', Component: LpSolversDemo },
    ],
  },
  {
    heading: 'Integer Programming and Beyond (Chapter 15 and Book 2)',
    demos: [
      { id: 'gantt-jobshop', title: 'Job-Shop Schedule (Gantt)', description: 'The job-shop scheduling problem from the IP chapter, solved and animated.', Component: GanttDemo },
      { id: 'branch-bound', title: 'Branch-and-Bound Tree Explorer', description: 'How solvers actually solve integer programs. A preview of Book 2.', Component: BranchBoundDemo },
      { id: 'dual-simplex', title: 'Dual Simplex Method', description: 'The pivoting rule that keeps the dual feasible. Further reading after the duality chapter.', Component: DualSimplexDemo },
    ],
  },
  {
    heading: 'Practice and self-check',
    demos: [
      { id: 'concept-quiz', title: 'Concept Quiz', description: 'Twenty quick multiple-choice questions on LP basics, simplex, duality, sensitivity, and integer programming, with explanations.', Component: QuizDemo },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.demos);

function idFromHash() {
  const h = window.location.hash.replace(/^#\/?/, '');
  return ALL.some((d) => d.id === h) ? h : null;
}

export default function App() {
  const [active, setActive] = useState(idFromHash);

  useEffect(() => {
    const onHash = () => setActive(idFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function open(id) {
    window.location.hash = id;
  }
  function goHome() {
    window.location.hash = '';
  }

  if (active) {
    const demo = ALL.find((d) => d.id === active);
    const Component = demo.Component;
    return (
      <div>
        <div
          style={{
            position: 'sticky', top: 0, zIndex: 50, background: '#111', color: '#fff',
            padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 16,
            borderBottom: '1px solid #333',
          }}
        >
          <button
            onClick={goHome}
            style={{ background: '#fff', color: '#111', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          >
            &larr; All visualizations
          </button>
          <span style={{ fontWeight: 600 }}>{demo.title}</span>
        </div>
        <Component />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6 }}>
        Interactive Visualizations
      </h1>
      <p style={{ color: '#555', marginBottom: 8, maxWidth: 760 }}>
        Companions to <i>Mathematical Programming and Operations Research</i> (Book 1:
        Linear and Integer Programming). Each demo is referenced from the matching
        chapter of the book. Click a card to launch; use your browser's back button
        or the header to return.
      </p>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 36 }}>
        Direct links: add <code>#demo-id</code> to this page's URL, e.g.{' '}
        <code>#simplex-dictionary</code>.
      </p>

      {GROUPS.map((g) => (
        <div key={g.heading} style={{ marginBottom: 34 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, borderBottom: '2px solid #eee', paddingBottom: 6 }}>
            {g.heading}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {g.demos.map((d) => (
              <button
                key={d.id}
                onClick={() => open(d.id)}
                style={{
                  display: 'block', textAlign: 'left', padding: 18, border: '1px solid #ddd',
                  borderRadius: 12, background: '#fff', cursor: 'pointer', color: 'inherit',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 5 }}>{d.title}</div>
                <div style={{ fontSize: 13.5, color: '#666' }}>{d.description}</div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <p style={{ color: '#999', fontSize: 13, marginTop: 20 }}>
        Source and license: these visualizations are part of the open-optimization
        project (CC BY-SA 4.0 / MIT for code). Sources live in the{' '}
        <code>visualizations/source</code> folder of the book repository.
      </p>
    </div>
  );
}
