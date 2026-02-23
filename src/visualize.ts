/**
 * visualize.ts - SVG radar chart generator for spec scores
 */

import type { Vec } from "./score.js";
import { AXIS_NAMES } from "./score.js";

export interface ChartConfig {
  values: Vec;
  balance: number;
  verdict: string;
  title?: string;
}

function color(balance: number): string {
  if (balance > 0.75) return '#22c55e'; // green
  if (balance > 0.5) return '#eab308';  // yellow
  return '#ef4444';                       // red
}

function bgColor(balance: number): string {
  if (balance > 0.75) return '#22c55e20';
  if (balance > 0.5) return '#eab30820';
  return '#ef444420';
}

function verdictBg(balance: number): string {
  if (balance > 0.75) return '#22c55e';
  if (balance > 0.5) return '#eab308';
  return '#ef4444';
}

export function generateRadarSVG(config: ChartConfig): string {
  const { values, balance, verdict, title } = config;
  const labels = [...AXIS_NAMES];

  const w = 480, h = 560;
  const cx = 240, cy = 230, r = 130;
  const titleOffset = title ? 35 : 0;

  // Axis angles (top, right, bottom, left)
  const angles = labels.map((_, i) => (Math.PI / 2) + (2 * Math.PI * i) / 4);

  const point = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: (cy + titleOffset) - radius * Math.sin(angle),
  });

  // Grid diamonds
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridLines = gridLevels.map(level => {
    const pts = angles.map(a => point(a, r * level));
    return `<polygon points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="#333" stroke-width="0.5" stroke-dasharray="${level < 1 ? '3,3' : 'none'}" />`;
  }).join('\n    ');

  // Axis lines
  const axisLines = angles.map(a => {
    const p = point(a, r);
    return `<line x1="${cx}" y1="${cy + titleOffset}" x2="${p.x}" y2="${p.y}" stroke="#444" stroke-width="0.5" />`;
  }).join('\n    ');

  // Data polygon
  const dataPoints = values.map((v, i) => point(angles[i], r * v));
  const dataPolygon = `<polygon points="${dataPoints.map(p => `${p.x},${p.y}`).join(' ')}" fill="${bgColor(balance)}" stroke="${color(balance)}" stroke-width="2" />`;

  // Data dots
  const dots = dataPoints.map(p =>
    `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color(balance)}" />`
  ).join('\n    ');

  // Labels with values — positioned well outside the chart
  const labelOffsets = [
    { dx: 0, dy: -22, anchor: 'middle' },   // top (completeness)
    { dx: 24, dy: 5, anchor: 'start' },     // right (specificity)
    { dx: 0, dy: 28, anchor: 'middle' },    // bottom (constraints)
    { dx: -24, dy: 5, anchor: 'end' },      // left (clarity)
  ];
  const labelTexts = labels.map((name, i) => {
    const p = point(angles[i], r + 30);
    const o = labelOffsets[i];
    return `<text x="${p.x + o.dx}" y="${p.y + o.dy}" text-anchor="${o.anchor}" fill="#999" font-size="12" font-family="system-ui, -apple-system, sans-serif">${name} (${values[i].toFixed(2)})</text>`;
  }).join('\n    ');

  // Balance score — below the chart, above the verdict
  const scoreY = cy + titleOffset + r + 80;
  const centerText = `<text x="${cx}" y="${scoreY}" text-anchor="middle" fill="${color(balance)}" font-size="20" font-weight="bold" font-family="system-ui, -apple-system, sans-serif">${balance.toFixed(3)}</text>`;

  // Title
  const titleEl = title
    ? `<text x="${cx}" y="24" text-anchor="middle" fill="#ccc" font-size="15" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${title}</text>`
    : '';

  // Verdict badge
  const verdictY = h - 36;
  const verdictLabel = verdict.split(' - ')[0];
  const verdictEl = 
    `<rect x="80" y="${verdictY - 18}" width="320" height="34" rx="6" fill="${verdictBg(balance)}" />
    <text x="${cx}" y="${verdictY + 5}" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="system-ui, -apple-system, sans-serif">${verdictLabel}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="background:#1a1a1a;border-radius:12px">
    ${titleEl}
    ${gridLines}
    ${axisLines}
    ${dataPolygon}
    ${dots}
    ${labelTexts}
    ${centerText}
    ${verdictEl}
  </svg>`;
}

export function generateComparisonSVG(left: ChartConfig, right: ChartConfig, title?: string): string {
  const leftSvg = generateRadarSVG({ ...left, title: left.title || 'Before' });
  const rightSvg = generateRadarSVG({ ...right, title: right.title || 'After' });

  const mainTitle = title || 'Is your .md ready for the machine?';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" width="1000" height="620" style="background:#111;border-radius:12px">
    <text x="500" y="32" text-anchor="middle" fill="#eee" font-size="17" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${mainTitle}</text>
    <g transform="translate(20, 50)">${leftSvg.replace(/<\/?svg[^>]*>/g, '')}</g>
    <g transform="translate(500, 50)">${rightSvg.replace(/<\/?svg[^>]*>/g, '')}</g>
  </svg>`;
}
