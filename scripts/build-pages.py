"""Generate real static entry pages so GitHub Pages supports refresh/deep links."""
import argparse
import html
import json
import re
import shutil
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
template = (source / 'index.html').read_text(encoding='utf-8').replace('<base href="/" />', f'<base href="{base}" />')
shutil.copytree(source, output, dirs_exist_ok=True)
(output / 'index.html').write_text(template, encoding='utf-8')
(output / '.nojekyll').write_text('', encoding='utf-8')
(output / '404.html').write_text(template, encoding='utf-8')
lab = output / 'lab'
lab.mkdir(exist_ok=True)
(lab / 'index.html').write_text(template, encoding='utf-8')
for project in data['projects']:
    slug = project['slug']
    if not re.fullmatch(r'[a-z0-9-]+', slug):
        raise SystemExit('Unsafe project slug.')
    page = output / 'work' / slug
    page.mkdir(parents=True, exist_ok=True)
    title = html.escape(project['en']['title'] + ' — Amit Nahum')
    description = html.escape(project['en']['summary'], quote=True)
    document = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', template)
    document = re.sub(r'<meta name="description" content="[^"]*" />', f'<meta name="description" content="{description}" />', document)
    (page / 'index.html').write_text(document, encoding='utf-8')
    image = project['image']
    paths = [image['src']] if 'src' in image else []
    for group in ['sources', 'mobileSources', 'cardSources']:
        paths += list(image.get(group, {}).values())
    for path in paths:
        if not (output / path.lstrip('/')).is_file():
            raise SystemExit('Missing project image: ' + path)
print(f'Built home, lab, 404 and {len(data["projects"])} project entry pages at {base}')
