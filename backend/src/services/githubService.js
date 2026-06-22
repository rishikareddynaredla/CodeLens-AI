const axios = require("axios");

const getRepoContents = async (owner, repo) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents`
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch repository contents");
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
        headers: {
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
};