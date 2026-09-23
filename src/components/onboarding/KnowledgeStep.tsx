import React, { useState } from 'react';
import { Heading } from '../core/typography/Heading';
import { Text } from '../core/typography/Text';
import DropZone from '../DropZone';
import { KnowledgeItem, CompanyInfo } from '../../../types';
import { WebsiteImport } from './WebsiteImport';
import { KnowledgeList } from './KnowledgeList';
import { PastedTextForm } from './PastedTextForm';

interface KnowledgeStepProps {
  knowledge: KnowledgeItem[];
  onAddKnowledge: (items: KnowledgeItem[]) => void;
  onUpdateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  companyInfo: CompanyInfo;
  isCrawling: boolean;
  crawlProgress: number;
  onPerformCrawl: (url: string) => Promise<void>;
}

export const KnowledgeStep: React.FC<KnowledgeStepProps> = ({
  knowledge,
  onAddKnowledge,
  companyInfo,
  isCrawling,
  crawlProgress,
  onPerformCrawl,
}) => {
  const [urlInput, setUrlInput] = useState('');

  const handleCrawl = () => {
    if (!urlInput) return;
    onPerformCrawl(urlInput);
    setUrlInput('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <Heading level={2}>Add your knowledge</Heading>
        <Text variant="muted" className="mt-2">Upload files, import a site, or paste text. The more you add, the smarter it gets.</Text>
      </div>
      
      <WebsiteImport 
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        isCrawling={isCrawling}
        crawlProgress={crawlProgress}
        companyInfo={companyInfo}
        onImport={handleCrawl}
      />

      <DropZone onFilesAdded={onAddKnowledge} compact />

      <PastedTextForm onAdd={(item) => onAddKnowledge([item])} />

      <KnowledgeList items={knowledge} />
    </div>
  );
};
