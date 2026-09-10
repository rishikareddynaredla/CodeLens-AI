import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Save, KeyRound, Trash2, Server, RefreshCw } from 'lucide-react';
import { getSettings, updateSettings, clearSessionData } from '../../services/api';

const MODEL_OPTIONS = [
  'deepseek/deepseek-chat',
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-flash-1.5',
];

const sourceLabel = (source) =>
  source === 'config' ? 'from Settings' : source === 'env' ? 'from .env' : 'not set';

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-start justify-between gap-6 py-3 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        {hint && <p className="text-xs text-secondary-text mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
}

export function Settings() {
  const [settings, setSettings] = useState(null);
  const [model, setModel] = useState('');
  const [summariesEnabled, setSummariesEnabled] = useState(true);
  const [depsEnabled, setDepsEnabled] = useState(true);
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);
  const [error, setError] = useState(null);

  const applySettings = (data) => {
    setSettings(data);
    setModel(data.model);
    setSummariesEnabled(data.summariesEnabled);
    setDepsEnabled(data.depsEnabled);
    setOpenrouterApiKey('');
    setGithubToken('');
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      applySettings(data);
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSettings();
        if (!cancelled) applySettings(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      const next = await updateSettings({
        model,
        summariesEnabled,
        depsEnabled,
        openrouterApiKey,
        githubToken,
      });
      setSettings(next);
      setSavedMsg('Settings saved');
      setOpenrouterApiKey('');
      setGithubToken('');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    setError(null);
    try {
      const next = await clearSessionData();
      setSettings((prev) => ({ ...prev, knowledgeBase: next.knowledgeBase }));
      setSavedMsg('Session data cleared');
    } catch (err) {
      setError(err.message || 'Failed to clear session data');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-serif font-bold text-primary mb-2">Settings</h2>
          <p className="text-secondary-text">Loading settings...</p>
        </div>
        <div className="h-40 bg-border/50 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Settings</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button variant="outline" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-primary mb-2">Settings</h2>
          <p className="text-secondary-text">Configure how CodeLens analyzes repositories.</p>
        </div>
        {savedMsg && <span className="text-sm text-green-600">{savedMsg}</span>}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-4 h-4 text-secondary-text" /> Backend status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg bg-primary-bgSecondary p-4">
            <p className="text-secondary-text text-xs mb-1">AI model</p>
            <p className="font-mono text-primary text-xs break-all">{settings.model}</p>
          </div>
          <div className="rounded-lg bg-primary-bgSecondary p-4">
            <p className="text-secondary-text text-xs mb-1">OpenRouter key</p>
            <p className="text-primary text-xs">
              {settings.openRouter.masked ? (
                <>
                  <span className="font-mono">{settings.openRouter.masked}</span>{' '}
                  <span className="text-secondary-text">({sourceLabel(settings.openRouter.source)})</span>
                </>
              ) : (
                <span className="text-amber-600">Not configured</span>
              )}
            </p>
          </div>
          <div className="rounded-lg bg-primary-bgSecondary p-4">
            <p className="text-secondary-text text-xs mb-1">GitHub token</p>
            <p className="text-primary text-xs">
              {settings.github.masked ? (
                <>
                  <span className="font-mono">{settings.github.masked}</span>{' '}
                  <span className="text-secondary-text">({sourceLabel(settings.github.source)})</span>
                </>
              ) : (
                <span className="text-amber-600">Not configured</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Analysis preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="model">
                AI model
              </label>
              <Input
                id="model"
                list="model-options"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="deepseek/deepseek-chat"
                className="bg-white"
              />
              <datalist id="model-options">
                {MODEL_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <p className="text-xs text-secondary-text mt-1.5">
                Any OpenRouter model slug. Applied on the next analysis and chat reply.
              </p>
            </div>

            <div className="divide-y divide-border">
              <Toggle
                checked={summariesEnabled}
                onChange={setSummariesEnabled}
                label="File summaries"
                hint="Identify and summarize the most important files (slower analysis)."
              />
              <Toggle
                checked={depsEnabled}
                onChange={setDepsEnabled}
                label="Dependency analysis"
                hint="Parse manifest files and report dependencies, package manager, and dev script."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-secondary-text" /> API credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="or-key">
                OpenRouter API key
              </label>
              <Input
                id="or-key"
                type="password"
                autoComplete="new-password"
                value={openrouterApiKey}
                onChange={(e) => setOpenrouterApiKey(e.target.value)}
                placeholder={
                  settings.openRouter.masked
                    ? `Current: ${settings.openRouter.masked} (${sourceLabel(settings.openRouter.source)})`
                    : 'sk-or-v1-...'
                }
                className="bg-white"
              />
              <p className="text-xs text-secondary-text mt-1.5">
                Leave blank to keep the current key. Cleared field falls back to the .env value.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1.5" htmlFor="gh-token">
                GitHub token
              </label>
              <Input
                id="gh-token"
                type="password"
                autoComplete="new-password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder={
                  settings.github.masked
                    ? `Current: ${settings.github.masked} (${sourceLabel(settings.github.source)})`
                    : 'ghp_...'
                }
                className="bg-white"
              />
              <p className="text-xs text-secondary-text mt-1.5">
                Optional. Avoids GitHub rate limits during analysis.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={saving}>
                <Save className="w-4 h-4 mr-2" /> Save settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-secondary-text" /> Session data
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-6">
          <p className="text-sm text-secondary-text">
            {settings.knowledgeBase.present
              ? `An analysis knowledge base is loaded (${settings.knowledgeBase.size} chars). Chat answers use it.`
              : 'No analysis knowledge base is loaded yet. Analyze a repository to enable chat.'}
          </p>
          <Button variant="outline" onClick={handleClear} isLoading={clearing} disabled={!settings.knowledgeBase.present}>
            Clear session data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}