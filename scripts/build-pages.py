"""Generate real static entry pages so GitHub Pages supports refresh/deep links."""
import argparse
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--base-path', default='/portfolio/')
args = parser.parse_args()
base = '/' + args.base_path.strip('/') + '/' if args.base_path.strip('/') else '/'
if not re.fullmatch(r'/[A-Za-z0-9_/-]*', base):
    raise SystemExit('Invalid Pages base path.')
source = root / 'site/dist'
output = root / '_site'
data = json.loads((source / 'data/portfolio.json').read_text(encoding='utf-8'))
public_slugs = {project['slug'] for project in data['projects']}
for index in (output / 'work').glob('*/index.html'):
    if index.parent.name not in public_slugs:
        assert index.resolve().is_relative_to((output / 'work').resolve())
        index.unlink()
template = (source / 'index.html').read_text(encoding='utf-8').replace('<base href="/" />', f'<base href="{base}" />')
shutil.copytree(source, output, dirs_exist_ok=True)
(output / '.nojekyll').write_text('', encoding='utf-8')
(output / '404.html').write_text(template, encoding='utf-8')
rendered = subprocess.run(['node', str(root / 'scripts/render-pages.mjs'), base], check=True, capture_output=True, text=True, encoding='utf-8')
pages = json.loads(rendered.stdout)
urls = []
for entry in pages:
    page = output / entry['path'].lstrip('/')
    page.mkdir(parents=True, exist_ok=True)
    document = re.sub(r'<div id="app">.*?</div>', lambda _: '<div id="app">' + entry['html'] + '</div>', template, flags=re.S)
    document = re.sub(r'<title>.*?</title>', lambda _: '<title>' + html.escape(entry['title']) + '</title>', document)
    for attr, name, value in [
        ('name', 'description', entry['description']),
        ('property', 'og:title', entry['title']),
        ('property', 'og:description', entry['description']),
        ('property', 'og:url', entry['url']),
        ('property', 'og:image', entry['image']),
        ('name', 'twitter:title', entry['title']),
        ('name', 'twitter:description', entry['description']),
        ('name', 'twitter:image', entry['image']),
    ]:
        document = re.sub(rf'<meta {attr}="{re.escape(name)}" content="[^"]*" />', lambda _, a=attr, n=name, v=value: f'<meta {a}="{n}" content="{html.escape(v, quote=True)}" />', document)
    document = re.sub(r'<link rel="canonical" href="[^"]*" />', lambda _: '<link rel="canonical" href="' + html.escape(entry['url'], quote=True) + '" />', document)
    schema = json.dumps(entry['schema'], ensure_ascii=False).replace('<', '\\u003c')
    document = re.sub(r'(<script type="application/ld\+json" id="structured-data">).*?(</script>)', lambda m: m[1] + schema + m[2], document, flags=re.S)
    (page / 'index.html').write_text(document, encoding='utf-8')
    urls.append(entry['url'])

for project in data['projects']:
    slug = project['slug']
    if not re.fullmatch(r'[a-z0-9-]+', slug):
        raise SystemExit('Unsafe project slug.')
    for image in [project['image'], project.get('coverImage')]:
        if not image:
            continue
        paths = [image['src']] if 'src' in image else []
        for group in ['sources', 'mobileSources', 'cardSources']:
            paths += list(image.get(group, {}).values())
        for path in paths:
            if not (output / path.lstrip('/')).is_file():
                raise SystemExit('Missing project image: ' + path)
(output / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join('<url><loc>' + html.escape(url) + '</loc></url>' for url in urls) + '\n</urlset>\n', encoding='utf-8')
print(f'Prerendered home, lab and {len(data["projects"])} project pages with metadata and sitemap at {base}')
