import React, { useMemo, useState } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { Card, CardContent } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Search, FileText, Sparkles } from 'lucide-react';

export function FileSummaries() {
  const { analysisData } = useAnalysis();
  const [search, setSearch] = useState('');

  // Build a list of every file in the repository (from the full tree), tagging
  // each with its AI summary when one was generated. Files the AI did not
  // summarize are still shown and searchable.
  const allFiles = useMemo(() => {
    const summaries = analysisData?.files || [];
    const tree = analysisData?.tree || [];

    const summaryMap = new Map();
    for (const s of summaries) summaryMap.set(s.path, s.summary);

    const treeFiles = tree
      .filter((entry) => entry.type === 'file')
      .map((entry) => ({
        path: entry.path,
        summary: summaryMap.get(entry.path) || null,
      }));

    // Include AI summaries whose path is missing from the tree (e.g. if the
    // tree fetch failed) so no summary is ever lost.
    const treePaths = new Set(treeFiles.map((f) => f.path));
    const orphanSummaries = summaries
      .filter((s) => !treePaths.has(s.path))
      .map((s) => ({ path: s.path, summary: s.summary }));

    return [...treeFiles, ...orphanSummaries];
  }, [analysisData]);

  const filteredFiles = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allFiles;
    return allFiles.filter(
      (f) =>
        f.path.toLowerCase().includes(q) ||
        (f.summary && f.summary.toLowerCase().includes(q))
    );
  }, [allFiles, search]);

  const summarizedCount = allFiles.filter((f) => f.summary).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">File Summaries</h2>
        <p className="text-secondary-text">
          {allFiles.length} files in the repository
          {summarizedCount > 0 ? ` — ${summarizedCount} have AI summaries` : ''}.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
        <Input
          placeholder="Search files or summaries across the whole repo..."
          className="pl-9 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredFiles.map((file, i) => (
          <Card key={`${file.path}-${i}`} className="bg-white">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-10 h-10 rounded bg-border/50 flex items-center justify-center shrink-0 mt-1">
                <FileText className="w-5 h-5 text-secondary-text" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-mono font-semibold text-primary truncate text-sm bg-primary-bgSecondary px-2 py-1 rounded inline-block mb-3">
                  {file.path}
                </h4>
                {file.summary ? (
                  <p className="text-secondary-text leading-relaxed">{file.summary}</p>
                ) : (
                  <div className="flex items-center gap-2 text-secondary-text/60 text-sm">
                    <Sparkles className="w-4 h-4" />
                    No AI summary generated for this file. Selected important files get summarized.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {allFiles.length === 0 ? (
          <div className="text-center py-12 text-secondary-text">
            No files are available for this repository. Run a fresh analysis to generate them.
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-secondary-text">
            No files found matching "{search}".
          </div>
        ) : null}
      </div>
    </div>
  );
}