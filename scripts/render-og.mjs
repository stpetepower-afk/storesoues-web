// Rasterizes assets/img/og-image.svg -> assets/img/og-image.png (1200x630)
// Run: node scripts/render-og.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'assets/img/og-image.svg'), 'utf8');

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(
  `<!doctype html><html><body style="margin:0">${svg}</body></html>`,
  { waitUntil: 'networkidle' }
);
await page.locator('svg').screenshot({ path: join(root, 'assets/img/og-image.png') });
await browser.close();
console.log('Wrote assets/img/og-image.png');
