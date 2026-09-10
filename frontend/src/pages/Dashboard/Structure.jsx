import React, { useMemo, useState } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { Card, CardContent } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { File, Folder, ChevronRight, ChevronDown, Search, GitBranch } from 'lucide-react';

// Build a nested tree from the flat list of paths returned by the backend.
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

const FileNode = ({ node }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDir = node.type === 'dir';

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-3 rounded hover:bg-border/30 cursor-pointer group transition-colors"
        onClick={() => isDir && setIsOpen(!isOpen)}
      >
        <span className="w-4 h-4 flex items-center justify-center text-secondary-text shrink-0">
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
          <File className="w-4 h-4 text-secondary-text shrink-0" />
        )}
        <span className={`font-mono text-sm truncate ${isDir ? 'font-medium text-primary' : 'text-secondary-text group-hover:text-primary transition-colors'}`}>
          {node.name}
        </span>
      </div>

      {(isDir && isOpen && node.children.length > 0) && (
        <div className="ml-5 border-l border-border">
          {node.children.map((child) => (
            <FileNode key={child.path} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export function Structure() {
  const { analysisData } = useAnalysis();
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Repository Structure</h2>
        <p className="text-secondary-text">
          Full directory and file tree of the repository ({totalItems} items).
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
        <Input
          placeholder="Search files or folders..."
          className="pl-9 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="bg-white">
        <CardContent className="p-4">
          {tree.length > 0 && !search.trim() && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-secondary-text mb-1">
              <GitBranch className="w-3.5 h-3.5" />
              Click folders to expand
            </div>
          )}
          <div className="space-y-1">
            {tree.map((node) => (
              <FileNode key={node.path} node={node} />
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
  );
}