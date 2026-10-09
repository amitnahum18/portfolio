# Amit Nahum — Data Science & Analysis

Personal portfolio with English and Hebrew content, 19 projects, visual previews,
project stories, and filters by topic and project type.

The home page pairs a compact professional profile with two project collections.
Data Science / ML is the primary focus, featuring BridgePulse, license-plate
pricing, UFC prediction and car-price regression. AI Agents / LLM Systems is
the complementary collection, featuring JEV, semantic retrieval, RAFI and the
customer-support agent workflow.
Each card includes a result or deliverable with its evaluation context, tools,
and direct links to the case study and code. Project pages summarize the data,
method, result and evaluation before the full write-up. The full catalogue groups
projects by area and combines area, topic, type and search filters. Supporting
browser experiments remain accessible in a small additional group.

The profile-and-project-gallery structure takes inspiration from
https://www.datascienceportfol.io/juliejlai and its project collection.

Website: https://amitnahum18.github.io/portfolio/

## Local preview

Requires Node.js, with no npm dependencies.

```sh
cd site
npm start
```

Open http://localhost:4173.

## GitHub Pages

The Pages workflow deploys automatically on pushes to `main`.
The repository's Pages publishing source is **GitHub Actions**.
It builds `_site` from `site/dist`, with real entry files for the lab and every
project, allowing direct links and page refreshes on GitHub's static hosting.
Application URLs and assets respect the deployment base path.

To build locally, from the repository root:

```sh
python scripts/build-pages.py --base-path /portfolio/
```

## Content and visuals

- `site/dist/data/portfolio.json`: public bilingual project content.
- `site/dist/assets/projects`: existing screenshots, saved plots, and diagrams
  explaining reviewed source code. Card diagrams use fewer labels than detail diagrams.
- `docs/visual-flow-review.md`: flow verification and image provenance.

Projects are identified as experiments, prototypes, assignments or products.
Source-code review does not imply successful end-to-end execution or deployment.
Saved metrics and known limitations are described in individual project pages.
No external services, model files or project backend are run by this portfolio.
