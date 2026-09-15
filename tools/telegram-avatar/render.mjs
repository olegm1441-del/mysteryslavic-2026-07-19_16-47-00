import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const outDir = process.argv[2] ?? 'frames30';
const fps    = Number(process.argv[3] ?? 30);
const dur    = 4;                       // seconds, seamless loop
const only   = process.argv[4];         // optional: render a single t for preview
const n      = Math.round(fps * dur);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--force-color-profile=srgb', '--disable-lcd-text'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 1280 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.resolve('scene.html'));
await page.waitForFunction('window.__ready === true');

if (only !== undefined) {
  await page.evaluate(t => window.setT(t), Number(only));
  await page.screenshot({ path: path.join(outDir, 'preview.png') });
} else {
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.setT(t), i / n);   // i/n, not i/(n-1): frame n == frame 0
    await page.screenshot({ path: path.join(outDir, String(i).padStart(4, '0') + '.png') });
  }
  console.log(`rendered ${n} frames @ ${fps}fps -> ${outDir}`);
}
await browser.close();
