const axios = require("axios");
const {
  setRepositoryKnowledge,
  getRepositoryKnowledge,
} = require("../store/repoStore");

const {
  summarizeReadme,
  explainArchitecture,
  identifyImportantFiles,
  summarizeFile,
  answerQuestion,
} = require("../services/aiService");
const { getRepoContents,
  getFileContent,
  getRepoTree,
 } = require("../services/githubService");
const { getDependencies } = require("../services/dependencyService");
const appConfig = require("../services/configService");

// Extract owner/repo from any GitHub URL form (https://.../owner/repo,
// git@...:owner/repo.git, trailing slashes, #fragments, /tree/main, etc).
// Returns null when the URL is not a recognizable GitHub repository URL.
const parseRepoUrl = (repoUrl) => {
  if (typeof repoUrl !== "string") return null;
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/#?]+)/i);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
};

// Map GitHub API errors to sensible HTTP status codes instead of always 500.
const githubStatus = (error, fallback = 500) =>
  error.response && error.response.status === 404 ? 404 : fallback;

// Build GitHub API headers with an optional auth token to avoid rate limits.
// Returns plain headers when no token is configured.
const githubHeaders = () => {
  const headers = {
    Accept: "application/vnd.github+json",
  };
  const token = appConfig.getEffectiveGithubToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// GET /api/repo/:owner/:repo
const getRepository = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Fetch repository data
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        timeout: 15000,
        headers: githubHeaders(),
      }
    );

    const repoData = response.data;

    // Fetch README
    const readmeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        timeout: 15000,
        headers: {
          ...githubHeaders(),
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );

    const readmeContent = readmeResponse.data;
    const summary = await summarizeReadme(readmeContent);

    res.status(200).json({
      name: repoData.name,
      owner: repoData.owner.login,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      language: repoData.language,
      url: repoData.html_url,
      updatedAt: repoData.updated_at,
      topics: Array.isArray(repoData.topics) ? repoData.topics : [],
      summary,
      //readme: readmeContent,
    });

  } catch (error) {
    const status = githubStatus(error);
    res.status(status).json({
      message:
        status === 404
          ? "Repository not found, renamed, or made private"
          : "Failed to fetch repository",
      error: error.message,
    });
  }
};

// POST /api/repo/analyze
const analyzeRepository = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    
    // Validate input
    if (!repoUrl) {
      return res.status(400).json({
        message: "Repository URL is required",
      });
    }

    // Extract owner and repo from GitHub URL, rejecting malformed input early
    // with a client error instead of forwarding garbage to the GitHub API.
    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({
        message: "Invalid GitHub repository URL. Expected format: https://github.com/owner/repo",
      });
    }
    const { owner, repo } = parsed;

    // Fetch repository data
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        timeout: 15000,
        headers: githubHeaders(),
      }
    );

    const repoData = response.data;
    const contents = await getRepoContents(owner, repo);

    // Full recursive file tree (single git trees API call). Capped to keep
    // responses reasonable on very large repositories.
    let tree = [];
    try {
      const fullTree = await getRepoTree(
        owner,
        repo,
        repoData.default_branch || "main"
      );
      tree = fullTree
        .filter(
          (item) =>
            item.path &&
            !item.path.includes(".git/")
        )
        .map((item) => ({
          path: item.path,
          type: item.type === "tree" ? "dir" : "file",
        }))
        .slice(0, 500);
    } catch (error) {
      console.log("Tree fetch failed:", error.message);
    }

    const folders = contents
  .filter((item) => item.type === "dir")
  .map((item) => item.name);
  const files = contents
  .filter((item) => item.type === "file")
  .map((item) => item.name);
  console.log("FILES FROM GITHUB:");
  console.log(files);

  const config = appConfig.getConfig();
  const importantFiles = [];
  const fileSummaries = [];

  if (config.summariesEnabled) {
    const identified = await identifyImportantFiles(files);
    console.log("Important Files:");
    console.log(identified);

    // Guard: importantFiles should always be an array returned by the AI service.
    // If it is not (e.g. AI failure), avoid iterating over a string/falsy value.
    const filesToSummarize = Array.isArray(identified)
      ? identified
      : [];

    // Fetch and summarize the important files in PARALLEL to avoid sequential
    // blocking on slow file fetches + AI calls, which caused request timeouts.
    const results = await Promise.allSettled(
      filesToSummarize.map(async (file) => {
        console.log("Trying to fetch:", file);
        const fileContent = await getFileContent(owner, repo, file);
        const summary = await summarizeFile(file, fileContent);
        return { file, summary };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        fileSummaries.push(result.value);
      } else {
        console.log("Skipping file (failed):", result.reason?.message || "unknown error");
      }
    }
    importantFiles.push(...filesToSummarize);
  } else {
    console.log("File summaries disabled in settings");
  }

    const architecture = await explainArchitecture(folders);

    // Fetch real dependencies from the repository's manifest files
    let dependencies = [];
    let manifests = [];
    let packageManager = null;
    let devScript = null;
    if (config.depsEnabled) {
      const deps = await getDependencies(owner, repo);
      dependencies = deps.dependencies || [];
      manifests = deps.manifests || [];
      packageManager = deps.packageManager || null;
      devScript = deps.devScript || null;
      console.log("Dependencies found:", dependencies.length);
    } else {
      console.log("Dependency analysis disabled in settings");
    }

    // Fetch README
    const readmeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        timeout: 15000,
        headers: {
          ...githubHeaders(),
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );

    const readmeContent = readmeResponse.data;
    const summary = await summarizeReadme(readmeContent);
    const knowledgeBase = `
    SUMMARY:
    ${summary}

    ARCHITECTURE:
    ${architecture}

    FOLDERS:
    ${folders.join(", ")}

    DEPENDENCIES:
    ${dependencies
      .map(
        (dep) =>
          `${dep.name}@${dep.version} (${dep.type})`
      )
      .join(", ") || "No dependencies detected"}

    FILE SUMMARIES:
    ${fileSummaries
      .map(
        (file) => `
    ${file.file}:
    ${file.summary}
    `
      )
      .join("\n")}

    README:
    ${readmeContent}
    `;
    setRepositoryKnowledge(knowledgeBase);
    console.log("Repository knowledge saved");
    console.log("Knowledge size:", knowledgeBase.length);
    res.status(200).json({
    name: repoData.name,
    owner: repoData.owner.login,
    description: repoData.description,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    language: repoData.language,
    url: repoData.html_url,
    updatedAt: repoData.updated_at,
    topics: Array.isArray(repoData.topics) ? repoData.topics : [],
    summary,
    folders,
    files,
    tree,
    importantFiles,
    architecture,
    fileSummaries,
    dependencies,
    manifests,
    packageManager,
    devScript
});

  } catch (error) {
    const status = githubStatus(error);
    res.status(status).json({
      message:
        status === 404
          ? "Repository not found, renamed, or made private"
          : "Failed to analyze repository",
      error: error.message,
    });
  }
};
const askRepository = async (req, res) => {
  try {
    console.log("BODY:", req.body); // ADD HERE

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const knowledgeBase = getRepositoryKnowledge();

    console.log(
      "KNOWLEDGE BASE:",
      knowledgeBase ? "FOUND" : "NOT FOUND"
    ); // ADD HERE

    if (!knowledgeBase) {
      return res.status(400).json({
        message: "Analyze a repository first",
      });
    }

    const answer = await answerQuestion(
      knowledgeBase,
      question
    );

    res.status(200).json({
      question,
      answer,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to answer repository question",
      error: error.message,
    });
  }
};
// GET /api/repo/:owner/:repo/file/{*filePath}
// Serves raw file content for the Code Viewer. The named splat captures the
// full nested path (e.g. "src/services/githubService.js") via req.params.filePath.
const getFileContentByPath = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const filePath = Array.isArray(req.params.filePath)
      ? req.params.filePath.join("/")
      : req.params.filePath;

    if (!filePath || !filePath.trim()) {
      return res.status(400).json({
        message: "File path is required",
      });
    }

    const content = await getFileContent(owner, repo, filePath);
    res.status(200).json({ content });
  } catch (error) {
    const status =
      error.status === 404 || (error.response && error.response.status === 404)
        ? 404
        : 500;
    res.status(status).json({
      message:
        status === 404
          ? "File not found in the specified repository"
          : "Failed to fetch file content",
      error: error.message,
    });
  }
};

module.exports = {
  getRepository,
  analyzeRepository,
  askRepository,
  getFileContentByPath,
};
