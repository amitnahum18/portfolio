const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const q = (value) => escapeHTML(value);
const app = document.querySelector('#app');
const basePath = new URL('.', import.meta.url).pathname;
const siteURL = path => basePath + path.replace(/^\//, '');
const currentPath = () => {
  const path = location.pathname.startsWith(basePath) ? '/' + location.pathname.slice(basePath.length) : location.pathname;
  return path.replace(/\/(?:index\.html)?$/, '') || '/';
};
const params = new URLSearchParams(location.search);
let language = params.get('lang') === 'he' ? 'he' : 'en';
if (!params.has('lang')) {
  try { if (localStorage.getItem('amit-portfolio-language') === 'he') language = 'he'; } catch {}
}
let catalogue;
const filter = { search: '', topic: '', type: '' };
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
    engineer: 'AI Engineer · IDF Reserve Duty', engineerSub: 'Offline inference with vLLM, LLM evaluation and anomaly-detection workflows.',
    analyst: 'Junior Data Analyst · IDF', analystSub: 'SQL analysis and statistical sampling of aviation safety data.',
    contactEyebrow: 'LET’S CONNECT', contactTitle: "Let’s talk about<br>your next data challenge.", footer: 'Amit Nahum · 2026', footerNote: 'Data Science · Analysis · AI',
    labPageTitle: 'All projects.', labPageIntro: 'Start with ML pipelines, documented results and applied AI, then explore prototypes and learning projects. Filter by topic or type to find the work that interests you.',
    search: 'Search', searchPlaceholder: 'Try NLP, CatBoost, SQL…', topic: 'Topic', type: 'Type', allTopics: 'All topics', allTypes: 'All types',
    results: 'works', clear: 'Clear filters', noResults: 'No matching work', noResultsText: 'Try a different topic or a shorter search.',
    home: 'Home', goal: 'Question / goal', approach: 'Data & approach', observations: 'Evidence & observations', limitations: 'Scope & limitations', credits: 'Credits',
    sourceEyebrow: 'EXPLORE THE WORK', sources: 'Code & links', next: 'Next in the collection', back: 'Back to the lab',
    notFound: 'This page isn’t in the collection.', error: 'The portfolio could not load. Please refresh the page.', skip: 'Skip to content'
  },
  he: {
    work: 'פרויקטים', lab: 'כל הפרויקטים', about: 'ניסיון', contact: 'יצירת קשר', menu: 'תפריט',
    eyebrow: 'עמית נחום / מדע הנתונים וניתוח נתונים', heroTitle: 'הופך שאלות<br><em>לניסויים.</em>',
    intro: 'אני עמית נחום. התחלתי בניתוח נתוני בטיחות תעופה באמצעות SQL. היום אני עוסק במודלים לחיזוי ובמערכות AI שפועלות ללא חיבור לרשת. עכשיו אני מתחיל תואר שני ב־HIT ומחפש את התפקיד הבא שלי במדע הנתונים ובניתוח נתונים.',
    explore: 'לסיפורים שמאחורי העבודות', portraitAlt: 'דיוקן של עמית נחום בחליפה בהירה', open: 'מחפש הזדמנויות חדשות', role: 'עמית נחום',
    degree: 'מתחיל תואר שני · מדעי המחשב · HIT', tools: 'Python ו־SQL', thinking: 'ניתוח, מודלים ו־AI יישומי',
    selected: '01 / עבודות נבחרות', selectedTitle: 'הכול מתחיל<br><em>ב״מה אם?״</em>', selectedIntro: 'רעידות גשר לסווג. אתגר Kaggle לפתור. החלטות AI להעריך. שלושה פרויקטים שמציגים איך אני בונה ובוחן מודלים.', all: 'לכל העבודות', nextQuestion: 'השאלה הבאה',
    journey: 'הדרך שלי', journeyAnalysis: 'SQL וניתוח נתונים', journeyAI: 'מערכות AI מקומיות', journeyMSc: 'תואר שני ב־HIT', journeyNow: 'מתחיל ב־2026',
    labEyebrow: '02 / ממשיכים לחקור', labTitle: 'לסקרנות יש<br>הרבה כיוונים.', labIntro: 'האם קול יכול להעיד על רגש? האם משמעות יכולה לחבר סיפור לז׳אנר? במעבדה מחכים עוד ניסויים, פרויקטי למידה ואבות־טיפוס.',
    labLink: 'למעבדה', aboutEyebrow: '03 / אודות', aboutTitle: 'חשיבה אנליטית.<br>גישה מעשית.',
    aboutText: 'העבודה שלי כוללת ניתוח נתונים ב־SQL וב־Python, תהליכי למידת מכונה, הערכת מודלים ופריסה של מערכות AI. חשוב לי להבין את הנתונים ואת השאלה, לצד בניית המודל.',
    aboutText2: 'תחומי העניין שלי כוללים למידה עמוקה, אופטימיזציה של מודלים והסקה יעילה. אני מתחיל תואר שני במדעי המחשב במכון הטכנולוגי חולון.',
    masters: 'תואר שני במדעי המחשב', mastersSub: 'HIT · תחילת לימודים ב־2026 · סיום צפוי ב־2028',
    engineer: 'AI Engineer · שירות מילואים בצה״ל', engineerSub: 'הסקה מקומית באמצעות vLLM, הערכת מודלי שפה ותהליכי זיהוי חריגות.',
    analyst: 'Junior Data Analyst · צה״ל', analystSub: 'ניתוח ב־SQL ודגימה סטטיסטית של נתוני בטיחות תעופה.',
    contactEyebrow: 'בואו נדבר', contactTitle: 'בואו נדבר על<br>אתגר הדאטה הבא.', footer: 'עמית נחום · 2026', footerNote: 'מדע הנתונים · ניתוח · AI',
    labPageTitle: 'כל הפרויקטים.', labPageIntro: 'מתחילים בתהליכי ML, בתוצאות מתועדות וב־AI יישומי, וממשיכים לאבות־טיפוס ולפרויקטי למידה. אפשר לסנן לפי תחום או סוג עבודה.',
    search: 'חיפוש', searchPlaceholder: 'למשל NLP, CatBoost, SQL…', topic: 'תחום', type: 'סוג עבודה', allTopics: 'כל התחומים', allTypes: 'כל הסוגים',
    results: 'עבודות', clear: 'ניקוי סינון', noResults: 'לא נמצאו עבודות מתאימות', noResultsText: 'אפשר לנסות תחום אחר או חיפוש קצר יותר.',
    home: 'ראשי', goal: 'מטרת הניסוי או הפרויקט', approach: 'נתונים ושיטה', observations: 'ממצאים מתועדים', limitations: 'היקף ומגבלות', credits: 'קרדיט',
    sourceEyebrow: 'להמשך עיון', sources: 'קוד וקישורים', next: 'העבודה הבאה באוסף', back: 'חזרה למעבדה',
    notFound: 'הדף הזה אינו נמצא באוסף.', error: 'לא ניתן לטעון את הפורטפוליו. אפשר לרענן את הדף.', skip: 'דילוג לתוכן'
  }
};
const typeLabels = {
  experiment: ['Experiment', 'ניסוי'], prototype: ['Prototype', 'אב־טיפוס'],
  'take-home-assignment': ['Take-home assignment', 'תרגיל בית'], 'course-exercise': ['Course exercise', 'תרגיל קורס'], product: ['Product', 'פרויקט מוצר']
};
const topicLabels = { 'Tabular ML': 'למידה על נתונים טבלאיים', 'Data & SQL': 'נתונים ו־SQL', 'LLM Systems': 'מערכות מודלי שפה', 'Audio ML': 'למידת מכונה באודיו', NLP: 'עיבוד שפה', 'Computer Vision': 'ראייה ממוחשבת', Web: 'פיתוח Web', IoT: 'IoT', 'Data systems': 'מערכות נתונים', Audio: 'אודיו', 'Signal Processing': 'עיבוד אותות', 'ML Engineering': 'הנדסת למידת מכונה', Simulation: 'סימולציה', 'Model Evaluation': 'הערכת מודלים' };
const t = () => text[language];
const typeName = value => typeLabels[value]?.[language === 'he' ? 1 : 0] || value;
const topicName = value => language === 'he' ? (topicLabels[value] || value) : value;
const langQuery = () => language === 'he' ? '?lang=he' : '';
const routeURL = (path) => {
  const [pathname, hash] = path.split('#');
  return `${siteURL(pathname)}${langQuery()}${hash ? '#' + hash : ''}`;
};
const projectURL = item => routeURL(`/work/${item.slug}`);
const navLink = (path, label, className = '') => `<a data-nav href="${q(routeURL(path))}" class="${q(className)}">${label}</a>`;
const externalLink = (url, label, className = '') => `<a href="${q(url)}" target="_blank" rel="noopener noreferrer" class="${q(className)}">${q(label)}</a>`;
const project = slug => catalogue.projects.find(item => item.slug === slug);

function header() {
  const x = t();
  return `<header class="site-header"><div class="wrap header-inner">
    ${navLink('/', '<span class="monogram" aria-hidden="true">a.</span><span class="wordmark-name">AMIT NAHUM</span>', 'wordmark')}
    <nav class="nav ${mobileMenuOpen ? 'open' : ''}" id="site-nav" aria-label="${language === 'he' ? 'ניווט ראשי' : 'Main navigation'}">
      ${navLink('/#work', q(x.work))}${navLink('/lab', q(x.lab), currentPath() === '/lab' ? 'active' : '')}${navLink('/#about', q(x.about))}
    </nav>
    <div class="header-actions"><button id="language-toggle" class="language-button" aria-label="${language === 'he' ? 'Switch to English' : 'מעבר לעברית'}">${language === 'he' ? 'EN' : 'עברית'}</button><button id="menu-toggle" class="menu-button" aria-controls="site-nav" aria-expanded="${mobileMenuOpen}">${q(x.menu)}</button></div>
  </div></header>`;
}

function footer() {
  const x = t();
  return `<section id="contact" class="contact-section"><div class="wrap contact-layout"><div><p class="eyebrow">${q(x.contactEyebrow)}</p><h2 class="display-title">${x.contactTitle}</h2></div><div class="contact-info"><a class="contact-email" href="mailto:${q(catalogue.profile.email)}" dir="ltr">${q(catalogue.profile.email)}</a><div class="social-links">${externalLink(catalogue.profile.links.linkedin, 'LinkedIn')}${externalLink(catalogue.profile.links.github, 'GitHub')}${externalLink(catalogue.profile.links.kaggle, 'Kaggle')}</div></div></div></section><footer class="site-footer"><div class="wrap footer-inner"><span>${q(x.footer)}</span><span>${q(x.footerNote)}</span></div></footer>`;
}

const presentation = {
  en: {
    role: 'Data Science & Machine Learning',
    bio: 'I build predictive models and evaluate how well they generalize. My background combines SQL analysis of aviation safety data with Python, machine learning and applied AI.',
    availability: 'Open to Data Scientist / ML roles',
    education: 'Beginning an M.Sc. in Computer Science at HIT',
    skills: 'Core skills', connect: 'Get in touch',
    selected: 'SELECTED PROJECTS', title: 'Machine learning.<br>From data to evaluation.',
    intro: 'Six projects covering signal processing, tabular prediction, model evaluation and semantic retrieval. Each case study explains the question, the data, the method and the evidence.',
    read: 'View case study', result: 'RESULT / DELIVERABLE',
    all: 'Explore all projects', allIntro: 'More applied AI, prototypes and learning experiments, with topic and type filters.',
    experience: 'Experience & education', atGlance: 'At a glance',
    data: 'Data', method: 'Method', evaluation: 'Evaluation',
    featured: 'ML & DATA', code: 'Code', projects: 'Projects',
  },
  he: {
    role: 'מדע הנתונים ולמידת מכונה',
    bio: 'אני בונה מודלים לחיזוי ובוחן את יכולת ההכללה שלהם. הרקע שלי משלב ניתוח נתוני בטיחות תעופה ב־SQL עם Python, למידת מכונה ו־AI יישומי.',
    availability: 'מחפש תפקידי Data Scientist / ML',
    education: 'מתחיל תואר שני במדעי המחשב ב־HIT',
    skills: 'כישורים מרכזיים', connect: 'יצירת קשר',
    selected: 'פרויקטים נבחרים', title: 'למידת מכונה.<br>מנתונים להערכה.',
    intro: 'שישה פרויקטים בעיבוד אותות, חיזוי על נתונים טבלאיים, הערכת מודלים וחיפוש סמנטי. בכל דף מוצגים השאלה, הנתונים, השיטה והראיות.',
    read: 'לדף הפרויקט', result: 'תוצאה / תוצר',
    all: 'לכל הפרויקטים', allIntro: 'עוד פרויקטי AI יישומיים, אבות־טיפוס וניסויים, עם סינון לפי תחום וסוג עבודה.',
    experience: 'ניסיון והשכלה', atGlance: 'הפרויקט במבט אחד',
    data: 'נתונים', method: 'שיטה', evaluation: 'הערכה',
    featured: 'דאטה ו־ML', code: 'קוד', projects: 'פרויקטים',
  }
};
const p = () => presentation[language];

function profilePanel() {
  const x = p();
  return `<aside class="profile-panel" aria-label="${q(language === 'he' ? 'על עמית נחום' : 'About Amit Nahum')}">
    <div class="profile-photo"><img src="${q(siteURL('/assets/amit-portrait.jpeg'))}" alt="${q(t().portraitAlt)}" width="3413" height="5120" fetchpriority="high"></div>
    <p class="availability"><span aria-hidden="true"></span>${q(x.availability)}</p>
    <h1>${q(catalogue.profile.name[language])}</h1><p class="profile-role">${q(x.role)}</p>
    <p class="profile-bio">${q(x.bio)}</p><p class="profile-education">${q(x.education)}</p>
    <a class="profile-contact" href="mailto:${q(catalogue.profile.email)}">${q(x.connect)} <span aria-hidden="true">↗</span></a>
    <div class="profile-links">${externalLink(catalogue.profile.links.github, 'GitHub')}${externalLink(catalogue.profile.links.linkedin, 'LinkedIn')}${externalLink(catalogue.profile.links.kaggle, 'Kaggle')}</div>
    <div class="profile-skills"><h2>${q(x.skills)}</h2><div class="tag-list">${catalogue.profile.skills.map(skill => `<span class="tag" dir="auto">${q(skill)}</span>`).join('')}</div></div>
  </aside>`;
}

function caseCard(item, index) {
  const copy = item.caseStudy[language];
  const x = p();
  const code = item.sources.find(link => link.label === 'GitHub');
  return `<article class="case-card">
    <a data-nav href="${q(projectURL(item))}" class="case-image image-${q(item.image.kind)}" aria-label="${q(copy.title)}">${projectPicture(item, 'card')}</a>
    <div class="case-card-body"><div class="case-meta"><span>${q(typeName(item.type))}</span><span>${String(index + 1).padStart(2, '0')}</span></div>
    <h3>${navLink(`/work/${item.slug}`, q(copy.title))}</h3><p class="case-summary">${q(copy.summary)}</p>
    <div class="case-outcome"><p class="eyebrow">${q(x.result)}</p><p class="case-result" dir="auto">${q(copy.result)}</p><p class="case-context">${q(copy.context)}</p></div>
    <div class="tag-list">${item.caseStudy.tools.map(tool => `<span class="tag" dir="auto">${q(tool)}</span>`).join('')}</div>
    <div class="case-actions">${navLink(`/work/${item.slug}`, `${q(x.read)} <span aria-hidden="true">↗</span>`)}${code ? externalLink(code.url, 'GitHub ↗') : ''}</div></div>
  </article>`;
}

function experienceSection() {
  const x = t();
  return `<section id="about" class="profile-experience"><h2>${q(p().experience)}</h2><div class="experience-list">
    <article><p class="experience-date" dir="ltr">2025–${language === 'he' ? 'היום' : 'Present'}</p><div><h3>${q(x.engineer)}</h3><p>${q(x.engineerSub)}</p></div></article>
    <article><p class="experience-date" dir="ltr">2020–2022</p><div><h3>${q(x.analyst)}</h3><p>${q(x.analystSub)}</p></div></article>
    <article><p class="experience-date" dir="ltr">2026–2028</p><div><h3>${q(x.masters)}</h3><p>${q(x.mastersSub)}</p></div></article>
  </div></section>`;
}

function home() {
  const x = p();
  const featured = catalogue.projects.filter(item => item.caseStudy).slice(0, 6);
  return `${header()}<main id="main" class="wrap profile-layout">${profilePanel()}<div class="portfolio-main">
    <section id="work" class="selected-projects"><div class="collection-heading"><p class="eyebrow">${q(x.selected)}</p><h2>${x.title}</h2><p>${q(x.intro)}</p></div>
    <div class="case-grid">${featured.map(caseCard).join('')}</div>
    <div class="collection-more"><div><h3>${q(x.all)}</h3><p>${q(x.allIntro)}</p></div>${navLink('/lab', `${catalogue.projects.length} ${q(x.projects)} <span aria-hidden="true">↗</span>`, 'collection-button')}</div></section>
    ${experienceSection()}</div></main>${footer()}`;
}

function caseSnapshot(item) {
  if (!item.caseStudy) return '';
  const copy = item.caseStudy[language];
  const x = p();
  return `<section class="case-snapshot"><h2>${q(x.atGlance)}</h2><dl>${['data', 'method', 'result', 'evaluation'].map(field => `<div><dt>${q(x[field])}</dt><dd>${q(field === 'result' ? copy.result + '. ' + copy.context : copy[field])}</dd></div>`).join('')}</dl></section>`;
}

function filteredProjects() {
  const search = filter.search.trim().toLocaleLowerCase();
  return catalogue.projects.filter(item => {
    if (filter.topic && !item.topics.includes(filter.topic)) return false;
    if (filter.type && item.type !== filter.type) return false;
    return !search || `${item.en.title} ${item.he.title} ${item.en.summary} ${item.he.summary} ${item.topics.join(' ')} ${item.en.approach.join(' ')} ${item.he.approach.join(' ')} ${item.repositoryName || ''}`.toLocaleLowerCase().includes(search);
  });
}

function labCards() {
  const items = filteredProjects();
  if (!items.length) return `<div class="empty-state"><h2>${q(t().noResults)}</h2><p>${q(t().noResultsText)}</p><button data-reset class="reset-button">${q(t().clear)}</button></div>`;
  return items.map((item, index) => `<a data-nav href="${q(projectURL(item))}" class="lab-card"><div class="lab-card-image image-${q(item.image.kind)}">${projectPicture(item, 'card')}</div><div class="lab-card-meta"><span>${q(typeName(item.type))}</span><span>${String(index + 1).padStart(2, '0')}</span></div><h2>${q(item[language].title)}</h2><p>${q(item[language].summary)}</p><div class="tag-list">${item.topics.map(topic => `<span class="tag">${q(topicName(topic))}</span>`).join('')}</div></a>`).join('');
}

function lab() {
  const x = t();
  const topics = [...new Set(catalogue.projects.flatMap(item => item.topics))];
  const types = [...new Set(catalogue.projects.map(item => item.type))];
  return `${header()}<main id="main" class="wrap"><section class="page-intro"><p class="eyebrow">${q(x.labEyebrow)}</p><h1 class="display-title">${q(x.labPageTitle)}</h1><p>${q(x.labPageIntro)}</p></section><div class="lab-controls"><div class="control"><label class="control-label" for="project-search">${q(x.search)}</label><input id="project-search" type="search" value="${q(filter.search)}" placeholder="${q(x.searchPlaceholder)}" autocomplete="off"></div><div class="control"><label class="control-label" for="topic-select">${q(x.topic)}</label><select id="topic-select"><option value="">${q(x.allTopics)}</option>${topics.map(topic => `<option value="${q(topic)}" ${filter.topic === topic ? 'selected' : ''}>${q(topicName(topic))}</option>`).join('')}</select></div><div class="control"><label class="control-label" for="type-select">${q(x.type)}</label><select id="type-select"><option value="">${q(x.allTypes)}</option>${types.map(type => `<option value="${q(type)}" ${filter.type === type ? 'selected' : ''}>${q(typeName(type))}</option>`).join('')}</select></div></div><div class="results-bar"><span id="results-count" role="status" aria-live="polite">${filteredProjects().length} ${q(x.results)}</span><button data-reset class="reset-button">${q(x.clear)}</button></div><div id="lab-grid" class="lab-grid">${labCards()}</div></main>${footer()}`;
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
  return `<picture>${mobile ? `<source media="(max-width: 760px)" srcset="${q(mobile)}" width="${visual.mobileWidth}" height="${visual.mobileHeight}">` : ''}<img src="${q(src)}" alt="${q(copy.alt)}" width="${width}" height="${height}" decoding="async"></picture>`;
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
  return `${header()}<main id="main"><section class="detail-header"><div class="wrap"><nav class="breadcrumb" aria-label="${language === 'he' ? 'מיקום באתר' : 'Breadcrumb'}">${navLink('/', q(x.home))}<span>/</span>${navLink('/lab', q(x.lab))}<span>/</span><span>${q(typeName(item.type))}</span></nav><p class="eyebrow">${q(typeName(item.type))} / ${q(item.topics.map(topicName).join(' · '))}</p><h1>${q(copy.title)}</h1><p class="detail-summary">${q(copy.summary)}</p></div></section><div class="wrap detail-layout"><article>${caseSnapshot(item)}${projectImage(item)}${section('goal', [copy.goal], true)}${section('approach', copy.approach)}${section('observations', copy.observations, true)}${section('limitations', copy.limitations)}${section('credits', copy.credits)}</article><aside><div class="source-panel"><p class="eyebrow">${q(x.sourceEyebrow)}</p><h2>${q(x.sources)}</h2>${item.sources.map(source => externalLink(source.url, source.label === 'Public app' ? (language === 'he' ? 'פתיחת האפליקציה' : 'Open the app') : source.label, 'source-link')).join('')}<div class="tag-list">${item.topics.map(topic => `<span class="tag">${q(topicName(topic))}</span>`).join('')}</div></div></aside></div><div class="wrap detail-next"><div><p>${q(x.next)}</p>${navLink(`/work/${next.slug}`, q(next[language].title))}</div>${navLink('/lab', q(x.back), 'quiet-link')}</div></main>${footer()}`;
}

function renderRoute({ preserveScroll = false } = {}) {
  const scroll = window.scrollY;
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  document.querySelector('.skip-link').textContent = t().skip;
  const path = currentPath();
  if (path === '/') { app.innerHTML = home(); document.title = `${language === 'he' ? 'עמית נחום' : 'Amit Nahum'} — Data Science & ML`; }
  else if (path === '/lab') { app.innerHTML = lab(); document.title = `${t().lab} — Amit Nahum`; }
  else if (path.startsWith('/work/')) {
    const item = project(decodeURIComponent(path.slice(6)));
    if (item) { app.innerHTML = detail(item); document.title = `${item[language].title} — Amit Nahum`; }
    else app.innerHTML = `${header()}<main id="main" class="wrap error-surface"><h1>${q(t().notFound)}</h1>${navLink('/lab', q(t().back), 'quiet-link')}</main>${footer()}`;
  } else app.innerHTML = `${header()}<main id="main" class="wrap error-surface"><h1>${q(t().notFound)}</h1>${navLink('/', q(t().home), 'quiet-link')}</main>${footer()}`;
  document.querySelector('meta[name="description"]').content = path.startsWith('/work/') ? (project(path.slice(6))?.[language].summary || t().intro) : t().intro;
  if (preserveScroll) window.scrollTo({ top: scroll, behavior: 'instant' });
  else if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
  else window.scrollTo({top: 0, behavior: 'instant'});
}

function updateLabResults() {
  document.querySelector('#lab-grid').innerHTML = labCards();
  document.querySelector('#results-count').textContent = `${filteredProjects().length} ${t().results}`;
}

document.addEventListener('click', event => {
  const toggle = event.target.closest('#language-toggle');
  if (toggle) {
    language = language === 'en' ? 'he' : 'en';
    try { localStorage.setItem('amit-portfolio-language', language); } catch {}
    const url = new URL(location.href);
    if (language === 'he') url.searchParams.set('lang', 'he'); else url.searchParams.delete('lang');
    history.replaceState({}, '', url);
    renderRoute({preserveScroll: true});
    document.querySelector('#language-toggle').focus({preventScroll: true});
    return;
  }
  if (event.target.closest('#menu-toggle')) {
    mobileMenuOpen = !mobileMenuOpen;
    document.querySelector('#site-nav').classList.toggle('open', mobileMenuOpen);
    document.querySelector('#menu-toggle').setAttribute('aria-expanded', mobileMenuOpen);
    return;
  }
  if (event.target.closest('[data-reset]')) {
    Object.assign(filter, {search: '', topic: '', type: ''});
    renderRoute({preserveScroll: true});
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
window.addEventListener('popstate', () => {
  language = new URLSearchParams(location.search).get('lang') === 'he' ? 'he' : 'en';
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
