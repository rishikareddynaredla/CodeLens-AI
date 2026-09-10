# CodeLens AI — Project Context (AGENTS.md)

AI-powered repository understanding platform. Users paste a GitHub repo URL, the backend analyzes it (metadata, README, architecture, important files, dependencies), and the frontend shows a dashboard with an AI chat.

## Repo layout
```
CodeLens-AI/
├── backend/          # Express 5 (CommonJS)
│   └── src/
│       ├── server.js            # dotenv + listen :5000
│       ├── app.js               # express app, cors, json, mounts /api/repo
│       ├── routes/repoRoutes.js # GET /:owner/:repo, POST /analyze, POST /ask
│       ├── controllers/repoController.js
│       ├── services/
│       │   ├── aiService.js         # OpenRouter (deepseek-chat)
│       │   ├── githubService.js     # GitHub contents API
│       │   └── dependencyService.js # manifest parser (NEW)
│       └── store/repoStore.js   # in-memory knowledge base for /ask
├── frontend/         # React 19 + Vite 8 + Tailwind 4 + react-router 7
│   └── src/
│       ├── context/AnalysisContext.jsx   # maps backend response
│       ├── services/api.js               # axios -> http://localhost:5000/api
│       ├── pages/LandingPage.jsx
│       └── pages/Dashboard/{Overview,Architecture,Structure,Dependencies,FileSummaries,ChatInterface,Onboarding}.jsx
└── .env.example      # PORT, OPENROUTER_API_KEY, GITHUB_TOKEN
```

## Run
- Backend: `cd backend && npm run dev` → http://localhost:5000
- Frontend: `cd frontend && npm run dev` → http://localhost:5173
- Frontend build check: `cd frontend && npm run build` (passes). Lint is NOT clean: ~30 pre-existing errors (unused `React` imports in nearly every file, `react-refresh/only-export-components` in AnalysisContext) — pre-existing style, not from our changes; don't "fix" them unless asked.
- `backend/.env` is gitignored and already contains a real `OPENROUTER_API_KEY` and a real `GITHUB_TOKEN` (set this session). Never print/commit these.

## API
- `GET /api/repo/:owner/:repo` — metadata + AI README summary
- `POST /api/repo/analyze` `{repoUrl}` — full analysis (slow, ~30-70s). Returns: name, owner, description, stars, forks, language, url, summary, folders, files, importantFiles, architecture, fileSummaries, **dependencies**, **manifests**, **packageManager**, **devScript**
- `POST /api/repo/ask` `{question}` — Q&A against in-memory knowledge base (must analyze first; 400 if no knowledge base)
- CORS is wide open (`app.use(cors())`), fine for dev.

## Key behavior / pitfalls learned (do not regress)
1. **File fetch must stay as text:** `githubService.getFileContent` MUST keep `responseType: "text"`. GitHub serves `package.json` raw content with `Content-Type: application/json`, so axios auto-parses it into an object otherwise → dependency parsers silently skip it (this was a real bug, now fixed).
2. **GitHub token used everywhere:** `githubHeaders()` (in both `githubService.js` and `repoController.js`) adds `Authorization: Bearer $GITHUB_TOKEN` when set. 15s axios timeouts on all GitHub calls; 30s timeout on OpenAI client.
3. **`identifyImportantFiles` always returns an array** (returns `[]` on error/parse failure — never a string). Controller also guards with `Array.isArray`.
4. **File summaries run in PARALLEL** via `Promise.allSettled` — the analyze endpoint previously hung because they ran sequentially. Keep it that way.
5. **Frontend must NEVER inject mock/dummy data on backend failure.** `AnalysisContext` sets `error` + `analysisData(null)` on failure; `LandingPage` displays the error. Dashboard pages all use optional chaining (`analysisData?.x`), so null is safe.
6. **Dependencies are real, manifest-driven:** `dependencyService.getDependencies` returns `{ dependencies, manifests, packageManager, devScript }`. Parses root + monorepo subfolders (`frontend/backend/client/server/package.json`) and 8 formats (package.json, composer.json, requirements.txt, go.mod, Cargo.toml, Gemfile, Pipfile, pyproject.toml). Dedupes. `packageManager`: npm/pip/go/bundler/cargo/composer or null. `devScript`: `scripts.dev || scripts.start || scripts["dev:start"]`.
7. **Onboarding + Dependencies pages show real data + empty states.** Onboarding commands derive from detected `packageManager` (not language). If no manifest → show "check README" message, never fake npm commands. Dependencies page shows empty-state card when no deps.

## Current state (uncommitted — session work)
Git: branch `main`, up to date with origin. `git status` shows ALL features from this session as uncommitted changes (`?` = dependencyService.js new):
- Modified: `.env.example`, `backend/src/controllers/repoController.js`, `backend/src/services/aiService.js`, `backend/src/services/githubService.js`, `frontend/src/context/AnalysisContext.jsx`, `frontend/src/pages/Dashboard/Dependencies.jsx`, `frontend/src/pages/Dashboard/Onboarding.jsx`, `frontend/src/pages/LandingPage.jsx`, `frontend/README.md`
- New: `backend/src/services/dependencyService.js`
Nothing has been committed this session. Commit only if the user explicitly asks.

## Known remaining issues / next-step candidates
- **Analysis latency:** make no changes to parallelization, but note ~30-70s per analyze from multiple sequential OpenRouter calls (identity -> per-file summaries -> architecture -> README). Future: caching, streaming, or limiting AI calls.
- **npm repo without `scripts`** (e.g. express): no `devScript`, frontend falls back to `npm run dev` which is conventional but not actually defined. Acceptable; docs advise checking README.
- **In-memory knowledge base** (`repoStore`) resets on server restart; `/ask` fails with 400 until re-analyze.
- **No rate limiting on /ask per user**, no auth, no test suite. README "Upcoming Features" (RAG, health scoring, dependency analysis) — dependency analysis & structure now exist; others still open.
- Untested: nothing for these changes; unit-style verification done via stub `getFileContent` injection + live API checks on `expressjs/express`, `pallets/flask`, `vercel/next.js`, `octocat/Hello-World`.

## Verification snippets
- Live analyze: `POST http://localhost:5000/api/repo/analyze` body `{"repoUrl":"https://github.com/expressjs/express"}` → expect `dependencies` (~44), `packageManager: "npm"`, 3 `fileSummaries`.
- Quick dep check (no AI, fast): `cd backend && node -e "require('dotenv').config(); require('./src/services/dependencyService').getDependencies('pallets','flask').then(r=>console.log(r.dependencies.length,r.packageManager,r.manifests))"`
- Ports after a test run: kill node via `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ... Stop-Process`.