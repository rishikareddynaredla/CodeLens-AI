import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Terminal, Download, Book, Rocket, ExternalLink, Info } from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';

// Setup commands derived from the manifest actually detected in the
// repository. `run` is only ever returned when the manifest declares a real
// dev/start script (npm); for other managers no run command is guessed.
const getSetupCommands = (packageManager, devScript, manifests) => {
  switch (packageManager) {
    case "npm":
      return {
        install: "npm install",
        run: devScript ? `npm run ${devScript}` : null,
      };
    case "pip":
      return {
        install: manifests.some((m) => m.endsWith("Pipfile"))
          ? "pipenv install"
          : manifests.some((m) => m.endsWith("requirements.txt"))
          ? "pip install -r requirements.txt"
          : "pip install -e .",
        run: null,
      };
    case "go":
      return { install: "go mod download", run: null };
    case "bundler":
      return { install: "bundle install", run: null };
    case "cargo":
      return { install: "cargo build", run: null };
    case "composer":
      return { install: "composer install", run: null };
    default:
      return null;
  }
};

export function Onboarding() {
  const { analysisData } = useAnalysis();
  const repo = analysisData?.repo;
  const language = repo?.language || "Unknown";
  const packageManager = analysisData?.packageManager;
  const manifests = analysisData?.manifests || [];
  const commands = getSetupCommands(packageManager, analysisData?.devScript, manifests);
  const importantFiles = analysisData?.files || [];

  const repoUrl = repo?.url || "https://github.com/...";
  const repoName = repo?.name || "repo-name";
  const contributeUrl = repo?.owner
    ? `https://github.com/${repo.owner}/${repo.name}/contribute`
    : repoUrl;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Developer Onboarding</h2>
        <p className="text-secondary-text">
          Setup guide for <span className="font-mono text-primary">{repoName}</span> ({language}
          {packageManager ? ` · ${packageManager}` : ""}).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-accent" />
              1. Local Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commands ? (
              <>
                <div className="bg-primary-bg p-4 rounded-lg font-mono text-sm text-primary mb-4 space-y-2">
                  <p>git clone {repoUrl}</p>
                  <p>cd {repoName}</p>
                  <p>{commands.install}</p>
                </div>
                <p className="text-secondary-text text-sm">
                  Make sure you have the required toolchain installed before running these commands.
                </p>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p className="text-secondary-text text-sm">
                  No dependency manifest (package.json, requirements.txt, go.mod, etc.) was detected
                  in this repository. Check its README for the exact setup steps.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              2. Running Locally
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commands && commands.run ? (
              <>
                <div className="bg-primary-bg p-4 rounded-lg font-mono text-sm text-primary mb-4">
                  {commands.run}
                </div>
                <p className="text-secondary-text text-sm">
                  This is the dev command declared in the repository's manifest ({packageManager}.
                  scripts) and will start the development server on localhost. Check the README
                  for exact ports and any additional environment setup.
                </p>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-secondary-text text-sm">
                  {commands
                    ? "A run command can only be derived reliably when the manifest declares one (e.g. npm scripts). This project doesn't expose one, so check the README for how to start the development server."
                    : "The run command depends on the project's tooling. Refer to the repository README for how to start the development server."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5 text-secondary-text" />
              Important Files to Know
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importantFiles.length > 0 ? (
              <ul className="space-y-4">
                {importantFiles.map((file, i) => (
                  <li
                    key={`${file.path}-${i}`}
                    className="flex gap-4 pb-4 border-b border-border/50 last:border-b-0 last:pb-0"
                  >
                    <span className="font-mono text-sm bg-primary-bgSecondary px-2 py-1 rounded self-start shrink-0">
                      {file.path}
                    </span>
                    <span className="text-secondary-text">{file.summary}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary-text text-sm">
                No important files could be identified for this repository. Try re-running the
                analysis.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary text-white md:col-span-2 shadow-xl border-none">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-2">Ready to contribute?</h3>
              <p className="text-white/70">
                Browse good first issues at{" "}
                <a
                  href={contributeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  GitHub
                </a>{" "}
                and submit your first pull request.
              </p>
            </div>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 shrink-0"
            >
              <Rocket className="w-5 h-5" />
              Start Building
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}