// Leonida Trophy Guide — the program that hands the guide in (Node 22, stdlib only).
//
// What lives here: app/ is the guide itself, plain static files a browser opens at
// app/index.html (ES modules, one stylesheet, JSON data, no build step), and it loads
// nothing over the network. screenshots/ holds the four renders of it. This program
// gathers both into the output folder and writes dossier.json with the vendored
// make.fun library, which is the summary the judge reads: the screenshots, the first
// load's files and bytes, and the source. vendor/makefun-frontend.ts is the kit's
// copy and must stay untouched — the scorer rebuilds the dossier with its own copy
// and compares the two byte for byte, so any change there fails the entry.
//
// Try it locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (inside the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.)
// Serve the guide itself with:  node serve.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where this file sits, and where the hand-in goes.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own limits for this competition: the dossier text cap shapes the
// bytes; the rest refuse an entry the scorer would refuse anyway (too many or too
// large screenshots, too many files or bytes under app/).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function handIn() {
  if (!existsSync(join(repoRoot, 'app', 'index.html'))) {
    throw new Error('app/index.html is missing — the guide is not there to hand in');
  }
  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
  }
  const shots = readdirSync(join(outDir, 'screenshots')).filter((f) => !f.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`Expected 3 or 4 screenshots, found ${shots.length}`);
  }
  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  return { shots, dossierBytes: Buffer.byteLength(dossier) };
}

const result = handIn();
console.log(`Handed in ${result.shots.length} screenshots (${result.shots.join(', ')}), dossier ${result.dossierBytes} bytes, to ${outDir}`);
