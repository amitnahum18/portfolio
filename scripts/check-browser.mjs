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
    assert.equal(await page.locator('.lab-card').count(), 18);
    assert.equal(await page.locator('#advanced-filters').getAttribute('open'), null);
    assert.equal(await page.locator('.lab-collection').count(), 4);
    await layoutAndScreenshot('lab');
    await page.locator('[data-area="agents"]').click();
    assert.equal(await page.locator('.lab-card').count(), 7);
    await page.locator('#project-search').fill('BridgePulse');
    assert.equal(await page.locator('.lab-card').count(), 0);
    await page.locator('.results-bar [data-reset]').click();
    assert.equal(await page.locator('.lab-card').count(), 18);
    await page.locator('#advanced-filters summary').click();
    await page.locator('#topic-select').selectOption('Data & SQL');
    await page.locator('#type-select').selectOption('prototype');
    assert.equal(await page.locator('.lab-card').count(), 1);
    assert.ok((await page.locator('.lab-card').innerText()).includes('RAFI'));
    await page.locator('.results-bar [data-reset]').click();
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
    await page.goto(base + 'lab/'); await ready();
    assert.equal(await page.locator('[data-area=other]').count(), 0);
    await page.locator('#project-search').fill('WALL_E');
    assert.equal(await page.locator('.lab-card').count(), 0);
    assert.deepEqual(errors, [], `${device}: JavaScript runtime errors`);
    // Verify the enhancement with motion enabled, not only reduced-motion screenshots.
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto(base); await ready();
    await page.evaluate(() => {
      window.motionEvents = [];
      document.addEventListener('animationstart', event => {
        const style = getComputedStyle(event.target);
        window.motionEvents.push({name: event.animationName, duration: style.animationDuration,
          offset: style.transform === 'none' ? 0 : new DOMMatrix(style.transform).m42});
      });
      const cards = [...document.querySelectorAll('.case-card')];
      const card = cards.find(element => element.getBoundingClientRect().top >= innerHeight);
      if (!card) throw new Error('No below-fold project card to test');
      window.scrollTo({top: card.getBoundingClientRect().top + scrollY - 120, behavior: 'instant'});
    });
    await page.waitForFunction(() => window.motionEvents.some(event => event.name === 'project-card-enter'));
    const entrance = await page.evaluate(() => window.motionEvents.find(event => event.name === 'project-card-enter'));
    assert.equal(entrance.duration, '0.3s');
    assert.ok(entrance.offset >= 0 && entrance.offset <= 12);
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.waitForFunction(() => !document.querySelector('.card-enter'));
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto(base + 'lab/'); await ready();
    await page.locator('[data-area="agents"]').scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => ({height: document.documentElement.scrollHeight, scroll: scrollY}));
    await page.locator('[data-area="agents"]').click();
    const transition = await page.locator('#lab-grid').evaluate(grid => ({duration: getComputedStyle(grid).animationDuration,
      height: document.documentElement.scrollHeight, scroll: scrollY}));
    assert.equal(transition.duration, '0.2s');
    assert.ok(Math.abs(transition.height - before.height) <= 2, `${device}: category page height changed`);
    assert.ok(Math.abs(transition.scroll - before.scroll) <= 2, `${device}: category scroll changed`);
    await page.waitForFunction(() => !document.querySelector('.lab-results-enter'));
    const after = await page.evaluate(() => ({height: document.documentElement.scrollHeight, scroll: scrollY}));
    assert.ok(Math.abs(after.height - before.height) <= 2);
    assert.ok(Math.abs(after.scroll - before.scroll) <= 2);
    await page.locator('[data-area="data-science"]').click();
    await page.locator('[data-area="agents"]').click();
    await page.locator('.results-bar [data-reset]').click();
    assert.equal(await page.locator('.lab-card').count(), 18);
    await page.waitForFunction(() => !document.querySelector('.lab-results-enter'));
    await page.locator('#project-search').fill('UFC');
    assert.equal(await page.locator('.lab-results-enter').count(), 0);
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.locator('[data-area="agents"]').click();
    assert.equal(await page.locator('.lab-results-enter').count(), 0);
    const staticContext = await browser.newContext({viewport, javaScriptEnabled: false});
    const staticPage = await staticContext.newPage();
    await staticPage.goto(base);
    assert.equal(await staticPage.locator('.case-card').count(), 5);
    assert.ok(await staticPage.getByRole('link', {name: 'All projects', exact: true}).isVisible());
    await staticPage.getByRole('link', {name: 'All projects', exact: true}).click();
    assert.equal(await staticPage.locator('.lab-card').count(), 18);
    assert.equal(await staticPage.locator('#project-search').isVisible(), false);
    await staticPage.locator('.lab-card').first().click();
    assert.ok(await staticPage.locator('main h1').isVisible());
    assert.ok((await staticPage.locator('main').innerText()).includes('BridgePulse'));
    assert.equal(await staticPage.locator('.card-enter').count(), 0);
    await staticContext.close();
    assert.deepEqual(errors, [], `${device}: motion runtime errors`);
    results.push({device, viewport, status: 'passed', checks: ['menu and Escape', 'search and category filter', 'advanced filters and reset', 'featured hierarchy', 'within-category navigation', 'saved evidence', 'no video', 'no horizontal overflow', 'no runtime errors', '0.3s card entry within 12px', '0.2s category fade with stable page height and scroll', 'rapid category changes', 'reduced motion including live preference changes', 'static content and navigation without JavaScript']});
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
