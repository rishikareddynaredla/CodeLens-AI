# CodeLens AI

An AI-powered repository understanding platform that helps developers and students understand unfamiliar codebases through intelligent explanations, repository insights, and semantic code understanding.

## 🚀 Project Vision

Understanding large or unfamiliar repositories is difficult, especially for:

* Students exploring open source
* Developers onboarding into new projects
* Contributors trying to understand repo architecture

CodeLens AI aims to solve this by providing:

* Repository insights
* Codebase explanations
* AI-powered understanding
* Semantic repository Q&A
* Architecture understanding
* Dependency analysis

---

## 🛠 Current Features

### ✅ GitHub Repository Fetch & Analysis API

Fetch real-time repository metadata, full structure, dependencies, and AI-generated insights.

### Supported Information

* Repository name, owner, description, stars, forks, primary language, URL
* Last updated timestamp and repository topics
* README AI summary
* Repository structure (full recursive file tree)
* AI-identified important files with per-file summaries
* AI architecture explanation
* Real dependency analysis (package.json, requirements.txt, go.mod, Cargo.toml, Gemfile, Pipfile, pyproject.toml, composer.json)
* Interactive Q&A chat against the analyzed repository

### Example API Endpoints

```http
GET  /api/repo/vercel/next.js
POST /api/repo/analyze   { "repoUrl": "https://github.com/vercel/next.js" }
POST /api/repo/ask       { "question": "How does routing work?" }
```

### Example Response

```json
{
  "name": "next.js",
  "owner": "vercel",
  "description": "The React Framework",
  "stars": 140065,
  "forks": 31227,
  "language": "JavaScript",
  "url": "https://github.com/vercel/next.js",
  "updatedAt": "2026-09-09T11:21:33Z",
  "topics": ["react", "nextjs"]
}
```

---

## 🧱 Project Architecture

```text
CodeLens-AI/
│
├── frontend/        # React (Vite + Tailwind) dashboard
│   └── src/
│       ├── context/   # Analysis state
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   └── Dashboard/   # Overview, Architecture, Structure, Dependencies, FileSummaries, Chat, Onboarding
│       └── services/api.js
├── backend/         # Express backend
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/   # githubService, aiService, dependencyService
│       ├── store/      # in-memory knowledge base
│       ├── app.js
│       └── server.js
└── .env.example     # PORT, OPENROUTER_API_KEY, GITHUB_TOKEN
```

---

## ⚙️ Tech Stack

### Backend

* Node.js
* Express.js

### API Handling

* Axios

### Environment Management

* dotenv

### Development Tools

* Nodemon

### Version Control

* Git & GitHub

---

## 📌 Current Progress

### Completed

* Project setup
* Secure environment configuration
* Backend server setup
* Express architecture
* Route & controller structure
* GitHub API integration
* Dynamic repository fetching
* AI README summarization
* Repository structure analysis
* AI important-file discovery + file summaries
* AI architecture explanation
* Dependency analysis
* Interactive repository Q&A
* Full frontend dashboard (Overview, Architecture, Structure, Dependencies, Files, Chat, Onboarding)

### Upcoming Features

* RAG-based semantic code search
* Repository health scoring
* Dependency caching / faster analysis
* User auth & per-user rate limiting

---

## 🔐 Security

Sensitive credentials are protected using:

`.env`

Environment variables are excluded from Git tracking using:

`.gitignore`

---

## 🧪 Run Locally

Backend:

```bash
cd backend
npm install
npm run dev        # -> http://localhost:5000
```

Frontend:

```bash
cd frontend
npm install
npm run dev        # -> http://localhost:5173
```

### Environment

Create `backend/.env` (see `.env.example`):

* `OPENROUTER_API_KEY` — required, for AI summaries & Q&A (https://openrouter.ai/keys)
* `GITHUB_TOKEN` — optional but recommended, raises GitHub rate limit to 5,000/hr (https://github.com/settings/tokens)

---

## 📍 Project Status

🚧 Currently in active development
