import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scoreFromAxes, balanceLabel } from '../src/score.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { completeness, clarity, constraints, specificity, weakest, tip } = req.body;

  if ([completeness, clarity, constraints, specificity].some(v => typeof v !== 'number' || v < 0 || v > 1)) {
    return res.status(400).json({ error: 'All axes must be numbers between 0 and 1' });
  }

  const result = scoreFromAxes({ completeness, clarity, constraints, specificity, weakest: weakest || '', tip: tip || '' });

  return res.status(200).json({
    verdict: result.verdict,
    balance: result.balance,
    balance_label: balanceLabel(result.balance),
    axes: result.axes,
    weakest: result.details.weakest,
    strongest: result.details.strongest,
    tip: result.details.tip,
  });
}