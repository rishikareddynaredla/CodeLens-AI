const axios = require("axios");
const config = require("./configService");

const REQUEST_TIMEOUT = 15000;

const githubHeaders = () => {
  const headers = {
    Accept: "application/vnd.github+json",
  };
  const token = config.getEffectiveGithubToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const getRepoContents = async (owner, repo) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents`,
      {
        timeout: REQUEST_TIMEOUT,
        headers: githubHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch repository contents");
  }
};

// Fetch the full recursive file tree of a repository via the git trees API
// (single request for the entire repo tree).
const getRepoTree = async (owner, repo, branch) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        timeout: REQUEST_TIMEOUT,
        headers: githubHeaders(),
      }
    );

    return response.data.tree || [];
  } catch (error) {
    throw new Error("Failed to fetch repository tree");
  }
};
  const getFileContent = async (
  owner,
  repo,
  filePath
) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        timeout: REQUEST_TIMEOUT,
        // Force raw text: GitHub returns JSON manifests (e.g. package.json)
        // with Content-Type application/json, which would otherwise make
        // axios auto-parse them into objects instead of strings.
        responseType: "text",
        headers: {
          ...githubHeaders(),
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch file: ${filePath}`
    );
  }
};
module.exports = {
  getRepoContents,
  getFileContent,
  getRepoTree,
};
