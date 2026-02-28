import type { VercelRequest, VercelResponse } from '@vercel/node';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spec Score — Score your specs before the LLM builds from them</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:#111;color:#eee;min-height:100vh;display:flex;flex-direction:column;align-items:center}
    .container{max-width:720px;width:100%;padding:48px 24px}
    h1{font-size:2.2rem;font-weight:700;margin-bottom:8px}
    .tagline{color:#999;font-size:1.1rem;margin-bottom:40px}
    .tagline strong{color:#22c55e}
    h2{font-size:1.1rem;color:#666;text-transform:uppercase;letter-spacing:.05em;margin:36px 0 16px}
    .card{background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px 24px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:#eee;transition:border-color .2s}
    .card:hover{border-color:#22c55e}
    .card-left{display:flex;flex-direction:column;gap:4px}
    .card-title{font-weight:600;font-size:1.05rem}
    .card-desc{color:#888;font-size:.9rem}
    .card-arrow{color:#555;font-size:1.2rem}
    .card:hover .card-arrow{color:#22c55e}
    .badge{display:inline-block;background:#22c55e20;color:#22c55e;padding:2px 8px;border-radius:4px;font-size:.75rem;font-weight:600;margin-left:8px}
    .axes{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
    .axis{background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:14px 16px}
    .axis-name{font-weight:600;font-size:.95rem;margin-bottom:4px}
    .axis-desc{color:#888;font-size:.8rem}
    code{background:#222;padding:2px 6px;border-radius:4px;font-size:.85rem;color:#22c55e}
    .install{background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px 20px;font-family:monospace;font-size:.9rem;color:#ccc;margin:16px 0}
    .install .comment{color:#555}
    .verdicts{margin:16px 0}
    .verdict-row{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #222;font-size:.9rem}
    .verdict-row:last-child{border-bottom:none}
    .verdict-name{font-weight:600;min-width:140px}
    .verdict-desc{color:#888}
    .footer{margin-top:48px;padding-top:24px;border-top:1px solid #222;color:#555;font-size:.8rem;text-align:center}
    .footer a{color:#888;text-decoration:none}
    .footer a:hover{color:#22c55e}
    @media(max-width:600px){.axes{grid-template-columns:1fr}h1{font-size:1.6rem}}
  </style>
</head>
<body>
  <div class="container">
    <h1>Spec Score</h1>
    <p class="tagline"><strong>A balanced spec produces balanced code.</strong><br>An unbalanced spec produces creative fiction.</p>

    <h2>Install</h2>
    <div class="install">
      <span class="comment"># Add to Claude Code</span><br>
      npm i -g spec-score-mcp<br>
      claude mcp add spec-score -- npx spec-score-mcp
    </div>

    <h2>4 Axes</h2>
    <div class="axes">
      <div class="axis"><div class="axis-name">completeness</div><div class="axis-desc">Can the LLM understand the full scope?</div></div>
      <div class="axis"><div class="axis-name">clarity</div><div class="axis-desc">Is there only one way to interpret this?</div></div>
      <div class="axis"><div class="axis-name">constraints</div><div class="axis-desc">Does the LLM know what NOT to build?</div></div>
      <div class="axis"><div class="axis-name">specificity</div><div class="axis-desc">Are there concrete, testable details?</div></div>
    </div>

    <h2>Verdicts</h2>
    <div class="verdicts">
      <div class="verdict-row"><span class="verdict-name" style="color:#22c55e">SHIP IT</span><span class="verdict-desc">Spec is ready — the LLM knows what to build and what not to</span></div>
      <div class="verdict-row"><span class="verdict-name" style="color:#22c55e">ALMOST</span><span class="verdict-desc">One axis needs a small fix before you start</span></div>
      <div class="verdict-row"><span class="verdict-name" style="color:#eab308">DRAFT</span><span class="verdict-desc">Multiple axes need work, but the structure is there</span></div>
      <div class="verdict-row"><span class="verdict-name" style="color:#eab308">VAGUE</span><span class="verdict-desc">Well-organized but too abstract to act on</span></div>
      <div class="verdict-row"><span class="verdict-name" style="color:#ef4444">UNBOUNDED</span><span class="verdict-desc">Clear goal but no boundaries — the LLM will over-build</span></div>
      <div class="verdict-row"><span class="verdict-name" style="color:#ef4444">OVER-CONSTRAINED</span><span class="verdict-desc">Lots of rules but unclear what the actual goal is</span></div>
      <div class="verdict-row"><span class="verdict-name" style="color:#ef4444">SKETCH</span><span class="verdict-desc">Starting point — needs detail on most axes</span></div>
    </div>

    <h2>Get it</h2>
    <a class="card" href="https://www.npmjs.com/package/spec-score-mcp" target="_blank">
      <div class="card-left"><div class="card-title">npm <span class="badge">v2.0.0</span></div><div class="card-desc"><code>npx spec-score-mcp</code></div></div>
      <div class="card-arrow">&rarr;</div>
    </a>
    <a class="card" href="https://github.com/openpoem/spec-score-mcp" target="_blank">
      <div class="card-left"><div class="card-title">GitHub</div><div class="card-desc">openpoem/spec-score-mcp &mdash; source, docs, slash commands</div></div>
      <div class="card-arrow">&rarr;</div>
    </a>
    <a class="card" href="https://smithery.ai/server/openpoem/spec-score-mcp" target="_blank">
      <div class="card-left"><div class="card-title">Smithery</div><div class="card-desc">MCP server registry listing</div></div>
      <div class="card-arrow">&rarr;</div>
    </a>

    <h2>API</h2>
    <div class="card" style="cursor:default"><div class="card-left"><div class="card-title">POST /api/score</div><div class="card-desc">Score a spec &rarr; JSON with balance, verdict, axes</div></div></div>
    <div class="card" style="cursor:default"><div class="card-left"><div class="card-title">POST /api/visualize</div><div class="card-desc">Score a spec &rarr; SVG radar chart</div></div></div>
    <div class="card" style="cursor:default"><div class="card-left"><div class="card-title">POST /api/compare</div><div class="card-desc">Compare two specs &rarr; side-by-side SVG</div></div></div>

    <div class="footer">
      <strong>OpenPoem</strong> &mdash; spec-score-mcp<br>
      MIT License &middot; <a href="https://github.com/openpoem/spec-score-mcp">Source</a> &middot; <a href="mailto:info@openpoem.org">info@openpoem.org</a>
    </div>
  </div>
</body>
</html>`;

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
