// Render the same public UI at build time, without a browser or dependencies.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../site/dist/', import.meta.url));
const base = process.argv[2] || '/portfolio/';
const data = JSON.parse(await readFile(root + '/data/portfolio.json', 'utf8'));
let source = await readFile(root + '/app.js', 'utf8');
source = source.slice(0, source.indexOf("document.addEventListener('click'"));
source = source.replace('import.meta.url', JSON.stringify(`https://amitnahum18.github.io${base}app.js`));
const context = vm.createContext({
  document: {querySelector: () => ({})},
  location: {pathname: base, search: '', hash: ''},
  URL, URLSearchParams, data,
});
const pages = new vm.Script(source + `
  catalogue = data;
  [{path: '/', html: home()}, {path: '/lab', html: lab()},
    ...catalogue.projects.map(item => ({path: '/work/' + item.slug, html: detail(item)}))]
    .map(page => ({...page, ...pageMetadata(page.path)}));
`).runInContext(context);
process.stdout.write(JSON.stringify(pages));
