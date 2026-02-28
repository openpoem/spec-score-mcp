import type { VercelRequest, VercelResponse } from '@vercel/node';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — Spec Score</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:#111;color:#eee;min-height:100vh;display:flex;flex-direction:column;align-items:center}
    .container{max-width:720px;width:100%;padding:48px 24px}
    h1{font-size:2.2rem;font-weight:700;margin-bottom:8px}
    .tagline{color:#999;font-size:1.1rem;margin-bottom:40px}
    h2{font-size:1.1rem;color:#666;text-transform:uppercase;letter-spacing:.05em;margin:36px 0 16px}
    h2:first-of-type{margin-top:0}
    p,ul{color:#ccc;font-size:.95rem;line-height:1.7;margin-bottom:16px}
    ul{padding-left:20px}
    li{margin-bottom:8px}
    a{color:#22c55e;text-decoration:none}
    a:hover{text-decoration:underline}
    .footer{margin-top:48px;padding-top:24px;border-top:1px solid #222;color:#555;font-size:.8rem;text-align:center}
    .footer a{color:#888}
    .footer a:hover{color:#22c55e}
  </style>
</head>
<body>
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="tagline">Spec Score — last updated February 2026</p>

    <h2>What we collect</h2>
    <p>Nothing. Spec Score does not collect, store, or log any personal data.</p>

    <h2>How the API works</h2>
    <p>When you use the Spec Score API (directly or via the Custom GPT), you send spec scores (4 numbers between 0 and 1). The API:</p>
    <ul>
      <li>Calculates a balance score and verdict</li>
      <li>Returns the result as JSON or SVG</li>
      <li>Does <strong>not</strong> store, log, or forward your request data</li>
    </ul>

    <h2>No cookies or tracking</h2>
    <p>This site does not use cookies, analytics, or any third-party tracking scripts.</p>

    <h2>No accounts</h2>
    <p>Spec Score has no user accounts, no login, and no authentication. There is no personal data to manage.</p>

    <h2>Third-party services</h2>
    <p>The API is hosted on <a href="https://vercel.com">Vercel</a>. Vercel may collect standard server logs (IP addresses, timestamps) as part of their infrastructure. See <a href="https://vercel.com/legal/privacy-policy">Vercel's privacy policy</a>.</p>

    <h2>Contact</h2>
    <p>Questions? Email <a href="mailto:info@openpoem.org">info@openpoem.org</a>.</p>

    <div class="footer">
      <a href="/">← Spec Score</a> · <a href="https://github.com/openpoem/spec-score-mcp">GitHub</a>
    </div>
  </div>
</body>
</html>`;

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
