// Render page/index.html to entry.png (1024x1024) with headless Chromium.
// Usage: PW_NODE_MODULES=<dir containing playwright> node tools/render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pwDir = process.env.PW_NODE_MODULES;
if (!pwDir) { console.error('Set PW_NODE_MODULES to a node_modules folder that contains playwright.'); process.exit(1); }
const require = createRequire(path.join(pwDir, 'index.js'));
const { chromium } = require('playwright');

const LIMIT = 950 * 1024;
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(root, 'page', 'index.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.dataset.ready === '1');
  await page.evaluate(() => document.fonts.ready);
  let bytes = await page.screenshot({ type: 'png' });
  let kind = 'png';
  if (bytes.length > LIMIT) { bytes = await page.screenshot({ type: 'jpeg', quality: 92 }); kind = 'jpeg'; }
  fs.writeFileSync(path.join(root, 'entry.png'), bytes);
  const mrz = await page.evaluate(() => document.body.dataset.mrz);
  console.log(`entry.png: ${kind} bytes, ${bytes.length} B`);
  console.log('MRZ:\n' + mrz.split('|').join('\n'));

  // small preview for checking legibility at thumbnail size
  fs.mkdirSync(path.join(root, 'out'), { recursive: true });
  const prev = await browser.newPage({ viewport: { width: 300, height: 300 }, deviceScaleFactor: 1 });
  const b64 = bytes.toString('base64');
  await prev.setContent(`<body style="margin:0"><img style="width:300px;height:300px;display:block" src="data:image/${kind};base64,${b64}"></body>`);
  await prev.screenshot({ path: path.join(root, 'out', 'preview300.png') });
} finally {
  await browser.close();
}
