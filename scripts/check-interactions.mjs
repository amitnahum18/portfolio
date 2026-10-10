import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../site/dist/', import.meta.url));
const data = JSON.parse(await readFile(root + '/data/portfolio.json', 'utf8'));
let source = await readFile(root + '/app.js', 'utf8');
source = source.slice(0, source.lastIndexOf('\ntry {')).replace('import.meta.url', "'https://amitnahum18.github.io/portfolio/app.js'");
const nodes = new Map();
const handlers = {};
const buttons = ['', 'data-science', 'agents', 'other'].map(area => ({dataset: {area}, attrs: {}, setAttribute(key, value) {this.attrs[key] = String(value);}}));
const node = selector => {
  if (!nodes.has(selector)) nodes.set(selector, {innerHTML: '', value: '', attrs: {}, classList: {toggle() {}, remove() {}}, focus() {this.focused = true;}, setAttribute(key, value) {this.attrs[key] = value;}});
  return nodes.get(selector);
};
const location = {pathname: '/portfolio/', search: '?lang=he', hash: '', href: 'https://amitnahum18.github.io/portfolio/?lang=he'};
const document = {documentElement: {dataset: {}}, querySelector: node, querySelectorAll: () => buttons, addEventListener: (event, handler) => {handlers[event] = handler;}};
let cleanedURL;
const context = vm.createContext({
  document, location, URL, URLSearchParams, data, assert,
  window: {scrollY: 0, scrollTo() {}, addEventListener() {}},
  history: {replaceState: (_, __, url) => {cleanedURL = url.href;}},
  localStorage: {getItem() {throw new Error('English-only UI must ignore old language preferences');}},
});
new vm.Script(source + `
  catalogue = data;
  renderRoute();
  assert.equal(language, 'en');
  assert.equal(document.documentElement.lang, 'en');
  assert.equal(document.documentElement.dir, 'ltr');
  assert.ok(!home().includes('language-toggle'));
  assert.ok(home().includes('Download CV'));
  assert.ok(!/[\\u0590-\\u05ff]/.test(home()));
  for (const item of catalogue.projects) {
    const markup = detail(item);
    assert.ok(markup.includes(q(item.en.goal)));
    assert.ok(item.en.limitations.every(value => markup.includes(q(value))));
    assert.equal(pageMetadata('/work/' + item.slug).description, item.en.summary);
    assert.ok(!/[\\u0590-\\u05ff]/.test(markup));
  }
`).runInContext(context);
assert.equal(cleanedURL, 'https://amitnahum18.github.io/portfolio/');
const original = node('#app').innerHTML;
handlers.click({target: {closest: selector => selector === '[data-area]' ? buttons[2] : null}});
assert.equal(node('#results-count').textContent, '7 projects');
assert.equal(buttons[2].attrs['aria-pressed'], 'true');
handlers.input({target: {id: 'project-search', value: 'BridgePulse'}});
assert.equal(node('#results-count').textContent, '0 projects');
handlers.click({target: {closest: selector => selector === '[data-reset]' ? {} : null}});
assert.equal(node('#results-count').textContent, '19 projects');
assert.equal(node('#app').innerHTML, original);
handlers.change({target: {id: 'topic-select', value: 'Data & SQL'}});
assert.equal(node('#advanced-filter-count').textContent, ' (1 active)');
handlers.change({target: {id: 'type-select', value: 'prototype'}});
assert.equal(node('#advanced-filter-count').textContent, ' (2 active)');
new vm.Script(`assert.equal(filteredProjects().length, 1); assert.equal(filteredProjects()[0].slug, 'rafi-data-analyst-agent'); assert.ok(lab().includes('class="advanced-filters" open'));`).runInContext(context);
handlers.click({target: {closest: selector => selector === '[data-reset]' ? {} : null}});
assert.equal(node('#advanced-filter-count').textContent, '');
assert.equal(node('#results-count').textContent, '19 projects');
new vm.Script(`assert.ok(!lab().includes('class="advanced-filters" open')); assert.ok(home().includes(p().experienceProof)); assert.ok(home().includes('Measured Result')); assert.ok(home().includes('Deliverable'));`).runInContext(context);
handlers.click({target: {closest: selector => selector === '#menu-toggle' ? {} : null}});
assert.equal(node('#menu-toggle').attrs['aria-expanded'], true);
handlers.keydown({key: 'Escape'});
assert.equal(node('#menu-toggle').attrs['aria-expanded'], 'false');
assert.ok(node('#menu-toggle').focused);
assert.equal(document.documentElement.dataset.input, 'keyboard');
await new vm.Script(`(async () => {
  let reduced = true, plays = 0, pauses = 0;
  window.matchMedia = () => ({matches: reduced});
  const classes = new Set();
  const video = {dataset: {previewSrc: '/portfolio/assets/projects/bridgepulse-loop-v1.mp4'},
    classList: {add: value => classes.add(value), remove: value => classes.delete(value)},
    getAttribute: () => video.src, play: () => {plays++; return Promise.resolve();}, pause: () => pauses++};
  const link = {querySelector: () => video, contains: () => false};
  startPreview(link);
  assert.equal(plays, 0); assert.equal(video.src, undefined);
  reduced = false;
  startPreview(link); await Promise.resolve();
  assert.equal(plays, 1); assert.equal(video.muted, true);
  assert.equal(video.src, video.dataset.previewSrc); assert.equal(video.currentTime, 0);
  assert.ok(classes.has('is-playing'));
  startPreview(link); assert.equal(plays, 1);
  stopPreview(); assert.equal(pauses, 1); assert.ok(!classes.has('is-playing'));
  startPreview(link); await Promise.resolve();
  renderRoute(); assert.equal(activePreview, null); assert.equal(pauses, 2);
  assert.equal((lab().match(/data-preview-src=/g) || []).length, 19);
  assert.ok(!lab().includes('<video src='));
})()`).runInContext(context);
console.log('PASS: English-only routes, filters, metadata, keyboard menu; 19 lazy video previews, reduced motion, pause and route cleanup.');
