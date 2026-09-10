# Code Viewer Implementation Report

## Files Changed (4)
| File | Change |
|------|--------|
| `frontend/package.json` | Added `highlight.js` dependency |
| `frontend/package-lock.json` | Auto-generated lockfile |
| `frontend/src/services/api.js` | Added `getFileContents(owner, repo, filePath)` |
| `frontend/src/pages/Dashboard/Structure.jsx` | Rewritten into Repository Explorer + Code Viewer |

## What Was Implemented

### Repository Explorer
- Two-panel layout: explorer tree (left, 320px) + code viewer (right, flex)
- File selection state with visual highlight (`bg-accent/10 text-accent`)
- Clicking a file selects it; clicking a folder expands/collapses
- Nested tree preserved from original `buildTree()` logic
- File/folder icons, search, "Click folders to expand" hint — all preserved
- Responsive: stacks vertically below `lg` breakpoint

### Code Viewer
- **Empty state**: "Select a file to view its contents" with FileCode icon
- **Loading state**: Spinner + "Loading file contents..."
- **Error state**: AlertCircle icon + error message + "The backend does not yet expose a file content endpoint"
- **Binary state**: Detected by extension (png, zip, exe, etc.) — shows "Binary or unsupported file type"
- **Content state**: Syntax-highlighted code with line numbers, copy button
- **Syntax highlighting**: `highlight.js` with `atom-one-light` theme (warm aesthetic fits CodeLens)
- **Language detection**: 50+ file extension mappings
- **Copy button**: Clipboard API, shows "Copied" with checkmark for 2 seconds
- **File path + language badge** in header bar

## Backend Boundary Finding (resolved — endpoint now implemented)

1. **What existing API provides**: `getFileContent()` in `githubService.js` exists but was NOT exposed as an HTTP endpoint. It was only used internally during analysis to summarize important files.

2. **What was missing**: A `GET /api/repo/:owner/:repo/file/:path` route that exposes `getFileContent()` to the frontend.

3. **Implementation**: See the "Backend Endpoint" section below.

## Backend Endpoint (implemented)

**Files changed (3):**
- `backend/src/routes/repoRoutes.js` — added route `GET /:owner/:repo/file/{*filePath}`
- `backend/src/controllers/repoController.js` — added `getFileContentByPath` handler + export
- `backend/src/services/githubService.js` — minimal change: attach GitHub HTTP `status` to the error thrown by `getFileContent()` (message unchanged; needed to return proper 404s)

**Exact endpoint added:**
```
GET /api/repo/:owner/:repo/file/{*filePath}
```

**How nested paths are handled:**
Express 5 (`path-to-regexp` v8) no longer supports the `*` wildcard, so the route uses a named splat `{*filePath}`. It captures the remaining path as an **array of segments** (`['src','services','x.js']`), which the controller joins with `/`. Both raw (`/file/src/svc/x.js`) and frontend-style URL-encoded (`/file/src%2Fsvc%2Fx.js`) paths decode correctly.

**Example successful request:**
```
GET http://localhost:5000/api/repo/octocat/Hello-World/file/README
```

**Example response shape:**
```json
{ "content": "Hello World!\n" }
```

**Error handling:**
- Missing/invalid path → 400 `{ message: "File path is required" }`
- Nonexistent file or repo → 404 `{ message: "File not found in the specified repository", error }`
- GitHub API errors / unexpected errors → 500 `{ message: "Failed to fetch file content", error }`
- No secrets or tokens exposed; endpoint always retrieves from the specified GitHub repo via `githubService.getFileContent()` (no arbitrary URLs accepted)

## Verification

### Frontend
- Build: **passes** (chunk size warning is from highlight.js — acceptable for dev tool)
- Lint: **30 errors, all pre-existing** — zero new errors
- No mock data introduced
- Existing dashboard routes unaffected
- Existing Structure tree functionality preserved (same `buildTree`, same expand/collapse, same search)

### Backend endpoint tests (all passed)
| Test | Result |
|------|--------|
| `octocat/Hello-World/file/README` | 200, `content: "Hello World!\n"` |
| `expressjs/express/file/lib/express.js` (nested) | 200, 1636 chars |
| `expressjs/express/file/lib%2Fexpress.js` (URL-encoded) | 200, 1636 chars |
| `expressjs/express/file/package.json` | 200, returned as **string** (`responseType:"text"` preserved) |
| Nonexistent file (`lib/nope.js`) | 404, `{message, error}` |
| Nonexistent repo | 404, `{message, error}` |

### Existing endpoints verified unaffected
- `GET /api/repo/:owner/:repo` → 200 with real data
- `POST /api/repo/analyze` (bad URL) → 400 `{ message: "Invalid GitHub repository URL..." }`
- `POST /api/repo/ask` (no knowledge base) → 400 `{ message: "Analyze a repository first" }`

## Remaining Limitations
- Nonexistent file vs nonexistent repo both return the generic `"File not found in the specified repository"` message (GitHub status is preserved, but per-file vs per-repo 404s aren't distinguished without an extra API call — the status code 404 is correct for both).
- No auth/rate-limiting on any endpoint (consistent with the rest of the app).
