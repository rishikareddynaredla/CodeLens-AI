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

### ✅ GitHub Repository Fetch API

Fetch real-time repository metadata using the GitHub API.

### Supported Information

* Repository name
* Owner
* Description
* Stars
* Forks
* Primary language
* Repository URL

### Example API Endpoint

```http
GET /api/repo/vercel/next.js
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
  "url": "https://github.com/vercel/next.js"
}
```

---

## 🧱 Project Architecture

```text
CodeLens-AI/
│
├── frontend/        # React frontend (planned)
├── backend/         # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│
├── docs/            # Project documentation
├── assets/          # Static assets
│
├── .env.example
├── .gitignore
└── README.md
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

### Upcoming Features

* GitHub URL parser
* README fetcher
* Repository structure parser
* AI-powered repository explanation
* RAG-based semantic code search
* Dependency analysis
* Repository health scoring
* Architecture visualization

---

## 🔐 Security

Sensitive credentials are protected using:

`.env`

Environment variables are excluded from Git tracking using:

`.gitignore`

---

## 🧪 Run Locally

Clone the project:

```bash
git clone <your-repo-url>
```

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Server runs at:

```text
http://localhost:5000
```

---

## 📍 Project Status

🚧 Currently in active development
