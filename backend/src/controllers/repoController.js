const axios = require("axios");

const getRepository = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    console.log("Params:", req.params);

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    const repoData = response.data;
    console.log("GitHub owner login:", repoData.owner.login);
    console.log("GitHub repo full name:", repoData.full_name);
    res.status(200).json({
      name: repoData.name,
      owner: repoData.owner.login,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      language: repoData.language,
      url: repoData.html_url,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch repository",
      error: error.message,
    });
  }
};

module.exports = {
  getRepository,
};