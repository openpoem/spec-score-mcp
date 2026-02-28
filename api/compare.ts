import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scoreFromAxes } from '../src/score.js';
import { generateComparisonSVG } from '../src/visualize.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { left, right, title } = req.body;

  if (!left || !right) {
    return res.status(400).json({ error: 'Both left and right score objects are required' });
  }

  for (const side of [left, right]) {
    if ([side.completeness, side.clarity, side.constraints, side.specificity].some(
      (v: unknown) => typeof v !== 'number' || (v as number) < 0 || (v as number) > 1
    )) {
      return res.status(400).json({ error: 'All axes must be numbers between 0 and 1' });
    }
  }

  const leftResult = scoreFromAxes({
    completeness: left.completeness, clarity: left.clarity,
    constraints: left.constraints, specificity: left.specificity,
    weakest: left.weakest || '', tip: left.tip || '',
  });
  const rightResult = scoreFromAxes({
    completeness: right.completeness, clarity: right.clarity,
    constraints: right.constraints, specificity: right.specificity,
    weakest: right.weakest || '', tip: right.tip || '',
  });

  const svg = generateComparisonSVG(
    { values: leftResult.vector, balance: leftResult.balance, verdict: leftResult.verdict, title: left.title },
    { values: rightResult.vector, balance: rightResult.balance, verdict: rightResult.verdict, title: right.title },
    title,
  );

  res.setHeader('Content-Type', 'image/svg+xml');
  return res.status(200).send(svg);
}
