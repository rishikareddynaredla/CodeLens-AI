const configService = require("../services/configService");
const repoStore = require("../store/repoStore");

// Build the sanitized settings shape returned to the client. API keys are
// masked and their origin (overridden in config.json vs. set via .env) is
// surfaced so the UI never receives a full secret.
const serialize = () => {
  const config = configService.getConfig();
  const orKey = configService.getEffectiveOpenRouterKey();
  const ghToken = configService.getEffectiveGithubToken();

  return {
    model: config.model,
    summariesEnabled: config.summariesEnabled,
    depsEnabled: config.depsEnabled,
    openRouter: {
      source: config.openrouterApiKey
        ? "config"
        : process.env.OPENROUTER_API_KEY
        ? "env"
        : "none",
      masked: configService.maskKey(orKey),
    },
    github: {
      source: config.githubToken
        ? "config"
        : process.env.GITHUB_TOKEN
        ? "env"
        : "none",
      masked: configService.maskKey(ghToken),
    },
    knowledgeBase: {
      present: repoStore.hasRepositoryKnowledge(),
      size: repoStore.getRepositoryKnowledgeSize(),
    },
  };
};

const getSettings = async (req, res) => {
  try {
    res.status(200).json(serialize());
  } catch (error) {
    res.status(500).json({
      message: "Failed to load settings",
      error: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      model,
      summariesEnabled,
      depsEnabled,
      openrouterApiKey,
      githubToken,
    } = req.body || {};

    const updates = {};
    if (typeof model === "string" && model.trim()) {
      updates.model = model.trim();
    }
    if (typeof summariesEnabled === "boolean") {
      updates.summariesEnabled = summariesEnabled;
    }
    if (typeof depsEnabled === "boolean") {
      updates.depsEnabled = depsEnabled;
    }
    if (typeof openrouterApiKey === "string") {
      updates.openrouterApiKey = openrouterApiKey.trim();
    }
    if (typeof githubToken === "string") {
      updates.githubToken = githubToken.trim();
    }

    if (Object.keys(updates).length > 0) {
      configService.saveConfig(updates);
    }

    res.status(200).json(serialize());
  } catch (error) {
    res.status(500).json({
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

const clearSession = async (req, res) => {
  try {
    const cleared = repoStore.clearRepositoryKnowledge();
    res.status(200).json({
      cleared,
      knowledgeBase: { present: false, size: 0 },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear session data",
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  clearSession,
};