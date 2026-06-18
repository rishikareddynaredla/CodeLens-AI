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

module.exports = {
  getRepoContents,
};