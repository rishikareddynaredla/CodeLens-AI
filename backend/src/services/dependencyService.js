const { getFileContent } = require("./githubService");

// Manifest files to inspect, in order of likelihood.
// package.json may live in sub-folders for monorepos.
const MANIFEST_PATHS = [
  "package.json",
  "frontend/package.json",
  "backend/package.json",
  "client/package.json",
  "server/package.json",
  "composer.json",
  "requirements.txt",
  "go.mod",
  "Cargo.toml",
  "Gemfile",
  "Pipfile",
  "pyproject.toml",
];

const parsePackageJson = (content) => {
  const data = JSON.parse(content);
  const deps = [];
  for (const [name, version] of Object.entries(data.dependencies || {})) {
    deps.push({ name, version, type: "core" });
  }
  for (const [name, version] of Object.entries(data.devDependencies || {})) {
    deps.push({ name, version, type: "dev" });
  }
  return deps;
};

const parseComposerJson = (content) => {
  const data = JSON.parse(content);
  const deps = [];
  for (const [name, version] of Object.entries(data.require || {})) {
    deps.push({ name, version, type: "core" });
  }
  for (const [name, version] of Object.entries(data["require-dev"] || {})) {
    deps.push({ name, version, type: "dev" });
  }
  return deps;
};

const parseRequirementsTxt = (content) => {
  const deps = [];
  for (const rawLine of content.split("\n")) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;
    const match = line.match(
      /^([A-Za-z0-9_.-]+)\s*(==|>=|<=|~=|!=|<|>)?\s*(.*)$/
    );
    if (!match) continue;
    const [, name, op, versionPart] = match;
    const version = (op && versionPart && versionPart.trim()) || "latest";
    deps.push({ name, version, type: "core" });
  }
  return deps;
};

const parseGoMod = (content) => {
  const deps = [];
  let inRequireBlock = false;
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line === "require (") {
      inRequireBlock = true;
      continue;
    }
    if (inRequireBlock && line === ")") {
      inRequireBlock = false;
      continue;
    }
    if (inRequireBlock && line) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        deps.push({ name: parts[0], version: parts[1], type: "core" });
      }
    } else if (line.startsWith("require ") && !line.startsWith("require (")) {
      const parts = line.replace("require ", "").split(/\s+/);
      if (parts.length >= 2) {
        deps.push({ name: parts[0], version: parts[1], type: "core" });
      }
    }
  }
  return deps;
};

const parseCargoToml = (content) => {
  const deps = [];
  let section = null;
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("[") && line.endsWith("]")) {
      section = line;
      continue;
    }
    const depMatch = line.match(
      /^([A-Za-z0-9_-]+)\s*=\s*(?:"([^"]+)"|version\s*=\s*"([^"]+)")/
    );
    if (!depMatch) continue;
    const version = depMatch[2] || depMatch[3] || "latest";
    if (section === "[dependencies]") {
      deps.push({ name: depMatch[1], version, type: "core" });
    } else if (section === "[dev-dependencies]") {
      deps.push({ name: depMatch[1], version, type: "dev" });
    }
  }
  return deps;
};

const parseGemfile = (content) => {
  const deps = [];
  let group = "core";
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    const groupMatch = line.match(/^group\s*:([A-Za-z0-9_]+)/);
    if (groupMatch) {
      group =
        groupMatch[1] === "development" || groupMatch[1] === "test"
          ? "dev"
          : "core";
      continue;
    }
    const gemMatch = line.match(
      /^gem\s+["']([^"']+)["']\s*(?:,\s*["']([^"']+)["'])?/
    );
    if (gemMatch) {
      deps.push({
        name: gemMatch[1],
        version: gemMatch[2] || "latest",
        type: group,
      });
    }
  }
  return deps;
};

const parsePipfile = (content) => {
  const deps = [];
  let section = null;
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("[") && line.endsWith("]")) {
      section = line.replace(/[\[\]]/g, "").toLowerCase();
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*["']([^"']*)["']/);
    if (!match) continue;
    if (section === "packages" || section === "dev-packages") {
      deps.push({
        name: match[1],
        version: match[2] || "latest",
        type: section === "dev-packages" ? "dev" : "core",
      });
    }
  }
  return deps;
};

const parsePyprojectToml = (content) => {
  const deps = [];
  const listLines = [];
  let capturing = false;
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (/^dependencies\s*=\s*\[/.test(line)) {
      capturing = true;
      const rest = line.replace(/^.*\[/, "");
      if (rest) listLines.push(rest);
      continue;
    }
    if (capturing) {
      if (line.startsWith("]")) {
        capturing = false;
        continue;
      }
      if (line) listLines.push(line);
    }
  }
  for (const rawLine of listLines) {
    const entry = rawLine
      .replace(/,$/, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    if (!entry) continue;
    const match = entry.match(
      /^([A-Za-z0-9_.-]+)\s*(?:\[[^\]]*\])?\s*(?:==|>=|<=|~=|!=|<|>)\s*([\w.\-*,]+)/
    );
    if (match) {
      deps.push({ name: match[1], version: match[2], type: "core" });
    }
  }
  return deps;
};

const PARSERS = {
  "package.json": parsePackageJson,
  "composer.json": parseComposerJson,
  "requirements.txt": parseRequirementsTxt,
  "go.mod": parseGoMod,
  "Cargo.toml": parseCargoToml,
  "Gemfile": parseGemfile,
  "Pipfile": parsePipfile,
  "pyproject.toml": parsePyprojectToml,
};

const getParserForPath = (path) => {
  const base = path.split("/").pop();
  return PARSERS[base];
};

// Detect the package manager from the manifest files actually found
// in the repository, so setup commands reflect real repo data.
const detectPackageManager = (manifests) => {
  if (manifests.some((m) => m === "package.json" || m.endsWith("/package.json"))) {
    return "npm";
  }
  if (manifests.some((m) => ["requirements.txt", "pyproject.toml", "Pipfile"].includes(m))) {
    return "pip";
  }
  if (manifests.includes("go.mod")) return "go";
  if (manifests.includes("Gemfile")) return "bundler";
  if (manifests.includes("Cargo.toml")) return "cargo";
  if (manifests.includes("composer.json")) return "composer";
  return null;
};

// Extract the dev (or start) script name from a package.json manifest so the
// frontend can show the repository's real run command.
const extractDevScript = (content) => {
  try {
    const data = JSON.parse(content);
    const scripts = data.scripts || {};
    return scripts.dev || scripts.start || scripts["dev:start"] || null;
  } catch (error) {
    return null;
  }
};

// Fetch the dependency manifests of a repository and parse them into
// a flat list of { name, version, type } entries. Missing manifests and
// unparseable files are skipped silently.
const getDependencies = async (owner, repo) => {
  const found = [];
  const manifests = [];
  const seen = new Set();
  let devScript = null;

  for (const path of MANIFEST_PATHS) {
    let content;
    try {
      content = await getFileContent(owner, repo, path);
    } catch (error) {
      continue;
    }

    manifests.push(path);

    if (path === "package.json" || path.endsWith("/package.json")) {
      devScript = devScript || extractDevScript(content);
    }

    const parse = getParserForPath(path);
    if (!parse) continue;

    let deps = [];
    try {
      deps = parse(content) || [];
    } catch (error) {
      console.log(`Skipping unparseable manifest: ${path}`);
      continue;
    }

    for (const dep of deps) {
      const key = `${dep.name}@${dep.version}@${dep.type}`;
      if (seen.has(key)) continue;
      seen.add(key);
      found.push(dep);
    }
  }

  return {
    dependencies: found,
    manifests,
    packageManager: detectPackageManager(manifests),
    devScript,
  };
};

module.exports = {
  getDependencies,
};