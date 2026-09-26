'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentConfig, CompanyInfo, KnowledgeItem } from '../../../../types';
import { configWithCompany } from '../../../lib/agentCompany';
import { adminSharePath } from '../../../lib/routes';
import { saveAgent } from '../../../lib/saveAgent';
import { Button } from '../../core/button/Button';
import { Heading } from '../../core/typography/Heading';
import { CompanyStep } from '../../onboarding/CompanyStep';
import { CustomizeStep } from '../../onboarding/CustomizeStep';
import { KnowledgeStep } from '../../onboarding/KnowledgeStep';
import { useWebsiteCrawl } from '../../onboarding/useWebsiteCrawl';
import { QuickQuestionsEditor } from '../../QuickQuestionsEditor';

interface EditAgentProps {
  existingAgentId: string;
  config: AgentConfig;
  onConfigChange: (key: keyof AgentConfig, value: AgentConfig[keyof AgentConfig]) => void;
  knowledge: KnowledgeItem[];
  onAddKnowledge: (items: KnowledgeItem[]) => void;
  onUpdateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  onRemoveKnowledge: (id: string) => void;
  companyInfo: CompanyInfo;
  onCompanyInfoChange: (info: CompanyInfo) => void;
}

export function EditAgent({
  existingAgentId,
  config,
  onConfigChange,
  knowledge,
  onAddKnowledge,
  onUpdateKnowledge,
  onRemoveKnowledge,
  companyInfo,
  onCompanyInfoChange,
}: EditAgentProps) {
  const router = useRouter();
  const { isCrawling, crawlProgress, performCrawl } = useWebsiteCrawl(onAddKnowledge, onUpdateKnowledge);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const { agentId } = await saveAgent(
        configWithCompany(config, companyInfo),
        knowledge,
        existingAgentId
      );
      router.push(adminSharePath(agentId));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save agent');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="px-8 py-6 border-b border-rule">
        <Heading level={1}>Edit agent</Heading>
        <p className="text-stone text-sm mt-2">Change any section, then save. You do not have to walk the setup steps again.</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-10 px-6 space-y-16">
          <section>
            <CompanyStep
              companyInfo={companyInfo}
              onCompanyInfoChange={onCompanyInfoChange}
              config={config}
              onConfigChange={onConfigChange}
            />
          </section>

          <section>
            <KnowledgeStep
              knowledge={knowledge}
              onAddKnowledge={onAddKnowledge}
              onUpdateKnowledge={onUpdateKnowledge}
              onRemoveKnowledge={onRemoveKnowledge}
              companyInfo={companyInfo}
              isCrawling={isCrawling}
              crawlProgress={crawlProgress}
              onPerformCrawl={performCrawl}
            />
          </section>

          <section>
            <CustomizeStep config={config} onConfigChange={onConfigChange} />
          </section>

          <section className="space-y-8">
            <div className="text-center mb-8">
              <Heading level={2}>Quick questions</Heading>
              <p className="text-stone text-sm mt-2">Help visitors start the conversation with one click.</p>
            </div>
            <QuickQuestionsEditor
              questions={config.quickQuestions}
              onChange={(questions) => onConfigChange('quickQuestions', questions)}
            />
          </section>
        </div>
      </div>

      <div className="p-6 border-t border-rule flex items-center justify-between gap-4 bg-cream">
        {saveError ? <p className="text-sm text-red-600">{saveError}</p> : <span />}
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || isCrawling}
          isLoading={isSaving}
          className="px-8 py-3 rounded-[10px]"
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
