import React, { useState } from 'react';
import { Heading } from '../core/typography/Heading';
import { Text } from '../core/typography/Text';
import DropZone from '../DropZone';
import { KnowledgeItem, CompanyInfo } from '../../../types';
import { WebsiteImport } from './WebsiteImport';
import { KnowledgeList } from './KnowledgeList';
import { PastedTextForm } from './PastedTextForm';
import { needsImportRecovery } from '../../lib/importRecovery';
import { KNOWLEDGE_STEP_HELP } from '../../lib/builderCopy';

interface KnowledgeStepProps {
  knowledge: KnowledgeItem[];
  onAddKnowledge: (items: KnowledgeItem[]) => void;
  onUpdateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  onRemoveKnowledge: (id: string) => void;
  companyInfo: CompanyInfo;
  isCrawling: boolean;
  crawlProgress: number;
  onPerformCrawl: (url: string) => Promise<void>;
}

export const KnowledgeStep: React.FC<KnowledgeStepProps> = ({
  knowledge,
  onAddKnowledge,
  onRemoveKnowledge,
  companyInfo,
  isCrawling,
  crawlProgress,
  onPerformCrawl,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const importFailed = needsImportRecovery(knowledge);

  const handleCrawl = () => {
    if (!urlInput) return;
    onPerformCrawl(urlInput);
    setUrlInput('');
  };

  const handleRetry = (id: string, url: string) => {
    onRemoveKnowledge(id);
    void onPerformCrawl(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <Heading level={2}>Add your knowledge</Heading>
        <Text variant="muted" className="mt-2">{KNOWLEDGE_STEP_HELP}</Text>
      </div>
      
      <WebsiteImport 
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        isCrawling={isCrawling}
        crawlProgress={crawlProgress}
        companyInfo={companyInfo}
        onImport={handleCrawl}
      />

      {importFailed && (
        <div role="status" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Website import failed. Paste text or upload a .txt or .md file instead of continuing with an empty import.
        </div>
      )}

      <DropZone onFilesAdded={onAddKnowledge} compact />

      <PastedTextForm onAdd={(item) => onAddKnowledge([item])} />

      <KnowledgeList
        items={knowledge}
        onRemove={onRemoveKnowledge}
        onRetry={handleRetry}
        retryDisabled={isCrawling}
      />
    </div>
  );
};
