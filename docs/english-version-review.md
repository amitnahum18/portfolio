# English portfolio acceptance review

The latest request for English only takes precedence over the attached plan's
earlier bilingual requirement. Internal translation source material is retained;
the deployed application and project data present English only. Old `?lang=he`
links still reach the same project, and saved language preferences are ignored.

| Before | After | Why |
| --- | --- | --- |
| Language toggle, translations and Hebrew font requests | English UI, data and image references | Match the current requested audience |
| One introductory paragraph and email CTA | Two short paragraphs, View Projects, Download CV and visible email/social links | Make the professional focus and next actions easy to scan |
| Cards combine problem and method | Explicit Problem, Solution and Result sections | Make the three-part story scannable |
| Old CV contains a UFC Kaggle Top 10 claim | Evidence-aligned one-page public English CV | Keep the download consistent with the project pages |
| Original photograph loads 1,339,024 bytes | Delivery derivative loads 42,808 bytes | Reduce image transfer while keeping the same photograph |
| External Google Fonts stylesheet | The same licensed Latin fonts hosted locally with `font-display: swap` | Remove third-party render-blocking requests |
| Two card columns at some mobile widths | One column through the mobile breakpoint | Improve reading width and touch navigation |
| Mobile menu only toggles by button | Escape closes the menu and returns keyboard focus | Support keyboard navigation |

## Acceptance checks

- All 19 project routes remain available, grouped into Data Science/ML, agents and supporting experiments.
- Three DS projects lead; two compact agent projects follow. No new performance claims are invented.
- Detailed evaluation context, caveats and project tools remain available on project pages.
- Every main route has English language/direction, a single H1, unique IDs, labeled inputs, descriptive image alt text and working local links.
- Canonical URLs, titles, descriptions, social metadata, structured data and sitemap are checked.
- Runtime checks cover obsolete language links/preferences, combined filters, reset and Escape focus handling.
- The public CV is rendered and visually reviewed; its links and page count are checked.

## Measurement scope

Deployment runs Lighthouse 13.5.0 against the actual generated home-page build on
a local server on the GitHub Actions runner, using simulated mobile and desktop.
JSON and HTML reports plus a score/metric summary are published at `/portfolio/audits/`.
Reports contain actual Performance, Accessibility, Best Practices and SEO scores,
LCP, CLS and TBT. TBT is not relabeled as INP. Real-user INP has not been measured.
If an audit fails, its summary explicitly reports unavailable results.

The desired category score is at least 90; a target is not a measured result.
Localhost lab measurements do not include GitHub Pages' public network latency.
The browser-control runtime has no connected browser in this session; manual visual
and keyboard verification on a physical phone cannot be claimed.
