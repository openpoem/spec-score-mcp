Score a spec file and generate a visual radar chart.

Usage: /scan $ARGUMENTS

1. Read the file at: $ARGUMENTS
2. Score it: call `spec_score` with appropriate scores for the 4 axes (completeness, clarity, constraints, specificity — each 0.0-1.0)
3. Visualize it: call `spec_visualize` with the same scores
4. Write `<file>.scored.md` containing only the results (NOT the original content):
   - A `## Spec Score` heading with the source filename
   - Scores table (axis, score)
   - Balance score, verdict, and tip
   - The SVG as a base64 data URI in an `<img>` tag (NOT inline SVG — markdown renderers strip it)
   - To encode: `btoa(svgString)` → `<img src="data:image/svg+xml;base64,..." alt="Spec Score" width="480" />`
