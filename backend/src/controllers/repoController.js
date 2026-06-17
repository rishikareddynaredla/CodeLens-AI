const axios = require("axios");
const { summarizeReadme } = require("../services/aiService");
// GET /api/repo/:owner/:repo
const getRepository = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Fetch repository data
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    const repoData = response.data;

    // Fetch README
    const readmeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
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
      summary,
      //readme: readmeContent,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch repository",
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

    // Extract owner and repo from GitHub URL
    const parts = repoUrl.split("/");

    const owner = parts[3];
    const repo = parts[4];

    // Fetch repository data
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    const repoData = response.data;

    // Fetch README
    const readmeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
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
      summary,
      //readme: readmeContent,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to analyze repository",
      error: error.message,
    });
  }
};

module.exports = {
  getRepository,
  analyzeRepository,
};