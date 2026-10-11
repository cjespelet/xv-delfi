import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dest = join(root, 'cliente', 'shots');
mkdirSync(dest, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
});
await page.goto('http://localhost:4323/', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

const ids = ['hero', 'countdown', 'agenda', 'fiesta', 'dress', 'regalos', 'urna', 'playlist', 'confirmar'];
for (const id of ids) {
  const loc = page.locator(`#${id}`);
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await loc.screenshot({ path: join(dest, `${id}.png`) });
}
await page.locator('footer').screenshot({ path: join(dest, 'footer.png') });
await browser.close();
console.log('ok', dest);
