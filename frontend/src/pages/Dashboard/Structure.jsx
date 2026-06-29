import React, { useState } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { Card, CardContent } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { File, Folder, ChevronRight, ChevronDown, Search } from 'lucide-react';

const FileNode = ({ name, type, children, summary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDir = type === 'dir';

  return (
    <div className="ml-4 font-mono text-sm">
      <div 
        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-border/30 cursor-pointer group transition-colors"
        onClick={() => isDir && setIsOpen(!isOpen)}
      >
        <span className="w-4 h-4 flex items-center justify-center text-secondary-text shrink-0">
          {isDir ? (isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />) : null}
        </span>
        {isDir ? <Folder className="w-4 h-4 text-accent" /> : <File className="w-4 h-4 text-secondary-text" />}
        <span className={isDir ? "font-medium text-primary" : "text-secondary-text group-hover:text-primary transition-colors"}>
          {name}
        </span>
        {summary && !isDir && (
          <span className="ml-4 text-xs text-secondary-text/50 hidden group-hover:block truncate max-w-sm">
            - {summary}
          </span>
        )}
      </div>
      {isDir && isOpen && children && (
        <div className="border-l border-border ml-2 pl-2 mt-1">
          {children.map((child, i) => (
            <FileNode key={i} {...child} />
          ))}
        </div>
      )}
    </div>
  );
};

export function Structure() {
  const { analysisData } = useAnalysis();
  const [search, setSearch] = useState('');

  const folders = analysisData?.structure?.folders || [];
  const files = analysisData?.structure?.files || [];

  const filteredFolders = folders.filter(f => f.toLowerCase().includes(search.toLowerCase()));
  const filteredFiles = files.filter(f => f.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Repository Structure</h2>
        <p className="text-secondary-text">Overview of directories and files in the repository.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
        <Input 
          placeholder="Search items..." 
          className="pl-9 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="space-y-2">
            {filteredFolders.map((folder, i) => (
              <div key={`dir-${i}`} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-border/30 font-mono text-sm group">
                <Folder className="w-4 h-4 text-accent shrink-0" />
                <span className="text-primary font-medium">{folder}</span>
              </div>
            ))}
            {filteredFiles.map((file, i) => (
              <div key={`file-${i}`} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-border/30 font-mono text-sm group">
                <File className="w-4 h-4 text-secondary-text shrink-0" />
                <span className="text-secondary-text group-hover:text-primary transition-colors">{file}</span>
              </div>
            ))}
            {filteredFolders.length === 0 && filteredFiles.length === 0 && (
              <div className="text-secondary-text text-sm p-4 text-center">No matching files or folders found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
