import type { FinalIdea } from "./types";

// ── HTML Escape ──

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Common Fragments ──

function stepsHtml(
  steps: string[],
  numCls: string,
  txtCls: string,
  wrapCls: string,
): string {
  return steps
    .map(
      (s, i) =>
        `<div class="${wrapCls}"><span class="${numCls}">${String(i + 1).padStart(2, "0")}</span><p class="${txtCls}">${esc(s)}</p></div>`,
    )
    .join("\n");
}

const FOOTER_TEXT =
  "Wigent에서 AI 에이전트들의 토론으로 탄생한 아이디어";

// ── 1. Glassmorphism ──

function glassTemplate(idea: FinalIdea): string {
  const steps = stepsHtml(idea.nextSteps, "num", "stxt", "stp glass");
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;500;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#0f0f23;color:#e8e8ff;min-height:100vh;overflow-x:hidden}
.blob{position:fixed;border-radius:50%;filter:blur(120px);opacity:.35;animation:drift 25s ease-in-out infinite;pointer-events:none}
.b1{width:600px;height:600px;background:#6366f1;top:-200px;left:-100px}
.b2{width:500px;height:500px;background:#ec4899;bottom:-150px;right:-100px;animation-delay:-12s}
.b3{width:350px;height:350px;background:#06b6d4;top:40%;left:40%;animation-delay:-6s}
@keyframes drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,-30px) scale(1.05)}66%{transform:translate(-30px,20px) scale(.95)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.f{animation:fadeUp .8s ease both}.d1{animation-delay:.15s}.d2{animation-delay:.3s}.d3{animation-delay:.45s}.d4{animation-delay:.6s}.d5{animation-delay:.75s}
.w{max-width:960px;margin:0 auto;padding:0 24px;position:relative;z-index:1}
.glass{background:rgba(255,255,255,.06);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:24px}
.hero{padding:100px 0 60px;text-align:center}
.badge{display:inline-block;padding:8px 20px;font-size:.8rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:24px;color:#c4b5fd}
h1{font-size:clamp(2.2rem,5vw,3.6rem);font-weight:800;line-height:1.1;background:linear-gradient(135deg,#c4b5fd,#f0abfc,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{font-size:1.15rem;color:rgba(255,255,255,.55);max-width:560px;margin:20px auto 0;line-height:1.7}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;padding:48px 0}
.card{padding:32px;transition:transform .3s ease}.card:hover{transform:translateY(-4px)}
.icon{font-size:1.6rem;margin-bottom:14px}
.card h3{font-size:1rem;font-weight:700;margin-bottom:8px}
.card p{font-size:.9rem;color:rgba(255,255,255,.5);line-height:1.65}
.mkt{text-align:center;padding:60px 0}
.mv{font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;background:linear-gradient(90deg,#818cf8,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.mkt .ml{color:rgba(255,255,255,.45);margin-top:8px;font-size:.9rem}
.road{padding:40px 0 80px}
.road h2{text-align:center;font-size:1.3rem;margin-bottom:28px;color:#c4b5fd;font-weight:700}
.stp{display:flex;align-items:flex-start;gap:16px;padding:16px 24px;margin-bottom:12px}
.num{font-size:.8rem;font-weight:700;color:#818cf8;min-width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(129,140,248,.3);border-radius:8px;flex-shrink:0}
.stxt{font-size:.9rem;color:rgba(255,255,255,.6);line-height:1.55}
footer{text-align:center;padding:40px 0;font-size:.75rem;color:rgba(255,255,255,.25)}
@media(max-width:640px){.hero{padding:60px 0 40px}.cards{grid-template-columns:1fr}}
</style></head><body>
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
<div class="w">
<section class="hero f"><div class="badge glass">New Idea</div>
<h1>${esc(idea.title)}</h1>
<p class="sub">${esc(idea.oneLiner)}</p></section>
<section class="cards f d2">
<div class="card glass"><div class="icon">🎯</div><h3>타겟 고객</h3><p>${esc(idea.target)}</p></div>
<div class="card glass"><div class="icon">✨</div><h3>차별화 포인트</h3><p>${esc(idea.differentiator)}</p></div>
<div class="card glass"><div class="icon">💰</div><h3>수익 모델</h3><p>${esc(idea.revenueModel)}</p></div>
</section>
<section class="mkt f d3"><div class="glass" style="display:inline-block;padding:36px 56px">
<div class="mv">${esc(idea.marketSize)}</div><p class="ml">시장 규모</p></div></section>
<section class="road f d4"><h2>Next Steps</h2>${steps}</section>
<footer class="f d5">⚔️ ${FOOTER_TEXT}</footer>
</div></body></html>`;
}

// ── 2. Neobrutalism ──

function neobrutaTemplate(idea: FinalIdea): string {
  const steps = idea.nextSteps
    .map(
      (s, i) =>
        `<div class="stp"><span class="num">${i + 1}</span><p>${esc(s)}</p></div>`,
    )
    .join("\n");
  const colors = ["#FFD803", "#FF6B9D", "#80B3FF"];
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Space Grotesk',system-ui,sans-serif;background:#FFFDF7;color:#1A1A2E;min-height:100vh}
@keyframes popIn{from{opacity:0;transform:scale(.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
.f{animation:popIn .5s ease both}.d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.4s}
.w{max-width:920px;margin:0 auto;padding:0 24px}
.nb{border:3px solid #1A1A2E;border-radius:16px;box-shadow:6px 6px 0 #1A1A2E}
.hero{padding:80px 0 48px;text-align:center}
.badge{display:inline-block;padding:6px 16px;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;background:#FFD803;margin-bottom:20px}
h1{font-size:clamp(2.4rem,6vw,4rem);font-weight:700;line-height:1.05;letter-spacing:-.02em}
.sub{font-size:1.1rem;color:#4A4A5E;max-width:520px;margin:16px auto 0;line-height:1.6}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;padding:40px 0}
.card{padding:28px;transition:transform .15s ease,box-shadow .15s ease}
.card:hover{transform:translate(-2px,-2px);box-shadow:8px 8px 0 #1A1A2E}
.card h3{font-size:1.05rem;font-weight:700;margin-bottom:8px}
.card p{font-size:.9rem;color:#1A1A2E;line-height:1.6}
.icon{font-size:1.8rem;margin-bottom:12px}
.mkt{text-align:center;padding:48px 0}
.mkb{display:inline-block;padding:32px 48px;background:#FFD803}
.mv{font-size:clamp(1.5rem,3vw,2.2rem);font-weight:700}
.ml{font-size:.85rem;color:#4A4A5E;margin-top:4px}
.road{padding:40px 0 72px}
.road h2{text-align:center;font-size:1.4rem;font-weight:700;margin-bottom:24px}
.stp{display:flex;align-items:flex-start;gap:14px;padding:14px 20px;margin-bottom:12px;background:#FFFDF7}
.stp .num{width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem;background:#80B3FF;border:3px solid #1A1A2E;border-radius:10px;flex-shrink:0}
.stp p{font-size:.9rem;line-height:1.55;color:#1A1A2E}
footer{text-align:center;padding:40px 0;font-size:.75rem;color:#4A4A5E}
@media(max-width:640px){.cards{grid-template-columns:1fr}.hero{padding:48px 0 32px}}
</style></head><body>
<div class="w">
<section class="hero f"><div class="badge nb">New Idea</div>
<h1>${esc(idea.title)}</h1>
<p class="sub">${esc(idea.oneLiner)}</p></section>
<section class="cards f d1">
<div class="card nb" style="background:${colors[0]}"><div class="icon">🎯</div><h3>타겟 고객</h3><p>${esc(idea.target)}</p></div>
<div class="card nb" style="background:${colors[1]}"><div class="icon">✨</div><h3>차별화 포인트</h3><p>${esc(idea.differentiator)}</p></div>
<div class="card nb" style="background:${colors[2]}"><div class="icon">💰</div><h3>수익 모델</h3><p>${esc(idea.revenueModel)}</p></div>
</section>
<section class="mkt f d2"><div class="mkb nb"><div class="mv">📊 ${esc(idea.marketSize)}</div><p class="ml">시장 규모</p></div></section>
<section class="road f d3"><h2>🚀 다음 단계</h2>${steps}</section>
<footer class="f d4">⚔️ ${FOOTER_TEXT}</footer>
</div></body></html>`;
}

// ── 3. Editorial ──

function editorialTemplate(idea: FinalIdea): string {
  const steps = idea.nextSteps
    .map(
      (s, i) =>
        `<div class="stp"><span class="num">${String(i + 1).padStart(2, "0")}</span><p>${esc(s)}</p></div>`,
    )
    .join("\n");
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Source Sans 3',system-ui,sans-serif;background:#F8F6F3;color:#1a1a1a;min-height:100vh}
@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.f{animation:fadeIn .8s ease both}.d1{animation-delay:.15s}.d2{animation-delay:.3s}.d3{animation-delay:.45s}.d4{animation-delay:.6s}
.w{max-width:800px;margin:0 auto;padding:0 32px}
h1,h2,.serif{font-family:'Playfair Display',Georgia,serif}
.hero{padding:120px 0 64px;text-align:center;border-bottom:1px solid #e0ddd8}
.eyebrow{font-size:.7rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#C4A265;margin-bottom:16px}
h1{font-size:clamp(2.4rem,5.5vw,3.8rem);font-weight:900;line-height:1.1;letter-spacing:-.02em}
.sub{font-size:1.1rem;font-weight:300;color:#666;max-width:520px;margin:20px auto 0;line-height:1.7}
.features{padding:64px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px}
.feat{border-left:1px solid #C4A265;padding-left:20px}
.feat h3{font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:8px;font-weight:700}
.feat p{font-size:.9rem;color:#666;line-height:1.7}
.feat .label{font-size:.65rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#C4A265;margin-bottom:8px}
.mkt{text-align:center;padding:64px 0;border-top:1px solid #e0ddd8;border-bottom:1px solid #e0ddd8}
.mv{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,3vw,2.6rem);font-weight:900;color:#1a1a1a}
.ml{font-size:.8rem;color:#999;margin-top:8px;letter-spacing:.08em;text-transform:uppercase}
.road{padding:64px 0}
.road h2{font-size:1.6rem;font-weight:900;text-align:center;margin-bottom:32px}
.stp{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid #ece9e4}
.stp .num{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:#C4A265;flex-shrink:0;min-width:32px}
.stp p{font-size:.95rem;color:#555;line-height:1.6}
footer{text-align:center;padding:48px 0;font-size:.7rem;color:#bbb;letter-spacing:.06em;text-transform:uppercase}
@media(max-width:768px){.features{grid-template-columns:1fr;gap:32px}.hero{padding:72px 0 48px}}
</style></head><body>
<div class="w">
<section class="hero f"><p class="eyebrow">New Concept</p>
<h1>${esc(idea.title)}</h1>
<p class="sub">${esc(idea.oneLiner)}</p></section>
<section class="features f d1">
<div class="feat"><p class="label">Target</p><h3>타겟 고객</h3><p>${esc(idea.target)}</p></div>
<div class="feat"><p class="label">Differentiator</p><h3>차별화 포인트</h3><p>${esc(idea.differentiator)}</p></div>
<div class="feat"><p class="label">Revenue</p><h3>수익 모델</h3><p>${esc(idea.revenueModel)}</p></div>
</section>
<section class="mkt f d2"><div class="mv">${esc(idea.marketSize)}</div><p class="ml">Market Opportunity</p></section>
<section class="road f d3"><h2>Next Steps</h2>${steps}</section>
<footer class="f d4">⚔ ${FOOTER_TEXT}</footer>
</div></body></html>`;
}

// ── 4. Minimalism ──

function minimalTemplate(idea: FinalIdea): string {
  const steps = idea.nextSteps
    .map(
      (s, i) =>
        `<div class="stp"><span class="num">${String(i + 1).padStart(2, "0")}</span><p>${esc(s)}</p></div>`,
    )
    .join("\n");
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Manrope',system-ui,sans-serif;background:#FAFAFA;color:#1A1A1A;min-height:100vh}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.f{animation:fadeIn .9s ease both}.d1{animation-delay:.2s}.d2{animation-delay:.4s}.d3{animation-delay:.6s}.d4{animation-delay:.8s}
.w{max-width:720px;margin:0 auto;padding:0 32px}
.hero{padding:140px 0 96px;text-align:center}
h1{font-size:clamp(2rem,5vw,3.2rem);font-weight:800;line-height:1.15;letter-spacing:-.03em}
.sub{font-size:1rem;font-weight:300;color:#666;max-width:480px;margin:20px auto 0;line-height:1.8}
.line{width:48px;height:1px;background:#1A1A1A;margin:0 auto}
.features{padding:64px 0;display:flex;flex-direction:column;gap:48px}
.feat{display:grid;grid-template-columns:120px 1fr;gap:24px;align-items:baseline}
.feat .label{font-size:.65rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#999}
.feat p{font-size:.95rem;color:#444;line-height:1.75}
.mkt{text-align:center;padding:80px 0}
.mv{font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;letter-spacing:-.02em}
.ml{font-size:.7rem;color:#999;margin-top:12px;letter-spacing:.1em;text-transform:uppercase}
.road{padding:64px 0}
.road h2{font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#999;margin-bottom:32px}
.stp{display:flex;gap:20px;padding:20px 0;border-bottom:1px solid #f0f0f0}
.stp .num{font-size:.75rem;font-weight:600;color:#ccc;flex-shrink:0;min-width:24px}
.stp p{font-size:.9rem;color:#555;line-height:1.7}
footer{text-align:center;padding:64px 0;font-size:.65rem;color:#ccc;letter-spacing:.08em}
@media(max-width:640px){.feat{grid-template-columns:1fr;gap:8px}.hero{padding:80px 0 56px}}
</style></head><body>
<div class="w">
<section class="hero f"><h1>${esc(idea.title)}</h1>
<p class="sub">${esc(idea.oneLiner)}</p><div class="line" style="margin-top:40px"></div></section>
<section class="features f d1">
<div class="feat"><span class="label">Target</span><p>${esc(idea.target)}</p></div>
<div class="feat"><span class="label">Differentiator</span><p>${esc(idea.differentiator)}</p></div>
<div class="feat"><span class="label">Revenue</span><p>${esc(idea.revenueModel)}</p></div>
</section>
<section class="mkt f d2"><div class="line" style="margin-bottom:32px"></div>
<div class="mv">${esc(idea.marketSize)}</div><p class="ml">Market Size</p>
<div class="line" style="margin-top:32px"></div></section>
<section class="road f d3"><h2>Next Steps</h2>${steps}</section>
<footer class="f d4">${FOOTER_TEXT}</footer>
</div></body></html>`;
}

// ── 5. Dark Neon ──

function darkNeonTemplate(idea: FinalIdea): string {
  const steps = idea.nextSteps
    .map(
      (s, i) =>
        `<div class="stp"><span class="num">${String(i + 1).padStart(2, "0")}</span><p>${esc(s)}</p></div>`,
    )
    .join("\n");
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Outfit',system-ui,sans-serif;background:#09090b;color:#fafafa;min-height:100vh;overflow-x:hidden}
.mesh{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 20% 20%,rgba(34,211,238,.12),transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(168,85,247,.1),transparent 50%)}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.f{animation:fadeUp .7s ease both}.d1{animation-delay:.12s}.d2{animation-delay:.24s}.d3{animation-delay:.36s}.d4{animation-delay:.48s}
.w{max-width:920px;margin:0 auto;padding:0 24px;position:relative;z-index:1}
.glow{color:#22d3ee;text-shadow:0 0 20px rgba(34,211,238,.4)}
.hero{padding:100px 0 56px;text-align:center}
.badge{display:inline-block;padding:6px 16px;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(34,211,238,.3);border-radius:999px;color:#22d3ee;margin-bottom:20px}
h1{font-size:clamp(2.2rem,5vw,3.4rem);font-weight:800;line-height:1.1;letter-spacing:-.02em}
.sub{font-size:1.05rem;font-weight:300;color:#a1a1aa;max-width:540px;margin:18px auto 0;line-height:1.7}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;padding:48px 0}
.card{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:28px;transition:all .2s ease}
.card:hover{border-color:#22d3ee;box-shadow:0 0 24px rgba(34,211,238,.12)}
.card .label{font-family:'JetBrains Mono',monospace;font-size:.65rem;font-weight:700;color:#22d3ee;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}
.card p{font-size:.9rem;color:#a1a1aa;line-height:1.65}
.mkt{text-align:center;padding:56px 0}
.mkb{display:inline-block;padding:32px 48px;background:#18181b;border:1px solid #a855f7;border-radius:16px;box-shadow:0 0 30px rgba(168,85,247,.15)}
.mv{font-size:clamp(1.4rem,3vw,2rem);font-weight:800;background:linear-gradient(90deg,#a855f7,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ml{font-size:.75rem;color:#71717a;margin-top:8px;font-family:'JetBrains Mono',monospace}
.road{padding:40px 0 72px}
.road h2{text-align:center;font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a855f7;margin-bottom:28px;font-family:'JetBrains Mono',monospace}
.stp{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #1e1e22}
.stp .num{font-family:'JetBrains Mono',monospace;font-size:.8rem;font-weight:700;color:#22d3ee;min-width:28px;flex-shrink:0}
.stp p{font-size:.88rem;color:#a1a1aa;line-height:1.6}
footer{text-align:center;padding:40px 0;font-size:.7rem;color:#3f3f46;font-family:'JetBrains Mono',monospace}
@media(max-width:640px){.cards{grid-template-columns:1fr}.hero{padding:64px 0 40px}}
</style></head><body>
<div class="mesh"></div>
<div class="w">
<section class="hero f"><div class="badge">$ new_idea</div>
<h1 class="glow">${esc(idea.title)}</h1>
<p class="sub">${esc(idea.oneLiner)}</p></section>
<section class="cards f d1">
<div class="card"><p class="label">// target</p><p>${esc(idea.target)}</p></div>
<div class="card"><p class="label">// differentiator</p><p>${esc(idea.differentiator)}</p></div>
<div class="card"><p class="label">// revenue</p><p>${esc(idea.revenueModel)}</p></div>
</section>
<section class="mkt f d2"><div class="mkb"><div class="mv">${esc(idea.marketSize)}</div><p class="ml">market.size</p></div></section>
<section class="road f d3"><h2>// next_steps</h2>${steps}</section>
<footer class="f d4">⚔ ${FOOTER_TEXT}</footer>
</div></body></html>`;
}

// ── 6. Bento Grid ──

function bentoTemplate(idea: FinalIdea): string {
  const stepCards = idea.nextSteps
    .map(
      (s, i) =>
        `<div class="bc"><span class="sn">${i + 1}</span><p>${esc(s)}</p></div>`,
    )
    .join("\n");
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Figtree',system-ui,sans-serif;background:#f5f5f7;color:#1d1d1f;min-height:100vh}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.f{animation:fadeUp .6s ease both}
.w{max-width:1000px;margin:0 auto;padding:48px 24px}
.hero{text-align:center;padding:60px 0 48px}
.eyebrow{font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#86868b;margin-bottom:12px}
h1{font-size:clamp(2rem,5vw,3.2rem);font-weight:800;line-height:1.1;letter-spacing:-.03em}
.sub{font-size:1.05rem;color:#86868b;max-width:500px;margin:16px auto 0;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:24px 0}
.bc{background:#fff;border-radius:24px;padding:28px;display:flex;flex-direction:column;transition:transform .3s ease,box-shadow .3s ease}
.bc:hover{transform:scale(1.02);box-shadow:0 20px 40px rgba(0,0,0,.08)}
.c21{grid-column:span 2}.c12{grid-row:span 2}.c22{grid-column:span 2;grid-row:span 2}
.cd{background:#1d1d1f;color:#f5f5f7}
.cd .cl{color:rgba(255,255,255,.5)}.cd p{color:rgba(255,255,255,.65)}
.ca{background:#eff6ff}.cb{background:#f0fdf4}.cc{background:#faf5ff}
.cl{font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#86868b;margin-bottom:12px}
.bc h3{font-size:1.2rem;font-weight:700;margin-bottom:8px;letter-spacing:-.01em}
.bc p{font-size:.9rem;color:#6e6e73;line-height:1.6}
.big{font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;letter-spacing:-.02em}
.sn{width:28px;height:28px;border-radius:50%;background:#0071e3;color:#fff;font-size:.8rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:12px;flex-shrink:0}
footer{text-align:center;padding:48px 0;font-size:.7rem;color:#86868b}
@media(max-width:768px){.grid{grid-template-columns:repeat(2,1fr)}.c21,.c22{grid-column:span 2}.c12{grid-row:span 1}}
@media(max-width:480px){.grid{grid-template-columns:1fr}.c21,.c22,.c12{grid-column:span 1;grid-row:span 1}}
</style></head><body>
<div class="w">
<section class="hero f"><p class="eyebrow">New Idea</p>
<h1>${esc(idea.title)}</h1><p class="sub">${esc(idea.oneLiner)}</p></section>
<div class="grid">
<div class="bc c22 cd f" style="animation-delay:.1s"><p class="cl">Differentiator</p><h3>차별화 포인트</h3><p>${esc(idea.differentiator)}</p></div>
<div class="bc ca f" style="animation-delay:.2s"><p class="cl">Target</p><h3>타겟 고객</h3><p>${esc(idea.target)}</p></div>
<div class="bc cb f" style="animation-delay:.3s"><p class="cl">Revenue</p><h3>수익 모델</h3><p>${esc(idea.revenueModel)}</p></div>
<div class="bc c21 cc f" style="animation-delay:.4s"><p class="cl">Market Size</p><div class="big">${esc(idea.marketSize)}</div></div>
${stepCards}
</div>
<footer class="f" style="animation-delay:.6s">⚔️ ${FOOTER_TEXT}</footer>
</div></body></html>`;
}

// ── 7. Organic Shapes ──

function organicTemplate(idea: FinalIdea): string {
  const steps = idea.nextSteps
    .map(
      (s, i) =>
        `<div class="stp"><span class="num">${i + 1}</span><p>${esc(s)}</p></div>`,
    )
    .join("\n");
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Nunito',system-ui,sans-serif;background:#FAF6F1;color:#2D2418;min-height:100vh;overflow-x:hidden}
.blob{position:fixed;filter:blur(60px);opacity:.12;pointer-events:none;animation:morph 10s ease-in-out infinite}
.bl1{width:500px;height:500px;background:#5B7C4F;top:-100px;right:-80px;border-radius:60% 40% 45% 55%/50% 60% 40% 50%}
.bl2{width:400px;height:400px;background:#C4843E;bottom:-80px;left:-60px;border-radius:45% 55% 60% 40%/55% 40% 60% 50%;animation-delay:-5s}
@keyframes morph{0%,100%{border-radius:60% 40% 45% 55%/50% 60% 40% 50%}50%{border-radius:45% 55% 60% 40%/55% 40% 60% 50%}}
@keyframes fadeIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.f{animation:fadeIn .8s cubic-bezier(.25,.8,.25,1) both}.d1{animation-delay:.15s}.d2{animation-delay:.3s}.d3{animation-delay:.45s}.d4{animation-delay:.6s}
.w{max-width:860px;margin:0 auto;padding:0 32px;position:relative;z-index:1}
.serif{font-family:'DM Serif Display',Georgia,serif}
.hero{padding:100px 0 64px;text-align:center}
.pill{display:inline-block;padding:8px 20px;font-size:.75rem;font-weight:700;letter-spacing:.06em;background:#5B7C4F;color:#fff;border-radius:999px;margin-bottom:20px}
h1{font-size:clamp(2.2rem,5vw,3.4rem);line-height:1.15;letter-spacing:-.01em}
.sub{font-size:1.05rem;color:#7A6F5D;max-width:500px;margin:18px auto 0;line-height:1.8}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;padding:48px 0}
.card{background:#FFFFFF;border-radius:24px;padding:28px;border:1px solid rgba(45,36,24,.06);box-shadow:0 4px 16px rgba(139,109,68,.06);transition:all .4s cubic-bezier(.25,.8,.25,1)}
.card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(139,109,68,.1)}
.icon{width:48px;height:48px;border-radius:60% 40% 45% 55%/50% 60% 40% 50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:14px}
.ic1{background:rgba(91,124,79,.12)}.ic2{background:rgba(196,132,62,.12)}.ic3{background:rgba(94,139,158,.12)}
.card h3{font-size:1rem;font-weight:700;margin-bottom:8px}
.card p{font-size:.88rem;color:#7A6F5D;line-height:1.7}
.mkt{text-align:center;padding:56px 0}
.mkbox{display:inline-block;background:#fff;border-radius:32px 28px 36px 24px;padding:36px 56px;border:1px solid rgba(45,36,24,.06);box-shadow:0 4px 16px rgba(139,109,68,.06)}
.mv{font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;color:#5B7C4F}
.ml{font-size:.8rem;color:#7A6F5D;margin-top:8px}
.road{padding:40px 0 72px}
.road h2{text-align:center;font-size:1.3rem;font-weight:800;margin-bottom:28px}
.stp{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid rgba(45,36,24,.06)}
.stp .num{width:28px;height:28px;border-radius:50%;background:#5B7C4F;color:#fff;font-size:.8rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.stp p{font-size:.9rem;color:#7A6F5D;line-height:1.65}
footer{text-align:center;padding:48px 0;font-size:.7rem;color:#bfb5a3}
@media(max-width:640px){.cards{grid-template-columns:1fr}.hero{padding:64px 0 40px}}
</style></head><body>
<div class="blob bl1"></div><div class="blob bl2"></div>
<div class="w">
<section class="hero f"><span class="pill">New Idea</span>
<h1 class="serif">${esc(idea.title)}</h1>
<p class="sub">${esc(idea.oneLiner)}</p></section>
<section class="cards f d1">
<div class="card"><div class="icon ic1">🎯</div><h3>타겟 고객</h3><p>${esc(idea.target)}</p></div>
<div class="card"><div class="icon ic2">✨</div><h3>차별화 포인트</h3><p>${esc(idea.differentiator)}</p></div>
<div class="card"><div class="icon ic3">💰</div><h3>수익 모델</h3><p>${esc(idea.revenueModel)}</p></div>
</section>
<section class="mkt f d2"><div class="mkbox"><div class="mv">${esc(idea.marketSize)}</div><p class="ml">시장 규모</p></div></section>
<section class="road f d3"><h2 class="serif">다음 단계</h2>${steps}</section>
<footer class="f d4">🌿 ${FOOTER_TEXT}</footer>
</div></body></html>`;
}

// ── 8. Corporate ──

function corporateTemplate(idea: FinalIdea): string {
  const steps = idea.nextSteps
    .map(
      (s, i) =>
        `<div class="stp"><div class="sn">${i + 1}</div><p>${esc(s)}</p></div>`,
    )
    .join("\n");
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',system-ui,sans-serif;background:#fff;color:#111827;min-height:100vh}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.f{animation:fadeUp .6s ease both}.d1{animation-delay:.12s}.d2{animation-delay:.24s}.d3{animation-delay:.36s}.d4{animation-delay:.48s}
.w{max-width:960px;margin:0 auto;padding:0 24px}
.hero{padding:88px 0 48px;text-align:center;border-bottom:1px solid #e5e7eb}
.badge{display:inline-flex;align-items:center;padding:4px 14px;font-size:.75rem;font-weight:600;border-radius:999px;background:#eff6ff;color:#2563eb;margin-bottom:16px}
h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;line-height:1.2;letter-spacing:-.02em}
.sub{font-size:1rem;color:#4b5563;max-width:520px;margin:14px auto 0;line-height:1.65}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:48px 0}
.stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:24px}
.stat .label{font-size:.7rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px}
.stat h3{font-size:1rem;font-weight:600;margin-bottom:6px;color:#111827}
.stat p{font-size:.88rem;color:#4b5563;line-height:1.6}
.mkt{background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:48px 0;text-align:center}
.mv{font-size:clamp(1.5rem,3vw,2.2rem);font-weight:700;color:#2563eb}
.ml{font-size:.8rem;color:#9ca3af;margin-top:6px}
.road{padding:48px 0}
.road h2{font-size:1.1rem;font-weight:600;margin-bottom:24px}
.stp{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #f3f4f6;align-items:flex-start}
.sn{width:24px;height:24px;border-radius:6px;background:#2563eb;color:#fff;font-size:.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.stp p{font-size:.9rem;color:#4b5563;line-height:1.6}
footer{text-align:center;padding:40px 0;font-size:.7rem;color:#d1d5db}
@media(max-width:768px){.stats{grid-template-columns:1fr}}
</style></head><body>
<div class="w">
<section class="hero f"><div class="badge">New Business Idea</div>
<h1>${esc(idea.title)}</h1><p class="sub">${esc(idea.oneLiner)}</p></section>
</div>
<section class="stats w f d1">
<div class="stat"><p class="label">Target Customer</p><h3>타겟 고객</h3><p>${esc(idea.target)}</p></div>
<div class="stat"><p class="label">Differentiator</p><h3>차별화 포인트</h3><p>${esc(idea.differentiator)}</p></div>
<div class="stat"><p class="label">Revenue Model</p><h3>수익 모델</h3><p>${esc(idea.revenueModel)}</p></div>
</section>
<section class="mkt f d2"><div class="mv">${esc(idea.marketSize)}</div><p class="ml">Total Addressable Market</p></section>
<div class="w">
<section class="road f d3"><h2>Next Steps</h2>${steps}</section>
<footer class="f d4">${FOOTER_TEXT}</footer>
</div></body></html>`;
}

// ── 9. Gradient Mesh (보너스) ──

function gradientMeshTemplate(idea: FinalIdea): string {
  const steps = idea.nextSteps
    .map(
      (s, i) =>
        `<div class="stp"><span class="num">${String(i + 1).padStart(2, "0")}</span><p>${esc(s)}</p></div>`,
    )
    .join("\n");
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;500;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Sora',system-ui,sans-serif;color:#fff;min-height:100vh;overflow-x:hidden;
background:#0f172a;background-image:radial-gradient(ellipse at 10% 20%,rgba(124,58,237,.25),transparent 50%),radial-gradient(ellipse at 90% 80%,rgba(236,72,153,.2),transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(14,165,233,.15),transparent 40%)}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
.f{animation:fadeUp .8s ease both}.d1{animation-delay:.15s}.d2{animation-delay:.3s}.d3{animation-delay:.45s}.d4{animation-delay:.6s}
.w{max-width:900px;margin:0 auto;padding:0 28px;position:relative;z-index:1}
.hero{padding:100px 0 56px;text-align:center}
.chip{display:inline-flex;padding:6px 18px;font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(255,255,255,.15);border-radius:999px;color:rgba(255,255,255,.7);margin-bottom:20px;backdrop-filter:blur(8px);background:rgba(255,255,255,.05)}
h1{font-size:clamp(2.2rem,5.5vw,3.6rem);font-weight:800;line-height:1.1;background:linear-gradient(135deg,#e879f9,#7c3aed,#0ea5e9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{font-size:1.05rem;font-weight:300;color:rgba(255,255,255,.5);max-width:520px;margin:18px auto 0;line-height:1.7}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;padding:48px 0}
.card{padding:28px;border-radius:20px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);backdrop-filter:blur(12px);transition:all .3s ease}
.card:hover{border-color:rgba(255,255,255,.18);transform:translateY(-3px)}
.card .lb{font-size:.65rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:10px}
.card h3{font-size:1rem;font-weight:700;margin-bottom:6px}
.card p{font-size:.88rem;color:rgba(255,255,255,.5);line-height:1.65}
.mkt{text-align:center;padding:56px 0}
.mkb{display:inline-block;padding:32px 52px;border-radius:24px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);backdrop-filter:blur(12px)}
.mv{font-size:clamp(1.4rem,3vw,2rem);font-weight:800;background:linear-gradient(90deg,#e879f9,#0ea5e9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ml{font-size:.75rem;color:rgba(255,255,255,.35);margin-top:8px}
.road{padding:40px 0 72px}
.road h2{text-align:center;font-size:1.2rem;font-weight:700;margin-bottom:28px;color:rgba(255,255,255,.8)}
.stp{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.num{font-size:.8rem;font-weight:700;color:#e879f9;min-width:28px;flex-shrink:0}
.stp p{font-size:.88rem;color:rgba(255,255,255,.5);line-height:1.6}
footer{text-align:center;padding:40px 0;font-size:.7rem;color:rgba(255,255,255,.2)}
@media(max-width:640px){.cards{grid-template-columns:1fr}.hero{padding:64px 0 40px}}
</style></head><body>
<div class="w">
<section class="hero f"><span class="chip">New Idea</span>
<h1>${esc(idea.title)}</h1><p class="sub">${esc(idea.oneLiner)}</p></section>
<section class="cards f d1">
<div class="card"><p class="lb">Target</p><h3>타겟 고객</h3><p>${esc(idea.target)}</p></div>
<div class="card"><p class="lb">Edge</p><h3>차별화 포인트</h3><p>${esc(idea.differentiator)}</p></div>
<div class="card"><p class="lb">Revenue</p><h3>수익 모델</h3><p>${esc(idea.revenueModel)}</p></div>
</section>
<section class="mkt f d2"><div class="mkb"><div class="mv">${esc(idea.marketSize)}</div><p class="ml">시장 규모</p></div></section>
<section class="road f d3"><h2>Next Steps</h2>${steps}</section>
<footer class="f d4">⚔️ ${FOOTER_TEXT}</footer>
</div></body></html>`;
}

// ── Template Registry ──

interface TemplateEntry {
  id: string;
  name: string;
  keywords: string[];
  render: (idea: FinalIdea) => string;
}

const TEMPLATES: TemplateEntry[] = [
  {
    id: "glass",
    name: "Glassmorphism",
    keywords: [
      "앱",
      "플랫폼",
      "소셜",
      "z세대",
      "모바일",
      "커뮤니티",
      "라이프스타일",
      "숏폼",
      "콘텐츠",
      "sns",
    ],
    render: glassTemplate,
  },
  {
    id: "neobrutal",
    name: "Neobrutalism",
    keywords: [
      "saas",
      "도구",
      "크리에이터",
      "인디",
      "재미",
      "게임",
      "생산성",
      "tool",
      "노코드",
      "사이드",
    ],
    render: neobrutaTemplate,
  },
  {
    id: "editorial",
    name: "Editorial",
    keywords: [
      "패션",
      "럭셔리",
      "문화",
      "브랜드",
      "프리미엄",
      "아트",
      "매거진",
      "뷰티",
      "외국인",
      "한국",
      "한류",
    ],
    render: editorialTemplate,
  },
  {
    id: "minimal",
    name: "Minimalism",
    keywords: [
      "심플",
      "웰니스",
      "건강",
      "명상",
      "미니멀",
      "에센셜",
      "정리",
      "습관",
      "일기",
      "기록",
    ],
    render: minimalTemplate,
  },
  {
    id: "dark-neon",
    name: "Dark Neon",
    keywords: [
      "개발",
      "코딩",
      "api",
      "ai",
      "블록체인",
      "데이터",
      "자동화",
      "인공지능",
      "머신러닝",
      "클라우드",
    ],
    render: darkNeonTemplate,
  },
  {
    id: "bento",
    name: "Bento Grid",
    keywords: [
      "쇼케이스",
      "기능",
      "프로덕트",
      "올인원",
      "대시보드",
      "분석",
      "마케팅",
      "서비스",
    ],
    render: bentoTemplate,
  },
  {
    id: "organic",
    name: "Organic Shapes",
    keywords: [
      "식품",
      "음식",
      "친환경",
      "자연",
      "유기농",
      "농업",
      "환경",
      "반려",
      "동물",
      "여행",
    ],
    render: organicTemplate,
  },
  {
    id: "corporate",
    name: "Minimal Corporate",
    keywords: [
      "b2b",
      "기업",
      "금융",
      "비즈니스",
      "보험",
      "은행",
      "컨설팅",
      "솔루션",
      "hr",
      "erp",
    ],
    render: corporateTemplate,
  },
  {
    id: "gradient-mesh",
    name: "Gradient Mesh",
    keywords: [
      "스타트업",
      "혁신",
      "글로벌",
      "테크",
      "핀테크",
      "에듀테크",
      "헬스",
      "구독",
      "멤버십",
    ],
    render: gradientMeshTemplate,
  },
];

// ── Template Selector ──

export function selectTemplateId(idea: FinalIdea): string {
  const text =
    `${idea.title} ${idea.oneLiner} ${idea.target} ${idea.differentiator} ${idea.revenueModel}`.toLowerCase();

  let bestId = "glass";
  let bestScore = 0;

  for (const t of TEMPLATES) {
    const score = t.keywords.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestId = t.id;
    }
  }

  return bestId;
}

// ── Public API ──

export function renderLandingPage(
  idea: FinalIdea,
  templateId?: string,
): string {
  const id = templateId ?? selectTemplateId(idea);
  const entry = TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
  return entry.render(idea);
}

export function getTemplateList(): { id: string; name: string }[] {
  return TEMPLATES.map((t) => ({ id: t.id, name: t.name }));
}
