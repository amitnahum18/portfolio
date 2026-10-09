"""Validate generated Pages content, accessibility basics and sharing metadata."""
import html
import json
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

root = Path(__file__).resolve().parents[1] / '_site'
data = json.loads((root / 'data/portfolio.json').read_text(encoding='utf-8'))
pages = [root / 'index.html', root / 'lab/index.html'] + [root / 'work' / p['slug'] / 'index.html' for p in data['projects']]

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []; self.links = []; self.images = []; self.metas = {}; self.canonical = None
        self.h1 = 0; self.main = 0; self.labels = []; self.inputs = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'main': self.main += 1
        if tag == 'a':
            assert a.get('href'), 'Link without href'
            self.links.append(a['href'])
        if tag == 'img':
            assert a.get('alt'), 'Image without descriptive alt'
            assert a.get('width') and a.get('height'), 'Image without dimensions'
            self.images.append(a['src'])
        if tag == 'label': self.labels.append(a.get('for'))
        if tag in ('input', 'select'): self.inputs.append(a.get('id'))
        if tag == 'meta': self.metas[a.get('name') or a.get('property')] = a.get('content')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a.get('href')

canonicals = set()
for path in pages:
    document = path.read_text(encoding='utf-8')
    assert '<html lang="en" dir="ltr">' in document, path
    assert not re.search('[\u0590-\u05ff]', document), f'Non-English UI: {path}'
    assert 'language-toggle' not in document, path
    base = re.search(r'<base href="([^"]+)"', document).group(1)
    page = Page(); page.feed(document)
    assert page.h1 == 1 and page.main == 1, path
    assert len(page.ids) == len(set(page.ids)), f'Duplicate ID: {path}'
    assert 'main' in page.ids
    assert all(identifier in page.labels for identifier in page.inputs), path
    title = html.unescape(re.search(r'<title>(.*?)</title>', document).group(1))
    assert page.metas['og:title'] == title == page.metas['twitter:title'], path
    assert page.metas['description'] == page.metas['og:description'] == page.metas['twitter:description'], path
    assert page.canonical == page.metas['og:url'], path
    assert page.canonical not in canonicals
    canonicals.add(page.canonical)
    schema = json.loads(re.search(r'id="structured-data">(.*?)</script>', document, re.S).group(1))
    assert schema['url'] == page.canonical
    for link in page.links + page.images:
        parsed = urlparse(link)
        if parsed.scheme or parsed.netloc: continue
        if not parsed.path:
            assert not parsed.fragment or parsed.fragment in page.ids, (path, link)
            continue
        assert parsed.path.startswith(base), (path, link)
        target = root / unquote(parsed.path.removeprefix(base))
        assert target.is_file() or (target / 'index.html').is_file(), (path, link)
    if path.relative_to(root).parts[0] == 'work':
        project = next(p for p in data['projects'] if p['slug'] == path.parent.name)
        decoded = html.unescape(document)
        assert project['en']['goal'] in decoded, path
        assert all(value in decoded for value in project['en']['limitations']), path

homepage = pages[0].read_text(encoding='utf-8')
ds, agents = homepage.split('id="work"', 1)[1].split('id="agents"', 1)
assert ds.count('class="case-card"') == 3
assert agents.count('class="case-card agent-card"') == 2
assert 'car-price-prediction' not in homepage
assert '81.97%' in homepage and 'state-grouped splits' in homepage
assert 'Nahum Team placed 2nd / 694' in homepage
assert 'case-context' not in homepage and 'MFCC' in homepage
assert len(data['profile']['skills']) + len(data['profile']['agentSkills']) == 10
assert 'Download CV' in homepage and 'View Projects' in homepage
assert homepage.count('<dt>Problem</dt>') == homepage.count('<dt>Solution</dt>') == 5
assert not re.search('[\u0590-\u05ff]', json.dumps(data, ensure_ascii=False))
assert len(re.findall(r'class="lab-card"', pages[1].read_text(encoding='utf-8'))) == 19
sitemap = ET.parse(root / 'sitemap.xml')
assert {node.text for node in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')} == canonicals
print(f'PASS: {len(pages)} full HTML pages, links/assets, accessibility basics, project limitations, unique sharing metadata and sitemap.')
