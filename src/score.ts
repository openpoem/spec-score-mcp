/**
 * score.ts - Spec quality scoring engine
 *
 * Scores requirements/specs on 4 axes:
 *   completeness - Can an LLM understand the full scope?
 *   clarity      - Is it unambiguous? Does the LLM know what to build?
 *   constraints  - Are boundaries defined? Does the LLM know what NOT to do?
 *   specificity  - Are there concrete details? Can the LLM verify its own output?
 *
 * This is an MCP tool — the LLM calling it IS the scorer.
 * The score() function takes pre-scored axes from the LLM.
 *
 * For CLI use: calls an OpenAI-compatible API to score.
 *
 * A balanced spec produces balanced code.
 * An unbalanced spec produces creative fiction.
 */

export type Vec = [number, number, number, number];

export const AXIS_NAMES = ['completeness', 'clarity', 'constraints', 'specificity'] as const;

// --- Vector math ---

function norm(v: Vec): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

function normalize(v: Vec): Vec {
  const n = norm(v);
  if (n < 1e-9) return [0, 0, 0, 0];
  return v.map(x => x / n) as Vec;
}

// --- Types ---

export interface AxisScores {
  completeness: number;
  clarity: number;
  constraints: number;
  specificity: number;
  weakest: string;
  tip: string;
}

// --- Score from pre-scored axes (MCP use — the LLM already scored it) ---

export interface ScoreResult {
  vector: Vec;
  balance: number;
  verdict: string;
  axes: Array<{ axis: string; value: number }>;
  details: {
    mean: number;
    weakest: string;
    strongest: string;
    tip: string;
  };
}

export function scoreFromAxes(axes: AxisScores): ScoreResult {
  const rawVec: Vec = [axes.completeness, axes.clarity, axes.constraints, axes.specificity];
  const vector = normalize(rawVec);

  const mean = vector.reduce((s, x) => s + x, 0) / 4;
  const variance = vector.reduce((s, x) => s + (x - mean) ** 2, 0) / 4;
  const balance = mean < 0.01 ? 0 : Math.max(0, 1 - Math.sqrt(variance) / mean);

  const verdict = classify(vector, balance, mean);

  let minIdx = 0, maxIdx = 0;
  for (let i = 1; i < 4; i++) {
    if (vector[i] < vector[minIdx]) minIdx = i;
    if (vector[i] > vector[maxIdx]) maxIdx = i;
  }

  return {
    vector,
    balance,
    verdict,
    axes: AXIS_NAMES.map((name, i) => ({ axis: name, value: +vector[i].toFixed(4) })),
    details: {
      mean: +mean.toFixed(4),
      weakest: axes.weakest || AXIS_NAMES[minIdx],
      strongest: AXIS_NAMES[maxIdx],
      tip: axes.tip,
    },
  };
}

function classify(v: Vec, balance: number, avg: number): string {
  if (balance > 0.75 && avg > 0.45) return 'SHIP IT - spec is ready for the machine';
  if (balance > 0.6 && avg > 0.35) return 'ALMOST - minor gaps, review needed';
  if (v[0] > 0.6 && v[3] < 0.2) return 'VAGUE - well-structured but too abstract';
  if (v[1] > 0.6 && v[2] < 0.2) return 'UNBOUNDED - clear goal, no limits defined';
  if (v[2] > 0.5 && v[1] < 0.2) return 'OVER-CONSTRAINED - lots of rules, unclear purpose';
  if (avg < 0.25) return 'SKETCH - needs much more detail';
  return 'DRAFT - developing, add more context';
}

export function balanceLabel(balance: number): string {
  if (balance > 0.75) return 'BALANCED';
  if (balance > 0.5) return 'MODERATE';
  return 'SPIKED';
}
