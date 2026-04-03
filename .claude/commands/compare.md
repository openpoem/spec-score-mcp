Compare two spec files side-by-side with radar charts.

Usage: /compare $ARGUMENTS

The arguments should be two file paths separated by a space.

1. Read both files
2. Score both: call `spec_score` for each file separately (completeness, clarity, constraints, specificity — each 0.0-1.0)
3. Compare: call `spec_compare` with both sets of scores (left = first file, right = second file)
4. Write `compared.scored.md` containing:
   - Summary of both files
   - The side-by-side SVG as a base64 data URI `<img>` tag (width="1000")
   - Scores table for both files
   - Verdict for each + comparison insight
