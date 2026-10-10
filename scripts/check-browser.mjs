// Real Chromium interaction checks on the CI preview, not the user's browser.
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';

const base = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:8787/portfolio/';
const output = '_site/audits';
await mkdir(output, {recursive: true});
let browser;
const results = [];
try {
  browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage']});
  for (const viewport of [{width: 1280, height: 900}, {width: 390, height: 844}]) {
    const device = viewport.width < 760 ? 'mobile' : 'desktop';
    const context = await browser.newContext({viewport, reducedMotion: 'reduce'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    async function ready() {
      await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
      await page.evaluate(() => document.fonts.ready);
    }
    async function layoutAndScreenshot(name) {
      // Load every lazy image before taking a full-page screenshot.
      for (const image of await page.locator('main img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(element => element.decode());
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert.equal(overflow, false, `${device}/${name}: horizontal overflow`);
      assert.equal(await page.locator('video').count(), 0);
      await page.screenshot({path: `${output}/browser-${device}-${name}.png`, fullPage: true});
    }
    await page.goto(base); await ready();
    assert.equal(await page.locator('.case-card').count(), 5);
    assert.ok((await page.locator('main').innerText()).includes('76.41%'));
    await layoutAndScreenshot('home');
    if (device === 'mobile') {
      await page.locator('#menu-toggle').click();
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
      await page.locator('#menu-toggle').click();
    }
    await page.getByRole('link', {name: 'All projects', exact: true}).click();
    await page.locator('#project-search').waitFor();
    assert.equal(await page.locator('.lab-card').count(), 19);
    assert.equal(await page.locator('#advanced-filters').getAttribute('open'), null);
    assert.equal(await page.locator('.lab-collection').count(), 5);
    await layoutAndScreenshot('lab');
    await page.locator('[data-area="agents"]').click();
    assert.equal(await page.locator('.lab-card').count(), 7);
    await page.locator('#project-search').fill('BridgePulse');
    assert.equal(await page.locator('.lab-card').count(), 0);
    await page.locator('[data-reset]').click();
    assert.equal(await page.locator('.lab-card').count(), 19);
    await page.locator('#advanced-filters summary').click();
    await page.locator('#topic-select').selectOption('Data & SQL');
    await page.locator('#type-select').selectOption('prototype');
    assert.equal(await page.locator('.lab-card').count(), 1);
    assert.ok((await page.locator('.lab-card').innerText()).includes('RAFI'));
    await page.locator('[data-reset]').click();
    await page.locator('#project-search').fill('UFC');
    await page.locator('.lab-card').click();
    await page.locator('.saved-evidence').waitFor();
    await layoutAndScreenshot('ufc');
    await page.goto(base + 'work/bridgepulse/'); await ready();
    await page.locator('.figure-evidence').waitFor();
    await layoutAndScreenshot('bridgepulse');
    await page.goto(base + 'work/car-price-prediction/'); await ready();
    assert.ok((await page.locator('.detail-next').innerText()).includes('Data Science & ML'));
    assert.ok(!(await page.locator('.detail-next').innerText()).includes('JEV'));
    await page.goto(base + 'work/wall-e-voice-ui-experiment/'); await ready();
    assert.equal(await page.locator('.detail-next a').count(), 1);
    assert.deepEqual(errors, [], `${device}: JavaScript runtime errors`);
    results.push({device, viewport, status: 'passed', checks: ['menu and Escape', 'search and category filter', 'advanced filters and reset', 'featured hierarchy', 'within-category navigation', 'saved evidence', 'no video', 'no horizontal overflow', 'no runtime errors']});
    await context.close();
  }
  await writeFile(`${output}/browser-checks.json`, JSON.stringify({commit: process.env.GITHUB_SHA, browser: 'Chromium', results}, null, 2));
  console.log('PASS: real Chromium desktop/mobile interactions, layouts and saved evidence screenshots.');
} catch (error) {
  const message = String(error.stack || error).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
  console.error(`::error title=Browser validation failed::${message}`);
  throw error;
} finally {
  await browser?.close();
}
