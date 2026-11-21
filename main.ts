// make.fun entry: copies the pre-rendered passport spread to the output folder.
// Node 22, built-ins only. Output: $MAKEFUN_OUTPUT_DIR/entry.png, or /output/entry.png.
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const candidates = [join(here, 'entry.png'), resolve(process.cwd(), 'entry.png')];
const src = candidates.find((p) => existsSync(p));
if (!src) {
  console.error('entry.png not found next to main.ts');
  process.exit(1);
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, 'entry.png');
copyFileSync(src, dest);
console.log(`wrote ${dest} (${statSync(dest).size} bytes)`);
