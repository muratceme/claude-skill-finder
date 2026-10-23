# Claude Skill Finder

A searchable, categorized directory of **Claude / Agent Skills** (`SKILL.md`) collected automatically from GitHub, with ready-to-copy install instructions for Claude Code, claude.ai and the Claude API.

*Türkçe özet aşağıda.*

- **Static site** (`site/`): no server, no build step. Search runs in the browser (MiniSearch), categories are a two-level tree (e.g. *Design → Mobile App Design*), each skill has a detail page with install commands and a SKILL.md preview. English / Turkish UI.
- **Collector** (`scripts/collect.mjs`): discovers repositories (seed list + awesome-list links + GitHub topic/code search), clones them sparsely, parses every `SKILL.md`, de-duplicates and categorizes, then writes `site/data/`.
- **Automation** (`.github/workflows/`): refreshes the data daily and deploys the site to GitHub Pages.

## Quick start (local)

```bash
npm install
npm run collect        # ~5-10 min: clones ~800 repos sparsely into .cache/repos and writes site/data/
npm run serve          # http://localhost:8080  (another port: npm run serve -- 3000)
```

Useful flags for the collector:

```bash
node scripts/collect.mjs --max-repos 40            # quick run
node scripts/collect.mjs --no-crawl                # seeds only, don't follow awesome-list links
node scripts/collect.mjs --no-api                  # skip the GitHub REST API (stars, topic search, code search)
node scripts/collect.mjs --no-fetch                # reuse cached clones without network access
node scripts/collect.mjs --only owner/repo,o/r2    # scan just these repos
GITHUB_TOKEN=ghp_... node scripts/collect.mjs      # enables star counts + GitHub search discovery
```

## Deploying on GitHub Pages

1. Push this repository to GitHub (default branch `main`).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Run the **Update skills data** workflow once by hand (Actions → Update skills data → Run workflow). It scans GitHub with the built-in `GITHUB_TOKEN`, commits `site/data/` and that commit triggers **Deploy site to GitHub Pages**.
4. The site is served at `https://<user>.github.io/<repo>/`. From then on the data refreshes every day at 03:17 UTC.

No secrets are needed: `GITHUB_TOKEN` is provided by Actions and is enough for the REST API calls the collector makes.

## How it works

```
scripts/sources.json ─┐
awesome-list READMEs ─┼─► repo list ─► sparse git clone ─► find SKILL.md ─► parse frontmatter
GitHub topic/code API ┘                                        │
                                                               ▼
                       site/data/skills.json ◄─ categorize ◄─ de-duplicate (same name+description)
                       site/data/repos/*.json   (taxonomy.json)   official / popular source wins
```

- **Discovery.** `scripts/sources.json` lists seed repos (official Anthropic repos, big community collections, awesome-lists). Every GitHub link in an awesome-list README is a candidate; with a token the collector also queries `topic:claude-skills` etc. and code search for `SKILL.md`.
- **Cloning.** Repos are cloned with `--depth 1 --filter=blob:limit=512k --no-checkout` plus a sparse checkout limited to `**/SKILL.md`, root `*.md` and `.claude-plugin/*.json`, so even huge repos cost a few MB and about one second.
- **Parsing.** YAML frontmatter (`name`, `description`, `license`, `metadata`, `allowed-tools`, ...) is parsed with the `yaml` package; missing fields fall back to the first heading / paragraph. Mirrors for other agents (`.gemini/`, `.codex/`, `.cursor/`), `node_modules`, tests and fixtures are skipped.
- **De-duplication.** Skills with the same normalized name + description are merged. The official or most-starred source wins; aggregator mirrors listed under `crawl.aggregators` always lose. The other copies stay visible on the skill page under "Also found in". Repositories that are the same repo under two names (renames) are detected via identical HEAD commits.
- **Categorization.** `scripts/taxonomy.json` defines 16 categories and ~80 subcategories, each with weighted keywords. The skill name, folder name, frontmatter metadata, description, parent folders and repo name are scored (name counts 4×, folder 3×, …); the best subcategory wins and close runners-up become secondary tags. Unmatched skills land in *Other*. Edit the JSON to tune results; no code changes needed.
- **Search.** The browser builds a MiniSearch index (prefix + fuzzy matching, boosted name/category fields, AND-combining with OR fallback). Results can be filtered by category, subcategory, official-only, has-scripts and source repo, and sorted by relevance, stars, name or repo activity.
- **Dates.** Every skill carries two dates: the repo's last commit (`repos[].pushedAt`) and `added`, the day the skill first appeared in this directory (persisted in `site/data/first-seen.json`; on the very first run it is seeded from the repo commit date). The site filters on either one: last N days, presets, or a custom from/to range (`#/browse?days=10`, `#/browse?from=2026-09-01&to=2026-09-30&dateby=added`).
- **Data format.** `site/data/skills.json` holds compact rows (`format: rows-v1`, column names in `cols`) to keep the index small; long descriptions, copies and extra metadata live in per-repo shards under `site/data/repos/` and load on demand.

## Adding sources / fixing categories

- New repository: add it to `seeds` in `scripts/sources.json` (`kind: "collection"` for repos that contain skills, `"awesome"` for lists that link to others).
- Wrong category: add or adjust keywords in `scripts/taxonomy.json` (`strong` keywords weigh 3×).
- Run `node scripts/collect.mjs --no-fetch` to re-process cached clones quickly, then `node scripts/check.mjs`.

## Project layout

```
scripts/collect.mjs        collector CLI
scripts/lib/frontmatter.mjs  SKILL.md parsing
scripts/lib/categorize.mjs   keyword scoring against taxonomy.json
scripts/lib/github.mjs       optional GitHub REST helpers (graceful when unavailable)
scripts/sources.json       seed repos, crawl limits, skip patterns
scripts/taxonomy.json      category tree + keywords
scripts/check.mjs          sanity checks for generated data (used in CI)
scripts/serve.mjs          tiny static server for local preview
site/index.html, app.js, styles.css   the site (vanilla JS, hash routing)
site/vendor/               MiniSearch, marked, DOMPurify (vendored; licenses included)
site/data/                 generated data (committed so Pages can serve it)
.github/workflows/         update-data.yml (daily) + deploy.yml (Pages)
```

## Notes

- This directory does not vet skill contents. Read `SKILL.md` and any scripts before installing; skills can run code.
- Not affiliated with Anthropic. Skill contents are subject to their repositories' licenses.

---

## Türkçe

**Claude Skill Finder**, GitHub'daki Claude / Agent Skill'lerini (`SKILL.md`) otomatik toplayıp kategorilere ayıran, tarayıcıda arama yapılabilen ve her skill için kurulum komutları gösteren statik bir sitedir.

- `npm install && npm run serve` ile yerelde çalışır (http://localhost:8080; başka port için `npm run serve -- 3000`). Veri repoda hazır; yenilemek için `npm run collect`.
- GitHub Pages'te yayınlamak için: repo ayarlarında **Settings → Pages → Source: GitHub Actions** seçin, ardından **Actions → Update skills data → Run workflow** ile ilk veriyi üretin. Veri her gün otomatik yenilenir ve site otomatik yayınlanır.
- Yeni kaynak eklemek için `scripts/sources.json`, kategori kurallarını değiştirmek için `scripts/taxonomy.json` dosyasını düzenleyin.
- Site arayüzü sağ üstteki düğmeyle Türkçe/İngilizce arasında geçiş yapar.
