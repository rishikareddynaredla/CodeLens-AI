const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "..", "..", "config.json");

const DEFAULTS = {
  model: "deepseek/deepseek-chat",
  summariesEnabled: true,
  depsEnabled: true,
};

let cached = null;

const load = () => {
  if (cached) return cached;
  try {
    const onDisk = fs.existsSync(CONFIG_PATH)
      ? JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"))
      : {};
    cached = { ...DEFAULTS, ...onDisk };
  } catch (error) {
    console.warn("Failed to read config.json, using defaults:", error.message);
    cached = { ...DEFAULTS };
  }
  return cached;
};

const getConfig = () => ({ ...load() });

const saveConfig = (updates) => {
  const next = { ...load(), ...updates };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2));
  cached = next;
  return { ...next };
};

// Keys stored in config.json override the .env values. An empty override
// falls back to the environment variable so a blank field means "use .env".
const getEffectiveOpenRouterKey = () =>
  load().openrouterApiKey || process.env.OPENROUTER_API_KEY || "";

const getEffectiveGithubToken = () =>
  load().githubToken || process.env.GITHUB_TOKEN || "";

const maskKey = (value) => {
  if (!value || value.length === 0) return null;
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
};

module.exports = {
  getConfig,
  saveConfig,
  getEffectiveOpenRouterKey,
  getEffectiveGithubToken,
  maskKey,
};