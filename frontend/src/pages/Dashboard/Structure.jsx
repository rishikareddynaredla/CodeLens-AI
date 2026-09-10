import React, { useMemo, useState, useEffect } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { Card, CardContent } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import {
  File, Folder, ChevronRight, ChevronDown, Search, GitBranch,
  Copy, Check, FileCode, AlertCircle,
} from 'lucide-react';
import { getFileContents } from '../../services/api';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';

const LANG_MAP = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript', mts: 'typescript',
  py: 'python', pyw: 'python', pyi: 'python',
  go: 'go',
  rs: 'rust',
  java: 'java',
  c: 'c', h: 'c',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin', kts: 'kotlin',
  css: 'css', scss: 'css', less: 'css',
  json: 'json',
  yaml: 'yaml', yml: 'yaml',
  xml: 'xml',
  html: 'xml', htm: 'xml', vue: 'xml', svelte: 'xml',
  md: 'markdown', mdx: 'markdown',
  sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'bash',
  sql: 'sql',
  dockerfile: 'dockerfile',
  makefile: 'makefile',
  toml: 'ini', ini: 'ini', cfg: 'ini', conf: 'ini',
  graphql: 'graphql', gql: 'graphql',
  diff: 'diff',
  r: 'r', R: 'r',
  scala: 'scala',
  dart: 'dart',
  lua: 'lua',
  ex: 'elixir', exs: 'elixir',
  hs: 'haskell',
  clj: 'clojure', cljs: 'clojure',
};

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'bmp', 'webp', 'tiff', 'avif',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar',
  'exe', 'dll', 'so', 'dylib', 'o', 'a', 'lib',
  'bin', 'dat', 'db', 'sqlite', 'sqlite3',
  'mp3', 'mp4', 'wav', 'avi', 'mov', 'mkv', 'flv', 'webm', 'ogg',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'svg',
  'lock',
  'sum', 'map',
]);

function detectLanguage(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  return LANG_MAP[ext] || null;
}

function isBinaryFile(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  return BINARY_EXTENSIONS.has(ext);
}

const buildTree = (entries) => {
  const nodeMap = new Map();
  const root = [];

  for (const { path, type } of entries) {
    const parts = path.split('/');
    let currentPath = '';
    let parentNode = null;

    for (let i = 0; i < parts.length; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      let node = nodeMap.get(currentPath);

      if (!node) {
        const isDir =
          (type === 'dir' && i === parts.length - 1) || i < parts.length - 1;
        node = {
          name: parts[i],
          path: currentPath,
          type: isDir ? 'dir' : 'file',
          children: [],
        };
        nodeMap.set(currentPath, node);

        if (parentNode) parentNode.children.push(node);
        else root.push(node);
      }

      parentNode = node;
    }
  }

  return root;
};

const FileNode = ({ node, selectedFile, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDir = node.type === 'dir';
  const isSelected = !isDir && node.path === selectedFile;

  const handleClick = () => {
    if (isDir) {
      setIsOpen(!isOpen);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-3 rounded cursor-pointer group transition-colors ${
          isSelected
            ? 'bg-accent/10 text-accent font-medium'
            : 'hover:bg-border/30 text-secondary-text hover:text-primary'
        }`}
        onClick={handleClick}
      >
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {isDir ? (
            isOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )
          ) : null}
        </span>
        {isDir ? (
          <Folder className="w-4 h-4 text-accent shrink-0" />
        ) : (
          <File className="w-4 h-4 shrink-0" />
        )}
        <span className={`font-mono text-sm truncate ${isDir ? 'font-medium' : ''}`}>
          {node.name}
        </span>
      </div>

      {isDir && isOpen && node.children.length > 0 && (
        <div className="ml-5 border-l border-border">
          {node.children.map((child) => (
            <FileNode
              key={child.path}
              node={child}
              selectedFile={selectedFile}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function highlightCode(code, language) {
  try {
    if (language) return hljs.highlight(code, { language }).value;
    return hljs.highlightAuto(code).value;
  } catch {
    return null;
  }
}

function CodeViewer({ owner, repo, filePath }) {
  const [result, setResult] = useState({ path: null, status: 'idle', content: null, error: null });
  const [copiedPath, setCopiedPath] = useState(null);

  useEffect(() => {
    if (!filePath) return;
    if (isBinaryFile(filePath)) return;

    let cancelled = false;

    getFileContents(owner, repo, filePath)
      .then((data) => {
        if (!cancelled) {
          setResult({ path: filePath, status: 'done', content: data.content || '', error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ path: filePath, status: 'done', content: null, error: err.message || 'Failed to load file' });
        }
      });

    return () => { cancelled = true; };
  }, [owner, repo, filePath]);

  if (!filePath) {
    return (
      <Card className="bg-white h-full flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="text-center text-secondary-text">
          <FileCode className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Select a file to view its contents</p>
          <p className="text-sm mt-1">Click any file in the explorer panel</p>
        </div>
      </Card>
    );
  }

  if (isBinaryFile(filePath)) {
    return (
      <Card className="bg-white overflow-hidden" style={{ minHeight: 400 }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <FileCode className="w-4 h-4 text-secondary-text shrink-0" />
          <span className="font-mono text-sm text-primary truncate">{filePath}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-secondary-text">
          <AlertCircle className="w-10 h-10 mb-4 opacity-40" />
          <p className="text-sm font-medium">Binary or unsupported file type</p>
        </div>
      </Card>
    );
  }

  const isLoading = result.path !== filePath || result.status !== 'done';

  if (isLoading) {
    return (
      <Card className="bg-white overflow-hidden" style={{ minHeight: 400 }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <FileCode className="w-4 h-4 text-secondary-text shrink-0" />
          <span className="font-mono text-sm text-primary truncate">{filePath}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-secondary-text">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm">Loading file contents...</p>
        </div>
      </Card>
    );
  }

  if (result.error) {
    return (
      <Card className="bg-white overflow-hidden" style={{ minHeight: 400 }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <FileCode className="w-4 h-4 text-secondary-text shrink-0" />
          <span className="font-mono text-sm text-primary truncate">{filePath}</span>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-secondary-text">
          <AlertCircle className="w-10 h-10 mb-4 opacity-40" />
          <p className="text-sm font-medium">{result.error}</p>
          <p className="text-xs mt-2 opacity-70">
            The backend does not yet expose a file content endpoint.
          </p>
        </div>
      </Card>
    );
  }

  const language = detectLanguage(filePath);
  const highlighted = result.content ? highlightCode(result.content, language) : null;
  const lines = (result.content || '').split('\n');
  const justCopied = copiedPath === filePath;

  const handleCopy = () => {
    if (result.content) {
      navigator.clipboard.writeText(result.content);
      setCopiedPath(filePath);
      setTimeout(() => setCopiedPath(null), 2000);
    }
  };

  return (
    <Card className="bg-white overflow-hidden" style={{ minHeight: 400 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-4 h-4 text-secondary-text shrink-0" />
          <span className="font-mono text-sm text-primary truncate">{filePath}</span>
          {language && (
            <span className="text-xs text-secondary-text bg-primary-bgSecondary px-2 py-0.5 rounded shrink-0">
              {language}
            </span>
          )}
        </div>
        {result.content && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-secondary-text hover:text-primary transition-colors shrink-0 ml-4"
          >
            {justCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-success">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
        <div className="font-mono text-sm leading-relaxed">
          <table className="w-full border-collapse">
            <tbody>
              {(highlighted ? highlighted.split('\n') : lines).map((line, i) => (
                <tr key={i} className="hover:bg-border/20">
                  <td className="text-right pr-4 pl-4 py-0 select-none text-secondary-text/50 text-xs w-12 align-top border-r border-border/50">
                    {i + 1}
                  </td>
                  <td className="px-4 py-0 whitespace-pre">
                    {highlighted ? (
                      <span dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                    ) : (
                      <span>{line || '\u00A0'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

export function Structure() {
  const { analysisData } = useAnalysis();
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const tree = useMemo(() => {
    const entries = analysisData?.tree || [];
    if (!search.trim()) return buildTree(entries);

    const needles = search.toLowerCase();
    const filtered = entries.filter(({ path }) =>
      path.toLowerCase().includes(needles)
    );
    return buildTree(filtered);
  }, [analysisData?.tree, search]);

  const totalItems = (analysisData?.tree || []).length;
  const owner = analysisData?.repo?.owner;
  const name = analysisData?.repo?.name;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Repository Explorer</h2>
        <p className="text-secondary-text">
          Browse the source tree and view file contents ({totalItems} items).
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6" style={{ minHeight: 'calc(100vh - 16rem)' }}>
        <div className="w-full lg:w-80 shrink-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
            <Input
              placeholder="Search files or folders..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Card className="bg-white">
            <CardContent className="p-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
              {tree.length > 0 && !search.trim() && (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-secondary-text mb-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  Click folders to expand
                </div>
              )}
              <div className="space-y-1">
                {tree.map((node) => (
                  <FileNode
                    key={node.path}
                    node={node}
                    selectedFile={selectedFile}
                    onSelect={setSelectedFile}
                  />
                ))}
                {tree.length === 0 && (
                  <div className="text-secondary-text text-sm p-4 text-center">
                    No matching files or folders found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 min-w-0">
          <CodeViewer owner={owner} repo={name} filePath={selectedFile} />
        </div>
      </div>
    </div>
  );
}
