# Spec Score MCP

## Skills

### /scan <file>

Score a spec file and generate a visual radar chart.

1. Read the file
2. Score it: call `spec_score` with appropriate scores for the 4 axes
3. Visualize it: call `spec_visualize` with the same scores
4. Write `<file>.scored.md` containing only the results (NOT the original content):
   - A `## Spec Score` heading with the source filename
   - Scores table (axis, score)
   - Balance score, verdict, and tip
   - The SVG as a base64 data URI in an `<img>` tag (NOT inline SVG — markdown renderers strip it)
   - To encode: `btoa(svgString)` → `<img src="data:image/svg+xml;base64,..." alt="Spec Score" width="480" />`

### /compare <file1> <file2>

Compare two spec files side-by-side.

1. Read both files
2. Score both: call `spec_score` for each file separately
3. Compare: call `spec_compare` with both sets of scores (left = first file, right = second file)
4. Write `compared.scored.md` containing:
   - Summary of both files
   - The side-by-side SVG as a base64 data URI `<img>` tag (width="1000")
   - Scores table for both files
   - Verdict for each + comparison insight
