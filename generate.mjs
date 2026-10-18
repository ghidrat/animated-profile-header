#!/usr/bin/env node
// animated-profile-header — generate a self-contained animated SVG header
// for a GitHub profile README. No runtime deps, no external services.
//
// Usage:
//   node generate.mjs --name "muriel" --tag "backend engineer" \
//     --meta "TypeScript · Python" --handle "ghidrat" --out ./dist
//
// Produces: dist/header-dark.svg and dist/header-light.svg

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i];
    if (!k?.startsWith("--")) continue;
    out[k.slice(2)] = argv[i + 1];
  }
  return out;
}

const a = parseArgs(process.argv.slice(2));
const name = a.name ?? "your name";
const tag = a.tag ?? "software engineer";
const meta = a.meta ?? "";
const handle = a.handle ?? "";
const outDir = a.out ?? "./dist";

const themes = {
  dark: {
    bg: "#0d1117", border: "#21262d", grid: "#161b22",
    fg: "#e6edf3", sub: "#8b949e", faint: "#6e7681",
    a1: a.accent ?? "#58a6ff", a2: a.accent2 ?? "#bc8cff", tick: "#3fb950",
  },
  light: {
    bg: "#ffffff", border: "#d8dee4", grid: "#f6f8fa",
    fg: "#1f2328", sub: "#59636e", faint: "#818b98",
    a1: a.accentLight ?? "#0969da", a2: a.accent2Light ?? "#8250df", tick: "#1a7f37",
  },
};

const sans = `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
const mono = `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;
const esc = (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] ?? c);
const escStr = (s) => [...s].map(esc).join("");

function header(t) {
  const W = 860, H = 230;
  const perChar = 0.06, typeStart = 1.1;
  const typeEnd = typeStart + tag.length * perChar;
  const tagFs = 20, tagCharW = tagFs * 0.6;
  const tagX = 44, tagY = 182, textW = tag.length * tagCharW;
  const chars = [...tag]
    .map((c, i) => `<tspan style="animation-delay:${(typeStart + i * perChar).toFixed(3)}s">${c === " " ? "&#160;" : esc(c)}</tspan>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>
  .sans{font-family:${sans};} .mono{font-family:${mono};}
  .in{opacity:0;animation:in .9s cubic-bezier(.2,.7,.2,1) forwards;}
  .typed tspan{opacity:0;animation:show .01s linear forwards;}
  .cur{opacity:0;animation:mv ${(typeEnd-typeStart).toFixed(2)}s steps(${tag.length}) ${typeStart}s forwards, bl 1s step-end ${typeStart}s infinite;}
  .dot{animation:pulse 2.6s ease-in-out infinite;transform-origin:center;transform-box:fill-box;}
  .sweep{animation:sweep 6s cubic-bezier(.4,0,.2,1) infinite;}
  @keyframes in{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
  @keyframes show{to{opacity:1;}}
  @keyframes mv{from{transform:translateX(0);}to{transform:translateX(${textW}px);}}
  @keyframes bl{0%,100%{opacity:1;}50%{opacity:0;}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.35;}}
  @keyframes sweep{0%{transform:translateX(-30%);}100%{transform:translateX(130%);}}
</style>
<defs>
  <linearGradient id="name" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${t.fg}"/>
    <stop offset=".6" stop-color="${t.fg}"/>
    <stop offset="1" stop-color="${t.a1}"/>
  </linearGradient>
  <linearGradient id="rule" x1="0" x2="1">
    <stop offset="0" stop-color="${t.a1}" stop-opacity="0"/>
    <stop offset=".5" stop-color="${t.a2}"/>
    <stop offset="1" stop-color="${t.a1}" stop-opacity="0"/>
  </linearGradient>
  <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
    <path d="M26 0H0V26" fill="none" stroke="${t.grid}" stroke-width="1"/>
  </pattern>
  <clipPath id="c"><rect x="1" y="1" width="${W-2}" height="${H-2}" rx="16"/></clipPath>
  <radialGradient id="glow" cx=".82" cy=".1" r=".7">
    <stop offset="0" stop-color="${t.a2}" stop-opacity="${t.bg === "#ffffff" ? ".10" : ".16"}"/>
    <stop offset="1" stop-color="${t.a2}" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect x="1" y="1" width="${W-2}" height="${H-2}" rx="16" fill="${t.bg}" stroke="${t.border}"/>
<g clip-path="url(#c)">
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#grid)"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#glow)"/>
  <rect class="sweep" x="0" y="${H-3}" width="40%" height="3" fill="url(#rule)"/>
</g>

<g class="in">
  <circle class="dot" cx="48" cy="52" r="4" fill="${t.tick}"/>
  <text x="62" y="57" class="mono" font-size="13" fill="${t.sub}">${escStr(handle)}</text>
  <text x="${W-44}" y="57" text-anchor="end" class="mono" font-size="13" fill="${t.faint}">${escStr(meta)}</text>
</g>

<text x="42" y="138" class="sans in" font-size="66" font-weight="700" letter-spacing="-2.5" fill="url(#name)" style="animation-delay:.18s">${escStr(name)}</text>

<text x="${tagX}" y="${tagY}" class="mono" font-size="${tagFs}" fill="${t.a2}">
  <tspan class="in" style="animation-delay:.5s" fill="${t.a1}">&gt;&#160;</tspan>
</text>
<text x="${tagX + 2*tagCharW}" y="${tagY}" class="mono typed" font-size="${tagFs}" fill="${t.sub}" textLength="${textW}" lengthAdjust="spacing">${chars}</text>
<rect class="cur" x="${tagX + 2*tagCharW + 1}" y="${tagY - tagFs + 4}" width="${tagCharW*0.9}" height="${tagFs+2}" fill="${t.a1}"/>
</svg>
`;
}

mkdirSync(outDir, { recursive: true });
for (const [theme, t] of Object.entries(themes)) {
  const file = join(outDir, `header-${theme}.svg`);
  writeFileSync(file, header(t));
  console.log(`wrote ${file}`);
}
