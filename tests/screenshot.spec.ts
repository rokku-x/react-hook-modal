import { test } from '@playwright/test';

const examples = Array.from({ length: 15 }).map((_, i) => i + 1);

for (const id of examples) {
  test(`screenshot example-${id}`, async ({ page }) => {
    await page.goto(`/examples/screenshot-page/index.html?example=${id}`, { waitUntil: 'networkidle' });

    // Wait for the dialog to appear (fallback to the rendered modal wrapper)
    await page.waitForSelector('.hook-modal-window, dialog#base-modal-wrapper[open]', { timeout: 10000 });

    // Give animations a moment to settle
    await page.waitForTimeout(200);

    // Capture a fixed-size image matching the Chromium viewport (500x300)
    await page.screenshot({ path: `screenshots/react-hook-modal-example-${id}.png`, clip: { x: 0, y: 0, width: 550, height: 340 } });
  });
}
