# CodeLens AI — Full Project Audit

## Project Layout
```
CodeLens-AI/
├── backend/          # Express 5 (CommonJS)
│   └── src/
│       ├── server.js            # dotenv + listen :5000
│       ├── app.js               # express app, cors, json, mounts /api/repo + /api/settings
│       ├── routes/
│       │   ├── repoRoutes.js    # GET /:owner/:repo, POST /analyze, POST /ask
│       │   └── settingsRoutes.js # GET /, PUT /, POST /clear
│       ├── controllers/
│       │   ├── repoController.js
│       │   └── settingsController.js
│       ├── services/
│       │   ├── aiService.js         # OpenRouter (deepseek-chat), dynamic model
│       │   ├── githubService.js     # GitHub contents + trees API
│       │   ├── dependencyService.js # Manifest parser (8 formats)
│       │   └── configService.js     # Load/save config.json, effective key/model
│       └── store/repoStore.js   # In-memory knowledge base for /ask
├── frontend/         # React 19 + Vite 8 + Tailwind 4 + react-router 7
│   └── src/
│       ├── context/
│       │   ├── AnalysisContext.jsx   # Maps backend response, localStorage persistence
│       │   └── UserContext.jsx       # Profile, recent repos, modal state
│       ├── services/api.js           # axios -> http://localhost:5000/api
│       ├── components/
│       │   ├── ProfileModal.jsx      # First-run welcome + editable profile
│       │   ├── layout/
│       │   │   ├── TopBar.jsx        # Repo name, real initials avatar, dropdown menu
│       │   │   ├── Sidebar.jsx       # NavLinks with lucide icons, Settings link
│       │   │   └── AppLayout.jsx     # Redirect to / if no data, loading skeleton
│       │   └── common/
│       │       ├── Card.jsx
│       │       ├── Button.jsx
│       │       └── Input.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx       # Hero + analyze form, features section, how-it-works
│       │   └── Dashboard/
│       │       ├── Overview.jsx
│       │       ├── Architecture.jsx
│       │       ├── Structure.jsx
│       │       ├── Dependencies.jsx
│       │       ├── FileSummaries.jsx
│       │       ├── ChatInterface.jsx
│       │       ├── Onboarding.jsx
│       │       └── Settings.jsx
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       └── App.css                  # DEAD CODE — not imported by any component
└── .env.example
```

## Core Features (all working, no mock data)

### Repo Analysis (POST /api/repo/analyze)
- Full pipeline: contents → tree → files → deps → AI summaries → architecture → chat KB
- Returns: name, owner, description, stars, forks, language, url, summary, folders, files, importantFiles, architecture, fileSummaries, dependencies, manifests, packageManager, devScript, tree, topics, updatedAt
- File summaries run in PARALLEL via `Promise.allSettled`
- `identifyImportantFiles` always returns an array (never a string)

### AI Chat (POST /api/repo/ask)
- Q&A against in-memory knowledge base (must analyze first; 400 if no KB)
- Dynamic model/key via configService (no restart needed)

### Dashboard Pages
- **Overview** — Real stars/forks/language/updatedAt/topics/readmeSummary; hides empty topics
- **Architecture** — AI architecture text in `<pre>`; honest error display if generation fails
- **Structure** — Real nested tree from `buildTree` (flat paths → nested); expand/collapse, search, file/folder icons
- **Dependencies** — Real deps grid + empty-state card when no deps
- **File Summaries** — Full project tree (all files from tree, AI summaries when available, "No AI summary generated" for rest); orphan summaries handled; search across all
- **Chat Interface** — Real /ask integration; error handling; auto-scroll; typing indicator

### Onboarding Guide
- Manifest-aware install commands (npm/pip/go/bundler/cargo/composer)
- Non-npm run commands honest: "check README" fallback (not guessed)
- Real repo URL/name, real important files, live GitHub buttons

### Settings (/analysis/settings)
- Real backend: `configService.js` (load/save `config.json`), `GET/PUT /api/settings` + `POST /api/settings/clear`
- Shows masked API keys with source label (config/env/not set)
- Model selector (any OpenRouter slug)
- File summaries toggle, dependency analysis toggle
- Clear session button (wipes KB)
- Feature toggles verified live (deps off → dependencies=[])

## User Profile System
- **UserContext** — Profile (localStorage), recentRepos (max 6), profileModalOpen/closeProfile/openProfile, skipSetup, clearAll
- **ProfileModal** — First-run welcome + editable profile (remounts on open via key prop)
- **TopBar** — Real initials avatar from profile, dropdown with recent repos, settings, clear data
- **Skip for now** — Clears profileModalOpen flag (closes modal even when opened via Sign In)
- **Landing page** — `Sign In` opens profile modal (becomes `Hi, <name>` when profile exists); `Get Started` smooth scrolls to `#analyze`
- **Nav anchors** — `#features` → real section, `#how-it-works` → real 4-step section

## Backend Robustness
- Real dependency parsing: package.json, composer.json, requirements.txt, go.mod, Cargo.toml, Gemfile, Pipfile, pyproject.toml (root + subfolders)
- Real file tree from GitHub trees API `?recursive=1` (capped `.slice(0,500)`, filtered `.git/`)
- URL validation: malformed URL → 400, nonexistent/renamed/private repo → 404
- GitHub token auth (`Authorization: Bearer $GITHUB_TOKEN`) via `githubHeaders()`
- 15s axios timeouts on all GitHub calls; 30s timeout on OpenAI client
- `GET /api/repo/:owner/:repo` also maps 404
- `config.json` is gitignored, persists Settings overrides
- Only `server.js` listens on :5000; no dual-server conflict

## File-by-File Classification

### WORKING (real data, real interactions)
| File | Notes |
|------|-------|
| `repoController.js` | Full analysis pipeline, URL validation, error mapping |
| `settingsController.js` | CRUD for settings, clear session |
| `repoRoutes.js` | GET /:owner/:repo, POST /analyze, POST /ask |
| `settingsRoutes.js` | GET /, PUT /, POST /clear |
| `aiService.js` | Lazy OpenAI client, dynamic key/model via configService |
| `githubService.js` | Contents + trees API, effective token from configService |
| `dependencyService.js` | 8 manifest parsers, subfolder scanning, dedupe |
| `configService.js` | Load/save config.json, maskKey, effective getters |
| `repoStore.js` | In-memory KB with set/get/has/getSize/clear |
| `server.js` | dotenv + listen :5000 |
| `app.js` | CORS + JSON + mounts /api/repo + /api/settings |
| `App.jsx` | Routes, UserProvider + AnalysisProvider, ProfileModal |
| `main.jsx` | ReactDOM + BrowserRouter + App |
| `AnalysisContext.jsx` | Maps backend response, localStorage persistence, hydrate on mount |
| `UserContext.jsx` | Profile, recent repos, modal state, localStorage |
| `api.js` | axios client, analyzeRepo, askRepo, getSettings, updateSettings, clearSessionData |
| `ProfileModal.jsx` | First-run welcome, editable profile, skip for now |
| `TopBar.jsx` | Real initials avatar, recent repos, settings, clear data |
| `Sidebar.jsx` | NavLinks with lucide icons, Settings link |
| `AppLayout.jsx` | Redirect to / if no data, loading skeleton with spinner |
| `LandingPage.jsx` | Hero + analyze form, features section, how-it-works, nav anchors, Sign In |
| `Overview.jsx` | Real stars/forks/language/updatedAt/topics/readmeSummary |
| `Architecture.jsx` | AI architecture text, honest error display |
| `Structure.jsx` | Real nested tree, expand/collapse, search |
| `Dependencies.jsx` | Real deps grid + empty state |
| `FileSummaries.jsx` | Full tree + AI summaries, search, orphan handling |
| `ChatInterface.jsx` | Real /ask, error handling, auto-scroll |
| `Onboarding.jsx` | Manifest-aware commands, honest fallback, live GitHub links |
| `Settings.jsx` | Full CRUD, masked keys, toggles, clear session |

### DEAD CODE (not used)
| File | Notes |
|------|-------|
| `App.css` | Vestigial Vite boilerplate (.counter, .hero, #center, #next-steps); NOT imported by any component |

### MINOR ISSUES (not blocking, pre-existing)
| File | Issue |
|------|-------|
| `Overview.jsx` | Unused `motion` import from framer-motion |
| `Architecture.jsx` | Unused `motion` import from framer-motion |
| ~30 files | Unused `React` import (pre-existing style, not from our changes) |
| `AnalysisContext.jsx`, `UserContext.jsx` | `react-refresh/only-export-components` lint warning (context pattern) |

### PLACEHOLDERS/STATIC DATA
**None.** All features use real backend data. No mock/dummy data is injected anywhere.

## Known Limitations (by design, not bugs)
- **In-memory KB** (`repoStore`) resets on server restart; `/ask` fails with 400 until re-analyze
- **No auth/rate limiting** on any endpoint
- **No test suite**
- **Analysis latency** ~30-70s per analyze (multiple sequential OpenRouter calls)
- **Chat error message** for KB-wiped case is generic (could be more specific)

## Verification (tested live)
- `expressjs/express` — 44 deps/npm, 281 tree, 3 summaries
- `pallets/flask` — 6 deps/pip, 287 tree, 7 topics
- `vercel/next.js` — 189 deps/npm, 500 tree capped, 14 topics
- `octocat/Hello-World` — 0 deps, 1 tree
- `sinatra/sinatra` — 35 deps/bundler, 326 tree
- `gin-gonic/gin` — 35 deps/go, 147 tree
- All 200 OK with real data
- Settings toggles verified (deps off → dependencies=[])
- Malformed URL → 400, nonexistent repo → 404
- Profile modal + skip + TopBar menu + landing nav — all verified working
- localStorage persistence (recent repos, dashboard restore on refresh) — verified

## Git Status
Branch: `main`
All session work uncommitted (many modified + new files including `dependencyService.js`, `configService.js`, `settingsController.js`, `settingsRoutes.js`, `UserContext.jsx`, `ProfileModal.jsx`, `Settings.jsx`, `AGENTS.md`, `AUDIT.md`).
