import React, { useState } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { Card, CardContent } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Search, FileText } from 'lucide-react';

export function FileSummaries() {
  const { analysisData } = useAnalysis();
  const [search, setSearch] = useState('');
  const files = analysisData?.files || [];

  const filteredFiles = files.filter(f => 
    f.path.toLowerCase().includes(search.toLowerCase()) || 
    f.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">File Summaries</h2>
        <p className="text-secondary-text">AI-generated explanations for individual files.</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
        <Input 
          placeholder="Search files or summaries..." 
          className="pl-9 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredFiles.map((file, i) => (
          <Card key={i} className="bg-white">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-10 h-10 rounded bg-border/50 flex items-center justify-center shrink-0 mt-1">
                <FileText className="w-5 h-5 text-secondary-text" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-mono font-semibold text-primary truncate text-sm bg-primary-bgSecondary px-2 py-1 rounded inline-block mb-3">
                  {file.path}
                </h4>
                <p className="text-secondary-text leading-relaxed">
                  {file.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredFiles.length === 0 && (
          <div className="text-center py-12 text-secondary-text">
            No files found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
