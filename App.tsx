
'use client';

import React, { useState } from 'react';
import { KnowledgeItem, AgentConfig, CompanyInfo } from './types';
import type { Agent } from './src/domain/entities/Agent';
import { DEFAULT_ASSISTANT_NAME } from './src/lib/assistantName';
import { companyInfoFromAgent } from './src/lib/agentCompany';
import { PRODUCT_TERRACOTTA } from './src/lib/productTheme';
import LivePreview from './src/components/LivePreview';
import Onboarding from './src/components/Onboarding';
import { EditAgent } from './src/components/views/admin/EditAgent';

  // Default Configuration
const DEFAULT_CONFIG: AgentConfig = {
  name: DEFAULT_ASSISTANT_NAME,
  description: 'A helpful assistant for our customers.',
  primaryColor: PRODUCT_TERRACOTTA,
  greeting: 'Hi there! How can I help you today?',
  tone: 'friendly',
  quickQuestions: [],
};

function configFromAgent(agent: Agent): AgentConfig {
  const questions = Array.isArray(agent.config.quickQuestions)
    ? agent.config.quickQuestions.map((item) =>
        typeof item === 'string' ? { text: item, emoji: '' } : item
      )
    : [];
  return {
    name: agent.config.name,
    description: agent.config.description,
    primaryColor: agent.config.primaryColor || PRODUCT_TERRACOTTA,
    greeting: agent.config.greeting,
    tone: agent.config.tone,
    quickQuestions: questions,
    company: agent.config.company,
  };
}

const App: React.FC<{ initialAgent?: Agent | null }> = ({ initialAgent = null }) => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(initialAgent?.knowledge ?? []);
  const [config, setConfig] = useState<AgentConfig>(
    initialAgent ? configFromAgent(initialAgent) : DEFAULT_CONFIG
  );
  
  // Company Info State
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(
    initialAgent ? companyInfoFromAgent(initialAgent) : {
      name: '',
      website: '',
      industry: '',
      email: ''
    }
  );

  // --- Knowledge Handlers ---

  const handleAddKnowledgeItems = (items: KnowledgeItem[]) => {
    setKnowledge(prev => [...prev, ...items]);
  };

  const handleUpdateKnowledgeItem = (id: string, updates: Partial<KnowledgeItem>) => {
    setKnowledge(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleConfigChange = (key: keyof AgentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-full bg-paper font-sans overflow-hidden">
       <main className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            {initialAgent ? (
            <EditAgent
              existingAgentId={initialAgent.id}
              config={config}
              onConfigChange={handleConfigChange}
              knowledge={knowledge}
              onAddKnowledge={handleAddKnowledgeItems}
              onUpdateKnowledge={handleUpdateKnowledgeItem}
              companyInfo={companyInfo}
              onCompanyInfoChange={setCompanyInfo}
            />
            ) : (
            <Onboarding 
              config={config}
              onConfigChange={handleConfigChange}
              knowledge={knowledge}
              onAddKnowledge={handleAddKnowledgeItems}
              onUpdateKnowledge={handleUpdateKnowledgeItem}
              companyInfo={companyInfo}
              onCompanyInfoChange={setCompanyInfo}
            />
            )}
          </div>
          <div className="hidden xl:flex w-[400px] border-l border-slate-200 bg-slate-50">
             <LivePreview config={config} knowledge={knowledge} />
          </div>
       </main>
    </div>
  );
};

export default App;
