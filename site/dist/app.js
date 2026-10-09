const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const q = (value) => escapeHTML(value);
const app = document.querySelector('#app');
const basePath = new URL('.', import.meta.url).pathname;
const siteURL = path => basePath + path.replace(/^\//, '');
const currentPath = () => {
  const path = location.pathname.startsWith(basePath) ? '/' + location.pathname.slice(basePath.length) : location.pathname;
  return path.replace(/\/(?:index\.html)?$/, '') || '/';
};
const language = 'en';
// Preserve old shared project links, while consistently presenting English.
if (new URLSearchParams(location.search).has('lang')) {
  const cleanURL = new URL(location.href);
  cleanURL.searchParams.delete('lang');
  history.replaceState({}, '', cleanURL);
}
let catalogue;
const filter = { search: '', topic: '', type: '', area: '' };
let mobileMenuOpen = false;
const text = {
  en: {
    work: 'Projects', lab: 'All projects', about: 'Experience', contact: 'Get in touch', menu: 'Menu',
    eyebrow: 'AMIT NAHUM / DATA SCIENCE & ANALYSIS', heroTitle: 'I turn questions<br>into <em>experiments.</em>',
    intro: "I'm Amit Nahum. I started with SQL and aviation safety data. Today, my work spans predictive models and offline AI systems. Now I'm beginning an M.Sc. at HIT and looking for my next role in data science and analysis.",
    explore: 'Explore the stories', portraitAlt: 'Portrait of Amit Nahum wearing a light suit', open: 'OPEN TO OPPORTUNITIES', role: 'Amit Nahum',
    degree: 'Beginning M.Sc. · Computer Science · HIT', tools: 'Python & SQL', thinking: 'Analysis, models & applied AI',
    selected: '01 / SELECTED WORK', selectedTitle: 'It starts with<br><em>what if?</em>', selectedIntro: 'Bridge vibrations to classify. A Kaggle challenge to solve. AI decisions to evaluate. Three projects that show how I build and assess models.', all: 'View all work', nextQuestion: 'THE NEXT QUESTION',
    journey: 'My path', journeyAnalysis: 'SQL & data analysis', journeyAI: 'Offline AI systems', journeyMSc: 'M.Sc. at HIT', journeyNow: 'Beginning in 2026',
    labEyebrow: '02 / KEEP EXPLORING', labTitle: 'Curiosity takes<br>different forms.', labIntro: 'Can a voice reveal emotion? Can meaning connect a story to a genre? The lab brings together more experiments, learning projects and prototypes.',
    labLink: 'Explore the lab', aboutEyebrow: '03 / ABOUT', aboutTitle: 'An analytical mind.<br>A practical approach.',
    aboutText: "My work spans SQL and Python analysis, machine learning pipelines, model evaluation and AI system deployment. I'm interested in understanding the data as much as building the model.",
    aboutText2: 'My current interests include deep learning, model optimization and efficient inference. I am beginning an M.Sc. in Computer Science at Holon Institute of Technology.',
    masters: 'M.Sc. in Computer Science', mastersSub: 'HIT · Beginning in 2026 · Expected completion 2028',
    bachelors: 'B.Sc. in Computer Science', bachelorsSub: 'HIT · Completed in 2026 · Coursework in statistics, SQL, operations research and information systems.',
    engineer: 'AI Engineer · IDF Reserve Duty', engineerSub: 'Offline inference with vLLM, LLM evaluation and anomaly-detection workflows.',
    analyst: 'Junior Data Analyst · IDF', analystSub: 'SQL analysis and statistical sampling of aviation safety data.',
    contactEyebrow: 'LET’S CONNECT', contactTitle: "Let’s talk about<br>your next data challenge.", footer: 'Amit Nahum · 2026', footerNote: 'Data Science · Analysis · AI',
    labPageTitle: 'All projects.', labPageIntro: 'Data Science and ML are my primary focus. AI agents and LLM systems form a separate collection. Explore either area, then narrow by topic or project type.',
    search: 'Search', searchPlaceholder: 'Try NLP, CatBoost, SQL…', topic: 'Topic', type: 'Type', allTopics: 'All topics', allTypes: 'All types',
    results: 'works', clear: 'Clear filters', noResults: 'No matching work', noResultsText: 'Try a different topic or a shorter search.',
    home: 'Home', goal: 'Question / goal', approach: 'Data & approach', observations: 'Evidence & observations', limitations: 'Scope & limitations', credits: 'Credits',
    sourceEyebrow: 'EXPLORE THE WORK', sources: 'Code & links', next: 'Next in the collection', back: 'Back to the lab',
    notFound: 'This page isn’t in the collection.', error: 'The portfolio could not load. Please refresh the page.', skip: 'Skip to content'
  }
};
const typeLabels = {
  experiment: 'Experiment', prototype: 'Prototype',
  'take-home-assignment': 'Take-home assignment', 'course-exercise': 'Course exercise', product: 'Product'
};
const t = () => text.en;
const typeName = value => typeLabels[value] || value;
const topicName = value => value;
const routeURL = (path) => {
  const [pathname, hash] = path.split('#');
  return `${siteURL(pathname)}${hash ? '#' + hash : ''}`;
};
const projectURL = item => routeURL(`/work/${item.slug}`);
const navLink = (path, label, className = '') => `<a data-nav href="${q(routeURL(path))}" class="${q(className)}">${label}</a>`;
const externalLink = (url, label, className = '') => `<a href="${q(url)}" target="_blank" rel="noopener noreferrer" class="${q(className)}">${q(label)}</a>`;
const project = slug => catalogue.projects.find(item => item.slug === slug);

function header() {
  const x = t();
  return `<header class="site-header"><div class="wrap header-inner">
    ${navLink('/', '<span class="monogram" aria-hidden="true">a.</span><span class="wordmark-name">AMIT NAHUM</span>', 'wordmark')}
    <nav class="nav ${mobileMenuOpen ? 'open' : ''}" id="site-nav" aria-label="${'Main navigation'}">
      ${navLink('/#work', q(x.work))}${navLink('/lab', q(x.lab), currentPath() === '/lab' ? 'active' : '')}${navLink('/#about', q(x.about))}
    </nav>
    <div class="header-actions"><button id="menu-toggle" class="menu-button" aria-controls="site-nav" aria-expanded="${mobileMenuOpen}">${q(x.menu)}</button></div>
  </div></header>`;
}

function footer() {
  const x = t();
  return `<section id="contact" class="contact-section"><div class="wrap contact-layout"><div><p class="eyebrow">${q(x.contactEyebrow)}</p><h2 class="display-title">${x.contactTitle}</h2></div><div class="contact-info"><a class="contact-email" href="mailto:${q(catalogue.profile.email)}" dir="ltr">${q(catalogue.profile.email)}</a><div class="social-links">${externalLink(catalogue.profile.links.linkedin, 'LinkedIn')}${externalLink(catalogue.profile.links.github, 'GitHub')}${externalLink(catalogue.profile.links.kaggle, 'Kaggle')}<a href="${q(siteURL('/assets/Amit-Nahum-CV.pdf?v=education-20261009'))}" download="Amit-Nahum-CV.pdf">Download CV</a></div></div></div></section><footer class="site-footer"><div class="wrap footer-inner"><span>${q(x.footer)}</span><span>${q(x.footerNote)}</span></div></footer>`;
}

const presentation = {
  en: {
    role: 'Data Scientist | Machine Learning & Applied AI',
    bio: 'I build and evaluate machine learning models, combining hands-on experience in aviation data analysis with predictive modeling, signal processing and offline AI systems.',
    process: 'From data exploration and feature engineering to validation, model evaluation and deployment.',
    availability: 'Open to Data Scientist / ML roles',
    education: 'Beginning an M.Sc. in Computer Science at HIT',
    completedDegree: 'B.Sc. in Computer Science · HIT · Completed in 2026',
    skills: 'Core Data Science / ML skills', agentSkills: 'Applied AI', connect: 'Get in touch',
    selected: 'PRIMARY FOCUS', title: 'Data Science & ML',
    intro: 'Signal processing, predictive modeling and feature engineering, with explicit evaluation methods and documented results.',
    agentsEyebrow: 'ALSO WORKING ON', agentsTitle: 'AI Agents & LLM Systems',
    agentsIntro: 'Decision-making agents, SQL tools, workflow orchestration and retrieval infrastructure for AI applications.',
    otherTitle: 'Other experiments', otherIntro: 'Supporting interface and browser experiments.', allAreas: 'All areas',
    read: 'View case study', result: 'RESULT / DELIVERABLE',
    all: 'Explore all projects', allIntro: 'More applied AI, prototypes and learning experiments, with topic and type filters.',
    experience: 'Experience & education', atGlance: 'At a glance',
    data: 'Data', method: 'Method', evaluation: 'Evaluation',
    featured: 'ML & DATA', code: 'Code', projects: 'Projects',
  }
};
const p = () => presentation.en;
const projectAreas = ['data-science', 'agents', 'other'];
const areaName = area => area === 'data-science' ? p().title : area === 'agents' ? p().agentsTitle : p().otherTitle;
const areaIntro = area => area === 'data-science' ? p().intro : area === 'agents' ? p().agentsIntro : p().otherIntro;

function profilePanel() {
  const x = p();
  return `<aside class="profile-panel" aria-label="${q('About Amit Nahum')}">
    <div class="profile-photo"><img src="${q(siteURL('/assets/amit-portrait-web.jpeg'))}" alt="${q(t().portraitAlt)}" width="480" height="720" decoding="async" fetchpriority="high"></div>
    <p class="availability"><span aria-hidden="true"></span>${q(x.availability)}</p>
    <h1>${q(catalogue.profile.name[language])}</h1><p class="profile-role">${q(x.role)}</p>
    <div class="profile-bio"><p>${q(x.bio)}</p><p>${q(x.process)}</p></div><p class="profile-education">${q(x.completedDegree)}<br>${q(x.education)}</p>
    <div class="profile-actions">${navLink('/#work', 'View Projects', 'profile-contact')}<a class="profile-cv" href="${q(siteURL('/assets/Amit-Nahum-CV.pdf?v=education-20261009'))}" download="Amit-Nahum-CV.pdf">Download CV <span aria-hidden="true">↓</span></a></div>
    <div class="profile-links"><a href="mailto:${q(catalogue.profile.email)}">Email</a>${externalLink(catalogue.profile.links.github, 'GitHub')}${externalLink(catalogue.profile.links.linkedin, 'LinkedIn')}${externalLink(catalogue.profile.links.kaggle, 'Kaggle')}</div>
    <div class="profile-skills"><h2>${q(x.skills)}</h2><div class="tag-list">${catalogue.profile.skills.map(skill => `<span class="tag" dir="auto">${q(skill)}</span>`).join('')}</div></div>
    <div class="profile-skills"><h2>${q(x.agentSkills)}</h2><div class="tag-list">${catalogue.profile.agentSkills.map(skill => `<span class="tag" dir="auto">${q(skill)}</span>`).join('')}</div></div>
  </aside>`;
}

function caseCard(item, index, compact = false) {
  const copy = item.caseStudy[language];
  const x = p();
  const code = item.sources.find(link => link.label === 'GitHub');
  return `<article class="case-card${compact ? ' agent-card' : ''}">
    ${compact ? '' : `<a data-nav href="${q(projectURL(item))}" class="case-image image-${q(item.image.kind)}" aria-label="${q(copy.title)}">${projectPicture(item, 'card')}</a>`}
    <div class="case-card-body"><div class="case-meta"><span>${q(typeName(item.type))}</span><span>${String(index + 1).padStart(2, '0')}</span></div>
    <h3>${navLink(`/work/${item.slug}`, q(copy.title))}</h3><dl class="case-story"><div><dt>Problem</dt><dd>${q(copy.problem)}</dd></div><div><dt>Solution</dt><dd>${q(copy.solution)}</dd></div></dl>
    <div class="case-outcome"><p class="eyebrow">Result / deliverable</p><p class="case-result" dir="auto">${q(copy.cardResult || copy.result)}</p></div>
    <div class="case-actions">${navLink(`/work/${item.slug}`, `${q(x.read)} <span aria-hidden="true">↗</span>`)}${code ? externalLink(code.url, 'GitHub ↗') : ''}</div></div>
  </article>`;
}

function experienceSection() {
  const x = t();
  return `<section id="about" class="profile-experience"><h2>${q(p().experience)}</h2><div class="experience-list">
    <article><p class="experience-date" dir="ltr">2025–${'Present'}</p><div><h3>${q(x.engineer)}</h3><p>${q(x.engineerSub)}</p></div></article>
    <article><p class="experience-date" dir="ltr">2020–2022</p><div><h3>${q(x.analyst)}</h3><p>${q(x.analystSub)}</p></div></article>
    <article><p class="experience-date" dir="ltr">2026–2028</p><div><h3>${q(x.masters)}</h3><p>${q(x.mastersSub)}</p></div></article>
    <article><p class="experience-date" dir="ltr">2024–2026</p><div><h3>${q(x.bachelors)}</h3><p>${q(x.bachelorsSub)}</p></div></article>
  </div></section>`;
}

function home() {
  const x = p();
  const featured = area => catalogue.projects.filter(item => item.area === area && item.featured);
  return `${header()}<main id="main" class="wrap profile-layout">${profilePanel()}<div class="portfolio-main">
    <nav class="area-jump" aria-label="${q('Project areas')}">${navLink('/#work', q(x.title))}${navLink('/#agents', q(x.agentsTitle))}</nav>
    <section id="work" class="selected-projects"><div class="collection-heading"><p class="eyebrow">${q(x.selected)}</p><h2>${q(x.title)}</h2><p>${q(x.intro)}</p></div>
    <div class="case-grid primary-case-grid">${featured('data-science').map((item, index) => caseCard(item, index)).join('')}</div></section>
    <section id="agents" class="selected-projects agents-projects"><div class="collection-heading"><p class="eyebrow">${q(x.agentsEyebrow)}</p><h2>${q(x.agentsTitle)}</h2><p>${q(x.agentsIntro)}</p></div>
    <div class="case-grid agent-case-grid">${featured('agents').map((item, index) => caseCard(item, index, true)).join('')}</div></section>
    <div class="collection-more"><div><h3>${q(x.all)}</h3><p>${q(x.allIntro)}</p></div>${navLink('/lab', `${catalogue.projects.length} ${q(x.projects)} <span aria-hidden="true">↗</span>`, 'collection-button')}</div>
    ${experienceSection()}</div></main>${footer()}`;
}

function caseSnapshot(item) {
  if (!item.caseStudy) return '';
  const copy = item.caseStudy[language];
  const x = p();
  return `<section class="case-snapshot"><h2>${q(x.atGlance)}</h2><dl>${['data', 'method', 'result', 'evaluation'].map(field => `<div><dt>${q(x[field])}</dt><dd>${q(field === 'result' ? copy.result + '. ' + copy.context : copy[field])}</dd></div>`).join('')}</dl><div class="tag-list project-tools" aria-label="Project tools">${item.caseStudy.tools.map(tool => `<span class="tag">${q(tool)}</span>`).join('')}</div></section>`;
}

function filteredProjects() {
  const search = filter.search.trim().toLocaleLowerCase();
  return catalogue.projects.filter(item => {
    if (filter.area && item.area !== filter.area) return false;
    if (filter.topic && !item.topics.includes(filter.topic)) return false;
    if (filter.type && item.type !== filter.type) return false;
    return !search || `${item.en.title} ${item.en.summary} ${item.topics.join(' ')} ${item.en.approach.join(' ')} ${item.repositoryName || ''}`.toLocaleLowerCase().includes(search);
  });
}

function labCards() {
  const items = filteredProjects();
  if (!items.length) return `<div class="empty-state"><h2>${q(t().noResults)}</h2><p>${q(t().noResultsText)}</p><button data-reset class="reset-button">${q(t().clear)}</button></div>`;
  return projectAreas.map(area => {
    const group = items.filter(item => item.area === area);
    if (!group.length) return '';
    return `<section class="lab-group" aria-labelledby="group-${q(area)}"><div class="lab-group-heading"><h2 id="group-${q(area)}">${q(areaName(area))} <span>${group.length}</span></h2><p>${q(areaIntro(area))}</p></div><div class="lab-grid">${group.map((item, index) => `<a data-nav href="${q(projectURL(item))}" class="lab-card"><div class="lab-card-image image-${q(item.image.kind)}">${projectPicture(item, 'card')}</div><div class="lab-card-meta"><span>${q(typeName(item.type))}</span><span>${String(index + 1).padStart(2, '0')}</span></div><h3>${q(item[language].title)}</h3><p>${q(item[language].summary)}</p><div class="tag-list">${item.topics.map(topic => `<span class="tag">${q(topicName(topic))}</span>`).join('')}</div></a>`).join('')}</div></section>`;
  }).join('');
}

function lab() {
  const x = t();
  const topics = [...new Set(catalogue.projects.flatMap(item => item.topics))];
  const types = [...new Set(catalogue.projects.map(item => item.type))];
  return `${header()}<main id="main" class="wrap"><section class="page-intro"><p class="eyebrow">${q(x.labEyebrow)}</p><h1 class="display-title">${q(x.labPageTitle)}</h1><p>${q(x.labPageIntro)}</p></section><div class="area-filters" role="group" aria-label="${q(p().allAreas)}">${['', ...projectAreas].map(area => `<button type="button" data-area="${q(area)}" aria-pressed="${filter.area === area}">${q(area ? areaName(area) : p().allAreas)}</button>`).join('')}</div><div class="lab-controls"><div class="control"><label class="control-label" for="project-search">${q(x.search)}</label><input id="project-search" type="search" enterkeyhint="search" value="${q(filter.search)}" placeholder="${q(x.searchPlaceholder)}" autocomplete="off"></div><div class="control"><label class="control-label" for="topic-select">${q(x.topic)}</label><select id="topic-select"><option value="">${q(x.allTopics)}</option>${topics.map(topic => `<option value="${q(topic)}" ${filter.topic === topic ? 'selected' : ''}>${q(topicName(topic))}</option>`).join('')}</select></div><div class="control"><label class="control-label" for="type-select">${q(x.type)}</label><select id="type-select"><option value="">${q(x.allTypes)}</option>${types.map(type => `<option value="${q(type)}" ${filter.type === type ? 'selected' : ''}>${q(typeName(type))}</option>`).join('')}</select></div></div><div class="results-bar"><span id="results-count" role="status" aria-live="polite">${filteredProjects().length} ${q(x.results)}</span><button data-reset class="reset-button">${q(x.clear)}</button></div><div id="lab-grid" class="lab-groups">${labCards()}</div></main>${footer()}`;
}

function projectPicture(item, compact = false) {
  if (!item.image) return '';
  const visual = item.image;
  const copy = visual[language];
  const isCard = compact === 'card' && visual.cardSources;
  const src = siteURL((isCard ? visual.cardSources[language] : visual.sources?.[language]) || visual.src);
  const width = isCard ? 640 : visual.width;
  const height = isCard ? 280 : visual.height;
  const mobile = !compact && visual.mobileSources?.[language] ? siteURL(visual.mobileSources[language]) : null;
  return `<picture>${mobile ? `<source media="(max-width: 760px)" srcset="${q(mobile)}" width="${visual.mobileWidth}" height="${visual.mobileHeight}">` : ''}<img src="${q(src)}" alt="${q(copy.alt)}" width="${width}" height="${height}" decoding="async" loading="lazy"></picture>`;
}

function projectImage(item) {
  if (!item.image) return '';
  return `<figure class="project-figure figure-${q(item.image.kind)}">${projectPicture(item)}<figcaption>${q(item.image[language].caption)}</figcaption></figure>`;
}

function detail(item) {
  const copy = item[language];
  const x = t();
  const section = (field, items, paragraphs = false) => !items.length ? '' : `<section class="detail-section"><h2>${q(x[field])}</h2>${paragraphs ? items.map(value => `<p>${q(value)}</p>`).join('') : `<ul>${items.map(value => `<li>${q(value)}</li>`).join('')}</ul>`}</section>`;
  const next = catalogue.projects[(catalogue.projects.indexOf(item) + 1) % catalogue.projects.length];
  return `${header()}<main id="main"><section class="detail-header"><div class="wrap"><nav class="breadcrumb" aria-label="${'Breadcrumb'}">${navLink('/', q(x.home))}<span>/</span>${navLink('/lab', q(x.lab))}<span>/</span><span>${q(typeName(item.type))}</span></nav><p class="eyebrow">${q(typeName(item.type))} / ${q(item.topics.map(topicName).join(' · '))}</p><h1>${q(copy.title)}</h1><p class="detail-summary">${q(copy.summary)}</p></div></section><div class="wrap detail-layout"><article>${caseSnapshot(item)}${projectImage(item)}${section('goal', [copy.goal], true)}${section('approach', copy.approach)}${section('observations', copy.observations, true)}${section('limitations', copy.limitations)}${section('credits', copy.credits)}</article><aside><div class="source-panel"><p class="eyebrow">${q(x.sourceEyebrow)}</p><h2>${q(x.sources)}</h2>${item.sources.map(source => externalLink(source.url, source.label === 'Public app' ? ('Open the app') : source.label, 'source-link')).join('')}<div class="tag-list">${item.topics.map(topic => `<span class="tag">${q(topicName(topic))}</span>`).join('')}</div></div></aside></div><div class="wrap detail-next"><div><p>${q(x.next)}</p>${navLink(`/work/${next.slug}`, q(next[language].title))}</div>${navLink('/lab', q(x.back), 'quiet-link')}</div></main>${footer()}`;
}

function pageMetadata(path = currentPath()) {
  const item = path.startsWith('/work/') ? project(path.slice(6)) : null;
  const title = item ? `${item[language].title} — Amit Nahum` : path === '/lab' ? `${t().lab} — Amit Nahum` : `${catalogue.profile.name[language]} — Data Scientist | ML & Applied AI`;
  const description = item ? item[language].summary : path === '/lab' ? t().labPageIntro : `${p().bio} ${p().availability}.`;
  const url = new URL(siteURL(path === '/' ? '/' : path + '/'), 'https://amitnahum18.github.io').href;
  const image = new URL(siteURL('/assets/amit-portrait-web.jpeg'), 'https://amitnahum18.github.io').href;
  const person = {'@type': 'Person', name: 'Amit Nahum', url: new URL(siteURL('/'), 'https://amitnahum18.github.io').href, jobTitle: 'Data Scientist', sameAs: Object.values(catalogue.profile.links)};
  const schema = item ? {'@context': 'https://schema.org', '@type': 'CreativeWork', name: item[language].title, description, url, author: person, keywords: item.topics.join(', '), isBasedOn: item.sources.map(source => source.url)} : path === '/lab' ? {'@context': 'https://schema.org', '@type': 'ItemList', name: title, url, itemListElement: catalogue.projects.map((entry, index) => ({'@type': 'ListItem', position: index + 1, name: entry[language].title, url: new URL(siteURL(`/work/${entry.slug}/`), 'https://amitnahum18.github.io').href}))} : {'@context': 'https://schema.org', ...person, description};
  return {title, description, url, image, schema};
}

function updateMetadata() {
  const meta = pageMetadata();
  document.title = meta.title;
  document.querySelector('meta[name="description"]').content = meta.description;
  document.querySelector('link[rel="canonical"]').href = meta.url;
  for (const [name, value] of Object.entries({'og:title': meta.title, 'og:description': meta.description, 'og:url': meta.url, 'og:image': meta.image, 'og:locale': 'en_US'})) document.querySelector(`meta[property="${name}"]`).content = value;
  for (const [name, value] of Object.entries({'twitter:title': meta.title, 'twitter:description': meta.description, 'twitter:image': meta.image})) document.querySelector(`meta[name="${name}"]`).content = value;
  document.querySelector('#structured-data').textContent = JSON.stringify(meta.schema).replace(/</g, '\\u003c');
}

function renderRoute({ preserveScroll = false } = {}) {
  const scroll = window.scrollY;
  document.documentElement.lang = language;
  document.documentElement.dir = 'ltr';
  document.querySelector('.skip-link').textContent = t().skip;
  const path = currentPath();
  if (path === '/') { app.innerHTML = home(); document.title = `${'Amit Nahum'} — Data Science & ML`; }
  else if (path === '/lab') { app.innerHTML = lab(); document.title = `${t().lab} — Amit Nahum`; }
  else if (path.startsWith('/work/')) {
    const item = project(decodeURIComponent(path.slice(6)));
    if (item) { app.innerHTML = detail(item); document.title = `${item[language].title} — Amit Nahum`; }
    else app.innerHTML = `${header()}<main id="main" class="wrap error-surface"><h1>${q(t().notFound)}</h1>${navLink('/lab', q(t().back), 'quiet-link')}</main>${footer()}`;
  } else app.innerHTML = `${header()}<main id="main" class="wrap error-surface"><h1>${q(t().notFound)}</h1>${navLink('/', q(t().home), 'quiet-link')}</main>${footer()}`;
  updateMetadata();
  if (preserveScroll) window.scrollTo({ top: scroll, behavior: 'instant' });
  else if (location.hash) requestAnimationFrame(() => {
    const target = document.getElementById(location.hash.slice(1));
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({preventScroll: true}); target.scrollIntoView(); }
  });
  else window.scrollTo({top: 0, behavior: 'instant'});
}

function updateLabResults() {
  document.querySelector('#lab-grid').innerHTML = labCards();
  document.querySelector('#results-count').textContent = `${filteredProjects().length} ${t().results}`;
}

document.addEventListener('click', event => {
  const areaButton = event.target.closest('[data-area]');
  if (areaButton) {
    filter.area = areaButton.dataset.area;
    document.querySelectorAll('[data-area]').forEach(button => button.setAttribute('aria-pressed', button.dataset.area === filter.area));
    updateLabResults();
    return;
  }
  if (event.target.closest('#menu-toggle')) {
    mobileMenuOpen = !mobileMenuOpen;
    document.querySelector('#site-nav').classList.toggle('open', mobileMenuOpen);
    document.querySelector('#menu-toggle').setAttribute('aria-expanded', mobileMenuOpen);
    return;
  }
  if (event.target.closest('[data-reset]')) {
    Object.assign(filter, {search: '', topic: '', type: '', area: ''});
    for (const selector of ['#project-search', '#topic-select', '#type-select']) document.querySelector(selector).value = '';
    document.querySelectorAll('[data-area]').forEach(button => button.setAttribute('aria-pressed', button.dataset.area === ''));
    updateLabResults();
    return;
  }
  const link = event.target.closest('a[data-nav]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  mobileMenuOpen = false;
  history.pushState({}, '', link.href);
  renderRoute();
  if (!location.hash) { const heading = document.querySelector('main h1'); if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({preventScroll: true}); } }
});
document.addEventListener('input', event => {
  if (event.target.id === 'project-search') { filter.search = event.target.value; updateLabResults(); }
});
document.addEventListener('change', event => {
  if (event.target.id === 'topic-select') { filter.topic = event.target.value; updateLabResults(); }
  if (event.target.id === 'type-select') { filter.type = event.target.value; updateLabResults(); }
});
document.addEventListener('pointerdown', () => {
  document.documentElement.dataset.input = 'pointer';
}, {capture: true});
document.addEventListener('keydown', event => {
  document.documentElement.dataset.input = 'keyboard';
  if (event.key === 'Escape' && mobileMenuOpen) {
    mobileMenuOpen = false;
    document.querySelector('#site-nav').classList.remove('open');
    document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false');
    document.querySelector('#menu-toggle').focus({preventScroll: true});
  }
}, {capture: true});
window.addEventListener('popstate', () => {
  mobileMenuOpen = false;
  renderRoute();
});

try {
  const response = await fetch(siteURL('/data/portfolio.json'));
  if (!response.ok) throw new Error(`Data response ${response.status}`);
  catalogue = await response.json();
  renderRoute();
} catch (error) {
  app.innerHTML = `<main class="wrap error-surface"><h1>Amit Nahum</h1><p>${q(t().error)}</p><a href="mailto:amitnahum834@gmail.com">amitnahum834@gmail.com</a></main>`;
  console.error(error);
}
