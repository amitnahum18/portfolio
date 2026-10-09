"""Publish actual Lighthouse measurements, with unavailable metrics explicit."""
import html
import json
import os
from pathlib import Path

root = Path(__file__).resolve().parents[1] / '_site/audits'
root.mkdir(parents=True, exist_ok=True)
summary = {'commit': os.environ.get('GITHUB_SHA'), 'scope': 'Lighthouse lab audit of the generated home page served locally on the GitHub Actions runner; simulated mobile and desktop. These are not real-user field measurements.', 'inp': {'status': 'not-measured', 'reason': 'A navigation Lighthouse audit does not measure representative real-user INP. No field data was retrieved.'}, 'reports': {}}
rows = []
for device in ['mobile', 'desktop']:
    files = list(root.glob(device + '*.json'))
    if not files:
        summary['reports'][device] = {'status': 'unavailable', 'reason': 'The Lighthouse runner did not produce a report.'}
        rows.append(f'<tr><th>{device}</th><td colspan="6">Audit unavailable; no score reported.</td></tr>')
        continue
    path = files[0]
    report = json.loads(path.read_text(encoding='utf-8'))
    if report.get('runtimeError'):
        summary['reports'][device] = {'status': 'failed', 'error': report['runtimeError']}
        rows.append(f'<tr><th>{device}</th><td colspan="6">Audit failed; no score reported.</td></tr>')
        continue
    scores = {key: round(value['score'] * 100) if value.get('score') is not None else None for key, value in report['categories'].items()}
    metrics = {key: report['audits'][key].get('numericValue') for key in ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time']}
    failed = [{'id': key, 'title': audit.get('title'), 'details': audit.get('details')} for key, audit in report['audits'].items() if audit.get('score') is not None and audit['score'] < 1 and audit.get('scoreDisplayMode') != 'informative']
    summary['reports'][device] = {'status': 'measured', 'date': report.get('fetchTime'), 'lighthouseVersion': report.get('lighthouseVersion'), 'scores': scores, 'metrics': metrics, 'failedAudits': failed, 'report': path.name.replace('.json', '.html')}
    values = ''.join(f'<td>{scores.get(key, "—")}</td>' for key in ['performance', 'accessibility', 'best-practices', 'seo'])
    rows.append(f'<tr><th>{device}</th>{values}<td>{metrics["largest-contentful-paint"] / 1000:.2f}s</td><td>{metrics["cumulative-layout-shift"]:.4f}</td></tr>')
    print(device, json.dumps({'scores': scores, 'metrics': metrics}))

(root / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
links = ''.join(f'<li><a href="{html.escape(entry["report"])}">{device.title()} Lighthouse report</a></li>' for device, entry in summary['reports'].items() if entry.get('report'))
document = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Portfolio audit measurements</title><style>body{font:16px/1.6 system-ui;margin:2rem auto;padding:0 1rem;max-width:900px;color:#111a26}table{border-collapse:collapse;display:block;overflow:auto}td,th{padding:.6rem;border:1px solid #ccd3dd;text-align:left}a{color:#274bb8}</style><h1>Portfolio audit measurements</h1><p>' + html.escape(summary['scope']) + '</p><p>Commit: ' + html.escape(summary['commit'] or 'local build') + '</p><table><thead><tr><th>Device</th><th>Performance</th><th>Accessibility</th><th>Best practices</th><th>SEO</th><th>LCP</th><th>CLS</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table><p>INP has not been measured. TBT is recorded in the JSON reports and is not reported as INP. The desired category score is 90 or higher; the table shows actual results.</p><ul>' + links + '</ul><p><a href="summary.json">Measurement data</a> · <a href="../">Portfolio</a></p></html>'
(root / 'index.html').write_text(document, encoding='utf-8')
