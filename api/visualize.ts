import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scoreFromAxes } from '../src/score.js';
import { generateRadarSVG } from '../src/visualize.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { completeness, clarity, constraints, specificity, weakest, tip, title } = req.body;

  if ([completeness, clarity, constraints, specificity].some(v => typeof v !== 'number' || v < 0 || v > 1)) {
    return res.status(400).json({ error: 'All axes must be numbers between 0 and 1' });
  }

  const result = scoreFromAxes({ completeness, clarity, constraints, specificity, weakest: weakest || '', tip: tip || '' });
  const svg = generateRadarSVG({
    values: result.vector,
    balance: result.balance,
    verdict: result.verdict,
    title,
  });

  res.setHeader('Content-Type', 'image/svg+xml');
  return res.status(200).send(svg);
}