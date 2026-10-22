/* Claude Skill Finder — static client. No build step. */
(() => {
  'use strict';

  // ------------------------------------------------------------ i18n
  const I18N = {
    en: {
      skip: 'Skip to content', searchPlaceholder: 'Search skills… (e.g. pdf, react, seo, android)', navBrowse: 'Browse', navInstall: 'How to install', navRepos: 'Sources', navAbout: 'About', loading: 'Loading skills…', addSource: 'Add a source',
      heroTitle: 'Find the right Claude Skill in seconds', heroSub: 'A searchable, categorized directory of Agent Skills (SKILL.md) collected from GitHub — official Anthropic skills and community collections — with step-by-step install instructions for Claude Code, claude.ai and the API.',
      statSkills: 'skills', statRepos: 'repositories', statCats: 'categories', statUpdated: 'updated', categories: 'Categories', browseAll: 'Browse all', official: 'Official', officialSkills: 'Official Anthropic skills', popular: 'Popular sources', viewAll: 'View all →',
      results: 'results', result: 'result', noResults: 'No skills match your search.', noResultsHint: 'Try fewer or different words, or browse by category.', loadMore: 'Load more', sortRelevance: 'Relevance', sortStars: 'Most stars', sortName: 'Name A→Z', sortUpdated: 'Repo recently updated', onlyOfficial: 'Official only', withScripts: 'Has scripts', allCats: 'All categories', allSubs: 'All subcategories', filters: 'Filters', searchIn: 'in',
      allSkills: 'All skills', clear: 'Clear', copy: 'Copy', copied: 'Copied!', viewGithub: 'View on GitHub', viewFile: 'Open SKILL.md', rawFile: 'Raw', preview: 'Preview SKILL.md', hidePreview: 'Hide preview', previewLoading: 'Loading SKILL.md…', previewError: 'Could not load the file (the repo may be private, renamed or rate-limited). Open it on GitHub instead.',
      install: 'Install this skill', details: 'Details', repository: 'Repository', path: 'Path', license: 'License', version: 'Version', author: 'Author', stars: 'Stars', tools: 'Allowed tools', requires: 'Requires', plugin: 'Plugin', size: 'SKILL.md size', alsoFoundIn: 'Also found in', related: 'Related skills', category: 'Category', contents: 'Includes', scripts: 'scripts', references: 'references', assets: 'assets', inPlugin: 'part of plugin',
      tabClaudeCode: 'Claude Code', tabCli: 'skills CLI', tabManual: 'Manual copy', tabClaudeAi: 'claude.ai', tabApi: 'API',
      ccPluginTitle: 'Via plugin marketplace (recommended for this repo)', ccPluginDesc: 'This repository ships a Claude Code plugin marketplace. Inside Claude Code run:', ccPluginThen: 'Then restart Claude Code (or run /reload-plugins). The skill becomes available automatically.',
      ccManualTitle: 'Copy the folder into your skills directory', ccManualDesc: 'Personal skills live in ~/.claude/skills/, project skills in .claude/skills/ inside the repo. Claude Code loads them on the next session.',
      cliTitle: 'One command with the open-source skills CLI', cliDesc: 'The skills CLI (npx skills) installs SKILL.md folders from any GitHub repo into Claude Code, Cursor, Codex and other agents. Add -g to install globally instead of into the current project.', cliFind: 'List everything the repo offers before installing:',
      manualTitle: 'Clone and copy by hand', manualDesc: 'Works everywhere. Clone the repo, then copy the skill folder (the directory that contains SKILL.md) into the agent\'s skills directory.',
      aiTitle: 'Upload to claude.ai', aiDesc: 'Zip the skill folder (SKILL.md must be at the root of the zip, inside a folder named after the skill) and upload it in claude.ai → Settings → Capabilities → Skills.', aiSteps: ['Create the zip file:', 'In claude.ai open Settings → Capabilities → Skills and click Upload skill.', 'Select the .zip file. The skill is then available in your chats.'],
      apiTitle: 'Use with the Claude API', apiDesc: 'Skills can be uploaded through the Skills API and attached to a Messages request (code execution tool required). Example with the Python SDK:',
      verifyTitle: 'Verify', verifyDesc: 'Start a new Claude Code session and type /skills (or ask "what skills do you have?"). The skill should be listed with its description.',
      installPageTitle: 'How to install Claude Skills', installPageSub: 'Everything on this page applies to any skill in the directory. Each skill page also shows ready-to-copy commands with the real repo and folder names.',
      aboutTitle: 'About this directory', reposTitle: 'Source repositories', reposSub: 'Where the skills come from. Repositories are discovered from a seed list, awesome-lists and GitHub search, then cloned and scanned for SKILL.md files.',
      repo: 'Repository', skillsCount: 'Skills', kind: 'Type', updated: 'Updated', seed: 'seed', awesome: 'awesome list', collection: 'collection', discovered: 'discovered', lang: 'Türkçe', notFound: 'Skill not found.', backHome: 'Back to home', sub: 'subcategory', subs: 'subcategories', tipSearch: 'Tip: press / to focus search. Try queries like', whatIsSkill: 'What is a Skill?', whatIsSkillText: 'A Skill is a folder with a SKILL.md file (YAML frontmatter with name and description, plus markdown instructions) and optional scripts, references and assets. Claude loads the description into context and reads the full instructions only when the task matches — so you can install many skills without bloating the prompt.',
    },
    tr: {
      skip: 'İçeriğe atla', searchPlaceholder: 'Skill ara… (ör. pdf, react, seo, android)', navBrowse: 'Keşfet', navInstall: 'Nasıl kurulur', navRepos: 'Kaynaklar', navAbout: 'Hakkında', loading: 'Skiller yükleniyor…', addSource: 'Kaynak ekle',
      heroTitle: 'Doğru Claude Skill\'ini saniyeler içinde bul', heroSub: 'GitHub\'dan toplanan Agent Skill\'lerin (SKILL.md) aranabilir ve kategorilere ayrılmış dizini — resmi Anthropic skilleri ve topluluk koleksiyonları — Claude Code, claude.ai ve API için adım adım kurulum talimatlarıyla.',
      statSkills: 'skill', statRepos: 'repo', statCats: 'kategori', statUpdated: 'güncellendi', categories: 'Kategoriler', browseAll: 'Tümünü keşfet', official: 'Resmi', officialSkills: 'Resmi Anthropic skilleri', popular: 'Popüler kaynaklar', viewAll: 'Tümünü gör →',
      results: 'sonuç', result: 'sonuç', noResults: 'Aramanızla eşleşen skill bulunamadı.', noResultsHint: 'Daha az veya farklı kelimeler deneyin ya da kategorilere göz atın.', loadMore: 'Daha fazla yükle', sortRelevance: 'İlgililik', sortStars: 'En çok yıldız', sortName: 'İsim A→Z', sortUpdated: 'Repo son güncellenen', onlyOfficial: 'Sadece resmi', withScripts: 'Script içeren', allCats: 'Tüm kategoriler', allSubs: 'Tüm alt kategoriler', filters: 'Filtreler', searchIn: 'içinde',
      allSkills: 'Tüm skiller', clear: 'Temizle', copy: 'Kopyala', copied: 'Kopyalandı!', viewGithub: 'GitHub\'da aç', viewFile: 'SKILL.md\'yi aç', rawFile: 'Ham dosya', preview: 'SKILL.md önizle', hidePreview: 'Önizlemeyi gizle', previewLoading: 'SKILL.md yükleniyor…', previewError: 'Dosya yüklenemedi (repo özel, taşınmış veya limit aşılmış olabilir). GitHub\'da açmayı deneyin.',
      install: 'Bu skill\'i kur', details: 'Detaylar', repository: 'Repo', path: 'Yol', license: 'Lisans', version: 'Sürüm', author: 'Yazar', stars: 'Yıldız', tools: 'İzinli araçlar', requires: 'Gereksinim', plugin: 'Plugin', size: 'SKILL.md boyutu', alsoFoundIn: 'Şurada da var', related: 'Benzer skiller', category: 'Kategori', contents: 'İçerik', scripts: 'script', references: 'referans', assets: 'asset', inPlugin: 'plugin parçası',
      tabClaudeCode: 'Claude Code', tabCli: 'skills CLI', tabManual: 'Elle kopyala', tabClaudeAi: 'claude.ai', tabApi: 'API',
      ccPluginTitle: 'Plugin marketplace ile (bu repo için önerilen)', ccPluginDesc: 'Bu repo bir Claude Code plugin marketplace\'i içeriyor. Claude Code içinde şunu çalıştırın:', ccPluginThen: 'Sonra Claude Code\'u yeniden başlatın (veya /reload-plugins). Skill otomatik olarak kullanılabilir olur.',
      ccManualTitle: 'Klasörü skills dizinine kopyala', ccManualDesc: 'Kişisel skiller ~/.claude/skills/ altında, proje skilleri ise repo içindeki .claude/skills/ altında durur. Claude Code bir sonraki oturumda yükler.',
      cliTitle: 'Açık kaynak skills CLI ile tek komut', cliDesc: 'skills CLI (npx skills) herhangi bir GitHub reposundaki SKILL.md klasörlerini Claude Code, Cursor, Codex ve diğer ajanlara kurar. Projeye değil global kurmak için -g ekleyin.', cliFind: 'Kurmadan önce reponun sunduğu her şeyi listeleyin:',
      manualTitle: 'Klonla ve elle kopyala', manualDesc: 'Her yerde çalışır. Repoyu klonlayın, sonra skill klasörünü (SKILL.md\'nin bulunduğu dizin) ajanın skills dizinine kopyalayın.',
      aiTitle: 'claude.ai\'ye yükle', aiDesc: 'Skill klasörünü zip\'leyin (SKILL.md zip içinde skill adını taşıyan bir klasörün kökünde olmalı) ve claude.ai → Settings → Capabilities → Skills bölümünden yükleyin.', aiSteps: ['Zip dosyasını oluşturun:', 'claude.ai\'de Settings → Capabilities → Skills\'e gidin ve Upload skill\'e tıklayın.', '.zip dosyasını seçin. Skill artık sohbetlerinizde kullanılabilir.'],
      apiTitle: 'Claude API ile kullan', apiDesc: 'Skiller Skills API üzerinden yüklenip bir Messages isteğine eklenebilir (code execution aracı gerekir). Python SDK örneği:',
      verifyTitle: 'Doğrula', verifyDesc: 'Yeni bir Claude Code oturumu açıp /skills yazın (veya "hangi skillerin var?" diye sorun). Skill açıklamasıyla listelenmeli.',
      installPageTitle: 'Claude Skill nasıl kurulur?', installPageSub: 'Bu sayfadaki her şey dizindeki tüm skiller için geçerli. Her skill sayfasında ayrıca gerçek repo ve klasör adlarıyla kopyalanmaya hazır komutlar var.',
      aboutTitle: 'Bu dizin hakkında', reposTitle: 'Kaynak repolar', reposSub: 'Skillerin geldiği yerler. Repolar bir tohum listesi, awesome listeleri ve GitHub aramasıyla bulunur; sonra klonlanıp SKILL.md dosyaları taranır.',
      repo: 'Repo', skillsCount: 'Skill', kind: 'Tür', updated: 'Güncelleme', seed: 'tohum', awesome: 'awesome liste', collection: 'koleksiyon', discovered: 'keşfedilen', lang: 'English', notFound: 'Skill bulunamadı.', backHome: 'Ana sayfaya dön', sub: 'alt kategori', subs: 'alt kategori', tipSearch: 'İpucu: aramaya odaklanmak için / tuşuna basın. Örnek aramalar:', whatIsSkill: 'Skill nedir?', whatIsSkillText: 'Skill; bir SKILL.md dosyası (name ve description içeren YAML frontmatter + markdown talimatlar) ve isteğe bağlı script, referans ve asset dosyalarından oluşan bir klasördür. Claude yalnızca açıklamayı bağlama alır, görev eşleşince tüm talimatları okur — böylece çok sayıda skill kurmak prompt\'u şişirmez.',
    },
  };
  let lang = (() => { try { return localStorage.getItem('lang') || (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en'; } catch { return 'en'; } })();
  if (!I18N[lang]) lang = 'en';
  const t = (k) => (I18N[lang][k] ?? I18N.en[k] ?? k);

  // ------------------------------------------------------------ state
  const $ = (s, el = document) => el.querySelector(s);
  const main = $('#main');
  let DATA = null;           // skills.json
  let INDEX = null;          // MiniSearch
  let byId = new Map();
  let catById = new Map();   // id -> category (with .subMap)
  const PAGE = 48;

  // ------------------------------------------------------------ helpers
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtNum = (n) => n == null ? '' : (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(n));
  const fmtDate = (iso) => { if (!iso) return ''; try { return new Date(iso).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return iso.slice(0, 10); } };
  const shellQuote = (s) => /^[A-Za-z0-9_./-]+$/.test(s) ? s : `'${String(s).replace(/'/g, `'\\''`)}'`;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 1600); }
  async function copyText(text) { try { await navigator.clipboard.writeText(text); toast(t('copied')); } catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(t('copied')); } catch {} ta.remove(); } }
  function codeBlock(code, id) { return `<pre class="code"><button type="button" class="copy" data-copy="${esc(id)}">${esc(t('copy'))}</button><code id="${esc(id)}">${esc(code)}</code></pre>`; }
  let codeN = 0; const cid = () => 'code' + (++codeN);
  function highlight(text, terms) {
    let out = esc(text);
    if (!terms || !terms.length) return out;
    for (const term of terms.slice(0, 6)) {
      if (term.length < 2) continue;
      const re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    }
    return out;
  }
  function catName(catId) { const c = catById.get(catId); return c ? `${c.icon} ${c.name}` : catId; }
  function subName(catId, subId) { const c = catById.get(catId); const s = c && c.subMap.get(subId); return s ? s.name : subId; }
  function applyI18nStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    $('#langBtn').textContent = lang === 'tr' ? 'TR' : 'EN';
    $('#langBtn').title = t('lang');
  }

  // ------------------------------------------------------------ data + index
  async function load() {
    const res = await fetch('data/skills.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('data/skills.json ' + res.status);
    DATA = await res.json();
    if (DATA.format === 'rows-v1') DATA.skills = DATA.skills.map(expandRow);
    byId = new Map(DATA.skills.map(s => [s.id, s]));
    catById = new Map(DATA.categories.map(c => [c.id, { ...c, subMap: new Map(c.subcategories.map(s => [s.id, s])) }]));
    INDEX = new MiniSearch({
      fields: ['name', 'description', 'tags', 'repo', 'path'],
      storeFields: ['id'],
      idField: 'id',
      searchOptions: { boost: { name: 4, tags: 2, repo: 1.2, path: 1 }, prefix: true, fuzzy: (term) => term.length > 4 ? 0.2 : false, combineWith: 'AND' },
      tokenize: (text) => text.toLowerCase().split(/[\s,.;:!?()[\]{}"'`/\\|<>=+*&^%$#@~]+/).filter(Boolean),
      processTerm: (term) => term.length > 1 ? term : null,
    });
    INDEX.addAll(DATA.skills.map(s => ({
      id: s.id, name: s.name, description: s.description, repo: s.repo, path: s.path,
      tags: [catName(s.category), subName(s.category, s.subcategory), ...(s.alsoIn || []).map(x => subName(s.category, x)), s.official ? 'official anthropic' : '', s.plugin || ''].join(' '),
    })));
    $('#footerStats').textContent = `${DATA.stats.skills.toLocaleString()} ${t('statSkills')} · ${DATA.stats.repos} ${t('statRepos')} · ${t('statUpdated')} ${fmtDate(DATA.generatedAt)}`;
  }

  function expandRow(row) {
    const o = {};
    DATA.cols.forEach((c, i) => { o[c] = row[i]; });
    const r = DATA.repos[o.repo] || {};
    const branch = r.branch || 'main';
    o.alsoIn = o.alsoIn || [];
    o.official = !!o.official;
    o.license = o.license || undefined; o.version = o.version || undefined; o.author = o.author || undefined;
    o.plugin = o.plugin || undefined; o.marketplacePlugin = o.marketplacePlugin || undefined;
    o.stars = o.stars || (r.stars ?? null) || null;
    o.hasScripts = !!(o.flags & 1); o.hasReferences = !!(o.flags & 2); o.hasAssets = !!(o.flags & 4);
    o.file = o.file || ((o.path ? o.path + '/' : '') + 'SKILL.md');
    o.url = o.path ? `https://github.com/${o.repo}/tree/${branch}/${o.path}` : `https://github.com/${o.repo}`;
    o.fileUrl = `https://github.com/${o.repo}/blob/${branch}/${o.file}`;
    o.rawUrl = `https://raw.githubusercontent.com/${o.repo}/${branch}/${o.file}`;
    o.copiesCount = typeof o.copies === 'number' ? o.copies : 0;
    o.copies = [];
    return o;
  }
  const shardCache = new Map();
  async function loadDetails(s) {
    if (s._detailed) return s;
    const key = s.repo.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    try {
      let p = shardCache.get(key);
      if (!p) { p = fetch(`data/repos/${key}.json`, { cache: 'no-cache' }).then(r => r.ok ? r.json() : null); shardCache.set(key, p); }
      const shard = await p;
      const d = shard && shard.skills && shard.skills[s.id];
      if (d) {
        if (d.description) s.description = d.description;
        s.author = d.author || undefined; s.tools = d.tools || undefined; s.requires = d.requires || undefined; s.size = d.size || 0;
        s.copies = (d.copies || []).map(c => { const [owner, name, ...rest] = c.split('/'); const repo = owner + '/' + name; const path = rest.join('/'); const b = (DATA.repos[repo] || {}).branch || 'main'; return { repo, path, url: path ? `https://github.com/${repo}/tree/${b}/${path}` : `https://github.com/${repo}` }; });
      }
    } catch (e) { console.warn('details', e); }
    s._detailed = true;
    return s;
  }

  function search(q) {
    const query = q.trim();
    if (!query) return null;
    let hits = INDEX.search(query);
    if (!hits.length) hits = INDEX.search(query, { combineWith: 'OR' });
    if (!hits.length && query.length <= 3) {
      const ql = query.toLowerCase();
      hits = DATA.skills.filter(s => s.name.toLowerCase().includes(ql)).map(s => ({ id: s.id, score: 1, terms: [query] }));
    }
    return hits;
  }

  // ------------------------------------------------------------ router
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [pathPart, queryPart] = h.split('?');
    const segs = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
    const params = new URLSearchParams(queryPart || '');
    return { segs, params };
  }
  function go(path, params) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '' && v !== false)).toString() : '';
    location.hash = '#/' + path + qs;
  }
  function route() {
    if (!DATA) return;
    const { segs, params } = parseHash();
    const page = segs[0] || '';
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + page));
    window.scrollTo({ top: 0 });
    try {
      if (page === '') return params.get('q') ? renderBrowse({ q: params.get('q'), params }) : renderHome();
      if (page === 'browse') return renderBrowse({ q: params.get('q') || '', params });
      if (page === 'c') return renderBrowse({ cat: segs[1], sub: segs[2], q: params.get('q') || '', params });
      if (page === 'skill') return renderSkill(segs[1]);
      if (page === 'install') return renderInstallPage();
      if (page === 'repos') return renderRepos();
      if (page === 'about') return renderAbout();
      return renderHome();
    } catch (e) { console.error(e); main.innerHTML = `<div class="empty">${esc(String(e.message || e))}</div>`; }
  }

  // ------------------------------------------------------------ views
  function renderHome() {
    const s = DATA.stats;
    const official = DATA.skills.filter(x => x.official).slice(0, 8);
    const topRepos = Object.entries(DATA.repos).sort((a, b) => (b[1].stars || 0) - (a[1].stars || 0) || b[1].skills - a[1].skills).slice(0, 8);
    const examples = ['pdf', 'react', 'seo', 'android', 'docker', 'testing', 'excel', 'mcp'];
    main.innerHTML = `
      <section class="hero">
        <h1>${esc(t('heroTitle'))}</h1>
        <p>${esc(t('heroSub'))}</p>
        <div class="stats">
          <span class="stat"><b>${s.skills.toLocaleString()}</b> ${esc(t('statSkills'))}</span>
          <span class="stat"><b>${s.repos}</b> ${esc(t('statRepos'))}</span>
          <span class="stat"><b>${DATA.categories.length}</b> ${esc(t('statCats'))}</span>
          <span class="stat">${esc(t('statUpdated'))} <b>${esc(fmtDate(DATA.generatedAt))}</b></span>
        </div>
        <p class="note" style="margin-top:12px">${esc(t('tipSearch'))} ${examples.map(e => `<a class="chip link" href="#/browse?q=${encodeURIComponent(e)}">${esc(e)}</a>`).join(' ')}</p>
      </section>
      <div class="section-title"><h2>${esc(t('categories'))}</h2><a href="#/browse">${esc(t('browseAll'))}</a></div>
      <div class="cat-grid">
        ${DATA.categories.map(c => `
          <a class="cat-card" href="#/c/${esc(c.id)}">
            <div class="cat-head"><span class="cat-icon">${c.icon}</span><h3>${esc(c.name)}</h3><span class="count">${c.count.toLocaleString()}</span></div>
            <div class="subs">${c.subcategories.filter(x => x.count).slice(0, 6).map(x => `<span class="chip">${esc(x.name)} <span class="n">${x.count}</span></span>`).join('')}${c.subcategories.filter(x => x.count).length > 6 ? `<span class="chip">+${c.subcategories.filter(x => x.count).length - 6}</span>` : ''}</div>
          </a>`).join('')}
      </div>
      <div class="section-title"><h2>${esc(t('officialSkills'))}</h2><a href="#/browse?official=1">${esc(t('viewAll'))}</a></div>
      <div class="grid">${official.map(card).join('')}</div>
      <div class="section-title"><h2>${esc(t('popular'))}</h2><a href="#/repos">${esc(t('viewAll'))}</a></div>
      <div class="cat-grid">
        ${topRepos.map(([fn, r]) => `<a class="cat-card" href="#/browse?repo=${encodeURIComponent(fn)}"><div class="cat-head"><h3>${esc(fn)}</h3><span class="count">${r.skills} ${esc(t('statSkills'))}</span></div>${r.description ? `<p class="note" style="margin:8px 0 0">${esc(r.description)}</p>` : ''}<div class="subs" style="margin-top:8px">${r.official ? `<span class="badge official">${esc(t('official'))}</span>` : ''}${r.stars != null ? `<span class="badge stars">★ ${fmtNum(r.stars)}</span>` : ''}${r.marketplace ? `<span class="badge">plugin marketplace</span>` : ''}</div></a>`).join('')}
      </div>
      <div class="section-title"><h2>${esc(t('whatIsSkill'))}</h2><a href="#/install">${esc(t('navInstall'))} →</a></div>
      <div class="panel"><p style="margin:0">${esc(t('whatIsSkillText'))}</p></div>`;
  }

  function card(s, terms) {
    const r = DATA.repos[s.repo] || {};
    return `<a class="card" href="#/skill/${encodeURIComponent(s.id)}">
      <div class="title"><h3>${highlight(s.name, terms)}</h3>${s.official ? `<span class="badge official">${esc(t('official'))}</span>` : ''}</div>
      <p>${highlight(s.description || '', terms)}</p>
      <div class="foot"><span class="repo" title="${esc(s.repo)}">${esc(s.repo)}</span><span class="right">${s.stars != null ? `<span class="badge stars">★ ${fmtNum(s.stars)}</span>` : ''}<span class="badge cat" title="${esc(catName(s.category))}">${esc(subName(s.category, s.subcategory))}</span></span></div>
    </a>`;
  }

  function renderBrowse({ cat, sub, q = '', params }) {
    params = params || new URLSearchParams();
    const sort = params.get('sort') || (q ? 'relevance' : 'stars');
    const onlyOfficial = params.get('official') === '1';
    const withScripts = params.get('scripts') === '1';
    const repoFilter = params.get('repo') || '';
    if (cat && !catById.has(cat)) cat = undefined;
    if (cat && sub && !catById.get(cat).subMap.has(sub)) sub = undefined;

    // candidate list
    let list, terms = [];
    const hits = search(q);
    if (hits) {
      list = hits.map(h => { const s = byId.get(h.id); if (s) s._score = h.score; return s; }).filter(Boolean);
      terms = [...new Set(hits.flatMap(h => h.terms || []))];
    } else list = DATA.skills.slice();
    if (cat) list = list.filter(s => s.category === cat);
    if (cat && sub) list = list.filter(s => s.subcategory === sub || (s.category === cat && (s.alsoIn || []).includes(sub)));
    if (onlyOfficial) list = list.filter(s => s.official);
    if (withScripts) list = list.filter(s => s.hasScripts);
    if (repoFilter) list = list.filter(s => s.repo === repoFilter);
    const sorters = {
      relevance: (a, b) => rel(b) - rel(a) || (b.stars || 0) - (a.stars || 0) || a.name.localeCompare(b.name),
      stars: (a, b) => (b.official - a.official) || (b.stars || 0) - (a.stars || 0) || a.name.localeCompare(b.name),
      name: (a, b) => a.name.localeCompare(b.name),
      updated: (a, b) => String(DATA.repos[b.repo]?.pushedAt || '').localeCompare(String(DATA.repos[a.repo]?.pushedAt || '')),
    };
    list.sort(sorters[sort] || sorters.stars);

    const title = sub ? subName(cat, sub) : cat ? catById.get(cat).name : (q ? `“${q}”` : t('allSkills'));
    const crumbs = [`<a href="#/">Home</a>`, `<span>›</span>`, `<a href="#/browse">${esc(t('navBrowse'))}</a>`];
    if (cat) crumbs.push(`<span>›</span>`, sub ? `<a href="#/c/${esc(cat)}">${esc(catById.get(cat).name)}</a>` : `<span>${esc(catById.get(cat).name)}</span>`);
    if (sub) crumbs.push(`<span>›</span>`, `<span>${esc(subName(cat, sub))}</span>`);
    const subChips = cat ? catById.get(cat).subcategories.filter(x => x.count).map(x => `<a class="chip link ${sub === x.id ? 'active' : ''}" href="#/c/${esc(cat)}/${esc(x.id)}${qs({ q, sort: params.get('sort'), official: onlyOfficial ? 1 : '', scripts: withScripts ? 1 : '', repo: repoFilter })}">${esc(x.name)} <span class="n">${x.count}</span></a>`).join('') : '';
    const base = cat ? `c/${cat}${sub ? '/' + sub : ''}` : 'browse';

    main.innerHTML = `
      <div class="browse">
        <aside class="sidebar">
          <div class="mobile-cats">
            <select id="mobileCat" aria-label="${esc(t('categories'))}">
              <option value="">${esc(t('allCats'))}</option>
              ${DATA.categories.map(c => `<option value="${esc(c.id)}" ${c.id === cat ? 'selected' : ''}>${c.icon} ${esc(c.name)} (${c.count})</option>`).join('')}
            </select>
            ${cat ? `<select id="mobileSub" aria-label="${esc(t('subs'))}" style="margin-top:8px"><option value="">${esc(t('allSubs'))}</option>${catById.get(cat).subcategories.filter(x => x.count).map(x => `<option value="${esc(x.id)}" ${x.id === sub ? 'selected' : ''}>${esc(x.name)} (${x.count})</option>`).join('')}</select>` : ''}
          </div>
          <h4>${esc(t('categories'))}</h4>
          <ul class="tree">
            <li><a class="tree-cat ${!cat ? 'active' : ''}" href="#/browse${qs({ q })}" style="display:flex">${esc(t('allSkills'))}<span class="count">${DATA.stats.skills.toLocaleString()}</span></a></li>
            ${DATA.categories.map(c => `
              <li>
                <button type="button" class="tree-cat ${c.id === cat ? 'active' : ''} ${c.id === cat ? 'open' : ''}" data-cat="${esc(c.id)}"><span class="caret">▶</span><span>${c.icon} ${esc(c.name)}</span><span class="count">${c.count}</span></button>
                <ul class="tree-subs ${c.id === cat ? 'open' : ''}">
                  ${c.subcategories.filter(x => x.count).map(x => `<li><a class="${c.id === cat && x.id === sub ? 'active' : ''}" href="#/c/${esc(c.id)}/${esc(x.id)}${qs({ q })}">${esc(x.name)}<span class="count">${x.count}</span></a></li>`).join('')}
                </ul>
              </li>`).join('')}
          </ul>
          <div class="side-filters">
            <h4>${esc(t('filters'))}</h4>
            <label><input type="checkbox" id="fOfficial" ${onlyOfficial ? 'checked' : ''}> ${esc(t('onlyOfficial'))}</label>
            <label><input type="checkbox" id="fScripts" ${withScripts ? 'checked' : ''}> ${esc(t('withScripts'))}</label>
            ${repoFilter ? `<span class="chip active">${esc(repoFilter)} <a href="#/${base}${qs({ q, sort })}" title="${esc(t('clear'))}">✕</a></span>` : ''}
          </div>
        </aside>
        <section>
          <div class="crumbs">${crumbs.join('')}</div>
          <div class="results-head">
            <h2>${esc(title)}</h2>
            <span class="meta">${list.length.toLocaleString()} ${esc(list.length === 1 ? t('result') : t('results'))}${q && cat ? ` · “${esc(q)}” ${esc(t('searchIn'))} ${esc(catById.get(cat).name)}` : ''}</span>
            <div class="tools">
              <select id="sort" aria-label="Sort">
                ${q ? `<option value="relevance" ${sort === 'relevance' ? 'selected' : ''}>${esc(t('sortRelevance'))}</option>` : ''}
                <option value="stars" ${sort === 'stars' ? 'selected' : ''}>${esc(t('sortStars'))}</option>
                <option value="name" ${sort === 'name' ? 'selected' : ''}>${esc(t('sortName'))}</option>
                <option value="updated" ${sort === 'updated' ? 'selected' : ''}>${esc(t('sortUpdated'))}</option>
              </select>
            </div>
          </div>
          ${subChips ? `<div class="sub-chips">${subChips}</div>` : ''}
          <div class="grid" id="grid">${list.slice(0, PAGE).map(s => card(s, terms)).join('') || `<div class="empty" style="grid-column:1/-1"><p><b>${esc(t('noResults'))}</b></p><p>${esc(t('noResultsHint'))}</p></div>`}</div>
          ${list.length > PAGE ? `<div class="more"><button type="button" class="btn" id="more">${esc(t('loadMore'))} (${(list.length - PAGE).toLocaleString()})</button></div>` : ''}
        </section>
      </div>`;

    // wiring
    let shown = PAGE;
    $('#more')?.addEventListener('click', () => {
      const next = list.slice(shown, shown + PAGE);
      $('#grid').insertAdjacentHTML('beforeend', next.map(s => card(s, terms)).join(''));
      shown += PAGE;
      if (shown >= list.length) $('#more').remove(); else $('#more').textContent = `${t('loadMore')} (${(list.length - shown).toLocaleString()})`;
    });
    const current = () => ({ q, sort: $('#sort').value, official: $('#fOfficial').checked ? 1 : '', scripts: $('#fScripts').checked ? 1 : '', repo: repoFilter });
    $('#sort').addEventListener('change', () => go(base, current()));
    $('#fOfficial').addEventListener('change', () => go(base, current()));
    $('#fScripts').addEventListener('change', () => go(base, current()));
    $('#mobileCat')?.addEventListener('change', e => go(e.target.value ? `c/${e.target.value}` : 'browse', current()));
    $('#mobileSub')?.addEventListener('change', e => go(`c/${cat}${e.target.value ? '/' + e.target.value : ''}`, current()));
    main.querySelectorAll('.tree-cat[data-cat]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.cat;
      if (cat === id && !sub) { btn.classList.toggle('open'); btn.nextElementSibling.classList.toggle('open'); return; }
      go(`c/${id}`, current());
    }));
  }
  // relevance = search score, boosted for official skills and popular repos
  function rel(s) { return (s._score || 0) * (s.official ? 1.6 : 1) * (1 + Math.log10((s.stars || 0) + 1) / 8); }
  function qs(obj) { const p = new URLSearchParams(); for (const [k, v] of Object.entries(obj)) if (v != null && v !== '' && v !== false) p.set(k, v); const s = p.toString(); return s ? '?' + s : ''; }

  function renderSkill(id) {
    const s = byId.get(id);
    if (!s) { main.innerHTML = `<div class="empty"><p>${esc(t('notFound'))}</p><a class="btn" href="#/">${esc(t('backHome'))}</a></div>`; return; }
    if (!s._detailed) { main.innerHTML = `<div class="loading"><div class="spinner"></div><span>${esc(t('loading'))}</span></div>`; loadDetails(s).then(() => { if (parseHash().segs[1] === id) renderSkill(id); }); return; }
    const r = DATA.repos[s.repo] || {};
    const [owner, repoName] = s.repo.split('/');
    const dirName = s.path ? s.path.split('/').pop() : repoName;
    const skillSlug = (s.path ? dirName : s.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const branch = r.branch || 'main';
    const marketplaceName = r.marketplace?.name || repoName;
    const related = DATA.skills.filter(x => x.id !== s.id && x.category === s.category && x.subcategory === s.subcategory).sort((a, b) => (b.official - a.official) || (b.stars || 0) - (a.stars || 0)).slice(0, 6);

    // install snippets
    const cliCmd = s.path ? `npx skills add ${s.repo} --skill ${shellQuote(dirName)}` : `npx skills add ${s.repo}`;
    const cliCmdGlobal = cliCmd + ' -g';
    const cloneCmd = `git clone --depth 1 https://github.com/${s.repo}.git`;
    const srcPath = s.path ? `${repoName}/${s.path}` : repoName;
    const ccManual = `${cloneCmd}\nmkdir -p ~/.claude/skills\ncp -r ${shellQuote(srcPath)} ~/.claude/skills/${shellQuote(skillSlug)}`;
    const ccProject = `# inside your project\nmkdir -p .claude/skills\ncp -r ${shellQuote(srcPath)} .claude/skills/${shellQuote(skillSlug)}`;
    const pluginCmd = s.marketplacePlugin
      ? `/plugin marketplace add ${s.repo}\n/plugin install ${s.marketplacePlugin}@${marketplaceName}`
      : (r.marketplace ? `/plugin marketplace add ${s.repo}\n/plugin install <plugin-name>@${marketplaceName}` : '');
    const zipCmd = s.path
      ? `${cloneCmd}\ncd ${shellQuote(repoName + '/' + (s.path.includes('/') ? s.path.slice(0, s.path.lastIndexOf('/')) : ''))}\nzip -r ${shellQuote(skillSlug + '.zip')} ${shellQuote(dirName)}`
      : `${cloneCmd}\nmv ${shellQuote(repoName)} ${shellQuote(skillSlug)}\nzip -r ${shellQuote(skillSlug + '.zip')} ${shellQuote(skillSlug)} -x '*.git*'`;
    const apiCode = `import anthropic\n\nclient = anthropic.Anthropic()\n\n# 1) upload the skill folder once (zip it first, see the claude.ai tab)\nskill = client.beta.skills.create(\n    display_title="${s.name.replace(/"/g, '\\"')}",\n    files=anthropic.lib.files_from_dir("${skillSlug}"),\n    betas=["skills-2025-10-02"],\n)\n\n# 2) use it in a request (requires the code execution tool)\nresp = client.beta.messages.create(\n    model="claude-sonnet-5-5",\n    max_tokens=4096,\n    betas=["code-execution-2025-08-25", "skills-2025-10-02"],\n    container={"skills": [{"type": "custom", "skill_id": skill.id, "version": "latest"}]},\n    tools=[{"type": "code_execution_20250825", "name": "code_execution"}],\n    messages=[{"role": "user", "content": "..."}],\n)`;
    const otherAgents = `# Cursor / Codex / Gemini CLI / Copilot etc. via skills CLI\n${cliCmd} -a cursor\n${cliCmd} -a codex`;

    main.innerHTML = `
      <div class="crumbs"><a href="#/">Home</a><span>›</span><a href="#/c/${esc(s.category)}">${esc(catById.get(s.category)?.name || s.category)}</a><span>›</span><a href="#/c/${esc(s.category)}/${esc(s.subcategory)}">${esc(subName(s.category, s.subcategory))}</a></div>
      <div class="detail">
        <article>
          <h1>${esc(s.name)}</h1>
          <div class="badges">
            ${s.official ? `<span class="badge official">✓ ${esc(t('official'))} Anthropic</span>` : ''}
            <a class="badge cat" href="#/c/${esc(s.category)}/${esc(s.subcategory)}">${esc(catName(s.category))} › ${esc(subName(s.category, s.subcategory))}</a>
            ${(s.alsoIn || []).map(x => `<a class="badge" href="#/c/${esc(s.category)}/${esc(x)}">+ ${esc(subName(s.category, x))}</a>`).join('')}
            ${s.stars != null ? `<span class="badge stars">★ ${fmtNum(s.stars)}</span>` : ''}
            ${s.license ? `<span class="badge">${esc(s.license)}</span>` : ''}
            ${s.version ? `<span class="badge">v${esc(s.version)}</span>` : ''}
            ${s.plugin ? `<span class="badge" title="${esc(t('inPlugin'))}">🔌 ${esc(s.plugin)}</span>` : ''}
          </div>
          <p class="lead">${esc(s.description)}</p>
          <div class="actions">
            <a class="btn primary" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t('viewGithub'))} ↗</a>
            <a class="btn" href="${esc(s.fileUrl)}" target="_blank" rel="noopener">${esc(t('viewFile'))}</a>
            <button type="button" class="btn" id="previewBtn">${esc(t('preview'))}</button>
          </div>
          <div id="previewBox" class="panel" hidden></div>

          <section class="panel" id="install">
            <h2>${esc(t('install'))}</h2>
            <div class="tabs" role="tablist">
              <button type="button" class="tab active" data-tab="cc">${esc(t('tabClaudeCode'))}</button>
              <button type="button" class="tab" data-tab="cli">${esc(t('tabCli'))}</button>
              <button type="button" class="tab" data-tab="manual">${esc(t('tabManual'))}</button>
              <button type="button" class="tab" data-tab="ai">${esc(t('tabClaudeAi'))}</button>
              <button type="button" class="tab" data-tab="api">${esc(t('tabApi'))}</button>
            </div>
            <div class="tabpane active" data-pane="cc">
              ${pluginCmd ? `<div class="step"><p><b>${esc(t('ccPluginTitle'))}</b></p><p>${esc(t('ccPluginDesc'))}</p>${codeBlock(pluginCmd, cid())}<small>${esc(t('ccPluginThen'))}</small></div>` : ''}
              <div class="step"><p><b>${esc(t('cliTitle'))}</b></p><p>${esc(t('cliDesc'))}</p>${codeBlock(cliCmd + ' -a claude-code', cid())}${codeBlock(cliCmdGlobal + ' -a claude-code', cid())}</div>
              <div class="step"><p><b>${esc(t('ccManualTitle'))}</b></p><p>${esc(t('ccManualDesc'))}</p>${codeBlock(ccManual, cid())}${codeBlock(ccProject, cid())}</div>
              <div class="step"><p><b>${esc(t('verifyTitle'))}</b></p><small>${esc(t('verifyDesc'))}</small></div>
            </div>
            <div class="tabpane" data-pane="cli">
              <div class="step"><p>${esc(t('cliDesc'))}</p>${codeBlock(cliCmd, cid())}${codeBlock(cliCmdGlobal, cid())}</div>
              <div class="step"><p>${esc(t('cliFind'))}</p>${codeBlock(`npx skills add ${s.repo} --list`, cid())}</div>
              <div class="step">${codeBlock(otherAgents, cid())}<small><a href="https://github.com/vercel-labs/skills" target="_blank" rel="noopener">vercel-labs/skills</a> · <a href="https://skills.sh" target="_blank" rel="noopener">skills.sh</a></small></div>
            </div>
            <div class="tabpane" data-pane="manual">
              <div class="step"><p><b>${esc(t('manualTitle'))}</b></p><p>${esc(t('manualDesc'))}</p>${codeBlock(ccManual, cid())}</div>
              <div class="step"><p>${esc(t('ccManualDesc'))}</p>${codeBlock(ccProject, cid())}</div>
            </div>
            <div class="tabpane" data-pane="ai">
              <div class="step"><p><b>${esc(t('aiTitle'))}</b></p><p>${esc(t('aiDesc'))}</p>
                <ol>${t('aiSteps').map((x, i) => `<li>${esc(x)}${i === 0 ? codeBlock(zipCmd, cid()) : ''}</li>`).join('')}</ol></div>
            </div>
            <div class="tabpane" data-pane="api">
              <div class="step"><p><b>${esc(t('apiTitle'))}</b></p><p>${esc(t('apiDesc'))}</p>${codeBlock(apiCode, cid())}<small><a href="https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview" target="_blank" rel="noopener">Agent Skills docs ↗</a></small></div>
            </div>
          </section>

          ${related.length ? `<section><div class="section-title"><h2>${esc(t('related'))}</h2><a href="#/c/${esc(s.category)}/${esc(s.subcategory)}">${esc(t('viewAll'))}</a></div><div class="related">${related.map(x => card(x)).join('')}</div></section>` : ''}
        </article>
        <aside>
          <div class="panel">
            <h3>${esc(t('details'))}</h3>
            <dl class="kv">
              <dt>${esc(t('repository'))}</dt><dd><a href="https://github.com/${esc(s.repo)}" target="_blank" rel="noopener">${esc(s.repo)}</a>${r.description ? `<br><small class="note">${esc(r.description)}</small>` : ''}</dd>
              <dt>${esc(t('path'))}</dt><dd><code>${esc(s.file)}</code></dd>
              ${s.stars != null ? `<dt>${esc(t('stars'))}</dt><dd>★ ${s.stars.toLocaleString()}</dd>` : ''}
              ${s.author ? `<dt>${esc(t('author'))}</dt><dd>${esc(s.author)}</dd>` : ''}
              ${s.license || r.license ? `<dt>${esc(t('license'))}</dt><dd>${esc(s.license || r.license)}</dd>` : ''}
              ${s.version ? `<dt>${esc(t('version'))}</dt><dd>${esc(s.version)}</dd>` : ''}
              ${s.plugin ? `<dt>${esc(t('plugin'))}</dt><dd>${esc(s.plugin)}</dd>` : ''}
              ${s.tools ? `<dt>${esc(t('tools'))}</dt><dd><code>${esc(s.tools)}</code></dd>` : ''}
              ${s.requires ? `<dt>${esc(t('requires'))}</dt><dd><code>${esc(s.requires)}</code></dd>` : ''}
              <dt>${esc(t('contents'))}</dt><dd>SKILL.md${s.size ? ` (${fmtNum(s.size)} B)` : ''}${s.hasScripts ? ` · ${esc(t('scripts'))}` : ''}${s.hasReferences ? ` · ${esc(t('references'))}` : ''}${s.hasAssets ? ` · ${esc(t('assets'))}` : ''}</dd>
              ${r.pushedAt ? `<dt>${esc(t('updated'))}</dt><dd>${esc(fmtDate(r.pushedAt))}</dd>` : ''}
              <dt>${esc(t('rawFile'))}</dt><dd><a href="${esc(s.rawUrl)}" target="_blank" rel="noopener">raw.githubusercontent.com ↗</a></dd>
            </dl>
          </div>
          ${s.copies?.length ? `<div class="panel"><h3>${esc(t('alsoFoundIn'))}</h3><ul style="margin:0;padding-left:18px;font-size:13.5px">${s.copies.slice(0, 10).map(c => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.repo)}${c.path ? '/' + esc(c.path) : ''}</a></li>`).join('')}</ul></div>` : ''}
          <div class="panel"><h3>${esc(t('repository'))}</h3><a class="btn sm" href="#/browse?repo=${encodeURIComponent(s.repo)}">${esc(t('viewAll'))} ${(r.skills || 1)} ${esc(t('statSkills'))}</a></div>
        </aside>
      </div>`;

    main.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
      main.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === b));
      main.querySelectorAll('.tabpane').forEach(p => p.classList.toggle('active', p.dataset.pane === b.dataset.tab));
    }));
    $('#previewBtn').addEventListener('click', async () => {
      const box = $('#previewBox');
      if (!box.hidden) { box.hidden = true; $('#previewBtn').textContent = t('preview'); return; }
      box.hidden = false; $('#previewBtn').textContent = t('hidePreview');
      box.innerHTML = `<div class="loading" style="padding:20px 0"><div class="spinner"></div>${esc(t('previewLoading'))}</div>`;
      try {
        const res = await fetch(s.rawUrl);
        if (!res.ok) throw new Error(res.status);
        let md = await res.text();
        md = md.replace(/^---[ \t]*\n[\s\S]*?\n---[ \t]*\n?/, '');
        const base = s.rawUrl.slice(0, s.rawUrl.lastIndexOf('/') + 1);
        const html = DOMPurify.sanitize(marked.parse(md, { gfm: true, breaks: false }), { USE_PROFILES: { html: true }, ADD_ATTR: ['target'] });
        box.innerHTML = `<div class="md">${html}</div>`;
        box.querySelectorAll('img').forEach(img => { const src = img.getAttribute('src') || ''; if (src && !/^(https?:|data:)/.test(src)) img.src = base + src.replace(/^\.\//, ''); });
        box.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; const href = a.getAttribute('href') || ''; if (href && !/^(https?:|#|mailto:)/.test(href)) a.href = s.fileUrl.slice(0, s.fileUrl.lastIndexOf('/') + 1) + href.replace(/^\.\//, ''); });
      } catch (e) { box.innerHTML = `<p class="note">${esc(t('previewError'))}</p>`; }
    });
  }

  function renderInstallPage() {
    const tr = lang === 'tr';
    main.innerHTML = `<div class="prose">
      <h1>${esc(t('installPageTitle'))}</h1>
      <p class="muted">${esc(t('installPageSub'))}</p>
      <div class="toc">
        <a class="chip link" href="#/install#what">${tr ? 'Skill nedir' : 'What is a skill'}</a><a class="chip link" href="#/install#cc">Claude Code</a><a class="chip link" href="#/install#cli">skills CLI</a><a class="chip link" href="#/install#plugins">${tr ? 'Plugin & marketplace' : 'Plugins & marketplaces'}</a><a class="chip link" href="#/install#ai">claude.ai</a><a class="chip link" href="#/install#api">API</a><a class="chip link" href="#/install#other">${tr ? 'Diğer ajanlar' : 'Other agents'}</a><a class="chip link" href="#/install#write">${tr ? 'Kendi skill\'ini yaz' : 'Write your own'}</a><a class="chip link" href="#/install#safety">${tr ? 'Güvenlik' : 'Safety'}</a>
      </div>

      <h2 id="what">${esc(t('whatIsSkill'))}</h2>
      <p>${esc(t('whatIsSkillText'))}</p>
      ${codeBlock(`my-skill/\n├── SKILL.md          # required: frontmatter (name, description) + instructions\n├── scripts/          # optional: helper scripts Claude can run\n├── references/       # optional: extra docs loaded on demand\n└── assets/           # optional: templates, images, fonts`, cid())}
      ${codeBlock(`---\nname: my-skill\ndescription: What the skill does and WHEN Claude should use it. This line is what Claude sees first.\n---\n\n# My skill\n\nStep-by-step instructions, conventions, examples...`, cid())}

      <h2 id="cc">Claude Code</h2>
      <p>${tr ? 'Claude Code skilleri üç yerden okur:' : 'Claude Code reads skills from three places:'}</p>
      <ul>
        <li><code>~/.claude/skills/&lt;name&gt;/SKILL.md</code> — ${tr ? 'kişisel skiller, tüm projelerde geçerli' : 'personal skills, available in every project'}</li>
        <li><code>.claude/skills/&lt;name&gt;/SKILL.md</code> — ${tr ? 'proje skilleri, repo ile birlikte paylaşılır' : 'project skills, shared with the repo'}</li>
        <li>${tr ? 'Plugin içindeki' : 'Inside a plugin:'} <code>&lt;plugin&gt;/skills/&lt;name&gt;/SKILL.md</code> — ${tr ? 'marketplace\'ten kurulan pluginler' : 'installed from a marketplace'}</li>
      </ul>
      <p>${tr ? 'En basit yol: skill klasörünü kopyalayın.' : 'The simplest way: copy the skill folder.'}</p>
      ${codeBlock(`git clone --depth 1 https://github.com/<owner>/<repo>.git\nmkdir -p ~/.claude/skills\ncp -r <repo>/<path-to-skill> ~/.claude/skills/<skill-name>`, cid())}
      <div class="callout ok">${tr ? 'Yeni bir oturum başlatın ve <code>/skills</code> yazarak skill\'in listelendiğini doğrulayın. Claude, açıklaması göreve uyduğunda skill\'i kendiliğinden kullanır; <code>/skill-name</code> yazarak da elle çağırabilirsiniz.' : 'Start a new session and type <code>/skills</code> to confirm it is listed. Claude uses a skill on its own when the description matches the task; you can also invoke it manually with <code>/skill-name</code>.'}</div>

      <h2 id="cli">${tr ? 'skills CLI (npx skills)' : 'skills CLI (npx skills)'}</h2>
      <p>${tr ? 'Vercel\'in açık kaynak <a href="https://github.com/vercel-labs/skills" target="_blank" rel="noopener">skills CLI</a> aracı, herhangi bir GitHub reposundaki skilleri tek komutla kurar ve günceller. Node.js gerekir.' : 'The open-source <a href="https://github.com/vercel-labs/skills" target="_blank" rel="noopener">skills CLI</a> by Vercel installs and updates skills from any GitHub repo with one command. Requires Node.js.'}</p>
      ${codeBlock(`npx skills add <owner>/<repo>                       # ${tr ? 'repodaki tüm skiller (interaktif seçim)' : 'all skills in the repo (interactive)'}\nnpx skills add <owner>/<repo> --skill <name>        # ${tr ? 'tek skill' : 'one skill'}\nnpx skills add <owner>/<repo> --skill <name> -g     # ${tr ? 'global kur (~/.claude/skills)' : 'install globally (~/.claude/skills)'}\nnpx skills add <owner>/<repo> -a claude-code        # ${tr ? 'hedef ajanı seç' : 'pick the target agent'}\nnpx skills add <owner>/<repo> --list                # ${tr ? 'sadece listele' : 'just list'}\nnpx skills find <query>                             # ${tr ? 'ara' : 'search'}\nnpx skills list                                     # ${tr ? 'kurulu skiller' : 'installed skills'}\nnpx skills update                                   # ${tr ? 'hepsini güncelle' : 'update all'}\nnpx skills remove <name>`, cid())}

      <h2 id="plugins">${tr ? 'Plugin & marketplace ile kurulum' : 'Installing via plugins & marketplaces'}</h2>
      <p>${tr ? 'Bazı repolar bir <code>.claude-plugin/marketplace.json</code> dosyası içerir. Bu durumda skiller pluginler halinde paketlenmiştir ve Claude Code içinden kurulur; güncellemeler de otomatik gelir. Skill sayfalarında bu repolar için hazır komut gösterilir.' : 'Some repos ship a <code>.claude-plugin/marketplace.json</code>. Their skills are packaged as plugins and installed from inside Claude Code, with updates handled for you. Skill pages show the exact command for those repos.'}</p>
      ${codeBlock(`/plugin marketplace add <owner>/<repo>\n/plugin install <plugin-name>@<marketplace-name>\n/plugin                      # ${tr ? 'kurulu pluginleri yönet' : 'manage installed plugins'}`, cid())}
      <p>${tr ? 'Anthropic\'in resmi marketplace\'i <code>claude-plugins-official</code> adıyla hazır gelir:' : 'Anthropic\'s official marketplace is pre-registered as <code>claude-plugins-official</code>:'}</p>
      ${codeBlock(`/plugin install <plugin-name>@claude-plugins-official`, cid())}

      <h2 id="ai">claude.ai (${tr ? 'web & masaüstü' : 'web & desktop'})</h2>
      <ol>
        <li>${tr ? 'Skill klasörünü zip\'leyin. Zip\'in içinde skill adını taşıyan tek bir klasör olmalı ve SKILL.md onun kökünde durmalı.' : 'Zip the skill folder. The zip must contain a single folder named after the skill with SKILL.md at its root.'}${codeBlock(`zip -r my-skill.zip my-skill`, cid())}</li>
        <li>${tr ? 'claude.ai → <b>Settings → Capabilities → Skills</b> → <b>Upload skill</b>.' : 'claude.ai → <b>Settings → Capabilities → Skills</b> → <b>Upload skill</b>.'}</li>
        <li>${tr ? 'Zip\'i seçin. Skill tüm sohbetlerinizde kullanılabilir olur; aynı ekrandan açıp kapatabilirsiniz.' : 'Select the zip. The skill is available in all your chats and can be toggled from the same screen.'}</li>
      </ol>
      <div class="callout">${tr ? 'Skill kullanan sohbetler için "code execution / file creation" özelliğinin açık olması gerekir (Settings → Capabilities). Takım/Enterprise planlarında yöneticinin skilleri etkinleştirmesi gerekebilir.' : 'Skills need code execution / file creation enabled (Settings → Capabilities). On Team/Enterprise plans an admin may need to enable skills first.'}</div>

      <h2 id="api">Claude API</h2>
      <p>${tr ? 'Skiller API üzerinden yüklenir (Skills API) ve Messages isteğinde <code>container.skills</code> ile kullanılır; code execution aracı gereklidir. Anthropic\'in hazır skilleri (pptx, docx, xlsx, pdf) <code>type: "anthropic"</code> ile çağrılır.' : 'Skills are uploaded through the Skills API and referenced with <code>container.skills</code> in a Messages request; the code execution tool is required. Anthropic\'s built-in skills (pptx, docx, xlsx, pdf) are referenced with <code>type: "anthropic"</code>.'}</p>
      ${codeBlock(`import anthropic\nclient = anthropic.Anthropic()\n\nskill = client.beta.skills.create(\n    display_title="My skill",\n    files=anthropic.lib.files_from_dir("my-skill"),\n    betas=["skills-2025-10-02"],\n)\n\nresp = client.beta.messages.create(\n    model="claude-sonnet-5-5",\n    max_tokens=4096,\n    betas=["code-execution-2025-08-25", "skills-2025-10-02"],\n    container={"skills": [\n        {"type": "custom", "skill_id": skill.id, "version": "latest"},\n        {"type": "anthropic", "skill_id": "pptx", "version": "latest"},\n    ]},\n    tools=[{"type": "code_execution_20250825", "name": "code_execution"}],\n    messages=[{"role": "user", "content": "Create a 5-slide deck about ..."}],\n)`, cid())}
      <p><a href="https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview" target="_blank" rel="noopener">Agent Skills documentation ↗</a></p>

      <h2 id="other">${tr ? 'Diğer ajanlar (Cursor, Codex, Gemini CLI, Copilot…)' : 'Other agents (Cursor, Codex, Gemini CLI, Copilot…)'}</h2>
      <p>${tr ? 'SKILL.md açık bir standart (<a href="https://agentskills.io" target="_blank" rel="noopener">agentskills.io</a>). Çoğu ajan aynı klasörü kendi dizininden okur; skills CLI <code>-a</code> ile doğru yere kurar.' : 'SKILL.md is an open standard (<a href="https://agentskills.io" target="_blank" rel="noopener">agentskills.io</a>). Most agents read the same folder from their own directory; the skills CLI puts it in the right place with <code>-a</code>.'}</p>
      ${codeBlock(`npx skills add <owner>/<repo> --skill <name> -a cursor\nnpx skills add <owner>/<repo> --skill <name> -a codex\nnpx skills add <owner>/<repo> --skill <name> -a gemini-cli\n# ${tr ? 'ya da elle' : 'or by hand'}: .cursor/skills/  .codex/skills/  .gemini/skills/  .github/skills/`, cid())}

      <h2 id="write">${tr ? 'Kendi skill\'ini yaz' : 'Write your own skill'}</h2>
      <ol>
        <li>${tr ? 'Bir klasör ve içinde <code>SKILL.md</code> oluşturun. <code>name</code> küçük harf ve tire içermeli (max 64 karakter), <code>description</code> ne yaptığını VE ne zaman kullanılacağını söylemeli (max 1024 karakter).' : 'Create a folder with a <code>SKILL.md</code>. <code>name</code> must be lowercase with hyphens (max 64 chars); <code>description</code> should say what it does AND when to use it (max 1024 chars).'}</li>
        <li>${tr ? 'Talimatları kısa tutun (ideal &lt; 500 satır); uzun referansları <code>references/</code> altına koyup linkleyin.' : 'Keep instructions short (ideally &lt; 500 lines); move long reference material into <code>references/</code> and link it.'}</li>
        <li>${tr ? 'Tekrarlayan işler için <code>scripts/</code> altına script ekleyin.' : 'Add scripts under <code>scripts/</code> for repetitive work.'}</li>
        <li>${tr ? 'Hazır şablon ve yardımcı: Anthropic\'in <a href="#/browse?q=skill-creator">skill-creator</a> skill\'i ya da <code>npx skills init my-skill</code>.' : 'Templates and helpers: Anthropic\'s <a href="#/browse?q=skill-creator">skill-creator</a> skill, or <code>npx skills init my-skill</code>.'}</li>
      </ol>

      <h2 id="safety">${tr ? 'Güvenlik notu' : 'A note on safety'}</h2>
      <div class="callout warn">${tr ? 'Skiller Claude\'a talimat verir ve script çalıştırabilir. Kurmadan önce SKILL.md ve scripts/ içeriğini okuyun, yalnızca güvendiğiniz kaynaklardan kurun. Bu dizin içeriği doğrulamaz; sadece GitHub\'da bulunanları listeler.' : 'Skills instruct Claude and may run scripts. Read SKILL.md and scripts/ before installing and only install from sources you trust. This directory does not vet content; it only lists what exists on GitHub.'}</div>
    </div>`;
    const frag = location.hash.split('#')[2]; if (frag) document.getElementById(frag)?.scrollIntoView();
  }

  function renderRepos() {
    const rows = Object.entries(DATA.repos).sort((a, b) => b[1].skills - a[1].skills || (b[1].stars || 0) - (a[1].stars || 0));
    main.innerHTML = `<div class="prose" style="max-width:none">
      <h1>${esc(t('reposTitle'))}</h1><p class="muted">${esc(t('reposSub'))}</p>
      <table class="repos"><thead><tr><th>${esc(t('repo'))}</th><th class="num">${esc(t('skillsCount'))}</th><th class="num hide-sm">${esc(t('stars'))}</th><th class="hide-sm">${esc(t('kind'))}</th><th class="hide-sm">${esc(t('updated'))}</th></tr></thead>
      <tbody>${rows.map(([fn, r]) => `<tr><td><a href="#/browse?repo=${encodeURIComponent(fn)}">${esc(fn)}</a> <a href="${esc(r.url)}" target="_blank" rel="noopener" title="GitHub">↗</a>${r.official ? ` <span class="badge official">${esc(t('official'))}</span>` : ''}${r.marketplace ? ` <span class="badge">marketplace</span>` : ''}${r.description ? `<br><small class="note">${esc(r.description)}</small>` : ''}</td><td class="num">${r.skills}</td><td class="num hide-sm">${r.stars != null ? r.stars.toLocaleString() : '–'}</td><td class="hide-sm">${esc(t(r.kind) || r.kind)}</td><td class="hide-sm">${esc(fmtDate(r.pushedAt))}</td></tr>`).join('')}</tbody></table>
      <p class="muted" style="margin-top:14px">${lang === 'tr' ? 'Eksik bir repo mu var?' : 'Missing a repo?'} <a href="https://github.com/muratceme/claude-skill-finder/edit/main/scripts/sources.json" target="_blank" rel="noopener">${esc(t('addSource'))} ↗</a></p>
    </div>`;
  }

  function renderAbout() {
    const tr = lang === 'tr';
    const s = DATA.stats;
    main.innerHTML = `<div class="prose">
      <h1>${esc(t('aboutTitle'))}</h1>
      <p>${tr ? 'Claude Skill Finder, GitHub\'daki Claude / Agent Skill\'lerini (SKILL.md) tek bir yerde aranabilir hale getiren açık kaynak, statik bir dizindir.' : 'Claude Skill Finder is an open-source static directory that makes Claude / Agent Skills (SKILL.md) on GitHub searchable in one place.'}</p>
      <h2>${tr ? 'Nasıl çalışır' : 'How it works'}</h2>
      <ol>
        <li>${tr ? '<b>Keşif:</b> <code>scripts/sources.json</code> içindeki tohum repolar + awesome listelerin README\'lerindeki GitHub linkleri + (token varsa) GitHub topic/kod araması.' : '<b>Discovery:</b> seed repos in <code>scripts/sources.json</code> + GitHub links in awesome-list READMEs + (with a token) GitHub topic/code search.'}</li>
        <li>${tr ? '<b>Toplama:</b> her repo sığ (depth 1) klonlanır ve tüm <code>SKILL.md</code> dosyaları bulunur; frontmatter (name, description, license, metadata) ayrıştırılır.' : '<b>Collection:</b> every repo is shallow-cloned and all <code>SKILL.md</code> files are found; frontmatter (name, description, license, metadata) is parsed.'}</li>
        <li>${tr ? '<b>Tekilleştirme:</b> aynı isim + açıklamaya sahip kopyalar birleştirilir (resmi/çok yıldızlı kaynak tercih edilir), diğer kopyalar "Şurada da var" altında listelenir.' : '<b>De-duplication:</b> copies with the same name + description are merged (official / high-star source wins); other copies are listed under "Also found in".'}</li>
        <li>${tr ? '<b>Kategorilendirme:</b> <code>scripts/taxonomy.json</code> içindeki anahtar kelime kurallarıyla isim, açıklama, klasör adı ve metadata puanlanır; en yüksek puanlı alt kategori atanır, yakın puanlılar ikincil etiket olur.' : '<b>Categorization:</b> keyword rules in <code>scripts/taxonomy.json</code> score the name, description, folder name and metadata; the best subcategory wins, close runners-up become secondary tags.'}</li>
        <li>${tr ? '<b>Arama:</b> tarayıcıda çalışan MiniSearch indeksi (önek + bulanık eşleme, alan ağırlıkları). Sunucu yok, her şey statik.' : '<b>Search:</b> a MiniSearch index in the browser (prefix + fuzzy matching, field boosts). No server; everything is static.'}</li>
        <li>${tr ? '<b>Güncelleme:</b> GitHub Actions her gün toplayıcıyı çalıştırıp veriyi yeniler ve siteyi GitHub Pages\'e yayınlar.' : '<b>Updates:</b> a GitHub Actions workflow runs the collector daily, refreshes the data and deploys the site to GitHub Pages.'}</li>
      </ol>
      <h2>${tr ? 'Son çalıştırma' : 'Last run'}</h2>
      <ul>
        <li>${esc(t('statUpdated'))}: ${esc(fmtDate(DATA.generatedAt))}</li>
        <li>${s.skills.toLocaleString()} ${esc(t('statSkills'))}, ${s.repos} ${esc(t('statRepos'))} (${s.reposScanned} ${tr ? 'tarandı' : 'scanned'}, ${s.reposFailed} ${tr ? 'hata' : 'failed'}), ${s.duplicatesMerged} ${tr ? 'kopya birleştirildi' : 'duplicates merged'}, ${s.official} ${tr ? 'resmi' : 'official'}</li>
        <li>GitHub API: ${s.apiUsed ? (tr ? 'kullanıldı (yıldız sayıları güncel)' : 'used (star counts are current)') : (tr ? 'kullanılamadı — yıldız sayıları eksik olabilir' : 'unavailable — star counts may be missing')}</li>
      </ul>
      <h2>${tr ? 'Katkı' : 'Contributing'}</h2>
      <p>${tr ? 'Yeni bir kaynak eklemek için <code>scripts/sources.json</code>\'a repo ekleyin; kategori kurallarını iyileştirmek için <code>scripts/taxonomy.json</code>\'u düzenleyin. Kod ve veri' : 'To add a source, add the repo to <code>scripts/sources.json</code>; to improve category rules, edit <code>scripts/taxonomy.json</code>. Code and data live at'} <a href="https://github.com/muratceme/claude-skill-finder" target="_blank" rel="noopener">github.com/muratceme/claude-skill-finder</a>.</p>
      <p class="muted">${tr ? 'Bu site Anthropic ile bağlantılı değildir. Skill içerikleri ilgili repoların lisanslarına tabidir.' : 'This site is not affiliated with Anthropic. Skill contents are subject to the licenses of their repositories.'}</p>
    </div>`;
  }

  // ------------------------------------------------------------ global events
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    if (btn) { const el = document.getElementById(btn.dataset.copy); if (el) copyText(el.textContent); }
  });
  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#q').value.trim();
    const { segs } = parseHash();
    if (segs[0] === 'c' && segs[1]) go(`c/${segs[1]}${segs[2] ? '/' + segs[2] : ''}`, { q });
    else go('browse', { q });
  });
  let typing;
  $('#q').addEventListener('input', () => {
    clearTimeout(typing);
    typing = setTimeout(() => {
      const q = $('#q').value.trim();
      const { segs, params } = parseHash();
      if (q === (params.get('q') || '')) return;
      if (segs[0] === 'c' && segs[1]) go(`c/${segs[1]}${segs[2] ? '/' + segs[2] : ''}`, { q, official: params.get('official'), scripts: params.get('scripts') });
      else if (segs[0] === 'browse' || segs[0] === '' || q) go('browse', { q, official: params.get('official'), scripts: params.get('scripts'), repo: params.get('repo') });
    }, 220);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement?.tagName || '')) { e.preventDefault(); $('#q').focus(); $('#q').select(); }
    if (e.key === 'Escape' && document.activeElement === $('#q')) $('#q').blur();
  });
  $('#langBtn').addEventListener('click', () => { lang = lang === 'tr' ? 'en' : 'tr'; try { localStorage.setItem('lang', lang); } catch {} applyI18nStatic(); route(); if (DATA) $('#footerStats').textContent = `${DATA.stats.skills.toLocaleString()} ${t('statSkills')} · ${DATA.stats.repos} ${t('statRepos')} · ${t('statUpdated')} ${fmtDate(DATA.generatedAt)}`; });
  $('#themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next; try { localStorage.setItem('theme', next); } catch {}
  });
  try { const th = localStorage.getItem('theme'); if (th) document.documentElement.dataset.theme = th; } catch {}
  window.addEventListener('hashchange', () => { const { params } = parseHash(); const q = params.get('q') || ''; if ($('#q').value !== q && document.activeElement !== $('#q')) $('#q').value = q; route(); });

  // ------------------------------------------------------------ boot
  applyI18nStatic();
  load().then(() => { const { params } = parseHash(); $('#q').value = params.get('q') || ''; route(); })
    .catch(e => { main.innerHTML = `<div class="empty"><p>Failed to load data: ${esc(e.message)}</p><p class="note">Run <code>npm run collect</code> to generate <code>site/data/skills.json</code>.</p></div>`; });
})();
