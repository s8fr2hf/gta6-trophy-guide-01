// Leonida Trophy Guide — hand-in program (Node 22, standard library only).
// It copies this repository's app/ and screenshots/ to the output directory
// and writes /output/dossier.json, the summary the judge reads, using the
// vendored make.fun library. vendor/makefun-frontend.ts is the kit's copy and
// must stay unchanged: the scorer rebuilds the dossier with its own copy and
// compares the two byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

const shots = existsSync(join(here, 'screenshots')) ? readdirSync(join(here, 'screenshots')) : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// Say what was handed in, so a silent or empty run is visible at a glance.
console.log(`Leonida Trophy Guide handed in: ${shots.length} screenshots, dossier.json ${dossier.length} bytes.`);
